import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { courseId } = await req.json();
    
    if (!courseId) {
      return new Response(JSON.stringify({ error: "Course ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the current course details
    const { data: currentCourse } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (!currentCourse) {
      return new Response(JSON.stringify({ error: "Course not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all other courses
    const { data: allCourses } = await supabase
      .from("courses")
      .select("id, title, description, level, category, duration_hours")
      .neq("id", courseId);

    const systemPrompt = `You are an AI course recommendation expert. Analyze the current course and suggest 3 similar courses that would complement or naturally follow it.

Consider:
1. Similar subject matter and category
2. Natural progression (if beginner course, suggest beginner or intermediate next)
3. Complementary skills that work well together
4. Duration and commitment level

CRITICAL: Return ONLY a valid JSON array. Do not wrap it in markdown code blocks.

Response format:
[
  {
    "title": "Exact Course Title from available courses",
    "reason": "Brief reason why this course is similar/complementary (max 100 chars)"
  }
]`;

    const userPrompt = `Current Course:
- Title: ${currentCourse.title}
- Description: ${currentCourse.description}
- Level: ${currentCourse.level}
- Category: ${currentCourse.category}
- Duration: ${currentCourse.duration_hours}h

Available Courses: ${JSON.stringify(allCourses)}

Suggest exactly 3 similar or complementary courses.`;

    console.log("Calling Lovable AI for similar courses...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service unavailable. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices[0].message.content;
    
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const recommendations = JSON.parse(content);

    // Match with actual course IDs
    const enrichedRecommendations = recommendations.map((rec: any) => {
      const course = allCourses?.find(
        (c) => c.title.toLowerCase() === rec.title.toLowerCase()
      );
      return {
        ...rec,
        courseId: course?.id,
        level: course?.level,
        duration: course?.duration_hours,
      };
    });

    return new Response(
      JSON.stringify({ recommendations: enrichedRecommendations }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in suggest-similar-courses function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

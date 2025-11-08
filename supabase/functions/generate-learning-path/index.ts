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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { careerGoal, currentLevel, timeCommitment } = await req.json();

    // Fetch user's profile and enrolled courses
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("learning_preferences")
      .eq("id", user.id)
      .single();

    const { data: enrollments } = await supabase
      .from("course_enrollments")
      .select("course_id, courses(title, level, category)")
      .eq("user_id", user.id);

    const { data: allCourses } = await supabase
      .from("courses")
      .select("id, title, description, level, category, duration_hours");

    const enrolledIds = enrollments?.map((e) => e.course_id) || [];
    const availableCourses = allCourses?.filter((c) => !enrolledIds.includes(c.id));

    const systemPrompt = `You are an AI learning path architect. Create a personalized, sequential learning curriculum based on the user's career goals.

Design a learning path that:
1. Starts with foundational courses appropriate for their current level
2. Progressively builds skills toward their career goal
3. Respects their time commitment per week
4. Includes 4-6 courses in logical order
5. Balances theory and practical skills

CRITICAL: Return ONLY a valid JSON object. Do not wrap it in markdown code blocks.

Response format:
{
  "pathTitle": "Descriptive title for this learning path",
  "pathDescription": "Brief description of what this path achieves",
  "estimatedWeeks": number,
  "courses": [
    {
      "title": "Exact Course Title from available courses",
      "reason": "Why this course is at this position in the path (max 120 chars)",
      "weekNumber": number
    }
  ]
}`;

    const userPrompt = `Career Goal: ${careerGoal}
Current Level: ${currentLevel}
Time Commitment: ${timeCommitment} hours per week

User's Learning Preferences: ${JSON.stringify(userProfile?.learning_preferences)}
Already Completed Courses: ${JSON.stringify(enrollments?.map((e: any) => e.courses?.title))}

Available Courses: ${JSON.stringify(availableCourses)}

Create an optimal learning path with 4-6 courses that will help achieve this career goal.`;

    console.log("Generating learning path...");

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
    const learningPath = JSON.parse(content);

    // Enrich with course IDs
    learningPath.courses = learningPath.courses.map((course: any) => {
      const matchedCourse = availableCourses?.find(
        (c) => c.title.toLowerCase() === course.title.toLowerCase()
      );
      return {
        ...course,
        courseId: matchedCourse?.id,
        level: matchedCourse?.level,
        duration: matchedCourse?.duration_hours,
      };
    });

    return new Response(
      JSON.stringify({ learningPath }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-learning-path:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

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

    const { targetRole } = await req.json();

    // Fetch comprehensive user data
    const { data: enrollments } = await supabase
      .from("course_enrollments")
      .select(`
        progress_percentage,
        completed_at,
        courses (title, level, category)
      `)
      .eq("user_id", user.id);

    const { data: moduleProgress } = await supabase
      .from("module_progress")
      .select("completed, quiz_score")
      .eq("user_id", user.id);

    const { data: allCourses } = await supabase
      .from("courses")
      .select("id, title, description, level, category");

    // Calculate current skills
    const completedCourses = enrollments?.filter((e) => e.completed_at) || [];
    const inProgressCourses = enrollments?.filter((e) => !e.completed_at) || [];
    const avgQuizScore = moduleProgress?.length
      ? moduleProgress.reduce((sum, m) => sum + (m.quiz_score || 0), 0) / moduleProgress.length
      : null;

    const systemPrompt = `You are an AI career advisor and skill gap analyst. Analyze a user's current skills and compare them to requirements for a target role.

Provide:
1. Current skills based on completed courses
2. Skills gaps (what's missing for the target role)
3. Recommended courses to fill those gaps
4. Estimated time to achieve role readiness

CRITICAL: Return ONLY a valid JSON object. Do not wrap it in markdown code blocks.

Response format:
{
  "currentSkills": [
    { "skill": "Skill name", "level": "beginner|intermediate|advanced", "source": "Where acquired" }
  ],
  "skillGaps": [
    { "skill": "Missing skill", "priority": "high|medium|low", "reason": "Why it's important" }
  ],
  "recommendedCourses": [
    { "title": "Exact Course Title", "reason": "How it fills the gap", "priority": "high|medium|low" }
  ],
  "estimatedTimeToReady": "X weeks/months",
  "overallReadiness": "percentage as number 0-100"
}`;

    const userPrompt = `Target Role: ${targetRole}

User's Progress:
- Completed Courses: ${JSON.stringify(completedCourses.map((e: any) => e.courses))}
- In Progress: ${JSON.stringify(inProgressCourses.map((e: any) => e.courses))}
- Average Quiz Score: ${avgQuizScore || "N/A"}

Available Courses: ${JSON.stringify(allCourses)}

Analyze the skill gaps and recommend courses to bridge them.`;

    console.log("Analyzing skill gaps...");

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
    const analysis = JSON.parse(content);

    // Enrich recommended courses with IDs
    analysis.recommendedCourses = analysis.recommendedCourses.map((rec: any) => {
      const course = allCourses?.find(
        (c) => c.title.toLowerCase() === rec.title.toLowerCase()
      );
      return {
        ...rec,
        courseId: course?.id,
        level: course?.level,
        category: course?.category,
      };
    });

    return new Response(
      JSON.stringify({ analysis }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-skill-gaps:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

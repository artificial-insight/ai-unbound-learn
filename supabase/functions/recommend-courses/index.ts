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

    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Generating recommendations for user:", user.id);

    // Fetch user's profile with learning preferences
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("learning_preferences")
      .eq("id", user.id)
      .single();

    // Fetch user's enrolled courses with completion data
    const { data: enrollments } = await supabase
      .from("course_enrollments")
      .select(`
        course_id,
        progress_percentage,
        last_accessed_at,
        courses (
          title,
          level,
          category
        )
      `)
      .eq("user_id", user.id)
      .order("last_accessed_at", { ascending: false });

    // Fetch user's quiz attempts and scores for performance context
    const { data: quizAttempts } = await supabase
      .from("quiz_attempts")
      .select("quiz_id, score, passed, quizzes(title, course_id)")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(10);

    // Fetch all available courses with more details
    const { data: allCourses } = await supabase
      .from("courses")
      .select("id, title, description, level, category, duration_hours, instructor_id");

    // Get courses user is NOT enrolled in
    const enrolledIds = enrollments?.map((e) => e.course_id) || [];
    const availableCourses = allCourses?.filter(
      (course) => !enrolledIds.includes(course.id)
    );

    // Calculate user's performance metrics for better recommendations
    const avgQuizScore = quizAttempts?.length
      ? quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length
      : null;
    
    const strengths = quizAttempts
      ?.filter((a) => a.score >= 80)
      .map((a: any) => a.quizzes?.title)
      .slice(0, 3) || [];

    // Prepare enhanced RAG context for AI
    const userContext = {
      learningPreferences: userProfile?.learning_preferences?.topics || [],
      enrolledCourses: enrollments?.map((e: any) => ({
        title: e.courses?.title,
        level: e.courses?.level,
        category: e.courses?.category,
        progress: e.progress_percentage,
      })),
      performanceMetrics: {
        averageQuizScore: avgQuizScore,
        strengths,
        totalCoursesEnrolled: enrollments?.length || 0,
      },
      availableCourses: availableCourses?.map((c) => ({
        title: c.title,
        description: c.description,
        level: c.level,
        category: c.category,
        duration: c.duration_hours,
      })),
    };

    const systemPrompt = `You are an AI learning advisor for AI UnboundEd School. Analyze the user's learning progress, performance metrics, and preferences to recommend 3 courses that would best benefit them next.

Consider:
1. User's performance metrics and quiz scores to gauge their actual skill level
2. Areas where they've shown strength vs areas needing improvement
3. Logical learning progression based on current enrollments
4. Complementary skills that enhance what they're already learning
5. User's stated learning preferences and topics of interest
6. Course difficulty that matches their demonstrated capabilities

CRITICAL: Return ONLY a valid JSON array. Do not wrap it in markdown code blocks or any other text.

Response format:
[
  {
    "title": "Exact Course Title from available courses",
    "reason": "Brief reason why this course is recommended (max 100 chars)"
  }
]`;

    const userPrompt = `User Profile:
- Learning Preferences: ${JSON.stringify(userContext.learningPreferences)}
- Performance Metrics: ${JSON.stringify(userContext.performanceMetrics)}

Currently Enrolled Courses: ${JSON.stringify(userContext.enrolledCourses)}

Available Courses to Recommend: ${JSON.stringify(userContext.availableCourses)}

Based on this comprehensive context, provide exactly 3 personalized course recommendations that align with the user's performance, interests, and learning trajectory.`;

    console.log("Calling Lovable AI for recommendations...");

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
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI service unavailable. Please contact support.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices[0].message.content;
    
    // Strip markdown code blocks if present (```json ... ```)
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    // Parse the cleaned JSON
    const recommendations = JSON.parse(content);

    console.log("AI recommendations generated successfully");

    // Match recommendations with actual course IDs
    const enrichedRecommendations = recommendations.map((rec: any) => {
      const course = availableCourses?.find(
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
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in recommend-courses function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

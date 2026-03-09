import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type TDIInterruptType =
  | "clarify_definitions"
  | "quick_check"
  | "counterexample"
  | "socratic_probe";

export type TDIMode = "chat" | "assessment";

export interface TDIIntervention {
  /** Stable identifier to keep behavior deterministic (use `rule_key` for DB-backed rules). */
  id: string;
  misconception: string;
  teachingIntent: string;
  interrupt: {
    type: TDIInterruptType;
    prompt: string;
    choices?: string[];
  };
  meta?: {
    source?: "builtin" | "db";
    ruleId?: string;
    ruleKey?: string;
  };
}

export interface TDIDiagnosisInput {
  mode: TDIMode;
  courseTitle?: string;
  topicTitle?: string;
  question?: string;
  learnerText: string;
  correctAnswer?: string;
  metadata?: Record<string, unknown>;
}

type TDIRuleRow = Tables<"tdi_rules">;

export type TDIRuleConditions = {
  mode?: TDIMode;
  learnerIncludesAny?: string[];
  learnerRegex?: string;
  questionIncludesAny?: string[];
  questionRegex?: string;
  minLearnerLength?: number;
  maxLearnerLength?: number;
};

export type TDILoadedRule = {
  id: string;
  ruleKey: string;
  name: string;
  priority: number;
  active: boolean;
  courseId: string | null;
  moduleId: string | null;
  conditions: TDIRuleConditions;
  intervention: Omit<TDIIntervention, "meta">;
};

const normalize = (s: string) => s.trim().toLowerCase();

const includesAny = (text: string, needles: string[]) => needles.some((n) => text.includes(n));

const compact = (s: string, max = 160) => (s.length > max ? `${s.slice(0, max - 1)}…` : s);

const safeRegex = (pattern: string) => {
  try {
    return new RegExp(pattern, "i");
  } catch {
    return null;
  }
};

const matchRule = (rule: TDILoadedRule, input: TDIDiagnosisInput) => {
  const c = rule.conditions ?? {};
  if (c.mode && c.mode !== input.mode) return false;

  const learner = normalize(input.learnerText);
  const q = normalize(input.question ?? "");

  if (typeof c.minLearnerLength === "number" && learner.length < c.minLearnerLength) return false;
  if (typeof c.maxLearnerLength === "number" && learner.length > c.maxLearnerLength) return false;

  if (c.learnerIncludesAny?.length && !includesAny(learner, c.learnerIncludesAny.map(normalize))) return false;
  if (c.questionIncludesAny?.length && !includesAny(q, c.questionIncludesAny.map(normalize))) return false;

  if (c.learnerRegex) {
    const r = safeRegex(c.learnerRegex);
    if (!r || !r.test(learner)) return false;
  }

  if (c.questionRegex) {
    const r = safeRegex(c.questionRegex);
    if (!r || !r.test(q)) return false;
  }

  return true;
};

export async function loadTDIRules(params?: {
  courseId?: string;
  moduleId?: string;
  mode?: TDIMode;
  includeInactive?: boolean;
}): Promise<TDILoadedRule[]> {
  const { courseId, moduleId, mode, includeInactive } = params ?? {};

  let query = supabase
    .from("tdi_rules")
    .select("id, rule_key, name, priority, active, course_id, module_id, conditions, intervention")
    .order("priority", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(500);

  if (!includeInactive) query = query.eq("active", true);
  if (courseId) query = query.or(`course_id.is.null,course_id.eq.${courseId}`);
  if (moduleId) query = query.or(`module_id.is.null,module_id.eq.${moduleId}`);

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []) as Pick<
    TDIRuleRow,
    "id" | "rule_key" | "name" | "priority" | "active" | "course_id" | "module_id" | "conditions" | "intervention"
  >[];

  const rules: TDILoadedRule[] = rows
    .map((r) => {
      const conditions = (r.conditions ?? {}) as unknown as TDIRuleConditions;
      const intervention = (r.intervention ?? null) as any;
      if (!intervention || typeof intervention !== "object") return null;

      const typedIntervention: Omit<TDIIntervention, "meta"> = {
        id: r.rule_key,
        misconception: String(intervention.misconception ?? ""),
        teachingIntent: String(intervention.teachingIntent ?? ""),
        interrupt: {
          type: intervention.interrupt?.type ?? "socratic_probe",
          prompt: String(intervention.interrupt?.prompt ?? ""),
          choices: Array.isArray(intervention.interrupt?.choices) ? intervention.interrupt.choices : undefined,
        },
      };

      if (!typedIntervention.misconception || !typedIntervention.teachingIntent || !typedIntervention.interrupt.prompt) return null;
      if (!typedIntervention.id) return null;

      return {
        id: r.id,
        ruleKey: r.rule_key,
        name: r.name,
        priority: r.priority,
        active: r.active,
        courseId: r.course_id,
        moduleId: r.module_id,
        conditions: {
          ...conditions,
          ...(mode ? { mode } : {}),
        },
        intervention: typedIntervention,
      } satisfies TDILoadedRule;
    })
    .filter(Boolean) as TDILoadedRule[];

  return rules;
}

/**
 * Deterministic misconception diagnosis: first matching rule wins.
 *
 * - If `rules` are provided, DB-backed rules are evaluated first (sorted by priority ASC).
 * - If none match, we fall back to built-in heuristic rules (also deterministic).
 */
export function diagnoseTDI(input: TDIDiagnosisInput, rules?: TDILoadedRule[] | null): TDIIntervention | null {
  if (rules?.length) {
    const sorted = [...rules].sort((a, b) => a.priority - b.priority);
    for (const r of sorted) {
      if (!r.active) continue;
      if (matchRule(r, input)) {
        return {
          ...r.intervention,
          meta: { source: "db", ruleId: r.id, ruleKey: r.ruleKey },
        };
      }
    }
  }

  const learner = normalize(input.learnerText);
  const q = normalize(input.question ?? "");
  const correct = normalize(input.correctAnswer ?? "");
  const mode = input.mode;

  // -----------------------------
  // Assessment-specific rules
  // -----------------------------
  if (mode === "assessment") {
    const type = String(input.metadata?.type ?? "");

    // Coding: percentage confusion (fraction vs percent)
    if (
      type === "coding" &&
      includesAny(learner, ["/", "divide", "completed", "total"]) &&
      !includesAny(learner, ["* 100", "*100", "100 *", "percent", "%"])
    ) {
      return {
        id: "assessment_percentage_vs_fraction",
        misconception: "Treating a fraction (completed/total) as a percentage without multiplying by 100.",
        teachingIntent: "Help you distinguish ratios from percentages so you can express progress correctly.",
        interrupt: {
          type: "quick_check",
          prompt: "Quick check: if completed=1 and total=4, which is the correct completion percentage?",
          choices: ["0.25", "25%", "4%", "1/4%"],
        },
        meta: { source: "builtin", ruleKey: "assessment_percentage_vs_fraction" },
      };
    }

    // Coding: missing division-by-zero guard
    if (
      type === "coding" &&
      includesAny(learner, ["/", "divide"]) &&
      !includesAny(learner, [
        "total === 0",
        "total==0",
        "if (total",
        "if(total",
        "throw",
        "return 0",
        "return 0;",
        "null",
      ]) &&
      includesAny(q, ["total", "0"])
    ) {
      return {
        id: "assessment_division_by_zero",
        misconception: "Forgetting edge cases (like total=0), which can silently break percentage calculations.",
        teachingIntent: "Build the habit of defining behavior for edge cases before coding the main logic.",
        interrupt: {
          type: "socratic_probe",
          prompt: "Before continuing: what SHOULD the function return when total=0 (and why)?",
        },
        meta: { source: "builtin", ruleKey: "assessment_division_by_zero" },
      };
    }

    // MCQ: AI replaces instructors / absolutes
    if (type === "mcq" && includesAny(learner, ["eliminate", "no need", "replace", "only"])) {
      return {
        id: "assessment_absolutist_claim",
        misconception:
          "Interpreting adaptive learning as an absolute replacement/constraint (e.g., ‘only’ works in one medium or ‘eliminates’ instructors).",
        teachingIntent: "Correct all-or-nothing thinking and reframe adaptive learning as personalization, not replacement.",
        interrupt: {
          type: "counterexample",
          prompt: "Interrupt: name ONE scenario where a human instructor is still valuable even with adaptive learning.",
        },
        meta: { source: "builtin", ruleKey: "assessment_absolutist_claim" },
      };
    }

    // Explanation: very short answer (shallow model)
    if (type === "explanation" && learner.length < 40) {
      return {
        id: "assessment_shallow_explanation",
        misconception: "Answering with surface-level keywords instead of describing the mechanism (signals → decision → adaptation).",
        teachingIntent: "Prompt you to explain the causal chain, not just list terms.",
        interrupt: {
          type: "clarify_definitions",
          prompt: "Interrupt: in 2–3 sentences, describe the chain ‘signal → diagnosis → teaching move’.",
        },
        meta: { source: "builtin", ruleKey: "assessment_shallow_explanation" },
      };
    }

    // Generic: if learner answer matches correct but formatting differs (common in MCQ typed)
    if (correct && learner && correct !== learner && correct.includes(learner)) {
      return {
        id: "assessment_precision_mismatch",
        misconception: "Having the right idea but not stating it precisely enough to be verifiable.",
        teachingIntent: "Help you practice precise phrasing so your understanding is testable.",
        interrupt: {
          type: "socratic_probe",
          prompt: "Interrupt: restate your answer as a single, unambiguous sentence.",
        },
        meta: { source: "builtin", ruleKey: "assessment_precision_mismatch" },
      };
    }

    return null;
  }

  // -----------------------------
  // Chat / tutoring rules
  // -----------------------------

  // Conflating two concepts: “X is the same as Y?” / “X vs Y?”
  if (
    includesAny(learner, ["same as", "the same as", "equals", "equal to"]) ||
    (learner.includes(" vs ") && learner.split(" vs ").length === 2)
  ) {
    return {
      id: "chat_concept_conflation",
      misconception: "Conflating two related ideas instead of separating definitions and roles.",
      teachingIntent: "Separate the concepts cleanly so you can choose the right one in the right situation.",
      interrupt: {
        type: "clarify_definitions",
        prompt: "Interrupt: define each concept in 1 sentence, then give 1 example where they differ.",
      },
      meta: { source: "builtin", ruleKey: "chat_concept_conflation" },
    };
  }

  // Absolutist language: always/never
  if (includesAny(learner, ["always ", " never ", "every time", "must ", "impossible"])) {
    return {
      id: "chat_overgeneralization",
      misconception: "Overgeneralizing a rule (treating it as always/never) rather than context-dependent.",
      teachingIntent: "Build nuance by identifying the conditions under which a rule holds.",
      interrupt: {
        type: "counterexample",
        prompt: "Interrupt: give ONE counterexample (a case where your statement would not hold).",
      },
      meta: { source: "builtin", ruleKey: "chat_overgeneralization" },
    };
  }

  // Copy-paste / memorization mindset
  if (includesAny(learner, ["copy", "copy-paste", "copypaste", "memorize", "rote"])) {
    return {
      id: "chat_copy_vs_understand",
      misconception: "Confusing ‘having code/words’ with ‘understanding the mechanism’.",
      teachingIntent: "Shift you to active recall: predict, explain, then verify.",
      interrupt: {
        type: "quick_check",
        prompt: "Interrupt: before we proceed, predict what should happen (output/behavior) in a simple example.",
      },
      meta: { source: "builtin", ruleKey: "chat_copy_vs_understand" },
    };
  }

  return null;
}

export function formatTDITranscript(intervention: TDIIntervention, learnerResponse?: string) {
  const base =
    `TDI — Teaching intent: ${intervention.teachingIntent}\n\n` +
    `Diagnosed misconception: ${intervention.misconception}\n\n` +
    `Interrupt: ${compact(intervention.interrupt.prompt)}`;

  return learnerResponse ? `${base}\n\nYour response: ${compact(learnerResponse, 220)}` : base;
}

export type TDIEventAction = "triggered" | "acknowledged" | "skipped";

export async function logTDIEvent(args: {
  action: TDIEventAction;
  intervention: TDIIntervention;
  courseId?: string | null;
  moduleId?: string | null;
  learnerInput?: string | null;
  learnerResponse?: string | null;
  sessionId?: string | null;
  context?: string | null;
}) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  const user = authData.user;
  if (!user) throw new Error("Not authenticated");

  const ruleKey = args.intervention.meta?.ruleKey ?? args.intervention.id;
  const ruleId = args.intervention.meta?.ruleId ?? null;

  const { error } = await supabase.from("tdi_events").insert({
    user_id: user.id,
    course_id: args.courseId ?? null,
    module_id: args.moduleId ?? null,
    rule_id: ruleId,
    rule_key: ruleKey,
    intervention_data: args.intervention as any,
    learner_input: args.learnerInput ?? null,
    learner_response: args.learnerResponse ?? null,
    session_id: args.sessionId ?? null,
    context: args.context ?? null,
    action: args.action,
  });

  if (error) throw error;
}

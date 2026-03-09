export type TDIInterruptType =
  | "clarify_definitions"
  | "quick_check"
  | "counterexample"
  | "socratic_probe";

export type TDIMode = "chat" | "assessment";

export interface TDIIntervention {
  /** Stable identifier to keep behavior deterministic. */
  id: string;
  misconception: string;
  teachingIntent: string;
  interrupt: {
    type: TDIInterruptType;
    prompt: string;
    choices?: string[];
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

const normalize = (s: string) => s.trim().toLowerCase();

const includesAny = (text: string, needles: string[]) => needles.some((n) => text.includes(n));

const compact = (s: string, max = 160) => (s.length > max ? `${s.slice(0, max - 1)}…` : s);

/**
 * Deterministic misconception diagnosis: first matching rule wins.
 *
 * NOTE: This is intentionally heuristic (pattern-based) to remain deterministic and auditable.
 */
export function diagnoseTDI(input: TDIDiagnosisInput): TDIIntervention | null {
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
      };
    }

    // Coding: missing division-by-zero guard
    if (
      type === "coding" &&
      includesAny(learner, ["/", "divide"]) &&
      !includesAny(learner, ["total === 0", "total==0", "if (total", "if(total", "throw", "return 0", "return 0;", "null"]) &&
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
      };
    }

    // MCQ: AI replaces instructors / absolutes
    if (type === "mcq" && includesAny(learner, ["eliminate", "no need", "replace", "only"])) {
      return {
        id: "assessment_absolutist_claim",
        misconception: "Interpreting adaptive learning as an absolute replacement/constraint (" +
          "e.g., ‘only’ works in one medium or ‘eliminates’ instructors).",
        teachingIntent: "Correct all-or-nothing thinking and reframe adaptive learning as personalization, not replacement.",
        interrupt: {
          type: "counterexample",
          prompt: "Interrupt: name ONE scenario where a human instructor is still valuable even with adaptive learning.",
        },
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
    };
  }

  // Default: no intervention
  return null;
}

export function formatTDITranscript(intervention: TDIIntervention, learnerResponse?: string) {
  const base =
    `TDI — Teaching intent: ${intervention.teachingIntent}\n\n` +
    `Diagnosed misconception: ${intervention.misconception}\n\n` +
    `Interrupt: ${compact(intervention.interrupt.prompt)}`;

  return learnerResponse ? `${base}\n\nYour response: ${compact(learnerResponse, 220)}` : base;
}

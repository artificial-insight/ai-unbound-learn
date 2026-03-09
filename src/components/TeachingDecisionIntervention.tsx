import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BrainCircuit, Target, ShieldAlert } from "lucide-react";
import type { TDIIntervention } from "@/lib/tdi";

interface TeachingDecisionInterventionProps {
  open: boolean;
  intervention: TDIIntervention | null;
  onAcknowledge: (learnerResponse?: string) => void;
  onSkip?: () => void;
}

export const TeachingDecisionIntervention = ({
  open,
  intervention,
  onAcknowledge,
  onSkip,
}: TeachingDecisionInterventionProps) => {
  const hasChoices = !!intervention?.interrupt.choices?.length;

  const [choice, setChoice] = useState<string>("");
  const [freeText, setFreeText] = useState<string>("");

  // Reset input when a new intervention appears
  useMemo(() => {
    setChoice("");
    setFreeText("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervention?.id]);

  const learnerResponse = hasChoices ? choice : freeText.trim();
  const canContinue = hasChoices ? !!choice : true;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 border border-primary/20">
              <BrainCircuit className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <AlertDialogTitle className="flex items-center gap-2">
                Teaching Decision Intervention (TDI)
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                I’m intentionally interrupting for a moment because I detected a likely misconception.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {!intervention ? null : (
          <div className="space-y-4">
            <div className="grid gap-3">
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted border border-border">
                    <ShieldAlert className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Diagnosed misconception</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {intervention.misconception}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted border border-border">
                    <Target className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Teaching intent (explicit)</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {intervention.teachingIntent}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-semibold">Interrupt action</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {intervention.interrupt.prompt}
              </p>

              {hasChoices ? (
                <RadioGroup value={choice} onValueChange={setChoice} className="space-y-2">
                  {intervention.interrupt.choices!.map((c) => (
                    <div key={c} className="flex items-center space-x-2">
                      <RadioGroupItem value={c} id={`tdi-choice-${c}`} />
                      <Label htmlFor={`tdi-choice-${c}`} className="font-normal">
                        {c}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  <Label className="text-sm">Your response (optional)</Label>
                  <Textarea
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                    placeholder="Write a quick one-liner…"
                    className="min-h-[80px]"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              onSkip?.();
            }}
          >
            Skip
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onAcknowledge(learnerResponse || undefined);
            }}
            disabled={!canContinue}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

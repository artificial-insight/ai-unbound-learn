import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";

type TDIEventRow = {
  id: string;
  created_at: string;
  action: string;
  rule_key: string;
  learner_input: string | null;
  learner_response: string | null;
  intervention_data: any;
};

function EventCard({ e }: { e: TDIEventRow }) {
  const intent = e?.intervention_data?.teachingIntent;
  const misconception = e?.intervention_data?.misconception;

  return (
    <Card className="p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{e.rule_key}</p>
          <p className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</p>
        </div>
        <p className="text-xs text-muted-foreground">{e.action}</p>
      </div>

      {(misconception || intent) && (
        <div className="mt-3 grid gap-2">
          {misconception && (
            <div>
              <p className="text-xs font-medium">Misconception</p>
              <p className="text-sm text-muted-foreground">{misconception}</p>
            </div>
          )}
          {intent && (
            <div>
              <p className="text-xs font-medium">Teaching intent</p>
              <p className="text-sm text-muted-foreground">{intent}</p>
            </div>
          )}
        </div>
      )}

      {(e.learner_input || e.learner_response) && (
        <div className="mt-3 grid gap-2">
          {e.learner_input && (
            <div>
              <p className="text-xs font-medium">Your input</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{e.learner_input}</p>
            </div>
          )}
          {e.learner_response && (
            <div>
              <p className="text-xs font-medium">Your response</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{e.learner_response}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export function TDIHistoryPanel({ courseId }: { courseId?: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<TDIEventRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);

    let q = supabase
      .from("tdi_events")
      .select("id, created_at, action, rule_key, learner_input, learner_response, intervention_data")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);

    if (courseId) q = q.eq("course_id", courseId);

    const { data, error } = await q;
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setEvents((data ?? []) as any);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, user?.id]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Recent interventions</p>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : events.length === 0 ? (
        <div className="text-sm text-muted-foreground">No interventions logged yet.</div>
      ) : (
        <div className="grid gap-2">
          {events.map((e) => (
            <EventCard key={e.id} e={e} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TDIHistoryDrawer({ courseId, triggerLabel = "Intervention history" }: { courseId?: string; triggerLabel?: string }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">{triggerLabel}</Button>
      </DrawerTrigger>
      <DrawerContent className="h-[80vh]">
        <DrawerHeader>
          <DrawerTitle>Intervention history</DrawerTitle>
          <DrawerDescription>Review past Teaching Decision Interventions (TDI) and your responses.</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <ScrollArea className="h-[calc(80vh-120px)] pr-3">
            <TDIHistoryPanel courseId={courseId} />
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

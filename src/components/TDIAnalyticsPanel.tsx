import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TDIEventRow = {
  id: string;
  created_at: string;
  action: string;
  rule_key: string;
};

export function TDIAnalyticsPanel() {
  const { toast } = useToast();
  const [events, setEvents] = useState<TDIEventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString();

      const { data, error } = await supabase
        .from("tdi_events")
        .select("id, created_at, action, rule_key")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setEvents((data ?? []) as any);
      }
      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    const t = { triggered: 0, acknowledged: 0, skipped: 0 };
    for (const e of events) {
      if (e.action === "triggered") t.triggered += 1;
      else if (e.action === "acknowledged") t.acknowledged += 1;
      else if (e.action === "skipped") t.skipped += 1;
    }
    return t;
  }, [events]);

  const byRule = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of events) {
      if (e.action !== "triggered") continue;
      m.set(e.rule_key, (m.get(e.rule_key) ?? 0) + 1);
    }
    return Array.from(m.entries())
      .map(([rule_key, count]) => ({ rule_key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [events]);

  const ackRate = totals.triggered ? Math.round((totals.acknowledged / totals.triggered) * 100) : 0;

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Triggers (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{loading ? "…" : totals.triggered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Acknowledged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{loading ? "…" : totals.acknowledged}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Acknowledgement rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{loading ? "…" : `${ackRate}%`}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Most-triggered rules</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px]">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : byRule.length === 0 ? (
            <div className="text-sm text-muted-foreground">No events yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byRule} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="rule_key" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

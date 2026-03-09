import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay, endOfDay } from "date-fns";
import { CalendarIcon, Download } from "lucide-react";
import { cn } from "@/lib/utils";

type TDIEventRow = {
  id: string;
  created_at: string;
  action: string;
  rule_key: string;
  learner_input: string | null;
  learner_response: string | null;
  course_id?: string | null;
  intervention_data: any;
};

type ActionFilter = "all" | "triggered" | "acknowledged" | "skipped";

type CourseOption = { id: string; title: string };

function csvEscape(v: unknown) {
  const s = v == null ? "" : String(v);
  const needsQuotes = /[\n\r,"]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function downloadTextFile(filename: string, content: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function EventCard({ e, courseTitle }: { e: TDIEventRow; courseTitle?: string }) {
  const intent = e?.intervention_data?.teachingIntent;
  const misconception = e?.intervention_data?.misconception;

  return (
    <Card className="p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{e.rule_key}</p>
          <p className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</p>
          {courseTitle ? <p className="text-xs text-muted-foreground">Course: {courseTitle}</p> : null}
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

function DatePicker({ label, value, onChange }: { label: string; value?: Date; onChange: (d?: Date) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
          {value ? format(value, "PPP") : <span className="text-muted-foreground">{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => onChange(d ?? undefined)}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}

function SummaryWidget({ events }: { events: TDIEventRow[] }) {
  const { total, triggered, acknowledged, skipped, acknowledgementRate } = useMemo(() => {
    const total = events.length;
    const triggered = events.filter((e) => e.action === "triggered").length;
    const acknowledged = events.filter((e) => e.action === "acknowledged").length;
    const skipped = events.filter((e) => e.action === "skipped").length;
    const denom = acknowledged + skipped;
    const acknowledgementRate = denom > 0 ? Math.round((acknowledged / denom) * 100) : 0;
    return { total, triggered, acknowledged, skipped, acknowledgementRate };
  }, [events]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
      <Card className="p-3">
        <p className="text-xs text-muted-foreground">Total</p>
        <p className="text-lg font-semibold">{total}</p>
      </Card>
      <Card className="p-3">
        <p className="text-xs text-muted-foreground">Triggered</p>
        <p className="text-lg font-semibold">{triggered}</p>
      </Card>
      <Card className="p-3">
        <p className="text-xs text-muted-foreground">Acknowledged</p>
        <p className="text-lg font-semibold">{acknowledged}</p>
      </Card>
      <Card className="p-3">
        <p className="text-xs text-muted-foreground">Skipped</p>
        <p className="text-lg font-semibold">{skipped}</p>
      </Card>
      <Card className="p-3 col-span-2 md:col-span-1">
        <p className="text-xs text-muted-foreground">Acknowledgement rate</p>
        <p className="text-lg font-semibold">{acknowledgementRate}%</p>
      </Card>
    </div>
  );
}

export function TDIHistoryPanel({ courseId }: { courseId?: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<TDIEventRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [action, setAction] = useState<ActionFilter>("all");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [selectedRuleKey, setSelectedRuleKey] = useState<string>("all");

  const [courses, setCourses] = useState<CourseOption[]>([]);

  const load = async () => {
    if (!user) return;
    setLoading(true);

    let q = supabase
      .from("tdi_events")
      .select("id, created_at, action, rule_key, learner_input, learner_response, course_id, intervention_data")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(500);

    if (courseId) q = q.eq("course_id", courseId);

    const { data, error } = await q;
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setEvents([]);
      setCourses([]);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as any as TDIEventRow[];
    setEvents(rows);

    // Load course titles for any referenced course IDs
    const courseIds = Array.from(new Set(rows.map((r) => r.course_id).filter(Boolean))) as string[];
    if (courseIds.length) {
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title")
        .in("id", courseIds)
        .limit(1000);

      if (!courseError) {
        setCourses(((courseData ?? []) as any[]).map((c) => ({ id: c.id, title: c.title })));
      } else {
        setCourses([]);
      }
    } else {
      setCourses([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, user?.id]);

  const courseTitleById = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of courses) m.set(c.id, c.title);
    return m;
  }, [courses]);

  const ruleKeyOptions = useMemo(() => {
    const keys = Array.from(new Set(events.map((e) => e.rule_key).filter(Boolean))).sort();
    return keys;
  }, [events]);

  const filteredEvents = useMemo(() => {
    const fromMs = fromDate ? startOfDay(fromDate).getTime() : null;
    const toMs = toDate ? endOfDay(toDate).getTime() : null;

    return events.filter((e) => {
      if (action !== "all" && e.action !== action) return false;

      if (selectedCourseId !== "all") {
        if (selectedCourseId === "none") {
          if (e.course_id) return false;
        } else {
          if (e.course_id !== selectedCourseId) return false;
        }
      }

      if (selectedRuleKey !== "all" && e.rule_key !== selectedRuleKey) return false;

      const createdMs = new Date(e.created_at).getTime();
      if (fromMs != null && createdMs < fromMs) return false;
      if (toMs != null && createdMs > toMs) return false;

      return true;
    });
  }, [events, action, selectedCourseId, selectedRuleKey, fromDate, toDate]);

  const exportCSV = () => {
    const header = [
      "created_at",
      "action",
      "course",
      "rule_key",
      "misconception",
      "teaching_intent",
      "learner_input",
      "learner_response",
    ];

    const lines = [header.join(",")];

    for (const e of filteredEvents) {
      lines.push(
        [
          csvEscape(e.created_at),
          csvEscape(e.action),
          csvEscape(e.course_id ? courseTitleById.get(e.course_id) ?? e.course_id : ""),
          csvEscape(e.rule_key),
          csvEscape(e?.intervention_data?.misconception ?? ""),
          csvEscape(e?.intervention_data?.teachingIntent ?? ""),
          csvEscape(e.learner_input ?? ""),
          csvEscape(e.learner_response ?? ""),
        ].join(","),
      );
    }

    downloadTextFile(`tdi-history-${new Date().toISOString().slice(0, 10)}.csv`, lines.join("\n"), "text/csv;charset=utf-8");
  };

  const exportPDF = () => {
    const w = window.open("", "_blank");
    if (!w) {
      toast({
        title: "Popup blocked",
        description: "Please allow popups to export PDF.",
        variant: "destructive",
      });
      return;
    }

    const rows = filteredEvents
      .map((e) => {
        const course = e.course_id ? courseTitleById.get(e.course_id) ?? "" : "";
        const misconception = String(e?.intervention_data?.misconception ?? "");
        const intent = String(e?.intervention_data?.teachingIntent ?? "");
        return `
          <tr>
            <td>${new Date(e.created_at).toLocaleString()}</td>
            <td>${e.action}</td>
            <td>${course}</td>
            <td>${e.rule_key}</td>
            <td>${misconception}</td>
            <td>${intent}</td>
          </tr>
        `;
      })
      .join("");

    w.document.write(`
      <html>
        <head>
          <title>TDI History</title>
          <style>
            body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 24px; }
            h1 { font-size: 18px; margin: 0 0 12px; }
            p { color: #444; margin: 0 0 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ccc; padding: 8px; vertical-align: top; }
            th { background: #f5f5f5; text-align: left; }
          </style>
        </head>
        <body>
          <h1>TDI History</h1>
          <p>Rows: ${filteredEvents.length}</p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Action</th>
                <th>Course</th>
                <th>Rule</th>
                <th>Misconception</th>
                <th>Teaching intent</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <script>
            window.onload = () => window.print();
          </script>
        </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Recent interventions</p>
          <p className="text-xs text-muted-foreground">Showing {filteredEvents.length} of {events.length}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={loading || filteredEvents.length === 0}>
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportPDF} disabled={loading || filteredEvents.length === 0}>
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <SummaryWidget events={filteredEvents} />

      <Card className="p-3">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">From</p>
            <DatePicker label="From date" value={fromDate} onChange={setFromDate} />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">To</p>
            <DatePicker label="To date" value={toDate} onChange={setToDate} />
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Action</p>
            <Select value={action} onValueChange={(v) => setAction(v as ActionFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="triggered">Triggered</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="skipped">Skipped</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Course</p>
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="All courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="none">Unassigned</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 lg:col-span-2">
            <p className="text-xs text-muted-foreground">Intervention type</p>
            <Select value={selectedRuleKey} onValueChange={setSelectedRuleKey}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {ruleKeyOptions.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setFromDate(undefined);
                setToDate(undefined);
                setAction("all");
                setSelectedCourseId("all");
                setSelectedRuleKey("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-sm text-muted-foreground">No interventions match your filters.</div>
      ) : (
        <div className="grid gap-2">
          {filteredEvents.map((e) => (
            <EventCard
              key={e.id}
              e={e}
              courseTitle={e.course_id ? courseTitleById.get(e.course_id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TDIHistoryDrawer({
  courseId,
  triggerLabel = "Intervention history",
}: {
  courseId?: string;
  triggerLabel?: string;
}) {
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

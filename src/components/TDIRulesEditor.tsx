import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type TDIRuleRow = Tables<"tdi_rules">;

type DraftRule = {
  id?: string;
  name: string;
  rule_key: string;
  priority: number;
  active: boolean;
  description: string;
  conditionsJson: string;
  interventionJson: string;
};

const DEFAULT_DRAFT: DraftRule = {
  name: "",
  rule_key: "",
  priority: 100,
  active: true,
  description: "",
  conditionsJson: JSON.stringify({ mode: "chat", learnerIncludesAny: ["same as", "always"] }, null, 2),
  interventionJson: JSON.stringify(
    {
      misconception: "Conflating concepts / overgeneralizing.",
      teachingIntent: "Interrupt to make the misconception explicit and correctable.",
      interrupt: { type: "clarify_definitions", prompt: "Define each concept in one sentence." },
    },
    null,
    2,
  ),
};

export function TDIRulesEditor({ canEdit }: { canEdit: boolean }) {
  const { toast } = useToast();
  const [rules, setRules] = useState<TDIRuleRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<DraftRule>(DEFAULT_DRAFT);

  const sortedRules = useMemo(
    () => [...rules].sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100)),
    [rules],
  );

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tdi_rules")
      .select("*")
      .order("priority", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(500);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRules(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCreate = () => {
    setDraft(DEFAULT_DRAFT);
    setOpen(true);
  };

  const startEdit = (r: TDIRuleRow) => {
    setDraft({
      id: r.id,
      name: r.name,
      rule_key: r.rule_key,
      priority: r.priority,
      active: r.active,
      description: r.description ?? "",
      conditionsJson: JSON.stringify(r.conditions ?? {}, null, 2),
      interventionJson: JSON.stringify(r.intervention ?? {}, null, 2),
    });
    setOpen(true);
  };

  const save = async () => {
    if (!canEdit) return;

    setSaving(true);
    try {
      const conditions = JSON.parse(draft.conditionsJson || "{}") as unknown;
      const intervention = JSON.parse(draft.interventionJson || "{}") as unknown;

      if (!draft.name.trim()) throw new Error("Name is required");
      if (!draft.rule_key.trim()) throw new Error("rule_key is required");

      const payload = {
        name: draft.name.trim(),
        rule_key: draft.rule_key.trim(),
        priority: Number.isFinite(draft.priority) ? draft.priority : 100,
        active: !!draft.active,
        description: draft.description?.trim() || null,
        conditions: conditions as any,
        intervention: intervention as any,
      };

      if (draft.id) {
        const { error } = await supabase.from("tdi_rules").update(payload).eq("id", draft.id);
        if (error) throw error;
      } else {
        // created_by is required; set server-side via auth.uid() in RLS check, so we must send it.
        const { data: auth } = await supabase.auth.getUser();
        const user = auth.user;
        if (!user) throw new Error("Not authenticated");

        const { error } = await supabase.from("tdi_rules").insert({
          ...payload,
          created_by: user.id,
        });
        if (error) throw error;
      }

      toast({ title: "Saved", description: "TDI rule saved." });
      setOpen(false);
      await load();
    } catch (e: any) {
      toast({ title: "Error", description: e.message ?? "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!canEdit) return;
    const { error } = await supabase.from("tdi_rules").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Deleted", description: "Rule deleted." });
    await load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-base">TDI Rules</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            Refresh
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={startCreate} disabled={!canEdit}>
                New rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{draft.id ? "Edit rule" : "New rule"}</DialogTitle>
                <DialogDescription>
                  Rules are deterministic; matching is evaluated by priority (lower wins). Conditions/intervention are JSON.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="grid gap-2">
                    <Label>rule_key</Label>
                    <Input value={draft.rule_key} onChange={(e) => setDraft((d) => ({ ...d, rule_key: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Priority</Label>
                    <Input
                      type="number"
                      value={draft.priority}
                      onChange={(e) => setDraft((d) => ({ ...d, priority: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
                    <Label className="m-0">Active</Label>
                    <Switch checked={draft.active} onCheckedChange={(v) => setDraft((d) => ({ ...d, active: v }))} />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Input
                    value={draft.description}
                    onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>conditions (JSON)</Label>
                    <Textarea
                      className="min-h-[220px] font-mono text-xs"
                      value={draft.conditionsJson}
                      onChange={(e) => setDraft((d) => ({ ...d, conditionsJson: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>intervention (JSON)</Label>
                    <Textarea
                      className="min-h-[220px] font-mono text-xs"
                      value={draft.interventionJson}
                      onChange={(e) => setDraft((d) => ({ ...d, interventionJson: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={save} disabled={!canEdit || saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {!canEdit && (
          <div className="rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            You can view active rules, but only educators can create/edit rules.
          </div>
        )}

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : sortedRules.length === 0 ? (
          <div className="text-sm text-muted-foreground">No rules yet.</div>
        ) : (
          <div className="space-y-2">
            {sortedRules.map((r) => (
              <div key={r.id} className="flex flex-col gap-2 rounded-md border border-border p-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium leading-none">{r.name}</p>
                    <span className="text-xs text-muted-foreground">({r.rule_key})</span>
                    <span className="text-xs text-muted-foreground">priority {r.priority}</span>
                    {!r.active && <span className="text-xs text-muted-foreground">inactive</span>}
                  </div>
                  {r.description && <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => startEdit(r)}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(r.id)}
                    disabled={!canEdit}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { TDIRulesEditor } from "@/components/TDIRulesEditor";
import { TDIAnalyticsPanel } from "@/components/TDIAnalyticsPanel";
import { TDIHistoryPanel } from "@/components/TDIHistoryDrawer";
import { AIChat } from "@/components/AIChat";

export default function TDIPage() {
  const { userRole } = useAuth();
  const canEdit = userRole === "educator";
  const isEducator = userRole === "educator";

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Teaching Decision Interventions (TDI)</h1>
          <p className="text-sm text-muted-foreground">
            Deterministic, auditable interruptions that make misconceptions explicit and correctable.
          </p>
        </div>

        {isEducator ? (
          <Tabs defaultValue="rules" className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:w-[640px]">
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="test">Test Chat</TabsTrigger>
            </TabsList>

            <TabsContent value="rules" className="mt-4">
              <TDIRulesEditor canEdit={canEdit} />
            </TabsContent>
            <TabsContent value="analytics" className="mt-4">
              <TDIAnalyticsPanel />
            </TabsContent>
            <TabsContent value="test" className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Use this chat to deliberately trigger interventions (e.g., try writing “X is the same as Y”). Any TDI events
                should appear in learners’ history.
              </p>
              <AIChat courseTitle="TDI Sandbox" topicTitle="TDI Test Chat" variant="embedded" />
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs defaultValue="test" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:w-[420px]">
              <TabsTrigger value="test">Test Chat</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="test" className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Trigger a TDI by using patterns like “X is the same as Y” or absolutist language (“always/never”).
              </p>
              <AIChat courseTitle="TDI Sandbox" topicTitle="TDI Test Chat" variant="embedded" />
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <TDIHistoryPanel />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}

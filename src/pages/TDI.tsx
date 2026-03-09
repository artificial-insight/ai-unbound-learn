import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { TDIRulesEditor } from "@/components/TDIRulesEditor";
import { TDIAnalyticsPanel } from "@/components/TDIAnalyticsPanel";
import { TDIHistoryPanel } from "@/components/TDIHistoryDrawer";

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
            <TabsList className="grid w-full grid-cols-2 md:w-[420px]">
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="rules" className="mt-4">
              <TDIRulesEditor canEdit={canEdit} />
            </TabsContent>
            <TabsContent value="analytics" className="mt-4">
              <TDIAnalyticsPanel />
            </TabsContent>
          </Tabs>
        ) : (
          <TDIHistoryPanel />
        )}
      </div>
    </AppLayout>
  );
}

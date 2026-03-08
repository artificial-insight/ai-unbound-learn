import { AppLayout } from "@/components/AppLayout";
import { VoiceLearning as VoiceLearningComponent } from "@/components/VoiceLearning";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Headphones, Brain, MessageSquare } from "lucide-react";

const VoiceLearningPage = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Voice Learning</h1>
          <p className="text-muted-foreground mt-1">
            Learn hands-free with AI-powered voice conversations
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VoiceLearningComponent />
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold text-sm">How it works</h3>
                {[
                  { icon: Mic, title: "Speak", desc: "Tap the mic and ask any question" },
                  { icon: Brain, title: "AI Processes", desc: "Your question is analyzed in context" },
                  { icon: MessageSquare, title: "Get Answer", desc: "Receive a detailed explanation" },
                  { icon: Headphones, title: "Listen", desc: "AI reads the response aloud" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{title}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-sm mb-2">Tips</h3>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li>• Speak clearly and at a normal pace</li>
                  <li>• Use Chrome or Edge for best results</li>
                  <li>• Toggle speaker icon to mute responses</li>
                  <li>• Ask follow-up questions naturally</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default VoiceLearningPage;

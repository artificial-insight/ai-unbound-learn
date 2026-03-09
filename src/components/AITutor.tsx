import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TeachingDecisionIntervention } from "@/components/TeachingDecisionIntervention";
import {
  diagnoseTDI,
  formatTDITranscript,
  loadTDIRules,
  logTDIEvent,
  type TDILoadedRule,
  type TDIIntervention,
} from "@/lib/tdi";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AITutorProps {
  courseId?: string;
}

const AITutor = ({ courseId }: AITutorProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI tutor. Ask me anything about the course, and I'll help you understand the concepts better!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [tdiRules, setTdiRules] = useState<TDILoadedRule[] | null>(null);
  const [activeIntervention, setActiveIntervention] = useState<TDIIntervention | null>(null);
  const [pendingMessages, setPendingMessages] = useState<Message[] | null>(null);
  const [pendingInput, setPendingInput] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    loadTDIRules({ mode: "chat", courseId })
      .then(setTdiRules)
      .catch(() => setTdiRules(null));
  }, [courseId]);

  const callTutor = async (baseMessages: Message[]) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: {
          messages: baseMessages,
          courseId,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error calling AI tutor:", error);
      toast({
        title: "Error",
        description: "Failed to get response from AI tutor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");

    const intervention = diagnoseTDI(
      {
        mode: "chat",
        learnerText: text,
      },
      tdiRules,
    );

    if (intervention) {
      setActiveIntervention(intervention);
      setPendingMessages(updatedMessages);
      setPendingInput(text);
      void logTDIEvent({
        action: "triggered",
        intervention,
        courseId: courseId ?? null,
        moduleId: null,
        learnerInput: text,
        context: "ai_tutor",
      }).catch(() => {});
      return;
    }

    await callTutor(updatedMessages);
  };

  return (
    <>
      <TeachingDecisionIntervention
        open={!!activeIntervention}
        intervention={activeIntervention}
        onAcknowledge={(learnerResponse) => {
          if (!activeIntervention || !pendingMessages) return;

          const tdiMessage: Message = {
            role: "assistant",
            content: formatTDITranscript(activeIntervention, learnerResponse),
          };

          const nextMessages = [...pendingMessages, tdiMessage];
          setMessages(nextMessages);

          void logTDIEvent({
            action: "acknowledged",
            intervention: activeIntervention,
            courseId: courseId ?? null,
            moduleId: null,
            learnerInput: pendingInput ?? null,
            learnerResponse: learnerResponse ?? null,
            context: "ai_tutor",
          }).catch(() => {});

          setActiveIntervention(null);
          setPendingMessages(null);
          setPendingInput(null);

          void callTutor(nextMessages);
        }}
        onSkip={() => {
          if (!activeIntervention || !pendingMessages) return;

          void logTDIEvent({
            action: "skipped",
            intervention: activeIntervention,
            courseId: courseId ?? null,
            moduleId: null,
            learnerInput: pendingInput ?? null,
            context: "ai_tutor",
          }).catch(() => {});

          const nextMessages = pendingMessages;
          setActiveIntervention(null);
          setPendingMessages(null);
          setPendingInput(null);

          void callTutor(nextMessages);
        }}
      />

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Tutor
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 py-4">
              {messages.map((message, idx) => (
                <div key={idx} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <Badge variant="secondary" className="mb-2 text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Tutor
                      </Badge>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Ask me anything about the course..."
                disabled={loading}
              />
              <Button onClick={() => void handleSend()} disabled={loading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AITutor;

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeachingDecisionIntervention } from "@/components/TeachingDecisionIntervention";
import {
  diagnoseTDI,
  formatTDITranscript,
  loadTDIRules,
  logTDIEvent,
  type TDILoadedRule,
  type TDIIntervention,
} from "@/lib/tdi";
import {
  Brain,
  Lightbulb,
  Code,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  Send,
  Volume2,
} from "lucide-react";

interface Message {
  role: "teacher" | "student";
  content: string;
  timestamp: Date;
  explanationType?: "simple" | "visual" | "code" | "analogy" | "socratic";
}

interface EnhancedAITeacherProps {
  courseTitle: string;
  topicTitle: string;
  courseId?: string;
  moduleId?: string;
  onQuestionSubmit?: (question: string) => void;
}

export const EnhancedAITeacher = ({ courseTitle, topicTitle, courseId, moduleId, onQuestionSubmit }: EnhancedAITeacherProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'teacher',
      content: `Hi! I'm your AI Teacher for ${topicTitle}. I'm here to help you master this topic. You can ask me anything, and I'll explain it in different ways until it clicks!`,
      timestamp: new Date(),
      explanationType: 'simple'
    }
  ]);
  const [question, setQuestion] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeIntervention, setActiveIntervention] = useState<TDIIntervention | null>(null);
  const [pendingQuestionForIntervention, setPendingQuestionForIntervention] = useState<string | null>(null);
  const [tdiRules, setTdiRules] = useState<TDILoadedRule[] | null>(null);

  useEffect(() => {
    loadTDIRules({ mode: "chat", courseId, moduleId })
      .then(setTdiRules)
      .catch(() => setTdiRules(null));
  }, [courseId, moduleId]);

  const explanationStyles = [
    {
      id: 'simple',
      label: 'Simple',
      icon: Lightbulb,
      description: 'Easy-to-understand explanation',
      color: 'text-primary'
    },
    {
      id: 'visual',
      label: 'Visual',
      icon: ImageIcon,
      description: 'Diagram or visual representation',
      color: 'text-accent'
    },
    {
      id: 'analogy',
      label: 'Analogy',
      icon: Sparkles,
      description: 'Real-world comparison',
      color: 'text-success'
    },
    {
      id: 'code',
      label: 'Code',
      icon: Code,
      description: 'Show me with code',
      color: 'text-warning'
    },
    {
      id: 'socratic',
      label: 'Socratic',
      icon: MessageSquare,
      description: 'Guide me with questions',
      color: 'text-foreground'
    }
  ];

  const handleExplanationStyle = async (style: string) => {
    setIsTyping(true);
    
    // Simulate AI thinking
    setTimeout(() => {
      let response = '';
      
      switch (style) {
        case 'simple':
          response = `Let me break this down simply: This concept is like building blocks. Each piece connects to the next, creating something bigger. The key is understanding how each part works before combining them.`;
          break;
        case 'visual':
          response = `📊 Visual Explanation:\n\nImagine a flowchart:\n[Start] → [Process Data] → [Apply Logic] → [Generate Result]\n\nEach arrow represents data flowing through your system. The boxes are where transformations happen.`;
          break;
        case 'analogy':
          response = `Think of it like a restaurant kitchen:\n- Ingredients = Your data\n- Recipes = Your algorithms\n- Chef = The processor\n- Plated dish = Your output\n\nJust as a chef follows a recipe to transform ingredients into a meal, your code transforms data into results!`;
          break;
        case 'code':
          response = `Here's how it looks in code:\n\n\`\`\`python\ndef process_data(input_data):\n    # Step 1: Validate\n    if not input_data:\n        return None\n    \n    # Step 2: Transform\n    result = [x * 2 for x in input_data]\n    \n    # Step 3: Return\n    return result\n\n# Usage\ndata = [1, 2, 3]\noutput = process_data(data)\nprint(output)  # [2, 4, 6]\n\`\`\`\n\nSee how each step builds on the previous one?`;
          break;
        case 'socratic':
          response = `Let me ask you some questions to guide your thinking:\n\n1. What do you think happens when we process this data?\n2. Can you identify what inputs we need?\n3. What should the output look like?\n\nThink about these, and let's work through it together!`;
          break;
        default:
          response = `I can explain this in multiple ways. Which approach would help you most?`;
      }

      setMessages(prev => [...prev, {
        role: 'teacher',
        content: response,
        timestamp: new Date(),
        explanationType: style as any
      }]);
      setIsTyping(false);
    }, 1000);
  };

  const simulateTeacherResponse = (asked: string) => {
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        `Great question! ${asked.toLowerCase().includes("why") ? "The reason is..." : "Here's what you need to know..."} This concept works by connecting different pieces together. Think of it as a puzzle where each piece has a specific place.`,
        `I love that you asked that! Let me explain: When you ${asked.toLowerCase()}, you're essentially creating a bridge between two ideas. This is fundamental because it allows you to...`,
        `Excellent thinking! To answer your question about "${asked.slice(0, 30)}...", we need to understand that this is all about relationships. Each element depends on others, creating a system.`,
      ];

      setMessages((prev) => [
        ...prev,
        {
          role: "teacher",
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          explanationType: "simple",
        },
      ]);
      setIsTyping(false);

      onQuestionSubmit?.(asked);
    }, 1500);
  };

  const handleSubmitQuestion = async () => {
    const asked = question.trim();
    if (!asked) return;

    // Add student question
    setMessages((prev) => [
      ...prev,
      {
        role: "student",
        content: asked,
        timestamp: new Date(),
      },
    ]);

    setQuestion("");

    // TDI: deterministic, auditable intervention before we answer
    const intervention = diagnoseTDI(
      {
        mode: "chat",
        courseTitle,
        topicTitle,
        learnerText: asked,
      },
      tdiRules,
    );

    if (intervention) {
      setPendingQuestionForIntervention(asked);
      setActiveIntervention(intervention);
      void logTDIEvent({
        action: "triggered",
        intervention,
        courseId: courseId ?? null,
        moduleId: moduleId ?? null,
        learnerInput: asked,
        context: "enhanced_ai_teacher",
      }).catch(() => {});
      return;
    }

    simulateTeacherResponse(asked);
  };

  const handleAcknowledgeIntervention = (learnerResponse?: string) => {
    if (!activeIntervention) return;

    const asked = pendingQuestionForIntervention;

    setMessages((prev) => [
      ...prev,
      {
        role: "teacher",
        content: formatTDITranscript(activeIntervention, learnerResponse),
        timestamp: new Date(),
        explanationType: "socratic",
      },
    ]);

    setActiveIntervention(null);
    setPendingQuestionForIntervention(null);

    if (asked) simulateTeacherResponse(asked);
  };

  return (
    <div className="space-y-6">
      <TeachingDecisionIntervention
        open={!!activeIntervention}
        intervention={activeIntervention}
        onAcknowledge={handleAcknowledgeIntervention}
        onSkip={() => {
          const asked = pendingQuestionForIntervention;
          setActiveIntervention(null);
          setPendingQuestionForIntervention(null);
          if (asked) simulateTeacherResponse(asked);
        }}
      />

      {/* AI Teacher Header */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>Your AI Teacher</CardTitle>
              <p className="text-sm text-muted-foreground">
                Learning: {topicTitle}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Conversation */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'student' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'teacher' 
                    ? 'bg-gradient-hero' 
                    : 'bg-accent'
                }`}>
                  {msg.role === 'teacher' ? (
                    <Brain className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <span className="text-accent-foreground text-xs font-bold">You</span>
                  )}
                </div>
                <div className={`flex-1 ${msg.role === 'student' ? 'text-right' : ''}`}>
                  <div className={`inline-block max-w-[80%] p-4 rounded-lg ${
                    msg.role === 'teacher'
                      ? 'bg-muted'
                      : 'bg-accent/20'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.explanationType && (
                      <Badge variant="outline" className="mt-2">
                        {msg.explanationType} explanation
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
          </div>

          {/* Ask a Question */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Textarea
                placeholder="Ask me anything about this topic..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitQuestion();
                  }
                }}
                className="min-h-[60px]"
              />
              <Button 
                onClick={handleSubmitQuestion}
                disabled={!question.trim() || isTyping}
                className="bg-gradient-hero"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Voice Input Option */}
            <Button variant="outline" size="sm" className="w-full">
              <Volume2 className="w-4 h-4 mr-2" />
              Speak your question (coming soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Explanation Styles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How would you like me to explain?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {explanationStyles.map(style => (
              <Button
                key={style.id}
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => handleExplanationStyle(style.id)}
              >
                <style.icon className={`w-5 h-5 ${style.color}`} />
                <span className="font-medium text-sm">{style.label}</span>
                <span className="text-xs text-muted-foreground text-center">
                  {style.description}
                </span>
              </Button>
            ))}
          </div>

          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 Tip: Don't worry if you don't understand at first! I can explain the same concept in 5 different ways. Just click a style above or ask follow-up questions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

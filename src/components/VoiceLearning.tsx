import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Volume2, VolumeX, Square, Loader2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface VoiceMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface VoiceLearningProps {
  courseTitle?: string;
  topicTitle?: string;
}

export const VoiceLearning = ({ courseTitle = "General", topicTitle }: VoiceLearningProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [transcript, setTranscript] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t;
        } else {
          interimTranscript += t;
        }
      }
      setTranscript(interimTranscript);
      if (finalTranscript.trim()) {
        handleUserSpeech(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "no-speech") {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (isListening) {
        try { recognition.start(); } catch {}
      }
    };

    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUserSpeech = useCallback(async (text: string) => {
    setTranscript("");
    const userMsg: VoiceMessage = { role: "user", content: text, timestamp: new Date() };
    const updatedMessages = [...messages, userMsg];
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          courseTitle,
          topicTitle,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast({ title: "Rate Limit", description: "Too many requests. Please wait.", variant: "destructive" });
          return;
        }
        if (response.status === 402) {
          toast({ title: "Credits Depleted", description: "AI credits depleted. Contact support.", variant: "destructive" });
          return;
        }
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (!reader) throw new Error("No response stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(l => l.trim());
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) assistantMessage += content;
            } catch {}
          }
        }
      }

      if (assistantMessage) {
        const assistantMsg: VoiceMessage = { role: "assistant", content: assistantMessage, timestamp: new Date() };
        setMessages(prev => [...prev, assistantMsg]);
        if (ttsEnabled) speak(assistantMessage);
      }
    } catch (error) {
      console.error("Voice AI error:", error);
      toast({ title: "Error", description: "Failed to get AI response.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  }, [messages, courseTitle, topicTitle, ttsEnabled]);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setTranscript("");
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        toast({ title: "Microphone Error", description: "Could not access microphone.", variant: "destructive" });
      }
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  if (!voiceSupported) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-6 text-center">
          <MicOff className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Voice interface is not supported in this browser. Try Chrome or Edge.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-base">Voice Learning</CardTitle>
              <p className="text-xs text-muted-foreground">Hands-free AI conversations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isListening && (
              <Badge variant="outline" className="animate-pulse border-primary text-primary">
                <span className="w-2 h-2 rounded-full bg-primary mr-1.5 inline-block" />
                Listening
              </Badge>
            )}
            {isProcessing && <Badge variant="secondary"><Loader2 className="w-3 h-3 animate-spin mr-1" />Thinking</Badge>}
            {isSpeaking && <Badge variant="outline" className="border-accent text-accent-foreground">Speaking</Badge>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4 mb-4">
          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <Mic className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-sm font-medium">Tap the microphone and start speaking</p>
                <p className="text-xs mt-1">Ask questions about {topicTitle || courseTitle}</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] rounded-lg p-3 ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-[10px] opacity-60 mt-1">{msg.timestamp.toLocaleTimeString()}</p>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-muted/50 rounded-lg p-2 mb-3 border border-dashed border-muted-foreground/30"
            >
              <p className="text-xs text-muted-foreground italic">{transcript}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className="h-10 w-10"
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          <Button
            onClick={toggleListening}
            disabled={isProcessing}
            size="icon"
            className={`h-16 w-16 rounded-full transition-all ${
              isListening
                ? "bg-destructive hover:bg-destructive/90 shadow-lg scale-110"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>

          {isSpeaking && (
            <Button variant="outline" size="icon" onClick={stopSpeaking} className="h-10 w-10">
              <Square className="w-4 h-4" />
            </Button>
          )}
          {!isSpeaking && <div className="w-10" />}
        </div>
      </CardContent>
    </Card>
  );
};

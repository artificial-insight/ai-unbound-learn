import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Video, Mic, MicOff, VideoOff, Code, MessageSquare, Users, Hand } from "lucide-react";
import { useState } from "react";

const LiveSession = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [code, setCode] = useState(`function fibonacci(n) {\n  // TODO: Implement fibonacci sequence\n  \n}`);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              React State Management Deep Dive
            </h1>
            <Badge variant="secondary" className="bg-success text-success-foreground">
              <span className="w-2 h-2 rounded-full bg-success-foreground animate-pulse mr-2" />
              Live
            </Badge>
          </div>
          <p className="text-muted-foreground">
            AI Instructor: Sarah • 24 participants • Started 15 mins ago
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Video + Code Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Area */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-hero flex items-center justify-center text-white mb-4 mx-auto">
                      <Video className="w-12 h-12" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">AI Instructor Sarah</h3>
                    <p className="text-muted-foreground">
                      Currently discussing: React Context API vs Redux
                    </p>
                  </div>
                  
                  {/* AI Instructor Status */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-background/90 backdrop-blur-sm">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-sm font-medium">AI Teaching Mode</span>
                  </div>
                </div>
                
                {/* Video Controls */}
                <div className="p-4 bg-card border-t border-border">
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant={isMuted ? "destructive" : "secondary"}
                      size="icon"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant={isVideoOff ? "destructive" : "secondary"}
                      size="icon"
                      onClick={() => setIsVideoOff(!isVideoOff)}
                    >
                      {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    </Button>
                    <Button variant="secondary" size="icon">
                      <Hand className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Code Editor */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-primary" />
                    Live Code Editor
                  </CardTitle>
                  <Button variant="outline" size="sm">Run Code</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="font-mono text-sm min-h-[200px] bg-muted/30"
                  placeholder="Write your code here..."
                />
                <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="text-sm font-medium mb-2">Output:</div>
                  <div className="text-sm text-muted-foreground">
                    Ready to run your code...
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Chat & Participants */}
          <div className="space-y-6">
            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-primary" />
                  Participants (24)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-48 overflow-y-auto">
                <ParticipantItem name="You" isAI={false} isActive={true} />
                <ParticipantItem name="AI Instructor Sarah" isAI={true} isActive={true} />
                <ParticipantItem name="John D." isAI={false} isActive={true} />
                <ParticipantItem name="Maria S." isAI={false} isActive={false} />
                <ParticipantItem name="Alex K." isAI={false} isActive={true} />
                <ParticipantItem name="Emma L." isAI={false} isActive={false} />
              </CardContent>
            </Card>

            {/* Live Chat */}
            <Card className="flex flex-col h-[500px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Live Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 space-y-3 overflow-y-auto mb-4">
                  <ChatMessage
                    name="AI Instructor Sarah"
                    message="Welcome everyone! Today we'll explore state management patterns."
                    time="10:02 AM"
                    isAI={true}
                  />
                  <ChatMessage
                    name="John D."
                    message="Excited to learn about Context API!"
                    time="10:03 AM"
                    isAI={false}
                  />
                  <ChatMessage
                    name="AI Instructor Sarah"
                    message="Great! Let's start with a quick review. Can anyone explain what state is in React?"
                    time="10:04 AM"
                    isAI={true}
                  />
                  <ChatMessage
                    name="You"
                    message="State is data that changes over time in a component"
                    time="10:05 AM"
                    isAI={false}
                  />
                  <ChatMessage
                    name="AI Instructor Sarah"
                    message="Excellent answer! State represents the dynamic data in your application. Now let's dive deeper..."
                    time="10:05 AM"
                    isAI={true}
                  />
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask a question or share your thoughts..."
                    className="min-h-[80px]"
                  />
                  <Button>Send</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

const ParticipantItem = ({ name, isAI, isActive }: any) => (
  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-success' : 'bg-muted-foreground'}`} />
      <span className="text-sm">{name}</span>
      {isAI && <Badge variant="secondary" className="text-xs">AI</Badge>}
    </div>
  </div>
);

const ChatMessage = ({ name, message, time, isAI }: any) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold">{name}</span>
      {isAI && <Badge variant="secondary" className="text-xs">AI</Badge>}
      <span className="text-xs text-muted-foreground">{time}</span>
    </div>
    <p className="text-sm text-muted-foreground pl-0">{message}</p>
  </div>
);

export default LiveSession;

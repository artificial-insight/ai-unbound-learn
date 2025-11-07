import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
  };
}

const StudyGroups = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadMessages();
      subscribeToMessages();
      subscribeToTyping();
    }
  }, [selectedGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadGroups = async () => {
    const { data } = await supabase
      .from('study_groups')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setGroups(data);
  };

  const loadMessages = async () => {
    if (!selectedGroup) return;

    const { data } = await supabase
      .from('study_group_messages')
      .select('*')
      .eq('group_id', selectedGroup.id)
      .order('created_at', { ascending: true });

    if (data) {
      // Fetch profiles separately
      const messagesWithProfiles = await Promise.all(
        data.map(async (msg) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', msg.user_id)
            .single();
          
          return {
            ...msg,
            profiles: profile || { full_name: null }
          };
        })
      );
      setMessages(messagesWithProfiles as Message[]);
    }
  };

  const subscribeToMessages = () => {
    if (!selectedGroup) return;

    const channel = supabase
      .channel(`messages:${selectedGroup.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'study_group_messages',
          filter: `group_id=eq.${selectedGroup.id}`,
        },
        async (payload) => {
          // Fetch user profile for new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', payload.new.user_id)
            .single();

          setMessages((prev) => [...prev, {
            ...payload.new,
            profiles: profile
          } as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToTyping = () => {
    if (!selectedGroup) return;

    const channel = supabase
      .channel(`typing:${selectedGroup.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_group_typing',
          filter: `group_id=eq.${selectedGroup.id}`,
        },
        async (payload) => {
          if (!payload.new || typeof payload.new !== 'object') return;
          const newData = payload.new as any;
          if (newData.user_id === user?.id) return;

          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', newData.user_id)
            .single();

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (newData.is_typing) {
              setTypingUsers((prev) => [
                ...prev.filter((name) => name !== (profile?.full_name || 'Someone')),
                profile?.full_name || 'Someone',
              ]);
            } else {
              setTypingUsers((prev) =>
                prev.filter((name) => name !== profile?.full_name)
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleTyping = async () => {
    if (!selectedGroup || !user) return;

    // Update typing status
    await supabase
      .from('study_group_typing')
      .upsert({
        group_id: selectedGroup.id,
        user_id: user.id,
        is_typing: true,
        updated_at: new Date().toISOString(),
      });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to clear typing status
    typingTimeoutRef.current = setTimeout(async () => {
      await supabase
        .from('study_group_typing')
        .update({ is_typing: false })
        .eq('group_id', selectedGroup.id)
        .eq('user_id', user.id);
    }, 3000);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedGroup || !user || sending) return;

    setSending(true);

    try {
      // Clear typing status
      await supabase
        .from('study_group_typing')
        .update({ is_typing: false })
        .eq('group_id', selectedGroup.id)
        .eq('user_id', user.id);

      await supabase
        .from('study_group_messages')
        .insert({
          group_id: selectedGroup.id,
          user_id: user.id,
          message: newMessage,
        });

      setNewMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Study Groups</h1>
          <p className="text-muted-foreground mt-1">
            Collaborate with peers in real-time chat
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Groups List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Your Groups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedGroup?.id === group.id
                      ? 'bg-primary/10 border border-primary'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="font-medium text-sm">{group.name}</span>
                  </div>
                  {group.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {group.description}
                    </p>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-3 flex flex-col h-[600px]">
            {selectedGroup ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedGroup.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedGroup.description}
                      </p>
                    </div>
                    <Badge variant="outline">
                      <Users className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-4">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.user_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.user_id === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {message.user_id !== user?.id && (
                            <p className="text-xs font-semibold mb-1">
                              {message.profiles?.full_name || 'Anonymous'}
                            </p>
                          )}
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Typing Indicator */}
                  {typingUsers.length > 0 && (
                    <div className="text-sm text-muted-foreground mb-2 animate-pulse">
                      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </div>
                  )}

                  {/* Input */}
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      disabled={sending}
                    />
                    <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a study group to start chatting</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudyGroups;

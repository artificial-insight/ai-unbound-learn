import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Plus, Send, MessageCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface StudyGroup {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  member_count?: number;
}

interface GroupMessage {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  user_name?: string;
}

const StudyGroups = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<StudyGroup[]>([]);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });

  useEffect(() => {
    if (user) {
      loadMyGroups();
    }
  }, [user]);

  useEffect(() => {
    if (selectedGroup) {
      loadMessages();
      subscribeToMessages();
    }
  }, [selectedGroup]);

  const loadMyGroups = async () => {
    try {
      setLoading(true);
      // Get groups where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('study_group_members')
        .select('study_group_id')
        .eq('user_id', user?.id);

      if (memberError) throw memberError;

      if (memberData && memberData.length > 0) {
        const groupIds = memberData.map(m => m.study_group_id);
        const { data: groupsData, error: groupsError } = await supabase
          .from('study_groups')
          .select('*')
          .in('id', groupIds);

        if (groupsError) throw groupsError;
        setGroups(groupsData || []);
      } else {
        setGroups([]);
      }
    } catch (error: any) {
      console.error('Error loading groups:', error);
      toast({
        title: "Error",
        description: "Failed to load study groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableGroups = async () => {
    try {
      // Get all groups
      const { data: allGroups, error } = await supabase
        .from('study_groups')
        .select('*');

      if (error) throw error;

      // Filter out groups user is already in
      const myGroupIds = groups.map(g => g.id);
      const available = (allGroups || []).filter(g => !myGroupIds.includes(g.id));
      setAvailableGroups(available);
    } catch (error: any) {
      console.error('Error loading available groups:', error);
    }
  };

  const loadMessages = async () => {
    if (!selectedGroup) return;

    try {
      const { data, error } = await supabase
        .from('study_group_messages')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .eq('study_group_id', selectedGroup.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const messagesWithNames = data?.map(msg => ({
        ...msg,
        user_name: (msg as any).profiles?.full_name || 'Anonymous',
      })) || [];

      setMessages(messagesWithNames);
    } catch (error: any) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!selectedGroup) return;

    const channel = supabase
      .channel(`group-${selectedGroup.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'study_group_messages',
          filter: `study_group_id=eq.${selectedGroup.id}`,
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleCreateGroup = async () => {
    try {
      // Create group
      const { data: groupData, error: groupError } = await supabase
        .from('study_groups')
        .insert([{
          name: newGroup.name,
          description: newGroup.description,
          created_by: user?.id,
        }])
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as member
      const { error: memberError } = await supabase
        .from('study_group_members')
        .insert([{
          study_group_id: groupData.id,
          user_id: user?.id,
          role: 'admin',
        }]);

      if (memberError) throw memberError;

      toast({
        title: "Success",
        description: "Study group created successfully",
      });

      setCreateDialogOpen(false);
      setNewGroup({ name: "", description: "" });
      loadMyGroups();
    } catch (error: any) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create study group",
        variant: "destructive",
      });
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('study_group_members')
        .insert([{
          study_group_id: groupId,
          user_id: user?.id,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Joined study group successfully",
      });

      setJoinDialogOpen(false);
      loadMyGroups();
    } catch (error: any) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: "Failed to join study group",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedGroup) return;

    try {
      const { error } = await supabase
        .from('study_group_messages')
        .insert([{
          study_group_id: selectedGroup.id,
          user_id: user?.id,
          message: newMessage,
        }]);

      if (error) throw error;

      setNewMessage("");
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Study Groups
            </h1>
            <p className="text-muted-foreground">
              Collaborate with peers and share knowledge
            </p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={joinDialogOpen} onOpenChange={(open) => {
              setJoinDialogOpen(open);
              if (open) loadAvailableGroups();
            }}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Join Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join Study Group</DialogTitle>
                  <DialogDescription>Browse and join available study groups</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  {availableGroups.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No available groups</p>
                  ) : (
                    availableGroups.map((group) => (
                      <div key={group.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{group.name}</h4>
                            {group.description && (
                              <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                            )}
                          </div>
                          <Button size="sm" onClick={() => handleJoinGroup(group.id)}>Join</Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Study Group</DialogTitle>
                  <DialogDescription>Start a new study group</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Group Name</Label>
                    <Input
                      id="name"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                      placeholder="e.g., React Study Group"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                      placeholder="What will this group focus on?"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateGroup}>Create Group</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Groups List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>My Groups</CardTitle>
              <CardDescription>Groups you've joined</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">Loading...</div>
              ) : groups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No groups yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {groups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroup(group)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedGroup?.id === group.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <h4 className="font-semibold">{group.name}</h4>
                      {group.description && (
                        <p className="text-sm text-muted-foreground truncate">{group.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                {selectedGroup ? selectedGroup.name : 'Select a group'}
              </CardTitle>
              {selectedGroup?.description && (
                <CardDescription>{selectedGroup.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {!selectedGroup ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a group to start chatting</p>
                </div>
              ) : (
                <div className="flex flex-col h-[500px]">
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.user_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] p-3 rounded-lg ${
                            msg.user_id === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            {msg.user_id !== user?.id && (
                              <p className="text-xs font-semibold mb-1">{msg.user_name}</p>
                            )}
                            <p className="text-sm">{msg.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="flex gap-2 mt-4">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StudyGroups;
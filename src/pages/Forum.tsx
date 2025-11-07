import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Plus, Search, Eye, MessageCircle, Pin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface Topic {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  locked: boolean;
  views: number;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const categories = [
  "All Topics",
  "General Discussion",
  "Course Help",
  "Study Groups",
  "Career Advice",
  "Technical Q&A",
];

const Forum = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Topics");

  useEffect(() => {
    loadTopics();
  }, [selectedCategory]);

  const loadTopics = async () => {
    let query = supabase
      .from('forum_topics')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (selectedCategory !== "All Topics") {
      query = query.eq('category', selectedCategory);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load forum topics",
        variant: "destructive",
      });
    } else {
      // Fetch user profiles separately
      const topicsWithProfiles = await Promise.all(
        (data || []).map(async (topic) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', topic.user_id)
            .single();
          
          return {
            ...topic,
            profiles: profile || { full_name: null, avatar_url: null }
          };
        })
      );
      setTopics(topicsWithProfiles as Topic[]);
    }
    setLoading(false);
  };

  const filteredTopics = topics.filter((topic) =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Discussion Forum</h1>
              <p className="text-muted-foreground mt-1">
                Connect with peers, ask questions, and share knowledge
              </p>
            </div>
            <Button onClick={() => navigate('/forum/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Topic
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList className="flex-wrap h-auto">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="flex-shrink-0">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading topics...</p>
            </CardContent>
          </Card>
        ) : filteredTopics.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No topics found</p>
              <Button onClick={() => navigate('/forum/new')} className="mt-4">
                Start a Discussion
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTopics.map((topic) => (
              <Card
                key={topic.id}
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={() => navigate(`/forum/${topic.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <MessageSquare className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {topic.pinned && (
                            <Pin className="h-4 w-4 text-primary" />
                          )}
                          <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                            {topic.title}
                          </h3>
                        </div>
                        <Badge variant="outline">{topic.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {topic.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          by {topic.profiles?.full_name || 'Anonymous'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {topic.views} views
                        </span>
                        <span>
                          {formatDistanceToNow(new Date(topic.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Forum;

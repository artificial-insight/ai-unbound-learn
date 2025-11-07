import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageCircle, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const ForumTopic = () => {
  const { topicId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (topicId) {
      loadTopic();
      loadReplies();
    }
  }, [topicId]);

  const loadTopic = async () => {
    const { data, error } = await supabase
      .from('forum_topics')
      .select('*')
      .eq('id', topicId)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load topic",
        variant: "destructive",
      });
      navigate('/forum');
    } else {
      setTopic(data);
      // Increment view count
      await supabase
        .from('forum_topics')
        .update({ views: data.views + 1 })
        .eq('id', topicId);
    }
    setLoading(false);
  };

  const loadReplies = async () => {
    const { data } = await supabase
      .from('forum_replies')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });

    if (data) {
      const repliesWithProfiles = await Promise.all(
        data.map(async (reply) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', reply.user_id)
            .single();
          
          return { ...reply, profile };
        })
      );
      setReplies(repliesWithProfiles);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('forum_replies')
        .insert({
          topic_id: topicId,
          user_id: user!.id,
          content: replyContent,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reply posted successfully",
      });

      setReplyContent("");
      loadReplies();

      // Create notification for topic author
      if (topic && topic.user_id !== user?.id) {
        await supabase.from('notifications').insert({
          user_id: topic.user_id,
          title: 'New reply on your topic',
          message: `Someone replied to "${topic.title}"`,
          type: 'message',
          link: `/forum/${topicId}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (!topic) return null;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/forum')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Forum
        </Button>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Original Topic */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{topic.title}</h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Badge variant="outline">{topic.category}</Badge>
                    <span>{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}</span>
                    <span>{topic.views} views</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {topic.content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Replies */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Replies ({replies.length})
            </h2>

            {replies.map((reply) => (
              <Card key={reply.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={reply.profile?.avatar_url} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">
                          {reply.profile?.full_name || 'Anonymous'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown
                          components={{
                            code({ node, inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={vscDarkPlus}
                                  language={match[1]}
                                  PreTag="div"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {reply.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* New Reply */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Post a Reply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MarkdownEditor
                value={replyContent}
                onChange={setReplyContent}
                placeholder="Write your reply... Supports markdown and code blocks"
                minHeight="200px"
              />
              <Button onClick={handleSubmitReply} disabled={submitting || !replyContent.trim()}>
                {submitting ? "Posting..." : "Post Reply"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ForumTopic;

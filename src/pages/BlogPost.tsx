import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar, Clock, ArrowLeft, Share2, Bookmark } from "lucide-react";

const BlogPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <article className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/blog")}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>

          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Badge>AI Learning</Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  January 15, 2025
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  5 min read
                </div>
              </div>

              <h1 className="font-display font-bold text-4xl lg:text-5xl leading-tight">
                Getting Started with AI-Powered Learning
              </h1>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-hero"></div>
                  <div>
                    <div className="font-semibold">Sarah Johnson</div>
                    <div className="text-sm text-muted-foreground">Education Technology Expert</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="aspect-video bg-gradient-hero rounded-lg overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-6xl mb-4">🧠</div>
                  <p className="text-lg">Featured Image</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-muted-foreground leading-relaxed">
                Artificial intelligence is transforming the educational landscape, making personalized
                learning accessible to everyone. In this article, we'll explore how AI-powered learning
                platforms are revolutionizing the way we acquire new skills.
              </p>

              <h2 className="font-display font-bold text-3xl mt-12 mb-6">
                What is AI-Powered Learning?
              </h2>
              <p className="text-foreground leading-relaxed mb-6">
                AI-powered learning uses machine learning algorithms to create personalized educational
                experiences. These systems analyze your learning patterns, strengths, and weaknesses to
                provide customized content and recommendations.
              </p>

              <h2 className="font-display font-bold text-3xl mt-12 mb-6">
                Key Benefits
              </h2>
              <Card className="my-8 border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-bold">1.</span>
                      <span>Personalized learning paths tailored to your goals</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-bold">2.</span>
                      <span>Real-time feedback and adaptive difficulty</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-bold">3.</span>
                      <span>24/7 availability of AI tutors and assistants</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-bold">4.</span>
                      <span>Data-driven insights into your progress</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <h2 className="font-display font-bold text-3xl mt-12 mb-6">
                Getting Started
              </h2>
              <p className="text-foreground leading-relaxed mb-6">
                To begin your AI-powered learning journey, start by identifying your learning goals.
                Whether you're looking to master a new programming language, learn data science, or
                develop business skills, AI can help create a customized path for you.
              </p>

              <h2 className="font-display font-bold text-3xl mt-12 mb-6">
                Conclusion
              </h2>
              <p className="text-foreground leading-relaxed mb-6">
                AI-powered learning represents the future of education. By leveraging these technologies,
                learners can achieve their goals more efficiently and effectively than ever before.
              </p>
            </div>

            {/* Author Bio */}
            <Card className="bg-gradient-card">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-hero flex-shrink-0"></div>
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-xl">Sarah Johnson</h3>
                    <p className="text-muted-foreground">
                      Sarah is an education technology expert with over 10 years of experience in
                      AI-powered learning platforms. She's passionate about making quality education
                      accessible to everyone.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </article>
      </div>
    </AppLayout>
  );
};

export default BlogPost;

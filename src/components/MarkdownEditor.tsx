import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Code, Eye } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const MarkdownEditor = ({ 
  value, 
  onChange, 
  placeholder = "Write your content here... Supports markdown and code blocks",
  minHeight = "300px"
}: MarkdownEditorProps) => {
  const [activeTab, setActiveTab] = useState("write");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="write" className="flex items-center gap-2">
          <Code className="w-4 h-4" />
          Write
        </TabsTrigger>
        <TabsTrigger value="preview" className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Preview
        </TabsTrigger>
      </TabsList>

      <TabsContent value="write" className="mt-4">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="font-mono"
          style={{ minHeight }}
        />
        <div className="mt-2 text-xs text-muted-foreground">
          Supports Markdown: **bold**, *italic*, `code`, ```language for code blocks
        </div>
      </TabsContent>

      <TabsContent value="preview" className="mt-4">
        <Card className="p-4 prose prose-sm max-w-none dark:prose-invert" style={{ minHeight }}>
          {value ? (
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
              {value}
            </ReactMarkdown>
          ) : (
            <p className="text-muted-foreground">Nothing to preview yet...</p>
          )}
        </Card>
      </TabsContent>
    </Tabs>
  );
};

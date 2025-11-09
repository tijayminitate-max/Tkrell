import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Loader2, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import { Streamdown } from "streamdown";

export default function Chat() {
  const { isAuthenticated } = useAuth();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: history } = trpc.chat.history.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const sendMutation = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      setChatHistory(prev => [
        ...prev,
        { role: "assistant", content: data.response }
      ]);
      setMessage("");
    },
    onError: (error) => {
      toast.error("Failed to send message: " + error.message);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSend = () => {
    if (!message.trim()) return;

    setChatHistory(prev => [
      ...prev,
      { role: "user", content: message }
    ]);

    sendMutation.mutate({ message });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Please Sign In</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Chat with Mr. T</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl flex flex-col">
        {/* Welcome Message */}
        {chatHistory.length === 0 && (
          <Card className="mb-4 border-2 border-primary">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Hi! I'm Mr. T 👋</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your friendly AI tutor. Ask me anything about your studies!
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => setMessage("Explain photosynthesis to me")}
                >
                  <span className="text-left">Explain photosynthesis to me</span>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => setMessage("Help me with algebra")}
                >
                  <span className="text-left">Help me with algebra</span>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => setMessage("What are study tips for KCSE?")}
                >
                  <span className="text-left">What are study tips for KCSE?</span>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => setMessage("Teach me about Kenyan history")}
                >
                  <span className="text-left">Teach me about Kenyan history</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border-2 border-primary/20"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <Streamdown>{msg.content}</Streamdown>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          
          {sendMutation.isPending && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-card border-2 border-primary/20">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Mr. T is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <Card className="sticky bottom-0">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask Mr. T anything..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sendMutation.isPending}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={sendMutation.isPending || !message.trim()}
                size="icon"
              >
                {sendMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

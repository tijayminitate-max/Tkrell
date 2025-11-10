import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MessageSquarePlus, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Conversation {
  id: number;
  otherUser: {
    id: number;
    name: string | null;
    email: string | null;
  };
  lastMessageAt: Date | null;
}

interface ChatSidebarProps {
  selectedConversationId?: number;
  onSelectConversation: (conversationId: number, otherUserName: string) => void;
}

export function ChatSidebar({ selectedConversationId, onSelectConversation }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const { data: conversations, isLoading } = trpc.chat.getConversations.useQuery();
  const { data: searchResults } = trpc.chat.searchUsers.useQuery(
    { query: userSearchQuery },
    { enabled: userSearchQuery.length > 0 }
  );

  const createConversation = trpc.chat.getOrCreateConversation.useMutation({
    onSuccess: (data) => {
      setIsNewChatOpen(false);
      setUserSearchQuery("");
      onSelectConversation(data.id, "New Chat");
      toast.success("Conversation started!");
    },
  });

  const filteredConversations = conversations?.filter((conv) =>
    conv.otherUser.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherUser.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const handleStartChat = (userId: number) => {
    createConversation.mutate({ otherUserId: userId });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>Messages</CardTitle>
          <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost">
                <MessageSquarePlus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Chat</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {searchResults?.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => handleStartChat(user.id)}
                    >
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Chat
                      </Button>
                    </div>
                  ))}
                  {userSearchQuery && searchResults?.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No users found
                    </p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredConversations && filteredConversations.length > 0 ? (
          <div className="divide-y">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id, conv.otherUser.name || "Unknown")}
                className={`p-4 cursor-pointer hover:bg-muted transition-colors ${
                  selectedConversationId === conv.id ? "bg-muted" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {conv.otherUser.name || "Unknown User"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.otherUser.email}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {formatDate(conv.lastMessageAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>No conversations yet</p>
            <p className="text-sm mt-2">Start a new chat to get started!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

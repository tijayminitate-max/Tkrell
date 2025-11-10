import { useState } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatWindow } from "@/components/ChatWindow";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<{
    id: number;
    name: string;
  } | null>(null);

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        {/* Sidebar */}
        <div className="md:col-span-1 h-full">
          <ChatSidebar
            selectedConversationId={selectedConversation?.id}
            onSelectConversation={(id, name) => setSelectedConversation({ id, name })}
          />
        </div>

        {/* Chat Window */}
        <div className="md:col-span-2 h-full">
          {selectedConversation ? (
            <ChatWindow
              conversationId={selectedConversation.id}
              otherUserName={selectedConversation.name}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
                <p className="text-muted-foreground">
                  Select a conversation from the sidebar or start a new chat
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

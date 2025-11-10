import { useAuth } from "@/_core/hooks/useAuth";
import { UploadForm } from "@/components/UploadForm";
import { UploadCard } from "@/components/UploadCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload as UploadIcon, Loader2, FolderOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Upload() {
  const { isAuthenticated, user } = useAuth();
  const { data: myUploads, isLoading, refetch } = trpc.uploads.getMyUploads.useQuery();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Please Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You need to be signed in to upload files
            </p>
            <Link href="/profile">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
          <div className="flex items-center gap-2">
            <UploadIcon className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">My Uploads</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="upload">
              <UploadIcon className="h-4 w-4 mr-2" />
              Upload New
            </TabsTrigger>
            <TabsTrigger value="my-uploads">
              <FolderOpen className="h-4 w-4 mr-2" />
              My Uploads
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="max-w-2xl mx-auto">
            <UploadForm onSuccess={() => refetch()} />
          </TabsContent>

          <TabsContent value="my-uploads">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : myUploads && myUploads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myUploads.map((upload) => (
                  <UploadCard
                    key={upload.id}
                    upload={upload}
                    isOwner={true}
                    onDelete={() => refetch()}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No uploads yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload your first study material to get started
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

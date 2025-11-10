import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Heart, Eye, MoreVertical, Trash2, Edit } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

interface Upload {
  id: number;
  title: string;
  description?: string | null;
  fileUrl: string;
  fileType?: string | null;
  subject?: string | null;
  gradeLevel?: string | null;
  topic?: string | null;
  visibility: "public" | "private" | "class";
  tags?: string[] | null;
  downloads: number;
  views: number;
  likes: number;
  userId: number;
  createdAt: Date;
}

interface UploadCardProps {
  upload: Upload;
  isOwner?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function UploadCard({ upload, isOwner, onDelete, onEdit }: UploadCardProps) {
  const [liked, setLiked] = useState(false);
  const utils = trpc.useUtils();
  
  const toggleLike = trpc.uploads.toggleLike.useMutation({
    onSuccess: (data) => {
      setLiked(data.liked);
      utils.uploads.invalidate();
      toast.success(data.liked ? "Liked!" : "Unliked");
    },
  });

  const incrementDownload = trpc.uploads.incrementDownload.useMutation();
  const deleteUpload = trpc.uploads.delete.useMutation({
    onSuccess: () => {
      toast.success("Upload deleted");
      onDelete?.();
      utils.uploads.invalidate();
    },
  });

  const handleDownload = () => {
    window.open(upload.fileUrl, "_blank");
    incrementDownload.mutate({ id: upload.id });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this upload?")) {
      deleteUpload.mutate({ id: upload.id });
    }
  };

  const getFileTypeColor = (type?: string | null) => {
    if (!type) return "bg-gray-100 text-gray-800";
    if (type.includes("pdf")) return "bg-red-100 text-red-800";
    if (type.startsWith("image")) return "bg-blue-100 text-blue-800";
    if (type.includes("document") || type.includes("word")) return "bg-blue-100 text-blue-800";
    if (type.includes("presentation") || type.includes("powerpoint")) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  const getFileTypeLabel = (type?: string | null) => {
    if (!type) return "File";
    if (type.includes("pdf")) return "PDF";
    if (type.startsWith("image")) return "Image";
    if (type.includes("document") || type.includes("word")) return "Document";
    if (type.includes("presentation") || type.includes("powerpoint")) return "Presentation";
    return "File";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{upload.title}</CardTitle>
            <CardDescription className="mt-1">
              {upload.description || "No description"}
            </CardDescription>
          </div>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-2 mb-3">
          {upload.fileType && (
            <Badge className={getFileTypeColor(upload.fileType)}>
              {getFileTypeLabel(upload.fileType)}
            </Badge>
          )}
          {upload.subject && (
            <Badge variant="outline">{upload.subject}</Badge>
          )}
          {upload.gradeLevel && (
            <Badge variant="outline">{upload.gradeLevel}</Badge>
          )}
          {upload.visibility === "public" && (
            <Badge variant="secondary">Public</Badge>
          )}
        </div>

        {upload.topic && (
          <p className="text-sm text-muted-foreground mb-2">
            Topic: {upload.topic}
          </p>
        )}

        {upload.tags && upload.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {upload.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {upload.views}
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            {upload.downloads}
          </span>
          <span className="flex items-center gap-1">
            <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            {upload.likes}
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleLike.mutate({ uploadId: upload.id })}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

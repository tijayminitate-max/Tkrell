import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, FileText, Image as ImageIcon, File } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const SUBJECTS = ["Mathematics", "English", "Science", "Biology", "Chemistry", "Physics", "History", "Geography"];
const GRADES = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "F1", "F2", "F3", "F4", "IGCSE"];

export function UploadForm({ onSuccess }: { onSuccess?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [topic, setTopic] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private" | "class">("private");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);

  const createUpload = trpc.uploads.create.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setFile(droppedFile);
      if (!title) {
        setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];

        // Upload file (you'll need to implement actual S3 upload)
        // For now, we'll use a placeholder URL
        const fileUrl = `https://placeholder.com/${file.name}`;

        await createUpload.mutateAsync({
          title,
          description,
          fileUrl,
          fileType: file.type,
          fileSize: file.size,
          subject,
          topic,
          gradeLevel,
          visibility,
          tags: tags.length > 0 ? tags : undefined,
        });

        toast.success("File uploaded successfully!");
        
        // Reset form
        setFile(null);
        setTitle("");
        setDescription("");
        setSubject("");
        setGradeLevel("");
        setTopic("");
        setTags([]);
        setVisibility("private");
        
        onSuccess?.();
      };

      reader.onerror = () => {
        toast.error("Failed to read file");
        setUploading(false);
      };
    } catch (error) {
      toast.error("Failed to upload file");
      setUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="h-12 w-12 text-muted-foreground" />;
    
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-12 w-12 text-blue-500" />;
    } else if (file.type.includes("pdf")) {
      return <FileText className="h-12 w-12 text-red-500" />;
    }
    return <File className="h-12 w-12 text-gray-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Study Material</CardTitle>
        <CardDescription>Share notes, past papers, or study resources</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            {getFileIcon()}
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
            />
            <p className="mt-2 text-sm text-muted-foreground">
              {file ? file.name : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, DOC, PPT, or Images (Max 10MB)
            </p>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Algebra Notes - Form 2"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the content..."
              rows={3}
            />
          </div>

          {/* Subject and Grade */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="grade">Grade Level</Label>
              <Select value={gradeLevel} onValueChange={setGradeLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Topic */}
          <div>
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Quadratic Equations"
            />
          </div>

          {/* Visibility */}
          <div>
            <Label htmlFor="visibility">Visibility</Label>
            <Select value={visibility} onValueChange={(v: any) => setVisibility(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private (Only me)</SelectItem>
                <SelectItem value="public">Public (Everyone)</SelectItem>
                <SelectItem value="class">Class (My classes only)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add tags..."
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={uploading || !file}>
            {uploading ? "Uploading..." : "Upload File"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

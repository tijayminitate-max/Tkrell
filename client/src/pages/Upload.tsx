import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload as UploadIcon, Loader2, FileText, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import { Streamdown } from "streamdown";

export default function Upload() {
  const { isAuthenticated } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [summary, setSummary] = useState("");
  const [step, setStep] = useState<"upload" | "processing" | "summary">("upload");

  const uploadMutation = trpc.upload.create.useMutation({
    onSuccess: (data) => {
      toast.success("File uploaded successfully!");
      // In a real implementation, we'd extract text from the file
      // For now, we'll simulate it
      setExtractedText("Sample extracted text from the uploaded file...");
      setStep("processing");
    },
    onError: (error) => {
      toast.error("Failed to upload file: " + error.message);
      setStep("upload");
    },
  });

  const summarizeMutation = trpc.upload.summarize.useMutation({
    onSuccess: (data) => {
      setSummary(data.summary);
      setStep("summary");
      toast.success("Summary generated! Check your notes.");
    },
    onError: (error) => {
      toast.error("Failed to generate summary: " + error.message);
      setStep("upload");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    // Check file size (16MB limit)
    if (file.size > 16 * 1024 * 1024) {
      toast.error("File size must be less than 16MB");
      return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result?.toString().split(",")[1];
      if (!base64) {
        toast.error("Failed to read file");
        return;
      }

      try {
        const data = await uploadMutation.mutateAsync({
          fileName: file.name,
          fileContent: base64,
          mimeType: file.type,
        });

        // For demo purposes, simulate text extraction
        // In production, you'd use a PDF parsing library or backend service
        const simulatedText = `This is a simulated extraction from ${file.name}. In a real implementation, this would contain the actual text content from the PDF or document.`;
        setExtractedText(simulatedText);
        
        // Automatically generate summary
        summarizeMutation.mutate({
          uploadId: data.uploadId!,
          extractedText: simulatedText,
        });
      } catch (error) {
        console.error("Upload error:", error);
      }
    };

    reader.readAsDataURL(file);
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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
          <div className="flex items-center gap-2">
            <UploadIcon className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Upload & Summarize</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {step === "upload" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Upload Study Materials
              </CardTitle>
              <CardDescription>
                Upload PDFs, Word documents, or notes. Mr. T will extract key points and create study materials.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                <UploadIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <div className="mb-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-lg font-medium mb-2">
                      {file ? file.name : "Choose a file or drag it here"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      PDF, DOCX, or TXT files up to 16MB
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <Button asChild variant="outline">
                  <label htmlFor="file-upload">
                    Select File
                  </label>
                </Button>
              </div>

              {file && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!file || uploadMutation.isPending || summarizeMutation.isPending}
                className="w-full"
                size="lg"
              >
                {uploadMutation.isPending || summarizeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Upload & Generate Summary
                  </>
                )}
              </Button>

              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium">What Mr. T will do:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Extract text from your document</li>
                  <li>Identify key concepts and topics</li>
                  <li>Generate concise study notes</li>
                  <li>Create flashcards for review</li>
                  <li>Suggest practice questions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "processing" && (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin text-primary" />
              <h3 className="text-xl font-semibold mb-2">Processing Your Document</h3>
              <p className="text-muted-foreground">
                Mr. T is reading your file and generating study materials...
              </p>
            </CardContent>
          </Card>
        )}

        {step === "summary" && summary && (
          <div className="space-y-6">
            <Card className="border-2 border-primary">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Sparkles className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-2xl">Summary Generated!</CardTitle>
                    <CardDescription>
                      Your study notes have been saved
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <Streamdown>{summary}</Streamdown>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Link href="/notes" className="flex-1">
                <Button variant="outline" className="w-full">View All Notes</Button>
              </Link>
              <Button
                onClick={() => {
                  setFile(null);
                  setExtractedText("");
                  setSummary("");
                  setStep("upload");
                }}
                className="flex-1"
              >
                Upload Another File
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

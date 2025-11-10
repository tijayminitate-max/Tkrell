import { useState } from "react";
import { UploadCard } from "@/components/UploadCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

const SUBJECTS = ["All", "Mathematics", "English", "Science", "Biology", "Chemistry", "Physics", "History", "Geography"];
const GRADES = ["All", "P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "F1", "F2", "F3", "F4", "IGCSE"];

export default function Browse() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const { data: uploads, isLoading } = trpc.uploads.getPublicUploads.useQuery({
    subject: selectedSubject !== "All" ? selectedSubject : undefined,
    gradeLevel: selectedGrade !== "All" ? selectedGrade : undefined,
    limit: 20,
  });

  const filteredUploads = uploads?.filter((upload) =>
    upload.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    upload.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    upload.topic?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-4">Browse Study Materials</h1>
          
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Grade Level</label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredUploads && filteredUploads.length > 0 ? (
          <>
            <p className="text-muted-foreground mb-6">
              {filteredUploads.length} materials found
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUploads.map((upload) => (
                <UploadCard key={upload.id} upload={upload} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No materials found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

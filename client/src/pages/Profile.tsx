import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

const GRADE_LEVELS = [
  { value: "KG1", label: "KG1 - Kindergarten 1" },
  { value: "KG2", label: "KG2 - Kindergarten 2" },
  { value: "P1", label: "P1 - Primary 1" },
  { value: "P2", label: "P2 - Primary 2" },
  { value: "P3", label: "P3 - Primary 3" },
  { value: "P4", label: "P4 - Primary 4" },
  { value: "P5", label: "P5 - Primary 5" },
  { value: "P6", label: "P6 - Primary 6" },
  { value: "P7", label: "P7 - Primary 7" },
  { value: "P8", label: "P8 - Primary 8 (KCPE)" },
  { value: "F1", label: "F1 - Form 1" },
  { value: "F2", label: "F2 - Form 2" },
  { value: "F3", label: "F3 - Form 3" },
  { value: "F4", label: "F4 - Form 4 (KCSE)" },
  { value: "IGCSE", label: "IGCSE - International Track" },
];

const KENYAN_COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Calibri", "Embu", "Garissa", "Homa Bay",
  "Isiolo", "Kajiado", "Kakamega", "Kamba", "Kericho", "Kiambu", "Kilifi", "Kirinyaga",
  "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni",
  "Mandera", "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi", "Nakuru",
  "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita Taveta",
  "Tana River", "Tharaka Nithi", "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
];

export default function Profile() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [gradeLevel, setGradeLevel] = useState("");
  const [county, setCounty] = useState("");
  const [school, setSchool] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { data: profile } = trpc.profile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      setGradeLevel(profile.gradeLevel || "");
      setCounty(profile.county || "");
      setSchool(profile.school || "");
      setIsLoading(false);
    } else if (!isLoading) {
      setIsLoading(false);
    }
  }, [profile]);

  const utils = trpc.useUtils();
  const upsertMutation = trpc.profile.upsert.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully! 🎉");
      utils.profile.get.invalidate();
      setTimeout(() => setLocation("/dashboard"), 500);
    },
    onError: (error) => {
      toast.error("Failed to update profile: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gradeLevel) {
      toast.error("Please select a grade level");
      return;
    }

    upsertMutation.mutate({
      gradeLevel,
      county: county || undefined,
      school: school || undefined,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Please Sign In</CardTitle>
            <CardDescription>You need to be logged in to access your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2">
              ← Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Profile Setup</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardTitle className="text-3xl">Complete Your Profile</CardTitle>
            <CardDescription className="text-base">
              Help us personalize your learning experience by telling us about your education level and location
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Grade Level Selection */}
              <div className="space-y-3">
                <Label htmlFor="grade" className="text-base font-semibold">
                  Grade Level <span className="text-red-500">*</span>
                </Label>
                <Select value={gradeLevel} onValueChange={setGradeLevel}>
                  <SelectTrigger 
                    className="h-12 text-base border-2 focus:border-primary"
                    id="grade"
                  >
                    <SelectValue placeholder="Select your grade level" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {GRADE_LEVELS.map((grade) => (
                      <SelectItem key={grade.value} value={grade.value}>
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  This helps us show you the right curriculum and exam papers
                </p>
              </div>

              {/* County Selection */}
              <div className="space-y-3">
                <Label htmlFor="county" className="text-base font-semibold">
                  County <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Select value={county} onValueChange={setCounty}>
                  <SelectTrigger 
                    className="h-12 text-base border-2"
                    id="county"
                  >
                    <SelectValue placeholder="Select your county" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {KENYAN_COUNTIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  This helps us show you regional leaderboards and local school rankings
                </p>
              </div>

              {/* School Name */}
              <div className="space-y-3">
                <Label htmlFor="school" className="text-base font-semibold">
                  School Name <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="school"
                  placeholder="e.g., Starehe Boys Centre"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="h-12 text-base border-2 focus:border-primary"
                />
                <p className="text-sm text-muted-foreground">
                  Compete with your schoolmates on the leaderboard
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={upsertMutation.isPending || isLoading}
                className="w-full h-12 text-base font-semibold mt-8"
                size="lg"
              >
                {upsertMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving Profile...
                  </>
                ) : (
                  "Save Profile & Continue"
                )}
              </Button>

              {/* Skip Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/dashboard")}
                className="w-full h-12 text-base"
                disabled={upsertMutation.isPending}
              >
                Skip for Now
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <p className="text-sm text-foreground">
              <span className="font-semibold">💡 Tip:</span> Your profile helps us recommend the right study materials and track your progress across the Kenyan curriculum.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

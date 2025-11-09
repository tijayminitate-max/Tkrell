import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Loader2, Trophy, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import confetti from "canvas-confetti";

export default function Quiz() {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<"generate" | "taking" | "results">("generate");
  const [topic, setTopic] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [count, setCount] = useState(7);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<any>(null);

  const generateMutation = trpc.quiz.generate.useMutation({
    onSuccess: (data) => {
      setCurrentQuiz(data);
      setStep("taking");
      setAnswers({});
      toast.success("Quiz generated! Good luck! 🎯");
    },
    onError: (error) => {
      toast.error("Failed to generate quiz: " + error.message);
    },
  });

  const gradeMutation = trpc.quiz.grade.useMutation({
    onSuccess: (data) => {
      setResults(data);
      setStep("results");
      
      // Confetti on perfect score
      if (data.percentage === 100) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error("Failed to grade quiz: " + error.message);
    },
  });

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    generateMutation.mutate({ topic, gradeLevel, count });
  };

  const handleSubmit = () => {
    if (!currentQuiz) return;

    const answerArray = currentQuiz.questions.map((q: any, idx: number) => ({
      questionId: idx + 1,
      answer: answers[idx] || "",
    }));

    gradeMutation.mutate({
      quizId: currentQuiz.quizId,
      answers: answerArray,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Please Sign In</CardTitle>
            <CardDescription>You need to be signed in to use the quiz feature</CardDescription>
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
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Quiz Generator</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {step === "generate" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Generate AI Quiz
              </CardTitle>
              <CardDescription>
                Mr. T will create custom questions based on your topic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Photosynthesis, Algebra, Kenyan History"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="grade">Grade Level (Optional)</Label>
                <Select value={gradeLevel} onValueChange={setGradeLevel}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KG1">KG1</SelectItem>
                    <SelectItem value="KG2">KG2</SelectItem>
                    <SelectItem value="P1">Primary 1</SelectItem>
                    <SelectItem value="P2">Primary 2</SelectItem>
                    <SelectItem value="P3">Primary 3</SelectItem>
                    <SelectItem value="P4">Primary 4</SelectItem>
                    <SelectItem value="P5">Primary 5</SelectItem>
                    <SelectItem value="P6">Primary 6</SelectItem>
                    <SelectItem value="P7">Primary 7</SelectItem>
                    <SelectItem value="P8">Primary 8 (KCPE)</SelectItem>
                    <SelectItem value="F1">Form 1</SelectItem>
                    <SelectItem value="F2">Form 2</SelectItem>
                    <SelectItem value="F3">Form 3</SelectItem>
                    <SelectItem value="F4">Form 4 (KCSE)</SelectItem>
                    <SelectItem value="IGCSE">IGCSE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="count">Number of Questions</Label>
                <Input
                  id="count"
                  type="number"
                  min={1}
                  max={20}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 7)}
                  className="mt-2"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="w-full"
                size="lg"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Generate Quiz
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "taking" && currentQuiz && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quiz: {topic}</CardTitle>
                <CardDescription>
                  {currentQuiz.questions.length} questions • Answer all to get graded
                </CardDescription>
              </CardHeader>
            </Card>

            {currentQuiz.questions.map((q: any, idx: number) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {idx + 1}
                  </CardTitle>
                  <CardDescription className="text-base text-foreground mt-2">
                    {q.question}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {q.type === "mcq" && q.options ? (
                    <RadioGroup
                      value={answers[idx]}
                      onValueChange={(value) => setAnswers({ ...answers, [idx]: value })}
                    >
                      {q.options.map((option: string, optIdx: number) => (
                        <div key={optIdx} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`q${idx}-opt${optIdx}`} />
                          <Label htmlFor={`q${idx}-opt${optIdx}`} className="cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : q.type === "short" ? (
                    <Input
                      placeholder="Your answer..."
                      value={answers[idx] || ""}
                      onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                    />
                  ) : (
                    <Textarea
                      placeholder="Write your essay answer..."
                      value={answers[idx] || ""}
                      onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                      rows={6}
                    />
                  )}
                </CardContent>
              </Card>
            ))}

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("generate");
                  setCurrentQuiz(null);
                  setAnswers({});
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={gradeMutation.isPending}
                className="flex-1"
                size="lg"
              >
                {gradeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Grading...
                  </>
                ) : (
                  <>
                    <Trophy className="mr-2 h-4 w-4" />
                    Submit Quiz
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "results" && results && (
          <div className="space-y-6">
            <Card className="border-2 border-primary">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <Trophy className="h-16 w-16 text-primary mx-auto" />
                </div>
                <CardTitle className="text-3xl">
                  {results.percentage === 100 ? "Perfect Score! 🎉" : "Quiz Complete!"}
                </CardTitle>
                <CardDescription className="text-xl mt-2">
                  You scored {results.score} out of {results.totalPoints} ({Math.round(results.percentage)}%)
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-primary">+{results.xpEarned}</div>
                    <div className="text-sm text-muted-foreground">XP Earned</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary">+{results.coinsEarned}</div>
                    <div className="text-sm text-muted-foreground">Coins Earned</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent">Level {results.newLevel}</div>
                    <div className="text-sm text-muted-foreground">Current Level</div>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-lg font-medium text-primary">{results.message}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.feedback.map((f: any, idx: number) => (
                  <div key={idx} className={`p-4 rounded-lg border-2 ${f.correct ? 'border-primary bg-primary/5' : 'border-destructive bg-destructive/5'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium">Question {idx + 1}</div>
                      <div className={`font-bold ${f.correct ? 'text-primary' : 'text-destructive'}`}>
                        {f.points} / {currentQuiz?.questions[idx]?.points || 10} pts
                      </div>
                    </div>
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="font-medium">Your answer:</span> {f.userAnswer || "(No answer)"}
                      </div>
                      {!f.correct && (
                        <div>
                          <span className="font-medium">Correct answer:</span> {f.correctAnswer}
                        </div>
                      )}
                      {f.explanation && (
                        <div className="text-muted-foreground">
                          <span className="font-medium">Explanation:</span> {f.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">Back to Dashboard</Button>
              </Link>
              <Button
                onClick={() => {
                  setStep("generate");
                  setCurrentQuiz(null);
                  setAnswers({});
                  setResults(null);
                }}
                className="flex-1"
              >
                Generate Another Quiz
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

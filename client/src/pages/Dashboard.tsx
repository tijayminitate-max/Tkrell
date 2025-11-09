import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, Coins, Zap, BookOpen, Brain, Upload, MessageSquare, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: profile } = trpc.profile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: quizzes } = trpc.quiz.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: results } = trpc.results.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const coins = user?.coins || 0;
  const streak = user?.streak || 0;
  const xpForNextLevel = Math.pow(level, 2) * 100;
  const xpProgress = ((xp % xpForNextLevel) / xpForNextLevel) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Zap className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">Tkrell</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Hi, {user?.name}!</span>
            <ThemeToggle />
            <Button variant="ghost" onClick={() => setLocation("/")}>
              Home
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Gamification Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Level</CardTitle>
                <Trophy className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{level}</div>
              <Progress value={xpProgress} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {xp} / {xpForNextLevel} XP
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Streak</CardTitle>
                <Flame className="h-5 w-5 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{streak} 🔥</div>
              <p className="text-xs text-muted-foreground mt-1">
                {streak > 0 ? "Keep it going!" : "Start your streak today!"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Coins</CardTitle>
                <Coins className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{coins}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Earn more by completing quizzes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">XP Total</CardTitle>
                <Zap className="h-5 w-5 text-chart-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-4">{xp}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All-time experience points
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Setup */}
        {!profile && (
          <Card className="mb-8 border-2 border-primary">
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                Select your grade level to get personalized content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/profile">
                <Button>Set Up Profile</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/quiz">
              <Card className="cursor-pointer hover:border-primary transition-all hover:shadow-lg">
                <CardHeader>
                  <Brain className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-lg">Generate Quiz</CardTitle>
                  <CardDescription>Create AI-powered practice questions</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/upload">
              <Card className="cursor-pointer hover:border-secondary transition-all hover:shadow-lg">
                <CardHeader>
                  <Upload className="h-10 w-10 text-secondary mb-2" />
                  <CardTitle className="text-lg">Upload Notes</CardTitle>
                  <CardDescription>Get summaries and flashcards</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/chat">
              <Card className="cursor-pointer hover:border-primary transition-all hover:shadow-lg">
                <CardHeader>
                  <MessageSquare className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-lg">Chat with Mr. T</CardTitle>
                  <CardDescription>Ask your AI tutor anything</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/notes">
              <Card className="cursor-pointer hover:border-secondary transition-all hover:shadow-lg">
                <CardHeader>
                  <BookOpen className="h-10 w-10 text-secondary mb-2" />
                  <CardTitle className="text-lg">My Notes</CardTitle>
                  <CardDescription>View saved study materials</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Quizzes</h2>
            {quizzes && quizzes.length > 0 ? (
              <div className="space-y-3">
                {quizzes.slice(0, 5).map((quiz) => (
                  <Card key={quiz.id}>
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{quiz.topic}</CardTitle>
                          <CardDescription className="text-xs">
                            {new Date(quiz.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Link href={`/quiz/${quiz.id}`}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No quizzes yet. Generate your first one!</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Results</h2>
            {results && results.length > 0 ? (
              <div className="space-y-3">
                {results.slice(0, 5).map((result) => (
                  <Card key={result.id}>
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">
                            Score: {result.score}/{result.totalPoints}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            +{result.xpEarned} XP • {new Date(result.completedAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {Math.round((result.score / result.totalPoints) * 100)}%
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No results yet. Complete a quiz to see your progress!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trophy, Medal, Award, Crown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function Leaderboard() {
  const [county, setCounty] = useState("");
  const [school, setSchool] = useState("");

  const { data: leaderboard, isLoading } = trpc.leaderboard.get.useQuery({
    county: county || undefined,
    school: school || undefined,
    limit: 100,
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Leaderboard</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Top Students</h1>
          <p className="text-muted-foreground">
            See how you rank against other students in Kenya
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Leaderboard</CardTitle>
            <CardDescription>
              View rankings by county or school
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                placeholder="County (e.g., Nairobi)"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
              />
              <Input
                placeholder="School name"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              />
              <Button
                onClick={() => {
                  setCounty("");
                  setSchool("");
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </CardContent>
          </Card>
        ) : leaderboard && leaderboard.length > 0 ? (
          <div className="space-y-3">
            {leaderboard.map((entry, idx) => {
              const rank = idx + 1;
              const isTopThree = rank <= 3;

              return (
                <Card
                  key={entry.id}
                  className={`${
                    isTopThree
                      ? "border-2 border-primary bg-primary/5"
                      : ""
                  }`}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 flex items-center justify-center">
                        {getRankIcon(rank)}
                      </div>

                      <div className="flex-1">
                        <div className="font-semibold text-lg">
                          {entry.userName || "Anonymous"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {entry.school && `${entry.school} • `}
                          {entry.county || "Kenya"}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {entry.xp.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">XP</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No rankings yet</h3>
              <p className="text-muted-foreground mb-4">
                {county || school
                  ? "No students found with these filters"
                  : "Be the first to appear on the leaderboard!"}
              </p>
              <Link href="/quiz">
                <Button>Start a Quiz</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

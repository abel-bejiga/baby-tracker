"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedHamburger } from "@/components/ui/animated-hamburger";
import {
  Trophy,
  Star,
  TrendingUp,
  Calendar,
  Target,
  Award,
  Crown,
  Medal,
  User,
  LogOut,
  Baby,
  Home,
  BarChart3,
  CalendarDays,
  ClipboardList,
  SquareCheck
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

interface LeaderboardUser {
  id: string;
  displayName: string;
  score: number;
  rank: number;
  memberSince: string;
}

interface UserStats {
  totalScore: number;
  activityCount: number;
  completedTodos: number;
  totalTodos: number;
  todoCompletionRate: number;
}

interface ScoreHistory {
  id: string;
  score: number;
  reason: string;
  metadata: any;
  timestamp: string;
}

export default function LeaderboardPage() {
  const [user, setUser] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchLeaderboard();
        fetchUserStats();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/scoring/leaderboard');
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/scoring/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUserStats(data.stats);
        setScoreHistory(data.scoreHistory);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleDailySignIn = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/scoring/daily-signin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchUserStats();
        fetchLeaderboard();
      }
    } catch (error) {
      console.error('Error with daily sign-in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Award className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getUserInitials = (displayName: string) => {
    if (!displayName) return 'A';
    return displayName.charAt(0).toUpperCase();
  };

  if (!user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Please sign in to view the leaderboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 animate-spin" />
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(120,119,198,0.1),transparent_50%)]"></div>

      {/* Fixed Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AnimatedHamburger
              isOpen={isSidebarOpen}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden"
            />
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <h1 className="md:text-2xl text-xl max-lg:!hidden font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Leaderboard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleDailySignIn}
              size="sm"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Star className="mr-2 h-4 w-4" />
              Daily Check-in
            </Button>
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {getUserInitials(user.displayName || '')}
                </span>
              </div>
            </div>
            <AnimatedHamburger
              isOpen={isSidebarOpen}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:flex"
            />
          </div>
        </div>
      </motion.header>

      {/* Sidebar */}
      <motion.div
        initial={{ x: 300 }}
        animate={{ x: isSidebarOpen ? 0 : 300 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 right-0 h-full w-80 bg-background/95 backdrop-blur-xl border-l border-border/40 z-50 shadow-2xl rounded-full"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Baby className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Baby Tracker
              </h2>
            </div>
          </div>

          <nav className="space-y-2">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="mr-3 h-5 w-5" />
                Home
              </Button>
            </Link>
            <Link href="/summary">
              <Button variant="ghost" className="w-full justify-start">
                <BarChart3 className="mr-3 h-5 w-5" />
                Summary
              </Button>
            </Link>
            <Link href="/activities">
              <Button variant="ghost" className="w-full justify-start">
                <ClipboardList className="mr-3 h-5 w-5" />
                Activities
              </Button>
            </Link>
            <Link href="/appointments">
              <Button variant="ghost" className="w-full justify-start">
                <CalendarDays className="mr-3 h-5 w-5" />
                Appointments
              </Button>
            </Link>
            <Link href="/todo">
              <Button variant="ghost" className="w-full justify-start">
                <SquareCheck className="mr-3 h-5 w-5" />
                To-Do List
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="ghost" className="w-full justify-start bg-blue-100 text-blue-800">
                <Trophy className="mr-3 h-5 w-5" />
                Leaderboard
              </Button>
            </Link>
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Overlay */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="container mx-auto px-4 pt-20 pb-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Stats Card */}
          <div className="lg:col-span-1">
            <Card className="bg-background/60 backdrop-blur-sm border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userStats && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Score</span>
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {userStats.totalScore} pts
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Activities</span>
                      <span className="font-medium">{userStats.activityCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Completed Todos</span>
                      <span className="font-medium">{userStats.completedTodos}/{userStats.totalTodos}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Completion Rate</span>
                      <span className="font-medium">{userStats.todoCompletionRate.toFixed(1)}%</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-background/60 backdrop-blur-sm border-border/40 mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scoreHistory.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground capitalize">
                        {item.reason.replace('_', ' ')}
                      </span>
                      <Badge variant="secondary">+{item.score}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <Card className="bg-background/60 backdrop-blur-sm border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top Performers
                </CardTitle>
                <CardDescription>
                  Users with the highest scores across all activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-background/40 border border-border/20 hover:bg-background/60 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8">
                          {getRankIcon(user.rank)}
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{user.displayName}</p>
                          <p className="text-sm text-muted-foreground">
                            Rank #{user.rank}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getRankBadgeColor(user.rank)}>
                          {user.score} pts
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
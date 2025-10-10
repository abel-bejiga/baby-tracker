import { db } from '@/lib/db';

export interface ScoringConfig {
  activityPoints: {
    feeding: number;
    sleep: number;
    diaper: number;
    poop: number;
    doctor: number;
    temperature: number;
    medication: number;
    vaccination: number;
    milestone: number;
    growth: number;
  };
  todoPoints: {
    low: number;
    medium: number;
    high: number;
  };
  dailySignInPoints: number;
}

export const DEFAULT_SCORING: ScoringConfig = {
  activityPoints: {
    feeding: 5,
    sleep: 5,
    diaper: 3,
    poop: 3,
    doctor: 10,
    temperature: 8,
    medication: 8,
    vaccination: 15,
    milestone: 20,
    growth: 10,
  },
  todoPoints: {
    low: 3,
    medium: 5,
    high: 8,
  },
  dailySignInPoints: 2,
};

export class ScoringService {
  private config: ScoringConfig;

  constructor(config: ScoringConfig = DEFAULT_SCORING) {
    this.config = config;
  }

  async awardPoints(userId: string, points: number, reason: string, metadata?: any) {
    try {
      // Add to user scores
      await db.userScore.create({
        data: {
          userId,
          score: points,
          reason,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });

      // Update user total score
      await db.user.update({
        where: { id: userId },
        data: {
          score: {
            increment: points,
          },
        },
      });

      return { success: true, points };
    } catch (error) {
      console.error('Error awarding points:', error);
      return { success: false, error };
    }
  }

  async awardActivityPoints(userId: string, activityType: string) {
    const points = this.config.activityPoints[activityType as keyof typeof this.config.activityPoints] || 1;
    return this.awardPoints(userId, points, 'activity_logged', { activityType });
  }

  async awardTodoPoints(userId: string, priority: string) {
    const points = this.config.todoPoints[priority as keyof typeof this.config.todoPoints] || 1;
    return this.awardPoints(userId, points, 'todo_completed', { priority });
  }

  async awardDailySignInPoints(userId: string) {
    // Check if user already signed in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingSignIn = await db.userScore.findFirst({
      where: {
        userId,
        reason: 'daily_signin',
        createdAt: {
          gte: today,
        },
      },
    });

    if (existingSignIn) {
      return { success: false, message: 'Already signed in today' };
    }

    return this.awardPoints(userId, this.config.dailySignInPoints, 'daily_signin');
  }

  async getLeaderboard(minScore: number = 10) {
    const users = await db.user.findMany({
      where: {
        score: {
          gte: minScore,
        },
      },
      select: {
        id: true,
        displayName: true,
        showName: true,
        score: true,
        createdAt: true,
      },
      orderBy: {
        score: 'desc',
      },
      take: 50, // Limit to top 50 users
    });

    // Format user names for privacy
    return users.map(user => ({
      id: user.id,
      displayName: this.formatUserName(user.displayName, user.showName),
      score: user.score,
      rank: 0, // Will be set below
      memberSince: user.createdAt,
    })).map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  }

  async getUserScoreHistory(userId: string, limit: number = 20) {
    const scores = await db.userScore.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return scores.map(score => ({
      id: score.id,
      score: score.score,
      reason: score.reason,
      metadata: score.metadata ? JSON.parse(score.metadata) : null,
      timestamp: score.createdAt,
    }));
  }

  async getUserStats(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { score: true },
    });

    const activityCount = await db.babyActivity.count({
      where: { userId },
    });

    const completedTodos = await db.todo.count({
      where: { userId, completed: true },
    });

    const totalTodos = await db.todo.count({
      where: { userId },
    });

    return {
      totalScore: user?.score || 0,
      activityCount,
      completedTodos,
      totalTodos,
      todoCompletionRate: totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0,
    };
  }

  private formatUserName(displayName: string | null, showName: boolean): string {
    if (!showName || !displayName) {
      return 'Anonymous';
    }

    const names = displayName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase() + '.';
    }

    const firstName = names[0];
    const lastName = names[names.length - 1];
    const lastInitial = lastName.charAt(0).toUpperCase();

    return `${firstName} ${lastInitial}.`;
  }
}

export const scoringService = new ScoringService();
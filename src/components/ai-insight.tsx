'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IOSCard, IOSCardHeader, IOSCardTitle, IOSCardContent } from '@/components/ui/ios-card';
import { Brain, TrendingUp, AlertTriangle, Clock, Milk, Moon, Activity } from 'lucide-react';
// import ZAI from 'z-ai-web-dev-sdk';

interface Activity {
    id: string;
    type: 'feeding' | 'sleep' | 'diaper' | 'poop' | 'doctor' | 'temperature' | 'medication' | 'vaccination' | 'milestone' | 'growth' | 'symptoms';
    timestamp: Date;
    details: any;
}

interface AIInsight {
    id: string;
    type: 'prediction' | 'pattern' | 'suggestion' | 'alert';
    title: string;
    description: string;
    confidence: number;
    relatedActivities: string[];
    createdAt: Date;
}

interface AIInsightsProps {
    activities: Activity[];
    babyId: string;
}

export default function AIInsights({ activities, babyId }: AIInsightsProps) {
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);

    useEffect(() => {
        analyzeActivities();
    }, [activities]);

    const analyzeActivities = async () => {
        if (activities.length < 5) return; // Need enough data to analyze

        setLoading(true);
        try {
            // Mock insights for demo purposes since ZAI SDK is server-side only
            const mockInsights = [
                {
                    type: 'prediction',
                    title: 'Sleep Pattern Detected',
                    description: 'Based on recent activity, your baby may be ready for sleep around 7:00 PM tonight.',
                    confidence: 0.85,
                    relatedActivities: ['sleep']
                },
                {
                    type: 'suggestion',
                    title: 'Feeding Schedule',
                    description: 'Consider establishing a more consistent feeding schedule every 3-4 hours during the day.',
                    confidence: 0.72,
                    relatedActivities: ['feeding']
                }
            ];

            const newInsights: AIInsight[] = mockInsights.map((insight: any, index: number) => ({
                id: `insight-${Date.now()}-${index}`,
                type: insight.type,
                title: insight.title,
                description: insight.description,
                confidence: insight.confidence,
                relatedActivities: insight.relatedActivities || [],
                createdAt: new Date()
            }));

            setInsights(newInsights);
            setLastAnalyzed(new Date());
        } catch (error) {
            console.error('Error analyzing activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateAverageFeedInterval = (activities: Activity[]) => {
        const feedings = activities.filter(a => a.type === 'feeding').sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        if (feedings.length < 2) return 0;

        const intervals: number[] = [];
        for (let i = 1; i < feedings.length; i++) {
            const interval = new Date(feedings[i].timestamp).getTime() - new Date(feedings[i - 1].timestamp).getTime();
            intervals.push(interval / (1000 * 60 * 60)); // Convert to hours
        }

        return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    };

    const analyzeSleepPattern = (activities: Activity[]) => {
        const sleepSessions = activities.filter(a => a.type === 'sleep');
        // Simple sleep pattern analysis
        return {
            averageDuration: sleepSessions.reduce((sum, s) => sum + (parseFloat(s.details.duration) || 0), 0) / sleepSessions.length,
            totalSleep: sleepSessions.reduce((sum, s) => sum + (parseFloat(s.details.duration) || 0), 0)
        };
    };

    const analyzeFeedingPattern = (activities: Activity[]) => {
        const feedings = activities.filter(a => a.type === 'feeding');
        return {
            averageAmount: feedings.reduce((sum, f) => sum + (parseFloat(f.details.amount) || 0), 0) / feedings.length,
            totalFeedings: feedings.length
        };
    };

    const getInsightIcon = (type: string) => {
        switch (type) {
            case 'prediction': return <Clock className="h-4 w-4" />;
            case 'pattern': return <TrendingUp className="h-4 w-4" />;
            case 'suggestion': return <Brain className="h-4 w-4" />;
            case 'alert': return <AlertTriangle className="h-4 w-4" />;
            default: return <Brain className="h-4 w-4" />;
        }
    };

    const getInsightColor = (type: string) => {
        switch (type) {
            case 'prediction': return 'bg-blue-500';
            case 'pattern': return 'bg-green-500';
            case 'suggestion': return 'bg-purple-500';
            case 'alert': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'feeding': return <Milk className="h-3 w-3" />;
            case 'sleep': return <Moon className="h-3 w-3" />;
            case 'diaper': return <Activity className="h-3 w-3" />;
            default: return <Activity className="h-3 w-3" />;
        }
    };

    return (
        <IOSCard variant="glass" intensity="medium">
            <IOSCardHeader>
                <IOSCardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Brain className="h-5 w-5" />
                        <span>AI Insights</span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={analyzeActivities}
                        disabled={loading || activities.length < 5}
                    >
                        {loading ? 'Analyzing...' : 'Refresh'}
                    </Button>
                </IOSCardTitle>
            </IOSCardHeader>
            <IOSCardContent>
                <div className="space-y-4">
                    {activities.length < 5 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Add more activities to get AI insights</p>
                            <p className="text-sm mt-2">Need at least 5 activities</p>
                        </div>
                    ) : insights.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No insights available yet</p>
                            <p className="text-sm mt-2">Click refresh to analyze activities</p>
                        </div>
                    ) : (
                        insights.map((insight) => (
                            <div key={insight.id} className="p-4 rounded-lg bg-background/40 border-l-4 border-l-blue-500">
                                <div className="flex items-start space-x-3">
                                    <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                                        {getInsightIcon(insight.type)}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-sm">{insight.title}</h4>
                                            <Badge variant="secondary" className="text-xs">
                                                {Math.round(insight.confidence * 100)}% confidence
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                                        {insight.relatedActivities.length > 0 && (
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs text-muted-foreground">Related to:</span>
                                                {insight.relatedActivities.map((activity, index) => (
                                                    <div key={index} className="flex items-center space-x-1">
                                                        {getActivityIcon(activity)}
                                                        <span className="text-xs">{activity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {lastAnalyzed && (
                        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/20">
                            Last analyzed: {lastAnalyzed.toLocaleString()}
                        </div>
                    )}
                </div>
            </IOSCardContent>
        </IOSCard>
    );
}
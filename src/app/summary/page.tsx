"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Baby,
  Moon,
  Stethoscope,
  Clock,
  Activity,
  AlertCircle,
  Milk,
  Calendar as CalendarIcon,
  BarChart3,
  List,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface BabyActivity {
  id: string;
  type: 'feeding' | 'sleep' | 'diaper' | 'poop' | 'doctor';
  timestamp: Date;
  details: any;
  userId: string;
}

interface ActivitySummary {
  date: Date;
  activities: BabyActivity[];
}

export default function SummaryPage() {
  const [user, setUser] = useState<any>(null);
  const [activities, setActivities] = useState<BabyActivity[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchActivities(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchActivities = async (userId: string) => {
    const q = query(collection(db, "users", userId, "activities"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const activitiesData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    })) as BabyActivity[];
    setActivities(activitiesData);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'feeding': return <Milk className="h-4 w-4" />;
      case 'sleep': return <Moon className="h-4 w-4" />;
      case 'diaper': return <Activity className="h-4 w-4" />;
      case 'poop': return <AlertCircle className="h-4 w-4" />;
      case 'doctor': return <Stethoscope className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'feeding': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'sleep': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'diaper': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'poop': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'doctor': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getActivitiesByDate = () => {
    const grouped: { [key: string]: BabyActivity[] } = {};
    
    activities.forEach(activity => {
      const dateKey = activity.timestamp.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(activity);
    });

    return Object.entries(grouped).map(([dateKey, activities]) => ({
      date: new Date(dateKey),
      activities
    })).sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const getDayActivities = (date: Date) => {
    return activities.filter(activity => 
      activity.timestamp.toDateString() === date.toDateString()
    );
  };

  const getDayActivityTypes = (date: Date) => {
    const dayActivities = getDayActivities(date);
    return dayActivities.map(activity => activity.type);
  };

  const toggleDateExpansion = (dateKey: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(dateKey)) {
      newExpanded.delete(dateKey);
    } else {
      newExpanded.add(dateKey);
    }
    setExpandedDates(newExpanded);
  };

  const getCalendarModifiers = () => {
    const modifiers: { [key: string]: Date[] } = {};
    
    activities.forEach(activity => {
      const date = activity.timestamp;
      const type = activity.type;
      
      if (!modifiers[type]) {
        modifiers[type] = [];
      }
      modifiers[type].push(date);
    });

    return modifiers;
  };

  const modifiersStyles = {
    feeding: { backgroundColor: 'rgb(219, 234, 254)' },
    sleep: { backgroundColor: 'rgb(233, 213, 255)' },
    diaper: { backgroundColor: 'rgb(220, 252, 231)' },
    poop: { backgroundColor: 'rgb(254, 243, 199)' },
    doctor: { backgroundColor: 'rgb(254, 226, 226)' },
  };

  const formatActivityDetails = (activity: BabyActivity) => {
    switch (activity.type) {
      case 'feeding':
        return `${activity.details.amount} oz`;
      case 'sleep':
        return `${activity.details.duration} hours`;
      case 'diaper':
        return activity.details.type;
      case 'poop':
        return activity.details.consistency;
      case 'doctor':
        return activity.details.appointmentType;
      default:
        return '';
    }
  };

  if (!user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Please sign in to view your summary.</p>
        </div>
      </div>
    );
  }

  const activitiesByDate = getActivitiesByDate();
  const calendarModifiers = getCalendarModifiers();

  return (
    <div className="min-h-[100dvh] relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(120,119,198,0.1),transparent_50%)]"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Summary
                </h1>
                <p className="text-muted-foreground">Track your baby's activities over time</p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value: 'calendar' | 'list') => value && setViewMode(value)}
              className="bg-background/60 backdrop-blur-sm border-border/40"
            >
              <ToggleGroupItem value="calendar" aria-label="Calendar view">
                <CalendarIcon className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { type: 'feeding', icon: Milk, label: 'Feeding', count: activities.filter(a => a.type === 'feeding').length, color: 'bg-blue-100 text-blue-800' },
              { type: 'sleep', icon: Moon, label: 'Sleep', count: activities.filter(a => a.type === 'sleep').length, color: 'bg-purple-100 text-purple-800' },
              { type: 'diaper', icon: Activity, label: 'Diaper', count: activities.filter(a => a.type === 'diaper').length, color: 'bg-green-100 text-green-800' },
              { type: 'poop', icon: AlertCircle, label: 'Poop', count: activities.filter(a => a.type === 'poop').length, color: 'bg-yellow-100 text-yellow-800' },
              { type: 'doctor', icon: Stethoscope, label: 'Doctor', count: activities.filter(a => a.type === 'doctor').length, color: 'bg-red-100 text-red-800' },
            ].map((stat) => (
              <motion.div
                key={stat.type}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 * ['feeding', 'sleep', 'diaper', 'poop', 'doctor'].indexOf(stat.type) }}
              >
                <Card className="bg-background/60 backdrop-blur-sm border-border/40">
                  <CardContent className="p-4 text-center">
                    <stat.icon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <div className={`text-2xl font-bold mb-1 ${stat.color.split(' ')[0]} ${stat.color.split(' ')[1]}`}>
                      {stat.count}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Content */}
          {viewMode === 'calendar' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calendar */}
              <Card className="bg-background/60 backdrop-blur-sm border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5" />
                    <span>Activity Calendar</span>
                  </CardTitle>
                  <CardDescription>
                    Click on dates to see activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                    modifiers={calendarModifiers}
                    modifiersStyles={modifiersStyles}
                  />
                  
                  {/* Legend */}
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-sm">Activity Types:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { type: 'feeding', label: 'Feeding', color: 'bg-blue-100' },
                        { type: 'sleep', label: 'Sleep', color: 'bg-purple-100' },
                        { type: 'diaper', label: 'Diaper', color: 'bg-green-100' },
                        { type: 'poop', label: 'Poop', color: 'bg-yellow-100' },
                        { type: 'doctor', label: 'Doctor', color: 'bg-red-100' },
                      ].map((item) => (
                        <div key={item.type} className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded ${item.color}`}></div>
                          <span className="text-xs">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Date Activities */}
              <Card className="bg-background/60 backdrop-blur-sm border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>
                      Activities for {selectedDate.toLocaleDateString()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {getDayActivities(selectedDate).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No activities recorded for this date</p>
                      </div>
                    ) : (
                      getDayActivities(selectedDate).map((activity) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-start space-x-3 p-3 rounded-lg border border-border/40 bg-background/40"
                        >
                          <div className="p-2 rounded-lg bg-background mt-1">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge className={getActivityColor(activity.type)}>
                                {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {activity.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm font-medium">{formatActivityDetails(activity)}</p>
                            {activity.details.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{activity.details.notes}</p>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* List View */
            <Card className="bg-background/60 backdrop-blur-sm border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <List className="h-5 w-5" />
                  <span>Activities by Date</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {activitiesByDate.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No activities yet. Start tracking your baby's activities!</p>
                    </div>
                  ) : (
                    activitiesByDate.map((dayData) => {
                      const dateKey = dayData.date.toDateString();
                      const isExpanded = expandedDates.has(dateKey);
                      
                      return (
                        <motion.div
                          key={dateKey}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border border-border/40 rounded-lg bg-background/40"
                        >
                          <button
                            onClick={() => toggleDateExpansion(dateKey)}
                            className="w-full p-4 text-left flex items-center justify-between hover:bg-background/60 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex space-x-1">
                                {Array.from(new Set(dayData.activities.map(a => a.type))).map((type) => (
                                  <div key={type} className={`w-3 h-3 rounded ${
                                    type === 'feeding' ? 'bg-blue-400' :
                                    type === 'sleep' ? 'bg-purple-400' :
                                    type === 'diaper' ? 'bg-green-400' :
                                    type === 'poop' ? 'bg-yellow-400' :
                                    'bg-red-400'
                                  }`}></div>
                                ))}
                              </div>
                              <div>
                                <h3 className="font-medium">
                                  {dayData.date.toLocaleDateString()}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {dayData.activities.length} activities
                                </p>
                              </div>
                            </div>
                            <ChevronRight 
                              className={`h-4 w-4 transition-transform ${
                                isExpanded ? 'rotate-90' : ''
                              }`} 
                            />
                          </button>
                          
                          {isExpanded && (
                            <div className="px-4 pb-4 space-y-2">
                              {dayData.activities.map((activity) => (
                                <div
                                  key={activity.id}
                                  className="flex items-start space-x-3 p-3 rounded-lg bg-background/60"
                                >
                                  <div className="p-2 rounded-lg bg-background">
                                    {getActivityIcon(activity.type)}
                                  </div>
                                  <div className="flex-grow">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <Badge className={getActivityColor(activity.type)}>
                                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">
                                        {activity.timestamp.toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <p className="text-sm font-medium">{formatActivityDetails(activity)}</p>
                                    {activity.details.notes && (
                                      <p className="text-xs text-muted-foreground mt-1">{activity.details.notes}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
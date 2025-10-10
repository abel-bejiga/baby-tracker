"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Baby,
  Moon,
  Stethoscope,
  Clock,
  Activity,
  AlertCircle,
  Milk,
  Plus,
  Edit,
  X,
  CalendarPlus
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addToAppleCalendar, createDoctorAppointmentEvent } from "@/lib/calendar";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface BabyActivity {
  id: string;
  type: 'feeding' | 'sleep' | 'diaper' | 'poop' | 'doctor';
  timestamp: Date;
  details: any;
  userId: string;
}

export default function ActivitiesPage() {
  const [user, setUser] = useState<any>(null);
  const [activities, setActivities] = useState<BabyActivity[]>([]);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const { toast } = useToast();

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

  const deleteActivity = async (id: string) => {
    try {
      const activityToDelete = activities.find(a => a.id === id);
      await deleteDoc(doc(db, "users", user.uid, "activities", id));
      setActivities(prev => prev.filter(activity => activity.id !== id));
      
      // Show success toast
      if (activityToDelete) {
        toast({
          title: "Success!",
          description: `${activityToDelete.type.charAt(0).toUpperCase() + activityToDelete.type.slice(1)} entry deleted successfully.`,
        });
      }
    } catch (error) {
      console.error("Error deleting activity: ", error);
      toast({
        title: "Error",
        description: "Failed to delete activity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'feeding': return <Milk className="h-5 w-5" />;
      case 'sleep': return <Moon className="h-5 w-5" />;
      case 'diaper': return <Activity className="h-5 w-5" />;
      case 'poop': return <AlertCircle className="h-5 w-5" />;
      case 'doctor': return <Stethoscope className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
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

  const addToCalendar = (activity: BabyActivity) => {
    if (activity.type === 'doctor') {
      try {
        const calendarEvent = createDoctorAppointmentEvent(activity.details);
        addToAppleCalendar(calendarEvent);
        toast({
          title: "Calendar Added!",
          description: "Doctor appointment added to Apple Calendar.",
        });
      } catch (error) {
        console.error("Error adding to calendar:", error);
        toast({
          title: "Calendar Error",
          description: "Failed to add to Apple Calendar. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const formatActivityDetails = (activity: BabyActivity) => {
    switch (activity.type) {
      case 'feeding':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Milk className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{activity.details.amount} oz</span>
            </div>
            {activity.details.notes && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Notes:</p>
                <p>{activity.details.notes}</p>
              </div>
            )}
          </div>
        );
      case 'sleep':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-purple-500" />
              <span className="font-medium">{activity.details.duration} hours</span>
            </div>
            {activity.details.notes && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Notes:</p>
                <p>{activity.details.notes}</p>
              </div>
            )}
          </div>
        );
      case 'diaper':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="font-medium capitalize">{activity.details.type}</span>
            </div>
            {activity.details.notes && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Notes:</p>
                <p>{activity.details.notes}</p>
              </div>
            )}
          </div>
        );
      case 'poop':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="font-medium capitalize">{activity.details.consistency}</span>
            </div>
            {activity.details.notes && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Notes:</p>
                <p>{activity.details.notes}</p>
              </div>
            )}
          </div>
        );
      case 'doctor':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-red-500" />
              <span className="font-medium">{activity.details.appointmentType}</span>
            </div>
            {activity.details.date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarPlus className="h-3 w-3" />
                <span>{new Date(activity.details.date).toLocaleString()}</span>
              </div>
            )}
            {activity.details.notes && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Doctor Notes:</p>
                <p>{activity.details.notes}</p>
              </div>
            )}
            {activity.details.questions && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Questions:</p>
                <p>{activity.details.questions}</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const groupActivitiesByType = () => {
    const grouped: { [key: string]: BabyActivity[] } = {
      feeding: [],
      sleep: [],
      diaper: [],
      poop: [],
      doctor: []
    };

    activities.forEach(activity => {
      if (grouped[activity.type]) {
        grouped[activity.type].push(activity);
      }
    });

    // Sort each group by timestamp (newest first)
    Object.keys(grouped).forEach(type => {
      grouped[type].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    });

    return grouped;
  };

  if (!user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Please sign in to view your activities.</p>
        </div>
      </div>
    );
  }

  const groupedActivities = groupActivitiesByType();

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
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Activities
                </h1>
                <p className="text-muted-foreground">View and manage all your baby's activities</p>
              </div>
            </div>

            <Link href="/">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Activity
              </Button>
            </Link>
          </div>

          {/* Activity Groups */}
          <div className="space-y-8">
            {Object.entries(groupedActivities).map(([type, typeActivities]) => (
              typeActivities.length > 0 && (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * ['feeding', 'sleep', 'diaper', 'poop', 'doctor'].indexOf(type) }}
                >
                  <Card className="bg-background/60 backdrop-blur-sm border-border/40">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                          {getActivityIcon(type)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="capitalize">{type}</span>
                          <Badge variant="secondary">{typeActivities.length}</Badge>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        {type === 'feeding' && 'Feeding sessions and amounts'}
                        {type === 'sleep' && 'Sleep patterns and durations'}
                        {type === 'diaper' && 'Diaper change records'}
                        {type === 'poop' && 'Bowel movement tracking'}
                        {type === 'doctor' && 'Medical appointments and notes'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {typeActivities.map((activity) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border border-border/40 rounded-lg bg-background/40 overflow-hidden"
                          >
                            <div className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-grow">
                                  <div className="p-2 rounded-lg bg-background mt-1">
                                    {getActivityIcon(activity.type)}
                                  </div>
                                  <div className="flex-grow">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Badge className={getActivityColor(activity.type)}>
                                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">
                                        {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                                      </span>
                                    </div>
                                    {formatActivityDetails(activity)}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  {activity.type === 'doctor' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => addToCalendar(activity)}
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                      title="Add to Apple Calendar"
                                    >
                                      <CalendarPlus className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Link href={`/activities/${activity.id}`}>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteActivity(activity.id)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Expand/Collapse Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedActivity(
                                  expandedActivity === activity.id ? null : activity.id
                                )}
                                className="mt-3 w-full justify-start text-muted-foreground hover:text-foreground"
                              >
                                {expandedActivity === activity.id ? 'Show Less' : 'Show Details'}
                              </Button>
                              
                              {/* Expanded Details */}
                              {expandedActivity === activity.id && (
                                <div className="mt-4 p-4 bg-background/60 rounded-lg border border-border/40">
                                  <h4 className="font-medium mb-3">Full Details</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium text-muted-foreground">Type:</span>
                                      <span className="ml-2 capitalize">{activity.type}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">Date:</span>
                                      <span className="ml-2">{activity.timestamp.toLocaleString()}</span>
                                    </div>
                                    {activity.details.amount && (
                                      <div>
                                        <span className="font-medium text-muted-foreground">Amount:</span>
                                        <span className="ml-2">{activity.details.amount} oz</span>
                                      </div>
                                    )}
                                    {activity.details.duration && (
                                      <div>
                                        <span className="font-medium text-muted-foreground">Duration:</span>
                                        <span className="ml-2">{activity.details.duration} hours</span>
                                      </div>
                                    )}
                                    {activity.details.type && (
                                      <div>
                                        <span className="font-medium text-muted-foreground">Type:</span>
                                        <span className="ml-2 capitalize">{activity.details.type}</span>
                                      </div>
                                    )}
                                    {activity.details.consistency && (
                                      <div>
                                        <span className="font-medium text-muted-foreground">Consistency:</span>
                                        <span className="ml-2 capitalize">{activity.details.consistency}</span>
                                      </div>
                                    )}
                                    {activity.details.appointmentType && (
                                      <div>
                                        <span className="font-medium text-muted-foreground">Appointment Type:</span>
                                        <span className="ml-2">{activity.details.appointmentType}</span>
                                      </div>
                                    )}
                                    {activity.details.date && (
                                      <div>
                                        <span className="font-medium text-muted-foreground">Appointment Date:</span>
                                        <span className="ml-2">{new Date(activity.details.date).toLocaleString()}</span>
                                      </div>
                                    )}
                                  </div>
                                  {activity.details.notes && (
                                    <div className="mt-4">
                                      <span className="font-medium text-muted-foreground">Notes:</span>
                                      <p className="mt-1 text-sm">{activity.details.notes}</p>
                                    </div>
                                  )}
                                  {activity.details.questions && (
                                    <div className="mt-4">
                                      <span className="font-medium text-muted-foreground">Questions:</span>
                                      <p className="mt-1 text-sm">{activity.details.questions}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            ))}
          </div>

          {/* Empty State */}
          {activities.length === 0 && (
            <Card className="bg-background/60 backdrop-blur-sm border-border/40">
              <CardContent className="text-center py-12">
                <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No activities yet</h3>
                <p className="text-muted-foreground mb-6">Start tracking your baby's activities to see them here</p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Activity
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
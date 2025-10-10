"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Baby,
  Moon,
  Stethoscope,
  Clock,
  Plus,
  History,
  User,
  LogOut,
  Heart,
  Activity,
  Calendar,
  CheckCircle,
  AlertCircle,
  Milk,
  CircleCheck
} from "lucide-react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface BabyActivity {
  id: string;
  type: 'feeding' | 'sleep' | 'diaper' | 'poop' | 'doctor';
  timestamp: Date;
  details: any;
  userId: string;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [activities, setActivities] = useState<BabyActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form states
  const [feedingData, setFeedingData] = useState({ amount: '', notes: '' });
  const [sleepData, setSleepData] = useState({ duration: '', notes: '' });
  const [diaperData, setDiaperData] = useState({ type: '', notes: '' });
  const [poopData, setPoopData] = useState({ consistency: '', notes: '' });
  const [doctorData, setDoctorData] = useState({
    appointmentType: '',
    notes: '',
    questions: '',
    date: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
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

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setActivities([]);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const addActivity = async (type: string, data: any) => {
    if (!user) return;

    try {
      const docRef = await addDoc(collection(db, "users", user.uid, "activities"), {
        type,
        userId: user.uid,
        timestamp: new Date(),
        details: data
      });

      setActivities(prev => [{
        id: docRef.id,
        type: type as any,
        userId: user.uid,
        timestamp: new Date(),
        details: data
      }, ...prev]);

      setIsDialogOpen(false);
      // Reset form data
      setFeedingData({ amount: '', notes: '' });
      setSleepData({ duration: '', notes: '' });
      setDiaperData({ type: '', notes: '' });
      setPoopData({ consistency: '', notes: '' });
      setDoctorData({ appointmentType: '', notes: '', questions: '', date: '' });
    } catch (error) {
      console.error("Error adding activity: ", error);
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "activities", id));
      setActivities(prev => prev.filter(activity => activity.id !== id));
    } catch (error) {
      console.error("Error deleting activity: ", error);
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


  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(120,119,198,0.1),transparent_50%)]"></div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Baby className="h-10 w-10 text-white" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-4xl max-xl:hidden font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              Baby Tracker
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-lg text-muted-foreground mb-8"
            >
              Track your baby's growth and development with ease
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Button
                onClick={handleGoogleSignIn}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <User className="mr-2 h-5 w-5" />
                Sign in with Google
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(120,119,198,0.1),transparent_50%)]"></div>

      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border-b border-border/40 bg-background/80 backdrop-blur-lg"
        >
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Baby className="h-5 w-5 text-white" />
              </div>
              <h1 className="md:text-2xl text-xl max-lg:!hidden font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Baby Tracker
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Welcome, {user.displayName}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity Cards */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {[
                    { type: 'feeding', icon: Milk, title: 'Feeding', description: 'Track feeding time and amount' },
                    { type: 'sleep', icon: Moon, title: 'Sleep', description: 'Monitor sleep patterns' },
                    { type: 'diaper', icon: Activity, title: 'Diaper Change', description: 'Log diaper changes' },
                    { type: 'poop', icon: AlertCircle, title: 'Poop Time', description: 'Track bowel movements' },
                    { type: 'doctor', icon: Stethoscope, title: 'Doctor', description: 'Appointments & notes' },
                  ].map((activity, index) => (
                    <motion.div
                      key={activity.type}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className="group"
                    >
                      <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-border/40 bg-background/60 backdrop-blur-sm"
                        onClick={() => {
                          setSelectedActivity(activity.type);
                          setIsDialogOpen(true);
                        }}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                              <Activity className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{activity.title}</CardTitle>
                              <CardDescription className="text-sm">
                                {activity.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-600 group-hover:text-white transition-all duration-300"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Entry
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Activities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="bg-background/60 backdrop-blur-sm border-border/40">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <History className="h-5 w-5" />
                      <span>Recent Activities</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {activities.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No activities yet. Start tracking your baby's activities!</p>
                        </div>
                      ) : (
                        activities.map((activity) => {
                          const slicedNotes =
                            activity?.details?.notes
                              ? (activity.details.notes as string)
                                .split("-")
                                .map(s => s.trim())
                                .filter(s => s)
                              : [];

                          const slicedQuestions =
                            activity?.details?.questions
                              ? (activity.details.questions as string)
                                .split("-")
                                .map(s => s.trim())
                                .filter(s => s)
                              : [];

                          return (
                            <motion.div
                              key={activity.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-background/40"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-background">
                                  {getActivityIcon(activity.type)}
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <Badge className={getActivityColor(activity.type)}>
                                      {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                                    </span>
                                  </div>

                                  <div className="mb-2">
                                    <p className="text-sm text-muted-foreground mt-1 font-bold">Notes</p>
                                    <ul>
                                      {activity.details.notes && (slicedNotes?.map((item, i) => (
                                        item !== " " &&
                                        <li key={i} className="text-sm list-disc text-muted-foreground mt-1 pl-3 flex items-center gap-2">
                                          <CircleCheck className="w-4 h-4" /> {item}
                                        </li>
                                      )) ?? activity.details.notes)}
                                    </ul>
                                  </div>
                                  <div className="mb-2">
                                    <p className="text-sm text-muted-foreground mt-1 font-bold">Questions</p>
                                    <ul>
                                      {activity.details.questions && (slicedQuestions?.map((item, i) => (
                                        item !== " " &&
                                        <li key={i + "_questions"} className="text-sm list-disc text-muted-foreground mt-1 pl-3 flex items-center gap-2">
                                          <CircleCheck className="w-4 h-4" /> {item}
                                        </li>
                                      )) ?? activity.details.questions)}
                                    </ul>

                                  </div>

                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteActivity(activity.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                Delete
                              </Button>
                            </motion.div>
                          )
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Stats Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="space-y-6"
              >
                <Card className="bg-background/60 backdrop-blur-sm border-border/40">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Heart className="h-5 w-5" />
                      <span>Today's Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { type: 'feeding', label: 'Feedings', icon: Milk },
                        { type: 'sleep', label: 'Sleep Sessions', icon: Moon },
                        { type: 'diaper', label: 'Diaper Changes', icon: Activity },
                        { type: 'poop', label: 'Poop Times', icon: AlertCircle },
                      ].map((stat) => {
                        const count = activities.filter(
                          activity => activity.type === stat.type &&
                            activity.timestamp.toDateString() === new Date().toDateString()
                        ).length;

                        return (
                          <div key={stat.type} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <stat.icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{stat.label}</span>
                            </div>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/60 backdrop-blur-sm border-border/40">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Upcoming</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activities.filter(a => a.type === 'doctor').length === 0 ? (
                        <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                      ) : (
                        activities
                          .filter(a => a.type === 'doctor')
                          .map((activity) => (
                            <div key={activity.id} className="p-3 rounded-lg bg-background/40">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">
                                  {activity.details.appointmentType}
                                </span>
                              </div>
                              {activity.details.date && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {activity.details.date}
                                </p>
                              )}
                            </div>
                          ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      {/* Activity Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm border-border/40">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedActivity && getActivityIcon(selectedActivity)}
              <span>Add {selectedActivity?.charAt(0).toUpperCase() + selectedActivity?.slice(1)} Entry</span>
            </DialogTitle>
            <DialogDescription>
              Track your baby's {selectedActivity} activity
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedActivity === 'feeding' && (
              <div className="space-y-4">
                <div>
                  <Label className="pb-1" htmlFor="amount">Amount (oz)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={feedingData.amount}
                    onChange={(e) => setFeedingData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Enter amount in ounces"
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="feeding-notes">Notes</Label>
                  <Textarea
                    id="feeding-notes"
                    value={feedingData.notes}
                    onChange={(e) => setFeedingData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any notes about the feeding..."
                  />
                </div>
                <Button
                  onClick={() => addActivity('feeding', feedingData)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Add Feeding Entry
                </Button>
              </div>
            )}

            {selectedActivity === 'sleep' && (
              <div className="space-y-4">
                <div>
                  <Label className="pb-1" htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={sleepData.duration}
                    onChange={(e) => setSleepData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="Enter sleep duration"
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="sleep-notes">Notes</Label>
                  <Textarea
                    id="sleep-notes"
                    value={sleepData.notes}
                    onChange={(e) => setSleepData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any notes about the sleep..."
                  />
                </div>
                <Button
                  onClick={() => addActivity('sleep', sleepData)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Add Sleep Entry
                </Button>
              </div>
            )}

            {selectedActivity === 'diaper' && (
              <div className="space-y-4">
                <div>
                  <Label className="pb-1" htmlFor="diaper-type">Type</Label>
                  <Select value={diaperData.type} onValueChange={(value) => setDiaperData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select diaper type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wet">Wet</SelectItem>
                      <SelectItem value="dirty">Dirty</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="pb-1" htmlFor="diaper-notes">Notes</Label>
                  <Textarea
                    id="diaper-notes"
                    value={diaperData.notes}
                    onChange={(e) => setDiaperData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any notes about the diaper change..."
                  />
                </div>
                <Button
                  onClick={() => addActivity('diaper', diaperData)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Add Diaper Entry
                </Button>
              </div>
            )}

            {selectedActivity === 'poop' && (
              <div className="space-y-4">
                <div>
                  <Label className="pb-1" htmlFor="consistency">Consistency</Label>
                  <Select value={poopData.consistency} onValueChange={(value) => setPoopData(prev => ({ ...prev, consistency: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select consistency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="soft">Soft</SelectItem>
                      <SelectItem value="watery">Watery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="pb-1" htmlFor="poop-notes">Notes</Label>
                  <Textarea
                    id="poop-notes"
                    value={poopData.notes}
                    onChange={(e) => setPoopData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any notes about the poop..."
                  />
                </div>
                <Button
                  onClick={() => addActivity('poop', poopData)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Add Poop Entry
                </Button>
              </div>
            )}

            {selectedActivity === 'doctor' && (
              <div className="space-y-4">
                <div>
                  <Label className="pb-1" htmlFor="appointment-type">Appointment Type</Label>
                  <Select value={doctorData.appointmentType} onValueChange={(value) => setDoctorData(prev => ({ ...prev, appointmentType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checkup">Regular Checkup</SelectItem>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
                      <SelectItem value="sick">Sick Visit</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="pb-1" htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={doctorData.date}
                    required
                    onChange={(e) => setDoctorData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="doctor-notes">Doctor Notes</Label>
                  <Textarea
                    id="doctor-notes"
                    value={doctorData.notes}
                    onChange={(e) => setDoctorData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add doctor's notes and recommendations..."
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="questions">Questions to Ask</Label>
                  <Textarea
                    id="questions"
                    value={doctorData.questions}
                    onChange={(e) => setDoctorData(prev => ({ ...prev, questions: e.target.value }))}
                    placeholder="List questions for the next visit..."
                  />
                </div>
                <Button
                  onClick={() => addActivity('doctor', doctorData)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Add Doctor Entry
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
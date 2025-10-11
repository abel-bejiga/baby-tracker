"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IOSCard, IOSCardHeader, IOSCardTitle, IOSCardDescription, IOSCardContent } from "@/components/ui/ios-card";
import { LiquidCard } from "@/components/ui/liquid-card";
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
  Edit,
  Save,
  X,
  CalendarPlus,
  Menu,
  Home as HomeI,
  BarChart3,
  CalendarDays,
  ClipboardList,
  SquareCheck,
  Trophy,
  Thermometer,
  Pill,
  Shield,
  TrendingUp,
  Star,
  BookOpen,
  Brain,
  Scale,
  Ruler,
  Sparkles,
  Upload,
  Play,
  Pause,
  Camera
} from "lucide-react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addToAppleCalendar, createDoctorAppointmentEvent } from "@/lib/calendar";
import { AnimatedHamburger } from "@/components/ui/animated-hamburger";
import { useBabyTrackerLocalStorage, defaultFormData } from "@/hooks/use-baby-tracker-local-storage";
import { useClickOutside } from "@/hooks/use-click-outside";
import MultiUserShare from "@/components/multi-user-share";
import AIInsights from "@/components/ai-insight";
import VisualTimeline from "@/components/visual-timeline";
import ChildProfile from "@/components/child-profile";
import Link from "next/link";
import { useNotification } from "@/components/ui/notification";

interface BabyActivity {
  id: string;
  type: 'feeding' | 'sleep' | 'diaper' | 'poop' | 'doctor' | 'temperature' | 'medication' | 'vaccination' | 'milestone' | 'growth' | 'symptoms';
  timestamp: Date;
  details: any;
  userId: string;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [activities, setActivities] = useState<BabyActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<BabyActivity | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [babyId, setBabyId] = useState<string>('default-baby');
  const [currentAge, setCurrentAge] = useState<number>(6); // Default 6 months

  // Form states with localStorage persistence
  const { formData, updateFormData, getFormData, clearFormData } = useBabyTrackerLocalStorage();

  // Helper functions for updating form data
  const updateFeedingData = (data: Partial<typeof feedingData>) => updateFormData('feeding', data);
  const updateSleepData = (data: Partial<typeof sleepData>) => updateFormData('sleep', data);
  const updateDiaperData = (data: Partial<typeof diaperData>) => updateFormData('diaper', data);
  const updatePoopData = (data: Partial<typeof poopData>) => updateFormData('poop', data);
  const updateDoctorData = (data: Partial<typeof doctorData>) => updateFormData('doctor', data);
  const updateTemperatureData = (data: Partial<typeof temperatureData>) => updateFormData('temperature', data);
  const updateMedicationData = (data: Partial<typeof medicationData>) => updateFormData('medication', data);
  const updateVaccinationData = (data: Partial<typeof vaccinationData>) => updateFormData('vaccination', data);
  const updateMilestoneData = (data: Partial<typeof milestoneData>) => updateFormData('milestone', data);
  const updateGrowthData = (data: Partial<typeof growthData>) => updateFormData('growth', data);
  const updateSymptomsData = (data: Partial<typeof symptomsData>) => updateFormData('symptoms', data);

  // Extract form data for easier access
  const feedingData: any = getFormData('feeding');
  const sleepData: any = getFormData('sleep');
  const diaperData: any = getFormData('diaper');
  const poopData: any = getFormData('poop');
  const doctorData: any = getFormData('doctor');
  const temperatureData: any = getFormData('temperature');
  const medicationData: any = getFormData('medication');
  const vaccinationData: any = getFormData('vaccination');
  const milestoneData: any = getFormData('milestone');
  const growthData: any = getFormData('growth');
  const symptomsData: any = getFormData('symptoms');

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { success, error } = useNotification()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchActivities(currentUser.uid);
        // Create or get baby profile
        setBabyId(currentUser.uid);
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
      success({
        title: "Welcome!",
        description: "Successfully signed in to Baby Tracker.",
      });
    } catch (err) {
      console.error("Error signing in with Google: ", err);
      error({
        title: "Sign In Error",
        description: "Failed to sign in. Please try again.",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setActivities([]);
      success({
        title: "Goodbye!",
        description: "Successfully signed out of Baby Tracker.",
      });
    } catch (err) {
      console.error("Error signing out: ", (err as Error).message);
      error({
        title: "Sign Out Error",
        description: "Failed to sign out. Please try again."
      });
    }
  };

  const validateForm = (type: string, data: any) => {
    const newErrors: Record<string, string> = {};

    switch (type) {
      case 'feeding':
        if (!data.amount) newErrors.amount = 'Amount is required';
        break;
      case 'sleep':
        if (!data.duration) newErrors.duration = 'Duration is required';
        break;
      case 'diaper':
        if (!data.type) newErrors.type = 'Type is required';
        break;
      case 'poop':
        if (!data.consistency) newErrors.consistency = 'Consistency is required';
        break;
      case 'doctor':
        if (!data.appointmentType) newErrors.appointmentType = 'Appointment type is required';
        if (!data.date) newErrors.date = 'Date is required';
        break;
      case 'temperature':
        if (!data.temperature) newErrors.temperature = 'Temperature is required';
        break;
      case 'medication':
        if (!data.medicationName) newErrors.medicationName = 'Medication name is required';
        if (!data.dosage) newErrors.dosage = 'Dosage is required';
        break;
      case 'vaccination':
        if (!data.vaccineName) newErrors.vaccineName = 'Vaccine name is required';
        break;
      case 'milestone':
        if (!data.milestoneType) newErrors.milestoneType = 'Milestone type is required';
        break;
      case 'growth':
        if (!data.weight && !data.height && !data.headCircumference) {
          newErrors.growth = 'At least one measurement is required';
        }
        break;
      case 'symptoms':
        if (!data.symptomType) newErrors.symptomType = 'Symptom type is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addActivity = async (type: any, data: any) => {
    if (!user) return;

    if (!validateForm(type, data)) {
      return;
    }

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

      // Award points for activity
      try {
        const token = await user.getIdToken();
        await fetch('/api/scoring/activity', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ activityType: type })
        });
      } catch (scoringError) {
        console.warn('Failed to award activity points:', scoringError);
      }

      // Add to Apple Calendar if it's a doctor appointment
      if (type === 'doctor') {
        try {
          const calendarEvent = createDoctorAppointmentEvent(data);
          addToAppleCalendar(calendarEvent);
        } catch (calendarError) {
          console.warn("Could not add to Apple Calendar:", calendarError);
        }
      }

      setIsDialogOpen(false);
      setExpandedCard(null);
      resetForms();
      clearFormData(type);

      // Show success toast
      success({
        title: "Success!",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} entry added successfully.`,
      });
    } catch (err) {
      console.error("Error adding activity: ", (err as Error).message);
      error({
        title: "Error",
        description: "Failed to add activity. Please try again.",
      });
    }
  };

  const updateActivity = async (id: string, type: any, data: any) => {
    if (!user) return;

    if (!validateForm(type, data)) {
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid, "activities", id), {
        details: data
      });

      setActivities(prev => prev.map(activity =>
        activity.id === id
          ? { ...activity, details: data }
          : activity
      ));

      setEditingActivity(null);
      setIsDialogOpen(false);
      setExpandedCard(null);
      resetForms();
      clearFormData(type);

      // Show success toast
      success({
        title: "Success!",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} entry updated successfully.`,
      });
    } catch (err) {
      console.error("Error updating activity: ", (err as Error).message);
      error({
        title: "Error",
        description: "Failed to update activity. Please try again.",
      });
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      const activityToDelete = activities.find(a => a.id === id);
      await deleteDoc(doc(db, "users", user.uid, "activities", id));
      setActivities(prev => prev.filter(activity => activity.id !== id));

      // Show success toast
      if (activityToDelete) {
        success({
          title: "Success!",
          description: `${activityToDelete.type.charAt(0).toUpperCase() + activityToDelete.type.slice(1)} entry deleted successfully.`,
        });
      }
    } catch (err) {
      console.error("Error deleting activity: ", (err as Error).message);
      error({
        title: "Error",
        description: "Failed to delete activity. Please try again.",
      });
    }
  };

  const resetForms = () => {
    const now = new Date();
    const currentDateTime = now.toISOString().slice(0, 16);
    const currentTime = now.toTimeString().slice(0, 5);

    updateFormData('feeding', { amount: '', notes: '', timestamp: currentDateTime });
    updateFormData('sleep', { duration: '', notes: '', startTime: currentTime, endTime: '', timestamp: currentDateTime });
    updateFormData('diaper', { type: '', notes: '', timestamp: currentDateTime });
    updateFormData('poop', { consistency: '', notes: '', timestamp: currentDateTime });
    updateFormData('doctor', {
      appointmentType: '',
      notes: '',
      questions: '',
      date: currentDateTime,
      location: '',
      doctorName: '',
      hospitalName: ''
    });
    updateFormData('temperature', {
      temperature: '',
      unit: 'celsius',
      notes: '',
      timestamp: currentDateTime
    });
    updateFormData('medication', {
      medicationName: '',
      dosage: '',
      frequency: '',
      duration: '',
      notes: '',
      timestamp: currentDateTime
    });
    updateFormData('vaccination', {
      vaccineName: '',
      doseNumber: '',
      administeredBy: '',
      nextDueDate: '',
      notes: '',
      timestamp: currentDateTime
    });
    updateFormData('milestone', {
      milestoneType: '',
      description: '',
      dateAchieved: '',
      notes: '',
      timestamp: currentDateTime
    });
    updateFormData('growth', {
      weight: '',
      height: '',
      headCircumference: '',
      date: currentDateTime,
      notes: '',
      timestamp: currentDateTime
    });
    updateFormData('symptoms', {
      symptomType: '',
      severity: 'mild',
      description: '',
      startDate: '',
      endDate: '',
      notes: '',
      timestamp: currentDateTime
    });
    setErrors({});
  };

  const handleCardClick = (activityType: string) => {
    if (expandedCard === activityType) {
      setExpandedCard(null);
    } else {
      setSelectedActivity(activityType);
      setEditingActivity(null);
      setExpandedCard(activityType);
    }
  };

  const handleCardHeaderClick = (e: React.MouseEvent, activityType: string) => {
    e.preventDefault();
    e.stopPropagation();
    handleCardClick(activityType);
  };

  const handleFormClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const closeExpandedCard = () => {
    setExpandedCard(null);
  };

  // Use click outside hook to close expanded card when clicking outside
  const expandedCardRef = useClickOutside(() => {
    if (expandedCard) {
      closeExpandedCard();
    }
  });

  const openEditDialog = (activity: BabyActivity) => {
    setEditingActivity(activity);
    setSelectedActivity(activity.type);
    setExpandedCard(activity.type);

    // Populate form with existing data
    switch (activity.type) {
      case 'feeding':
        updateFeedingData({
          amount: activity.details.amount || '',
          notes: activity.details.notes || '',
          timestamp: activity.timestamp.toISOString().slice(0, 16)
        });
        break;
      case 'sleep':
        updateSleepData({
          duration: activity.details.duration || '',
          notes: activity.details.notes || '',
          startTime: activity.details.startTime || '',
          endTime: activity.details.endTime || '',
          timestamp: activity.timestamp.toISOString().slice(0, 16)
        });
        break;
      case 'diaper':
        updateDiaperData({
          type: activity.details.type || '',
          notes: activity.details.notes || '',
          timestamp: activity.timestamp.toISOString().slice(0, 16)
        });
        break;
      case 'poop':
        updatePoopData({
          consistency: activity.details.consistency || '',
          notes: activity.details.notes || '',
          timestamp: activity.timestamp.toISOString().slice(0, 16)
        });
        break;
      case 'doctor':
        updateDoctorData({
          appointmentType: activity.details.appointmentType || '',
          notes: activity.details.notes || '',
          questions: activity.details.questions || '',
          date: activity.details.date || activity.timestamp.toISOString().slice(0, 16),
          location: activity.details.location || '',
          doctorName: activity.details.doctorName || '',
          hospitalName: activity.details.hospitalName || ''
        });
        break;
      case 'temperature':
        updateTemperatureData({
          temperature: activity.details.temperature || '',
          unit: activity.details.unit || 'celsius',
          notes: activity.details.notes || '',
          timestamp: activity.timestamp.toISOString().slice(0, 16)
        });
        break;
      case 'medication':
        updateMedicationData({
          medicationName: activity.details.medicationName || '',
          dosage: activity.details.dosage || '',
          frequency: activity.details.frequency || '',
          duration: activity.details.duration || '',
          notes: activity.details.notes || '',
          timestamp: activity.timestamp.toISOString().slice(0, 16)
        });
        break;
      case 'vaccination':
        updateVaccinationData({
          vaccineName: activity.details.vaccineName || '',
          doseNumber: activity.details.doseNumber || '',
          administeredBy: activity.details.administeredBy || '',
          nextDueDate: activity.details.nextDueDate || '',
          notes: activity.details.notes || '',
          timestamp: activity.timestamp.toISOString().slice(0, 16)
        });
        break;
      case 'milestone':
        updateMilestoneData({
          milestoneType: activity.details.milestoneType || '',
          description: activity.details.description || '',
          dateAchieved: activity.details.dateAchieved || '',
          notes: activity.details.notes || '',
          timestamp: activity.timestamp.toISOString().slice(0, 16)
        });
        break;
      case 'growth':
        updateGrowthData({
          weight: activity.details.weight || '',
          height: activity.details.height || '',
          headCircumference: activity.details.headCircumference || '',
          date: activity.details.date || activity.timestamp.toISOString().slice(0, 16),
          notes: activity.details.notes || '',
          timestamp: activity.timestamp.toISOString().slice(0, 16)
        });
        break;
      case 'symptoms':
        updateSymptomsData({
          symptomType: activity.details.symptomType || '',
          severity: activity.details.severity || 'mild',
          description: activity.details.description || '',
          startDate: activity.details.startDate || '',
          endDate: activity.details.endDate || '',
          notes: activity.details.notes || '',
          timestamp: activity.timestamp.toISOString().slice(0, 16)
        });
        break;
    }

    setIsDialogOpen(true);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'feeding': return <Milk className="h-5 w-5" />;
      case 'sleep': return <Moon className="h-5 w-5" />;
      case 'diaper': return <Activity className="h-5 w-5" />;
      case 'poop': return <AlertCircle className="h-5 w-5" />;
      case 'doctor': return <Stethoscope className="h-5 w-5" />;
      case 'temperature': return <Thermometer className="h-5 w-5" />;
      case 'medication': return <Pill className="h-5 w-5" />;
      case 'vaccination': return <Shield className="h-5 w-5" />;
      case 'milestone': return <Star className="h-5 w-5" />;
      case 'growth': return <TrendingUp className="h-5 w-5" />;
      case 'symptoms': return <Heart className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'feeding': return 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200';
      case 'sleep': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'diaper': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'poop': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'doctor': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'temperature': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medication': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'vaccination': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      case 'milestone': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'growth': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'symptoms': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const addToCalendar = (activity: BabyActivity) => {
    if (activity.type === 'doctor') {
      try {
        const calendarEvent = createDoctorAppointmentEvent(activity.details);
        addToAppleCalendar(calendarEvent);
        success({
          title: "Calendar Added!",
          description: "Doctor appointment added to Apple Calendar.",
        });
      } catch (err) {
        console.error("Error adding to calendar:", err);
        error({
          title: "Calendar Error",
          description: "Failed to add to Apple Calendar. Please try again.",
        });
      }
    }
  };

  const formatActivityDetails = (activity: BabyActivity) => {
    switch (activity.type) {
      case 'feeding':
        return (
          <div className="space-y-2 w-full">
            <div className="flex items-center gap-2">
              <Milk className="h-4 w-4 text-sky-500" />
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
              <Moon className="h-4 w-4 text-pink-500" />
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
                <Calendar className="h-3 w-3" />
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
      case 'temperature':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-orange-500" />
              <span className="font-medium">{activity.details.temperature}°{activity.details.unit === 'fahrenheit' ? 'F' : 'C'}</span>
            </div>
            {activity.details.notes && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Notes:</p>
                <p>{activity.details.notes}</p>
              </div>
            )}
          </div>
        );
      case 'medication':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-indigo-500" />
              <span className="font-medium">{activity.details.medicationName}</span>
            </div>
            {activity.details.dosage && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Dosage:</span> {activity.details.dosage}
              </div>
            )}
            {activity.details.frequency && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Frequency:</span> {activity.details.frequency}
              </div>
            )}
            {activity.details.notes && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Notes:</p>
                <p>{activity.details.notes}</p>
              </div>
            )}
          </div>
        );
      case 'vaccination':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-500" />
              <span className="font-medium">{activity.details.vaccineName}</span>
            </div>
            {activity.details.doseNumber && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Dose:</span> {activity.details.doseNumber}
              </div>
            )}
            {activity.details.administeredBy && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Administered by:</span> {activity.details.administeredBy}
              </div>
            )}
            {activity.details.nextDueDate && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Next due:</span> {new Date(activity.details.nextDueDate).toLocaleDateString()}
              </div>
            )}
            {activity.details.notes && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Notes:</p>
                <p>{activity.details.notes}</p>
              </div>
            )}
          </div>
        );
      case 'milestone':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-pink-500" />
              <span className="font-medium">{activity.details.milestoneType}</span>
            </div>
            {activity.details.dateAchieved && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Achieved:</span> {new Date(activity.details.dateAchieved).toLocaleDateString()}
              </div>
            )}
            {activity.details.description && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Description:</p>
                <p>{activity.details.description}</p>
              </div>
            )}
            {activity.details.notes && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Notes:</p>
                <p>{activity.details.notes}</p>
              </div>
            )}
          </div>
        );
      case 'growth':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="font-medium">Growth Measurements</span>
            </div>
            {activity.details.weight && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Weight:</span> {activity.details.weight} kg
              </div>
            )}
            {activity.details.height && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Height:</span> {activity.details.height} cm
              </div>
            )}
            {activity.details.headCircumference && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Head Circumference:</span> {activity.details.headCircumference} cm
              </div>
            )}
            {activity.details.date && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Date:</span> {new Date(activity.details.date).toLocaleDateString()}
              </div>
            )}
            {activity.details.notes && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Notes:</p>
                <p>{activity.details.notes}</p>
              </div>
            )}
          </div>
        );
      case 'symptoms':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              <span className="font-medium">{activity.details.symptomType}</span>
              {activity.details.severity && (
                <Badge variant="outline" className="text-xs">
                  {activity.details.severity}
                </Badge>
              )}
            </div>
            {activity.details.description && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Description:</p>
                <p>{activity.details.description}</p>
              </div>
            )}
            {activity.details.startDate && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Started:</span> {new Date(activity.details.startDate).toLocaleDateString()}
              </div>
            )}
            {activity.details.endDate && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Ended:</span> {new Date(activity.details.endDate).toLocaleDateString()}
              </div>
            )}
            {activity.details.notes && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Notes:</p>
                <p>{activity.details.notes}</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const getUserInitials = (displayName: string) => {
    if (!displayName) return 'U';
    const names = displayName.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0).toUpperCase()}${names[names.length - 1].charAt(0).toUpperCase()}`;
    }
    return displayName.charAt(0).toUpperCase();
  };

  if (!user) {
    return (
      <div className="min-h-[100dvh] relative overflow-hidden flex flex-col">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(120,119,198,0.1),transparent_50%)]"></div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] p-4 flex-grow">
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
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-sky-500 to-pink-600 rounded-full flex items-center justify-center">
                <Baby className="h-10 w-10 text-white" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-4xl max-xl:hidden font-bold mb-4 bg-gradient-to-r from-sky-600 to-pink-600 bg-clip-text text-transparent"
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
                className="w-full bg-gradient-to-r from-sky-600 to-pink-600 hover:from-sky-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <User className="mr-2 h-5 w-5" />
                Sign in with Google
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 text-center py-4 text-sm text-muted-foreground">
          Motivated by my first born. Made by abelbejiga.com
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] relative overflow-hidden flex flex-col">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(120,119,198,0.1),transparent_50%)]"></div>

      <div className="relative z-10 flex flex-col flex-grow">
        {/* Fixed Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed top-5 left-0 right-0 z-10 flex items-center max-sm:w-[95%] max-sm:mx-auto"
        >
          <IOSCard variant="glass" intensity="high" className="container mx-auto px-4 py-3 items-center justify-between max-sm:w-full">
            <IOSCardContent className="flex w-full justify-between pb-0">
              <div className="flex items-center space-x-3">
                <AnimatedHamburger
                  isOpen={isSidebarOpen}
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden"
                />
                <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-pink-600 rounded-full flex items-center justify-center">
                  <Baby className="h-5 w-5 text-white" />
                </div>
                <h1 className="md:text-2xl text-xl max-lg:!hidden font-bold bg-gradient-to-r from-sky-600 to-pink-600 bg-clip-text text-transparent">
                  Baby Tracker
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-pink-600 rounded-full flex items-center justify-center">
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
            </IOSCardContent>
          </IOSCard>
        </motion.header>

        {/* Sidebar */}
        <motion.div
          initial={{ x: 500 }}
          animate={{ x: isSidebarOpen ? 0 : 500 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed top-5 right-5 h-fit lg:w-[350px] w-[90%] z-40 shadow-2xl"
        >
          <IOSCard variant="glass" intensity="high" className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-pink-600 rounded-full flex items-center justify-center">
                  <Baby className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-pink-600 bg-clip-text text-transparent">
                  Baby Tracker
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {getUserInitials(user.displayName || '')}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{user.displayName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                <Link href="/">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setIsSidebarOpen(false);
                    }}
                  >
                    <HomeI className="mr-3 h-5 w-5" />
                    Home
                  </Button>
                </Link>
                <Link href="/activities">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setIsSidebarOpen(false);
                    }}
                  >
                    <Activity className="mr-3 h-5 w-5" />
                    Activities
                  </Button>
                </Link>
                <Link href="/summary">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setIsSidebarOpen(false);
                    }}
                  >
                    <BarChart3 className="mr-3 h-5 w-5" />
                    Summary
                  </Button>
                </Link>
                <Link href="/appointments">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setIsSidebarOpen(false);
                    }}
                  >
                    <CalendarDays className="mr-3 h-5 w-5" />
                    Appointments
                  </Button>
                </Link>
                <Link href="/todo">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setIsSidebarOpen(false);
                    }}
                  >
                    <SquareCheck className="mr-3 h-5 w-5" />
                    To-Do
                  </Button>
                </Link>
                <Link href="/leaderboard">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setIsSidebarOpen(false);
                    }}
                  >
                    <Trophy className="mr-3 h-5 w-5" />
                    Leaderboard
                  </Button>
                </Link>
              </nav>

              <div className="pt-4 border-t border-border/40">
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-destructive hover:text-destructive-foreground"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </Button>
              </div>
            </div>
          </IOSCard>
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
        <main className="container mx-auto px-4 pt-28 pb-8 flex-grow">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Activity Cards and Recent Activities */}
            <div className="lg:col-span-2 space-y-8">
              {/* Activity Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { type: 'feeding', icon: Milk, title: 'Feeding', description: 'Track feeding time and amount' },
                    { type: 'sleep', icon: Moon, title: 'Sleep', description: 'Monitor sleep patterns' },
                    { type: 'diaper', icon: Activity, title: 'Diaper Change', description: 'Log diaper changes' },
                    { type: 'poop', icon: AlertCircle, title: 'Poop Time', description: 'Track bowel movements' },
                    { type: 'doctor', icon: Stethoscope, title: 'Doctor', description: 'Appointments & notes' },
                    { type: 'temperature', icon: Thermometer, title: 'Temperature', description: 'Monitor body temperature' },
                  ].map((activity, index) => (
                    <motion.div
                      key={activity.type}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className="group"
                    >
                      <IOSCard
                        variant="glass"
                        intensity="medium"
                        className="h-full py-4 cursor-pointer hover:shadow-lg transition-all duration-300"
                        onClick={() => {
                          setSelectedActivity(activity.type);
                          setEditingActivity(null);
                          setIsDialogOpen(true);
                        }}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-sky-500 to-pink-600 rounded-lg">
                              <activity.icon className="h-5 w-5 text-white" />
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
                            className="w-full group-hover:bg-gradient-to-r group-hover:from-sky-500 group-hover:to-pink-600 group-hover:text-white rounded-2xl transition-all duration-500"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Entry
                          </Button>
                        </CardContent>
                      </IOSCard>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Additional Activity Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { type: 'medication', icon: Pill, title: 'Medication', description: 'Track medications' },
                    { type: 'vaccination', icon: Shield, title: 'Vaccination', description: 'Record immunizations' },
                    { type: 'milestone', icon: Star, title: 'Milestone', description: 'Log achievements' },
                    { type: 'growth', icon: TrendingUp, title: 'Growth', description: 'Track measurements' },
                    { type: 'symptoms', icon: Heart, title: 'Symptoms', description: 'Monitor illness' },
                  ].map((activity, index) => (
                    <motion.div
                      key={activity.type}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className="group"
                    >
                      <IOSCard
                        variant="glass"
                        intensity="medium"
                        className="h-full py-4 cursor-pointer hover:shadow-lg transition-all duration-300"
                        onClick={() => {
                          setSelectedActivity(activity.type);
                          setEditingActivity(null);
                          setIsDialogOpen(true);
                        }}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-sky-500 to-pink-600 rounded-lg">
                              <activity.icon className="h-5 w-5 text-white" />
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
                            className="w-full group-hover:bg-gradient-to-r group-hover:from-sky-500 group-hover:to-pink-600 group-hover:text-white rounded-2xl transition-all duration-500"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Entry
                          </Button>
                        </CardContent>
                      </IOSCard>
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
                <IOSCard variant="glass" intensity="high">
                  <IOSCardHeader>
                    <IOSCardTitle className="flex items-center space-x-2">
                      <History className="h-5 w-5" />
                      <span>Recent Activities</span>
                    </IOSCardTitle>
                  </IOSCardHeader>
                  <IOSCardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {activities.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No activities yet. Start tracking your baby's activities!</p>
                        </div>
                      ) : (
                        activities.map((activity) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-start justify-between p-4 rounded-lg border border-border/40 bg-background/40"
                          >
                            <div className="flex items-start space-x-3 flex-grow">
                              <div className="p-2 rounded-lg bg-background mt-1">
                                {getActivityIcon(activity.type)}
                              </div>
                              <div className="flex-grow">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge className={getActivityColor(activity.type)}>
                                    {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                                  </Badge>
                                  <span className="text-sm max-lg:hidden text-muted-foreground">
                                    {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                                  </span>
                                </div>
                                <div className="w-full">
                                  {formatActivityDetails(activity)}
                                </div>
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(activity)}
                                className="text-sky-600 hover:text-sky-700 hover:bg-sky-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteActivity(activity.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </IOSCardContent>
                </IOSCard>
              </motion.div>
            </div>

            {/* Right Column - Stats and Advanced Features */}
            <div className="lg:col-span-1 space-y-6">
              {/* Today's Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <IOSCard variant="glass" intensity="medium">
                  <IOSCardHeader>
                    <IOSCardTitle className="flex items-center space-x-2">
                      <Heart className="h-5 w-5" />
                      <span>Today's Summary</span>
                    </IOSCardTitle>
                  </IOSCardHeader>
                  <IOSCardContent>
                    <div className="space-y-4">
                      {[
                        { type: 'feeding', label: 'Feedings', icon: Milk },
                        { type: 'sleep', label: 'Sleep Sessions', icon: Moon },
                        { type: 'diaper', label: 'Diaper Changes', icon: Activity },
                        { type: 'poop', label: 'Poop Times', icon: AlertCircle },
                        { type: 'doctor', label: "Doctor", icon: Stethoscope }
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
                  </IOSCardContent>
                </IOSCard>
              </motion.div>

              {/* AI Insights */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <AIInsights activities={activities} babyId={babyId} />
              </motion.div>

              {/* Child Profile */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <ChildProfile babyId={babyId} currentAge={currentAge} />
              </motion.div>

              {/* Multi-User Sharing */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <MultiUserShare babyId={babyId} currentUserId={user.uid} />
              </motion.div>

              {/* Visual Timeline */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <VisualTimeline babyId={babyId} activities={activities} />
              </motion.div>

              {/* Upcoming */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
              >
                <IOSCard variant="liquid" intensity="medium">
                  <IOSCardHeader>
                    <IOSCardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Upcoming</span>
                    </IOSCardTitle>
                  </IOSCardHeader>
                  <IOSCardContent>
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
                                  {new Date(activity.details.date).toLocaleString()}
                                </p>
                              )}
                            </div>
                          ))
                      )}
                    </div>
                  </IOSCardContent>
                </IOSCard>
              </motion.div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 text-center py-4 text-sm text-muted-foreground border-t border-border/40 bg-background/80 backdrop-blur-sm">
          Motivated by my first born. Made by abelbejiga.com
        </footer>
      </div>

      {/* Activity Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditingActivity(null);
          resetForms();
        }
      }}>
        <DialogContent className="sm:max-w-md backdrop-blur-xl bg-black/20">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedActivity && getActivityIcon(selectedActivity)}
              <span>
                {editingActivity ? 'Edit' : 'Add'} {selectedActivity?.charAt(0).toUpperCase() + selectedActivity?.slice(1)} Entry
              </span>
            </DialogTitle>
            <DialogDescription>
              {editingActivity ? 'Update' : 'Track'} your baby's {selectedActivity} activity
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedActivity === 'feeding' && (
              <div className="space-y-4">
                <div>
                  <Label className="pb-1" htmlFor="amount">Amount (oz) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.1"
                    value={feedingData.amount}
                    onChange={(e) => updateFeedingData({ amount: e.target.value })}
                    placeholder="Enter amount in ounces"
                    className={errors.amount ? 'border-red-500' : ''}
                  />
                  {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                </div>
                <div>
                  <Label className="pb-1" htmlFor="feeding-time">Time</Label>
                  <Input
                    id="feeding-time"
                    type="datetime-local"
                    value={feedingData.timestamp}
                    onChange={(e) => updateFeedingData({ timestamp: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="feeding-notes">Notes</Label>
                  <Textarea
                    id="feeding-notes"
                    value={feedingData.notes}
                    onChange={(e) => updateFeedingData({ notes: e.target.value })}
                    placeholder="Add any notes about the feeding..."
                  />
                </div>
                <Button
                  onClick={() => editingActivity
                    ? updateActivity(editingActivity.id, 'feeding', feedingData)
                    : addActivity('feeding', feedingData)
                  }
                  className="w-full bg-gradient-to-r from-sky-500 to-pink-600 hover:from-sky-600 hover:to-pink-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {editingActivity ? 'Update' : 'Add'} Feeding Entry
                </Button>
              </div>
            )}

            {selectedActivity === 'sleep' && (
              <div className="space-y-4">
                <div>
                  <Label className="pb-1" htmlFor="duration">Duration (hours) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    step="0.1"
                    value={sleepData.duration}
                    onChange={(e) => updateSleepData({ duration: e.target.value })}
                    placeholder="Enter sleep duration"
                    className={errors.duration ? 'border-red-500' : ''}
                  />
                  {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="pb-1" htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={sleepData.startTime}
                      onChange={(e) => updateSleepData({ startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="pb-1" htmlFor="end-time">End Time</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={sleepData.endTime}
                      onChange={(e) => updateSleepData({ endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label className="pb-1" htmlFor="sleep-time">Date</Label>
                  <Input
                    id="sleep-time"
                    type="datetime-local"
                    value={sleepData.timestamp}
                    onChange={(e) => updateSleepData({ timestamp: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="sleep-notes">Notes</Label>
                  <Textarea
                    id="sleep-notes"
                    value={sleepData.notes}
                    onChange={(e) => updateSleepData({ notes: e.target.value })}
                    placeholder="Add any notes about the sleep..."
                  />
                </div>
                <Button
                  onClick={() => editingActivity
                    ? updateActivity(editingActivity.id, 'sleep', sleepData)
                    : addActivity('sleep', sleepData)
                  }
                  className="w-full bg-gradient-to-r from-sky-500 to-pink-600 hover:from-sky-600 hover:to-pink-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {editingActivity ? 'Update' : 'Add'} Sleep Entry
                </Button>
              </div>
            )}

            {selectedActivity === 'diaper' && (
              <div className="space-y-4">
                <div>
                  <Label className="pb-1" htmlFor="diaper-type">Type *</Label>
                  <Select value={diaperData.type} onValueChange={(value) => updateDiaperData({ type: value })}>
                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select diaper type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wet">Wet</SelectItem>
                      <SelectItem value="dirty">Dirty</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                </div>
                <div>
                  <Label className="pb-1" htmlFor="diaper-time">Time</Label>
                  <Input
                    id="diaper-time"
                    type="datetime-local"
                    value={diaperData.timestamp}
                    onChange={(e) => updateDiaperData({ timestamp: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="diaper-notes">Notes</Label>
                  <Textarea
                    id="diaper-notes"
                    value={diaperData.notes}
                    onChange={(e) => updateDiaperData({ notes: e.target.value })}
                    placeholder="Add any notes about the diaper change..."
                  />
                </div>
                <Button
                  onClick={() => editingActivity
                    ? updateActivity(editingActivity.id, 'diaper', diaperData)
                    : addActivity('diaper', diaperData)
                  }
                  className="w-full bg-gradient-to-r from-sky-500 to-pink-600 hover:from-sky-600 hover:to-pink-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {editingActivity ? 'Update' : 'Add'} Diaper Entry
                </Button>
              </div>
            )}

            {selectedActivity === 'poop' && (
              <div className="space-y-4">
                <div>
                  <Label className="pb-1" htmlFor="consistency">Consistency *</Label>
                  <Select value={poopData.consistency} onValueChange={(value) => updatePoopData({ consistency: value })}>
                    <SelectTrigger className={errors.consistency ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select consistency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="soft">Soft</SelectItem>
                      <SelectItem value="watery">Watery</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.consistency && <p className="text-red-500 text-sm mt-1">{errors.consistency}</p>}
                </div>
                <div>
                  <Label className="pb-1" htmlFor="poop-time">Time</Label>
                  <Input
                    id="poop-time"
                    type="datetime-local"
                    value={poopData.timestamp}
                    onChange={(e) => updatePoopData({ timestamp: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="poop-notes">Notes</Label>
                  <Textarea
                    id="poop-notes"
                    value={poopData.notes}
                    onChange={(e) => updatePoopData({ notes: e.target.value })}
                    placeholder="Add any notes about the poop..."
                  />
                </div>
                <Button
                  onClick={() => editingActivity
                    ? updateActivity(editingActivity.id, 'poop', poopData)
                    : addActivity('poop', poopData)
                  }
                  className="w-full bg-gradient-to-r from-sky-500 to-pink-600 hover:from-sky-600 hover:to-pink-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {editingActivity ? 'Update' : 'Add'} Poop Entry
                </Button>
              </div>
            )}

            {selectedActivity === 'doctor' && (
              <div className="space-y-4">
                <div>
                  <Label className="pb-1" htmlFor="appointment-type">Appointment Type *</Label>
                  <Select value={doctorData.appointmentType} onValueChange={(value) => updateDoctorData({ appointmentType: value })}>
                    <SelectTrigger className={errors.appointmentType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checkup">Regular Checkup</SelectItem>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
                      <SelectItem value="sick">Sick Visit</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.appointmentType && <p className="text-red-500 text-sm mt-1">{errors.appointmentType}</p>}
                </div>
                <div>
                  <Label className="pb-1" htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={doctorData.date}
                    onChange={(e) => updateDoctorData({ date: e.target.value })}
                    className={errors.date ? 'border-red-500' : ''}
                  />
                  {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                </div>
                <div>
                  <Label className="pb-1" htmlFor="doctor-notes">Doctor Notes</Label>
                  <Textarea
                    id="doctor-notes"
                    value={doctorData.notes}
                    onChange={(e) => updateDoctorData({ notes: e.target.value })}
                    placeholder="Add doctor's notes and recommendations..."
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="questions">Questions to Ask</Label>
                  <Textarea
                    id="questions"
                    value={doctorData.questions}
                    onChange={(e) => updateDoctorData({ questions: e.target.value })}
                    placeholder="List questions for the next visit..."
                  />
                </div>
                <Button
                  onClick={() => editingActivity
                    ? updateActivity(editingActivity.id, 'doctor', doctorData)
                    : addActivity('doctor', doctorData)
                  }
                  className="w-full bg-gradient-to-r from-sky-500 to-pink-600 hover:from-sky-600 hover:to-pink-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {editingActivity ? 'Update' : 'Add'} Doctor Entry
                </Button>
              </div>
            )}

            {selectedActivity === 'temperature' && (
              <div className="space-y-4">
                <div>
                  <Label className="pb-1" htmlFor="temperature">Temperature *</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={temperatureData.temperature}
                    onChange={(e) => updateTemperatureData({ temperature: e.target.value })}
                    placeholder="Enter temperature"
                    className={errors.temperature ? 'border-red-500' : ''}
                  />
                  {errors.temperature && <p className="text-red-500 text-sm mt-1">{errors.temperature}</p>}
                </div>
                <div>
                  <Label className="pb-1" htmlFor="unit">Unit</Label>
                  <Select value={temperatureData.unit} onValueChange={(value) => updateTemperatureData({ unit: value as 'celsius' | 'fahrenheit' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="celsius">Celsius (°C)</SelectItem>
                      <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="pb-1" htmlFor="temperature-time">Time</Label>
                  <Input
                    id="temperature-time"
                    type="datetime-local"
                    value={temperatureData.timestamp}
                    onChange={(e) => updateTemperatureData({ timestamp: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="temperature-notes">Notes</Label>
                  <Textarea
                    id="temperature-notes"
                    value={temperatureData.notes}
                    onChange={(e) => updateTemperatureData({ notes: e.target.value })}
                    placeholder="Add any notes about the temperature reading..."
                  />
                </div>
                <Button
                  onClick={() => editingActivity
                    ? updateActivity(editingActivity.id, 'temperature', temperatureData)
                    : addActivity('temperature', temperatureData)
                  }
                  className="w-full bg-gradient-to-r from-sky-500 to-pink-600 hover:from-sky-600 hover:to-pink-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {editingActivity ? 'Update' : 'Add'} Temperature Entry
                </Button>
              </div>
            )}

            {selectedActivity === 'medication' && (
              <div className="space-y-4">
                <div>
                  <Label className="pb-1" htmlFor="medication-name">Medication Name *</Label>
                  <Input
                    id="medication-name"
                    value={medicationData.medicationName}
                    onChange={(e) => updateMedicationData({ medicationName: e.target.value })}
                    placeholder="Enter medication name"
                    className={errors.medicationName ? 'border-red-500' : ''}
                  />
                  {errors.medicationName && <p className="text-red-500 text-sm mt-1">{errors.medicationName}</p>}
                </div>
                <div>
                  <Label className="pb-1" htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    value={medicationData.dosage}
                    onChange={(e) => updateMedicationData({ dosage: e.target.value })}
                    placeholder="Enter dosage (e.g., 5ml, 1 tablet)"
                    className={errors.dosage ? 'border-red-500' : ''}
                  />
                  {errors.dosage && <p className="text-red-500 text-sm mt-1">{errors.dosage}</p>}
                </div>
                <div>
                  <Label className="pb-1" htmlFor="frequency">Frequency</Label>
                  <Input
                    id="frequency"
                    value={medicationData.frequency}
                    onChange={(e) => updateMedicationData({ frequency: e.target.value })}
                    placeholder="Enter frequency (e.g., twice daily, every 4 hours)"
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={medicationData.duration}
                    onChange={(e) => updateMedicationData({ duration: e.target.value })}
                    placeholder="Enter duration (e.g., 7 days, 2 weeks)"
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="medication-time">Time</Label>
                  <Input
                    id="medication-time"
                    type="datetime-local"
                    value={medicationData.timestamp}
                    onChange={(e) => updateMedicationData({ timestamp: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="medication-notes">Notes</Label>
                  <Textarea
                    id="medication-notes"
                    value={medicationData.notes}
                    onChange={(e) => updateMedicationData({ notes: e.target.value })}
                    placeholder="Add any notes about the medication..."
                  />
                </div>
                <Button
                  onClick={() => editingActivity
                    ? updateActivity(editingActivity.id, 'medication', medicationData)
                    : addActivity('medication', medicationData)
                  }
                  className="w-full bg-gradient-to-r from-sky-500 to-pink-600 hover:from-sky-600 hover:to-pink-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {editingActivity ? 'Update' : 'Add'} Medication Entry
                </Button>
              </div>
            )}

            {selectedActivity === 'vaccination' && (
              <div className="space-y-4">
                <div>
                  <Label className="pb-1" htmlFor="vaccine-name">Vaccine Name *</Label>
                  <Input
                    id="vaccine-name"
                    value={vaccinationData.vaccineName}
                    onChange={(e) => updateVaccinationData({ vaccineName: e.target.value })}
                    placeholder="Enter vaccine name"
                    className={errors.vaccineName ? 'border-red-500' : ''}
                  />
                  {errors.vaccineName && <p className="text-red-500 text-sm mt-1">{errors.vaccineName}</p>}
                </div>
                <div>
                  <Label className="pb-1" htmlFor="dose-number">Dose Number</Label>
                  <Input
                    id="dose-number"
                    value={vaccinationData.doseNumber}
                    onChange={(e) => updateVaccinationData({ doseNumber: e.target.value })}
                    placeholder="Enter dose number (e.g., 1st, 2nd, booster)"
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="administered-by">Administered By</Label>
                  <Input
                    id="administered-by"
                    value={vaccinationData.administeredBy}
                    onChange={(e) => updateVaccinationData({ administeredBy: e.target.value })}
                    placeholder="Enter who administered the vaccine"
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="next-due">Next Due Date</Label>
                  <Input
                    id="next-due"
                    type="date"
                    value={vaccinationData.nextDueDate}
                    onChange={(e) => updateVaccinationData({ nextDueDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="vaccination-time">Time</Label>
                  <Input
                    id="vaccination-time"
                    type="datetime-local"
                    value={vaccinationData.timestamp}
                    onChange={(e) => updateVaccinationData({ timestamp: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="vaccination-notes">Notes</Label>
                  <Textarea
                    id="vaccination-notes"
                    value={vaccinationData.notes}
                    onChange={(e) => updateVaccinationData({ notes: e.target.value })}
                    placeholder="Add any notes about the vaccination..."
                  />
                </div>
                <Button
                  onClick={() => editingActivity
                    ? updateActivity(editingActivity.id, 'vaccination', vaccinationData)
                    : addActivity('vaccination', vaccinationData)
                  }
                  className="w-full bg-gradient-to-r from-sky-500 to-pink-600 hover:from-sky-600 hover:to-pink-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {editingActivity ? 'Update' : 'Add'} Vaccination Entry
                </Button>
              </div>
            )}

            {selectedActivity === 'milestone' && (
              <div className="space-y-4">
                <div>
                  <Label className="pb-1" htmlFor="milestone-type">Milestone Type *</Label>
                  <Select value={milestoneData.milestoneType} onValueChange={(value) => updateMilestoneData({ milestoneType: value })}>
                    <SelectTrigger className={errors.milestoneType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select milestone type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physical">Physical</SelectItem>
                      <SelectItem value="cognitive">Cognitive</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="emotional">Emotional</SelectItem>
                      <SelectItem value="language">Language</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.milestoneType && <p className="text-red-500 text-sm mt-1">{errors.milestoneType}</p>}
                </div>
                <div>
                  <Label className="pb-1" htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={milestoneData.description}
                    onChange={(e) => updateMilestoneData({ description: e.target.value })}
                    placeholder="Describe the milestone achievement..."
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="date-achieved">Date Achieved</Label>
                  <Input
                    id="date-achieved"
                    type="date"
                    value={milestoneData.dateAchieved}
                    onChange={(e) => updateMilestoneData({ dateAchieved: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="milestone-time">Time Recorded</Label>
                  <Input
                    id="milestone-time"
                    type="datetime-local"
                    value={milestoneData.timestamp}
                    onChange={(e) => updateMilestoneData({ timestamp: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="milestone-notes">Notes</Label>
                  <Textarea
                    id="milestone-notes"
                    value={milestoneData.notes}
                    onChange={(e) => updateMilestoneData({ notes: e.target.value })}
                    placeholder="Add any notes about the milestone..."
                  />
                </div>
                <Button
                  onClick={() => editingActivity
                    ? updateActivity(editingActivity.id, 'milestone', milestoneData)
                    : addActivity('milestone', milestoneData)
                  }
                  className="w-full bg-gradient-to-r from-sky-500 to-pink-600 hover:from-sky-600 hover:to-pink-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {editingActivity ? 'Update' : 'Add'} Milestone Entry
                </Button>
              </div>
            )}

            {selectedActivity === 'growth' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="pb-1" htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      value={growthData.weight}
                      onChange={(e) => updateGrowthData({ weight: e.target.value })}
                      placeholder="Weight"
                    />
                  </div>
                  <div>
                    <Label className="pb-1" htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      value={growthData.height}
                      onChange={(e) => updateGrowthData({ height: e.target.value })}
                      placeholder="Height"
                    />
                  </div>
                  <div>
                    <Label className="pb-1" htmlFor="head-circumference">Head Circ. (cm)</Label>
                    <Input
                      id="head-circumference"
                      type="number"
                      step="0.1"
                      value={growthData.headCircumference}
                      onChange={(e) => updateGrowthData({ headCircumference: e.target.value })}
                      placeholder="Head Circ."
                    />
                  </div>
                </div>
                {errors.growth && <p className="text-red-500 text-sm mt-1">{errors.growth}</p>}
                <div>
                  <Label className="pb-1" htmlFor="growth-date">Date</Label>
                  <Input
                    id="growth-date"
                    type="date"
                    value={growthData.date}
                    onChange={(e) => updateGrowthData({ date: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="growth-time">Time Recorded</Label>
                  <Input
                    id="growth-time"
                    type="datetime-local"
                    value={growthData.timestamp}
                    onChange={(e) => updateGrowthData({ timestamp: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="growth-notes">Notes</Label>
                  <Textarea
                    id="growth-notes"
                    value={growthData.notes}
                    onChange={(e) => updateGrowthData({ notes: e.target.value })}
                    placeholder="Add any notes about the growth measurements..."
                  />
                </div>
                <Button
                  onClick={() => editingActivity
                    ? updateActivity(editingActivity.id, 'growth', growthData)
                    : addActivity('growth', growthData)
                  }
                  className="w-full bg-gradient-to-r from-sky-500 to-pink-600 hover:from-sky-600 hover:to-pink-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {editingActivity ? 'Update' : 'Add'} Growth Entry
                </Button>
              </div>
            )}

            {selectedActivity === 'symptoms' && (
              <div className="space-y-4">
                <div>
                  <Label className="pb-1" htmlFor="symptom-type">Symptom Type *</Label>
                  <Input
                    id="symptom-type"
                    value={symptomsData.symptomType}
                    onChange={(e) => updateSymptomsData({ symptomType: e.target.value })}
                    placeholder="Enter symptom type"
                    className={errors.symptomType ? 'border-red-500' : ''}
                  />
                  {errors.symptomType && <p className="text-red-500 text-sm mt-1">{errors.symptomType}</p>}
                </div>
                <div>
                  <Label className="pb-1" htmlFor="severity">Severity</Label>
                  <Select value={symptomsData.severity} onValueChange={(value) => updateSymptomsData({ severity: value as 'mild' | 'moderate' | 'severe' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="pb-1" htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={symptomsData.description}
                    onChange={(e) => updateSymptomsData({ description: e.target.value })}
                    placeholder="Describe the symptoms..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="pb-1" htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={symptomsData.startDate}
                      onChange={(e) => updateSymptomsData({ startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="pb-1" htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={symptomsData.endDate}
                      onChange={(e) => updateSymptomsData({ endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label className="pb-1" htmlFor="symptoms-time">Time Recorded</Label>
                  <Input
                    id="symptoms-time"
                    type="datetime-local"
                    value={symptomsData.timestamp}
                    onChange={(e) => updateSymptomsData({ timestamp: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="pb-1" htmlFor="symptoms-notes">Notes</Label>
                  <Textarea
                    id="symptoms-notes"
                    value={symptomsData.notes}
                    onChange={(e) => updateSymptomsData({ notes: e.target.value })}
                    placeholder="Add any notes about the symptoms..."
                  />
                </div>
                <Button
                  onClick={() => editingActivity
                    ? updateActivity(editingActivity.id, 'symptoms', symptomsData)
                    : addActivity('symptoms', symptomsData)
                  }
                  className="w-full bg-gradient-to-r from-sky-500 to-pink-600 hover:from-sky-600 hover:to-pink-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {editingActivity ? 'Update' : 'Add'} Symptoms Entry
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
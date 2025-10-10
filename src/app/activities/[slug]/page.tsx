"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Baby,
  Moon,
  Stethoscope,
  Clock,
  Activity,
  AlertCircle,
  Milk,
  Edit,
  Save,
  X,
  ArrowLeft,
  CalendarPlus,
  MapPin,
  User,
  Building
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addToAppleCalendar, createDoctorAppointmentEvent } from "@/lib/calendar";
import { useToast } from "@/hooks/use-toast";

interface BabyActivity {
  id: string;
  type: 'feeding' | 'sleep' | 'diaper' | 'poop' | 'doctor';
  timestamp: Date;
  details: any;
  userId: string;
}

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [user, setUser] = useState<any>(null);
  const [activity, setActivity] = useState<BabyActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  
  // Form states
  const [feedingData, setFeedingData] = useState({ amount: '', notes: '' });
  const [sleepData, setSleepData] = useState({ duration: '', notes: '', startTime: '', endTime: '' });
  const [diaperData, setDiaperData] = useState({ type: '', notes: '' });
  const [poopData, setPoopData] = useState({ consistency: '', notes: '' });
  const [doctorData, setDoctorData] = useState({
    appointmentType: '',
    notes: '',
    questions: '',
    date: '',
    location: '',
    doctorName: '',
    hospitalName: ''
  });

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser && slug) {
        fetchActivity(currentUser.uid, slug);
      }
    });

    return () => unsubscribe();
  }, [slug]);

  const fetchActivity = async (userId: string, activityId: string) => {
    try {
      const docRef = doc(db, "users", userId, "activities", activityId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const activityData: BabyActivity = {
          id: docSnap.id,
          type: data.type,
          timestamp: data.timestamp.toDate(),
          details: data.details,
          userId: data.userId
        };
        
        setActivity(activityData);
        
        // Initialize form data
        switch (activityData.type) {
          case 'feeding':
            setFeedingData({
              amount: activityData.details.amount || '',
              notes: activityData.details.notes || ''
            });
            break;
          case 'sleep':
            setSleepData({
              duration: activityData.details.duration || '',
              notes: activityData.details.notes || '',
              startTime: activityData.details.startTime || '',
              endTime: activityData.details.endTime || ''
            });
            break;
          case 'diaper':
            setDiaperData({
              type: activityData.details.type || '',
              notes: activityData.details.notes || ''
            });
            break;
          case 'poop':
            setPoopData({
              consistency: activityData.details.consistency || '',
              notes: activityData.details.notes || ''
            });
            break;
          case 'doctor':
            setDoctorData({
              appointmentType: activityData.details.appointmentType || '',
              notes: activityData.details.notes || '',
              questions: activityData.details.questions || '',
              date: activityData.details.date || '',
              location: activityData.details.location || '',
              doctorName: activityData.details.doctorName || '',
              hospitalName: activityData.details.hospitalName || ''
            });
            break;
        }
      }
    } catch (error) {
      console.error("Error fetching activity:", error);
    } finally {
      setLoading(false);
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
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateActivity = async () => {
    if (!user || !activity) return;

    let data: any;
    let isValid = false;

    switch (activity.type) {
      case 'feeding':
        data = feedingData;
        isValid = validateForm('feeding', data);
        break;
      case 'sleep':
        data = sleepData;
        isValid = validateForm('sleep', data);
        break;
      case 'diaper':
        data = diaperData;
        isValid = validateForm('diaper', data);
        break;
      case 'poop':
        data = poopData;
        isValid = validateForm('poop', data);
        break;
      case 'doctor':
        data = doctorData;
        isValid = validateForm('doctor', data);
        break;
    }

    if (!isValid) return;

    try {
      await updateDoc(doc(db, "users", user.uid, "activities", activity.id), {
        details: data
      });

      // Update local state
      setActivity(prev => prev ? { ...prev, details: data } : null);
      setIsEditing(false);
      setErrors({});
      
      // Show success toast
      toast({
        title: "Activity Updated!",
        description: `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} entry has been updated successfully.`,
      });
    } catch (error) {
      console.error("Error updating activity:", error);
      toast({
        title: "Error",
        description: "Failed to update activity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'feeding': return <Milk className="h-6 w-6" />;
      case 'sleep': return <Moon className="h-6 w-6" />;
      case 'diaper': return <Activity className="h-6 w-6" />;
      case 'poop': return <AlertCircle className="h-6 w-6" />;
      case 'doctor': return <Stethoscope className="h-6 w-6" />;
      default: return <Clock className="h-6 w-6" />;
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

  const addToCalendar = () => {
    if (activity && activity.type === 'doctor') {
      try {
        const calendarEvent = createDoctorAppointmentEvent(activity.details);
        addToAppleCalendar(calendarEvent);
        
        // Show success toast
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
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Milk className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-lg">{activity.details.amount} oz</span>
            </div>
            {activity.details.notes && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Notes:</p>
                <p className="leading-relaxed">{activity.details.notes}</p>
              </div>
            )}
          </div>
        );
      case 'sleep':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-purple-500" />
              <span className="font-medium text-lg">{activity.details.duration} hours</span>
            </div>
            {activity.details.startTime && activity.details.endTime && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Time:</p>
                <p>{activity.details.startTime} - {activity.details.endTime}</p>
              </div>
            )}
            {activity.details.notes && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Notes:</p>
                <p className="leading-relaxed">{activity.details.notes}</p>
              </div>
            )}
          </div>
        );
      case 'diaper':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-green-500" />
              <span className="font-medium text-lg capitalize">{activity.details.type}</span>
            </div>
            {activity.details.notes && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Notes:</p>
                <p className="leading-relaxed">{activity.details.notes}</p>
              </div>
            )}
          </div>
        );
      case 'poop':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="font-medium text-lg capitalize">{activity.details.consistency}</span>
            </div>
            {activity.details.notes && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Notes:</p>
                <p className="leading-relaxed">{activity.details.notes}</p>
              </div>
            )}
          </div>
        );
      case 'doctor':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-5 w-5 text-red-500" />
              <span className="font-medium text-lg">{activity.details.appointmentType}</span>
            </div>
            {activity.details.date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarPlus className="h-4 w-4" />
                <span>{new Date(activity.details.date).toLocaleString()}</span>
              </div>
            )}
            {activity.details.doctorName && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Doctor:</span>
                <span>{activity.details.doctorName}</span>
              </div>
            )}
            {activity.details.hospitalName && (
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Hospital:</span>
                <span>{activity.details.hospitalName}</span>
              </div>
            )}
            {activity.details.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Location:</span>
                <span>{activity.details.location}</span>
              </div>
            )}
            {activity.details.notes && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Doctor Notes:</p>
                <p className="leading-relaxed">{activity.details.notes}</p>
              </div>
            )}
            {activity.details.questions && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Questions:</p>
                <p className="leading-relaxed">{activity.details.questions}</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const renderEditForm = () => {
    if (!activity) return null;

    switch (activity.type) {
      case 'feeding':
        return (
          <div className="space-y-4">
            <div>
              <Label className="pb-1" htmlFor="amount">Amount (oz) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.1"
                value={feedingData.amount}
                onChange={(e) => setFeedingData(prev => ({ ...prev, amount: e.target.value }))}
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
            </div>
            <div>
              <Label className="pb-1" htmlFor="feeding-notes">Notes</Label>
              <Textarea
                id="feeding-notes"
                value={feedingData.notes}
                onChange={(e) => setFeedingData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add feeding notes..."
              />
            </div>
          </div>
        );
      case 'sleep':
        return (
          <div className="space-y-4">
            <div>
              <Label className="pb-1" htmlFor="duration">Duration (hours) *</Label>
              <Input
                id="duration"
                type="number"
                step="0.1"
                value={sleepData.duration}
                onChange={(e) => setSleepData(prev => ({ ...prev, duration: e.target.value }))}
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
                  onChange={(e) => setSleepData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <Label className="pb-1" htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={sleepData.endTime}
                  onChange={(e) => setSleepData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label className="pb-1" htmlFor="sleep-notes">Notes</Label>
              <Textarea
                id="sleep-notes"
                value={sleepData.notes}
                onChange={(e) => setSleepData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add sleep notes..."
              />
            </div>
          </div>
        );
      case 'diaper':
        return (
          <div className="space-y-4">
            <div>
              <Label className="pb-1" htmlFor="type">Type *</Label>
              <Select value={diaperData.type} onValueChange={(value) => setDiaperData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select diaper type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wet">Wet</SelectItem>
                  <SelectItem value="dirty">Dirty</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                  <SelectItem value="dry">Dry</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
            </div>
            <div>
              <Label className="pb-1" htmlFor="diaper-notes">Notes</Label>
              <Textarea
                id="diaper-notes"
                value={diaperData.notes}
                onChange={(e) => setDiaperData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add diaper change notes..."
              />
            </div>
          </div>
        );
      case 'poop':
        return (
          <div className="space-y-4">
            <div>
              <Label className="pb-1" htmlFor="consistency">Consistency *</Label>
              <Select value={poopData.consistency} onValueChange={(value) => setPoopData(prev => ({ ...prev, consistency: value }))}>
                <SelectTrigger className={errors.consistency ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select consistency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="formed">Formed</SelectItem>
                  <SelectItem value="soft">Soft</SelectItem>
                  <SelectItem value="loose">Loose</SelectItem>
                  <SelectItem value="watery">Watery</SelectItem>
                </SelectContent>
              </Select>
              {errors.consistency && <p className="text-red-500 text-sm mt-1">{errors.consistency}</p>}
            </div>
            <div>
              <Label className="pb-1" htmlFor="poop-notes">Notes</Label>
              <Textarea
                id="poop-notes"
                value={poopData.notes}
                onChange={(e) => setPoopData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add poop notes..."
              />
            </div>
          </div>
        );
      case 'doctor':
        return (
          <div className="space-y-4">
            <div>
              <Label className="pb-1" htmlFor="appointment-type">Appointment Type *</Label>
              <Input
                id="appointment-type"
                value={doctorData.appointmentType}
                onChange={(e) => setDoctorData(prev => ({ ...prev, appointmentType: e.target.value }))}
                className={errors.appointmentType ? 'border-red-500' : ''}
              />
              {errors.appointmentType && <p className="text-red-500 text-sm mt-1">{errors.appointmentType}</p>}
            </div>
            <div>
              <Label className="pb-1" htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="datetime-local"
                value={doctorData.date}
                onChange={(e) => setDoctorData(prev => ({ ...prev, date: e.target.value }))}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>
            <div>
              <Label className="pb-1" htmlFor="doctor-name">Doctor Name</Label>
              <Input
                id="doctor-name"
                value={doctorData.doctorName}
                onChange={(e) => setDoctorData(prev => ({ ...prev, doctorName: e.target.value }))}
                placeholder="Dr. Smith"
              />
            </div>
            <div>
              <Label className="pb-1" htmlFor="hospital-name">Hospital Name</Label>
              <Input
                id="hospital-name"
                value={doctorData.hospitalName}
                onChange={(e) => setDoctorData(prev => ({ ...prev, hospitalName: e.target.value }))}
                placeholder="General Hospital"
              />
            </div>
            <div>
              <Label className="pb-1" htmlFor="location">Location</Label>
              <Input
                id="location"
                value={doctorData.location}
                onChange={(e) => setDoctorData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="123 Medical Center Dr"
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
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 animate-spin" />
          <p>Loading activity details...</p>
        </div>
      </div>
    );
  }

  if (!user || !activity) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Activity not found or you don't have permission to view it.</p>
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

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                {getActivityIcon(activity.type)}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} Activity
                </h1>
                <p className="text-muted-foreground">
                  {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity Details */}
            <div className="lg:col-span-2">
              <Card className="bg-background/60 backdrop-blur-sm border-border/40">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Badge className={getActivityColor(activity.type)}>
                          {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Activity details and information
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {activity.type === 'doctor' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addToCalendar}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CalendarPlus className="mr-2 h-4 w-4" />
                          Add to Calendar
                        </Button>
                      )}
                      <Button
                        variant={isEditing ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? (
                          <>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </>
                        ) : (
                          <>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-6">
                      {renderEditForm()}
                      <div className="flex space-x-2 pt-4">
                        <Button
                          onClick={updateActivity}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {formatActivityDetails(activity)}
                      
                      <div className="pt-4 border-t border-border/40">
                        <h4 className="font-medium mb-3">Additional Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-muted-foreground">Created:</span>
                            <span className="ml-2">{activity.timestamp.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Type:</span>
                            <span className="ml-2 capitalize">{activity.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="bg-background/60 backdrop-blur-sm border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {isEditing ? 'Cancel Edit' : 'Edit Activity'}
                  </Button>
                  {activity.type === 'doctor' && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={addToCalendar}
                    >
                      <CalendarPlus className="mr-2 h-4 w-4" />
                      Add to Calendar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/activities')}
                  >
                    <Activity className="mr-2 h-4 w-4" />
                    View All Activities
                  </Button>
                </CardContent>
              </Card>

              {/* Activity Info */}
              <Card className="bg-background/60 backdrop-blur-sm border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg">Activity Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge className={getActivityColor(activity.type)}>
                      {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{activity.timestamp.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span>{activity.timestamp.toLocaleTimeString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
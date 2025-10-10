"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  Clock,
  CalendarPlus,
  Plus,
  Edit,
  X,
  MapPin,
  User,
  Building,
  AlertCircle
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
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

interface DoctorAppointment {
  id: string;
  timestamp: Date;
  appointmentType: string;
  date: Date;
  notes?: string;
  questions?: string;
  location?: string;
  doctorName?: string;
  hospitalName?: string;
}

export default function AppointmentsPage() {
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchAppointments(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchAppointments = async (userId: string) => {
    const q = query(collection(db, "users", userId, "activities"), where("userId", "==", userId), where("type", "==", "doctor"));
    const querySnapshot = await getDocs(q);
    const appointmentsData = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        timestamp: data.timestamp.toDate(),
        appointmentType: data.details.appointmentType,
        date: new Date(data.details.date),
        notes: data.details.notes,
        questions: data.details.questions,
        location: data.details.location,
        doctorName: data.details.doctorName,
        hospitalName: data.details.hospitalName
      };
    }) as DoctorAppointment[];
    
    // Sort by appointment date (upcoming first)
    appointmentsData.sort((a, b) => a.date.getTime() - b.date.getTime());
    setAppointments(appointmentsData);
  };

  const deleteAppointment = async (id: string) => {
    try {
      const appointmentToDelete = appointments.find(a => a.id === id);
      await deleteDoc(doc(db, "users", user.uid, "activities", id));
      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
      
      // Show success toast
      if (appointmentToDelete) {
        toast({
          title: "Appointment Deleted!",
          description: `${appointmentToDelete.appointmentType} appointment has been removed.`,
        });
      }
    } catch (error) {
      console.error("Error deleting appointment: ", error);
      toast({
        title: "Error",
        description: "Failed to delete appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addToCalendar = (appointment: DoctorAppointment) => {
    try {
      const calendarEvent = createDoctorAppointmentEvent({
        appointmentType: appointment.appointmentType,
        date: appointment.date.toISOString(),
        notes: appointment.notes,
        questions: appointment.questions,
        location: appointment.location,
        doctorName: appointment.doctorName,
        hospitalName: appointment.hospitalName
      });
      addToAppleCalendar(calendarEvent);
      
      // Show success toast
      toast({
        title: "Calendar Added!",
        description: `${appointment.appointmentType} appointment added to Apple Calendar.`,
      });
    } catch (error) {
      console.error("Error adding to calendar:", error);
      toast({
        title: "Calendar Error",
        description: "Failed to add to Apple Calendar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isUpcoming = (date: Date) => {
    return date.getTime() > Date.now();
  };

  const getAppointmentStatus = (date: Date) => {
    const now = new Date();
    const appointmentDate = new Date(date);
    const diffTime = appointmentDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: 'past', label: 'Past', color: 'bg-gray-100 text-gray-800' };
    } else if (diffDays === 0) {
      return { status: 'today', label: 'Today', color: 'bg-red-100 text-red-800' };
    } else if (diffDays === 1) {
      return { status: 'tomorrow', label: 'Tomorrow', color: 'bg-yellow-100 text-yellow-800' };
    } else if (diffDays <= 7) {
      return { status: 'this-week', label: 'This Week', color: 'bg-blue-100 text-blue-800' };
    } else {
      return { status: 'upcoming', label: 'Upcoming', color: 'bg-green-100 text-green-800' };
    }
  };

  if (!user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Please sign in to view your appointments.</p>
        </div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(apt => isUpcoming(apt.date));
  const pastAppointments = appointments.filter(apt => !isUpcoming(apt.date));

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
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Appointments
                </h1>
                <p className="text-muted-foreground">Manage your baby's medical appointments</p>
              </div>
            </div>

            <Link href="/">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Appointment
              </Button>
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-background/60 backdrop-blur-sm border-border/40">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold mb-1 text-blue-600">{upcomingAppointments.length}</div>
                <div className="text-sm text-muted-foreground">Upcoming Appointments</div>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur-sm border-border/40">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold mb-1 text-red-600">
                  {appointments.filter(apt => {
                    const status = getAppointmentStatus(apt.date);
                    return status.status === 'today';
                  }).length}
                </div>
                <div className="text-sm text-muted-foreground">Today's Appointments</div>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur-sm border-border/40">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold mb-1 text-gray-600">{pastAppointments.length}</div>
                <div className="text-sm text-muted-foreground">Past Appointments</div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <CalendarPlus className="mr-2 h-5 w-5 text-blue-600" />
                Upcoming Appointments
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {upcomingAppointments.map((appointment) => {
                  const status = getAppointmentStatus(appointment.date);
                  return (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-background/60 backdrop-blur-sm border-border/40 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg">
                                <Stethoscope className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{appointment.appointmentType}</CardTitle>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge className={status.color}>
                                    {status.label}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {appointment.date.toLocaleDateString()} at {appointment.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => addToCalendar(appointment)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Add to Apple Calendar"
                              >
                                <CalendarPlus className="h-4 w-4" />
                              </Button>
                              <Link href={`/activities/${appointment.id}`}>
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
                                onClick={() => deleteAppointment(appointment.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {appointment.doctorName && (
                              <div className="flex items-center space-x-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Doctor:</span>
                                <span>{appointment.doctorName}</span>
                              </div>
                            )}
                            {appointment.hospitalName && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Hospital:</span>
                                <span>{appointment.hospitalName}</span>
                              </div>
                            )}
                            {appointment.location && (
                              <div className="flex items-center space-x-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Location:</span>
                                <span>{appointment.location}</span>
                              </div>
                            )}
                            {appointment.notes && (
                              <div className="text-sm">
                                <span className="font-medium text-muted-foreground">Notes:</span>
                                <p className="mt-1">{appointment.notes}</p>
                              </div>
                            )}
                            {appointment.questions && (
                              <div className="text-sm">
                                <span className="font-medium text-muted-foreground">Questions:</span>
                                <p className="mt-1">{appointment.questions}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Clock className="mr-2 h-5 w-5 text-gray-600" />
                Past Appointments
              </h2>
              <div className="space-y-4">
                {pastAppointments.map((appointment) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-background/60 backdrop-blur-sm border-border/40">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-grow">
                            <div className="p-2 rounded-lg bg-background mt-1">
                              <Stethoscope className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-medium">{appointment.appointmentType}</h3>
                                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                  Past
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {appointment.date.toLocaleDateString()} at {appointment.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {appointment.doctorName && (
                                  <div>
                                    <span className="font-medium text-muted-foreground">Doctor:</span>
                                    <span className="ml-2">{appointment.doctorName}</span>
                                  </div>
                                )}
                                {appointment.hospitalName && (
                                  <div>
                                    <span className="font-medium text-muted-foreground">Hospital:</span>
                                    <span className="ml-2">{appointment.hospitalName}</span>
                                  </div>
                                )}
                              </div>
                              {appointment.notes && (
                                <div className="mt-2">
                                  <span className="font-medium text-muted-foreground">Notes:</span>
                                  <p className="mt-1 text-sm">{appointment.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Link href={`/activities/${appointment.id}`}>
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
                              onClick={() => deleteAppointment(appointment.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {appointments.length === 0 && (
            <Card className="bg-background/60 backdrop-blur-sm border-border/40">
              <CardContent className="text-center py-12">
                <Stethoscope className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No appointments yet</h3>
                <p className="text-muted-foreground mb-6">Schedule your baby's first medical appointment</p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Appointment
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
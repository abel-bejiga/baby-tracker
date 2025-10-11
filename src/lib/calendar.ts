// Apple Calendar integration utilities
export interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  location?: string;
}

/**
 * Generate an .ics file for Apple Calendar
 */
export const generateICSFile = (event: CalendarEvent): string => {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const endDate = event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000); // Default 1 hour duration

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Baby Tracker//EN
BEGIN:VEVENT
UID:${Date.now()}-baby-tracker@abelbejiga.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(event.startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.title}
${event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : ''}
${event.location ? `LOCATION:${event.location}` : ''}
END:VEVENT
END:VCALENDAR`;
};

/**
 * Download and add event to Apple Calendar
 */
export const addToAppleCalendar = (event: CalendarEvent): void => {
  const icsContent = generateICSFile(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/\s+/g, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Create calendar event from doctor appointment
 */
export const createDoctorAppointmentEvent = (appointment: {
  appointmentType: string;
  date: string;
  notes?: string;
  questions?: string;
}): CalendarEvent => {
  const startDate = new Date(appointment.date);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
  
  const description = [
    appointment.notes ? `Doctor's Notes: ${appointment.notes}` : '',
    appointment.questions ? `Questions: ${appointment.questions}` : '',
    'Created with Baby Tracker by abelbejiga.com'
  ].filter(Boolean).join('\n\n');

  return {
    title: `Baby Doctor Appointment - ${appointment.appointmentType}`,
    startDate,
    endDate,
    description: description || undefined,
    location: "Doctor's Office"
  };
};
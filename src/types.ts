export type UserRole = 'Admin' | 'Organizer' | 'Volunteer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Event {
  id: string;
  eventName: string;
  date: string;
  venue: string;
  description: string;
  qrType: string;
  organizer: string;
}

export interface Attendance {
  id: string;
  attendeeName: string;
  attendeeEmail: string;
  company: string;
  designation: string;
  event: string; // Event ID or Event Name
  scannedAt: string; // ISO string
  attendanceStatus: 'checked-in' | 'pending' | 'flagged';
}

export interface AIInsight {
  summary: string;
  groupings: Array<{
    categoryName: string;
    members: string[]; // Attendee names
    reasoning: string;
  }>;
  suggestions: string[];
}

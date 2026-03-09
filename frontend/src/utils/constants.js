import { Clock, Users, FileText, User, CheckCircle } from 'lucide-react';

export const APP_CONFIG = {
  TITLE: 'Faculty Leave Management',
  SUBTITLE: 'College of Engineering & Technology',
  DEMO_HOD_EMAIL: 'computer.hod@college.edu',
  DEMO_FACULTY_EMAIL: 'profmichaelchen@college.edu'
};

export const HOD_TABS = [
  { id: 'pending', label: 'Pending Approvals', icon: Clock, mobileLabel: 'Pending' },
  { id: 'faculty', label: 'Department Faculty', icon: Users, mobileLabel: 'Faculty' },
  { id: 'history', label: 'Approval History', icon: FileText, mobileLabel: 'History' }
];

export const FACULTY_TABS = [
  { id: 'details', label: 'Faculty Details', icon: User, mobileLabel: 'Details' },
  { id: 'apply', label: 'Apply Leave', icon: FileText, mobileLabel: 'Apply' },
  { id: 'status', label: 'Leave Status', icon: CheckCircle, mobileLabel: 'Status' }
];

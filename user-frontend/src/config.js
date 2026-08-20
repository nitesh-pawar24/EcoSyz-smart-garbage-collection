// frontend/src/config.js

export const PRIMARY_COLOR = 'green';
export const PRIMARY_DARK = 'green-800';
export const PRIMARY_MEDIUM = 'green-700';
export const PRIMARY_LIGHT = 'green-100';
export const ACCENT_COLOR = 'emerald-600';

export const quickLinks = [
    { name: 'How it works', view: 'howItWorks' },
    { name: 'Submit Complaint', view: 'submitComplaint' },
    { name: 'Statistics', view: 'statisticsReports' },
    { name: 'View Schedule', view: 'viewSchedule' },
    { name: 'Guides / Resources', view: 'guidesResources' },
    { name: 'Events & Workshops', view: 'eventsWorkshops' },
    { name: 'News & Updates', view: 'newsUpdates' },
    { name: 'Photo Gallery', view: 'gallery' },
    { name: 'Legal & Transparency', view: 'legal' },
    { name: 'FAQ’s & Feedback', view: 'faqsFeedback' },
];

export const committeeMembers = [
    { name: 'Dr. Sarah Cole', designation: 'Chairperson', contact: '9999999999' },
    { name: 'Mr. John Davis', designation: 'Vice Chair', contact: '9999999999' },
    { name: 'Ms. Emily Zhao', designation: 'Secretary', contact: '9999999999' },
    { name: 'Mr. Alex Singh', designation: 'Treasurer', contact: '9999999999' },
];

export const contactMembers = [
    { name: 'Asha Verma', designation: 'Chairperson', phone: '+91 99999 99999', email: 'ashaverma@gmail.com' },
    { name: 'Mera Das', designation: 'Secretary', phone: '+91 99999 99999', email: 'meradas@gmail.com' },
    { name: 'Ravi Kumar', designation: 'Manager', phone: '+91 99999 99999', email: 'ravikumar@gmail.com' },
    { name: 'Sanjay Rao', designation: 'Garbage Committee Head', phone: '+91 99999 99999', email: 'sanjayrao@gmail.com' },
];

export const eventsData = new Array(9).fill(0).map((_, i) => ({
    id: i,
    title: i % 3 === 0
        ? 'Plantation Drive'
        : i % 3 === 1
            ? 'Community Clean-up'
            : 'Recycling Workshop',
    description:
        "The Foundation organized a plantation drive at Mobor, this green initiative witnessed participation from over 50 volunteers.",
    date: '2025-09-13',
    time: '10:00 AM',
    location: 'Mobor Beach',
    participants: '30+',
}));

/* -----------------------------
   NEW CONTENT DATA FOR QUICKLINK PAGES
   (Only Added — Nothing Modified)
------------------------------ */

export const statisticsData = [
    { title: 'Total Houses Covered', value: '2,500+' },
    { title: 'Waste Collected (Monthly)', value: '35 Tons' },
    { title: 'Active Workers', value: '48' },
    { title: 'Complaints Resolved', value: '92%' },
];

export const scheduleData = [
    {
        ward: 'Ward 1',
        days: 'Monday, Wednesday, Friday',
        time: '7:00 AM – 10:00 AM',
    },
    {
        ward: 'Ward 2',
        days: 'Tuesday, Thursday, Saturday',
        time: '8:00 AM – 11:00 AM',
    },
    {
        ward: 'Ward 3',
        days: 'Monday – Saturday',
        time: '6:30 AM – 9:30 AM',
    },
];

export const faqsData = [
    {
        question: 'How do I report a missed collection?',
        answer: 'You can use the Submit Complaint form available in Quick Links.',
    },
    {
        question: 'How is worker attendance verified?',
        answer: 'Attendance is verified using QR code scanning and GPS validation.',
    },
    {
        question: 'Can I track complaint status?',
        answer: 'Yes, complaints are logged and monitored by the Panchayat Admin dashboard.',
    },
];
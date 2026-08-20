import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './component/Navbar';
import Home from './component/Home';
import About from './component/About';
import Contact from './component/Contact';
import ComplaintPage from './component/ComplaintPage';
import QuickLinkPage from './component/shared/QuickLinkPage';
import FAQsPage from './component/FAQsPage';
import NewsUpdatesPage from './component/NewsUpdatesPage';
import EventsPage from './component/EventsPage';
import GuidesResourcesPage from './component/GuidesResourcesPage';
import ViewSchedulePage from './component/ViewSchedulePage';
import StatisticsPage from './component/StatisticsPage';
import HowItWorksPage from './component/HowItWorksPage';
import GalleryPage from './component/GalleryPage';
import LegalTransparencyPage from './component/LegalTransparencyPage';

// Auth Pages
import LoginPage from './component/auth/LoginPage';
import LoginHousehold from './component/auth/LoginHousehold';
import LoginCompany from './component/auth/LoginCompany';
import ForgotPasswordPage from './component/auth/ForgotPasswordPage';
import RegisterPage from './component/RegisterPage';

import { PanchayatProvider } from './context/PanchayatContext';
import PanchayatModal from './component/shared/PanchayatModal';
import GlobalScrollLock from './component/shared/GlobalScrollLock';

// Dashboard Pages
import HouseholdDashboard from './component/dashboard/HouseholdDashboard';
import CompanyDashboard from './component/dashboard/CompanyDashboard';
import AdminDashboard from './component/dashboard/AdminDashboard';

// Feature Pages
import ScheduleBooking from './component/ScheduleBooking';
import UserProfile from './component/UserProfile';
import PaymentHistory from './component/PaymentHistory';

// Management Pages
import UsersManagement from './component/management/UsersManagement';
import CompaniesManagement from './component/management/CompaniesManagement';
import FleetManagement from './component/management/FleetManagement';
import ComplaintsManagement from './component/management/ComplaintsManagement';
import SystemSettings from './component/management/SystemSettings';

function App() {
    const [view, setView] = useState(() => {
        return sessionStorage.getItem('currentView') || 'home';
    });

    const navigate = (newView) => {
        setView(newView);
        sessionStorage.setItem('currentView', newView);
        window.scrollTo(0, 0);
    };

    const renderView = () => {
        switch (view) {
            case 'home':
                return <Home navigate={navigate} />;

            case 'about':
                return <About navigate={navigate} />;

            case 'contact':
                return <Contact navigate={navigate} />;

            case 'complaint':
                return <ComplaintPage navigate={navigate} />;

            // Auth Pages - Login
            case 'login':
                return <LoginPage navigate={navigate} />;

            case 'login-household':
                return <LoginHousehold navigate={navigate} />;

            case 'login-company':
                return <LoginCompany navigate={navigate} />;

            case 'forgot-password':
                return <ForgotPasswordPage navigate={navigate} />;

            case 'register':
                return <RegisterPage navigate={navigate} />;

            // Dashboard Pages
            case 'household-dashboard':
                return <HouseholdDashboard navigate={navigate} />;

            case 'company-dashboard':
                return <CompanyDashboard navigate={navigate} />;

            case 'admin-dashboard':
                return <AdminDashboard navigate={navigate} />;

            // Feature Pages
            case 'schedule-booking':
                return <ScheduleBooking navigate={navigate} />;

            case 'user-profile':
                return <UserProfile navigate={navigate} />;

            case 'payments':
                return <PaymentHistory navigate={navigate} />;

            // Management Pages
            case 'users-management':
                return <UsersManagement navigate={navigate} />;

            case 'companies-management':
                return <CompaniesManagement navigate={navigate} />;

            case 'fleet-management':
                return <FleetManagement navigate={navigate} />;

            case 'complaints-management':
                return <ComplaintsManagement navigate={navigate} />;

            case 'system-settings':
                return <SystemSettings navigate={navigate} />;

            /* ----------- QUICK LINKS ----------- */

            case 'howItWorks':
                return <HowItWorksPage navigate={navigate} />;

            case 'submitComplaint':
                return <ComplaintPage navigate={navigate} />;

            case 'statisticsReports':
                return <StatisticsPage navigate={navigate} />;

            case 'viewSchedule':
                return <ViewSchedulePage navigate={navigate} />;

            case 'guidesResources':
                return <GuidesResourcesPage navigate={navigate} />;

            case 'eventsWorkshops':
                return <EventsPage navigate={navigate} />;

            case 'newsUpdates':
                return <NewsUpdatesPage navigate={navigate} />;

            case 'gallery':
                return <GalleryPage navigate={navigate} />;

            case 'legal':
                return <LegalTransparencyPage navigate={navigate} />;

            case 'faqsFeedback':
                return <FAQsPage navigate={navigate} />;

            default:
                return <Home navigate={navigate} />;
        }
    };

    return (
        <PanchayatProvider>
            <GlobalScrollLock />
            <Navbar navigate={navigate} currentPage={view} />
            {renderView()}
            <PanchayatModal />
            <ToastContainer
                position="top-right"
                autoClose={3500}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                toastClassName="!rounded-2xl !shadow-xl !font-sans !text-sm"
                progressClassName="!bg-green-500"
            />
        </PanchayatProvider>
    );
}

export default App;
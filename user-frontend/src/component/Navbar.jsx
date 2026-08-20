import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Leaf, Menu, X as Close, MapPin, Edit3, User as UserIcon, LogOut, LayoutDashboard, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { quickLinks } from '../config';
import { usePanchayat } from '../context/PanchayatContext';
import LogoutConfirmModal from './shared/LogoutConfirmModal';

const Navbar = ({ currentPage, navigate }) => {
    const { selectedPanchayat, setIsPanchayatModalOpen } = usePanchayat();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const dropdownRef = useRef(null);
    const profileRef = useRef(null);

    // Auth
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const isLoggedIn = !!token && !!user;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        setIsProfileOpen(false);
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setShowLogoutModal(false);
        navigate('home');
    };

    const navigateToDashboard = () => {
        setIsProfileOpen(false);
        if (user?.role === 'COMPANY') return navigate('company-dashboard');
        if (user?.role === 'ADMIN' || user?.role === 'PANCHAYAT_ADMIN') return navigate('admin-dashboard');
        return navigate('household-dashboard');
    };

    const navItems = [
        { name: 'Home', view: 'home' },
        { name: 'About', view: 'about' },
        { name: 'Contact', view: 'contact' },
    ];

    const menuVariants = {
        hidden: { opacity: 0, y: -8, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: 'easeOut' } },
        exit: { opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.12 } }
    };

    return (
        <>
        <header className={`sticky top-0 left-0 w-full z-50 transition-all duration-300 ${
            scrolled ? 'glass shadow-md' : 'bg-white/90 backdrop-blur-md'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

                {/* ── LOGO ── */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('home')}
                        className="flex items-center gap-2 group"
                    >
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center shadow-sm group-hover:shadow-green-300 transition-all">
                            <Leaf className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-display text-lg font-bold text-gray-900 tracking-tight">EcoSyz</span>
                    </button>

                    {/* Panchayat chip */}
                    {selectedPanchayat && (
                        <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="hidden lg:flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1"
                        >
                            <MapPin className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-xs font-semibold text-green-800 max-w-[130px] truncate">
                                {selectedPanchayat.name}
                            </span>
                            <button
                                onClick={() => setIsPanchayatModalOpen(true)}
                                title="Change Panchayat"
                                className="ml-1 text-green-500 hover:text-green-700 transition-colors"
                            >
                                <Edit3 className="w-3 h-3" />
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* ── DESKTOP NAV ── */}
                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                        <button
                            key={item.view}
                            onClick={() => navigate(item.view)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                currentPage === item.view
                                    ? 'bg-green-50 text-green-700'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            {item.name}
                        </button>
                    ))}

                    {/* Quick Links dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
                        >
                            Quick Links
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div
                                    variants={menuVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 py-1"
                                >
                                    {quickLinks.map((link) => (
                                        <button
                                            key={link.name}
                                            onClick={() => { navigate(link.view); setIsDropdownOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                                        >
                                            {link.name}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </nav>

                {/* ── ACTIONS ── */}
                <div className="flex items-center gap-2">
                    {isLoggedIn ? (
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 hover:border-green-400 transition-all shadow-sm"
                            >
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                                    {user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <span className="text-sm font-semibold text-gray-800 max-w-[80px] truncate hidden sm:block">
                                    {user?.name?.split(' ')[0]}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        variants={menuVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                                    >
                                        <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                                            <p className="text-xs text-green-600 font-medium">Signed in as</p>
                                            <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                                        </div>
                                        <div className="py-1">
                                            <button
                                                onClick={navigateToDashboard}
                                                className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                                            >
                                                <LayoutDashboard className="w-4 h-4" />
                                                My Dashboard
                                            </button>
                                        </div>
                                        <div className="py-1 border-t border-gray-50">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('register')}
                                className="btn-outline text-sm px-4 py-2"
                            >
                                Register
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('login-household')}
                                className="btn-primary text-sm px-5 py-2"
                            >
                                Login
                            </motion.button>
                        </div>
                    )}

                    {/* Mobile menu toggle */}
                    <button
                        className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <Close className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* ── MOBILE MENU ── */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
                    >
                        <div className="px-4 py-3 space-y-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.view}
                                    onClick={() => { navigate(item.view); setIsMobileMenuOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                        currentPage === item.view
                                            ? 'bg-green-50 text-green-700'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {item.name}
                                </button>
                            ))}
                            <div className="border-t border-gray-100 pt-2 mt-2">
                                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Quick Links</p>
                                {quickLinks.slice(0, 4).map((link) => (
                                    <button
                                        key={link.name}
                                        onClick={() => { navigate(link.view); setIsMobileMenuOpen(false); }}
                                        className="w-full text-left px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                                    >
                                        {link.name}
                                    </button>
                                ))}
                            </div>
                            {selectedPanchayat && (
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 rounded-xl border border-green-200 mt-2">
                                    <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    <span className="text-sm font-medium text-green-800 flex-1 truncate">{selectedPanchayat.name}</span>
                                    <button onClick={() => setIsPanchayatModalOpen(true)} className="text-green-500 hover:text-green-700">
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
        <LogoutConfirmModal
            isOpen={showLogoutModal}
            onConfirm={confirmLogout}
            onCancel={() => setShowLogoutModal(false)}
        />
    </>);
};

export default Navbar;

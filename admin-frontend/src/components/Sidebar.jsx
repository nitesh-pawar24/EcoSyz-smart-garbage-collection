"use client";

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '../contexts/ThemeContext'
import { X, Home, Settings, BarChart3, FileText, BookOpen, Image, TrendingUp, Users, Scale, ChevronDown, Users2, Clock, Trash2, Home as HomeIcon, MapPin, CalendarDays, Newspaper, Calendar, MessageSquare, Mail } from 'lucide-react'
import logo from '../assets/images/logo.png'

export default function Sidebar({ isOpen, onClose }) {
  const { isDark } = useTheme()
  const pathname = usePathname() || ""
  const isOperationalActive = pathname.startsWith('/employee') || 
                               pathname.startsWith('/attendance') || 
                               pathname.startsWith('/dustbin') || 
                               pathname.startsWith('/household') ||
                               pathname.startsWith('/ward') ||
                               pathname.startsWith('/route')

  const [expandOperational, setExpandOperational] = useState(isOperationalActive)
  
  useEffect(() => {
    if (isOperationalActive) setExpandOperational(true)
  }, [isOperationalActive])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isOpen) onClose()
  }, [pathname])

  const isActive = (path) => pathname === path

  const NavLink = ({ to, icon: Icon, label, small = false }) => {
    const active = isActive(to)
    return (
      <Link
        href={to}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative ${
          active
            ? 'bg-gradient-to-r from-[#1f9e9a] to-[#16847f] text-white shadow-md shadow-teal-500/25'
            : `${!isDark ? '!text-black' : 'text-slate-300'} hover:text-black dark:hover:text-white hover:bg-teal-50 dark:hover:bg-teal-900/20`
        }`}
      >
        {active && (
          <span className="absolute left-0 inset-y-0 w-0.5 rounded-r bg-teal-300/60" />
        )}
        <Icon size={small ? 16 : 18} className={active ? 'text-white' : `${!isDark ? '!text-slate-800' : 'text-slate-400'} group-hover:text-teal-600 transition-colors`} />
        <span className={`${small ? 'text-xs' : 'text-sm'} font-medium leading-tight`}>{label}</span>
      </Link>
    )
  }

  const SectionLabel = ({ label }) => (
    <p className={`text-[10px] font-bold ${!isDark ? '!text-black' : 'text-slate-500'} uppercase tracking-[1.5px] px-4 mb-2 mt-1`}>{label}</p>
  )

  const logoSrc = typeof logo === 'object' && logo.src ? logo.src : logo

  return (
    <div 
      className={`fixed left-0 top-0 w-64 h-screen overflow-y-auto flex flex-col transition-all duration-300 z-[10001] 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        border-r lg:border-r-0`}
      style={{
        background: isDark 
          ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' 
          : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        borderRight: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 dark:border-white/5 flex-shrink-0 relative">
        <div className="flex items-center gap-3">
          <img src={logoSrc} alt="EcoSyz Logo" className="w-9 h-9 object-contain drop-shadow-md" />
          <div>
            <p className={`${!isDark ? '!text-black' : 'text-gray-100'} font-bold text-sm leading-tight`}>EcoSyz Admin</p>
            <p className={`${!isDark ? '!text-slate-800' : 'text-gray-500'} text-[10px] font-medium`}>Panchayat Management</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">

        {/* Main */}
        <div>
          <SectionLabel label="Main" />
          <div className="space-y-1">
            <NavLink to="/dashboard" icon={Home} label="Central Admin Dashboard" />
          </div>
        </div>

        {/* Operational */}
        <div>
          <SectionLabel label="Operational" />
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setExpandOperational(!expandOperational)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                isOperationalActive
                  ? 'bg-gradient-to-r from-[#1f9e9a] to-[#16847f] text-white shadow-md shadow-teal-500/25'
                  : `${!isDark ? '!text-black' : 'text-slate-300'} hover:text-black dark:hover:text-white hover:bg-teal-50 dark:hover:bg-teal-900/20`
              }`}
            >
              <Settings size={18} className={isOperationalActive ? 'text-white' : `${!isDark ? '!text-slate-800' : 'text-slate-400'} group-hover:text-teal-600 transition-colors`} />
              <span className="text-sm font-medium flex-1 text-left">Operational Mgmt</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${expandOperational ? 'rotate-180' : ''} ${isOperationalActive ? 'text-white' : `${!isDark ? '!text-slate-800' : 'text-slate-400'}`}`}
              />
            </button>

            {expandOperational && (
              <div className="ml-3 pl-3 border-l border-teal-400/30 space-y-0.5 mt-1">
                <NavLink to="/employee" icon={Users2} label="Employee Management" small />
                <NavLink to="/attendance" icon={Clock} label="Attendance Management" small />
                <NavLink to="/dustbin" icon={Trash2} label="Dustbin Management" small />
                <NavLink to="/household" icon={HomeIcon} label="Household Management" small />
                <NavLink to="/route" icon={MapPin} label="Route Management" small />
                <NavLink to="/ward" icon={MapPin} label="Ward Management" small />
              </div>
            )}
          </div>
        </div>

        {/* Reports */}
        <div>
          <SectionLabel label="Reports & Feedback" />
          <div className="space-y-1">
            <NavLink to="/report-complaint" icon={FileText} label="Report & Feedback Mgmt" />
            <NavLink to="/waste-data" icon={BarChart3} label="Waste Data Management" />
            <NavLink to="/contact-queries" icon={Mail} label="Contact Queries" />
            <NavLink to="/schedule-bookings" icon={Calendar} label="Schedule Bookings" />
          </div>
        </div>

        {/* CMS */}
        <div>
          <SectionLabel label="Public Website CMS" />
          <div className="space-y-1">
            <NavLink to="/edit-about-us" icon={BookOpen} label="Edit About Us" />
            <NavLink to="/edit-guide" icon={BookOpen} label="Edit Segregation Guide" />
            <NavLink to="/gallery" icon={Image} label="Manage Photo Gallery" />
            <NavLink to="/manage-events" icon={CalendarDays} label="Events & Workshops" />
            <NavLink to="/manage-news" icon={Newspaper} label="News & Updates" />
            <NavLink to="/manage-schedule" icon={Calendar} label="Ward Schedule" />
            <NavLink to="/manage-leadership" icon={Users} label="Leadership" />
          </div>
        </div>

        {/* Settings */}
        <div>
          <SectionLabel label="Analytics & Settings" />
          <div className="space-y-1">
            <NavLink to="/reports" icon={TrendingUp} label="Report Generation & Analytics" />
            <NavLink to="/settings" icon={Users} label="User Management & Settings" />
            <NavLink to="/legal" icon={Scale} label="Legal & Transparency" />
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className={`px-4 py-3 border-t flex-shrink-0 ${isDark ? 'border-white/5 bg-gray-900/50' : 'border-gray-100 bg-white'}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1f9e9a, #22c55e)' }}
          >
            A
          </div>
          <div className="min-w-0">
            <p className={`${!isDark ? '!text-black' : 'text-gray-100'} text-xs font-bold truncate`}>Panchayat Admin</p>
            <p className={`${!isDark ? '!text-slate-800' : 'text-gray-500'} text-[10px]`}>ecosyz.in</p>
          </div>
        </div>
      </div>
    </div>
  )
}

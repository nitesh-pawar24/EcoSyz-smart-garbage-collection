"use client";

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Search, Bell, Settings, LogOut, Moon, Sun, Menu, ChevronDown,
  User, CheckCircle2, AlertCircle, Clock, Trash2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from '../contexts/ThemeContext'
import LogoutConfirmation from './LogoutConfirmation'
import api from '../api/axios'

export default function TopHeader({ onMenuClick }) {
  const router = useRouter()
  const { isDark, toggleTheme } = useTheme()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [searchResults, setSearchResults] = useState({
    employees: [],
    households: [],
    dustbins: [],
    wards: [],
    complaints: [],
    wasteRecords: []
  })

  const dropdownRef = useRef(null)
  const searchRef = useRef(null)

  // Handle Search logic
  const performSearch = useCallback(async (query) => {
    if (query.length < 2) {
      setSearchResults({ employees: [], households: [], dustbins: [], wards: [], complaints: [], wasteRecords: [] })
      setShowResults(false)
      return
    }

    setIsSearching(true)
    try {
      const res = await api.get(`/search?q=${query}`)
      setSearchResults(res.data)
      setShowResults(true)
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) performSearch(searchQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery, performSearch])

  // Click outside to close models
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogoutClick = () => {
    setIsDropdownOpen(false)
    setShowLogoutConfirm(true)
  }

  const handleLogoutConfirm = async () => {
    try {
      await api.post('/auth/logout')
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        sessionStorage.clear()
      }
      router.push('/')
    } catch (err) {
      console.error('Logout failed:', err)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        sessionStorage.clear()
      }
      router.push('/')
    }
  }

  const handleProfileSettings = () => {
    setIsDropdownOpen(false)
    router.push('/profile-settings')
  }

  const ResultSection = ({ title, items, type, renderItem }) => {
    if (!items || items.length === 0) return null
    return (
      <div className="p-2">
        <h4 className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</h4>
        {items.slice(0, 3).map((item, idx) => (
          <button
            key={idx}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-teal-50 group transition-colors"
            onClick={() => {
              setShowResults(false)
              setSearchQuery('')
              // Logic to navigate based on type
              if (type === 'employee') router.push('/attendance')
              if (type === 'household') router.push('/household')
              if (type === 'dustbin') router.push('/dustbin')
              if (type === 'complaint') router.push('/reports')
              if (type === 'ward') router.push('/ward')
            }}
          >
            {renderItem(item)}
          </button>
        ))}
      </div>
    )
  }

  const hasResults = Object.values(searchResults).some(arr => arr && arr.length > 0)

  return (
    <>
      <div className="fixed top-0 right-0 left-0 lg:left-64 h-16 flex items-center justify-between px-4 sm:px-6 z-[10001]"
        style={{
          background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
          boxShadow: isDark ? '0 1px 20px rgba(0,0,0,0.3)' : '0 1px 20px rgba(0,0,0,0.04)'
        }}
      >
        {/* Search Bar Area */}
        <div className="flex items-center gap-4 flex-1 max-w-2xl relative">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu size={22} />
          </button>

          <div className="flex-1 relative" ref={searchRef}>
            <div className="flex items-center gap-3 rounded-xl px-4 py-2 transition-all duration-200"
              style={{ background: isDark ? '#1e293b' : '#f4f6fa' }}
            >
              <Search size={17} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search wards, bins, employees..."
                className="flex-1 bg-transparent outline-none placeholder-gray-400 text-sm"
                style={{ color: isDark ? 'white' : 'black' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
              />
              {isSearching && (
                <div className="w-3.5 h-3.5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              )}
            </div>

            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-h-[70vh] overflow-y-auto z-50 border border-gray-100 dark:border-gray-700">
                {hasResults ? (
                  <div className="py-2 divide-y divide-gray-50 dark:divide-gray-700/50">
                    <ResultSection title="Employees" items={searchResults.employees} type="employee"
                      renderItem={(e) => (
                        <>
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-teal-600 transition-colors">{e.name}</p>
                          <p className="text-[10px] text-gray-400">ID: {e.employeeCode} · {e.phone}</p>
                        </>
                      )}
                    />
                    <ResultSection title="Households" items={searchResults.households} type="household"
                      renderItem={(h) => (
                        <>
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-teal-600 transition-colors">{h.ownerName}</p>
                          <p className="text-[10px] text-gray-400">{h.houseNumber} · {h.address}</p>
                        </>
                      )}
                    />
                    <ResultSection title="Dustbins" items={searchResults.dustbins} type="dustbin"
                      renderItem={(d) => (
                        <>
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-teal-600 transition-colors">{d.binCode}</p>
                          <p className="text-[10px] text-gray-400">{d.locationText} · {d.ward}</p>
                        </>
                      )}
                    />
                    <ResultSection title="Wards" items={searchResults.wards} type="ward"
                      renderItem={(w) => <p className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-teal-600 transition-colors">{w.name}</p>}
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No matching records found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 ml-4">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            style={{
              background: isDark ? 'rgba(31,158,154,0.15)' : '#f4f6fa',
              color: isDark ? '#5eead4' : '#64748b'
            }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1 lg:pl-2 lg:pr-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-xs font-black shadow-sm">
                A
              </div>
              <ChevronDown size={14} className={`hidden lg:block transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                style={{ color: isDark ? '#94a3b8' : '#9ca3af' }} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-700/50">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Panchayat Admin</p>
                </div>
                <div className="p-1.5 font-bold">
                  <button onClick={handleProfileSettings} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 dark:hover:text-teal-400 rounded-xl transition-all">
                    <User size={16} /> Profile Settings
                  </button>
                  <div className="h-px bg-gray-50 dark:bg-gray-700/50 mx-2 my-1" />
                  <button onClick={handleLogoutClick} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                    <LogOut size={16} /> Sign Out Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <LogoutConfirmation
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onLogout={handleLogoutConfirm}
      />
    </>
  )
}

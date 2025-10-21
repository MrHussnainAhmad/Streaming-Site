'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface SiteSettings {
  siteName: string;
  logo: string;
  enableUserAuth?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface HeaderProps {
  scrolled?: boolean;
  currentPage?: string;
}

export default function Header({ scrolled = false, currentPage = 'home' }: HeaderProps) {
  const [settings, setSettings] = useState<SiteSettings>({ siteName: 'STREAMME', logo: '', enableUserAuth: false });
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSettings();
    checkAuthStatus();
    
    // Set up polling to check for settings changes every 1 second for better responsiveness
    const interval = setInterval(() => {
      fetchSettings();
      checkAuthStatus();
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Also check auth status when the window becomes visible (e.g., after navigation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuthStatus();
      }
    };
    
    const handleAuthChange = () => {
      checkAuthStatus();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('userAuthChanged', handleAuthChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('userAuthChanged', handleAuthChange);
    };
  }, []);

  // Handle click outside to close menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }

    if (showUserMenu || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu, isMobileMenuOpen]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const checkAuthStatus = () => {
    // Check if user is logged in by looking at localStorage or making an API call
    // For simplicity, we'll use localStorage to store user info after login
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('user');
      setUser(null);
      setShowUserMenu(false);
      // Trigger custom event to update auth state immediately
      window.dispatchEvent(new CustomEvent('userAuthChanged'));
      // Optionally redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-black/95 backdrop-blur-md' : 'bg-gradient-to-b from-black/90 to-transparent'
    }`}>
      <div className="px-4 md:px-8 lg:px-12 py-3">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {settings.logo && (
              <Image 
                src={settings.logo} 
                alt={`${settings.siteName} logo`}
                width={40} 
                height={40} 
                className="object-contain"
              />
            )}
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-red-600">
              {settings.siteName}
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a 
              href="/" 
              className={`text-base hover:text-gray-300 transition-colors font-medium ${
                currentPage === 'home' ? 'text-red-600' : 'text-white'
              }`}
            >
              Home
            </a>
            <a 
              href="/browse" 
              className={`text-base hover:text-gray-300 transition-colors font-medium ${
                currentPage === 'browse' ? 'text-red-600' : 'text-white'
              }`}
            >
              Browse
            </a>
            <a 
              href="/search" 
              className={`text-base hover:text-gray-300 transition-colors font-medium ${
                currentPage === 'search' ? 'text-red-600' : 'text-white'
              }`}
            >
              Search
            </a>
            
            {/* Desktop Auth */}
            {settings.enableUserAuth && (
              <div className="flex items-center">
                {user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-4 py-1.5 bg-gray-800/80 rounded-lg hover:bg-gray-700 transition-all backdrop-blur-sm"
                    >
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium hidden xl:block">{user.name}</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-70 bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-xl z-50">
                        <div className="p-4 border-b border-gray-700">
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 text-red-400 hover:bg-gray-800 rounded transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <a 
                    href="/login"
                    className={`px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium text-white ${
                      currentPage === 'login' ? 'bg-red-700' : ''
                    }`}
                  >
                    Login
                  </a>
                )}
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:text-gray-300 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 pb-3" ref={mobileMenuRef}>
            <div className="bg-gray-900/95 backdrop-blur-md rounded-lg border border-gray-700 p-4 space-y-4">
              <a 
                href="/" 
                className={`block py-2 text-base font-medium transition-colors ${
                  currentPage === 'home' ? 'text-red-600' : 'text-white hover:text-gray-300'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </a>
              <a 
                href="/browse" 
                className={`block py-2 text-base font-medium transition-colors ${
                  currentPage === 'browse' ? 'text-red-600' : 'text-white hover:text-gray-300'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Browse
              </a>
              <a 
                href="/search" 
                className={`block py-2 text-base font-medium transition-colors ${
                  currentPage === 'search' ? 'text-red-600' : 'text-white hover:text-gray-300'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Search
              </a>
              
              {/* Mobile Auth */}
              {settings.enableUserAuth && (
                <div className="pt-4 border-t border-gray-700">
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-red-400 hover:bg-gray-800 rounded transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <a 
                      href="/login"
                      className={`block w-full text-center py-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium text-white ${
                        currentPage === 'login' ? 'bg-red-700' : ''
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
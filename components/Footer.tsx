'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SiteSettings {
  siteName: string;
  logo: string;
  enableSecondaryFooter?: boolean;
  secondaryFooterContent?: string;
}

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings>({ 
    siteName: 'STREAMME', 
    logo: '', 
    enableSecondaryFooter: false,
    secondaryFooterContent: ''
  });

  useEffect(() => {
    fetchSettings();
    
    // Poll for settings changes every 5 seconds
    const interval = setInterval(fetchSettings, 5000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <footer className="bg-black border-t border-gray-800">
      {/* Secondary Footer (Admin Controlled) */}
      {settings.enableSecondaryFooter && settings.secondaryFooterContent && (
        <div className="border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8">
            <div className="text-center">
              <div className="prose prose-invert max-w-none">
                <div 
                  className="text-gray-300 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: settings.secondaryFooterContent.replace(/\n/g, '<br>') }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Primary Footer (Always Visible) */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Site Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {settings.logo && (
                <Image 
                  src={settings.logo} 
                  alt={`${settings.siteName} logo`}
                  width={32} 
                  height={32} 
                  className="object-contain"
                />
              )}
              <h3 className="text-xl font-bold text-red-600">
                {settings.siteName}
              </h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your ultimate destination for streaming entertainment. Discover, watch, and enjoy the best content from around the world.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <div className="flex flex-col space-y-2">
              <a href="/" className="text-gray-400 hover:text-white transition-colors text-sm">Home</a>
              <a href="/browse" className="text-gray-400 hover:text-white transition-colors text-sm">Browse</a>
              <a href="/search" className="text-gray-400 hover:text-white transition-colors text-sm">Search</a>
            </div>
          </div>

          {/* Developer Contact (Always Visible) */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Developer</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Hussnain Ahmad</p>
                  <p className="text-gray-400 text-xs">Full Stack Developer</p>
                </div>
              </div>
              
              <a 
                href="https://instagram.com/hussnain.ahmad.sahi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @hussnain.ahmad.sahi
              </a>
              
              <a 
                href="mailto:workwithhussnainhmad@gmail.com"
                className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                workwithhussnainhmad@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} {settings.siteName}. Website created by{' '}
              <span className="text-red-400 font-medium">Hussnain Ahmad</span>
            </p>
            <p className="text-gray-500 text-xs">
              Built with Next.js
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
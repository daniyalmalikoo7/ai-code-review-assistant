// src/components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, loading, login, logout } = useAuth();
  
  const isActive = (path: string) => {
    return pathname === path ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white';
  };
  
  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-white text-xl font-bold">Code Review AI</Link>
            </div>
            {/* Only show navigation if user is authenticated */}
            {isAuthenticated && (
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link 
                    href="/dashboard" 
                    className={`${isActive('/dashboard')} rounded-md px-3 py-2 text-sm font-medium`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/reviews" 
                    className={`${isActive('/reviews')} rounded-md px-3 py-2 text-sm font-medium`}
                  >
                    Reviews
                  </Link>
                  <Link 
                    href="/settings" 
                    className={`${isActive('/settings')} rounded-md px-3 py-2 text-sm font-medium`}
                  >
                    Settings
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {/* Show notification button only if authenticated */}
              {isAuthenticated && (
                <button
                  type="button"
                  className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  <span className="absolute -inset-1.5"></span>
                  <span className="sr-only">View notifications</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </button>
              )}
              
              {/* Login/Logout button or User Profile */}
              {loading ? (
                <div className="ml-3 relative">
                  <div className="h-8 w-8 rounded-full bg-gray-500 animate-pulse"></div>
                </div>
              ) : isAuthenticated ? (
                <div className="relative ml-3 flex items-center">
                  <div className="relative">
                    <div className="flex items-center">
                      <span className="hidden sm:inline-block text-sm text-gray-300 mr-2">
                        {user?.username}
                      </span>
                      <button
                        onClick={logout}
                        className="flex max-w-xs items-center rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                        id="user-menu-button"
                      >
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                          {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="ml-3 text-sm text-gray-300 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Login with GitHub
                </button>
              )}
            </div>
          </div>
          
          <div className="-mr-2 flex md:hidden">
            {/* Mobile menu button */}
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="absolute -inset-0.5"></span>
              <span className="sr-only">Open main menu</span>
              <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className="md:hidden" id="mobile-menu">
        {isAuthenticated && (
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            <Link 
              href="/dashboard" 
              className={`${isActive('/dashboard')} block rounded-md px-3 py-2 text-base font-medium`}
            >
              Dashboard
            </Link>
            <Link 
              href="/reviews" 
              className={`${isActive('/reviews')} block rounded-md px-3 py-2 text-base font-medium`}
            >
              Reviews
            </Link>
            <Link 
              href="/settings" 
              className={`${isActive('/settings')} block rounded-md px-3 py-2 text-base font-medium`}
            >
              Settings
            </Link>
          </div>
        )}
        
        {/* Mobile login/logout */}
        <div className="border-t border-gray-700 pb-3 pt-4">
          {isAuthenticated ? (
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-semibold">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">{user?.username}</div>
                <div className="text-sm font-medium text-gray-400">{user?.email}</div>
              </div>
              <button
                onClick={logout}
                className="ml-auto flex-shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                <span className="sr-only">Logout</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="px-5">
              <button
                onClick={login}
                className="w-full flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                Login with GitHub
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
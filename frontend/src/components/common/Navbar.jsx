import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sprout, LogOut, User, Sparkles, ShieldCheck } from 'lucide-react';

export const Navbar = () => {
  const { user, role, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              KrishiSetu
            </span>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              Market Intelligence
            </span>
          </div>
        </Link>

        {/* Quick primary action */}
        {role === 'farmer' && (
          <Link
            to="/farmer/recommendations"
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium px-4 py-2 rounded-lg shadow-md shadow-emerald-900/30 transition-all text-sm"
          >
            <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
            Find Best Market
          </Link>
        )}

        {/* User Auth controls */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-200">
                  {user?.name || user?.companyName || 'User'}
                </span>
                <span className="text-xs text-emerald-400 capitalize flex items-center justify-end gap-1 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  {role} Portal
                </span>
              </div>
              
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-sm shadow-inner">
                {(user?.name || user?.companyName || 'U').charAt(0)}
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-slate-300 hover:text-white px-3 py-1.5 text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 text-sm font-medium rounded-lg shadow transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

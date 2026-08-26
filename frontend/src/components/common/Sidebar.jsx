import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  TrendingUp,
  Sparkles,
  Calculator,
  Users,
  Handshake,
  User,
  PlusCircle,
  Target
} from 'lucide-react';

export const Sidebar = ({ role = 'farmer' }) => {
  const farmerLinks = [
    { to: '/farmer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/farmer/markets', label: 'Mandi Prices', icon: Store },
    { to: '/farmer/prices', label: 'Price Trends', icon: TrendingUp },
    { to: '/farmer/recommendations', label: 'Best Market AI', icon: Sparkles },
    { to: '/farmer/profit-calculator', label: 'Profit Calculator', icon: Calculator },
    { to: '/farmer/buyers', label: 'Buyer Marketplace', icon: Users },
    { to: '/farmer/offers', label: 'My Offers', icon: Handshake },
    { to: '/farmer/profile', label: 'My Profile', icon: User },
  ];

  const buyerLinks = [
    { to: '/buyer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/buyer/requirements', label: 'Requirements', icon: Store },
    { to: '/buyer/requirements/create', label: 'Post Requirement', icon: PlusCircle },
    { to: '/buyer/matches', label: 'Farmer Matches', icon: Target },
    { to: '/buyer/offers', label: 'Purchase Offers', icon: Handshake },
    { to: '/buyer/profile', label: 'Company Profile', icon: User },
  ];

  const links = role === 'buyer' ? buyerLinks : farmerLinks;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col min-h-[calc(100vh-4rem)] p-4">
      <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold px-3 mb-3">
        {role === 'buyer' ? 'Buyer Portal' : 'Farmer Portal'}
      </div>
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;

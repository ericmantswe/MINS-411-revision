import React from 'react';
import {
  GraduationCap,
  Code2,
  Binary,
  Clock,
  Layers,
  BookOpen,
} from 'lucide-react';

export type AppTab = 'practice' | 'code' | 'flags' | 'timer' | 'registers' | 'guide';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'practice' as const, label: 'Quiz', icon: GraduationCap },
    { id: 'code' as const, label: 'Code Lab', icon: Code2 },
    { id: 'flags' as const, label: 'PSW Flags', icon: Binary },
    { id: 'timer' as const, label: 'Timer Calc', icon: Clock },
    { id: 'registers' as const, label: 'Registers', icon: Layers },
    { id: 'guide' as const, label: 'Study Guide', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/96 backdrop-blur-sm border-b border-slate-200/80" style={{ boxShadow: '0 1px 0 0 #e2e8f0' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 gap-4" style={{ height: '60px' }}>

          {/* Logo — intentional, not generic */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="w-9 h-9 flex items-center justify-center rounded-xl text-white text-xs font-mono font-bold tracking-tight"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', letterSpacing: '-0.03em' }}
            >
              8051
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight">MicroQuiz</span>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block leading-none mt-0.5">
                Assembly · Interrupts · PSW
              </p>
            </div>
          </div>

          {/* Desktop tab navigation — real tabs, not pills */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-emerald-500"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right side — simple session label */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-medium shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
            <span>Live session</span>
          </div>
        </div>

        {/* Mobile tab bar — full width, scrollable */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto pb-2.5 pt-1 no-scrollbar border-t border-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

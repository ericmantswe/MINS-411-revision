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
    { id: 'practice' as const, label: 'Quiz', shortLabel: 'Quiz', icon: GraduationCap },
    { id: 'code' as const, label: 'Code Lab', shortLabel: 'Code', icon: Code2 },
    { id: 'flags' as const, label: 'PSW Flags', shortLabel: 'Flags', icon: Binary },
    { id: 'timer' as const, label: 'Timer Calc', shortLabel: 'Timer', icon: Clock },
    { id: 'registers' as const, label: 'Registers', shortLabel: 'Regs', icon: Layers },
    { id: 'guide' as const, label: 'Study Guide', shortLabel: 'Guide', icon: BookOpen },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-15 gap-3">

            {/* Logo */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-white text-xs font-mono font-bold tracking-tight shadow-sm"
                style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', letterSpacing: '-0.03em' }}
              >
                8051
              </div>
              <div>
                <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">MicroQuiz</span>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden sm:block leading-none mt-0.5">
                  Assembly · Interrupts · PSW
                </p>
              </div>
            </div>

            {/* Desktop tab navigation */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={isActive ? 2.2 : 1.8} />
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right side status badge */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 font-semibold text-[11px] sm:text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden xs:inline">Interactive</span> Trainer
              </div>
            </div>
          </div>
        </div>

        {/* Tablet / Mobile top scroll strip (secondary fallback for mid-size screens) */}
        <div className="hidden sm:flex lg:hidden items-center gap-1 overflow-x-auto px-3 pb-2 pt-1 no-scrollbar border-t border-slate-100">
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
      </header>

      {/* Modern Bottom Navigation Bar for Mobile (Screens < 1024px) */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-1 pt-1.5 pb-safe"
        style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
      >
        <div className="grid grid-cols-6 items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all cursor-pointer relative ${
                  isActive
                    ? 'text-emerald-600 font-bold'
                    : 'text-slate-400 hover:text-slate-700 active:scale-95'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 rounded-full bg-emerald-500" />
                )}
                <Icon
                  className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`}
                  strokeWidth={isActive ? 2.3 : 1.7}
                />
                <span className={`text-[10px] mt-0.5 tracking-tight truncate w-full text-center ${
                  isActive ? 'font-bold text-emerald-700' : 'font-medium'
                }`}>
                  {tab.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

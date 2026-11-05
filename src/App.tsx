import { useState } from 'react';
import { Navbar, type AppTab } from './components/Navbar';
import { PracticeEngine } from './components/PracticeEngine';
import { CodeStudio } from './components/CodeStudio';
import { FlagVisualizer } from './components/FlagVisualizer';
import { TimerCalculator } from './components/TimerCalculator';
import { RegisterExplorer } from './components/RegisterExplorer';
import { StudyGuide } from './components/StudyGuide';

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('practice');

  return (
    <div className="min-h-screen bg-[#f0f7f2] text-slate-900 flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area — bottom padding accounts for mobile bottom nav */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 lg:pb-8">
        {activeTab === 'practice' && <PracticeEngine />}
        {activeTab === 'code' && <CodeStudio />}
        {activeTab === 'flags' && <FlagVisualizer />}
        {activeTab === 'timer' && <TimerCalculator />}
        {activeTab === 'registers' && <RegisterExplorer />}
        {activeTab === 'guide' && <StudyGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 mb-16 lg:mb-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-medium">
            <span className="font-extrabold text-slate-800">8051 MicroQuiz Master</span> — AT89C51 Lectures 3.2 &amp; 4
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-500 font-bold">
            <button onClick={() => { setActiveTab('practice'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-emerald-600 cursor-pointer">Quiz</button>
            <button onClick={() => { setActiveTab('code'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-emerald-600 cursor-pointer">Code Lab</button>
            <button onClick={() => { setActiveTab('flags'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-emerald-600 cursor-pointer">PSW Engine</button>
            <button onClick={() => { setActiveTab('timer'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-emerald-600 cursor-pointer">Timer Calc</button>
            <button onClick={() => { setActiveTab('registers'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-emerald-600 cursor-pointer">Registers</button>
            <button onClick={() => { setActiveTab('guide'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-emerald-600 cursor-pointer">Guide</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

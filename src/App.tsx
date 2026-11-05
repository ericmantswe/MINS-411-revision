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
    <div className="min-h-screen bg-[#F4F8F5] text-slate-900 flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'practice' && <PracticeEngine />}
        {activeTab === 'code' && <CodeStudio />}
        {activeTab === 'flags' && <FlagVisualizer />}
        {activeTab === 'timer' && <TimerCalculator />}
        {activeTab === 'registers' && <RegisterExplorer />}
        {activeTab === 'guide' && <StudyGuide />}
      </main>

      <footer className="border-t border-emerald-100 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-medium">
            <span className="font-extrabold text-slate-800">8051 Assembly & Interrupts Master</span> — Based on Lectures 3.2 & 4
          </div>
          <div className="flex items-center gap-4 text-slate-500 font-bold">
            <button onClick={() => setActiveTab('practice')} className="hover:text-emerald-600 cursor-pointer">Practice Quiz</button>
            <button onClick={() => setActiveTab('code')} className="hover:text-emerald-600 cursor-pointer">Code Studio</button>
            <button onClick={() => setActiveTab('flags')} className="hover:text-emerald-600 cursor-pointer">PSW Engine</button>
            <button onClick={() => setActiveTab('timer')} className="hover:text-emerald-600 cursor-pointer">Timer Calc</button>
            <button onClick={() => setActiveTab('registers')} className="hover:text-emerald-600 cursor-pointer">Registers</button>
            <button onClick={() => setActiveTab('guide')} className="hover:text-emerald-600 cursor-pointer">Guide</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

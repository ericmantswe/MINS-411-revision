import React, { useState } from 'react';
import {
  Play,
  Bug,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Terminal,
  FileCode,
  Layers,
  Cpu,
  Info,
} from 'lucide-react';
import { CODE_EXERCISES } from '../data/codingProblems';
import type { CodeExercise, CodeError, CPUState } from '../types';
import { analyze8051Code } from '../utils/8051Analyzer';
import { run8051Program, createInitialCPUState } from '../utils/8051Simulator';

export const CodeStudio: React.FC = () => {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(CODE_EXERCISES[0].id);
  const activeExercise = CODE_EXERCISES.find((e) => e.id === selectedExerciseId) || CODE_EXERCISES[0];

  const [code, setCode] = useState<string>(activeExercise.initialCode);
  const [diagnostics, setDiagnostics] = useState<CodeError[]>([]);
  const [hasCheckedErrors, setHasCheckedErrors] = useState<boolean>(false);
  const [cpuState, setCpuState] = useState<CPUState>(createInitialCPUState());
  const [consoleLogs, setConsoleLogs] = useState<string[]>(['Ready. Write 8051 assembly or load a challenge.']);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [activePanel, setActivePanel] = useState<'diagnostics' | 'cpu' | 'ram' | 'solution'>('diagnostics');

  // Mobile segmented view: 'editor' or 'inspector'
  const [mobileView, setMobileView] = useState<'editor' | 'inspector'>('editor');

  const handleSelectExercise = (ex: CodeExercise) => {
    setSelectedExerciseId(ex.id);
    setCode(ex.initialCode);
    setDiagnostics([]);
    setHasCheckedErrors(false);
    setShowSolution(false);
    setCpuState(createInitialCPUState());
    setConsoleLogs([`Loaded: ${ex.title}`]);
    setMobileView('editor');
  };

  const handleCheckErrors = () => {
    const errors = analyze8051Code(code);
    setDiagnostics(errors);
    setHasCheckedErrors(true);
    setActivePanel('diagnostics');
    setMobileView('inspector'); // On mobile, automatically show results
    if (errors.length === 0) {
      setConsoleLogs((prev) => [
        ...prev,
        '✓ Static analysis complete: 0 violations found.',
      ]);
    } else {
      setConsoleLogs((prev) => [
        ...prev,
        `⚠ Static analysis: ${errors.length} issue(s) found — see Diagnostics.`,
      ]);
    }
  };

  const handleRunSimulation = () => {
    handleCheckErrors();
    const result = run8051Program(code);
    setCpuState(result.state);
    setConsoleLogs(result.logs);
    setActivePanel('cpu');
    setMobileView('inspector'); // On mobile, automatically switch to CPU inspector
  };

  const handleResetCode = () => {
    setCode(activeExercise.initialCode);
    setDiagnostics([]);
    setHasCheckedErrors(false);
    setCpuState(createInitialCPUState());
    setConsoleLogs(['Code reset to template.']);
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header: challenge picker */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 card-shadow space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-emerald-600 shrink-0" />
              Code Lab &amp; Error Checker
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {activeExercise.description}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedExerciseId}
              onChange={(e) => {
                const ex = CODE_EXERCISES.find((item) => item.id === e.target.value);
                if (ex) handleSelectExercise(ex);
              }}
              className="bg-white border border-slate-300 text-slate-900 font-semibold text-xs sm:text-sm rounded-lg px-3 py-2 w-full sm:w-72 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {CODE_EXERCISES.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Expected outcome */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium">Expected result:</span>
          <code className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono border border-emerald-100 break-all">
            {activeExercise.expectedBehavior}
          </code>
        </div>
      </div>

      {/* Mobile view switcher tab (hidden on desktop) */}
      <div className="lg:hidden flex rounded-xl bg-slate-200/80 p-1">
        <button
          onClick={() => setMobileView('editor')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileView === 'editor'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCode className="w-4 h-4 text-emerald-600" />
          <span>Editor ({lineCount}L)</span>
        </button>
        <button
          onClick={() => setMobileView('inspector')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileView === 'inspector'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4 text-emerald-600" />
          <span>Output &amp; Registers</span>
          {diagnostics.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
              {diagnostics.length}
            </span>
          )}
        </button>
      </div>

      {/* Editor + Inspector Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">

        {/* Left Column: Code Editor */}
        <div className={`lg:col-span-7 ${mobileView === 'editor' ? 'block' : 'hidden lg:block'}`}>
          <div
            className="rounded-xl overflow-hidden flex flex-col h-[440px] sm:h-[520px] lg:h-[580px]"
            style={{
              border: '1px solid #1e293b',
              boxShadow: '0 4px 20px -4px rgba(0,0,0,0.25)',
            }}
          >
            {/* Title bar */}
            <div className="bg-[#1e2535] px-3 sm:px-4 py-2.5 flex items-center justify-between border-b border-[#2d3748]">
              <div className="flex items-center gap-2">
                <span className="editor-dot bg-[#ff5f56]" />
                <span className="editor-dot bg-[#ffbd2e]" />
                <span className="editor-dot bg-[#27c93f]" />
                <span className="text-slate-400 text-xs font-mono ml-2">program.asm</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetCode}
                  title="Reset code"
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#2d3748] hover:bg-[#374151] text-slate-300 rounded text-xs font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Code area with line numbers */}
            <div className="relative flex-1 bg-[#0f172a] overflow-hidden flex font-mono text-xs sm:text-sm">
              <div
                className="select-none py-3 px-2 sm:px-3 text-right font-mono text-[11px] sm:text-[12px] leading-6 shrink-0"
                style={{ minWidth: '38px', color: '#475569', borderRight: '1px solid #1e2535', background: '#0d1526' }}
              >
                {code.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="flex-1 bg-transparent text-[#a3e635] p-3 sm:p-4 font-mono text-xs sm:text-[13px] leading-6 resize-none focus:outline-none"
                style={{ caretColor: '#10b981', tabSize: 4, WebkitOverflowScrolling: 'touch' }}
                placeholder="Write 8051 assembly here..."
              />
            </div>

            {/* Editor Action Bar */}
            <div className="bg-[#1a2235] px-3 sm:px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#2d3748]">
              <div className="flex items-center gap-2 w-full xs:w-auto">
                <button
                  onClick={handleCheckErrors}
                  className="flex-1 xs:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Bug className="w-3.5 h-3.5" />
                  <span>Check errors</span>
                </button>
                <button
                  onClick={handleRunSimulation}
                  className="flex-1 xs:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Simulate</span>
                </button>
              </div>
              <button
                onClick={() => {
                  setShowSolution(!showSolution);
                  setActivePanel('solution');
                  setMobileView('inspector');
                }}
                className="text-xs text-slate-400 hover:text-emerald-400 font-medium underline underline-offset-2 cursor-pointer ml-auto"
              >
                {showSolution ? 'Hide solution' : 'Show solution'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Inspector panel */}
        <div className={`lg:col-span-5 ${mobileView === 'inspector' ? 'block' : 'hidden lg:block'}`}>
          <div
            className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col card-shadow h-[440px] sm:h-[520px] lg:h-[580px]"
          >
            {/* Panel tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs overflow-x-auto no-scrollbar">
              {([
                { id: 'diagnostics' as const, label: 'Diagnostics', icon: Bug },
                { id: 'cpu' as const, label: 'Registers', icon: Cpu },
                { id: 'ram' as const, label: 'Memory', icon: Layers },
                { id: 'solution' as const, label: 'Solution', icon: CheckCircle2 },
              ]).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActivePanel(id)}
                  className={`flex-1 min-w-[75px] flex items-center justify-center gap-1 py-2.5 sm:py-3 font-semibold transition-colors cursor-pointer border-b-2 whitespace-nowrap text-[11px] sm:text-xs ${
                    activePanel === id
                      ? 'border-emerald-500 text-emerald-700 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{label}</span>
                  {id === 'diagnostics' && diagnostics.length > 0 && (
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                      {diagnostics.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3" style={{ WebkitOverflowScrolling: 'touch' }}>

              {/* DIAGNOSTICS */}
              {activePanel === 'diagnostics' && (
                <div className="space-y-3">
                  {!hasCheckedErrors ? (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-400 space-y-2">
                      <Bug className="w-8 h-8 text-slate-200" />
                      <p className="text-xs text-center">Tap <strong>"Check errors"</strong> to run the static analyzer.</p>
                    </div>
                  ) : diagnostics.length === 0 ? (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 space-y-1">
                      <div className="flex items-center gap-2 font-semibold text-emerald-800 text-xs sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
                        No violations found
                      </div>
                      <p className="text-xs text-emerald-700 leading-relaxed">
                        Code passes all 8051 architectural rules (Rn moves, direct stack addressing, 16-bit register matching, and ISR structure).
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{diagnostics.length} issue(s) found</span>
                      </div>
                      {diagnostics.map((err, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl bg-rose-50 border border-rose-200 p-3 space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="font-mono font-bold text-rose-900 text-[11px] sm:text-xs">
                              Line {err.line}: {err.rule}
                            </span>
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-200 text-rose-800 shrink-0">
                              {err.severity}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">{err.message}</p>
                          {err.suggestion && (
                            <div className="text-[11px] text-emerald-800 font-mono bg-white p-2 rounded border border-emerald-100">
                              <span className="text-emerald-600 font-semibold">Fix: </span>
                              {err.suggestion}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CPU REGISTERS */}
              {activePanel === 'cpu' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 sm:p-3 font-mono">
                      <div className="text-[10px] font-semibold text-emerald-700 uppercase">Accumulator A</div>
                      <div className="text-lg sm:text-xl font-bold text-emerald-800 mt-0.5">
                        {cpuState.A.toString(16).toUpperCase().padStart(2, '0')}H
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                        {cpuState.A} · {cpuState.A.toString(2).padStart(8, '0')}b
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 sm:p-3 font-mono">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase">Register B</div>
                      <div className="text-lg sm:text-xl font-bold text-slate-700 mt-0.5">
                        {cpuState.B.toString(16).toUpperCase().padStart(2, '0')}H
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">{cpuState.B} dec</div>
                    </div>
                  </div>

                  {/* PSW Flags */}
                  <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">PSW (D0H)</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {((cpuState.PSW.CY << 7) | (cpuState.PSW.AC << 6) | (cpuState.PSW.F0 << 5) | (cpuState.PSW.RS1 << 4) | (cpuState.PSW.RS0 << 3) | (cpuState.PSW.OV << 2) | cpuState.PSW.P)
                          .toString(16).toUpperCase().padStart(2, '0')}H
                      </span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 font-mono text-center">
                      {[
                        { k: 'CY', v: cpuState.PSW.CY },
                        { k: 'AC', v: cpuState.PSW.AC },
                        { k: 'F0', v: cpuState.PSW.F0 },
                        { k: 'RS1', v: cpuState.PSW.RS1 },
                        { k: 'RS0', v: cpuState.PSW.RS0 },
                        { k: 'OV', v: cpuState.PSW.OV },
                        { k: 'P', v: cpuState.PSW.P },
                      ].map((flag) => (
                        <div
                          key={flag.k}
                          className={`py-1.5 rounded border transition-all ${
                            flag.v === 1
                              ? 'bg-emerald-500 text-white border-emerald-600 font-bold'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          <div className="text-[9px] font-semibold">{flag.k}</div>
                          <div className="text-xs sm:text-sm font-bold">{flag.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* R0-R7 */}
                  <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-1.5">
                    <span className="text-xs font-semibold text-slate-500 block">Active Bank Working Registers</span>
                    <div className="grid grid-cols-4 gap-1.5 font-mono text-xs text-center">
                      {cpuState.R.map((val, idx) => (
                        <div key={idx} className="p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                          <span className="text-slate-400 text-[9px] block">R{idx}</span>
                          <span className="text-slate-800 font-bold text-[11px] sm:text-xs">
                            {val.toString(16).toUpperCase().padStart(2, '0')}H
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DPTR & SP */}
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    <div className="rounded-xl bg-white border border-slate-200 p-2.5">
                      <span className="text-[9px] text-slate-400 font-semibold uppercase block">DPTR</span>
                      <span className="text-sm sm:text-base font-bold text-slate-800 block mt-0.5">
                        {cpuState.DPTR.toString(16).toUpperCase().padStart(4, '0')}H
                      </span>
                    </div>
                    <div className="rounded-xl bg-white border border-slate-200 p-2.5">
                      <span className="text-[9px] text-slate-400 font-semibold uppercase block">Stack Pointer</span>
                      <span className="text-sm sm:text-base font-bold text-emerald-700 block mt-0.5">
                        {cpuState.SP.toString(16).toUpperCase().padStart(2, '0')}H
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* RAM & PORTS */}
              {activePanel === 'ram' && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-1.5">
                    <span className="text-xs font-semibold text-slate-500 block">I/O Ports</span>
                    <div className="grid grid-cols-4 gap-1.5 font-mono text-center text-xs">
                      {[
                        { name: 'P0', val: cpuState.ports.P0 },
                        { name: 'P1', val: cpuState.ports.P1 },
                        { name: 'P2', val: cpuState.ports.P2 },
                        { name: 'P3', val: cpuState.ports.P3 },
                      ].map((p, i) => (
                        <div key={i} className="p-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                          <div className="text-[9px] text-emerald-700 font-semibold">{p.name}</div>
                          <div className="text-emerald-800 font-bold text-[11px] sm:text-xs">
                            {p.val.toString(16).toUpperCase().padStart(2, '0')}H
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RAM matrix with touch scroll */}
                  <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-1.5 font-mono text-[10px] sm:text-[11px]">
                    <span className="text-xs font-semibold text-slate-500 block">Internal RAM (00H–7FH)</span>
                    <div className="max-h-56 overflow-y-auto space-y-1 pr-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                      {Array.from({ length: 8 }).map((_, row) => {
                        const base = row * 16;
                        return (
                          <div key={row} className="flex items-center gap-1.5 py-0.5 border-b border-slate-50">
                            <span className="text-slate-400 w-6 text-right shrink-0">
                              {base.toString(16).toUpperCase().padStart(2, '0')}:
                            </span>
                            <div className="grid grid-cols-8 gap-0.5 sm:gap-1 flex-1">
                              {Array.from({ length: 8 }).map((_, col) => {
                                const addr = base + col;
                                const val = cpuState.ram[addr];
                                const isStack = addr === cpuState.SP;
                                return (
                                  <span
                                    key={col}
                                    title={`${addr.toString(16).toUpperCase().padStart(2, '0')}H = ${val.toString(16).toUpperCase().padStart(2, '0')}H`}
                                    className={`text-center rounded px-0.5 text-[9px] sm:text-[10px] ${
                                      isStack
                                        ? 'bg-amber-300 text-slate-900 font-bold'
                                        : val !== 0
                                        ? 'bg-emerald-100 text-emerald-800 font-semibold'
                                        : 'text-slate-300'
                                    }`}
                                  >
                                    {val.toString(16).toUpperCase().padStart(2, '0')}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SOLUTION */}
              {activePanel === 'solution' && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-slate-900 overflow-hidden">
                    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-800">
                      <span className="editor-dot bg-rose-400" />
                      <span className="editor-dot bg-amber-400" />
                      <span className="editor-dot bg-emerald-400" />
                      <span className="text-slate-500 text-[10px] font-mono ml-2">solution.asm</span>
                    </div>
                    <pre className="p-3 text-[11px] sm:text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto">
                      {activeExercise.solutionCode}
                    </pre>
                  </div>

                  <div className="rounded-xl bg-white border border-slate-200 p-3 sm:p-4 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>Explanation</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{activeExercise.explanation}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Console footer */}
            <div className="bg-slate-900 px-3 py-2 border-t border-slate-800 flex items-center gap-2 font-mono text-[10px] sm:text-[11px]">
              <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-emerald-300 truncate">{consoleLogs[consoleLogs.length - 1]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

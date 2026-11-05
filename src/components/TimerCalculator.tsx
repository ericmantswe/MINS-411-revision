import React, { useState } from 'react';
import { Clock, Copy, Check, Info, Code } from 'lucide-react';

export const TimerCalculator: React.FC = () => {
  const [freqMHz, setFreqMHz] = useState('12.0');
  const [targetDelay, setTargetDelay] = useState('20');
  const [timeUnit, setTimeUnit] = useState<'ms' | 'us'>('ms');
  const [timerNumber, setTimerNumber] = useState<'0' | '1'>('0');
  const [timerMode, setTimerMode] = useState<'1' | '2'>('1');
  const [copied, setCopied] = useState(false);

  const presets = [
    { label: 'Ex 4.4: 50 ms (12 MHz, T0)', delay: '50', unit: 'ms' as const, t: '0' as const, m: '1' as const, freq: '12.0' },
    { label: 'Prob 4.7: 20 ms (12 MHz, T0)', delay: '20', unit: 'ms' as const, t: '0' as const, m: '1' as const, freq: '12.0' },
    { label: 'Prob 4.11: 10 ms (12 MHz, T1)', delay: '10', unit: 'ms' as const, t: '1' as const, m: '1' as const, freq: '12.0' },
    { label: '250 µs (12 MHz, Mode 2)', delay: '250', unit: 'us' as const, t: '0' as const, m: '2' as const, freq: '12.0' },
  ];

  const freq = parseFloat(freqMHz) || 12.0;
  const delayVal = parseFloat(targetDelay) || 0;
  const delayInUs = timeUnit === 'ms' ? delayVal * 1000 : delayVal;

  const machineCycleUs = 12 / freq;
  const requiredCounts = Math.round(delayInUs / machineCycleUs);

  const maxCapacity = timerMode === '1' ? 65536 : 256;
  const isOverflow = requiredCounts > maxCapacity;
  const preloadDec = isOverflow ? 0 : maxCapacity - requiredCounts;

  const preloadHex16 = (preloadDec & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  const thHex = preloadHex16.slice(0, 2);
  const tlHex = preloadHex16.slice(2, 4);

  const tmodHex = timerNumber === '0' ? (timerMode === '1' ? '01H' : '02H') : (timerMode === '1' ? '10H' : '20H');
  const vectorAddr = timerNumber === '0' ? '000BH' : '001BH';
  const isrLabel = timerNumber === '0' ? 'T0_ISR' : 'T1_ISR';
  const enableBit = timerNumber === '0' ? 'ET0' : 'ET1';
  const runBit = timerNumber === '0' ? 'TR0' : 'TR1';

  const generatedAssembly = `; Generated 8051 Timer ${timerNumber} (Mode ${timerMode}) Code
; Crystal: ${freq} MHz, Interval: ${targetDelay} ${timeUnit} (${requiredCounts} counts)
; Preload = ${maxCapacity} - ${requiredCounts} = ${preloadDec} (${timerMode === '1' ? preloadHex16 + 'H' : tlHex + 'H'})

          ORG 0000H
          LJMP MAIN          ; Jump over interrupt vectors

          ORG ${vectorAddr}
          LJMP ${isrLabel}     ; Timer ${timerNumber} interrupt vector

          ORG 0030H
MAIN:     MOV SP, #60H       ; Relocate stack
          MOV TMOD, #${tmodHex} ; Timer ${timerNumber}, Mode ${timerMode}
          MOV TH${timerNumber}, #0${thHex}H
          MOV TL${timerNumber}, #0${tlHex}H
          SETB ${enableBit}         ; Enable Timer ${timerNumber} interrupt
          SETB EA            ; Global interrupt enable
          SETB ${runBit}         ; Start timer

          SJMP $             ; Idle loop waiting for interrupts

${isrLabel}:
${timerMode === '1' ? `          CLR ${runBit}          ; Stop timer while reloading
          MOV TH${timerNumber}, #0${thHex}H ; Reload high byte
          MOV TL${timerNumber}, #0${tlHex}H ; Reload low byte
          SETB ${runBit}         ; Restart timer` : `          ; Mode 2 auto-reloads TH${timerNumber} into TL${timerNumber} automatically!`}
          CPL P1.${timerNumber}        ; Toggle pin as heartbeat
          RETI               ; Return and clear priority latch
          END`;

  const copyCode = () => {
    navigator.clipboard.writeText(generatedAssembly);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 card-shadow space-y-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
            8051 Timer Preload Calculator
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Calculate exact <code className="text-emerald-700 font-semibold">THx</code> / <code className="text-emerald-700 font-semibold">TLx</code> registers and generate correct interrupt service routines.
          </p>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setFreqMHz(p.freq);
                setTargetDelay(p.delay);
                setTimeUnit(p.unit);
                setTimerNumber(p.t);
                setTimerMode(p.m);
              }}
              className="text-left p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 active:bg-emerald-100 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer text-slate-700"
            >
              <div className="font-bold text-[11px] sm:text-xs text-emerald-700 truncate">{p.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Delay: {p.delay} {p.unit}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Input Parameters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 card-shadow">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Timing Parameters
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Crystal Oscillator (MHz)
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  step="0.0001"
                  value={freqMHz}
                  onChange={(e) => setFreqMHz(e.target.value)}
                  className="font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 w-full text-sm font-bold focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setFreqMHz('12.0')}
                  className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-emerald-100 hover:text-emerald-800 shrink-0 cursor-pointer"
                >
                  12MHz
                </button>
                <button
                  type="button"
                  onClick={() => setFreqMHz('11.0592')}
                  className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-emerald-100 hover:text-emerald-800 shrink-0 cursor-pointer"
                >
                  11.0592
                </button>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 mt-1 block">
                1 Machine Cycle = 12 / {freq} MHz = {machineCycleUs.toFixed(4)} µs
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Desired Delay / Interval</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={targetDelay}
                  onChange={(e) => setTargetDelay(e.target.value)}
                  className="font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 w-full text-sm font-bold focus:outline-none focus:border-emerald-500"
                />
                <select
                  value={timeUnit}
                  onChange={(e) => setTimeUnit(e.target.value as 'ms' | 'us')}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-emerald-800 text-sm font-semibold focus:outline-none cursor-pointer shrink-0"
                >
                  <option value="ms">ms</option>
                  <option value="us">µs</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Timer Source</label>
                <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
                  <button
                    onClick={() => setTimerNumber('0')}
                    className={`flex-1 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      timerNumber === '0' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Timer 0
                  </button>
                  <button
                    onClick={() => setTimerNumber('1')}
                    className={`flex-1 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      timerNumber === '1' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Timer 1
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Mode</label>
                <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
                  <button
                    onClick={() => setTimerMode('1')}
                    className={`flex-1 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      timerMode === '1' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Mode 1 (16b)
                  </button>
                  <button
                    onClick={() => setTimerMode('2')}
                    className={`flex-1 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      timerMode === '2' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Mode 2 (8b)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Result Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3.5 lg:col-span-2 card-shadow">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Preload Derivation &amp; Registers
          </h3>

          {isOverflow ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm">
              <strong className="block font-bold mb-1">Time Delay Exceeds Timer Capacity!</strong>
              The requested delay requires {requiredCounts.toLocaleString()} counts, but Timer Mode {timerMode} supports up to {maxCapacity.toLocaleString()} counts. Use a software counter inside the ISR to divide the time.
            </div>
          ) : (
            <>
              {/* Cards grid: 2 cols on mobile, 4 on desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Counts (N)</span>
                  <span className="text-base sm:text-lg font-mono font-bold text-slate-900">{requiredCounts.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 block font-semibold uppercase">Preload Dec</span>
                  <span className="text-base sm:text-lg font-mono font-bold text-emerald-800">{preloadDec.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-amber-700 block font-semibold uppercase">TH{timerNumber} (High)</span>
                  <span className="text-base sm:text-lg font-mono font-bold text-amber-800">#{thHex}H</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-amber-700 block font-semibold uppercase">TL{timerNumber} (Low)</span>
                  <span className="text-base sm:text-lg font-mono font-bold text-amber-800">#{tlHex}H</span>
                </div>
              </div>

              {/* Step by step formula */}
              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 font-mono text-[11px] sm:text-xs space-y-1 text-slate-700">
                <div className="text-emerald-800 font-semibold mb-1 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Formula Breakdown (Section 4.7):
                </div>
                <div>1. Machine Cycle = 12 / {freq} MHz = {machineCycleUs.toFixed(4)} µs</div>
                <div>2. Counts = {delayInUs} µs / {machineCycleUs.toFixed(4)} µs = {requiredCounts} counts</div>
                <div>3. Preload = {maxCapacity} - {requiredCounts} = {preloadDec} = {preloadHex16}H</div>
                <div>4. Result: TH{timerNumber} = 0{thHex}H, TL{timerNumber} = 0{tlHex}H</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Assembly Code Generator */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 card-shadow space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Code className="w-4 h-4 text-emerald-600 shrink-0" />
            Complete Generated 8051 Assembly Program
          </h3>
          <button
            onClick={copyCode}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold rounded-lg text-white transition-all cursor-pointer shadow-xs shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-3 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] sm:text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
          {generatedAssembly}
        </pre>
      </div>
    </div>
  );
};

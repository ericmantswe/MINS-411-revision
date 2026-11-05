import React, { useState } from 'react';
import { Layers } from 'lucide-react';

interface BitDef {
  index: number;
  name: string;
  desc: string;
  role: string;
}

export const RegisterExplorer: React.FC = () => {
  const [activeReg, setActiveReg] = useState<'PSW' | 'IE' | 'IP' | 'TCON'>('PSW');

  const [pswVal, setPswVal] = useState(0x00);
  const [ieVal, setIeVal] = useState(0x82);
  const [ipVal, setIpVal] = useState(0x04);
  const [tconVal, setTconVal] = useState(0x01);

  const currentVal =
    activeReg === 'PSW' ? pswVal : activeReg === 'IE' ? ieVal : activeReg === 'IP' ? ipVal : tconVal;

  const setCurrentVal = (newVal: number) => {
    if (activeReg === 'PSW') setPswVal(newVal & 0xff);
    if (activeReg === 'IE') setIeVal(newVal & 0xff);
    if (activeReg === 'IP') setIpVal(newVal & 0xff);
    if (activeReg === 'TCON') setTconVal(newVal & 0xff);
  };

  const toggleBit = (bitIndex: number) => {
    const newVal = currentVal ^ (1 << bitIndex);
    setCurrentVal(newVal);
  };

  const bitDefinitions: Record<'PSW' | 'IE' | 'IP' | 'TCON', { addr: string; isBitAddr: boolean; bits: BitDef[] }> = {
    PSW: {
      addr: 'D0H',
      isBitAddr: true,
      bits: [
        { index: 7, name: 'CY', desc: 'Carry / Borrow', role: 'Carry out of bit 7 in ADD; borrow in SUBB. Also single-bit boolean accumulator.' },
        { index: 6, name: 'AC', desc: 'Auxiliary Carry', role: 'Carry out of bit 3 into bit 4. Used by DA A for BCD arithmetic correction.' },
        { index: 5, name: 'F0', desc: 'Flag 0', role: 'General purpose user-defined flag for the programmer.' },
        { index: 4, name: 'RS1', desc: 'Bank Select 1', role: 'Selects active register bank with RS0 (00=Bank 0, 01=Bank 1, 10=Bank 2, 11=Bank 3).' },
        { index: 3, name: 'RS0', desc: 'Bank Select 0', role: 'Selects active register bank with RS1.' },
        { index: 2, name: 'OV', desc: 'Overflow Flag', role: 'Set when signed two\'s-complement result is outside range -128 to +127.' },
        { index: 1, name: '-', desc: 'Reserved', role: 'Reserved bit (user definable or F1 on 8052).' },
        { index: 0, name: 'P', desc: 'Parity Flag', role: '1 if accumulator has odd number of 1s, 0 if even. Automatically recomputed after every instruction altering A.' },
      ],
    },
    IE: {
      addr: 'A8H',
      isBitAddr: true,
      bits: [
        { index: 7, name: 'EA', desc: 'Enable All', role: 'Global interrupt enable. If EA=0, no interrupt is serviced regardless of individual enable bits.' },
        { index: 6, name: '-', desc: 'Reserved', role: 'Reserved.' },
        { index: 5, name: 'ET2', desc: 'Enable Timer 2', role: '8052 only (reserved on 8051).' },
        { index: 4, name: 'ES', desc: 'Enable Serial', role: 'Enables serial communication interrupt (RI / TI).' },
        { index: 3, name: 'ET1', desc: 'Enable Timer 1', role: 'Enables Timer 1 overflow interrupt (TF1).' },
        { index: 2, name: 'EX1', desc: 'Enable External 1', role: 'Enables External Interrupt 1 on pin P3.3.' },
        { index: 1, name: 'ET0', desc: 'Enable Timer 0', role: 'Enables Timer 0 overflow interrupt (TF0).' },
        { index: 0, name: 'EX0', desc: 'Enable External 0', role: 'Enables External Interrupt 0 on pin P3.2.' },
      ],
    },
    IP: {
      addr: 'B8H',
      isBitAddr: true,
      bits: [
        { index: 7, name: '-', desc: 'Reserved', role: 'Reserved.' },
        { index: 6, name: '-', desc: 'Reserved', role: 'Reserved.' },
        { index: 5, name: 'PT2', desc: 'Priority Timer 2', role: '8052 only.' },
        { index: 4, name: 'PS', desc: 'Priority Serial', role: '1 = High priority, 0 = Low priority for Serial RI/TI.' },
        { index: 3, name: 'PT1', desc: 'Priority Timer 1', role: '1 = High priority, 0 = Low priority for Timer 1.' },
        { index: 2, name: 'PX1', desc: 'Priority External 1', role: '1 = High priority, 0 = Low priority for INT1.' },
        { index: 1, name: 'PT0', desc: 'Priority Timer 0', role: '1 = High priority, 0 = Low priority for Timer 0.' },
        { index: 0, name: 'PX0', desc: 'Priority External 0', role: '1 = High priority, 0 = Low priority for INT0.' },
      ],
    },
    TCON: {
      addr: '88H',
      isBitAddr: true,
      bits: [
        { index: 7, name: 'TF1', desc: 'Timer 1 Overflow Flag', role: 'Set by hardware when Timer 1 overflows; cleared automatically on entering ISR.' },
        { index: 6, name: 'TR1', desc: 'Timer 1 Run Control', role: '1 = Timer 1 runs, 0 = Stopped.' },
        { index: 5, name: 'TF0', desc: 'Timer 0 Overflow Flag', role: 'Set by hardware when Timer 0 overflows; cleared automatically on entering ISR.' },
        { index: 4, name: 'TR0', desc: 'Timer 0 Run Control', role: '1 = Timer 0 runs, 0 = Stopped.' },
        { index: 3, name: 'IE1', desc: 'External 1 Edge Flag', role: 'Set when edge/low level is detected on INT1; cleared automatically in edge mode.' },
        { index: 2, name: 'IT1', desc: 'Interrupt 1 Type', role: '1 = Falling-edge triggered, 0 = Low-level triggered on INT1.' },
        { index: 1, name: 'IE0', desc: 'External 0 Edge Flag', role: 'Set when edge/low level is detected on INT0; cleared automatically in edge mode.' },
        { index: 0, name: 'IT0', desc: 'Interrupt 0 Type', role: '1 = Falling-edge triggered, 0 = Low-level triggered on INT0.' },
      ],
    },
  };

  const regInfo = bitDefinitions[activeReg];

  const presetsByReg = {
    PSW: [
      { label: 'Bank 0 Active', val: 0x00, note: 'Reset default (00H)' },
      { label: 'Bank 1 Active', val: 0x08, note: 'RS1=0, RS0=1' },
      { label: 'Bank 2 Active', val: 0x10, note: 'RS1=1, RS0=0' },
      { label: 'Bank 3 Active', val: 0x18, note: 'RS1=1, RS0=1' },
      { label: 'Prob 3.1: CY=1, OV=1', val: 0x94, note: '94H' },
    ],
    IE: [
      { label: 'INT0 & Timer 0', val: 0x83, note: '83H' },
      { label: 'INT1 & Serial', val: 0x94, note: '94H' },
      { label: 'All Enabled', val: 0x9f, note: 'EA + 5 sources' },
      { label: 'Reset (Disabled)', val: 0x00, note: '00H' },
    ],
    IP: [
      { label: 'INT1 High Priority', val: 0x04, note: '04H' },
      { label: 'Timer 1 High Priority', val: 0x08, note: '08H (Ex 4.2)' },
      { label: 'Timer 0 & Serial High', val: 0x12, note: '12H' },
      { label: 'Default (All Low)', val: 0x00, note: '00H' },
    ],
    TCON: [
      { label: 'INT0/1 Edge Triggered', val: 0x05, note: 'IT0=1, IT1=1' },
      { label: 'Timers 0 & 1 Running', val: 0x50, note: 'TR0=1, TR1=1' },
      { label: 'Timer 0 Overflowed', val: 0x20, note: 'TF0=1' },
    ],
  };

  const vectorTable = [
    { src: 'RESET', vec: '0000H', pin: '9', prio: 'Absolute Master', clear: 'Hardware' },
    { src: 'External 0 (INT0)', vec: '0003H', pin: 'P3.2 (12)', prio: '1 (Highest default)', clear: 'Hardware (edge mode)' },
    { src: 'Timer 0 (TF0)', vec: '000BH', pin: '-', prio: '2', clear: 'Hardware' },
    { src: 'External 1 (INT1)', vec: '0013H', pin: 'P3.3 (13)', prio: '3', clear: 'Hardware (edge mode)' },
    { src: 'Timer 1 (TF1)', vec: '001BH', pin: '-', prio: '4', clear: 'Hardware' },
    { src: 'Serial (RI/TI)', vec: '0023H', pin: 'P3.0/P3.1', prio: '5 (Lowest default)', clear: 'Software (Programmer must CLR RI, CLR TI!)' },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 4-Way Tab Selector (fits in one row on mobile) */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-white border border-slate-200 rounded-xl card-shadow">
        {(['PSW', 'IE', 'IP', 'TCON'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setActiveReg(r)}
            className={`py-2 px-1 sm:px-3 rounded-lg font-mono text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 transition-all cursor-pointer ${
              activeReg === r
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>{r}</span>
            <span className="text-[10px] opacity-75 font-normal">({bitDefinitions[r].addr})</span>
          </button>
        ))}
      </div>

      {/* Main Bit Explorer Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 card-shadow space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="text-lg sm:text-xl font-bold font-mono text-slate-900">
                {activeReg} Register
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                Addr: {regInfo.addr}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                Bit-Addressable
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Tap individual bit blocks to toggle between 0 and 1.
            </p>
          </div>

          {/* Current Byte Value Banner */}
          <div className="flex items-center gap-3 bg-emerald-50 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-emerald-200 font-mono w-full sm:w-auto justify-around sm:justify-start">
            <div className="text-left sm:text-right">
              <div className="text-[9px] text-emerald-700 uppercase font-semibold">Hex Byte</div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-900">
                #{currentVal.toString(16).toUpperCase().padStart(2, '0')}H
              </div>
            </div>
            <div className="h-7 w-px bg-emerald-200" />
            <div className="text-left sm:text-right">
              <div className="text-[9px] text-emerald-700 uppercase font-semibold">Binary</div>
              <div className="text-xs sm:text-sm font-bold text-slate-800">
                {currentVal.toString(2).padStart(8, '0').slice(0, 4)}{' '}
                {currentVal.toString(2).padStart(8, '0').slice(4)}B
              </div>
            </div>
          </div>
        </div>

        {/* 8 Clickable Bit Buttons — 4 cols on mobile, 8 on tablet/desktop */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 sm:gap-2.5">
          {regInfo.bits.map((b) => {
            const isSet = (currentVal >> b.index) & 1;
            return (
              <button
                key={b.index}
                onClick={() => toggleBit(b.index)}
                className={`flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  isSet
                    ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-300'
                }`}
              >
                <div className={`text-[10px] font-mono font-semibold w-full flex items-center justify-between ${isSet ? 'text-emerald-100' : 'text-slate-400'}`}>
                  <span>b{b.index}</span>
                  <span className="text-[9px] opacity-75">D{b.index}</span>
                </div>
                <div className={`text-sm sm:text-base font-bold font-mono my-1 ${isSet ? 'text-white' : 'text-slate-800'}`}>
                  {b.name}
                </div>
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs border transition-all ${
                    isSet
                      ? 'bg-white text-emerald-700 border-white shadow-xs'
                      : 'bg-white text-slate-500 border-slate-300'
                  }`}
                >
                  {isSet}
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Quick Configurations:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presetsByReg[activeReg].map((p, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentVal(p.val)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <span>{p.label}</span>
                <span className="font-mono text-[10px] text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {p.note}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bit Explanations Grid */}
        <div className="space-y-2 pt-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Bit Explanations &amp; Roles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {regInfo.bits.map((b) => {
              const isSet = (currentVal >> b.index) & 1;
              return (
                <div
                  key={b.index}
                  className={`p-2.5 sm:p-3 rounded-xl border transition-all ${
                    isSet
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-mono font-bold text-emerald-800 text-[11px] sm:text-xs">
                      Bit {b.index}: {b.name} ({b.desc})
                    </span>
                    <span
                      className={`font-mono font-bold px-1.5 py-0.5 rounded text-[9px] ${
                        isSet ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isSet ? '1 (SET)' : '0 (CLR)'}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">{b.role}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vector Table Reference */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 card-shadow space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
            Interrupt Vector Table &amp; Priority Matrix
          </h3>
          <span className="text-[10px] text-slate-400 sm:hidden">Swipe table ➔</span>
        </div>

        <div className="overflow-x-auto -mx-3.5 px-3.5 sm:mx-0 sm:px-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full text-xs text-left border-collapse min-w-[580px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] sm:text-[11px] bg-slate-50">
                <th className="py-2.5 px-2.5">Interrupt Source</th>
                <th className="py-2.5 px-2 text-emerald-700 font-bold">Vector</th>
                <th className="py-2.5 px-2">Pin</th>
                <th className="py-2.5 px-2 text-amber-700 font-bold">Default Prio</th>
                <th className="py-2.5 px-2">IE Bit</th>
                <th className="py-2.5 px-2">IP Bit</th>
                <th className="py-2.5 px-2">Flag Cleared By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700 text-[11px]">
              {vectorTable.map((v, i) => (
                <tr key={i} className="hover:bg-emerald-50/40">
                  <td className="py-2 px-2.5 font-bold text-slate-900 font-sans">{v.src}</td>
                  <td className="py-2 px-2 text-emerald-700 font-bold">{v.vec}</td>
                  <td className="py-2 px-2">{v.pin}</td>
                  <td className="py-2 px-2 text-amber-700 font-sans">{v.prio}</td>
                  <td className="py-2 px-2">{i === 0 ? '-' : i === 1 ? 'EX0' : i === 2 ? 'ET0' : i === 3 ? 'EX1' : i === 4 ? 'ET1' : 'ES'}</td>
                  <td className="py-2 px-2">{i === 0 ? '-' : i === 1 ? 'PX0' : i === 2 ? 'PT0' : i === 3 ? 'PX1' : i === 4 ? 'PT1' : 'PS'}</td>
                  <td className={`py-2 px-2 font-sans ${i === 5 ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                    {v.clear}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

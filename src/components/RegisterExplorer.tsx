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
      { label: 'Bank 0 Active', val: 0x00, note: 'Default reset (00H)' },
      { label: 'Bank 1 Active', val: 0x08, note: 'RS1=0, RS0=1 (08H-0FH)' },
      { label: 'Bank 2 Active', val: 0x10, note: 'RS1=1, RS0=0 (10H-17H)' },
      { label: 'Bank 3 Active', val: 0x18, note: 'RS1=1, RS0=1 (18H-1FH)' },
      { label: 'Prob 3.1: CY=1, OV=1, Bank 2', val: 0x94, note: '1001 0100B = 94H' },
    ],
    IE: [
      { label: 'Enable INT0 & Timer 0', val: 0x83, note: 'EA, ET0, EX0 = 83H' },
      { label: 'Enable INT1 & Serial', val: 0x94, note: 'EA, ES, EX1 = 94H' },
      { label: 'Enable All Interrupts', val: 0x9f, note: 'EA + all 5 sources' },
      { label: 'Reset (All Disabled)', val: 0x00, note: 'All interrupts disabled' },
    ],
    IP: [
      { label: 'INT1 High Priority', val: 0x04, note: 'PX1=1 (04H)' },
      { label: 'Timer 1 High Priority', val: 0x08, note: 'PT1=1 (08H, Example 4.2)' },
      { label: 'Timer 0 & Serial High', val: 0x12, note: 'PT0=1, PS=1 (12H)' },
      { label: 'Default Priorities', val: 0x00, note: 'All low priority (00H)' },
    ],
    TCON: [
      { label: 'Both INT0/1 Edge Triggered', val: 0x05, note: 'IT0=1, IT1=1' },
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
    <div className="space-y-6">
      {/* Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-xl card-shadow">
        {(['PSW', 'IE', 'IP', 'TCON'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setActiveReg(r)}
            className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-full font-mono text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeReg === r
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{r}</span>
            <span className="text-[11px] opacity-75 font-normal">({bitDefinitions[r].addr})</span>
          </button>
        ))}
      </div>

      {/* Main Bit Explorer Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 card-shadow space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black font-mono text-slate-900 tracking-tight">
                {activeReg} Register
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800">
                Direct Addr: {regInfo.addr}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                Bit-Addressable
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Click individual bits below to toggle between 0 and 1. Watch how the hex byte updates in real time.
            </p>
          </div>

          {/* Current Byte Value Banner */}
          <div className="flex items-center gap-4 bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-200 font-mono">
            <div className="text-right">
              <div className="text-[10px] text-emerald-700 uppercase tracking-wider font-bold">Hex Value</div>
              <div className="text-2xl font-black text-emerald-900">
                #{currentVal.toString(16).toUpperCase().padStart(2, '0')}H
              </div>
            </div>
            <div className="h-8 w-px bg-emerald-200" />
            <div className="text-right">
              <div className="text-[10px] text-emerald-700 uppercase tracking-wider font-bold">Binary Byte</div>
              <div className="text-sm font-black text-slate-800">
                {currentVal.toString(2).padStart(8, '0').slice(0, 4)}{' '}
                {currentVal.toString(2).padStart(8, '0').slice(4)} B
              </div>
            </div>
          </div>
        </div>

        {/* 8 Clickable Bit Buttons */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {regInfo.bits.map((b) => {
            const isSet = (currentVal >> b.index) & 1;
            return (
              <button
                key={b.index}
                onClick={() => toggleBit(b.index)}
                className={`flex flex-col items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                  isSet
                    ? 'bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-500/25 scale-[1.02]'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/30'
                }`}
              >
                <div className={`text-[11px] font-mono font-bold w-full flex items-center justify-between ${isSet ? 'text-emerald-100' : 'text-slate-400'}`}>
                  <span>b{b.index}</span>
                  <span className="text-[10px] opacity-70">D{b.index}H</span>
                </div>
                <div className={`text-xl font-black font-mono my-2 ${isSet ? 'text-white' : 'text-slate-800'}`}>
                  {b.name}
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-black text-sm border transition-all ${
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
        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
            Textbook Configurations:
          </span>
          <div className="flex flex-wrap gap-2">
            {presetsByReg[activeReg].map((p, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentVal(p.val)}
                className="text-xs px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 transition-all flex items-center gap-2 cursor-pointer font-bold"
              >
                <span>{p.label}</span>
                <span className="font-mono text-[11px] text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {p.note}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bit Explanations Grid */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Bit Explanations & Roles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {regInfo.bits.map((b) => {
              const isSet = (currentVal >> b.index) & 1;
              return (
                <div
                  key={b.index}
                  className={`p-4 rounded-2xl border transition-all ${
                    isSet
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-extrabold text-emerald-800">
                      Bit {b.index}: {b.name} ({b.desc})
                    </span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded-full text-[10px] ${
                        isSet ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isSet ? '1 (SET)' : '0 (CLR)'}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed font-medium">{b.role}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vector Table Reference */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 card-shadow space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          Complete 8051 Interrupt Vector Table & Priority Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase bg-slate-50">
                <th className="py-3 px-3">Interrupt Source</th>
                <th className="py-3 px-3 text-emerald-700 font-bold">Vector (ROM)</th>
                <th className="py-3 px-3">Pin</th>
                <th className="py-3 px-3 text-amber-700 font-bold">Default Priority</th>
                <th className="py-3 px-3">Enable Bit (IE)</th>
                <th className="py-3 px-3">Priority Bit (IP)</th>
                <th className="py-3 px-3">Flag Cleared By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700 font-semibold">
              {vectorTable.map((v, i) => (
                <tr key={i} className="hover:bg-emerald-50/40">
                  <td className="py-3 px-3 font-bold text-slate-900">{v.src}</td>
                  <td className="py-3 px-3 text-emerald-700 font-bold">{v.vec}</td>
                  <td className="py-3 px-3">{v.pin}</td>
                  <td className="py-3 px-3 text-amber-700">{v.prio}</td>
                  <td className="py-3 px-3">{i === 0 ? '-' : i === 1 ? 'EX0' : i === 2 ? 'ET0' : i === 3 ? 'EX1' : i === 4 ? 'ET1' : 'ES'}</td>
                  <td className="py-3 px-3">{i === 0 ? '-' : i === 1 ? 'PX0' : i === 2 ? 'PT0' : i === 3 ? 'PX1' : i === 4 ? 'PT1' : 'PS'}</td>
                  <td className={`py-3 px-3 ${i === 5 ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
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


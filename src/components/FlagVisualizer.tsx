import React, { useState } from 'react';
import { Cpu, Binary, Calculator, Info } from 'lucide-react';
import { calculateParity } from '../utils/8051Simulator';

export const FlagVisualizer: React.FC = () => {
  const [op1Hex, setOp1Hex] = useState('38');
  const [op2Hex, setOp2Hex] = useState('2F');
  const [operation, setOperation] = useState<'ADD' | 'SUBB'>('ADD');
  const [carryIn, setCarryIn] = useState(0);

  const cleanHex = (val: string) => val.replace(/[^0-9a-fA-F]/g, '').slice(0, 2);
  const n1 = parseInt(op1Hex || '0', 16) & 0xff;
  const n2 = parseInt(op2Hex || '0', 16) & 0xff;

  // Presets from textbook examples
  const presets = [
    { label: 'Ex 3.1: 38H + 2FH', op1: '38', op2: '2F', op: 'ADD' as const, c: 0, desc: 'Normal add: AC=1, CY=0, OV=0, P=1' },
    { label: 'Ex 3.2: 9CH + 64H', op1: '9C', op2: '64', op: 'ADD' as const, c: 0, desc: 'Carry out: CY=1, AC=1, A=00H' },
    { label: 'Ex 3.3: 7FH + 01H', op1: '7F', op2: '01', op: 'ADD' as const, c: 0, desc: 'Signed overflow: OV=1, CY=0' },
    { label: 'Ex 3.4: 30H - 40H', op1: '30', op2: '40', op: 'SUBB' as const, c: 0, desc: 'Borrow: CY=1, A=F0H, OV=0' },
    { label: 'Prob 3.3(b): 80H + 80H', op1: '80', op2: '80', op: 'ADD' as const, c: 0, desc: 'Two negatives overflow: OV=1, CY=1' },
    { label: 'Prob 3.4(b): 80H - 01H', op1: '80', op2: '01', op: 'SUBB' as const, c: 0, desc: '-128 - 1 = -129 -> OV=1, AC=1' },
  ];

  const toBits = (num: number) => {
    const bits: number[] = [];
    for (let i = 7; i >= 0; i--) {
      bits.push((num >> i) & 1);
    }
    return bits;
  };

  const bits1 = toBits(n1);
  const bits2 = toBits(n2);

  let resultA = 0;
  let flagCY = 0;
  let flagAC = 0;
  let flagOV = 0;
  let flagP = 0;
  const bitCarries: number[] = new Array(9).fill(0);

  if (operation === 'ADD') {
    bitCarries[0] = carryIn;
    for (let i = 0; i < 8; i++) {
      const bitA = (n1 >> i) & 1;
      const bitB = (n2 >> i) & 1;
      const c = bitCarries[i];
      const sum = bitA + bitB + c;
      bitCarries[i + 1] = sum > 1 ? 1 : 0;
    }
    const fullSum = n1 + n2 + carryIn;
    resultA = fullSum & 0xff;
    flagCY = fullSum > 0xff ? 1 : 0;
    flagAC = bitCarries[4];
    flagOV = bitCarries[7] ^ flagCY;
    flagP = calculateParity(resultA);
  } else {
    // SUBB
    const borrowIn = carryIn;
    let b = borrowIn;
    for (let i = 0; i < 8; i++) {
      const bitA = (n1 >> i) & 1;
      const bitB = (n2 >> i) & 1;
      const diff = bitA - bitB - b;
      b = diff < 0 ? 1 : 0;
      bitCarries[i + 1] = b;
    }
    const fullDiff = n1 - n2 - borrowIn;
    resultA = (fullDiff + 256) % 256;
    flagCY = fullDiff < 0 ? 1 : 0;
    flagAC = bitCarries[4];
    const s1 = n1 > 127 ? n1 - 256 : n1;
    const s2 = n2 > 127 ? n2 - 256 : n2;
    const sDiff = s1 - s2 - borrowIn;
    flagOV = sDiff < -128 || sDiff > 127 ? 1 : 0;
    flagP = calculateParity(resultA);
  }

  const resultBits = toBits(resultA);
  const sN1 = n1 > 127 ? n1 - 256 : n1;
  const sN2 = n2 > 127 ? n2 - 256 : n2;
  const sRes = resultA > 127 ? resultA - 256 : resultA;

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 card-shadow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
              Interactive Hardware Math
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-emerald-600" />
              PSW Flags & Binary Arithmetic Engine
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Simulate 8051 <code className="text-emerald-700 font-bold">ADD</code> and <code className="text-emerald-700 font-bold">SUBB</code> step-by-step with real-time carry/borrow and status flags.
            </p>
          </div>
        </div>

        {/* Preset buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-4">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setOp1Hex(p.op1);
                setOp2Hex(p.op2);
                setOperation(p.op);
                setCarryIn(p.c);
              }}
              className="text-left p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer text-slate-700"
            >
              <div className="font-extrabold text-xs text-emerald-700">{p.label}</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main interactive inputs & operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 card-shadow">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-600" />
            Operands & Operation
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Operand 1 (Accumulator A)
              </label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-400 font-bold">#</span>
                <input
                  type="text"
                  maxLength={2}
                  value={op1Hex}
                  onChange={(e) => setOp1Hex(cleanHex(e.target.value))}
                  className="font-mono text-lg font-black bg-slate-50 border-2 border-slate-200 rounded-2xl px-3 py-2 text-emerald-800 w-24 text-center focus:outline-none focus:border-emerald-500"
                />
                <span className="text-sm font-mono text-slate-400 font-bold">H</span>
                <span className="text-xs text-slate-500 font-medium">({n1} dec, {sN1} signed)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 py-1">
              <span className="text-xs text-slate-500 font-bold">Operation:</span>
              <div className="flex rounded-full bg-slate-100 p-1 border border-slate-200">
                <button
                  onClick={() => setOperation('ADD')}
                  className={`px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                    operation === 'ADD'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ADD
                </button>
                <button
                  onClick={() => setOperation('SUBB')}
                  className={`px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                    operation === 'SUBB'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  SUBB
                </button>
              </div>

              {operation === 'SUBB' && (
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-xs text-slate-500 font-bold">CY in:</span>
                  <button
                    onClick={() => setCarryIn(carryIn === 0 ? 1 : 0)}
                    className={`w-7 h-7 rounded-full text-xs font-mono font-bold flex items-center justify-center border transition-all cursor-pointer ${
                      carryIn === 1
                        ? 'bg-amber-100 text-amber-800 border-amber-400'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {carryIn}
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Operand 2 (Source)
              </label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-400 font-bold">#</span>
                <input
                  type="text"
                  maxLength={2}
                  value={op2Hex}
                  onChange={(e) => setOp2Hex(cleanHex(e.target.value))}
                  className="font-mono text-lg font-black bg-slate-50 border-2 border-slate-200 rounded-2xl px-3 py-2 text-emerald-800 w-24 text-center focus:outline-none focus:border-emerald-500"
                />
                <span className="text-sm font-mono text-slate-400 font-bold">H</span>
                <span className="text-xs text-slate-500 font-medium">({n2} dec, {sN2} signed)</span>
              </div>
            </div>
          </div>

          {/* Quick Result Summary */}
          <div className="mt-4 pt-4 border-t border-slate-100 bg-emerald-50/50 p-4 rounded-2xl">
            <div className="text-xs text-slate-500 font-bold mb-1">Result in Accumulator:</div>
            <div className="text-xl font-mono font-black text-slate-900 flex items-baseline gap-2">
              <span>A =</span>
              <span className="text-emerald-700">{resultA.toString(16).toUpperCase().padStart(2, '0')}H</span>
              <span className="text-xs font-semibold text-slate-500">({resultA} unsigned, {sRes} signed)</span>
            </div>
          </div>
        </div>

        {/* Flag Status Register (PSW Bits) */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 lg:col-span-2 card-shadow">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Binary className="w-4 h-4 text-emerald-600" />
              PSW Status Flags Outcome
            </span>
            <span className="font-mono text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
              SFR D0H
            </span>
          </h3>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {/* CY */}
            <div className={`p-3 rounded-2xl border text-center transition-all ${
              flagCY === 1 ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className="text-xs font-bold font-mono">CY</div>
              <div className="text-2xl font-black font-mono my-1">{flagCY}</div>
              <div className="text-[10px] leading-tight font-medium">
                {operation === 'ADD' ? (flagCY ? 'Carry out bit 7' : 'No carry') : (flagCY ? 'Borrow needed' : 'No borrow')}
              </div>
            </div>

            {/* AC */}
            <div className={`p-3 rounded-2xl border text-center transition-all ${
              flagAC === 1 ? 'bg-indigo-50 border-indigo-300 text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className="text-xs font-bold font-mono">AC</div>
              <div className="text-2xl font-black font-mono my-1">{flagAC}</div>
              <div className="text-[10px] leading-tight font-medium">
                {flagAC ? 'Carry bit 3->4' : 'No aux carry'}
              </div>
            </div>

            {/* F0 */}
            <div className="p-3 rounded-2xl border text-center bg-slate-50 border-slate-200 text-slate-400">
              <div className="text-xs font-bold font-mono">F0</div>
              <div className="text-2xl font-black font-mono my-1">0</div>
              <div className="text-[10px] leading-tight font-medium">User Flag</div>
            </div>

            {/* RS1 */}
            <div className="p-3 rounded-2xl border text-center bg-slate-50 border-slate-200 text-slate-400">
              <div className="text-xs font-bold font-mono">RS1</div>
              <div className="text-2xl font-black font-mono my-1">0</div>
              <div className="text-[10px] leading-tight font-medium">Bank 0</div>
            </div>

            {/* RS0 */}
            <div className="p-3 rounded-2xl border text-center bg-slate-50 border-slate-200 text-slate-400">
              <div className="text-xs font-bold font-mono">RS0</div>
              <div className="text-2xl font-black font-mono my-1">0</div>
              <div className="text-[10px] leading-tight font-medium">Bank 0</div>
            </div>

            {/* OV */}
            <div className={`p-3 rounded-2xl border text-center transition-all ${
              flagOV === 1 ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className="text-xs font-bold font-mono">OV</div>
              <div className="text-2xl font-black font-mono my-1">{flagOV}</div>
              <div className="text-[10px] leading-tight font-medium">
                {flagOV ? 'Signed overflow!' : 'Signed valid'}
              </div>
            </div>

            {/* P */}
            <div className={`p-3 rounded-2xl border text-center transition-all ${
              flagP === 1 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className="text-xs font-bold font-mono">P</div>
              <div className="text-2xl font-black font-mono my-1">{flagP}</div>
              <div className="text-[10px] leading-tight font-medium">
                {flagP ? 'Odd # of 1s' : 'Even # of 1s'}
              </div>
            </div>
          </div>

          {/* Technical Rule Note */}
          <div className="text-xs p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1 text-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <Info className="w-4 h-4 text-emerald-600" />
              CY vs OV Distinction (Section 3.2):
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              The 8051 hardware does not know whether your bytes are signed or unsigned. <strong>CY</strong> is the error flag for <em>unsigned</em> arithmetic (result exceeds 255), while <strong>OV</strong> is the error flag for <em>signed two's-complement</em> arithmetic (result is outside [-128..+127]).
            </p>
          </div>
        </div>
      </div>

      {/* Bit-by-bit binary breakdown table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 card-shadow space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Binary className="w-4 h-4 text-emerald-600" />
          Binary Bitwise Working (Bit 7 down to Bit 0)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-center font-mono text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500">
                <th className="py-2.5 px-3 text-left font-sans font-bold">Step</th>
                <th className="py-2.5 px-2 text-amber-600 font-bold">Cout</th>
                <th className="py-2.5 px-2">Bit 7</th>
                <th className="py-2.5 px-2">Bit 6</th>
                <th className="py-2.5 px-2">Bit 5</th>
                <th className="py-2.5 px-2">Bit 4</th>
                <th className="py-2.5 px-2 border-r border-slate-200 text-indigo-600 font-bold">AC</th>
                <th className="py-2.5 px-2">Bit 3</th>
                <th className="py-2.5 px-2">Bit 2</th>
                <th className="py-2.5 px-2">Bit 1</th>
                <th className="py-2.5 px-2">Bit 0</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold">
              {/* Carries row */}
              <tr className="bg-amber-50/60 text-xs text-amber-700">
                <td className="py-2 px-3 text-left font-sans text-slate-600 font-bold">Carry in:</td>
                <td className="py-2 px-2 text-amber-800 font-black">{bitCarries[8]}</td>
                <td className="py-2 px-2">{bitCarries[7]}</td>
                <td className="py-2 px-2">{bitCarries[6]}</td>
                <td className="py-2 px-2">{bitCarries[5]}</td>
                <td className="py-2 px-2">{bitCarries[4]}</td>
                <td className="py-2 px-2 border-r border-slate-200 text-indigo-700">{bitCarries[4]}</td>
                <td className="py-2 px-2">{bitCarries[3]}</td>
                <td className="py-2 px-2">{bitCarries[2]}</td>
                <td className="py-2 px-2">{bitCarries[1]}</td>
                <td className="py-2 px-2">{bitCarries[0]}</td>
              </tr>

              {/* Operand 1 */}
              <tr>
                <td className="py-2.5 px-3 text-left font-sans text-slate-700">
                  A: #{op1Hex.padStart(2, '0').toUpperCase()}H
                </td>
                <td className="py-2.5 px-2 text-slate-300">-</td>
                {bits1.map((b, i) => (
                  <td key={i} className={`py-2.5 px-2 ${i === 3 ? 'border-r border-slate-200' : ''}`}>
                    {b}
                  </td>
                ))}
              </tr>

              {/* Operand 2 */}
              <tr>
                <td className="py-2.5 px-3 text-left font-sans text-slate-700">
                  {operation === 'ADD' ? '+' : '-'} #{op2Hex.padStart(2, '0').toUpperCase()}H
                </td>
                <td className="py-2.5 px-2 text-slate-300">-</td>
                {bits2.map((b, i) => (
                  <td key={i} className={`py-2.5 px-2 ${i === 3 ? 'border-r border-slate-200' : ''}`}>
                    {b}
                  </td>
                ))}
              </tr>

              {/* Result row */}
              <tr className="bg-emerald-50 text-emerald-900 border-t-2 border-emerald-500 font-black">
                <td className="py-3 px-3 text-left font-sans">
                  Result: #{resultA.toString(16).padStart(2, '0').toUpperCase()}H
                </td>
                <td className="py-3 px-2 text-amber-700">{flagCY}</td>
                {resultBits.map((b, i) => (
                  <td key={i} className={`py-3 px-2 ${i === 3 ? 'border-r border-slate-200' : ''}`}>
                    {b}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { BookOpen, Search, AlertCircle, Cpu, Layers, Bookmark } from 'lucide-react';

export const StudyGuide: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const glossaryItems = [
    { term: 'ISR', meaning: 'Interrupt Service Routine; the code that runs in response to an interrupt. Always ends with RETI.' },
    { term: 'IVT', meaning: 'Interrupt Vector Table; fixed ROM addresses (0000H, 0003H, 000BH, 0013H, 001BH, 0023H) where ISRs or jumps to ISRs are located.' },
    { term: 'PSW', meaning: 'Program Status Word; SFR at address D0H holding the flags CY, AC, F0, RS1, RS0, OV, P.' },
    { term: 'Carry (CY)', meaning: 'PSW.7: Set on carry out of bit 7 (addition) or borrow (subtraction); error flag for unsigned arithmetic and Boolean accumulator.' },
    { term: 'Auxiliary Carry (AC)', meaning: 'PSW.6: Set on carry from bit 3 into bit 4 (out of low nibble); essential for DA A BCD arithmetic correction.' },
    { term: 'Overflow (OV)', meaning: 'PSW.2: Set when signed two\'s-complement result is outside range -128 to +127 (carry-in to bit 7 XOR carry-out of bit 7).' },
    { term: 'Parity (P)', meaning: 'PSW.0: Set to 1 if accumulator contains an odd number of 1s; 0 if even. Automatically recomputed after every instruction altering A.' },
    { term: 'Maskable', meaning: 'Can be enabled or disabled by software via Interrupt Enable (IE) bits. All 5 user interrupts in 8051 are maskable.' },
    { term: 'Vectored', meaning: 'Each interrupt has a dedicated hardware vector address known to the CPU. All 8051 interrupts are vectored.' },
    { term: 'Edge vs Level Triggered', meaning: 'TCON ITx bit: ITx=1 detects a falling edge (latched); ITx=0 requires a continuous low level on INTx pin.' },
    { term: 'Register Bank', meaning: 'Four sets of 8 bytes (R0-R7) in RAM (00H-1FH), selected by PSW bits RS1 and RS0 (00=Bank 0, 01=Bank 1, 10=Bank 2, 11=Bank 3).' },
    { term: 'Stack Pointer (SP)', meaning: 'SFR at 81H holding the address of top item. Reset default is 07H. PUSH increments SP first, then writes. POP reads, then decrements.' },
    { term: 'Polling', meaning: 'The CPU repeatedly loops and checks peripheral status flags, wasting CPU cycles and reacting more slowly than hardware interrupts.' },
    { term: 'RETI vs RET', meaning: 'RETI pops PC from stack AND clears the interrupt priority-in-progress state. Regular RET leaves the interrupt latch active, permanently blocking future interrupts!' },
  ];

  const filteredGlossary = glossaryItems.filter(
    (item) =>
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Textbook Architecture Reference & Critical Correction Callout */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 card-shadow space-y-3 sm:space-y-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
            Technical Documentation
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1.5 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600 shrink-0" />
            8051 Architecture &amp; Interrupts Reference
          </h2>
        </div>

        {/* Highlighted Note from Page 4: Lecture Slides Correction */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50 border-l-4 border-amber-500 text-xs text-amber-950 space-y-1">
          <div className="font-bold text-amber-900 text-xs sm:text-sm flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            Crucial Correction to Lecture Slides (Page 4):
          </div>
          <p className="leading-relaxed">
            Slide 17 of Lecture 4 states that the microcontroller automatically pushes the PSW flags on an interrupt. 
            <strong> On the standard 8051 this is FALSE: only the Program Counter (PC) is pushed automatically</strong> (low byte PCL first, then high byte PCH; SP increases by 2). If your ISR modifies the accumulator or flags, you must save them yourself using <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">PUSH ACC</code> and <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">PUSH PSW</code>, and restore them in reverse order before <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">RETI</code>.
          </p>
        </div>
      </div>

      {/* 5 Addressing Modes Summary Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 card-shadow space-y-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
          The 5 Addressing Modes (Section 2.2)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 text-xs">
          <div className="p-3 sm:p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-mono font-bold text-emerald-700 block mb-0.5">1. Immediate</span>
            <p className="text-slate-600 mb-1.5">Operand prefixed with <code className="text-emerald-700 font-bold">#</code>.</p>
            <div className="font-mono text-[11px] text-slate-800 bg-white p-2 rounded-lg border border-slate-200 font-bold">
              MOV A,#25H<br/>MOV DPTR,#4521H
            </div>
          </div>
          <div className="p-3 sm:p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-mono font-bold text-emerald-700 block mb-0.5">2. Register</span>
            <p className="text-slate-600 mb-1.5">Operand is R0-R7, A, B, DPTR. No Rn moves!</p>
            <div className="font-mono text-[11px] text-slate-800 bg-white p-2 rounded-lg border border-slate-200 font-bold">
              MOV A,R0<br/>ADD A,R5
            </div>
          </div>
          <div className="p-3 sm:p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-mono font-bold text-emerald-700 block mb-0.5">3. Direct</span>
            <p className="text-slate-600 mb-1.5">Direct RAM/SFR address without <code className="text-emerald-700 font-bold">#</code>.</p>
            <div className="font-mono text-[11px] text-slate-800 bg-white p-2 rounded-lg border border-slate-200 font-bold">
              MOV R0,40H<br/>PUSH ACC (not PUSH A)
            </div>
          </div>
          <div className="p-3 sm:p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-mono font-bold text-emerald-700 block mb-0.5">4. Reg Indirect</span>
            <p className="text-slate-600 mb-1.5">Pointer register with <code className="text-emerald-700 font-bold">@</code>. Only @R0 or @R1!</p>
            <div className="font-mono text-[11px] text-slate-800 bg-white p-2 rounded-lg border border-slate-200 font-bold">
              MOV A,@R0<br/>MOV @R1,B
            </div>
          </div>
          <div className="p-3 sm:p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-mono font-bold text-emerald-700 block mb-0.5">5. Indexed</span>
            <p className="text-slate-600 mb-1.5">ROM lookup table using <code className="text-emerald-700 font-bold">@A+DPTR</code>.</p>
            <div className="font-mono text-[11px] text-slate-800 bg-white p-2 rounded-lg border border-slate-200 font-bold">
              MOVC A,@A+DPTR
            </div>
          </div>
        </div>
      </div>

      {/* 8-Step Interrupt Execution Lifecycle */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 card-shadow space-y-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
          The 8-Step Interrupt Servicing Sequence (Figure 4.1)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {[
            { step: '1', title: 'Request Arrives', desc: 'Hardware flag set (TF0, IE0, RI/TI).', type: 'hw' },
            { step: '2', title: 'Finish Current Inst', desc: 'CPU never halts mid-instruction.', type: 'hw' },
            { step: '3', title: 'Push PC onto Stack', desc: 'PCL pushed first, then PCH; SP += 2.', type: 'hw' },
            { step: '4', title: 'Clear Request Flag', desc: 'TF & edge flags cleared; priority blocked.', type: 'hw' },
            { step: '5', title: 'Load Vector Address', desc: 'e.g. 000BH loaded into PC.', type: 'hw' },
            { step: '6', title: 'Execute ISR', desc: 'User code runs; save ACC & PSW with PUSH/POP.', type: 'sw' },
            { step: '7', title: 'Execute RETI', desc: 'Pops PC and clears priority-in-progress.', type: 'sw' },
            { step: '8', title: 'Main Resumes', desc: 'CPU continues from interrupted address.', type: 'hw' },
          ].map((s) => (
            <div
              key={s.step}
              className={`p-3 rounded-xl border ${
                s.type === 'hw' ? 'bg-slate-50 border-slate-200' : 'bg-emerald-50 border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-emerald-700">Step {s.step}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${s.type === 'hw' ? 'bg-slate-200 text-slate-600' : 'bg-emerald-600 text-white'}`}>
                  {s.type === 'hw' ? 'HARDWARE' : 'PROGRAMMER'}
                </span>
              </div>
              <div className="font-bold text-slate-900">{s.title}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Glossary */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 card-shadow space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
            Quick Reference Glossary (Appendix B.2)
          </h3>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search terms or concepts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {filteredGlossary.map((g, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="font-mono font-bold text-emerald-700 text-xs sm:text-sm">{g.term}</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">{g.meaning}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

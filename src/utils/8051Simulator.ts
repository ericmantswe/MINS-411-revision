import type { CPUState } from '../types';

export function createInitialCPUState(): CPUState {
  const ram = new Uint8Array(128);
  return {
    A: 0,
    B: 0,
    R: [0, 0, 0, 0, 0, 0, 0, 0],
    DPTR: 0,
    SP: 0x07, // Reset default
    PC: 0x0000,
    PSW: {
      CY: 0,
      AC: 0,
      F0: 0,
      RS1: 0,
      RS0: 0,
      OV: 0,
      P: 0,
    },
    ram,
    ports: {
      P0: 0xff,
      P1: 0xff,
      P2: 0xff,
      P3: 0xff,
    },
    outputLog: ['CPU Reset: SP=07H, PC=0000H, Bank 0 active.'],
  };
}

// Compute parity: 1 if odd number of 1s in A, else 0
export function calculateParity(val8: number): number {
  let count = 0;
  for (let i = 0; i < 8; i++) {
    if ((val8 >> i) & 1) count++;
  }
  return count % 2 === 1 ? 1 : 0;
}

export function parseHexOrDec(token: string): number {
  const clean = token.trim().replace(/^#/, '');
  if (clean.toUpperCase().endsWith('H')) {
    return parseInt(clean.slice(0, -1), 16);
  }
  if (clean.toUpperCase().startsWith('0X')) {
    return parseInt(clean.slice(2), 16);
  }
  if (clean.toUpperCase().endsWith('B')) {
    return parseInt(clean.slice(0, -1), 2);
  }
  // If only decimal digits
  if (/^[0-9]+$/.test(clean)) {
    return parseInt(clean, 10);
  }
  return parseInt(clean, 16);
}

export interface SimulationResult {
  state: CPUState;
  executedLines: number;
  logs: string[];
}

export function run8051Program(code: string, maxSteps = 2000): SimulationResult {
  const state = createInitialCPUState();
  const rawLines = code.split('\n');
  const logs: string[] = ['Execution started...'];

  // Parse labels and instructions
  interface ParsedLine {
    lineNum: number;
    label?: string;
    mnemonic: string;
    operands: string[];
    raw: string;
  }

  const instructions: ParsedLine[] = [];
  const labelMap: Record<string, number> = {};
  const dbDataMap: Record<number, number[]> = {};

  let currentAddress = 0;

  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i];
    const noComment = raw.split(';')[0].trim();
    if (!noComment) continue;

    let work = noComment;
    let label: string | undefined;

    const colonIdx = work.indexOf(':');
    if (colonIdx !== -1) {
      label = work.substring(0, colonIdx).trim().toUpperCase();
      work = work.substring(colonIdx + 1).trim();
    }

    if (label) {
      labelMap[label] = instructions.length;
    }

    if (!work) continue;

    const parts = work.split(/\s+/);
    const mnemonic = parts[0].toUpperCase();
    const rest = work.substring(parts[0].length).trim();
    const operands = rest ? rest.split(',').map((s) => s.trim()) : [];

    if (mnemonic === 'ORG') {
      currentAddress = parseHexOrDec(operands[0]);
      continue;
    }

    if (mnemonic === 'DB') {
      const vals: number[] = [];
      const exprs = rest.split(',');
      for (const expr of exprs) {
        const cleanExpr = expr.trim();
        if (cleanExpr.startsWith('"') && cleanExpr.endsWith('"')) {
          const str = cleanExpr.slice(1, -1);
          for (let ch = 0; ch < str.length; ch++) {
            vals.push(str.charCodeAt(ch));
          }
        } else {
          vals.push(parseHexOrDec(cleanExpr) & 0xff);
        }
      }
      dbDataMap[currentAddress] = vals;
      currentAddress += vals.length;
      continue;
    }

    if (mnemonic === 'END') break;

    instructions.push({
      lineNum: i + 1,
      label,
      mnemonic,
      operands,
      raw: raw.trim(),
    });
    currentAddress += 2;
  }

  let pcIdx = 0;
  let steps = 0;

  const getBankOffset = () => (state.PSW.RS1 * 2 + state.PSW.RS0) * 8;

  const readRegister = (regName: string): number => {
    const r = regName.toUpperCase();
    if (r === 'A' || r === 'ACC') return state.A;
    if (r === 'B') return state.B;
    if (r.startsWith('R') && /^[0-7]$/.test(r.slice(1))) {
      const num = parseInt(r.slice(1), 10);
      return state.R[num];
    }
    if (r === 'DPTR') return state.DPTR;
    if (r === 'DPL') return state.DPTR & 0xff;
    if (r === 'DPH') return (state.DPTR >> 8) & 0xff;
    if (r === 'SP') return state.SP;
    if (r === 'PSW') {
      return (
        (state.PSW.CY << 7) |
        (state.PSW.AC << 6) |
        (state.PSW.F0 << 5) |
        (state.PSW.RS1 << 4) |
        (state.PSW.RS0 << 3) |
        (state.PSW.OV << 2) |
        state.PSW.P
      );
    }
    if (r === 'P0') return state.ports.P0;
    if (r === 'P1') return state.ports.P1;
    if (r === 'P2') return state.ports.P2;
    if (r === 'P3') return state.ports.P3;

    // Check direct RAM address
    const addr = parseHexOrDec(r);
    if (!isNaN(addr) && addr < 128) {
      return state.ram[addr];
    }
    return 0;
  };

  const writeRegister = (regName: string, val: number) => {
    val = val & 0xff;
    const r = regName.toUpperCase();
    if (r === 'A' || r === 'ACC') {
      state.A = val;
      state.PSW.P = calculateParity(val);
      return;
    }
    if (r === 'B') {
      state.B = val;
      return;
    }
    if (r.startsWith('R') && /^[0-7]$/.test(r.slice(1))) {
      const num = parseInt(r.slice(1), 10);
      state.R[num] = val;
      const bankBase = getBankOffset();
      state.ram[bankBase + num] = val;
      return;
    }
    if (r === 'DPTR') {
      state.DPTR = val & 0xffff;
      return;
    }
    if (r === 'DPL') {
      state.DPTR = (state.DPTR & 0xff00) | val;
      return;
    }
    if (r === 'DPH') {
      state.DPTR = (val << 8) | (state.DPTR & 0x00ff);
      return;
    }
    if (r === 'SP') {
      state.SP = val;
      return;
    }
    if (r === 'PSW') {
      state.PSW.CY = (val >> 7) & 1;
      state.PSW.AC = (val >> 6) & 1;
      state.PSW.F0 = (val >> 5) & 1;
      state.PSW.RS1 = (val >> 4) & 1;
      state.PSW.RS0 = (val >> 3) & 1;
      state.PSW.OV = (val >> 2) & 1;
      state.PSW.P = val & 1;
      // Reload current active bank registers from RAM
      const bankBase = getBankOffset();
      for (let j = 0; j < 8; j++) {
        state.R[j] = state.ram[bankBase + j];
      }
      return;
    }
    if (r === 'P0') {
      state.ports.P0 = val;
      return;
    }
    if (r === 'P1') {
      state.ports.P1 = val;
      return;
    }
    if (r === 'P2') {
      state.ports.P2 = val;
      return;
    }
    if (r === 'P3') {
      state.ports.P3 = val;
      return;
    }

    const addr = parseHexOrDec(r);
    if (!isNaN(addr) && addr < 128) {
      state.ram[addr] = val;
    }
  };

  while (pcIdx < instructions.length && steps < maxSteps) {
    const inst = instructions[pcIdx];
    const { mnemonic, operands } = inst;
    steps++;

    // Infinite loop detection e.g. SJMP $ or SJMP HERE: HERE: SJMP HERE
    if (mnemonic === 'SJMP' && (operands[0] === '$' || (inst.label && operands[0].toUpperCase() === inst.label))) {
      logs.push(`Halt loop encountered at line ${inst.lineNum} (${inst.raw}). Simulation complete.`);
      break;
    }

    switch (mnemonic) {
      case 'MOV': {
        const dest = operands[0];
        const src = operands[1];
        let val = 0;
        if (src.startsWith('#')) {
          val = parseHexOrDec(src);
        } else if (src.startsWith('@')) {
          const ptrReg = src.slice(1).toUpperCase();
          const ptr = readRegister(ptrReg);
          val = state.ram[ptr] || 0;
        } else {
          val = readRegister(src);
        }

        if (dest.startsWith('@')) {
          const ptrReg = dest.slice(1).toUpperCase();
          const ptr = readRegister(ptrReg);
          state.ram[ptr] = val & 0xff;
          // Sync R0-R7 if the indirect write lands in the active register bank
          const bankBase = getBankOffset();
          if (ptr >= bankBase && ptr < bankBase + 8) {
            state.R[ptr - bankBase] = val & 0xff;
          }
        } else {
          writeRegister(dest, val);
        }
        break;
      }

      case 'MOVC': {
        // MOVC A,@A+DPTR
        if (operands[0].toUpperCase() === 'A') {
          const base = state.DPTR;
          const offset = state.A;
          const target = base + offset;
          // Look up in DB tables
          let foundVal = 0;
          for (const [addrStr, dataArr] of Object.entries(dbDataMap)) {
            const startAddr = parseInt(addrStr, 10);
            if (target >= startAddr && target < startAddr + dataArr.length) {
              foundVal = dataArr[target - startAddr];
              break;
            }
          }
          state.A = foundVal & 0xff;
          state.PSW.P = calculateParity(state.A);
        }
        break;
      }

      case 'ADD':
      case 'ADDC': {
        const src = operands[1];
        let opVal = 0;
        if (src.startsWith('#')) opVal = parseHexOrDec(src);
        else opVal = readRegister(src);

        const carryIn = mnemonic === 'ADDC' ? state.PSW.CY : 0;
        const lowA = state.A & 0x0f;
        const lowOp = opVal & 0x0f;
        const sumLow = lowA + lowOp + carryIn;
        const ac = sumLow > 0x0f ? 1 : 0;

        const sumFull = state.A + opVal + carryIn;
        const cy = sumFull > 0xff ? 1 : 0;

        // OV calculation: carry into bit 7 != carry out of bit 7
        const bit6Sum = (state.A & 0x7f) + (opVal & 0x7f) + carryIn;
        const carryIn7 = bit6Sum > 0x7f ? 1 : 0;
        const ov = carryIn7 ^ cy;

        state.A = sumFull & 0xff;
        state.PSW.CY = cy;
        state.PSW.AC = ac;
        state.PSW.OV = ov;
        state.PSW.P = calculateParity(state.A);
        break;
      }

      case 'SUBB': {
        const src = operands[1];
        let opVal = 0;
        if (src.startsWith('#')) opVal = parseHexOrDec(src);
        else opVal = readRegister(src);

        const borrowIn = state.PSW.CY;
        const lowA = state.A & 0x0f;
        const lowOp = (opVal & 0x0f) + borrowIn;
        const ac = lowA < lowOp ? 1 : 0;

        const diff = state.A - opVal - borrowIn;
        const cy = diff < 0 ? 1 : 0;

        // OV: signed subtraction overflow
        const aSigned = state.A > 127 ? state.A - 256 : state.A;
        const opSigned = opVal > 127 ? opVal - 256 : opVal;
        const resSigned = aSigned - opSigned - borrowIn;
        const ov = resSigned < -128 || resSigned > 127 ? 1 : 0;

        state.A = (diff + 256) % 256;
        state.PSW.CY = cy;
        state.PSW.AC = ac;
        state.PSW.OV = ov;
        state.PSW.P = calculateParity(state.A);
        break;
      }

      case 'DA': {
        // Decimal adjust for BCD
        let a = state.A;
        let cy = state.PSW.CY;
        if ((a & 0x0f) > 9 || state.PSW.AC === 1) {
          a += 6;
        }
        if (a > 0x9f || cy === 1) {
          a += 0x60;
          cy = 1;
        }
        state.A = a & 0xff;
        state.PSW.CY = cy;
        state.PSW.P = calculateParity(state.A);
        break;
      }

      case 'MUL': {
        // MUL AB: A * B -> B is high byte, A is low byte
        const prod = state.A * state.B;
        state.A = prod & 0xff;
        state.B = (prod >> 8) & 0xff;
        state.PSW.CY = 0;
        state.PSW.OV = state.B !== 0 ? 1 : 0;
        state.PSW.P = calculateParity(state.A);
        break;
      }

      case 'DIV': {
        if (state.B === 0) {
          state.PSW.OV = 1;
        } else {
          const quot = Math.floor(state.A / state.B);
          const rem = state.A % state.B;
          state.A = quot;
          state.B = rem;
          state.PSW.OV = 0;
        }
        state.PSW.CY = 0;
        state.PSW.P = calculateParity(state.A);
        break;
      }

      case 'INC': {
        const dest = operands[0];
        if (dest.startsWith('@')) {
          const ptr = readRegister(dest.slice(1));
          state.ram[ptr] = (state.ram[ptr] + 1) & 0xff;
          // Sync register bank if indirect write lands in active bank
          const bankBase = getBankOffset();
          if (ptr >= bankBase && ptr < bankBase + 8) {
            state.R[ptr - bankBase] = state.ram[ptr];
          }
        } else if (dest.toUpperCase() === 'DPTR') {
          state.DPTR = (state.DPTR + 1) & 0xffff;
        } else {
          const val = (readRegister(dest) + 1) & 0xff;
          writeRegister(dest, val);
        }
        break;
      }

      case 'DEC': {
        const dest = operands[0];
        if (dest.startsWith('@')) {
          const ptr = readRegister(dest.slice(1));
          state.ram[ptr] = (state.ram[ptr] - 1 + 256) & 0xff;
          // Sync register bank if indirect write lands in active bank
          const bankBase = getBankOffset();
          if (ptr >= bankBase && ptr < bankBase + 8) {
            state.R[ptr - bankBase] = state.ram[ptr];
          }
        } else {
          const val = (readRegister(dest) - 1 + 256) & 0xff;
          writeRegister(dest, val);
        }
        break;
      }

      case 'CLR': {
        const target = operands[0].toUpperCase();
        if (target === 'A') {
          state.A = 0;
          state.PSW.P = 0;
        } else if (target === 'C') {
          state.PSW.CY = 0;
        } else if (target === 'PSW.4') {
          state.PSW.RS1 = 0;
        } else if (target === 'PSW.3') {
          state.PSW.RS0 = 0;
        }
        break;
      }

      case 'SETB': {
        const target = operands[0].toUpperCase();
        if (target === 'C') {
          state.PSW.CY = 1;
        } else if (target === 'PSW.4') {
          state.PSW.RS1 = 1;
        } else if (target === 'PSW.3') {
          state.PSW.RS0 = 1;
        }
        break;
      }

      case 'CPL': {
        const target = operands[0].toUpperCase();
        if (target === 'A') {
          state.A = (~state.A) & 0xff;
          state.PSW.P = calculateParity(state.A);
        } else if (target === 'C') {
          state.PSW.CY = state.PSW.CY === 1 ? 0 : 1;
        }
        break;
      }

      case 'PUSH': {
        state.SP = (state.SP + 1) & 0xff;
        const val = readRegister(operands[0]);
        state.ram[state.SP] = val;
        break;
      }

      case 'POP': {
        const val = state.ram[state.SP] || 0;
        state.SP = (state.SP - 1 + 256) & 0xff;
        writeRegister(operands[0], val);
        break;
      }

      case 'XCH': {
        const src = operands[1];
        const valA = state.A;
        const valSrc = readRegister(src);
        state.A = valSrc;
        writeRegister(src, valA);
        state.PSW.P = calculateParity(state.A);
        break;
      }

      case 'DJNZ': {
        const reg = operands[0];
        const label = operands[1].toUpperCase();
        const curVal = (readRegister(reg) - 1 + 256) & 0xff;
        writeRegister(reg, curVal);
        if (curVal !== 0 && labelMap[label] !== undefined) {
          pcIdx = labelMap[label];
          continue;
        }
        break;
      }

      case 'CJNE': {
        const op1 = readRegister(operands[0]);
        let op2 = 0;
        if (operands[1].startsWith('#')) op2 = parseHexOrDec(operands[1]);
        else op2 = readRegister(operands[1]);

        state.PSW.CY = op1 < op2 ? 1 : 0;
        if (op1 !== op2) {
          const targetLabel = operands[2].toUpperCase();
          if (labelMap[targetLabel] !== undefined) {
            pcIdx = labelMap[targetLabel];
            continue;
          }
        }
        break;
      }

      case 'JZ': {
        const targetLabel = operands[0].toUpperCase();
        if (state.A === 0 && labelMap[targetLabel] !== undefined) {
          pcIdx = labelMap[targetLabel];
          continue;
        }
        break;
      }

      case 'JNZ': {
        const targetLabel = operands[0].toUpperCase();
        if (state.A !== 0 && labelMap[targetLabel] !== undefined) {
          pcIdx = labelMap[targetLabel];
          continue;
        }
        break;
      }

      case 'JC': {
        const targetLabel = operands[0].toUpperCase();
        if (state.PSW.CY === 1 && labelMap[targetLabel] !== undefined) {
          pcIdx = labelMap[targetLabel];
          continue;
        }
        break;
      }

      case 'JNC': {
        const targetLabel = operands[0].toUpperCase();
        if (state.PSW.CY === 0 && labelMap[targetLabel] !== undefined) {
          pcIdx = labelMap[targetLabel];
          continue;
        }
        break;
      }

      case 'SJMP':
      case 'LJMP':
      case 'AJMP': {
        const targetLabel = operands[0].toUpperCase();
        if (labelMap[targetLabel] !== undefined) {
          pcIdx = labelMap[targetLabel];
          continue;
        }
        break;
      }

      default:
        break;
    }

    pcIdx++;
  }

  logs.push(`Halted after ${steps} instructions. Final A=${state.A.toString(16).toUpperCase().padStart(2, '0')}H, SP=${state.SP.toString(16).toUpperCase().padStart(2, '0')}H, CY=${state.PSW.CY}, OV=${state.PSW.OV}, P=${state.PSW.P}`);
  return {
    state,
    executedLines: steps,
    logs,
  };
}

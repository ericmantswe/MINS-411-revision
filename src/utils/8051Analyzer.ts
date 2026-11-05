import type { CodeError } from '../types';

export function analyze8051Code(code: string): CodeError[] {
  const errors: CodeError[] = [];
  const lines = code.split('\n');

  let hasOrg0 = false;
  let hasJumpOverVectors = false;
  let hasClrCBeforeSubb = false;
  let hasSpRelocation = false;
  let isInsideIsr = false;
  let isrPushes: string[] = [];
  let isrPops: string[] = [];
  let usesBank123 = false;

  for (let idx = 0; idx < lines.length; idx++) {
    const lineNum = idx + 1;
    const rawLine = lines[idx];

    // Strip comments
    const commentIndex = rawLine.indexOf(';');
    const lineWithoutComment = commentIndex !== -1 ? rawLine.substring(0, commentIndex) : rawLine;
    const trimmed = lineWithoutComment.trim();

    if (!trimmed) continue;

    // Check for ORG 0000H
    if (/^ORG\s+(0|0000H|0H)/i.test(trimmed)) {
      hasOrg0 = true;
    }

    if (hasOrg0 && /^(L|S|A)?JMP\s+[A-Za-z0-9_]+/i.test(trimmed)) {
      hasJumpOverVectors = true;
    }

    // Check stack pointer relocation
    if (/MOV\s+SP\s*,\s*#\s*[0-9A-Fa-f]+H?/i.test(trimmed)) {
      hasSpRelocation = true;
    }

    // Check register bank switches (Bank 1, 2, 3)
    if (/SETB\s+PSW\.[34]/i.test(trimmed) || /MOV\s+PSW\s*,\s*#(08H|10H|18H|[1-9][0-9A-Fa-f]*H?)/i.test(trimmed)) {
      usesBank123 = true;
    }

    // 1. Rn to Rn illegal move: MOV Rn, Rm
    const rnToRn = trimmed.match(/^MOV\s+R([0-7])\s*,\s*R([0-7])/i);
    if (rnToRn) {
      errors.push({
        line: lineNum,
        severity: 'error',
        rule: 'No Register-to-Register Move',
        message: `Illegal instruction "MOV R${rnToRn[1]}, R${rnToRn[2]}". The 8051 does not support direct Rn to Rn transfers.`,
        suggestion: `Use Accumulator A as an intermediate: "MOV A, R${rnToRn[2]}" followed by "MOV R${rnToRn[1]}, A".`
      });
    }

    // 2. PUSH A or POP A
    const pushA = trimmed.match(/^(PUSH|POP)\s+A\b/i);
    if (pushA) {
      errors.push({
        line: lineNum,
        severity: 'error',
        rule: 'Stack Direct Addressing Only',
        message: `Illegal instruction "${pushA[0]}". PUSH and POP accept only direct 8-bit RAM/SFR addresses. "A" is not a direct address symbol.`,
        suggestion: `Write "${pushA[1].toUpperCase()} ACC" or "${pushA[1].toUpperCase()} 0E0H" instead.`
      });
    }

    // 3. DPTR Size mismatch: MOV DPTR, A or MOV A, DPTR
    if (/^MOV\s+DPTR\s*,\s*A\b/i.test(trimmed) || /^MOV\s+A\s*,\s*DPTR\b/i.test(trimmed)) {
      errors.push({
        line: lineNum,
        severity: 'error',
        rule: 'Register Size Mismatch (16-bit vs 8-bit)',
        message: 'Illegal transfer between 16-bit DPTR and 8-bit Accumulator A.',
        suggestion: 'Transfer high and low bytes separately using DPH and DPL (e.g. MOV DPL, A or MOV DPH, A).'
      });
    }

    // 4. Invalid indirect registers: @R2 - @R7
    const invalidIndirect = trimmed.match(/@\s*R([2-7])\b/i);
    if (invalidIndirect) {
      errors.push({
        line: lineNum,
        severity: 'error',
        rule: 'Invalid Pointer Register',
        message: `Illegal indirect pointer "@R${invalidIndirect[1]}". Only R0 and R1 can be used as indirect RAM pointers with @.`,
        suggestion: `Use either @R0 or @R1 for internal RAM dereferencing.`
      });
    }

    // 5. Memory-to-memory indirect: MOV @R0, @R1
    if (/^MOV\s+@R[01]\s*,\s*@R[01]/i.test(trimmed)) {
      errors.push({
        line: lineNum,
        severity: 'error',
        rule: 'No Indirect Memory-to-Memory Move',
        message: 'Direct transfer between two indirect pointers is not supported.',
        suggestion: 'Move through Accumulator: "MOV A, @R1" then "MOV @R0, A".'
      });
    }

    // 6. 8-bit Immediate constant > 255 (0FFH)
    const immMatch = trimmed.match(/#\s*([0-9A-Fa-f]+)(H?)\b/i);
    if (immMatch && !trimmed.toUpperCase().includes('DPTR')) {
      const isHex = immMatch[2].toUpperCase() === 'H';
      const val = parseInt(immMatch[1], isHex ? 16 : 10);
      if (!isNaN(val) && val > 255) {
        errors.push({
          line: lineNum,
          severity: 'error',
          rule: '8-Bit Immediate Overflow',
          message: `Immediate value #${immMatch[1]}${immMatch[2]} (${val} decimal) exceeds the 8-bit register limit (0 to 255 / 0FFH).`,
          suggestion: 'Ensure immediate constants for 8-bit registers (A, B, R0-R7, RAM) do not exceed 255.'
        });
      }
    }

    // 7. Check CLR C before SUBB
    if (/^CLR\s+C\b/i.test(trimmed)) {
      hasClrCBeforeSubb = true;
    }
    if (/^SUBB\s+/i.test(trimmed)) {
      if (!hasClrCBeforeSubb) {
        errors.push({
          line: lineNum,
          severity: 'warning',
          rule: 'SUBB Subtracts Carry (Borrow)',
          message: 'Executing "SUBB" without first clearing the carry flag (CLR C). The 8051 SUBB instruction always computes (A - operand - CY).',
          suggestion: 'Place "CLR C" before SUBB unless this is part of a multi-byte subtraction sequence.'
        });
      }
      hasClrCBeforeSubb = false; // Reset for subsequent subtractions
    }

    // ISR tracking
    if (/(ISR|_ISR|SERVICE):/i.test(trimmed)) {
      isInsideIsr = true;
      isrPushes = [];
      isrPops = [];
    }

    if (isInsideIsr) {
      if (/^PUSH\s+([A-Za-z0-9_.]+)/i.test(trimmed)) {
        const item = trimmed.match(/^PUSH\s+([A-Za-z0-9_.]+)/i)![1].toUpperCase();
        isrPushes.push(item);
      }
      if (/^POP\s+([A-Za-z0-9_.]+)/i.test(trimmed)) {
        const item = trimmed.match(/^POP\s+([A-Za-z0-9_.]+)/i)![1].toUpperCase();
        isrPops.push(item);
      }

      if (/^RET\b/i.test(trimmed) && !/^RETI\b/i.test(trimmed)) {
        errors.push({
          line: lineNum,
          severity: 'error',
          rule: 'RETI Required for Interrupts',
          message: 'ISR terminated with "RET" instead of "RETI". RET does not reset the priority-in-progress state, causing system hang on future interrupts.',
          suggestion: 'Replace "RET" with "RETI".'
        });
      }

      if (/^RETI\b/i.test(trimmed)) {
        // Verify stack balance in ISR
        if (isrPushes.length !== isrPops.length) {
          errors.push({
            line: lineNum,
            severity: 'error',
            rule: 'Mismatched ISR PUSH/POP',
            message: `Stack imbalance in ISR! ${isrPushes.length} PUSH(es) vs ${isrPops.length} POP(s). RETI will pop the wrong address into the Program Counter.`,
            suggestion: 'Ensure every PUSH has a corresponding POP before RETI.'
          });
        }
        isInsideIsr = false;
      }
    }
  }

  // Global Program checks
  if (hasOrg0 && !hasJumpOverVectors && lines.length > 5) {
    errors.push({
      line: 1,
      severity: 'warning',
      rule: 'Interrupt Vector Table Overlap',
      message: 'Program starts at ORG 0000H but does not jump over the vector table. Code beyond address 0002H will collide with INT0 (0003H).',
      suggestion: 'Place "LJMP MAIN" at address 0000H and start application code at ORG 0030H.'
    });
  }

  if (usesBank123 && !hasSpRelocation) {
    errors.push({
      line: 1,
      severity: 'warning',
      rule: 'Default SP Collision with Bank 1-3',
      message: 'Register banks 1, 2, or 3 are selected, but SP has not been relocated from its reset default (07H). Stack pushes will overwrite R0-R7 of bank 1 (08H-0FH).',
      suggestion: 'Relocate the stack pointer at program startup: e.g. "MOV SP, #60H".'
    });
  }

  return errors;
}

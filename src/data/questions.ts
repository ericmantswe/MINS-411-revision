import type { Question } from '../types';

export const QUESTIONS: Question[] = [
  // ==========================================
  // CHAPTER 1: THE 8051 AT A GLANCE
  // ==========================================
  {
    id: 'ch1-1.1-typed',
    chapter: 'ch1',
    chapterTitle: 'Chapter 1: The 8051 at a Glance',
    title: 'Problem 1.1: Register Bank 2 RAM Address',
    type: 'typed_answer',
    prompt: 'A program selects register bank 2. At which internal RAM address is register R5 located?',
    correctAnswers: ['15H', '15h', '015H', '0x15', '15', '21'],
    answerPlaceholder: 'e.g. 15H',
    answerUnit: 'Hex Address',
    explanation: 'Bank 0 is 00H-07H, Bank 1 is 08H-0FH, Bank 2 is 10H-17H, Bank 3 is 18H-1FH. Therefore, R5 of Bank 2 is at address 10H + 05H = 15H.',
    detailedSteps: [
      'Each register bank contains 8 registers (R0 to R7).',
      'Bank 0 base = 00H',
      'Bank 1 base = 08H',
      'Bank 2 base = 10H',
      'Bank 2, register R5 = 10H + 05H = 15H.'
    ],
    referenceSection: 'Section 1.2 & Table 1.1 (Internal RAM map)'
  },
  {
    id: 'ch1-1.1-mc',
    chapter: 'ch1',
    chapterTitle: 'Chapter 1: The 8051 at a Glance',
    title: 'Concept Check: Register Banks Size and Count',
    type: 'multiple_choice',
    prompt: 'How many register banks exist in the 8051 internal RAM, and how many bytes does each bank occupy?',
    options: [
      '4 banks of 8 bytes each (R0-R7)',
      '2 banks of 16 bytes each (R0-R15)',
      '8 banks of 4 bytes each (R0-R3)',
      '4 banks of 16 bytes each'
    ],
    correctOptionIndex: 0,
    explanation: 'The 8051 provides 4 register banks (Bank 0 to Bank 3), each having 8 registers named R0 through R7 (occupying 8 bytes each, spanning addresses 00H to 1FH).',
    referenceSection: 'Section 1.2 Internal RAM map'
  },
  {
    id: 'ch1-1.2-typed',
    chapter: 'ch1',
    chapterTitle: 'Chapter 1: The 8051 at a Glance',
    title: 'Problem 1.2: Bit Address Mapping',
    type: 'typed_answer',
    prompt: 'Bit address 3AH belongs to which RAM byte and which bit of it? Write your answer in the form byte.bit (e.g. 25H.3 or 27H.2).',
    correctAnswers: ['27H.2', '27h.2', '27.2', 'byte 27H, bit 2', '0x27.2', '27H bit 2'],
    answerPlaceholder: 'byte.bit (e.g. 27H.2)',
    explanation: '3AH in decimal is 58. Since each RAM byte contains 8 bits starting at 20H: 58 / 8 = 7 remainder 2. The byte is 20H + 7 = 27H, and the bit is 2. So the answer is 27H.2.',
    detailedSteps: [
      'Bit-addressable RAM starts at byte address 20H (bit addresses 00H-7FH).',
      'Convert 3AH to decimal: (3 × 16) + 10 = 58.',
      'Divide by 8: 58 / 8 = 7 with a remainder of 2.',
      'Byte offset is 7: 20H + 7 = 27H.',
      'Bit position is the remainder: bit 2.',
      'Result: 27H.2.'
    ],
    referenceSection: 'Section 1.2 & Problem 1.2'
  },
  {
    id: 'ch1-1.3-mc',
    chapter: 'ch1',
    chapterTitle: 'Chapter 1: The 8051 at a Glance',
    title: 'Problem 1.3: Reset Stack Pointer Behavior',
    type: 'multiple_choice',
    prompt: 'Immediately after reset, a PUSH 0E0H instruction is executed. Where in RAM is the byte stored, what is SP afterwards, and what potential conflict does this create?',
    options: [
      'Stored at 08H, SP becomes 08H; it overwrites R0 of Bank 1.',
      'Stored at 07H, SP becomes 08H; it overwrites R7 of Bank 0.',
      'Stored at 08H, SP becomes 09H; it overwrites R1 of Bank 1.',
      'Stored at 30H, SP becomes 31H; it enters the scratchpad area.'
    ],
    correctOptionIndex: 0,
    explanation: 'On reset, SP = 07H. The PUSH instruction increments SP first (SP = 08H) and then writes the byte into RAM at address 08H. Because RAM 08H is register R0 of bank 1, any use of bank 1 will collide with the stack unless SP is relocated (e.g. MOV SP,#60H).',
    detailedSteps: [
      'Reset value of SP is 07H.',
      'PUSH operation on 8051: SP = SP + 1, then RAM[SP] = operand.',
      'SP increments from 07H to 08H.',
      'Byte is written to RAM[08H].',
      'RAM 08H is R0 of register bank 1! Thus using Bank 1 would corrupt stack data.'
    ],
    referenceSection: 'Section 1.4 The Stack & Reset value of SP'
  },
  {
    id: 'ch1-1.4-typed-a',
    chapter: 'ch1',
    chapterTitle: 'Chapter 1: The 8051 at a Glance',
    title: 'Problem 1.4: Direct Address of Accumulator (ACC)',
    type: 'typed_answer',
    prompt: 'What is the direct hexadecimal address of Special Function Register A (ACC)?',
    correctAnswers: ['E0H', 'E0h', '0E0H', '0xE0', 'E0', '0E0h'],
    answerPlaceholder: 'e.g. E0H',
    answerUnit: 'Hex Address',
    explanation: 'The Accumulator (A or ACC) has direct SFR address E0H. Since E0H is divisible by 8, it is also bit-addressable.',
    referenceSection: 'Section 1.3 Table 1.2'
  },
  {
    id: 'ch1-1.4-typed-psw',
    chapter: 'ch1',
    chapterTitle: 'Chapter 1: The 8051 at a Glance',
    title: 'Problem 1.4: Direct Address of PSW',
    type: 'typed_answer',
    prompt: 'What is the direct hexadecimal address of the Program Status Word (PSW)?',
    correctAnswers: ['D0H', 'D0h', '0D0H', '0xD0', 'D0', '0D0h'],
    answerPlaceholder: 'e.g. D0H',
    answerUnit: 'Hex Address',
    explanation: 'The Program Status Word (PSW) is located at direct address D0H in the SFR space. D0H is divisible by 8, so individual PSW bits are bit-addressable.',
    referenceSection: 'Section 1.3 Table 1.2'
  },
  {
    id: 'ch1-1.4-typed-ie',
    chapter: 'ch1',
    chapterTitle: 'Chapter 1: The 8051 at a Glance',
    title: 'Problem 1.4: Direct Address of Interrupt Enable (IE)',
    type: 'typed_answer',
    prompt: 'What is the direct hexadecimal address of the Interrupt Enable register (IE)?',
    correctAnswers: ['A8H', 'A8h', '0A8H', '0xA8', 'A8', '0A8h'],
    answerPlaceholder: 'e.g. A8H',
    answerUnit: 'Hex Address',
    explanation: 'The Interrupt Enable register (IE) has direct address A8H (which is bit-addressable, containing EA, ET2, ES, ET1, EX1, ET0, EX0).',
    referenceSection: 'Section 1.3 Table 1.2'
  },
  {
    id: 'ch1-bit-sfr-rule',
    chapter: 'ch1',
    chapterTitle: 'Chapter 1: The 8051 at a Glance',
    title: 'SFR Bit-Addressability Rule',
    type: 'multiple_choice',
    prompt: 'Which condition determines whether a Special Function Register (SFR) is bit-addressable in the 8051?',
    options: [
      'Its byte address must be a multiple of 8 (e.g. 80H, 88H, 90H, ..., F8H)',
      'Its address must be located between 20H and 2FH',
      'All SFRs from 80H to FFH are bit-addressable by default',
      'Only registers associated with Timer 0 and Timer 1 are bit-addressable'
    ],
    correctOptionIndex: 0,
    explanation: 'An SFR whose address is a multiple of 8 (i.e. ending in 0H or 8H: 80H, 88H, 90H, 98H, A0H, A8H, B0H, B8H, D0H, E0H, F0H) is bit-addressable. This allows instructions like SETB EA, CLR C, or SETB TR0.',
    referenceSection: 'Section 1.3 Table 1.2 Note'
  },

  // ==========================================
  // CHAPTER 2: ASSEMBLY LANGUAGE PROGRAMMING
  // ==========================================
  {
    id: 'ch2-2.1a-mc',
    chapter: 'ch2',
    chapterTitle: 'Chapter 2: Assembly Language Programming',
    title: 'Problem 2.1(a): Addressing Mode of MOV A,#25H',
    type: 'multiple_choice',
    prompt: 'What is the addressing mode of the instruction: MOV A,#25H ?',
    options: [
      'Immediate addressing',
      'Register addressing',
      'Direct addressing',
      'Register indirect addressing'
    ],
    correctOptionIndex: 0,
    explanation: 'The "#" sign denotes immediate data. The constant value 25H is embedded directly into the machine instruction.',
    referenceSection: 'Section 2.2.1 Immediate addressing'
  },
  {
    id: 'ch2-2.1d-mc',
    chapter: 'ch2',
    chapterTitle: 'Chapter 2: Assembly Language Programming',
    title: 'Problem 2.1(d): Addressing Mode of MOV A,@R1',
    type: 'multiple_choice',
    prompt: 'What is the addressing mode of the instruction: MOV A,@R1 ?',
    options: [
      'Register indirect addressing',
      'Register addressing',
      'Direct addressing',
      'Indexed addressing'
    ],
    correctOptionIndex: 0,
    explanation: 'The "@" symbol designates register indirect addressing. The register R1 acts as a pointer holding the internal RAM address to be read.',
    referenceSection: 'Section 2.2.4 Register indirect addressing'
  },
  {
    id: 'ch2-2.1e-mc',
    chapter: 'ch2',
    chapterTitle: 'Chapter 2: Assembly Language Programming',
    title: 'Problem 2.1(e): Addressing Mode of MOVC A,@A+DPTR',
    type: 'multiple_choice',
    prompt: 'What is the addressing mode of the instruction: MOVC A,@A+DPTR ?',
    options: [
      'Indexed addressing',
      'Register indirect addressing',
      'Immediate addressing',
      'Direct addressing'
    ],
    correctOptionIndex: 0,
    explanation: 'MOVC A,@A+DPTR uses Indexed addressing. The base address in 16-bit DPTR is summed with the 8-bit index in accumulator A to fetch a byte from program ROM.',
    referenceSection: 'Section 2.2.5 Indexed addressing and look-up tables'
  },
  {
    id: 'ch2-2.2a-mc',
    chapter: 'ch2',
    chapterTitle: 'Chapter 2: Assembly Language Programming',
    title: 'Problem 2.2(a): Why is MOV R4,R7 illegal?',
    type: 'multiple_choice',
    prompt: 'Why is the instruction "MOV R4,R7" illegal in 8051 assembly, and how should it be correctly implemented?',
    options: [
      'The 8051 has no register-to-register (Rn to Rn) move instructions; use "MOV A,R7" followed by "MOV R4,A".',
      'R4 and R7 belong to different register banks; switch banks first.',
      'Only R0 and R1 can be destination registers; use "MOV @R0,R7".',
      'Data can only move from smaller registers to larger registers.'
    ],
    correctOptionIndex: 0,
    explanation: 'There is no machine opcode for moving directly between two working registers Rn (R0-R7). The accumulator must be used as an intermediary: MOV A,R7 then MOV R4,A.',
    referenceSection: 'Section 2.2.2 & Problem 2.2(a)'
  },
  {
    id: 'ch2-2.2b-mc',
    chapter: 'ch2',
    chapterTitle: 'Chapter 2: Assembly Language Programming',
    title: 'Problem 2.2(b): Why is PUSH A illegal?',
    type: 'multiple_choice',
    prompt: 'Why is the instruction "PUSH A" invalid, and what is the proper instruction?',
    options: [
      'PUSH and POP require direct addresses; the mnemonic "A" is not a direct address, so use "PUSH ACC" or "PUSH 0E0H".',
      'The accumulator is read-only when interacting with the stack.',
      'PUSH can only take immediate constants such as "PUSH #00H".',
      'Only DPTR and B can be pushed directly without using R0.'
    ],
    correctOptionIndex: 0,
    explanation: 'PUSH and POP instructions only accept direct 8-bit addresses (e.g. 0E0H or its SFR symbol ACC). "PUSH A" causes an assembler error because "A" is a register operand, not a direct address symbol.',
    referenceSection: 'Section 2.2.3 Direct addressing callout'
  },
  {
    id: 'ch2-2.2d-mc',
    chapter: 'ch2',
    chapterTitle: 'Chapter 2: Assembly Language Programming',
    title: 'Problem 2.2(d): Why is MOV A,@R3 illegal?',
    type: 'multiple_choice',
    prompt: 'Why does "MOV A,@R3" fail to assemble?',
    options: [
      'Only R0 and R1 can be used as indirect RAM pointers with @.',
      'R3 can only point to external RAM, not internal RAM.',
      'Only the DPTR register can use the @ indirect symbol.',
      'R3 is reserved exclusively for loop counters.'
    ],
    correctOptionIndex: 0,
    explanation: 'In the 8051 architecture, only registers R0 and R1 are equipped with indirect pointer hardware for internal RAM. @R2, @R3, @R4, etc., are illegal.',
    referenceSection: 'Section 2.2.4 Register indirect addressing'
  },
  {
    id: 'ch2-2.3-typed',
    chapter: 'ch2',
    chapterTitle: 'Chapter 2: Assembly Language Programming',
    title: 'Problem 2.3: Memory vs Immediate Addressing Trace',
    type: 'typed_answer',
    prompt: 'Given: MOV 40H,#0A5H and MOV R0,#40H. What hexadecimal value is loaded into A after executing: MOV A,@R0 ?',
    correctAnswers: ['A5H', '0A5H', 'A5', 'a5h', '0xa5', '0a5'],
    answerPlaceholder: 'e.g. 0A5H',
    answerUnit: 'Hex Value',
    explanation: 'R0 contains 40H. MOV A,@R0 uses indirect addressing: it looks up the byte stored at RAM address 40H, which is 0A5H.',
    detailedSteps: [
      'Address 40H holds the value 0A5H.',
      'Register R0 holds the address pointer 40H.',
      'MOV A,@R0 dereferences R0: A = RAM[40H] = 0A5H.'
    ],
    referenceSection: 'Section 2.2.4 & Problem 2.3'
  },
  {
    id: 'ch2-2.6-typed',
    chapter: 'ch2',
    chapterTitle: 'Chapter 2: Assembly Language Programming',
    title: 'Problem 2.6: DJNZ Loop Output',
    type: 'typed_answer',
    prompt: 'What are the final contents of Accumulator A in hexadecimal after running this loop?\nMOV A,#0\nMOV R2,#12\nL: ADD A,#05H\n   DJNZ R2,L',
    correctAnswers: ['3CH', '3Ch', '3ch', '03CH', '0x3C', '60'],
    answerPlaceholder: 'e.g. 3CH',
    answerUnit: 'Hex Value',
    explanation: 'The loop executes 12 decimal times, adding 5 each pass: 12 × 5 = 60 decimal. In hexadecimal, 60 = 3CH (3 × 16 + 12).',
    detailedSteps: [
      'Initial A = 0.',
      'Counter R2 is loaded with 12 (decimal).',
      'Each iteration adds 5 to A.',
      'Total accumulated = 12 × 5 = 60 decimal.',
      '60 / 16 = 3 remainder 12 (CH) -> 3CH.'
    ],
    referenceSection: 'Section 2.4.1 & Problem 2.6'
  },
  {
    id: 'ch2-2.7-mc',
    chapter: 'ch2',
    chapterTitle: 'Chapter 2: Assembly Language Programming',
    title: 'Problem 2.7: Nested Loop Multipliers for 900 Cycles',
    type: 'multiple_choice',
    prompt: 'To complement accumulator A exactly 900 times using a nested DJNZ loop, which valid pair of outer and inner loop counts can be loaded into 8-bit registers?',
    options: [
      'Outer = 9, Inner = 100 (or Outer = 30, Inner = 30)',
      'Outer = 1, Inner = 900',
      'Outer = 100, Inner = 900',
      'Outer = 3, Inner = 300'
    ],
    correctOptionIndex: 0,
    explanation: 'Since 8051 registers are 8-bit, the maximum value in any register is 255. A count of 900 must be factored into two numbers <= 255 whose product is 900: e.g. 9 × 100 = 900, or 30 × 30 = 900, or 18 × 50 = 900.',
    referenceSection: 'Section 2.4.2 Nested loops'
  },
  {
    id: 'ch2-ports-pullup-mc',
    chapter: 'ch2',
    chapterTitle: 'Chapter 2: Assembly Language Programming',
    title: 'Hardware Feature: 8051 Port Pull-Up Resistors',
    type: 'multiple_choice',
    prompt: 'Which of the four 8051 I/O ports has open-drain outputs and requires external pull-up resistors (approx. 10 kΩ) to output a logic high?',
    options: [
      'Port 0 (P0)',
      'Port 1 (P1)',
      'Port 2 (P2)',
      'Port 3 (P3)'
    ],
    correctOptionIndex: 0,
    explanation: 'Ports 1, 2, and 3 have internal pull-up resistors. Port 0 is open-drain when used as general-purpose I/O and requires external pull-up resistors to output 5 V (high logic).',
    referenceSection: 'Section 2.5 Bit operations and I/O ports'
  },

  // ==========================================
  // CHAPTER 3: THE PSW AND STATUS FLAGS
  // ==========================================
  {
    id: 'ch3-3.1-typed',
    chapter: 'ch3',
    chapterTitle: 'Chapter 3: The PSW and Status Flags',
    title: 'Problem 3.1: Constructing the PSW Byte in Hex',
    type: 'typed_answer',
    prompt: 'Determine the hexadecimal value of the PSW register when:\nCY = 1, AC = 0, F0 = 0, Register Bank 2 selected, OV = 1, and P = 0.',
    correctAnswers: ['94H', '94h', '094H', '0x94', '94'],
    answerPlaceholder: 'e.g. 94H',
    answerUnit: 'Hex Value',
    explanation: 'PSW bit layout: CY(bit 7), AC(bit 6), F0(bit 5), RS1(bit 4), RS0(bit 3), OV(bit 2), -(bit 1), P(bit 0). Bank 2 means RS1=1, RS0=0. The binary byte is 1 0 0 1 0 1 0 0 B = 94H.',
    detailedSteps: [
      'Bit 7: CY = 1',
      'Bit 6: AC = 0',
      'Bit 5: F0 = 0',
      'Bit 4: RS1 = 1 (for Bank 2)',
      'Bit 3: RS0 = 0 (for Bank 2)',
      'Bit 2: OV = 1',
      'Bit 1: Reserved = 0',
      'Bit 0: P = 0',
      'Binary: 1001 0100 B',
      'Hex conversion: 1001 = 9, 0100 = 4 -> 94H.'
    ],
    referenceSection: 'Section 3.1 Table 3.1 & Problem 3.1'
  },
  {
    id: 'ch3-3.2-mc',
    chapter: 'ch3',
    chapterTitle: 'Chapter 3: The PSW and Status Flags',
    title: 'Problem 3.2: PSW Bank Bits and RAM Addressing',
    type: 'multiple_choice',
    prompt: 'If PSW = 18H, which register bank is active and what RAM addresses do registers R0-R7 occupy?',
    options: [
      'Bank 3, occupying addresses 18H to 1FH',
      'Bank 2, occupying addresses 10H to 17H',
      'Bank 1, occupying addresses 08H to 0FH',
      'Bank 0, occupying addresses 00H to 07H'
    ],
    correctOptionIndex: 0,
    explanation: '18H in binary is 0001 1000 B. Bit 4 (RS1) = 1 and Bit 3 (RS0) = 1. The RS1:RS0 pair 11 selects Register Bank 3, which occupies RAM addresses 18H through 1FH.',
    referenceSection: 'Section 3.4 Table 3.3 Register bank selection'
  },
  {
    id: 'ch3-3.3a-mc',
    chapter: 'ch3',
    chapterTitle: 'Chapter 3: The PSW and Status Flags',
    title: 'Problem 3.3(a): Flag Calculation for FFH + 01H',
    type: 'multiple_choice',
    prompt: 'What are the values of A, CY, AC, OV, and P after executing:\nMOV A,#0FFH\nADD A,#01H',
    options: [
      'A = 00H, CY = 1, AC = 1, OV = 0, P = 0',
      'A = 00H, CY = 1, AC = 0, OV = 1, P = 0',
      'A = 01H, CY = 1, AC = 1, OV = 0, P = 1',
      'A = 00H, CY = 0, AC = 1, OV = 0, P = 0'
    ],
    correctOptionIndex: 0,
    explanation: '1111 1111 + 0000 0001 = 1 0000 0000 (result in A is 00H). Carry out of bit 7 occurs -> CY = 1. Low nibble FH + 1H = 10H carries into bit 4 -> AC = 1. Signed addition: (-1) + (+1) = 0, which is correct in two\'s complement -> OV = 0. A = 00H contains zero 1s (even count) -> P = 0.',
    detailedSteps: [
      'Binary: 1111 1111 (FFH) + 0000 0001 (01H) = 1 0000 0000',
      'Accumulator holds the low 8 bits: 00H.',
      'CY = 1 because there is a carry out of bit 7.',
      'AC = 1 because low nibble (FH + 1H) produces a carry out of bit 3 into bit 4.',
      'OV = 0: Carry into bit 7 is 1, carry out is 1; XOR is 0.',
      'P = 0: Zero 1s in 00H (even number of 1s).'
    ],
    referenceSection: 'Section 3.2 Examples 3.1-3.3'
  },
  {
    id: 'ch3-3.3b-mc',
    chapter: 'ch3',
    chapterTitle: 'Chapter 3: The PSW and Status Flags',
    title: 'Problem 3.3(b): Flag Calculation for 80H + 80H',
    type: 'multiple_choice',
    prompt: 'What are the values of A, CY, AC, OV, and P after executing:\nMOV A,#80H\nADD A,#80H',
    options: [
      'A = 00H, CY = 1, AC = 0, OV = 1, P = 0',
      'A = 00H, CY = 1, AC = 1, OV = 0, P = 0',
      'A = 00H, CY = 0, AC = 0, OV = 1, P = 1',
      'A = 80H, CY = 1, AC = 0, OV = 1, P = 0'
    ],
    correctOptionIndex: 0,
    explanation: '1000 0000 + 1000 0000 = 1 0000 0000. Carry out of bit 7 -> CY = 1. Low nibbles 0+0 need no carry -> AC = 0. In signed arithmetic, -128 + -128 = -256, which exceeds the signed 8-bit range [-128..+127] -> OV = 1 (carry in=0, carry out=1, XOR=1). P = 0 (zero 1s).',
    detailedSteps: [
      'Unsigned sum: 128 + 128 = 256 -> requires 9th bit -> CY = 1, A = 00H.',
      'AC = 0 because low nibbles are 00H.',
      'Signed sum: -128 + (-128) = -256. Outside [-128, +127] -> OV = 1.',
      'P = 0: 00H has an even number of 1s.'
    ],
    referenceSection: 'Section 3.2 Example 3.3 & Appendix A.3'
  },
  {
    id: 'ch3-3.4a-typed',
    chapter: 'ch3',
    chapterTitle: 'Chapter 3: The PSW and Status Flags',
    title: 'Problem 3.4(a): Subtraction SUBB Result in A',
    type: 'typed_answer',
    prompt: 'What is the hexadecimal content of A after executing:\nCLR C\nMOV A,#30H\nSUBB A,#40H',
    correctAnswers: ['F0H', 'F0h', '0F0H', '0xF0', 'F0'],
    answerPlaceholder: 'e.g. F0H',
    answerUnit: 'Hex Value',
    explanation: '30H - 40H - 0 = -10H = -16 decimal. In two\'s complement 8-bit representation, -16 = F0H (1111 0000B). Since a borrow was needed, CY = 1.',
    detailedSteps: [
      '30H = 0011 0000B (48 decimal)',
      '40H = 0100 0000B (64 decimal)',
      '48 - 64 = -16 decimal',
      'Two\'s complement of 16 (0001 0000) = 1111 0000 = F0H',
      'A = F0H, CY = 1 (borrow required).'
    ],
    referenceSection: 'Section 3.2 Subtraction & Example 3.4'
  },
  {
    id: 'ch3-3.5a-mc',
    chapter: 'ch3',
    chapterTitle: 'Chapter 3: The PSW and Status Flags',
    title: 'Problem 3.5(a): Why the 8051 Has No Zero (Z) Flag',
    type: 'multiple_choice',
    prompt: 'Why does the 8051 Program Status Word (PSW) lack a dedicated Zero (Z) flag?',
    options: [
      'The accumulator can be tested directly for zero by hardware using JZ and JNZ instructions, making a separate flag redundant.',
      'Zero values cannot occur in 8-bit microcontrollers.',
      'The parity flag P acts as the zero flag when inverted.',
      'Branching on zero is only allowed through external interrupts.'
    ],
    correctOptionIndex: 0,
    explanation: 'Unlike processors like the 8085 or x86, the 8051 evaluates the accumulator bits directly inside the JZ and JNZ execution logic. Thus, a dedicated Z flag in the PSW is completely unnecessary.',
    referenceSection: 'Section 3.1 "There is no zero flag" note'
  },
  {
    id: 'ch3-3.7-typed',
    chapter: 'ch3',
    chapterTitle: 'Chapter 3: The PSW and Status Flags',
    title: 'Problem 3.7: Parity Calculation for ASCII "A"',
    type: 'typed_answer',
    prompt: 'For the 7-bit ASCII character "A" (41H), if even parity is generated into bit 7 of the accumulator, what is the final value of A in hex?',
    correctAnswers: ['41H', '41h', '041H', '0x41', '41'],
    answerPlaceholder: 'e.g. 41H',
    answerUnit: 'Hex Value',
    explanation: '41H in binary is 0100 0001 B. It contains two 1s (an even count). Under even parity rules, the total count of 1s must be even, so the parity bit (bit 7) remains 0. Therefore, A remains 41H.',
    detailedSteps: [
      '41H = 0100 0001 B.',
      'Count the 1-bits: bit 6 and bit 0 are 1 (total = 2).',
      'Since 2 is already even, the parity flag P = 0.',
      'Copying P (or 0) into bit 7 leaves bit 7 as 0.',
      'Final byte in A is 0100 0001 B = 41H.'
    ],
    referenceSection: 'Section 3.3 Example 3.5 & Problem 3.7'
  },
  {
    id: 'ch3-3.9-typed',
    chapter: 'ch3',
    chapterTitle: 'Chapter 3: The PSW and Status Flags',
    title: 'Problem 3.9: BCD Addition with DA A',
    type: 'typed_answer',
    prompt: 'Given BCD addition: MOV A,#47H then ADD A,#38H followed by DA A. What is the value of accumulator A in hex AFTER the DA A instruction?',
    correctAnswers: ['85H', '85h', '085H', '0x85', '85'],
    answerPlaceholder: 'e.g. 85H',
    answerUnit: 'Hex BCD Value',
    explanation: 'Binary add: 47H + 38H = 7FH. Low nibble FH is > 9, so DA A adds 06H: 7FH + 06H = 85H. 47 + 38 = 85 in BCD decimal arithmetic.',
    detailedSteps: [
      '47H + 38H = 7FH.',
      'AC is 0 because 7H + 8H = 0FH (no carry into bit 4).',
      'The low nibble (FH) is greater than 9, which is an invalid BCD digit.',
      'DA A detects low nibble > 9 and adds 06H to A.',
      '7FH + 06H = 85H (correct BCD representation of 47 + 38 = 85).'
    ],
    referenceSection: 'Section 3.5 Example 3.7 & Problem 3.9'
  },
  {
    id: 'ch3-3.10-mc',
    chapter: 'ch3',
    chapterTitle: 'Chapter 3: The PSW and Status Flags',
    title: 'Problem 3.10: Flag State After MUL AB',
    type: 'multiple_choice',
    prompt: 'Predict the contents of registers A and B and flags OV and CY after executing:\nMOV A,#0F0H\nMOV B,#2\nMUL AB',
    options: [
      'A = E0H, B = 01H, OV = 1, CY = 0',
      'A = 01H, B = E0H, OV = 1, CY = 1',
      'A = E0H, B = 00H, OV = 0, CY = 0',
      'A = F0H, B = 02H, OV = 0, CY = 1'
    ],
    correctOptionIndex: 0,
    explanation: '240 × 2 = 480 decimal = 01E0H. Low byte goes to A (E0H), high byte goes to B (01H). Because the result exceeds 255 (B != 0), OV = 1. MUL always clears CY to 0.',
    detailedSteps: [
      '0F0H = 240 decimal.',
      '240 × 2 = 480 decimal.',
      '480 in hex = 01E0H.',
      'Accumulator gets low byte: E0H.',
      'Register B gets high byte: 01H.',
      'Since high byte B != 0 (product > 255), the overflow flag OV is set to 1.',
      'Carry flag CY is always cleared to 0 by MUL AB.'
    ],
    referenceSection: 'Section 3.5 Example 3.8 & Problem 3.10'
  },
  {
    id: 'ch3-inc-flags-mc',
    chapter: 'ch3',
    chapterTitle: 'Chapter 3: The PSW and Status Flags',
    title: 'Flag Effects of INC and DEC',
    type: 'multiple_choice',
    prompt: 'Do the INC (increment) and DEC (decrement) instructions affect the CY, AC, or OV flags in the 8051?',
    options: [
      'No, INC and DEC do not affect CY, AC, or OV so loop counters do not disturb arithmetic flags.',
      'Yes, INC sets CY if an 8-bit register rolls over from FFH to 00H.',
      'Only the AC flag is affected during BCD counting.',
      'They affect CY and OV, but not AC.'
    ],
    correctOptionIndex: 0,
    explanation: 'INC and DEC instructions affect NO arithmetic flags (CY, AC, OV). This architectural choice allows programmers to maintain loop counters (e.g. INC R0, DJNZ R2) without corrupting carry/overflow flags from a previous multi-byte arithmetic step.',
    referenceSection: 'Section 3.5 Table 3.4 Flag effects'
  },

  // ==========================================
  // CHAPTER 4: INTERRUPTS
  // ==========================================
  {
    id: 'ch4-4.1-mc',
    chapter: 'ch4',
    chapterTitle: 'Chapter 4: Interrupts',
    title: 'Problem 4.1: Interrupt Vector ROM Addresses',
    type: 'multiple_choice',
    prompt: 'What are the correct ROM vector addresses for INT0, Timer 0, INT1, Timer 1, and the Serial Port in that order?',
    options: [
      '0003H, 000BH, 0013H, 001BH, 0023H',
      '0000H, 0003H, 000BH, 0013H, 001BH',
      '0003H, 0008H, 0013H, 0018H, 0020H',
      '000BH, 0003H, 001BH, 0013H, 0023H'
    ],
    correctOptionIndex: 0,
    explanation: 'The 8051 interrupt vectors are located at: RESET=0000H, External 0 (INT0)=0003H, Timer 0=000BH, External 1 (INT1)=0013H, Timer 1=001BH, Serial=0023H. Each is spaced exactly 8 bytes apart.',
    referenceSection: 'Section 4.4 Table 4.4 Interrupt vector table'
  },
  {
    id: 'ch4-4.2a-typed',
    chapter: 'ch4',
    chapterTitle: 'Chapter 4: Interrupts',
    title: 'Problem 4.2(a): Interrupt Enable (IE) Calculation',
    type: 'typed_answer',
    prompt: 'Give the hexadecimal byte value to write to IE (Interrupt Enable) to enable ONLY Timer 1 and the serial port (along with global enable EA):',
    correctAnswers: ['98H', '98h', '098H', '0x98', '98'],
    answerPlaceholder: 'e.g. 98H',
    answerUnit: 'Hex Byte',
    explanation: 'IE bits: EA(bit 7), -(bit 6), ET2(bit 5), ES(bit 4), ET1(bit 3), EX1(bit 2), ET0(bit 1), EX0(bit 0). To enable EA, ES, and ET1: 1 0 0 1 1 0 0 0 B = 98H.',
    detailedSteps: [
      'Bit 7 (EA) = 1 (Global interrupt enable)',
      'Bit 4 (ES) = 1 (Serial port enable)',
      'Bit 3 (ET1) = 1 (Timer 1 enable)',
      'All other bits = 0',
      'Binary: 1001 1000 B',
      'Upper nibble = 9, Lower nibble = 8 -> 98H.'
    ],
    referenceSection: 'Section 4.5.1 IE register & Problem 4.2(a)'
  },
  {
    id: 'ch4-4.2b-typed',
    chapter: 'ch4',
    chapterTitle: 'Chapter 4: Interrupts',
    title: 'Problem 4.2(b): IE Byte for INT0, INT1, and Timer 0',
    type: 'typed_answer',
    prompt: 'Give the hexadecimal byte value to write into IE to enable INT0, INT1, and Timer 0 (with EA set):',
    correctAnswers: ['87H', '87h', '087H', '0x87', '87'],
    answerPlaceholder: 'e.g. 87H',
    answerUnit: 'Hex Byte',
    explanation: 'Bits required: EA (bit 7) = 1, EX1 (bit 2) = 1, ET0 (bit 1) = 1, EX0 (bit 0) = 1. Binary: 1 0 0 0 0 1 1 1 B = 87H.',
    detailedSteps: [
      'EA = bit 7 = 1',
      'EX1 = bit 2 = 1',
      'ET0 = bit 1 = 1',
      'EX0 = bit 0 = 1',
      'Binary: 1000 0111 B = 87H.'
    ],
    referenceSection: 'Section 4.5.1 & Problem 4.2(b)'
  },
  {
    id: 'ch4-4.3-typed',
    chapter: 'ch4',
    chapterTitle: 'Chapter 4: Interrupts',
    title: 'Problem 4.3: Interrupt Priority (IP) Byte Calculation',
    type: 'typed_answer',
    prompt: 'Give the hexadecimal IP (Interrupt Priority) byte that assigns HIGH priority to INT1 and the serial port, with all other interrupts set to low priority:',
    correctAnswers: ['14H', '14h', '014H', '0x14', '14'],
    answerPlaceholder: 'e.g. 14H',
    answerUnit: 'Hex Byte',
    explanation: 'IP register bit format: - - PT2 PS PT1 PX1 PT0 PX0. We want PS (bit 4) = 1 and PX1 (bit 2) = 1. All others 0: 0 0 0 1 0 1 0 0 B = 14H.',
    detailedSteps: [
      'Bit 4: PS (Serial priority) = 1',
      'Bit 2: PX1 (External 1 priority) = 1',
      'Bits 7,6,5,3,1,0 = 0',
      'Binary: 0001 0100 B = 14H.'
    ],
    referenceSection: 'Section 4.5.3 IP register & Problem 4.3'
  },
  {
    id: 'ch4-4.4-mc',
    chapter: 'ch4',
    chapterTitle: 'Chapter 4: Interrupts',
    title: 'Problem 4.4: Default Priority Simultaneous Order',
    type: 'multiple_choice',
    prompt: 'Assuming default priorities (IP = 00H), if requests for Timer 1, INT0, Serial, and Timer 0 arrive at the exact same moment, in what order does the 8051 service them?',
    options: [
      'INT0, then Timer 0, then Timer 1, then Serial',
      'Timer 0, then Timer 1, then INT0, then Serial',
      'Serial, then Timer 1, then Timer 0, then INT0',
      'Timer 1, then INT0, then Serial, then Timer 0'
    ],
    correctOptionIndex: 0,
    explanation: 'When multiple interrupts of the same priority level arrive simultaneously, the 8051 uses a hardwired internal polling sequence: 1st INT0, 2nd Timer 0, 3rd INT1, 4th Timer 1, 5th Serial. Thus the sequence is INT0 -> Timer 0 -> Timer 1 -> Serial.',
    referenceSection: 'Section 4.6 Interrupt priorities (Rule 4)'
  },
  {
    id: 'ch4-4.5-mc',
    chapter: 'ch4',
    chapterTitle: 'Chapter 4: Interrupts',
    title: 'Problem 4.5: Nested ISR Preemption Sequence',
    type: 'multiple_choice',
    prompt: 'IP = 04H (PX1 = 1, so INT1 is high priority) and all interrupts are enabled. The low-priority Serial ISR is currently running when BOTH INT0 and INT1 request service. In what order do the three ISRs complete (finish execution)?',
    options: [
      'INT1 completes first, then Serial completes second, then INT0 completes third',
      'INT0 completes first, then INT1 completes second, then Serial completes third',
      'INT1 completes first, then INT0 completes second, then Serial completes third',
      'Serial completes first, then INT1 completes second, then INT0 completes third'
    ],
    correctOptionIndex: 0,
    explanation: 'INT1 has high priority, so it immediately preempts the running low-priority Serial ISR. INT0 has low priority (same as Serial), so it cannot preempt and must wait. Once INT1 executes RETI, Serial resumes and finishes. Only after Serial executes RETI can INT0 run and complete. Thus the completion order is INT1, Serial, INT0.',
    detailedSteps: [
      '1. Serial ISR is currently executing at low priority.',
      '2. INT1 (high priority) arrives and preempts Serial immediately.',
      '3. INT0 (low priority) arrives but is blocked because Serial was already running and INT1 is running.',
      '4. INT1 finishes and executes RETI -> 1st to complete is INT1.',
      '5. CPU resumes the preempted Serial ISR, which finishes and executes RETI -> 2nd to complete is Serial.',
      '6. Now INT0 is unblocked, executes, and finishes with RETI -> 3rd to complete is INT0.'
    ],
    referenceSection: 'Section 4.6 Example 4.2 & Problem 4.5'
  },
  {
    id: 'ch4-4.7-typed-th0',
    chapter: 'ch4',
    chapterTitle: 'Chapter 4: Interrupts',
    title: 'Problem 4.7: Timer 0 Preload Calculation (TH0)',
    type: 'typed_answer',
    prompt: 'For a 12 MHz crystal, you need a Timer 0 interrupt every 20 ms in Mode 1 (16-bit). What is the hexadecimal preload value for TH0?',
    correctAnswers: ['0B1H', 'B1H', 'B1h', '0B1h', '0xB1', 'B1'],
    answerPlaceholder: 'e.g. 0B1H',
    answerUnit: 'Hex Byte',
    explanation: 'At 12 MHz, 1 machine cycle = 1 µs. 20 ms = 20,000 counts. Mode 1 max = 65,536. Preload = 65,536 - 20,000 = 45,536. In hex: 45,536 = B1E0H. TH0 gets the high byte 0B1H.',
    detailedSteps: [
      'Crystal = 12 MHz -> Machine cycle frequency = 12 MHz / 12 = 1 MHz.',
      'Machine cycle period = 1 µs.',
      'For 20 ms delay: 20 ms / 1 µs = 20,000 counts.',
      'Timer Mode 1 is 16-bit (counts up to 65,536).',
      'Preload = 65,536 - 20,000 = 45,536.',
      'Convert 45,536 to hex: 45,536 / 4096 = 11 (B), remainder 480 (1E0) -> B1E0H.',
      'TH0 = 0B1H, TL0 = 0E0H.'
    ],
    referenceSection: 'Section 4.7 Example 4.4 & Problem 4.7'
  },
  {
    id: 'ch4-4.7-typed-tl0',
    chapter: 'ch4',
    chapterTitle: 'Chapter 4: Interrupts',
    title: 'Problem 4.7: Timer 0 Preload Calculation (TL0)',
    type: 'typed_answer',
    prompt: 'Following Problem 4.7 (20 ms interval at 12 MHz in Mode 1), what is the hexadecimal preload value for TL0?',
    correctAnswers: ['0E0H', 'E0H', 'E0h', '0E0h', '0xE0', 'E0'],
    answerPlaceholder: 'e.g. 0E0H',
    answerUnit: 'Hex Byte',
    explanation: 'The 16-bit preload is B1E0H. The low byte TL0 is 0E0H.',
    referenceSection: 'Section 4.7 Problem 4.7'
  },
  {
    id: 'ch4-4.8-mc',
    chapter: 'ch4',
    chapterTitle: 'Chapter 4: Interrupts',
    title: 'Problem 4.8: Purpose of LJMP MAIN at 0000H',
    type: 'multiple_choice',
    prompt: 'Why does virtually every 8051 assembly program begin with "ORG 0000H / LJMP MAIN"?',
    options: [
      'Because the INT0 interrupt vector is at 0003H (just 3 bytes after reset); without LJMP, main program code would overlap and be corrupted by the vector table.',
      'Because the reset vector must always jump to address 8000H in external RAM.',
      'To switch from 8-bit mode to 16-bit mode upon microcontroller startup.',
      'Because the CPU stack pointer cannot be initialized until an LJMP is executed.'
    ],
    correctOptionIndex: 0,
    explanation: 'The reset vector starts at 0000H, but the External Interrupt 0 vector is situated only 3 bytes away at 0003H. Since a normal program cannot fit in 3 bytes, the standard architecture practice is to place a 3-byte jump (LJMP MAIN) that skips past the entire Interrupt Vector Table (which ends at 002BH).',
    referenceSection: 'Section 4.4 Table 4.4 Note & Section 4.7'
  },
  {
    id: 'ch4-4.9-mc',
    chapter: 'ch4',
    chapterTitle: 'Chapter 4: Interrupts',
    title: 'Problem 4.9: Consequence of RET instead of RETI',
    type: 'multiple_choice',
    prompt: 'If an Interrupt Service Routine (ISR) terminates with RET instead of RETI, what fatal hardware defect occurs?',
    options: [
      'The interrupt priority-in-progress flip-flop is never cleared; the CPU assumes the ISR is still running and blocks all subsequent interrupts of equal or lower priority.',
      'The Program Counter is never popped from the stack, causing an immediate stack overflow.',
      'The accumulator is permanently locked in read-only mode.',
      'The crystal oscillator frequency drops to zero.'
    ],
    correctOptionIndex: 0,
    explanation: 'Both RET and RETI pop the return address off the stack. However, RETI uniquely signals the internal interrupt controller to clear the active priority latch. If RET is used, the microcontroller still treats the priority level as active, permanently blocking subsequent interrupts at or below that priority level (system hangs).',
    referenceSection: 'Section 4.6 Callout "Why RETI and not RET?"'
  },
  {
    id: 'ch4-4.12-mc',
    chapter: 'ch4',
    chapterTitle: 'Chapter 4: Interrupts',
    title: 'Problem 4.12: Hardware Stack Action on Interrupt',
    type: 'multiple_choice',
    prompt: 'Assume SP = 60H and an interrupt arrives when PC = 0245H. What are the contents of RAM locations 61H, 62H, and SP once the ISR begins?',
    options: [
      '61H = 45H (PCL), 62H = 02H (PCH), SP = 62H',
      '61H = 02H (PCH), 62H = 45H (PCL), SP = 62H',
      '60H = 45H (PCL), 61H = 02H (PCH), SP = 61H',
      '61H = 45H, 62H = 02H, SP = 60H'
    ],
    correctOptionIndex: 0,
    explanation: 'On the 8051, the hardware pushes the low byte of PC (PCL = 45H) first to SP+1 (61H), and then pushes the high byte of PC (PCH = 02H) to SP+2 (62H). SP is left at 62H.',
    detailedSteps: [
      'Initial SP = 60H.',
      'Step 1: SP becomes 61H, RAM[61H] receives PCL = 45H.',
      'Step 2: SP becomes 62H, RAM[62H] receives PCH = 02H.',
      'Final SP = 62H.'
    ],
    referenceSection: 'Section 4.2 Figure 4.1 & Example 4.1'
  },
  {
    id: 'ch4-4.13b-mc',
    chapter: 'ch4',
    chapterTitle: 'Chapter 4: Interrupts',
    title: 'Problem 4.13(b): Hardware Flag Protection Myth',
    type: 'multiple_choice',
    prompt: 'True or False: The 8051 hardware automatically saves (pushes) the Program Status Word (PSW) and Accumulator onto the stack when servicing an interrupt.',
    options: [
      'False — Only the Program Counter (PC) is pushed automatically; the programmer must explicitly save ACC and PSW with PUSH/POP.',
      'True — The 8051 pushes PC, PSW, and ACC automatically into internal RAM.',
      'True — Only the PSW is pushed, but ACC must be saved manually.',
      'False — Neither the PC nor the PSW are pushed; return addresses are stored in DPTR.'
    ],
    correctOptionIndex: 0,
    explanation: 'FALSE! As highlighted in the textbook correction note, the standard 8051 hardware pushes ONLY the 16-bit Program Counter (PCL and PCH). It does NOT save PSW or ACC. If your ISR modifies A or flags, you must save them explicitly using PUSH ACC and PUSH PSW, and restore them before RETI.',
    referenceSection: 'Front matter "Correction to lecture slides" & Section 4.7.1'
  },
  {
    id: 'ch4-serial-flags-mc',
    chapter: 'ch4',
    chapterTitle: 'Chapter 4: Interrupts',
    title: 'Hardware Feature: Clearing Serial RI and TI Flags',
    type: 'multiple_choice',
    prompt: 'How are the serial interrupt flags RI (Receive Interrupt) and TI (Transmit Interrupt) cleared in the 8051?',
    options: [
      'They must be cleared by software in the ISR (CLR RI, CLR TI); hardware does NOT clear them automatically.',
      'They are automatically cleared by hardware when the CPU branches to vector 0023H.',
      'They are cleared by the RETI instruction upon exit.',
      'They are cleared automatically whenever SBUF is written.'
    ],
    correctOptionIndex: 0,
    explanation: 'Both RI and TI trigger vector 0023H, and hardware does not clear either of them. The ISR code must inspect the flags to determine whether reception or transmission occurred, and clear them explicitly via software (CLR RI or CLR TI). Failing to do so causes an infinite interrupt loop.',
    referenceSection: 'Section 4.4 "The serial flags are special" Callout'
  }
];

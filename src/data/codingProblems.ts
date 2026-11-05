import type { CodeExercise } from '../types';

export const CODE_EXERCISES: CodeExercise[] = [
  {
    id: 'ex-2.4',
    chapter: 'ch2',
    title: 'Problem 2.4: Fill 20 RAM Locations with FFH',
    description:
      'Write a program using indirect addressing (@R0 or @R1) and DJNZ that initializes 20 internal RAM locations starting at address 50H with the value 0FFH.',
    initialCode: `; Exercise 2.4: Fill 20 RAM locations starting at 50H with FFH
; Use R0 as pointer and R7 as counter

          MOV R0, #50H       ; Pointer to start address
          MOV R7, #20        ; Counter = 20 decimal
          MOV A, #0FFH       ; Value to write
AGAIN:    ; Write instruction here
          ; Increment pointer
          ; Decrement counter and jump to AGAIN

          SJMP $             ; Stop here
          END`,
    solutionCode: `          MOV R0, #50H       ; Pointer to start address
          MOV R7, #20        ; Counter = 20 decimal
          MOV A, #0FFH       ; Value to write
AGAIN:    MOV @R0, A         ; Write byte to RAM
          INC R0             ; Advance pointer
          DJNZ R7, AGAIN     ; Loop 20 times
          SJMP $
          END`,
    hints: [
      'Use "MOV @R0, A" to store accumulator A into the address held in R0.',
      'Use "INC R0" to step through memory.',
      'Use "DJNZ R7, AGAIN" to repeat until R7 reaches zero.'
    ],
    explanation:
      'Direct addressing cannot loop because the address is static. Indirect addressing (@R0) lets the instruction access dynamic RAM addresses as R0 increments.',
    expectedBehavior: 'RAM locations 50H through 63H (20 bytes) all contain 0FFH.'
  },
  {
    id: 'ex-2.5',
    chapter: 'ch2',
    title: 'Problem 2.5: Block Copy 8 Bytes from 40H to 50H',
    description:
      'Write an assembly routine to copy a block of 8 bytes from source RAM address 40H to destination RAM address 50H using indirect pointers R0 and R1.',
    initialCode: `; Exercise 2.5: Copy 8 bytes from RAM 40H to 50H
          MOV R0, #40H       ; Source pointer
          MOV R1, #50H       ; Destination pointer
          MOV R3, #8         ; Loop counter

BACK:     ; Read one byte from source into A
          ; Write byte from A into destination
          ; Advance both pointers
          ; Loop with DJNZ R3

          SJMP $
          END`,
    solutionCode: `          MOV R0, #40H       ; Source pointer
          MOV R1, #50H       ; Destination pointer
          MOV R3, #8         ; Loop counter
BACK:     MOV A, @R0         ; Read from source
          MOV @R1, A         ; Write to destination
          INC R0             ; Increment source pointer
          INC R1             ; Increment destination pointer
          DJNZ R3, BACK      ; Repeat for 8 bytes
          SJMP $
          END`,
    hints: [
      'The 8051 does not support "MOV @R1, @R0" directly.',
      'Use Accumulator A: "MOV A, @R0" then "MOV @R1, A".',
      'Increment both R0 and R1 on each pass.'
    ],
    explanation:
      'Memory-to-memory indirect transfers require the accumulator as a transfer register. DJNZ counts down from 8 to 0.',
    expectedBehavior: 'Data at 40H-47H is duplicated into 50H-57H.'
  },
  {
    id: 'ex-2.9',
    chapter: 'ch2',
    title: 'Problem 2.9: 16-Bit Sum of Unsigned Bytes',
    description:
      'Add the three unsigned bytes 0C8H (200), 96H (150), and 0A4H (164). Store the 16-bit sum in R6 (high byte) and R7 (low byte). Detect carries with JNC.',
    initialCode: `; Exercise 2.9: 16-bit addition with carry tracking
; 200 + 150 + 164 = 514 = 0202H -> R6=02H, R7=02H

          MOV A, #0
          MOV R6, A          ; R6 = carry counter = 0
          ADD A, #0C8H       ; Add first byte
          JNC N1
          INC R6

N1:       ADD A, #96H        ; Add second byte
          JNC N2
          INC R6

N2:       ; Add third byte (0A4H)
          ; Jump if no carry to FIN
          ; Increment R6 if carry occurs

FIN:      ; Save low byte from A into R7
          SJMP $
          END`,
    solutionCode: `          MOV A, #0
          MOV R6, A          ; R6 = carry count = 0
          ADD A, #0C8H       ; A = C8H, CY = 0
          JNC N1
          INC R6
N1:       ADD A, #96H        ; C8H + 96H = 15EH -> A = 5EH, CY = 1
          JNC N2
          INC R6             ; R6 = 1
N2:       ADD A, #0A4H       ; 5EH + A4H = 102H -> A = 02H, CY = 1
          JNC FIN
          INC R6             ; R6 = 2
FIN:      MOV R7, A          ; R7 = 02H (sum = 0202H)
          SJMP $
          END`,
    hints: [
      'Hex numbers starting with letters (A-F) require a leading 0 in assembly: #0A4H.',
      'Check carry after each addition with "JNC".',
      'At FIN, copy the low byte into R7 with "MOV R7, A".'
    ],
    explanation:
      '200 + 150 + 164 = 514 decimal = 0202H. Since two carries occur across the additions, R6 accumulates to 02H and A finishes at 02H.',
    expectedBehavior: 'R6 = 02H (high byte) and R7 = 02H (low byte).'
  },
  {
    id: 'ex-2.11',
    chapter: 'ch2',
    title: 'Problem 2.11: Swap RAM 30H and 31H with One XCH',
    description:
      'Swap the contents of internal RAM locations 30H and 31H using ONLY the Accumulator A and a single XCH instruction.',
    initialCode: `; Exercise 2.11: Value swap
; Pre-load RAM 30H and 31H with sample values
          MOV 30H, #11H
          MOV 31H, #22H

          ; 1. Load A with contents of 30H
          ; 2. Execute ONE XCH instruction with 31H
          ; 3. Store A into 30H

          SJMP $
          END`,
    solutionCode: `          MOV 30H, #11H
          MOV 31H, #22H

          MOV A, 30H         ; A = first value
          XCH A, 31H         ; A = second value, 31H = first value
          MOV 30H, A         ; 30H = second value
          SJMP $
          END`,
    hints: [
      'Load the first value into A using direct addressing: "MOV A, 30H".',
      'The XCH instruction simultaneously swaps A with the direct RAM address: "XCH A, 31H".',
      'Store the resulting value back into 30H: "MOV 30H, A".'
    ],
    explanation:
      'XCH A, byte swaps the byte in A with the target byte in one cycle. Now A contains 31H\'s old value and 31H contains 30H\'s old value.',
    expectedBehavior: 'RAM 30H holds 22H and RAM 31H holds 11H.'
  },
  {
    id: 'ex-3.6',
    chapter: 'ch3',
    title: 'Problem 3.6: Register Bank 2 Switching',
    description:
      'Switch the active register bank to Bank 2 (RS1=1, RS0=0), write 55H into register R0, and then switch back to Bank 0 (RS1=0, RS0=0). Verify that RAM address 10H receives 55H.',
    initialCode: `; Exercise 3.6: Switching Register Banks with PSW bits
; Bank 2: RS1 (PSW.4) = 1, RS0 (PSW.3) = 0
; Bank 0: RS1 = 0, RS0 = 0

          ; 1. Set bit RS1 in PSW
          ; 2. Clear bit RS0 in PSW
          ; 3. Write 55H into R0 (writes to RAM 10H)
          ; 4. Clear bit RS1 to restore Bank 0

          SJMP $
          END`,
    solutionCode: `          SETB PSW.4         ; RS1 = 1
          CLR PSW.3          ; RS0 = 0 -> Bank 2 active
          MOV R0, #55H       ; Writes to RAM address 10H
          CLR PSW.4          ; RS1 = 0 -> Back to Bank 0
          SJMP $
          END`,
    hints: [
      'PSW is bit-addressable: PSW.4 is RS1 and PSW.3 is RS0.',
      'Bank 2 starts at address 10H (10H + 0 = 10H for R0).',
      'Clear PSW.4 at the end to return to default Bank 0.'
    ],
    explanation:
      'Switching register banks allows instantaneous context switching without pushing/popping R0-R7. Writing R0 while Bank 2 is active accesses internal RAM 10H.',
    expectedBehavior: 'RAM location 10H is set to 55H, and Bank 0 is restored.'
  },
  {
    id: 'ex-4.10',
    chapter: 'ch4',
    title: 'Problem 4.10: External Interrupt 0 Handler Program',
    description:
      'Write the complete 8051 interrupt program with vector table: on each falling edge of INT0 (P3.2), increment RAM location 30H and output the value to Port 2.',
    initialCode: `; Exercise 4.10: Complete Interrupt Program
          ORG 0000H
          ; 1. Jump over vector table to MAIN

          ORG 0003H
          ; 2. Jump to INT0 ISR

          ORG 0030H
MAIN:     MOV SP, #60H       ; Relocate stack
          MOV 30H, #0        ; Initialize counter
          MOV P2, #0         ; Clear Port 2
          ; 3. Configure INT0 for falling edge (IT0)
          ; 4. Enable INT0 (EX0)
          ; 5. Global enable (EA)
          SJMP $             ; Wait for interrupts

EX0_ISR:  ; 6. Increment RAM 30H
          ; 7. Copy RAM 30H to P2
          ; 8. Terminate ISR properly
          END`,
    solutionCode: `          ORG 0000H
          LJMP MAIN          ; Skip vector table
          ORG 0003H
          LJMP EX0_ISR       ; INT0 vector
          ORG 0030H
MAIN:     MOV SP, #60H       ; Relocate stack
          MOV 30H, #0        ; Counter = 0
          MOV P2, #0         ; Port 2 = 0
          SETB IT0           ; Falling-edge triggered
          SETB EX0           ; Enable INT0
          SETB EA            ; Global interrupt enable
          SJMP $             ; Wait for interrupts
EX0_ISR:  INC 30H            ; Count one press
          MOV P2, 30H        ; Display on Port 2
          RETI               ; Return from interrupt
          END`,
    hints: [
      'LJMP MAIN at 0000H is required to skip past the vector area.',
      'SETB IT0 selects falling-edge trigger; otherwise it defaults to low-level sensitive.',
      'Always conclude interrupt service routines with RETI, never RET.'
    ],
    explanation:
      'Hardware vectors INT0 to 0003H. INC 30H and MOV P2,30H do not modify accumulator A or arithmetic flags, so saving PSW/ACC is unnecessary here. RETI clears the hardware priority latch.',
    expectedBehavior: 'Correct vectors at 0000H & 0003H, proper initialization, and RETI in ISR.'
  },
  {
    id: 'ex-bug-hunt',
    chapter: 'ch2',
    title: 'Bug Hunter: Fix the Illegal Instructions',
    description:
      'Find and fix all 3 syntax errors in the following snippet: Rn-to-Rn move, PUSH syntax, and indirect pointer register.',
    initialCode: `; Bug Hunter: Identify and fix all 3 illegal instructions!
          MOV R0, #40H
          MOV R4, R7         ; ERROR 1: Rn to Rn illegal
          PUSH A             ; ERROR 2: PUSH operand illegal
          MOV A, @R3         ; ERROR 3: Pointer register illegal
          POP A
          END`,
    solutionCode: `; Corrected version
          MOV R0, #40H
          MOV A, R7          ; Fixed Rn to Rn via Accumulator
          MOV R4, A
          PUSH ACC           ; Fixed: PUSH requires direct address (ACC / 0E0H)
          MOV A, @R1         ; Fixed: Only R0 and R1 can be indirect pointers
          POP ACC            ; Fixed: POP ACC
          END`,
    hints: [
      'MOV R4, R7 must be split into MOV A, R7 then MOV R4, A.',
      'PUSH A must be PUSH ACC (or PUSH 0E0H).',
      'Only R0 and R1 can be used with @.'
    ],
    explanation:
      'The 8051 instruction set does not have opcodes for register-to-register moves, requires direct addresses for stack operations, and only includes pointer hardware for R0 and R1.',
    expectedBehavior: 'All 3 syntax violations resolved.'
  }
];

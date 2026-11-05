export type QuestionType = 'multiple_choice' | 'typed_answer';

export type ChapterId = 'ch1' | 'ch2' | 'ch3' | 'ch4' | 'all';

export interface Question {
  id: string;
  chapter: 'ch1' | 'ch2' | 'ch3' | 'ch4';
  chapterTitle: string;
  title: string;
  type: QuestionType;
  prompt: string;
  codeSnippet?: string;
  // For multiple choice
  options?: string[];
  correctOptionIndex?: number;
  // For typed answer
  correctAnswers?: string[]; // Allowed variations (e.g., ["15H", "15h", "015H", "0x15"])
  answerPlaceholder?: string;
  answerUnit?: string;
  // Explanation shown on wrong answer or when reviewed
  explanation: string;
  detailedSteps?: string[];
  referenceSection?: string;
}

export interface UserAnswerRecord {
  questionId: string;
  isCorrect: boolean;
  userAnswer: string;
  timestamp: number;
}

export interface CodeError {
  line: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  rule: string;
  suggestion?: string;
}

export interface CodeExercise {
  id: string;
  title: string;
  chapter: 'ch1' | 'ch2' | 'ch3' | 'ch4';
  description: string;
  initialCode: string;
  solutionCode: string;
  hints: string[];
  explanation: string;
  expectedBehavior: string;
  testParams?: {
    expectedA?: number;
    expectedR0?: number;
    expectedR5?: number;
    expectedR6?: number;
    expectedR7?: number;
    expectedRam?: { [addr: number]: number };
  };
}

export interface CPUState {
  A: number;
  B: number;
  R: number[]; // R0-R7 for current bank
  DPTR: number;
  SP: number;
  PC: number;
  PSW: {
    CY: number;
    AC: number;
    F0: number;
    RS1: number;
    RS0: number;
    OV: number;
    P: number;
  };
  ram: Uint8Array; // 128 bytes (00H - 7FH)
  ports: {
    P0: number;
    P1: number;
    P2: number;
    P3: number;
  };
  outputLog: string[];
}


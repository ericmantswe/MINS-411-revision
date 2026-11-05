import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Trophy,
  Flame,
  Target,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Question, ChapterId } from '../types';
import { QUESTIONS } from '../data/questions';
import { checkTypedAnswer } from '../utils/answerChecker';

export const PracticeEngine: React.FC = () => {
  const [selectedChapter, setSelectedChapter] = useState<ChapterId>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'review' | 'mastered' | 'bookmarked'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [typedInput, setTypedInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const [answerHistory, setAnswerHistory] = useState<Record<string, { isCorrect: boolean; tries: number }>>(() => {
    try {
      const saved = localStorage.getItem('8051_answer_history');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('8051_bookmarks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('8051_answer_history', JSON.stringify(answerHistory));
  }, [answerHistory]);

  useEffect(() => {
    localStorage.setItem('8051_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const filteredQuestions = QUESTIONS.filter((q) => {
    if (selectedChapter !== 'all' && q.chapter !== selectedChapter) return false;
    const history = answerHistory[q.id];
    if (filterMode === 'review') return history && !history.isCorrect;
    if (filterMode === 'mastered') return history && history.isCorrect;
    if (filterMode === 'bookmarked') return !!bookmarks[q.id];
    return true;
  });

  const currentQuestion: Question | undefined = filteredQuestions[currentIndex] || filteredQuestions[0];

  useEffect(() => {
    setSelectedOption(null);
    setTypedInput('');
    setIsSubmitted(false);
    setIsCorrect(null);
    setShowExplanation(false);
  }, [currentIndex, selectedChapter, filterMode]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentQuestion || isSubmitted) return;

    let correct = false;
    if (currentQuestion.type === 'multiple_choice') {
      if (selectedOption === null) return;
      correct = selectedOption === currentQuestion.correctOptionIndex;
    } else {
      if (!typedInput.trim()) return;
      correct = checkTypedAnswer(typedInput, currentQuestion.correctAnswers || []);
    }

    setIsCorrect(correct);
    setIsSubmitted(true);
    setShowExplanation(true);

    setAnswerHistory((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        isCorrect: correct,
        tries: (prev[currentQuestion.id]?.tries || 0) + 1,
      },
    }));

    if (correct) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#059669', '#34d399', '#f59e0b'],
        });
      } catch {
        // ignore
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRetry = () => {
    setSelectedOption(null);
    setTypedInput('');
    setIsSubmitted(false);
    setIsCorrect(null);
    setShowExplanation(false);
  };

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalQuestions = QUESTIONS.length;
  const answeredIds = Object.keys(answerHistory);
  const correctCount = answeredIds.filter((id) => answerHistory[id].isCorrect).length;
  const points = correctCount * 100;
  const accuracyPct = answeredIds.length > 0 ? Math.round((correctCount / answeredIds.length) * 100) : 0;
  const bookmarkedCount = Object.values(bookmarks).filter(Boolean).length;
  const reviewCount = answeredIds.filter((id) => !answerHistory[id].isCorrect).length;

  if (filteredQuestions.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 text-center space-y-4 card-shadow">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto text-emerald-500">
          <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-800">Nothing in this filter</h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          {filterMode === 'review'
            ? 'No questions currently in your review queue.'
            : filterMode === 'bookmarked'
            ? 'No bookmarks saved yet. Hit the bookmark icon on any question.'
            : 'Try selecting a different chapter or mode.'}
        </p>
        <button
          onClick={() => { setSelectedChapter('all'); setFilterMode('all'); }}
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
        >
          Show all questions
        </button>
      </div>
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* Stats strip — responsive grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Hero stat */}
        <div
          className="col-span-2 md:col-span-1 rounded-xl p-3 sm:p-4 text-white flex items-end justify-between shadow-xs"
          style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
        >
          <div>
            <div className="text-xl sm:text-2xl font-bold leading-none">{points.toLocaleString()}</div>
            <div className="text-emerald-100 text-[11px] sm:text-xs mt-1 font-medium">points earned</div>
          </div>
          <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-200 mb-0.5" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 card-shadow">
          <div className="text-[11px] sm:text-xs text-slate-400 font-medium mb-0.5">Accuracy</div>
          <div className="text-lg sm:text-xl font-bold text-slate-800">{accuracyPct}%</div>
          <div className="mt-1.5 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${accuracyPct}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 card-shadow">
          <div className="text-[11px] sm:text-xs text-slate-400 font-medium mb-0.5">Mastered</div>
          <div className="text-lg sm:text-xl font-bold text-emerald-600">
            {correctCount}
            <span className="text-xs font-medium text-slate-400 ml-1">/ {totalQuestions}</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
            <Target className="w-3 h-3 text-emerald-500" /> concepts
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 card-shadow">
          <div className="text-[11px] sm:text-xs text-slate-400 font-medium mb-0.5">Review queue</div>
          <div className="text-lg sm:text-xl font-bold text-rose-500">{reviewCount}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
            <Flame className="w-3 h-3 text-rose-400" /> to revisit
          </div>
        </div>
      </div>

      {/* Filters (touch scrollable on mobile) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:px-4 sm:py-3 card-shadow space-y-2.5 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">

          {/* Chapter chips — horizontal scroll with touch support */}
          <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1 sm:pb-0 -mx-1 px-1">
            {([
              { id: 'all' as const, label: 'All' },
              { id: 'ch1' as const, label: 'Ch 1: Refresher' },
              { id: 'ch2' as const, label: 'Ch 2: Assembly' },
              { id: 'ch3' as const, label: 'Ch 3: PSW' },
              { id: 'ch4' as const, label: 'Ch 4: Interrupts' },
            ] as { id: ChapterId; label: string }[]).map((ch) => (
              <button
                key={ch.id}
                onClick={() => { setSelectedChapter(ch.id); setCurrentIndex(0); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  selectedChapter === ch.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 overflow-x-auto no-scrollbar shrink-0">
            {([
              { mode: 'all' as const, label: 'All' },
              { mode: 'review' as const, label: `Missed (${reviewCount})` },
              { mode: 'mastered' as const, label: `Done (${correctCount})` },
              { mode: 'bookmarked' as const, label: `Saved (${bookmarkedCount})` },
            ]).map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => { setFilterMode(mode); setCurrentIndex(0); }}
                className={`px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  filterMode === mode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden card-shadow-md">

        {/* Card top bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            <span className="text-[11px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md truncate max-w-[140px] sm:max-w-none">
              {currentQuestion.chapterTitle}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium whitespace-nowrap">
              {currentQuestion.type === 'multiple_choice' ? 'MCQ' : 'Written'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => toggleBookmark(currentQuestion.id)}
              title="Save question"
              className={`p-2 rounded-lg border transition-all cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center ${
                bookmarks[currentQuestion.id]
                  ? 'bg-amber-50 text-amber-500 border-amber-200'
                  : 'text-slate-400 hover:text-slate-600 border-slate-200'
              }`}
            >
              {bookmarks[currentQuestion.id] ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
            <span className="text-xs text-slate-400 font-mono tabular-nums px-1.5">
              {currentIndex + 1}/{filteredQuestions.length}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Question title & prompt */}
          <div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 leading-snug">
              {currentQuestion.title}
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              {currentQuestion.prompt.split('\n').map((line, idx) => (
                <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* Code snippet */}
          {currentQuestion.codeSnippet && (
            <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-800">
                <span className="editor-dot bg-rose-400" />
                <span className="editor-dot bg-amber-400" />
                <span className="editor-dot bg-emerald-400" />
                <span className="text-slate-500 text-[11px] font-mono ml-2">snippet.asm</span>
              </div>
              <pre className="p-3 sm:p-4 text-[11px] sm:text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto">
                {currentQuestion.codeSnippet}
              </pre>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {currentQuestion.type === 'multiple_choice' ? (
              <div className="space-y-2 sm:space-y-2.5">
                {currentQuestion.options?.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isThisCorrect = idx === currentQuestion.correctOptionIndex;

                  let stateClass = 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 bg-white';

                  if (isSubmitted) {
                    if (isThisCorrect) {
                      stateClass = 'border-emerald-400 bg-emerald-50 text-emerald-900 font-semibold';
                    } else if (isSelected && !isThisCorrect) {
                      stateClass = 'border-rose-400 bg-rose-50 text-rose-900';
                    } else {
                      stateClass = 'border-slate-100 bg-slate-50 opacity-40 cursor-default';
                    }
                  } else if (isSelected) {
                    stateClass = 'border-emerald-500 bg-emerald-50/70 shadow-xs';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => setSelectedOption(idx)}
                      className={`option-btn w-full text-left rounded-xl border flex items-start gap-3 p-3 sm:p-4 cursor-pointer transition-all min-h-[48px] ${stateClass}`}
                    >
                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition-all ${
                          isSubmitted && isThisCorrect
                            ? 'bg-emerald-500 text-white'
                            : isSubmitted && isSelected && !isThisCorrect
                            ? 'bg-rose-500 text-white'
                            : isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {optionLetters[idx]}
                      </div>
                      <span className="text-xs sm:text-sm font-medium leading-relaxed flex-1 pt-0.5">
                        {option}
                      </span>
                      {isSubmitted && isThisCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                      {isSubmitted && isSelected && !isThisCorrect && (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                  Type your exact answer
                  {currentQuestion.answerUnit && (
                    <span className="text-slate-400 font-normal ml-1.5">({currentQuestion.answerUnit})</span>
                  )}
                </label>
                <input
                  type="text"
                  disabled={isSubmitted}
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  placeholder={currentQuestion.answerPlaceholder || 'e.g. 15H or 27H.2'}
                  className={`w-full font-mono text-base bg-white border rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                    isSubmitted
                      ? isCorrect
                        ? 'border-emerald-400 bg-emerald-50/40'
                        : 'border-rose-400 bg-rose-50/40'
                      : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'
                  }`}
                />
              </div>
            )}

            {/* Action Row — Mobile optimized (full width buttons on mobile) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {!isSubmitted ? (
                  <button
                    type="submit"
                    disabled={
                      currentQuestion.type === 'multiple_choice'
                        ? selectedOption === null
                        : !typedInput.trim()
                    }
                    className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    Check answer
                  </button>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {!isCorrect && (
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="flex-1 sm:flex-initial px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Try again
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 sm:flex-initial px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Prev / Next navigation */}
              <div className="flex items-center justify-between sm:justify-end gap-1.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIndex === filteredQuestions.length - 1}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          {/* Feedback & Answer Reveal */}
          {isSubmitted && (
            <div
              className={`rounded-xl border overflow-hidden transition-all ${
                isCorrect
                  ? 'border-emerald-200 bg-emerald-50/60'
                  : 'border-rose-200 bg-rose-50/60'
              }`}
            >
              {/* Status bar */}
              <div className={`flex items-center justify-between px-4 py-3 ${isCorrect ? 'bg-emerald-100/70' : 'bg-rose-100/70'}`}>
                <div className="flex items-center gap-2.5">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <span className={`font-bold text-xs sm:text-sm ${isCorrect ? 'text-emerald-900' : 'text-rose-900'}`}>
                      {isCorrect ? 'Correct — +100 pts 🎉' : 'Incorrect answer'}
                    </span>
                    {!isCorrect && (
                      <span className="text-[11px] text-rose-700 font-medium block">
                        Correct solution revealed below:
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer bg-white/70 px-2.5 py-1 rounded-md"
                >
                  <span>{showExplanation ? 'Hide' : 'Solution'}</span>
                  {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Correct answer text */}
              <div className="px-4 py-3 sm:px-5 sm:py-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500">Verified Answer</div>
                    <div className="font-mono font-bold text-sm sm:text-base text-emerald-800 break-all">
                      {currentQuestion.type === 'multiple_choice'
                        ? currentQuestion.options?.[currentQuestion.correctOptionIndex ?? 0]
                        : currentQuestion.correctAnswers?.[0]}
                    </div>
                  </div>
                </div>

                {/* Detailed explanation */}
                {showExplanation && (
                  <div className="border-t border-slate-200/80 pt-3 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      Explanation
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{currentQuestion.explanation}</p>

                    {currentQuestion.detailedSteps && currentQuestion.detailedSteps.length > 0 && (
                      <div className="rounded-lg bg-white border border-slate-200 p-3 sm:p-4 font-mono text-[11px] sm:text-xs space-y-1.5">
                        <span className="text-emerald-700 font-semibold text-[10px] sm:text-[11px] uppercase tracking-wide block">
                          Step-by-step working
                        </span>
                        {currentQuestion.detailedSteps.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2 text-slate-600">
                            <span className="text-emerald-500 font-bold select-none shrink-0">{sIdx + 1}.</span>
                            <span className="leading-relaxed">{step}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentQuestion.referenceSection && (
                      <div className="text-[10px] sm:text-[11px] text-slate-400 italic">
                        📖 {currentQuestion.referenceSection}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

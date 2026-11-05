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
          particleCount: 60,
          spread: 65,
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
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-4 card-shadow">
        <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto text-emerald-500">
          <BookOpen className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Nothing here yet</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          {filterMode === 'review'
            ? 'You have no questions in the review queue for this section — keep it up.'
            : filterMode === 'bookmarked'
            ? 'No bookmarks saved yet. Hit the bookmark icon on any question to save it for later.'
            : 'Try a different chapter filter.'}
        </p>
        <button
          onClick={() => { setSelectedChapter('all'); setFilterMode('all'); }}
          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer"
        >
          Show all questions
        </button>
      </div>
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="space-y-5">

      {/* Stats strip — natural asymmetric layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Hero stat */}
        <div
          className="col-span-2 md:col-span-1 rounded-xl p-4 text-white flex items-end justify-between"
          style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
        >
          <div>
            <div className="text-2xl font-bold leading-none">{points.toLocaleString()}</div>
            <div className="text-emerald-100 text-xs mt-1 font-medium">points earned</div>
          </div>
          <Trophy className="w-7 h-7 text-emerald-200 mb-0.5" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 card-shadow">
          <div className="text-xs text-slate-400 font-medium mb-1">Accuracy</div>
          <div className="text-xl font-bold text-slate-800">{accuracyPct}%</div>
          <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${accuracyPct}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 card-shadow">
          <div className="text-xs text-slate-400 font-medium mb-1">Mastered</div>
          <div className="text-xl font-bold text-emerald-600">
            {correctCount}
            <span className="text-sm font-medium text-slate-400 ml-1">/ {totalQuestions}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Target className="w-3 h-3" /> concepts
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 card-shadow">
          <div className="text-xs text-slate-400 font-medium mb-1">Review queue</div>
          <div className="text-xl font-bold text-rose-500">{reviewCount}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Flame className="w-3 h-3 text-rose-400" /> to revisit
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 card-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Chapter filters */}
          <div className="flex flex-wrap gap-2">
            {([
              { id: 'all' as const, label: 'All' },
              { id: 'ch1' as const, label: 'Ch 1 — Refresher' },
              { id: 'ch2' as const, label: 'Ch 2 — Assembly' },
              { id: 'ch3' as const, label: 'Ch 3 — PSW' },
              { id: 'ch4' as const, label: 'Ch 4 — Interrupts' },
            ] as { id: ChapterId; label: string }[]).map((ch) => (
              <button
                key={ch.id}
                onClick={() => { setSelectedChapter(ch.id); setCurrentIndex(0); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedChapter === ch.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>

          {/* View mode */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 self-start sm:self-auto">
            {([
              { mode: 'all' as const, label: 'All' },
              { mode: 'review' as const, label: `Missed (${reviewCount})` },
              { mode: 'mastered' as const, label: `Done (${correctCount})` },
              { mode: 'bookmarked' as const, label: `Saved (${bookmarkedCount})` },
            ]).map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => { setFilterMode(mode); setCurrentIndex(0); }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  filterMode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
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

        {/* Card top bar — chapter + progress */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              {currentQuestion.chapterTitle}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {currentQuestion.type === 'multiple_choice' ? 'Multiple choice' : 'Written answer'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleBookmark(currentQuestion.id)}
              title="Save for later"
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                bookmarks[currentQuestion.id]
                  ? 'bg-amber-50 text-amber-500 border-amber-200'
                  : 'text-slate-300 hover:text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {bookmarks[currentQuestion.id] ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {currentIndex + 1} / {filteredQuestions.length}
            </span>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Question title */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {currentQuestion.title}
            </h2>
            <div className="text-sm text-slate-600 mt-2 leading-relaxed">
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
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-800">
                <span className="editor-dot bg-rose-400" />
                <span className="editor-dot bg-amber-400" />
                <span className="editor-dot bg-emerald-400" />
                <span className="text-slate-500 text-xs font-mono ml-2">snippet.asm</span>
              </div>
              <pre className="px-4 py-4 text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto">
                {currentQuestion.codeSnippet}
              </pre>
            </div>
          )}

          {/* Input area */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {currentQuestion.type === 'multiple_choice' ? (
              <div className="space-y-2.5">
                {currentQuestion.options?.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isThisCorrect = idx === currentQuestion.correctOptionIndex;

                  let baseClass = 'option-btn w-full text-left rounded-xl border flex items-start gap-4 p-4 cursor-pointer transition-all';

                  let stateClass = 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 bg-white';

                  if (isSubmitted) {
                    if (isThisCorrect) {
                      stateClass = 'border-emerald-400 bg-emerald-50 text-emerald-900';
                    } else if (isSelected && !isThisCorrect) {
                      stateClass = 'border-rose-400 bg-rose-50 text-rose-900';
                    } else {
                      stateClass = 'border-slate-100 bg-slate-50 opacity-50 cursor-default';
                    }
                  } else if (isSelected) {
                    stateClass = 'border-emerald-500 bg-emerald-50/60 shadow-sm';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => setSelectedOption(idx)}
                      className={`${baseClass} ${stateClass}`}
                    >
                      {/* Letter badge */}
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition-all ${
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
                      <span className="text-sm font-medium leading-relaxed flex-1">{option}</span>
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
                <label className="block text-sm font-semibold text-slate-700">
                  Your answer
                  {currentQuestion.answerUnit && (
                    <span className="text-slate-400 font-normal ml-2">({currentQuestion.answerUnit})</span>
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

            {/* Action row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                {!isSubmitted ? (
                  <button
                    type="submit"
                    disabled={
                      currentQuestion.type === 'multiple_choice'
                        ? selectedOption === null
                        : !typedInput.trim()
                    }
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer"
                  >
                    Check answer
                  </button>
                ) : (
                  <>
                    {!isCorrect && (
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Try again
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      Next question
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Prev / Next navigation */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 text-slate-500 cursor-pointer transition-colors"
                  title="Previous question"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIndex === filteredQuestions.length - 1}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 text-slate-500 cursor-pointer transition-colors"
                  title="Next question"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          {/* Feedback & Answer Reveal */}
          {isSubmitted && (
            <div
              className={`rounded-xl border overflow-hidden ${
                isCorrect
                  ? 'border-emerald-200 bg-emerald-50/60'
                  : 'border-rose-200 bg-rose-50/60'
              }`}
            >
              {/* Status bar */}
              <div className={`flex items-center justify-between px-5 py-3.5 ${isCorrect ? 'bg-emerald-100/70' : 'bg-rose-100/70'}`}>
                <div className="flex items-center gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <span className={`font-bold text-sm ${isCorrect ? 'text-emerald-900' : 'text-rose-900'}`}>
                      {isCorrect ? 'Correct — +100 pts 🎉' : 'Not quite right'}
                    </span>
                    {!isCorrect && (
                      <span className="text-xs text-rose-700 font-medium block">
                        The verified answer is shown below.
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  {showExplanation ? 'Hide' : 'Full solution'}
                  {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Correct answer highlight */}
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-1">Correct answer</div>
                    <div className="font-mono font-bold text-base text-emerald-700">
                      {currentQuestion.type === 'multiple_choice'
                        ? currentQuestion.options?.[currentQuestion.correctOptionIndex ?? 0]
                        : currentQuestion.correctAnswers?.[0]}
                    </div>
                  </div>
                </div>

                {/* Detailed explanation (toggled) */}
                {showExplanation && (
                  <div className="border-t border-slate-200 pt-3 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                      Explanation
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{currentQuestion.explanation}</p>

                    {currentQuestion.detailedSteps && currentQuestion.detailedSteps.length > 0 && (
                      <div className="rounded-lg bg-white border border-slate-200 p-4 font-mono text-xs space-y-2">
                        <span className="text-emerald-700 font-semibold text-[11px] uppercase tracking-wide block">
                          Step-by-step working
                        </span>
                        {currentQuestion.detailedSteps.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2 text-slate-600">
                            <span className="text-emerald-400 font-bold select-none shrink-0">{sIdx + 1}.</span>
                            <span className="leading-relaxed">{step}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentQuestion.referenceSection && (
                      <div className="text-[11px] text-slate-400 italic">
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

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, ChevronRight, Flag, Save } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

/**
 * StudentTestExam - Student exam attempt interface
 * Features:
 * - Upcoming exams list
 * - Real-time exam attempt with timer
 * - Question navigation
 * - Save & Review functionality
 * - Auto-submit on timeout
 * - Results view
 */
const StudentTestExam = ({ studentId, onBack = () => {} }) => {
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, ongoing, completed
  const [exams, setExams] = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [examLoading, setExamLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = useRef(null);
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [visited, setVisited] = useState(new Set());
  const examStartTimeRef = useRef(null);

  useEffect(() => {
    if (studentId) {
      fetchExams();
    }
  }, [studentId, activeTab]);

  // Timer effect
  useEffect(() => {
    if (currentAttempt && remainingSeconds > 0) {
      timerRef.current = setTimeout(() => {
        setRemainingSeconds(remainingSeconds - 1);
      }, 1000);
    } else if (currentAttempt && remainingSeconds === 0 && currentAttempt.status === 'ONGOING') {
      // Auto-submit when time ends
      handleSubmitExam();
    }

    return () => clearTimeout(timerRef.current);
  }, [remainingSeconds, currentAttempt]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/exams/student`, {
        headers: { 'X-Student-Id': studentId }
      });

      if (!response.ok) throw new Error('Failed to fetch exams');

      const data = await response.json();
      const now = new Date();

      // Categorize exams
      const upcoming = data.filter(e => new Date(e.startTime) > now);
      const ongoing = data.filter(e => new Date(e.startTime) <= now && new Date(e.endTime) > now);
      const completed = data.filter(e => new Date(e.endTime) <= now);

      if (activeTab === 'upcoming') {
        setExams(upcoming.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)));
      } else if (activeTab === 'ongoing') {
        setExams(ongoing);
      } else {
        setExams(completed.sort((a, b) => new Date(b.endTime) - new Date(a.endTime)));
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (examId) => {
    try {
      setExamLoading(true);

      // Start attempt
      const attemptResponse = await fetch(`${API_BASE}/api/exams/${examId}/start`, {
        method: 'POST',
        headers: { 'X-Student-Id': studentId }
      });

      if (!attemptResponse.ok) throw new Error('Failed to start exam');

      const attempt = await attemptResponse.json();

      // Fetch exam details to get questions
      const examResponse = await fetch(`${API_BASE}/api/exams/${examId}`, {
        headers: { 'X-Student-Id': studentId }
      });

      if (!examResponse.ok) throw new Error('Failed to fetch exam');

      const exam = await examResponse.json();

      // Fetch questions
      const questionsResponse = await fetch(`${API_BASE}/api/exams/${examId}/questions`, {
        headers: { 'X-Student-Id': studentId }
      });

      const questionsData = questionsResponse.ok ? await questionsResponse.json() : [];

      setCurrentAttempt(attempt);
      setQuestions(questionsData);
      setCurrentQuestionIndex(0);
      setRemainingSeconds(exam.durationMinutes * 60);
      examStartTimeRef.current = new Date();
      setVisited(new Set([0]));
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('Failed to start exam. Please try again.');
    } finally {
      setExamLoading(false);
    }
  };

  const handleSaveAnswer = async (questionId, answer, markForReview = false) => {
    try {
      // Update local state immediately (optimistic)
      const newMarked = new Set(markedForReview);
      if (markForReview) {
        newMarked.add(questionId);
      } else {
        newMarked.delete(questionId);
      }
      setMarkedForReview(newMarked);

      // Save to backend
      await fetch(`${API_BASE}/api/exams/${currentAttempt.id}/save-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Student-Id': studentId
        },
        body: JSON.stringify({ questionId, answer })
      });

      setCurrentAttempt(prev => ({
        ...prev,
        studentAnswers: { ...prev.studentAnswers, [questionId]: answer }
      }));
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleSubmitExam = async () => {
    if (!window.confirm('Are you sure you want to submit? You cannot change answers after submission.')) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_BASE}/api/exams/${currentAttempt.id}/submit`, {
        method: 'POST',
        headers: { 'X-Student-Id': studentId }
      });

      if (!response.ok) throw new Error('Failed to submit exam');

      const result = await response.json();
      setCurrentAttempt(result);
      alert(`Exam submitted! Your score: ${result.totalScore}/${result.totalMarks}`);
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Failed to submit exam. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setVisited(new Set([...visited, currentQuestionIndex + 1]));
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Exam In Progress View
  if (currentAttempt && currentAttempt.status === 'ONGOING') {
    const currentQuestion = questions[currentQuestionIndex];
    const studentAnswer = currentAttempt.studentAnswers?.[currentQuestion?.id] || '';
    const isMarked = markedForReview.has(currentQuestion?.id);

    return (
      <div className="flex h-screen bg-slate-100">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
            <div>
              <h1 className="text-2xl font-black text-slate-900">{currentAttempt.examTitle}</h1>
              <p className="text-sm text-slate-600">{currentAttempt.subject}</p>
            </div>

            {/* Timer */}
            <div className={`text-center p-4 rounded-lg ${remainingSeconds < 300 ? 'bg-red-100' : 'bg-blue-100'}`}>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Clock className="h-4 w-4" />
                {formatTime(remainingSeconds)}
              </div>
              <p className="text-xs text-slate-600 mt-1">Time Remaining</p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitExam}
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </button>
          </header>

          {/* Main Question Area */}
          <div className="flex-1 overflow-auto p-8">
            {currentQuestion ? (
              <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
                {/* Question Number */}
                <div className="mb-6 pb-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </h2>
                    <span className="text-sm font-semibold text-slate-600">
                      Marks: {currentQuestion.marks}
                    </span>
                  </div>
                </div>

                {/* Question */}
                <div className="mb-8">
                  <p className="text-lg text-slate-900 mb-6 leading-relaxed">
                    {currentQuestion.questionText}
                  </p>

                  {/* MCQ Options */}
                  {currentQuestion.questionType === 'MCQ' && (
                    <div className="space-y-3">
                      {currentQuestion.options?.map((option, idx) => {
                        const optionLabel = String.fromCharCode(65 + idx); // A, B, C, D
                        const isSelected = studentAnswer === optionLabel;

                        return (
                          <label
                            key={idx}
                            className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition hover:bg-slate-50"
                            style={{
                              borderColor: isSelected ? '#3b82f6' : '#e2e8f0',
                              backgroundColor: isSelected ? '#eff6ff' : '#ffffff'
                            }}
                          >
                            <input
                              type="radio"
                              name={`question-${currentQuestion.id}`}
                              value={optionLabel}
                              checked={isSelected}
                              onChange={() => handleSaveAnswer(currentQuestion.id, optionLabel)}
                              className="w-5 h-5 text-blue-600"
                            />
                            <span className="ml-4 text-slate-900">
                              <strong>{optionLabel}.</strong> {option}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Descriptive Question */}
                  {currentQuestion.questionType === 'DESCRIPTIVE' && (
                    <textarea
                      value={studentAnswer}
                      onChange={(e) => handleSaveAnswer(currentQuestion.id, e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                      rows={8}
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t border-slate-200">
                  <button
                    onClick={() => handleSaveAnswer(currentQuestion.id, studentAnswer, !isMarked)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                      isMarked
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Flag className="h-4 w-4" />
                    {isMarked ? 'Marked for Review' : 'Mark for Review'}
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No questions found</p>
              </div>
            )}
          </div>
        </div>

        {/* Question Navigation Panel */}
        <div className="w-64 bg-white border-l border-slate-200 overflow-y-auto">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Questions</h3>
            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = currentAttempt.studentAnswers?.[q.id];
                const isCurrent = idx === currentQuestionIndex;
                const isReviewed = markedForReview.has(q.id);
                const isVisited = visited.has(idx);

                let bgColor = 'bg-slate-200 text-slate-700';
                if (isAnswered && isReviewed) bgColor = 'bg-orange-500 text-white';
                else if (isAnswered) bgColor = 'bg-green-500 text-white';
                else if (isReviewed) bgColor = 'bg-orange-300 text-white';
                else if (isCurrent) bgColor = 'bg-blue-600 text-white';
                else if (isVisited) bgColor = 'bg-slate-300 text-slate-900';

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-full py-2 rounded text-sm font-semibold transition ${bgColor}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="p-4 space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span className="text-slate-600">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-200 rounded" />
              <span className="text-slate-600">Not Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded" />
              <span className="text-slate-600">Marked for Review</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results/Completed Exam View
  if (currentAttempt && currentAttempt.status === 'SUBMITTED') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <button
            onClick={() => {
              setCurrentAttempt(null);
              setQuestions([]);
              fetchExams();
            }}
            className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Exams
          </button>

          {/* Result Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Score Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4" />
              <h1 className="text-3xl font-black mb-2">{currentAttempt.examTitle}</h1>
              <p className="text-blue-100 mb-8">{currentAttempt.subject}</p>

              <div className="grid grid-cols-3 gap-8">
                <div>
                  <p className="text-blue-100 text-sm uppercase tracking-wider mb-2">Score</p>
                  <p className="text-5xl font-black">{currentAttempt.totalScore.toFixed(1)}</p>
                  <p className="text-blue-100 text-sm mt-1">/ {currentAttempt.totalMarks}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm uppercase tracking-wider mb-2">Percentage</p>
                  <p className="text-5xl font-black">{currentAttempt.percentage?.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm uppercase tracking-wider mb-2">Grade</p>
                  <p className="text-5xl font-black">{currentAttempt.grade || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="p-8">
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-slate-600 text-sm uppercase tracking-wider mb-2">Time Spent</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {Math.floor(currentAttempt.timeSpentSeconds / 60)} min
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm uppercase tracking-wider mb-2">Status</p>
                  <p className="text-2xl font-bold text-green-600">Submitted</p>
                </div>
              </div>

              {currentAttempt.status === 'SUBMITTED' && !currentAttempt.allAnswersEvaluated && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
                  <p className="text-orange-900 text-sm">
                    ⏳ Your exam is under review by faculty. Marks for descriptive answers will be updated shortly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Exams List View
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Academics
          </button>
          <h1 className="text-3xl font-black text-slate-900">Tests & Exams</h1>
          <p className="mt-1 text-slate-600">Take exams, view results, and track your performance</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white mx-auto max-w-7xl">
        <div className="flex px-6">
          {[
            { id: 'upcoming', label: '📅 Upcoming' },
            { id: 'ongoing', label: '⏳ Ongoing' },
            { id: 'completed', label: '✅ Completed' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-semibold border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading exams...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg mb-2">No {activeTab} exams</p>
            <p className="text-slate-500 text-sm">Check back soon for new exams</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {exams.map(exam => (
              <div
                key={exam.id}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{exam.title}</h3>
                    <p className="text-slate-600">{exam.subject}</p>
                  </div>
                  <span className="text-sm font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                    {exam.status}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6 py-4 border-y border-slate-200">
                  <div>
                    <p className="text-xs text-slate-600 uppercase">Duration</p>
                    <p className="font-semibold text-slate-900">{exam.durationMinutes} min</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 uppercase">Marks</p>
                    <p className="font-semibold text-slate-900">{exam.totalMarks}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 uppercase">Questions</p>
                    <p className="font-semibold text-slate-900">{exam.questionCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 uppercase">Date & Time</p>
                    <p className="font-semibold text-slate-900">
                      {new Date(exam.startTime).toLocaleDateString()} {new Date(exam.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>

                {exam.instructions && (
                  <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-700"><strong>Instructions:</strong> {exam.instructions}</p>
                  </div>
                )}

                {activeTab === 'upcoming' || activeTab === 'ongoing' ? (() => {
                  const examStart = new Date(exam.startTime);
                  const examEnd = new Date(exam.endTime);
                  const now = new Date();
                  const hasStarted = now >= examStart;
                  const hasEnded = now >= examEnd;
                  const canStart = hasStarted && !hasEnded;

                  return hasEnded ? (
                    <div className="w-full bg-slate-100 text-slate-500 py-3 rounded-lg font-semibold text-center">
                      Exam time has ended
                    </div>
                  ) : canStart ? (
                    <button
                      onClick={() => handleStartExam(exam.id)}
                      disabled={examLoading}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {examLoading ? 'Starting...' : 'Start Exam'}
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  ) : (
                    <div className="w-full bg-blue-50 border border-blue-200 text-blue-700 py-3 rounded-lg font-semibold text-center">
                      <Clock className="h-4 w-4 inline mr-2" />
                      Starts on {examStart.toLocaleDateString()} at {examStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  );
                })() : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-900 font-semibold">Exam Completed</p>
                    {exam.resultsPublished && (
                      <p className="text-green-700 text-sm mt-1">Results are available in your Grades</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentTestExam;

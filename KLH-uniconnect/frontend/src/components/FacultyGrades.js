import React, { useState } from 'react';
import {
  Plus,
  Download,
  Eye,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

const FacultyGrades = ({ selectedSubject, setSelectedSubject, searchTerm }) => {
  const [gradingStructure, setGradingStructure] = useState({
    assignments: 25,
    midExams: 25,
    internals: 20,
    endExams: 30
  });

  const [gradeEntries, setGradeEntries] = useState([
    {
      id: 1,
      studentName: 'Aman Kumar',
      studentId: 'AMK001',
      subject: 'Web Development',
      assignments: 22,
      midExams: 23,
      internals: 18,
      endExams: 28,
      totalMarks: 91,
      percentage: 75.8,
      grade: 'A',
      remarks: 'Excellent performance',
      published: true
    },
    {
      id: 2,
      studentName: 'Priya Singh',
      studentId: 'PRI002',
      subject: 'Web Development',
      assignments: 20,
      midExams: 21,
      internals: 19,
      endExams: 25,
      totalMarks: 85,
      percentage: 70.8,
      grade: 'B',
      remarks: 'Good work',
      published: true
    },
    {
      id: 3,
      studentName: 'Rajesh Patel',
      studentId: 'RAJ003',
      subject: 'Data Science',
      assignments: 18,
      midExams: 19,
      internals: 15,
      endExams: 22,
      totalMarks: 74,
      percentage: 61.7,
      grade: 'C',
      remarks: 'Improvement suggested',
      published: false
    }
  ]);

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedForPublish, setSelectedForPublish] = useState(null);

  const calculateTotal = (entry) => {
    return (
      (entry.assignments || 0) +
      (entry.midExams || 0) +
      (entry.internals || 0) +
      (entry.endExams || 0)
    );
  };

  const calculatePercentage = (total) => {
    return ((total / 120) * 100).toFixed(1);
  };

  const getGrade = (percentage) => {
    if (percentage >= 85) return 'A';
    if (percentage >= 75) return 'B';
    if (percentage >= 65) return 'C';
    if (percentage >= 55) return 'D';
    return 'F';
  };

  const handlePublishGrades = (subject) => {
    setGradeEntries(gradeEntries.map(entry =>
      entry.subject === subject ? { ...entry, published: true } : entry
    ));
    setShowPublishModal(false);
  };

  const filteredGrades = gradeEntries
    .filter(g => selectedSubject === 'all' || g.subject === selectedSubject)
    .filter(g => g.studentName.toLowerCase().includes(searchTerm.toLowerCase()));

  const subjectsWithGrades = [...new Set(gradeEntries.map(g => g.subject))];

  const getSubjectStats = (subject) => {
    const subjectGrades = gradeEntries.filter(g => g.subject === subject);
    const avgPercentage = (subjectGrades.reduce((sum, g) => sum + parseFloat(g.percentage), 0) / subjectGrades.length).toFixed(1);
    const topPerformers = subjectGrades.filter(g => g.grade === 'A').length;
    const weakStudents = subjectGrades.filter(g => g.grade === 'C' || g.grade === 'D' || g.grade === 'F').length;
    
    return { avgPercentage, topPerformers, weakStudents, total: subjectGrades.length };
  };

  return (
    <div className="space-y-6">
      {/* Grading Structure */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-bold text-slate-900">Evaluation Structure (Max 120 Marks)</h3>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase">Assignments</p>
            <p className="mt-2 text-2xl font-black text-blue-600">{gradingStructure.assignments}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase">Mid Exams</p>
            <p className="mt-2 text-2xl font-black text-purple-600">{gradingStructure.midExams}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase">Internals</p>
            <p className="mt-2 text-2xl font-black text-green-600">{gradingStructure.internals}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase">End Exams</p>
            <p className="mt-2 text-2xl font-black text-orange-600">{gradingStructure.endExams}</p>
          </div>
        </div>
      </div>

      {/* Subject Performance Overview */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-bold text-slate-900">Subject Performance Overview</h3>
        <div className="space-y-3">
          {subjectsWithGrades.map(subject => {
            const stats = getSubjectStats(subject);
            return (
              <div key={subject} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="font-bold text-slate-900">{subject}</p>
                  <p className="text-xs text-slate-600">{stats.total} students</p>
                </div>
                <div className="flex gap-6 text-right">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Avg Performance</p>
                    <p className="text-lg font-black text-blue-600">{stats.avgPercentage}%</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Top (A Grade)</p>
                    <p className="text-lg font-black text-green-600">{stats.topPerformers}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Needs Improvement</p>
                    <p className="text-lg font-black text-red-600">{stats.weakStudents}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedForPublish(subject);
                      setShowPublishModal(true);
                    }}
                    className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-bold text-blue-600 transition hover:bg-blue-200"
                  >
                    Publish
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grade Entries */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Grade Entries</h3>
          <button className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
            <Download className="h-4 w-4" />
            Bulk Upload (Excel)
          </button>
        </div>

        {filteredGrades.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-900">Student</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-900">Assignments</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-900">Mid</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-900">Internals</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-900">End</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-900">Total</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-900">%</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-900">Grade</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-900">Remarks</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((entry, index) => (
                  <tr key={entry.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="border-t border-slate-200 px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-900">{entry.studentName}</p>
                        <p className="text-xs text-slate-600">{entry.studentId}</p>
                      </div>
                    </td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center font-bold text-blue-600">
                      {entry.assignments}/25
                    </td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center font-bold text-purple-600">
                      {entry.midExams}/25
                    </td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center font-bold text-green-600">
                      {entry.internals}/20
                    </td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center font-bold text-orange-600">
                      {entry.endExams}/30
                    </td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center font-bold text-slate-900">
                      {entry.totalMarks}/120
                    </td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center font-bold text-slate-900">
                      {entry.percentage}%
                    </td>
                    <td className={`border-t border-slate-200 px-4 py-3 text-center font-black text-lg ${
                      entry.grade === 'A' ? 'text-green-600' : entry.grade === 'B' ? 'text-blue-600' : 'text-orange-600'
                    }`}>
                      {entry.grade}
                    </td>
                    <td className="border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
                      {entry.remarks}
                    </td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center">
                      {entry.published ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-700">
                          <Loader className="h-3 w-3" />
                          Draft
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-slate-600">No grades found. Start entering grades to get started!</p>
          </div>
        )}
      </div>

      {/* Publish Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900">Publish Grades?</h3>
            <p className="mt-2 text-slate-600">
              Grades for <strong>{selectedForPublish}</strong> will be visible to students. This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handlePublishGrades(selectedForPublish)}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700"
              >
                Publish
              </button>
              <button
                onClick={() => setShowPublishModal(false)}
                className="flex-1 rounded-lg bg-slate-200 px-4 py-2 font-semibold text-slate-900 transition hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyGrades;

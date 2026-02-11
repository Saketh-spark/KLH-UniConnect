import React, { useState } from 'react';
import {
  BarChart3, TrendingUp, Target, Award, AlertTriangle, CheckCircle, ArrowUp, ArrowDown,
  Briefcase, DollarSign, Brain, ChevronRight, Star, Zap, PieChart, Code
} from 'lucide-react';

const StudentAnalyticsTab = ({ studentId, email }) => {

  const readinessScore = 72;
  const readinessBreakdown = [
    { label: 'Academic Performance', score: 85, weight: 25 },
    { label: 'Technical Skills', score: 68, weight: 25 },
    { label: 'Aptitude Preparation', score: 70, weight: 20 },
    { label: 'Projects & Experience', score: 75, weight: 15 },
    { label: 'Interview Readiness', score: 55, weight: 15 },
  ];

  const skillsAnalysis = {
    strong: ['Java', 'SQL', 'Data Structures', 'Spring Boot', 'Git'],
    moderate: ['Python', 'React', 'System Design'],
    weak: ['Machine Learning', 'Cloud Computing', 'DevOps'],
    inDemand: ['AWS', 'Docker', 'Kubernetes', 'TypeScript', 'AI/ML'],
  };

  const applicationStats = {
    totalApplied: 18,
    shortlisted: 8,
    interviewed: 5,
    selected: 2,
    rejected: 6,
    pending: 2,
  };

  const salaryPrediction = {
    predicted: '6.5 LPA',
    range: '5.5 – 8.0 LPA',
    basedOn: ['CGPA: 8.2', 'Skills: 12 matched', 'Projects: 4 relevant', 'Internships: 1'],
    percentile: 65,
  };

  const improvements = [
    { title: 'Learn AWS Fundamentals', impact: 'High', reason: '70% of current job listings require cloud skills', type: 'skill' },
    { title: 'Complete 20 more DP problems', impact: 'High', reason: 'Dynamic programming is tested in 80% of coding rounds', type: 'coding' },
    { title: 'Practice Group Discussions', impact: 'Medium', reason: 'Several upcoming drives include GD rounds', type: 'soft' },
    { title: 'Add 1 more project (Full-Stack)', impact: 'Medium', reason: 'Strengthens your resume for product companies', type: 'project' },
    { title: 'Improve verbal communication', impact: 'Medium', reason: 'HR rounds account for final selection in 40% of companies', type: 'soft' },
  ];

  const getScoreColor = (score) => score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-600';
  const getBarColor = (score) => score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="space-y-6">

      {/* Readiness Score */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Placement Readiness Score</h3>
            <p className="text-sm opacity-80 mt-1">Based on academics, skills, preparation, and experience</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black">{readinessScore}</div>
            <div className="text-xs opacity-70">/100</div>
          </div>
        </div>
        <div className="mt-4 h-3 rounded-full bg-white/20 overflow-hidden">
          <div className="h-full rounded-full bg-white transition-all" style={{ width: `${readinessScore}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
          {readinessBreakdown.map((item, i) => (
            <div key={i} className="rounded-lg bg-white/10 p-2 text-center">
              <div className="text-lg font-bold">{item.score}%</div>
              <div className="text-[10px] opacity-70">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Application Funnel */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-sky-600" /> Applications vs Selections Funnel
        </h3>
        <div className="flex items-end justify-between gap-2 h-40">
          {[
            { label: 'Applied', value: applicationStats.totalApplied, color: 'bg-slate-400' },
            { label: 'Shortlisted', value: applicationStats.shortlisted, color: 'bg-blue-400' },
            { label: 'Interviewed', value: applicationStats.interviewed, color: 'bg-amber-400' },
            { label: 'Selected', value: applicationStats.selected, color: 'bg-green-500' },
            { label: 'Rejected', value: applicationStats.rejected, color: 'bg-red-400' },
          ].map((bar, i) => {
            const maxVal = applicationStats.totalApplied;
            const height = maxVal > 0 ? Math.max((bar.value / maxVal) * 100, 8) : 8;
            return (
              <div key={i} className="flex flex-col items-center flex-1 gap-1">
                <span className="text-xs font-bold text-slate-700">{bar.value}</span>
                <div className={`w-full rounded-t-lg ${bar.color} transition-all`} style={{ height: `${height}%` }} />
                <span className="text-[10px] text-slate-500 text-center">{bar.label}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
          <span>Selection Rate: <strong className="text-green-600">{applicationStats.totalApplied > 0 ? Math.round((applicationStats.selected / applicationStats.totalApplied) * 100) : 0}%</strong></span>
          <span>Shortlist Rate: <strong className="text-blue-600">{applicationStats.totalApplied > 0 ? Math.round((applicationStats.shortlisted / applicationStats.totalApplied) * 100) : 0}%</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills Gap Analysis */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Brain size={16} className="text-purple-600" /> Skills Gap Analysis
          </h3>
          <div className="space-y-3">
            <div>
              <div className="text-xs font-medium text-green-600 mb-1">Strong Skills</div>
              <div className="flex flex-wrap gap-1">
                {skillsAnalysis.strong.map((s, i) => (
                  <span key={i} className="rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-[10px] font-medium">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-amber-600 mb-1">Moderate Skills</div>
              <div className="flex flex-wrap gap-1">
                {skillsAnalysis.moderate.map((s, i) => (
                  <span key={i} className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-[10px] font-medium">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-red-600 mb-1">Needs Improvement</div>
              <div className="flex flex-wrap gap-1">
                {skillsAnalysis.weak.map((s, i) => (
                  <span key={i} className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-medium">{s}</span>
                ))}
              </div>
            </div>
            <div className="border-t border-slate-100 pt-2">
              <div className="text-xs font-medium text-sky-600 mb-1">In-Demand Skills (You're Missing)</div>
              <div className="flex flex-wrap gap-1">
                {skillsAnalysis.inDemand.map((s, i) => (
                  <span key={i} className="rounded-full bg-sky-100 text-sky-700 px-2 py-0.5 text-[10px] font-medium flex items-center gap-1">
                    <Zap size={8} />{s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Salary Prediction */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-green-600" /> Expected Salary Prediction
          </h3>
          <div className="text-center p-4 rounded-xl bg-green-50 border border-green-200 mb-4">
            <div className="text-3xl font-black text-green-700">{salaryPrediction.predicted}</div>
            <div className="text-sm text-green-600">Range: {salaryPrediction.range}</div>
            <div className="text-xs text-slate-500 mt-1">You're in the top {100 - salaryPrediction.percentile}% of your batch</div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-600">Based On:</div>
            {salaryPrediction.basedOn.map((factor, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle size={12} className="text-green-500" /> {factor}
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            <strong>💡 To increase your package:</strong> Learn AWS (+0.5 LPA avg boost), add 1 more internship (+1 LPA avg boost)
          </div>
        </div>
      </div>

      {/* Improvement Suggestions */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Target size={16} className="text-amber-600" /> Improvement Suggestions
        </h3>
        <div className="space-y-3">
          {improvements.map((item, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
              <div className={`mt-0.5 rounded-full p-1.5 ${
                item.type === 'skill' ? 'bg-blue-100 text-blue-600' :
                item.type === 'coding' ? 'bg-green-100 text-green-600' :
                item.type === 'project' ? 'bg-purple-100 text-purple-600' :
                'bg-amber-100 text-amber-600'
              }`}>
                {item.type === 'skill' ? <Zap size={14} /> :
                 item.type === 'coding' ? <Code size={14} /> :
                 item.type === 'project' ? <Briefcase size={14} /> :
                 <Star size={14} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-800">{item.title}</h4>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    item.impact === 'High' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                  }`}>{item.impact} Impact</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{item.reason}</p>
              </div>
              <button className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1 whitespace-nowrap">
                Act <ChevronRight size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentAnalyticsTab;

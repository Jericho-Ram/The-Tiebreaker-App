import React from "react";
import { Award, Zap, CheckCircle2, ArrowRight, ShieldCheck, Milestone } from "lucide-react";
import { Verdict } from "../types";

interface VerdictPanelProps {
  verdict: Verdict;
  calculatedRecommendation?: string; // If custom weights alter the recommendation
}

export default function VerdictPanel({
  verdict,
  calculatedRecommendation,
}: VerdictPanelProps) {
  const isCustomAltered = calculatedRecommendation && calculatedRecommendation !== verdict.recommendedOption;
  const recommendedName = isCustomAltered ? calculatedRecommendation : verdict.recommendedOption;

  // Confidence Dial math (SVG circle stroke-dashoffset)
  const confidence = verdict.confidenceScore;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <div className="space-y-6" id="verdict-panel">
      {/* Prime Announcement Card */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl shadow-xl p-6 sm:p-8 relative overflow-hidden" id="verdict-banner-card">
        {/* Abstract design elements */}
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -z-10" />
        <div className="absolute left-1/3 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -z-10" />

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8" id="verdict-banner-flex">
          {/* Main text area */}
          <div className="space-y-4 flex-1">
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1 px-3 py-1 bg-indigo-500/20 text-indigo-300 font-bold text-xs tracking-wider uppercase rounded-full">
                <Award className="h-3.5 w-3.5 text-indigo-400" />
                <span>The Verdict</span>
              </span>
              {isCustomAltered && (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 font-bold text-xs tracking-wider uppercase rounded-full">
                  Recalculated by Priorities
                </span>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">Recommended Choice</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight" id="verdict-winner-name">
                {recommendedName}
              </h2>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl" id="verdict-winner-justification">
              {isCustomAltered
                ? `Based on your modified priorities, ${recommendedName} has overtaken the original recommendation. This represents the option that most strongly aligns with what matters most to you right now.`
                : verdict.summaryJustification}
            </p>
          </div>

          {/* Confidence Dial Gauge */}
          <div className="flex flex-col items-center justify-center bg-slate-800/40 border border-slate-800 rounded-2xl p-6 min-w-[180px] self-center" id="confidence-gauge">
            <div className="relative flex items-center justify-center w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background path */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Confidence indicator path */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className="stroke-brand-500 transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              {/* Inner score label */}
              <div className="absolute text-center">
                <span className="text-2xl font-extrabold text-white font-mono">{confidence}%</span>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Match</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-300 mt-4 text-center">AI Confidence</span>
          </div>
        </div>
      </div>

      {/* Strategic breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="verdict-breakdown-row">
        {/* Key Differentiator panel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4" id="verdict-key-factor">
          <div className="flex items-center space-x-2 text-brand-600">
            <Zap className="h-5 w-5" />
            <h3 className="font-bold text-slate-900 text-base">The Key Differentiator</h3>
          </div>
          <div className="p-4 bg-brand-50/40 border border-brand-100 rounded-xl" id="verdict-differentiator-box">
            <p className="text-sm text-slate-800 font-medium leading-relaxed">
              {isCustomAltered
                ? `Your updated weights prioritised elements where ${recommendedName} scores substantially higher than other choices, breaking the original tie.`
                : verdict.keyDifferentiator}
            </p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            This is the crucial factor that tipped the scales and resolved the deadlock between competing choices.
          </p>
        </div>

        {/* Immediate Action Steps */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4" id="verdict-action-steps">
          <div className="flex items-center space-x-2 text-indigo-600">
            <Milestone className="h-5 w-5" />
            <h3 className="font-bold text-slate-900 text-base">Next Steps to Execute</h3>
          </div>
          <div className="space-y-3" id="verdict-steps-list">
            {verdict.actionSteps.map((step, idx) => (
              <div key={idx} className="flex items-start space-x-3 text-sm text-slate-700" id={`verdict-step-${idx}`}>
                <div className="flex items-center justify-center w-5.5 h-5.5 rounded-full bg-slate-100 text-slate-800 font-mono font-bold text-xs mt-0.5 flex-shrink-0">
                  {idx + 1}
                </div>
                <p className="leading-relaxed font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

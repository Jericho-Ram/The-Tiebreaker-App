import React, { useState } from "react";
import { Award, AlertTriangle, TrendingUp, Skull, ShieldAlert } from "lucide-react";
import { SwotAnalysis } from "../types";

interface SwotPanelProps {
  swotAnalyses: SwotAnalysis[];
}

export default function SwotPanel({ swotAnalyses }: SwotPanelProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeSwot = swotAnalyses[selectedIdx] || swotAnalyses[0];

  if (!activeSwot) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center text-slate-500">
        No SWOT analysis available.
      </div>
    );
  }

  return (
    <div className="space-y-6" id="swot-panel">
      {/* Option Segment Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm" id="swot-controls">
        <span className="text-sm font-extrabold text-slate-700">
          Strategic Profile for:
        </span>
        <div className="flex bg-slate-100 p-1.5 rounded-xl space-x-1" id="swot-option-tabs">
          {swotAnalyses.map((swot, idx) => {
            const isActive = idx === selectedIdx;
            return (
              <button
                key={swot.optionName}
                onClick={() => setSelectedIdx(idx)}
                className={`px-4.5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                id={`swot-tab-option-${idx}`}
              >
                {swot.optionName}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2x2 SWOT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="swot-grid">
        {/* STRENGTHS (Internal, Positive) */}
        <div className="bg-white border-l-4 border-emerald-500 rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-4" id="swot-strengths">
          <div className="flex items-center space-x-2.5 text-emerald-600">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">Strengths</h3>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Internal • Positive</span>
            </div>
          </div>
          <ul className="space-y-2.5 pt-2" id="strengths-list">
            {activeSwot.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-sm text-slate-700" id={`strength-${idx}`}>
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed font-medium">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* WEAKNESSES (Internal, Negative) */}
        <div className="bg-white border-l-4 border-amber-500 rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-4" id="swot-weaknesses">
          <div className="flex items-center space-x-2.5 text-amber-600">
            <div className="p-2 bg-amber-50 rounded-xl">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">Weaknesses</h3>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Internal • Negative</span>
            </div>
          </div>
          <ul className="space-y-2.5 pt-2" id="weaknesses-list">
            {activeSwot.weaknesses.map((wk, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-sm text-slate-700" id={`weakness-${idx}`}>
                <span className="inline-flex h-2 w-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed font-medium">{wk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* OPPORTUNITIES (External, Positive) */}
        <div className="bg-white border-l-4 border-indigo-500 rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-4" id="swot-opportunities">
          <div className="flex items-center space-x-2.5 text-indigo-600">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">Opportunities</h3>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">External • Positive</span>
            </div>
          </div>
          <ul className="space-y-2.5 pt-2" id="opportunities-list">
            {activeSwot.opportunities.map((op, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-sm text-slate-700" id={`opportunity-${idx}`}>
                <span className="inline-flex h-2 w-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed font-medium">{op}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* THREATS (External, Negative) */}
        <div className="bg-white border-l-4 border-rose-500 rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-4" id="swot-threats">
          <div className="flex items-center space-x-2.5 text-rose-600">
            <div className="p-2 bg-rose-50 rounded-xl">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">Threats & Risks</h3>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">External • Negative</span>
            </div>
          </div>
          <ul className="space-y-2.5 pt-2" id="threats-list">
            {activeSwot.threats.map((th, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-sm text-slate-700" id={`threat-${idx}`}>
                <span className="inline-flex h-2 w-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed font-medium">{th}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

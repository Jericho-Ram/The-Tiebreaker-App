import React, { useState, useEffect } from "react";
import {
  Scale,
  Sparkles,
  Trophy,
  Sliders,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowLeft,
  ThumbsUp,
  Grid,
  FileText,
  Bookmark
} from "lucide-react";
import { Decision, DecisionAnalysis } from "./types";
import HistorySidebar from "./components/HistorySidebar";
import FormulationWizard from "./components/FormulationWizard";
import VerdictPanel from "./components/VerdictPanel";
import ProsConsPanel from "./components/ProsConsPanel";
import ComparisonMatrix from "./components/ComparisonMatrix";
import SwotPanel from "./components/SwotPanel";

const LOADING_MESSAGES = [
  "Weighing the variables...",
  "Consulting the Oracles of Logic...",
  "Drafting pros and cons list...",
  "Structuring tactical SWOT profiles...",
  "Calculating priority vector fields...",
  "Drying out emotional details...",
  "Resolving the decision deadlock..."
];

export default function App() {
  // Global States
  const [decisions, setDecisions] = useState<Decision[]>(() => {
    const saved = localStorage.getItem("tiebreaker_decisions");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeId, setActiveId] = useState<string | null>(null);

  // Active formulation states
  const [initialQuery, setInitialQuery] = useState("");
  const [refinedDecision, setRefinedDecision] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [criteria, setCriteria] = useState<string[]>([]);
  const [criteriaWeights, setCriteriaWeights] = useState<Record<string, number>>({});

  // Loading and tab states
  const [isGeneratingWizard, setIsGeneratingWizard] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"verdict" | "proscons" | "comparison" | "swot">("verdict");
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("tiebreaker_decisions", JSON.stringify(decisions));
  }, [decisions]);

  // Handle rotating loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing || isGeneratingWizard) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing, isGeneratingWizard]);

  const activeDecision = decisions.find((d) => d.id === activeId) || null;

  // 1. Trigger Wizard: Formulate basic options and criteria from raw query
  const handleGenerateOptions = async (queryToUse: string) => {
    setIsGeneratingWizard(true);
    setAnalysisError(null);
    setLoadingMsgIdx(0);
    try {
      const res = await fetch("/api/generate-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryToUse }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to formulate options.");
      }

      setRefinedDecision(data.refinedDecision);
      setOptions(data.options);
      setCriteria(data.criteria);

      // Default weights to 3
      const weights: Record<string, number> = {};
      data.criteria.forEach((c: string) => {
        weights[c] = 3;
      });
      setCriteriaWeights(weights);
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || "Something went wrong formulating options. Please try again.");
    } finally {
      setIsGeneratingWizard(false);
    }
  };

  // 2. Trigger Full Analysis
  const handlePerformAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setLoadingMsgIdx(0);
    try {
      const res = await fetch("/api/analyze-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: refinedDecision,
          options,
          criteria,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to perform decision analysis.");
      }

      // Create new Decision Object
      const newDecision: Decision = {
        id: `dec-${Date.now()}`,
        title: refinedDecision,
        createdAt: new Date().toISOString(),
        refinedDecision,
        options,
        criteria,
        context: data.context || "Custom formulated trade-off model.",
        criteriaWeights: { ...criteriaWeights },
        analysis: data as DecisionAnalysis,
      };

      setDecisions((prev) => [newDecision, ...prev]);
      setActiveId(newDecision.id);
      setActiveTab("verdict");

      // Reset formulation inputs
      setInitialQuery("");
      setRefinedDecision("");
      setOptions([]);
      setCriteria([]);
      setCriteriaWeights({});
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || "Failed to analyze decision. Please check your network and API key settings.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Select decision from sidebar
  const handleSelectDecision = (id: string) => {
    setActiveId(id);
    setActiveTab("verdict");
    setAnalysisError(null);
  };

  // Delete decision
  const handleDeleteDecision = (id: string) => {
    setDecisions((prev) => prev.filter((d) => d.id !== id));
    if (activeId === id) {
      setActiveId(null);
    }
  };

  // Reset to new tiebreaker wizard
  const handleNewTiebreaker = () => {
    setActiveId(null);
    setInitialQuery("");
    setRefinedDecision("");
    setOptions([]);
    setCriteria([]);
    setCriteriaWeights({});
    setAnalysisError(null);
  };

  // Live weights slider adjustment inside active cockpit
  const handleLiveWeightChange = (criterion: string, val: number) => {
    if (!activeId) return;
    setDecisions((prev) =>
      prev.map((d) => {
        if (d.id === activeId) {
          return {
            ...d,
            criteriaWeights: {
              ...d.criteriaWeights,
              [criterion]: val,
            },
          };
        }
        return d;
      })
    );
  };

  // Real-time dynamic ranking based on live criteria sliders
  const getLeaderboard = () => {
    if (!activeDecision || !activeDecision.analysis) return [];

    const scores = activeDecision.analysis.comparisonScores.map((oc) => {
      let totalWeightedScore = 0;
      let totalWeight = 0;

      oc.scores.forEach((s) => {
        const weight = activeDecision.criteriaWeights[s.criterion] ?? 3;
        totalWeightedScore += s.score * weight;
        totalWeight += weight;
      });

      const finalScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

      return {
        name: oc.optionName,
        score: finalScore,
      };
    });

    // Sort descending
    return scores.sort((a, b) => b.score - a.score);
  };

  const leaderboard = getLeaderboard();
  const calculatedRecommendation = leaderboard[0]?.name;

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden text-slate-800 font-sans" id="app-root">
      {/* 1. History Sidebar (Fixed left side) */}
      <HistorySidebar
        decisions={decisions}
        activeId={activeId}
        onSelect={handleSelectDecision}
        onDelete={handleDeleteDecision}
        onNew={handleNewTiebreaker}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden" id="main-canvas">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0" id="canvas-header">
          <div className="flex items-center gap-3">
            {activeId && (
              <button
                onClick={handleNewTiebreaker}
                className="mr-1 p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors md:hidden cursor-pointer"
                title="Back to formulation"
                id="header-btn-back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div className="w-8 h-8 bg-brand-600 rounded flex items-center justify-center text-white font-black shadow-sm" id="header-logo">
              <span>T</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-800 truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              {activeId && activeDecision ? activeDecision.title : "The Tiebreaker"}
            </h1>
            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] uppercase font-bold text-slate-500 tracking-wider hidden sm:inline-block">
              {activeId ? "AI Analysis" : "Formulation Mode"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {activeId && (
              <button
                onClick={handleNewTiebreaker}
                className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
                id="header-btn-new"
              >
                New Decision
              </button>
            )}
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400" id="header-timestamp">
              <Clock className="h-3.5 w-3.5 text-slate-300" />
              <span>UTC</span>
            </div>
          </div>
        </header>

        {/* Global Error Banner */}
        {analysisError && (
          <div className="bg-rose-50 border-b border-rose-200 text-rose-800 px-6 py-3.5 flex items-start space-x-2 flex-shrink-0" id="error-banner">
            <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm flex-1 font-medium">
              <span className="font-bold">Error: </span>
              {analysisError}
            </div>
            <button
              onClick={() => setAnalysisError(null)}
              className="text-xs font-semibold text-rose-500 hover:text-rose-700 underline cursor-pointer"
              id="btn-dismiss-error"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading Overlay Screen */}
        {(isAnalyzing || isGeneratingWizard) ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/80 backdrop-blur-xs" id="loading-overlay">
            <div className="relative mb-6" id="loader-animation">
              <div className="w-16 h-16 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
              <Scale className="h-6 w-6 text-brand-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {isGeneratingWizard ? "Refining Option Structures" : "Breaking the Tie"}
            </h3>
            <p className="text-sm font-medium text-brand-600 mt-2 font-mono h-6 transition-all duration-500 animate-fade-in">
              {LOADING_MESSAGES[loadingMsgIdx]}
            </p>
            <p className="text-xs text-slate-400 mt-6 max-w-sm leading-relaxed">
              Our advanced AI model is running complex multicriteria decision calculations. Thank you for your patience.
            </p>
          </div>
        ) : !activeId ? (
          /* 3. Formulation Wizard Mode */
          <div className="flex-1 overflow-y-auto" id="wizard-scroll-container">
            <FormulationWizard
              initialQuery={initialQuery}
              setInitialQuery={setInitialQuery}
              refinedDecision={refinedDecision}
              setRefinedDecision={setRefinedDecision}
              options={options}
              setOptions={setOptions}
              criteria={criteria}
              setCriteria={setCriteria}
              criteriaWeights={criteriaWeights}
              setCriteriaWeights={setCriteriaWeights}
              onAnalyze={handlePerformAnalysis}
              isGeneratingWizard={isGeneratingWizard}
              onGenerateOptions={handleGenerateOptions}
            />
          </div>
        ) : (
          /* 4. Interactive Cockpit Mode (Active Analysis) */
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden" id="cockpit-container">
            {/* LEFT Column: Real-time Cockpit Adjusters (Weights and Rankings) */}
            <div className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-slate-200/80 flex flex-col h-1/2 lg:h-full flex-shrink-0 overflow-y-auto" id="cockpit-sidebar">
              <div className="p-5 border-b border-slate-100 space-y-3" id="sidebar-leaderboard">
                <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg w-fit">
                  <Trophy className="h-4 w-4" />
                  <span>Real-time Rankings</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Recalculates dynamically as you adjust priorities below.
                </p>

                {/* Rank rows */}
                <div className="space-y-2.5 pt-2" id="leaderboard-items">
                  {leaderboard.map((item, idx) => {
                    const isWinner = idx === 0;
                    return (
                      <div
                        key={item.name}
                        className={`flex items-center justify-between p-3 rounded-xl border ${
                          isWinner
                            ? "bg-gradient-to-r from-brand-50/50 to-indigo-50/30 border-brand-200 shadow-xs"
                            : "bg-slate-50/40 border-slate-100"
                        }`}
                        id={`rank-item-${idx}`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                          <span className={`flex items-center justify-center w-5.5 h-5.5 rounded-full text-xs font-bold font-mono ${
                            isWinner ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-600"
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="font-bold text-sm text-slate-800 truncate pr-2">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-mono font-black text-sm text-slate-700 bg-white px-2 py-0.5 border border-slate-100 rounded-md">
                          {item.score.toFixed(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Priorities Adjuster Slider Panel */}
              <div className="p-5 space-y-4" id="sidebar-weights-adjuster">
                <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Sliders className="h-4 w-4 text-slate-400" />
                  <span>Adjust Priorities</span>
                </div>

                <div className="space-y-4" id="live-weights-list">
                  {activeDecision.criteria.map((crit) => {
                    const weight = activeDecision.criteriaWeights[crit] ?? 3;
                    return (
                      <div key={crit} className="space-y-1 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100" id={`live-weight-${crit}`}>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span className="truncate max-w-[150px]" title={crit}>{crit}</span>
                          <span className="font-mono text-brand-600 px-1.5 py-0.5 bg-brand-50 rounded-md text-[10px]">
                            {weight}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={weight}
                          onChange={(e) => handleLiveWeightChange(crit, parseInt(e.target.value))}
                          className="w-full accent-brand-600 cursor-ew-resize h-1.5 bg-slate-200 rounded-lg appearance-none"
                          id={`live-slider-${crit}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT Column: Detail tabs display (Verdict, SWOT, Comparison table, etc) */}
            <div className="flex-1 flex flex-col h-1/2 lg:h-full overflow-hidden" id="cockpit-detail-panel">
              {/* Tab Selector Segment */}
              <div className="bg-white border-b border-slate-200/80 px-6 py-3 flex items-center overflow-x-auto gap-1.5 flex-shrink-0" id="cockpit-tabs-bar">
                <button
                  onClick={() => setActiveTab("verdict")}
                  className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === "verdict"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                  }`}
                  id="tab-btn-verdict"
                >
                  <Bookmark className="h-4 w-4" />
                  <span>AI Verdict</span>
                </button>

                <button
                  onClick={() => setActiveTab("proscons")}
                  className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === "proscons"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                  }`}
                  id="tab-btn-proscons"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Pros & Cons</span>
                </button>

                <button
                  onClick={() => setActiveTab("comparison")}
                  className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === "comparison"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                  }`}
                  id="tab-btn-comparison"
                >
                  <Grid className="h-4 w-4" />
                  <span>Evaluation Matrix</span>
                </button>

                <button
                  onClick={() => setActiveTab("swot")}
                  className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === "swot"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                  }`}
                  id="tab-btn-swot"
                >
                  <FileText className="h-4 w-4" />
                  <span>SWOT Analysis</span>
                </button>
              </div>

              {/* Active Tab Panel Body */}
              <div className="flex-1 overflow-y-auto p-6" id="cockpit-body-content">
                {activeTab === "verdict" && (
                  <VerdictPanel
                    verdict={activeDecision.analysis!.verdict}
                    calculatedRecommendation={calculatedRecommendation}
                  />
                )}

                {activeTab === "proscons" && (
                  <ProsConsPanel prosAndCons={activeDecision.analysis!.prosAndCons} />
                )}

                {activeTab === "comparison" && (
                  <ComparisonMatrix
                    criteria={activeDecision.criteria}
                    options={activeDecision.options}
                    comparisonScores={activeDecision.analysis!.comparisonScores}
                    criteriaWeights={activeDecision.criteriaWeights}
                  />
                )}

                {activeTab === "swot" && (
                  <SwotPanel swotAnalyses={activeDecision.analysis!.swotAnalyses} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Status Bar */}
        <footer className="h-10 bg-slate-800 text-slate-400 px-6 flex items-center justify-between text-[10px] uppercase tracking-widest shrink-0" id="app-footer">
          <div className="flex gap-6">
            <span>Mode: {activeId ? "Deep AI Breakdown" : "Objective Matrix"}</span>
            {activeId && activeDecision?.analysis?.verdict?.confidenceScore && (
              <span>Confidence Score: {activeDecision.analysis.verdict.confidenceScore}%</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Engine Connected</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

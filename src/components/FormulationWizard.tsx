import React, { useState } from "react";
import { Sparkles, Plus, X, HelpCircle, ArrowRight, Settings2, Scale } from "lucide-react";

interface FormulationWizardProps {
  initialQuery: string;
  setInitialQuery: (q: string) => void;
  refinedDecision: string;
  setRefinedDecision: (d: string) => void;
  options: string[];
  setOptions: (opts: string[]) => void;
  criteria: string[];
  setCriteria: (crit: string[]) => void;
  criteriaWeights: Record<string, number>;
  setCriteriaWeights: (weights: Record<string, number>) => void;
  onAnalyze: () => void;
  isGeneratingWizard: boolean;
  onGenerateOptions: (query: string) => void;
}

const TEMPLATES = [
  {
    title: "Career Dilemma",
    query: "Should I accept a high-paying corporate job in Dallas or start my own indie tech startup?",
  },
  {
    title: "Housing Choice",
    query: "Should I buy a fixer-upper house in the suburbs or rent a modern apartment in the city center?",
  },
  {
    title: "Vehicle Purchase",
    query: "Deciding between purchasing a fully Electric SUV or a Hybrid Sedan.",
  },
  {
    title: "Vacation Spot",
    query: "Where should we go for our 2-week holiday: Japan (exploring Tokyo & Kyoto) or Italy (Amalfi Coast)?",
  },
];

export default function FormulationWizard({
  initialQuery,
  setInitialQuery,
  refinedDecision,
  setRefinedDecision,
  options,
  setOptions,
  criteria,
  setCriteria,
  criteriaWeights,
  setCriteriaWeights,
  onAnalyze,
  isGeneratingWizard,
  onGenerateOptions,
}: FormulationWizardProps) {
  const [newOption, setNewOption] = useState("");
  const [newCriterion, setNewCriterion] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Quick actions
  const handleAddOption = () => {
    const trimmed = newOption.trim();
    if (trimmed && !options.includes(trimmed)) {
      setOptions([...options, trimmed]);
      setNewOption("");
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleAddCriterion = () => {
    const trimmed = newCriterion.trim();
    if (trimmed && !criteria.includes(trimmed)) {
      setCriteria([...criteria, trimmed]);
      setCriteriaWeights({ ...criteriaWeights, [trimmed]: 3 });
      setNewCriterion("");
    }
  };

  const handleRemoveCriterion = (criterionName: string) => {
    if (criteria.length > 2) {
      setCriteria(criteria.filter((c) => c !== criterionName));
      const updatedWeights = { ...criteriaWeights };
      delete updatedWeights[criterionName];
      setCriteriaWeights(updatedWeights);
    }
  };

  const handleWeightChange = (criterion: string, val: number) => {
    setCriteriaWeights({ ...criteriaWeights, [criterion]: val });
  };

  const handleTemplateClick = (q: string) => {
    setInitialQuery(q);
    onGenerateOptions(q);
  };

  const handleKeyPressOption = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddOption();
    }
  };

  const handleKeyPressCriterion = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCriterion();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4" id="formulation-wizard">
      {/* Intro branding */}
      <div className="text-center mb-10" id="wizard-welcome-header">
        <div className="inline-flex items-center justify-center p-3 bg-brand-100 rounded-2xl mb-4 text-brand-600">
          <Scale className="h-10 w-10 animate-pulse" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Let's Break That Tie
        </h1>
        <p className="text-slate-600 mt-2.5 max-w-lg mx-auto text-base">
          Stuck between choices? Describe your decision below. AI will help formulate, evaluate, and structurally solve your deadlock.
        </p>
      </div>

      {/* STEP 1: Define Dilemma */}
      {options.length === 0 ? (
        <div className="space-y-8" id="step-1-dilemma">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              What decision are you currently weighing?
            </label>
            <div className="relative">
              <textarea
                value={initialQuery}
                onChange={(e) => setInitialQuery(e.target.value)}
                placeholder="e.g. Should I rent an apartment in the city center or buy a starter home in the suburbs? My budget is $3,500/month."
                className="w-full min-h-[120px] p-4 text-slate-800 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 rounded-xl text-base transition-all resize-none outline-none"
                id="tx-initial-query"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-5 gap-4">
              <span className="text-xs text-slate-500 flex items-center space-x-1.5">
                <HelpCircle className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span>The more context you give, the better the pros, cons, and criteria suggested will be.</span>
              </span>

              <button
                disabled={isGeneratingWizard || !initialQuery.trim()}
                onClick={() => onGenerateOptions(initialQuery)}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl shadow-md cursor-pointer transition-all active:scale-[0.99] self-end min-w-[200px]"
                id="btn-generate-wizard"
              >
                {isGeneratingWizard ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Structuring Option Board...</span>
                  </div>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-brand-100" />
                    <span>Formulate Option Board</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preset templates */}
          <div id="decision-templates">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 px-1">
              Need inspiration? Try a template
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => handleTemplateClick(tpl.query)}
                  disabled={isGeneratingWizard}
                  className="bg-white hover:bg-brand-50/40 text-left p-5 rounded-2xl border border-slate-200 hover:border-brand-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-full cursor-pointer"
                  id={`template-btn-${i}`}
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 group-hover:text-brand-600 transition-colors">
                      {tpl.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {tpl.query}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 group-hover:text-brand-600 mt-4 transition-colors">
                    <span>Quick load</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* STEP 2: Configure Option Board */
        <div className="space-y-6" id="step-2-configure-board">
          {/* Header & Refined Title */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4" id="refined-decision-container">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                Decision Statement
              </span>
              <button
                onClick={() => {
                  setOptions([]);
                  setCriteria([]);
                  setRefinedDecision("");
                }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline cursor-pointer"
                id="btn-edit-initial-query"
              >
                Reset Dilemma Query
              </button>
            </div>
            <input
              type="text"
              value={refinedDecision}
              onChange={(e) => setRefinedDecision(e.target.value)}
              className="w-full p-3 font-bold text-slate-800 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 rounded-xl text-lg outline-none transition-all"
              placeholder="Refine the decision title..."
              id="input-refined-decision"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="wizard-editing-grid">
            {/* Options Panel */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between" id="options-manager">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-base">Options to Compare</h3>
                  <span className="text-xs font-mono text-slate-400">Min 2 required</span>
                </div>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 mb-4" id="options-list-editor">
                  {options.map((opt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-sm text-slate-700"
                      id={`option-editor-row-${idx}`}
                    >
                      <span className="font-mono text-xs text-slate-400 w-5">#{idx + 1}</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...options];
                          updated[idx] = e.target.value;
                          setOptions(updated);
                        }}
                        className="flex-1 bg-transparent font-medium border-none outline-none focus:ring-0 p-0 text-slate-800"
                        id={`input-option-${idx}`}
                      />
                      {options.length > 2 && (
                        <button
                          onClick={() => handleRemoveOption(idx)}
                          className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          id={`btn-remove-option-${idx}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Option form */}
              <div className="flex space-x-2" id="add-option-form">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={handleKeyPressOption}
                  placeholder="Add custom option..."
                  className="flex-1 px-3 py-2 bg-slate-50 text-slate-800 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl text-sm outline-none transition-all"
                  id="input-new-option"
                />
                <button
                  onClick={handleAddOption}
                  disabled={!newOption.trim()}
                  className="p-2.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-all cursor-pointer"
                  id="btn-add-option"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Criteria Panel */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between" id="criteria-manager">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-base">Evaluation Criteria</h3>
                  <span className="text-xs font-mono text-slate-400">Min 2 required</span>
                </div>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 mb-4" id="criteria-list-editor">
                  {criteria.map((crit, idx) => (
                    <div
                      key={crit}
                      className="flex items-center space-x-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-sm text-slate-700"
                      id={`criteria-editor-row-${idx}`}
                    >
                      <span className="font-mono text-xs text-slate-400 w-5">#{idx + 1}</span>
                      <input
                        type="text"
                        value={crit}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          if (val && val !== crit) {
                            const updated = [...criteria];
                            updated[idx] = val;
                            setCriteria(updated);

                            const updatedWeights = { ...criteriaWeights };
                            updatedWeights[val] = criteriaWeights[crit] || 3;
                            delete updatedWeights[crit];
                            setCriteriaWeights(updatedWeights);
                          }
                        }}
                        className="flex-1 bg-transparent font-medium border-none outline-none focus:ring-0 p-0 text-slate-800"
                        id={`input-criterion-${idx}`}
                      />
                      {criteria.length > 2 && (
                        <button
                          onClick={() => handleRemoveCriterion(crit)}
                          className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          id={`btn-remove-criterion-${idx}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Criterion form */}
              <div className="flex space-x-2" id="add-criterion-form">
                <input
                  type="text"
                  value={newCriterion}
                  onChange={(e) => setNewCriterion(e.target.value)}
                  onKeyDown={handleKeyPressCriterion}
                  placeholder="Add custom criterion (e.g. Happiness)..."
                  className="flex-1 px-3 py-2 bg-slate-50 text-slate-800 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl text-sm outline-none transition-all"
                  id="input-new-criterion"
                />
                <button
                  onClick={handleAddCriterion}
                  disabled={!newCriterion.trim()}
                  className="p-2.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-all cursor-pointer"
                  id="btn-add-criterion"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced / Pre-Weights section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6" id="weights-panel">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 font-bold text-sm w-full focus:outline-none cursor-pointer"
              id="btn-toggle-advanced"
            >
              <Settings2 className="h-4.5 w-4.5 text-brand-500" />
              <span>{showAdvanced ? "Hide" : "Show"} Pre-Weighing Priorities ({criteria.length} criteria)</span>
            </button>

            {showAdvanced && (
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-slate-100" id="weights-list">
                {criteria.map((crit) => {
                  const weight = criteriaWeights[crit] || 3;
                  return (
                    <div key={crit} className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl" id={`weight-item-${crit}`}>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span className="truncate">{crit}</span>
                        <span className="font-mono text-brand-600 px-2 py-0.5 bg-brand-50 rounded-md">
                          {weight === 5
                            ? "Critical (5)"
                            : weight === 4
                            ? "High (4)"
                            : weight === 3
                            ? "Medium (3)"
                            : weight === 2
                            ? "Low (2)"
                            : "Trivial (1)"}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={weight}
                        onChange={(e) => handleWeightChange(crit, parseInt(e.target.value))}
                        className="w-full accent-brand-600 cursor-ew-resize h-1.5 bg-slate-200 rounded-lg appearance-none"
                        id={`slider-weight-${crit}`}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Trigger */}
          <div className="flex items-center justify-end pt-4" id="wizard-analyze-trigger">
            <button
              onClick={onAnalyze}
              className="flex items-center justify-center space-x-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-brand-500/20 hover:shadow-brand-500/30 active:scale-[0.99] transition-all text-base cursor-pointer"
              id="btn-break-tie"
            >
              <Sparkles className="h-5 w-5 text-brand-100" />
              <span>Break the Tie!</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

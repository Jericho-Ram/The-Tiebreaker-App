import React, { useState } from "react";
import { Info, HelpCircle, ArrowUpRight, MessageSquare } from "lucide-react";
import { OptionScores } from "../types";

interface ComparisonMatrixProps {
  criteria: string[];
  options: string[];
  comparisonScores: OptionScores[];
  criteriaWeights: Record<string, number>;
}

export default function ComparisonMatrix({
  criteria,
  options,
  comparisonScores,
  criteriaWeights,
}: ComparisonMatrixProps) {
  const [selectedCell, setSelectedCell] = useState<{
    criterion: string;
    optionName: string;
    score: number;
    reasoning: string;
  } | null>(null);

  // Helper to color code scores (1 to 10)
  const getScoreColor = (score: number) => {
    if (score >= 8) {
      return "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/50";
    } else if (score >= 5) {
      return "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100/50";
    } else {
      return "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100/50";
    }
  };

  // Live Recalculation math:
  // Weighted Average = SUM(Score_ij * Weight_j) / SUM(Weight_j)
  const calculateWeightedAverage = (optionName: string) => {
    const optScores = comparisonScores.find((oc) => oc.optionName === optionName);
    if (!optScores) return 0;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    optScores.scores.forEach((s) => {
      const weight = criteriaWeights[s.criterion] ?? 3; // default medium weight
      totalWeightedScore += s.score * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? (totalWeightedScore / totalWeight).toFixed(1) : "0.0";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-6" id="comparison-matrix">
      {/* Table Header area */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 pb-4" id="matrix-header-row">
        <div>
          <h3 className="font-extrabold text-slate-800 text-lg">Evaluation Matrix</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare all scores under your customized weights. Click any score cell to read details.
          </p>
        </div>
        <span className="text-xs text-slate-400 font-medium flex items-center space-x-1">
          <HelpCircle className="h-4 w-4 text-slate-300" />
          <span>Formula: Weighted Mean</span>
        </span>
      </div>

      {/* Grid Table Container with responsive scroll */}
      <div className="overflow-x-auto -mx-6 sm:mx-0" id="matrix-table-scrollable">
        <table className="w-full text-left border-collapse min-w-[640px]" id="matrix-table">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 w-[240px]">
                Evaluation Criterion
              </th>
              <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center w-[100px]">
                Priority Weight
              </th>
              {options.map((option, idx) => (
                <th
                  key={option}
                  className="py-4 px-6 text-xs font-extrabold uppercase tracking-wider text-slate-800 text-center"
                  id={`matrix-th-option-${idx}`}
                >
                  <div className="flex flex-col items-center justify-center space-y-0.5">
                    <span className="text-[10px] font-mono text-indigo-500 font-bold">Option {String.fromCharCode(65 + idx)}</span>
                    <span className="truncate max-w-[150px]">{option}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {criteria.map((criterion, critIdx) => {
              const weight = criteriaWeights[criterion] ?? 3;

              return (
                <tr key={criterion} className="hover:bg-slate-50/40 transition-colors" id={`matrix-row-${critIdx}`}>
                  {/* Criterion label */}
                  <td className="py-4 px-6 text-sm font-bold text-slate-800">
                    {criterion}
                  </td>

                  {/* Criterion weight */}
                  <td className="py-4 px-4 text-center font-mono text-xs">
                    <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-600 font-bold rounded-md">
                      {weight}x
                    </span>
                  </td>

                  {/* Options' scores */}
                  {options.map((option) => {
                    const optGroup = comparisonScores.find((oc) => oc.optionName === option);
                    const cell = optGroup?.scores.find((s) => s.criterion === criterion);
                    const score = cell?.score ?? 0;
                    const reasoning = cell?.reasoning ?? "No explanation provided.";

                    return (
                      <td key={option} className="py-3 px-6 text-center">
                        <button
                          onClick={() =>
                            setSelectedCell({
                              criterion,
                              optionName: option,
                              score,
                              reasoning,
                            })
                          }
                          className={`w-14 py-2 text-sm font-extrabold font-mono border rounded-xl transition-all cursor-pointer ${getScoreColor(
                            score
                          )}`}
                          id={`matrix-cell-${option}-${criterion}`}
                        >
                          {score}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* Total Weighted Score Row */}
            <tr className="bg-indigo-50/30 border-t-2 border-indigo-100/50 font-bold">
              <td className="py-5 px-6 text-sm text-indigo-900 font-extrabold">
                Weighted Recommendation Score
              </td>
              <td className="py-5 px-4 text-center">
                {/* empty weight placeholder */}
              </td>
              {options.map((option, idx) => {
                const weightedAvg = calculateWeightedAverage(option);
                return (
                  <td key={option} className="py-5 px-6 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-xl font-black text-indigo-600 font-mono" id={`matrix-total-${idx}`}>
                        {weightedAvg}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold">out of 10</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Slide-down / Popup Reasoning detail box */}
      {selectedCell && (
        <div
          className="p-5 bg-gradient-to-r from-indigo-50/50 to-indigo-100/30 border border-brand-100 rounded-2xl animate-fade-in relative"
          id="matrix-reasoning-drawer"
        >
          <button
            onClick={() => setSelectedCell(null)}
            className="absolute top-4 right-4 text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
            id="btn-close-matrix-reasoning"
          >
            Dismiss
          </button>
          <div className="flex items-start space-x-3 pr-10">
            <MessageSquare className="h-5 w-5 text-indigo-500 mt-1 flex-shrink-0" />
            <div className="space-y-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                  {selectedCell.optionName}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs font-bold text-slate-700">
                  {selectedCell.criterion}
                </span>
                <span className="text-slate-400">•</span>
                <span className="inline-flex items-center text-xs font-bold px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded font-mono">
                  Score: {selectedCell.score}/10
                </span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed italic pt-1 font-medium">
                "{selectedCell.reasoning}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

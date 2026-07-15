import React from "react";
import { Plus, Trash2, History, Scale, Calendar } from "lucide-react";
import { Decision } from "../types";

interface HistorySidebarProps {
  decisions: Decision[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export default function HistorySidebar({
  decisions,
  activeId,
  onSelect,
  onDelete,
  onNew,
}: HistorySidebarProps) {
  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800 w-full md:w-80 flex-shrink-0" id="history-sidebar">
      {/* Header section */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between" id="history-header">
        <div className="flex items-center space-x-2">
          <Scale className="h-6 w-6 text-brand-500 animate-pulse" />
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
            The Tiebreaker
          </span>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 rounded-full text-slate-400">
          v1.0
        </span>
      </div>

      {/* New Tiebreaker CTA */}
      <div className="p-4" id="history-new-action">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-indigo-950/40 hover:shadow-indigo-950/60 active:scale-[0.98] transition-all cursor-pointer"
          id="btn-new-tiebreaker"
        >
          <Plus className="h-5 w-5" />
          <span>New Tiebreaker</span>
        </button>
      </div>

      {/* Decisions List */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3" id="history-list-container">
        <div className="flex items-center justify-between px-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <span className="flex items-center space-x-1">
            <History className="h-3.5 w-3.5" />
            <span>History</span>
          </span>
          <span className="font-mono">{decisions.length} saved</span>
        </div>

        {decisions.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-slate-800 rounded-xl" id="history-empty-state">
            <p className="text-sm text-slate-500">No decisions saved yet.</p>
            <p className="text-xs text-slate-600 mt-1">Your past tiebreakers will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2" id="decisions-list">
            {decisions.map((decision) => {
              const isActive = decision.id === activeId;
              const formattedDate = new Date(decision.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={decision.id}
                  onClick={() => onSelect(decision.id)}
                  className={`group relative flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${
                    isActive
                      ? "bg-slate-800/80 border-brand-500 text-white shadow-md shadow-slate-950/20"
                      : "bg-slate-900/50 hover:bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                  id={`decision-item-${decision.id}`}
                >
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="text-sm font-semibold truncate leading-snug">
                      {decision.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1.5 text-xs text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formattedDate}</span>
                      </span>
                      <span>•</span>
                      <span>{decision.options.length} options</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(decision.id);
                    }}
                    className="absolute right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800/50 transition-all cursor-pointer"
                    title="Delete Decision"
                    id={`btn-delete-${decision.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

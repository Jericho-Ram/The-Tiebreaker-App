import React, { useState } from "react";
import { PlusCircle, ThumbsUp, ThumbsDown, Star, MessageSquare } from "lucide-react";
import { OptionProsCons, ProConItem } from "../types";

interface ProsConsPanelProps {
  prosAndCons: OptionProsCons[];
}

export default function ProsConsPanel({ prosAndCons }: ProsConsPanelProps) {
  const [activeItem, setActiveItem] = useState<{ optionIdx: number; itemIdx: number } | null>(null);

  const renderStars = (count: number, isPro: boolean) => {
    return (
      <div className="flex space-x-0.5" title={`Importance: ${count}/5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < count
                ? isPro
                  ? "text-emerald-500 fill-emerald-500"
                  : "text-rose-500 fill-rose-500"
                : "text-slate-200"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8" id="pros-cons-panel">
      {prosAndCons.map((optGroup, optIdx) => {
        const pros = optGroup.items.filter((item) => item.isPro);
        const cons = optGroup.items.filter((item) => !item.isPro);

        return (
          <div
            key={optGroup.optionName}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
            id={`option-procon-card-${optIdx}`}
          >
            {/* Header: Option name */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between" id={`procon-header-${optIdx}`}>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-bold font-mono text-sm">
                  {String.fromCharCode(65 + optIdx)}
                </div>
                <h3 className="font-extrabold text-slate-800 text-lg">
                  {optGroup.optionName}
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {pros.length} Pros • {cons.length} Cons
              </span>
            </div>

            {/* Pros and Cons lists side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100" id={`procon-grid-${optIdx}`}>
              {/* PROS column */}
              <div className="p-6 space-y-4" id={`pros-col-${optIdx}`}>
                <div className="flex items-center space-x-2 text-emerald-600 font-bold text-sm uppercase tracking-wider mb-2">
                  <ThumbsUp className="h-4 w-4" />
                  <span>Pros / Advantages</span>
                </div>

                {pros.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No positive factors identified.</p>
                ) : (
                  <div className="space-y-3" id={`pros-list-${optIdx}`}>
                    {pros.map((item, idx) => {
                      const absoluteIdx = optGroup.items.indexOf(item);
                      const isOpened = activeItem?.optionIdx === optIdx && activeItem?.itemIdx === absoluteIdx;

                      return (
                        <div
                          key={idx}
                          onClick={() => setActiveItem(isOpened ? null : { optionIdx: optIdx, itemIdx: absoluteIdx })}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isOpened
                              ? "bg-emerald-50/40 border-emerald-200 shadow-sm"
                              : "bg-slate-50/50 hover:bg-slate-50 border-slate-100 hover:border-slate-200/80"
                          }`}
                          id={`pro-item-${optIdx}-${idx}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 min-w-0 flex-1">
                              {/* Category tag */}
                              <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {item.category}
                              </span>
                              <p className="text-sm font-semibold text-slate-800 leading-snug">
                                {item.text}
                              </p>
                            </div>
                            <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                              {renderStars(item.weight, true)}
                            </div>
                          </div>

                          {/* Hoverable Explanation */}
                          {isOpened && (
                            <div className="mt-2.5 pt-2 border-t border-emerald-100/60 text-xs text-slate-600 leading-relaxed flex items-start space-x-1.5" id={`pro-explanation-${optIdx}-${idx}`}>
                              <MessageSquare className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <p className="flex-1 italic">{item.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* CONS column */}
              <div className="p-6 space-y-4" id={`cons-col-${optIdx}`}>
                <div className="flex items-center space-x-2 text-rose-600 font-bold text-sm uppercase tracking-wider mb-2">
                  <ThumbsDown className="h-4 w-4" />
                  <span>Cons / Disadvantages</span>
                </div>

                {cons.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No negative factors identified.</p>
                ) : (
                  <div className="space-y-3" id={`cons-list-${optIdx}`}>
                    {cons.map((item, idx) => {
                      const absoluteIdx = optGroup.items.indexOf(item);
                      const isOpened = activeItem?.optionIdx === optIdx && activeItem?.itemIdx === absoluteIdx;

                      return (
                        <div
                          key={idx}
                          onClick={() => setActiveItem(isOpened ? null : { optionIdx: optIdx, itemIdx: absoluteIdx })}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isOpened
                              ? "bg-rose-50/40 border-rose-200 shadow-sm"
                              : "bg-slate-50/50 hover:bg-slate-50 border-slate-100 hover:border-slate-200/80"
                          }`}
                          id={`con-item-${optIdx}-${idx}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 min-w-0 flex-1">
                              {/* Category tag */}
                              <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                {item.category}
                              </span>
                              <p className="text-sm font-semibold text-slate-800 leading-snug">
                                {item.text}
                              </p>
                            </div>
                            <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                              {renderStars(item.weight, false)}
                            </div>
                          </div>

                          {/* Hoverable Explanation */}
                          {isOpened && (
                            <div className="mt-2.5 pt-2 border-t border-rose-100/60 text-xs text-slate-600 leading-relaxed flex items-start space-x-1.5" id={`con-explanation-${optIdx}-${idx}`}>
                              <MessageSquare className="h-3.5 w-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                              <p className="flex-1 italic">{item.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

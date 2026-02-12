"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createPageUrl } from "@/utils";
import { Trophy, ArrowRight, Loader2, Circle } from "lucide-react";

export default function LiveScoresWidget() {
  const [matches, setMatches] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScores() {
      try {
        const response = await fetch("/api/live-scores");
        const data = await response.json();
        setMatches(Array.isArray(data?.matches) ? data.matches : []);
      } catch (e) {
        console.error(e);
        setMatches([]);
      }
      setLoading(false);
    }
    fetchScores();
  }, []);

  if (loading) {
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--text-secondary)]" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-[var(--text-primary)]">Live Scores</h3>
        </div>
        <Link href={createPageUrl("LiveScores")} className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-500">
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {(!matches || matches.length === 0) && (
          <div className="px-5 py-6 text-center text-sm text-[var(--text-secondary)]">
            Live scores are unavailable right now.
          </div>
        )}
        {(matches || []).slice(0, 5).map((m, i) => (
          <div key={i} className="px-5 py-3 hover:bg-[var(--bg-secondary)] transition-colors">
            <div className="text-[10px] text-[var(--text-secondary)] mb-1 flex items-center gap-2">
              {m.league}
              {m.status?.toLowerCase().includes("live") && (
                <span className="flex items-center gap-1 text-red-500 font-semibold">
                  <Circle className="w-2 h-2 fill-red-500" /> LIVE
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium flex-1 truncate">{m.home_team}</span>
              <div className="flex items-center gap-2 px-3 py-0.5 bg-[var(--bg-secondary)] rounded-lg font-bold text-base min-w-[60px] justify-center">
                <span>{m.home_score ?? "-"}</span>
                <span className="text-[var(--text-secondary)]">:</span>
                <span>{m.away_score ?? "-"}</span>
              </div>
              <span className="font-medium flex-1 truncate text-right">{m.away_team}</span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1 text-center">{m.status} {m.time && `• ${m.time}`}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { base44 } from "@/api/base44Client";
import { Trophy, ArrowRight, Loader2, Circle } from "lucide-react";

export default function LiveScoresWidget() {
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScores() {
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: "Give me the latest 5 football (soccer) match results or live matches from today or the most recent match day. Include team names, scores, league name, and match status (live, finished, or upcoming with time).",
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              matches: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    home_team: { type: "string" },
                    away_team: { type: "string" },
                    home_score: { type: "number" },
                    away_score: { type: "number" },
                    league: { type: "string" },
                    status: { type: "string" },
                    time: { type: "string" }
                  }
                }
              }
            }
          }
        });
        setMatches(res.matches || []);
      } catch (e) {
        console.error(e);
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
        <Link to={createPageUrl("LiveScores")} className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-500">
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-[var(--border)]">
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
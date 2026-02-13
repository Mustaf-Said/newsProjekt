"use client";

import { useEffect, useState } from "react";
import { Trophy, Circle, Loader2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LiveScores() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLeague, setFilterLeague] = useState("all");

  const fetchScores = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/live-scores");
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (e) {
      console.error(e);
      setMatches([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchScores(); }, []);

  const leagues = ["all", ...new Set(matches.map((m) => m.league).filter(Boolean))];
  const filtered = filterLeague === "all" ? matches : matches.filter((m) => m.league === filterLeague);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-primary)]">Live Scores</h1>
            <p className="text-sm text-[var(--text-secondary)]">Real-time football match results</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchScores} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="mb-6">
        <Select value={filterLeague} onValueChange={setFilterLeague}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by League" />
          </SelectTrigger>
          <SelectContent>
            {leagues.map((l) => (
              <SelectItem key={l} value={l}>{l === "all" ? "All Leagues" : l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">{m.league}</span>
                <div className="flex items-center gap-2">
                  {m.status?.toUpperCase().includes("LIVE") && (
                    <span className="flex items-center gap-1 text-xs font-bold text-red-500">
                      <Circle className="w-2 h-2 fill-red-500" /> LIVE {m.minute}
                    </span>
                  )}
                  {m.status?.toUpperCase() === "FT" && (
                    <span className="text-xs font-bold text-[var(--text-secondary)]">Full Time</span>
                  )}
                  {!m.status?.toUpperCase().includes("LIVE") && m.status?.toUpperCase() !== "FT" && (
                    <span className="text-xs text-[var(--text-secondary)]">{m.status} {m.minute}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-bold text-[var(--text-primary)]">{m.home_team}</p>
                </div>
                <div className="flex items-center gap-3 px-6 py-2 bg-[var(--bg-secondary)] rounded-xl">
                  <span className="text-2xl font-black text-[var(--text-primary)]">{m.home_score ?? "-"}</span>
                  <span className="text-lg text-[var(--text-secondary)]">-</span>
                  <span className="text-2xl font-black text-[var(--text-primary)]">{m.away_score ?? "-"}</span>
                </div>
                <div className="flex-1 text-right">
                  <p className="font-bold text-[var(--text-primary)]">{m.away_team}</p>
                </div>
              </div>
              {m.stadium && <p className="text-[10px] text-[var(--text-secondary)] mt-2 text-center">{m.stadium}</p>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

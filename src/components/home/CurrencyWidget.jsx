import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DollarSign, TrendingUp, TrendingDown, Loader2 } from "lucide-react";

export default function CurrencyWidget() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: "Give me the latest currency exchange rates for USD base. Include EUR, GBP, JPY, CHF, CAD, AUD. For each give the rate and whether it's up or down compared to yesterday.",
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              base: { type: "string" },
              date: { type: "string" },
              rates: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    currency: { type: "string" },
                    rate: { type: "number" },
                    trend: { type: "string", enum: ["up", "down", "stable"] }
                  }
                }
              }
            }
          }
        });
        setRates(res);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchRates();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!rates) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-white/70">Exchange Rates</p>
          <p className="text-lg font-bold">USD Base</p>
        </div>
        <DollarSign className="w-6 h-6 text-white/80" />
      </div>
      <div className="space-y-2.5">
        {(rates.rates || []).slice(0, 6).map((r, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="font-medium">{r.currency}</span>
            <div className="flex items-center gap-2">
              <span className="font-bold">{r.rate?.toFixed(4)}</span>
              {r.trend === "up" ? (
                <TrendingUp className="w-3.5 h-3.5 text-green-300" />
              ) : r.trend === "down" ? (
                <TrendingDown className="w-3.5 h-3.5 text-red-300" />
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-white/50 mt-3">{rates.date}</p>
    </div>
  );
}
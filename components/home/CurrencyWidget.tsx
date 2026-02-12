"use client";

import { useEffect, useState } from "react";
import { DollarSign, Loader2, ArrowUpRight } from "lucide-react";

type RatesState = {
  base: string;
  timestamp: string | null;
  rates: Record<string, number>;
};

const DEFAULT_RATES: RatesState = {
  base: "USD",
  timestamp: null,
  rates: {},
};

const CURRENCY_LIST = ["EUR", "GBP", "NGN", "KES", "JPY"];

export default function CurrencyWidget() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RatesState>(DEFAULT_RATES);

  useEffect(() => {
    async function fetchRates() {
      try {
        const apiKey = process.env.NEXT_PUBLIC_EXCHANGERATE_API_KEY;

        // Fallback rates if API fails
        const fallbackRates = {
          EUR: 0.92,
          GBP: 0.79,
          NGN: 1549.50,
          KES: 129.50,
          JPY: 149.75,
        };

        if (!apiKey) {
          console.log("[CurrencyWidget] No API key found, using fallback rates");
          setData({
            base: "USD",
            timestamp: new Date().toISOString().split("T")[0],
            rates: fallbackRates,
          });
          setLoading(false);
          return;
        }

        const url = new URL("https://v6.exchangerate-api.com/v6/" + apiKey + "/latest/USD");
        const res = await fetch(url.toString());
        const json = await res.json();

        if (!json || json.result === "error") {
          console.log("[CurrencyWidget] API failed, using fallback rates");
          setData({
            base: "USD",
            timestamp: new Date().toISOString().split("T")[0],
            rates: fallbackRates,
          });
          setLoading(false);
          return;
        }

        const rates: Record<string, number> = {};
        CURRENCY_LIST.forEach((currency) => {
          rates[currency] = json.conversion_rates?.[currency] || fallbackRates[currency as keyof typeof fallbackRates];
        });

        setData({
          base: "USD",
          timestamp: new Date().toISOString().split("T")[0],
          rates,
        });
      } catch (e) {
        console.error("[CurrencyWidget] Error:", e);
        setError("Unable to load currency rates.");
      } finally {
        setLoading(false);
      }
    }

    fetchRates();
  }, []);

  if (loading) {
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--text-secondary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 h-48 flex items-center justify-center text-sm text-[var(--text-secondary)]">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-[var(--text-primary)]">FX Rates</h3>
        </div>
        <div className="text-xs text-[var(--text-secondary)]">Base {data.base}</div>
      </div>
      <div className="p-5 space-y-3">
        {CURRENCY_LIST.map((code) => (
          <div key={code} className="flex items-center justify-between">
            <div className="text-sm font-semibold text-[var(--text-primary)]">{code}</div>
            <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
              {typeof data.rates[code] === "number" ? data.rates[code].toFixed(2) : "--"}
            </div>
          </div>
        ))}
        <div className="pt-2 text-[10px] text-[var(--text-secondary)]">
          {data.timestamp ? `Updated ${data.timestamp}` : ""}
        </div>
      </div>
    </div>
  );
}

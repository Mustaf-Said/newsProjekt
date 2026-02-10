import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Thermometer, Loader2 } from "lucide-react";

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: "Give me the current weather for a major global city (New York). Include temperature in celsius, condition (sunny/cloudy/rainy/snowy), humidity percentage, wind speed in km/h, and a 3-day forecast with day name, temp, and condition.",
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              city: { type: "string" },
              temperature: { type: "number" },
              condition: { type: "string" },
              humidity: { type: "number" },
              wind_speed: { type: "number" },
              forecast: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    day: { type: "string" },
                    temp: { type: "number" },
                    condition: { type: "string" }
                  }
                }
              }
            }
          }
        });
        setWeather(res);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchWeather();
  }, []);

  const getIcon = (condition) => {
    const c = (condition || "").toLowerCase();
    if (c.includes("rain")) return <CloudRain className="w-6 h-6" />;
    if (c.includes("snow")) return <CloudSnow className="w-6 h-6" />;
    if (c.includes("cloud") || c.includes("overcast")) return <Cloud className="w-6 h-6" />;
    return <Sun className="w-6 h-6" />;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-6 text-white flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-white/70">Weather</p>
          <p className="text-lg font-bold">{weather.city}</p>
        </div>
        <div className="text-white/80">{getIcon(weather.condition)}</div>
      </div>
      <div className="flex items-end gap-2 mb-4">
        <span className="text-5xl font-black">{weather.temperature}°</span>
        <span className="text-sm text-white/80 mb-2">{weather.condition}</span>
      </div>
      <div className="flex gap-4 text-xs text-white/70 mb-4">
        <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5" /> {weather.humidity}%</span>
        <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5" /> {weather.wind_speed} km/h</span>
      </div>
      {weather.forecast && (
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/20">
          {weather.forecast.slice(0, 3).map((f, i) => (
            <div key={i} className="text-center">
              <p className="text-xs text-white/60">{f.day}</p>
              <div className="flex justify-center my-1">{getIcon(f.condition)}</div>
              <p className="text-sm font-bold">{f.temp}°</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
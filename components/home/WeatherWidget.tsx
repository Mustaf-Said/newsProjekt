"use client";

import { useEffect, useState } from "react";
import { CloudSun, Loader2, MapPin, Wind } from "lucide-react";

const DEFAULT_COORDS = { lat: 40.7128, lon: -74.006 };
const DEFAULT_CITY = "New York";

const weatherCodeMap: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

type WeatherState = {
  city: string;
  temperature: number | null;
  feelsLike: number | null;
  humidity: number | null;
  wind: number | null;
  condition: string;
  updatedAt: string | null;
};

export default function WeatherWidget() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherState>({
    city: DEFAULT_CITY,
    temperature: null,
    feelsLike: null,
    humidity: null,
    wind: null,
    condition: "",
    updatedAt: null,
  });

  useEffect(() => {
    async function fetchWeather(lat: number, lon: number, city: string) {
      try {
        const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}`);
        const json = await res.json();

        setWeather({
          city: json.city,
          temperature: json.temperature,
          feelsLike: json.feelsLike,
          humidity: json.humidity,
          wind: json.wind,
          condition: json.condition,
          updatedAt: json.updatedAt,
        });
      } catch (e) {
        console.error(e);
        setError("Unable to load weather data.");
      } finally {
        setLoading(false);
      }
    }

    async function resolveCity(lat: number, lon: number) {
      try {
        const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/reverse");
        geoUrl.searchParams.set("latitude", String(lat));
        geoUrl.searchParams.set("longitude", String(lon));
        geoUrl.searchParams.set("count", "1");

        const res = await fetch(geoUrl.toString());
        const json = await res.json();
        const place = json?.results?.[0];
        return place?.name || DEFAULT_CITY;
      } catch {
        return DEFAULT_CITY;
      }
    }

    if (!navigator.geolocation) {
      fetchWeather(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon, DEFAULT_CITY);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const city = await resolveCity(lat, lon);
        fetchWeather(lat, lon, city);
      },
      () => {
        fetchWeather(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon, DEFAULT_CITY);
      },
      { timeout: 6000 }
    );
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
          <CloudSun className="w-5 h-5 text-sky-500" />
          <h3 className="font-bold text-[var(--text-primary)]">Weather</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
          <MapPin className="w-3 h-3" />
          {weather.city}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-[var(--text-secondary)] mb-1">{weather.condition}</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-[var(--text-primary)]">
                {weather.temperature !== null ? Math.round(weather.temperature) : "--"}°C
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                Feels {weather.feelsLike !== null ? Math.round(weather.feelsLike) : "--"}°C
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--text-secondary)]">Humidity</p>
            <p className="text-lg font-semibold text-[var(--text-primary)]">
              {weather.humidity !== null ? weather.humidity : "--"}%
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-1">
            <Wind className="w-3 h-3" />
            {weather.wind !== null ? `${Math.round(weather.wind)} km/h` : "--"} wind
          </div>
          <div>{weather.updatedAt ? `Updated ${new Date(weather.updatedAt).toLocaleTimeString()}` : ""}</div>
        </div>
      </div>
    </div>
  );
}

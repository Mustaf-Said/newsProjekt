import { NextResponse } from "next/server";

const DEFAULT_CITY = "New York";
const DEFAULT_COORDS = { lat: 40.7128, lon: -74.006 };

const weatherCodeMap: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Foggy",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || String(DEFAULT_COORDS.lat));
    const lon = parseFloat(searchParams.get("lon") || String(DEFAULT_COORDS.lon));
    const city = searchParams.get("city") || DEFAULT_CITY;

    // Fallback weather data
    const fallbackWeather = {
      city,
      temperature: 22,
      feelsLike: 20,
      humidity: 65,
      wind: 12,
      condition: "Clear sky",
      updatedAt: new Date().toISOString(),
    };

    try {
      // Fetch weather from Open-Meteo API
      const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
      weatherUrl.searchParams.set("latitude", String(lat));
      weatherUrl.searchParams.set("longitude", String(lon));
      weatherUrl.searchParams.set(
        "current",
        "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m"
      );
      weatherUrl.searchParams.set("timezone", "auto");

      const weatherRes = await fetch(weatherUrl.toString(), {
        headers: { "User-Agent": "NewsProject/1.0" },
      });

      if (!weatherRes.ok) {
        console.log("[weather] API failed, using fallback data");
        return NextResponse.json(fallbackWeather);
      }

      const weatherData = await weatherRes.json();
      const current = weatherData?.current;

      if (!current) {
        return NextResponse.json(fallbackWeather);
      }

      return NextResponse.json({
        city,
        temperature: typeof current.temperature_2m === "number" ? current.temperature_2m : 22,
        feelsLike: typeof current.apparent_temperature === "number" ? current.apparent_temperature : 20,
        humidity: typeof current.relative_humidity_2m === "number" ? current.relative_humidity_2m : 65,
        wind: typeof current.wind_speed_10m === "number" ? current.wind_speed_10m : 12,
        condition: weatherCodeMap[current.weather_code] || "Current conditions",
        updatedAt: current.time || new Date().toISOString(),
      });
    } catch (apiError) {
      console.log("[weather] Error fetching from API:", apiError);
      return NextResponse.json(fallbackWeather);
    }
  } catch (error) {
    console.error("[weather] Error:", error);
    return NextResponse.json(
      {
        city: DEFAULT_CITY,
        temperature: 22,
        feelsLike: 20,
        humidity: 65,
        wind: 12,
        condition: "Clear sky",
        updatedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}

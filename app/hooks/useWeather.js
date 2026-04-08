"use client";
import { useState, useEffect } from "react";

const WMO_ICONS = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌧️", 61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "🌨️", 73: "🌨️", 75: "🌨️", 80: "🌦️", 81: "🌧️", 82: "🌧️",
  85: "🌨️", 86: "🌨️", 95: "⛈️", 96: "⛈️", 99: "⛈️",
};

const WEATHER_TINTS = {
  sunny: "rgba(255,200,50,0.1)", rainy: "rgba(50,100,200,0.15)",
  cloudy: "rgba(150,150,150,0.1)", snowy: "rgba(200,220,255,0.12)",
};

function getWeatherTint(code) {
  if (code === 0 || code === 1) return WEATHER_TINTS.sunny;
  if (code >= 51 && code <= 82) return WEATHER_TINTS.rainy;
  if (code >= 71 && code <= 86) return WEATHER_TINTS.snowy;
  return WEATHER_TINTS.cloudy;
}

export default function useWeather() {
  const [forecast, setForecast] = useState({}); // { "2026-04-08": { icon, temp, code } }
  const [tint, setTint] = useState(null);

  useEffect(() => {
    let cancelled = false;
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max&timezone=auto&forecast_days=14`
          );
          const data = await res.json();
          if (cancelled) return;
          const map = {};
          data.daily?.time?.forEach((date, i) => {
            const code = data.daily.weathercode[i];
            map[date] = {
              icon: WMO_ICONS[code] || "🌡️",
              temp: Math.round(data.daily.temperature_2m_max[i]),
              code,
            };
          });
          setForecast(map);
          // Set tint from today's weather
          const todayCode = data.daily?.weathercode?.[0];
          if (todayCode !== undefined) setTint(getWeatherTint(todayCode));
        } catch (e) { console.error("Weather fetch failed:", e); }
      },
      () => {} // silently fail if no geolocation
    );
    return () => { cancelled = true; };
  }, []);

  return { forecast, tint };
}

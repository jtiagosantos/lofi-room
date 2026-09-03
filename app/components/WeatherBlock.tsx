"use client";

import { X, Search, Wind, Droplets, Thermometer, MapPin, Pencil } from "lucide-react";
import { useState, useEffect } from "react";

const STORAGE_KEY = "lofi-room:weather-cep";

type WeatherData = {
  city: string;
  state: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
};

type Props = {
  onClose: () => void;
};

function getWeatherDescription(code: number): string {
  if (code === 0) return "Céu limpo";
  if (code <= 3) return "Parcialmente nublado";
  if (code <= 9) return "Neblina";
  if (code <= 19) return "Precipitação leve";
  if (code <= 29) return "Tempestade";
  if (code <= 39) return "Neblina densa";
  if (code <= 49) return "Nevasca";
  if (code <= 59) return "Garoa";
  if (code <= 69) return "Chuva";
  if (code <= 79) return "Neve";
  if (code <= 84) return "Chuva moderada";
  if (code <= 94) return "Tempestade";
  return "Tempestade severa";
}

function getWeatherEmoji(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? "☀️" : "🌙";
  if (code <= 3) return isDay ? "⛅" : "🌤️";
  if (code <= 9) return "🌫️";
  if (code <= 69) return "🌧️";
  if (code <= 79) return "❄️";
  if (code <= 84) return "🌨️";
  return "⛈️";
}

function formatCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

export default function WeatherBlock({ onClose }: Props) {
  const [cep, setCep] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // On mount: load saved CEP and auto-fetch
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCep(formatCep(saved));
      fetchWeatherForCep(saved);
    } else {
      setEditing(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function fetchWeatherForCep(rawCep: string) {
    const cleanCep = rawCep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      setError("Informe um CEP válido com 8 dígitos.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. ViaCEP → cidade e estado
      const viaCepRes = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const viaCepData = await viaCepRes.json();
      if (viaCepData.erro) {
        setError("CEP não encontrado.");
        setLoading(false);
        return;
      }

      const city = viaCepData.localidade;
      const state = viaCepData.uf;

      // 2. Open-Meteo geocoding → lat/lon
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&country_code=BR&count=5&language=pt`
      );
      const geoData = await geoRes.json();
      const location =
        geoData.results?.find((r: { admin1?: string }) =>
          r.admin1?.toLowerCase().includes(state.toLowerCase())
        ) ?? geoData.results?.[0];

      if (!location) {
        setError("Não foi possível localizar a cidade.");
        setLoading(false);
        return;
      }

      const { latitude, longitude } = location;

      // 3. Open-Meteo weather → dados de clima
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&wind_speed_unit=kmh&timezone=America%2FSao_Paulo`
      );
      const weatherData = await weatherRes.json();
      const current = weatherData.current;

      setWeather({
        city,
        state,
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        weatherCode: current.weather_code,
        isDay: current.is_day === 1,
      });

      localStorage.setItem(STORAGE_KEY, cleanCep);
      setEditing(false);
    } catch {
      setError("Erro ao buscar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    fetchWeatherForCep(cep);
  }

  function handleEditLocation() {
    setEditing(true);
    setError(null);
  }

  return (
    <div style={{ display: "contents" }}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="weather-enter fixed z-50 flex flex-col overflow-hidden"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(90vw, 460px)",
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "20px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-white font-semibold text-base tracking-wide">Clima</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-5">

          {/* CEP input — shown when editing or no saved CEP */}
          {editing && (
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                placeholder="Digite seu CEP (ex: 01310-100)"
                className="flex-1 bg-transparent text-white text-sm placeholder-white/30 outline-none px-3 py-2.5 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
                value={cep}
                onChange={(e) => setCep(formatCep(e.target.value))}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center justify-center w-11 h-11 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ border: "1px solid rgba(255,255,255,0.12)" }}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
                ) : (
                  <Search size={17} />
                )}
              </button>
            </div>
          )}

          {/* Loading spinner when fetching saved CEP */}
          {loading && !editing && (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-400/80 text-xs px-1">{error}</p>
          )}

          {/* Weather result */}
          {weather && !loading && (
            <div className="flex flex-col gap-4">
              {/* Location + main temp */}
              <div
                className="relative flex items-center justify-between px-4 py-4 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <button
                  onClick={handleEditLocation}
                  className="absolute top-3 right-3 text-white/30 hover:text-white/70 transition-colors cursor-pointer"
                  title="Alterar localização"
                >
                  <Pencil size={16} />
                </button>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-white/50 text-xs">
                    <MapPin size={12} />
                    <span>{weather.city}, {weather.state}</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-white text-5xl font-light">{weather.temperature}°</span>
                    <span className="text-white/50 text-sm pb-1.5">C</span>
                  </div>
                  <span className="text-white/60 text-sm">{getWeatherDescription(weather.weatherCode)}</span>
                </div>
                <span className="text-6xl">{getWeatherEmoji(weather.weatherCode, weather.isDay)}</span>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: <Thermometer size={15} />, label: "Sensação", value: `${weather.feelsLike}°C` },
                  { icon: <Droplets size={15} />, label: "Umidade", value: `${weather.humidity}%` },
                  { icon: <Wind size={15} />, label: "Vento", value: `${weather.windSpeed} km/h` },
                ].map(({ icon, label, value }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <span className="text-white/40">{icon}</span>
                    <span className="text-white/40 text-xs">{label}</span>
                    <span className="text-white/80 text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

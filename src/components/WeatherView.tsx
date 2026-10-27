import React, { useState, useEffect } from 'react';
import { WeatherData, PlantProfile } from '../types';
import { audio } from '../utils/audio';
import { storage } from '../utils/storage';
import {
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Search,
  Compass,
  AlertCircle,
  Thermometer,
  ShieldAlert,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface WeatherViewProps {
  plant: PlantProfile;
  weather: WeatherData | null;
  onUpdateWeather: (data: WeatherData) => void;
}

export const WeatherView: React.FC<WeatherViewProps> = ({
  plant,
  weather,
  onUpdateWeather,
}) => {
  const [cityName, setCityName] = useState(storage.getWeatherCity());
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchWeather = async (city: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Geocode city using Open-Meteo geocoding API (free, no key needed)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );
      if (!geoRes.ok) throw new Error('Geocoding service unavailable');
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error(`Location "${city}" could not be resolved`);
      }

      const location = geoData.results[0];
      const { latitude, longitude, name, country } = location;

      // 2. Fetch Open-Meteo weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`
      );
      if (!weatherRes.ok) throw new Error('Weather forecast service error');
      const wData = await weatherRes.json();

      const current = wData.current;
      const tempC = Math.round(current.temperature_2m);
      const humidity = Math.round(current.relative_humidity_2m);
      const windKmh = Math.round(current.wind_speed_10m);
      const code = current.weather_code;
      const isDay = current.is_day === 1;

      const desc = getWeatherDescription(code);
      const advice = generateBotanicalAdvice(tempC, humidity, plant);

      const parsed: WeatherData = {
        city: `${name}${country ? ', ' + country : ''}`,
        country,
        tempC,
        humidity,
        uvIndex: isDay ? 6 : 0,
        weatherCode: code,
        description: desc,
        isDay,
        windKmh,
        careRecommendation: advice,
      };

      onUpdateWeather(parsed);
      storage.saveWeatherCity(city);
      setCityName(city);
      audio.playSuccessChime();
    } catch (err: any) {
      // Provide robust fallback weather data so UI never breaks
      setErrorMsg(err.message || 'Network request failed. Loaded simulated telemetry.');
      const fallback: WeatherData = {
        city: `${city} (Simulated)`,
        tempC: 21,
        humidity: 54,
        uvIndex: 5,
        weatherCode: 1,
        description: 'Mainly Clear',
        isDay: true,
        windKmh: 12,
        careRecommendation: generateBotanicalAdvice(21, 54, plant),
      };
      onUpdateWeather(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!weather) {
      fetchWeather(cityName);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    audio.playBeep(650, 0.05);
    fetchWeather(searchInput.trim());
    setSearchInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 font-mono">
            <Sun className="w-5 h-5 text-amber-400" />
            OUTDOOR CLIMATE & METEOROLOGY
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Open-Meteo global meteorological link for localized microclimate plant calibration
          </p>
        </div>

        {/* City Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search city (e.g. London, Tokyo)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono w-48 sm:w-64"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-mono font-medium text-white transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Lookup'}
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-950/30 border border-amber-800/40 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {weather && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Weather Card */}
          <div className="md:col-span-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5 mb-1">
                  <Compass className="w-3.5 h-3.5" /> METEOROLOGICAL STATION
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-mono text-slate-100">{weather.city}</h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">{weather.description}</p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                {weather.weatherCode >= 51 ? (
                  <CloudRain className="w-7 h-7 text-cyan-400" />
                ) : weather.weatherCode >= 1 ? (
                  <Cloud className="w-7 h-7 text-slate-300" />
                ) : (
                  <Sun className="w-7 h-7 text-amber-400" />
                )}
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black font-mono text-white tracking-tighter">
                {weather.tempC}°
              </span>
              <span className="text-lg font-mono text-slate-400">CELSIUS</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-slate-800">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">HUMIDITY</span>
                <span className="text-sm font-bold font-mono text-cyan-300 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" /> {weather.humidity}%
                </span>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">WIND SPEED</span>
                <span className="text-sm font-bold font-mono text-slate-200 flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-slate-400" /> {weather.windKmh} km/h
                </span>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">DAY / NIGHT</span>
                <span className="text-sm font-bold font-mono text-amber-300">
                  {weather.isDay ? 'Daylight' : 'Nocturnal'}
                </span>
              </div>
            </div>
          </div>

          {/* Plant Impact & Tailored Care Recommendation Card */}
          <div className="md:col-span-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-2">
                <Sparkles className="w-4 h-4" />
                <span>BOTANICAL MICROCLIMATE ADVISORY FOR {plant.name.toUpperCase()}</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-100 font-mono">
                Impact on {plant.species} ({plant.indoor ? 'Indoor pot' : 'Outdoor garden'})
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans mt-3 whitespace-pre-wrap">
                {weather.careRecommendation}
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
              <Thermometer className="w-5 h-5 text-cyan-400 shrink-0" />
              <div className="text-xs font-mono text-slate-300">
                <span>Vapor Pressure Deficit (VPD): </span>
                <span className="text-cyan-400 font-bold">
                  {((1 - weather.humidity / 100) * 1.5).toFixed(2)} kPa
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Foliar transpiration rate is{' '}
                  {weather.humidity < 40 ? 'elevated (mist advised)' : 'well-balanced'}.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Weather code description mapper per WMO codes
function getWeatherDescription(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 45 && code <= 48) return 'Foggy / Atmospheric haze';
  if (code >= 51 && code <= 55) return 'Drizzle precipitation';
  if (code >= 61 && code <= 65) return 'Rainfall';
  if (code >= 71 && code <= 77) return 'Snow showers';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 95) return 'Thunderstorm activity';
  return 'Stable conditions';
}

function generateBotanicalAdvice(tempC: number, humidity: number, plant: PlantProfile): string {
  let advice = '';

  if (humidity < 40) {
    advice += `⚠️ Low ambient humidity (${humidity}%). For ${plant.species}, air this dry will cause tip browning and rapid evapotranspiration. Increase misting frequency or place on a pebble tray.\n\n`;
  } else if (humidity > 70) {
    advice += `💧 High ambient humidity (${humidity}%). Excellent natural moisture for ferns and aroids! Soil drying time will be prolonged, so refrain from premature watering.\n\n`;
  } else {
    advice += `✅ Optimal humidity range (${humidity}%). Foliar respiration is stable.\n\n`;
  }

  if (tempC > 28) {
    advice += `☀️ High ambient temperature (${tempC}°C). Check soil hydration daily; water absorption will accelerate by ~30%. Keep indirect-light plants shielded from harsh noon thermal radiation.`;
  } else if (tempC < 14) {
    advice += `❄️ Cool temperature (${tempC}°C). Growth slows down into semi-dormancy. Shield from cold window drafts and cut back watering frequency to prevent cold root rot.`;
  } else {
    advice += `🌿 Moderate temperature (${tempC}°C). Ideal range for active photosynthesis and steady root uptake.`;
  }

  return advice;
}

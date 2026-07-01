import React, { useState, useEffect, useRef } from "react";
import { 
  GeoCity, 
  WeatherData, 
  WeatherIntelligenceResponse, 
  getWeatherCondition 
} from "./types";
import { WeatherIcon } from "./components/WeatherIcons";
import { AIPanel } from "./components/AIPanel";
import { WeatherStats } from "./components/WeatherStats";
import { ForecastList } from "./components/ForecastList";
import { motion, AnimatePresence } from "motion/react";
import { analyzeWeatherTelemetry } from "./lib/weatherRules";

export default function App() {
  // Query state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoCity[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchHistory, setSearchHistory] = useState<GeoCity[]>(() => {
    try {
      const saved = localStorage.getItem("weather_search_history_v1");
      return saved ? JSON.parse(saved) : [
        { id: 2618425, name: "Copenhagen", latitude: 55.6759, longitude: 12.5655, country: "Denmark", country_code: "DK" }
      ];
    } catch {
      return [{ id: 2618425, name: "Copenhagen", latitude: 55.6759, longitude: 12.5655, country: "Denmark", country_code: "DK" }];
    }
  });

  // Selected Location and Data
  const [selectedCity, setSelectedCity] = useState<GeoCity>(() => {
    return searchHistory[0] || { id: 2618425, name: "Copenhagen", latitude: 55.6759, longitude: 12.5655, country: "Denmark", country_code: "DK" };
  });

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<WeatherIntelligenceResponse | null>(null);

  // States
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [isAnalyzingWeather, setIsAnalyzingWeather] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic digital clock
  const [currentTime, setCurrentTime] = useState("");
  const [currentDateString, setCurrentDateString] = useState("");

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Clock Update Effect
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour12: false }));
      setCurrentDateString(now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("weather_search_history_v1", JSON.stringify(searchHistory));
    } catch (e) {
      console.warn("Storage write failed:", e);
    }
  }, [searchHistory]);

  // Click outside listener for search suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch weather data whenever selected city updates
  useEffect(() => {
    if (selectedCity) {
      fetchWeatherDataSequence(selectedCity);
    }
  }, [selectedCity]);

  // Handle auto-suggest search queries dynamically (with a 400ms debounce)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchGeocodingApi(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchGeocodingApi = async (query: string) => {
    setIsSearchingCities(true);
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Geocoding service error");
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err: any) {
      console.error("Geocoding failed:", err);
    } finally {
      setIsSearchingCities(false);
    }
  };

  const fetchWeatherDataSequence = async (city: GeoCity) => {
    setIsFetchingWeather(true);
    setErrorMessage(null);
    setLoadingStep("Connecting meteorological sensors...");

    try {
      // 1. Fetch current metrics and 7-day metrics from Open-Meteo
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`;
      
      const response = await fetch(weatherUrl);
      if (!response.ok) {
        throw new Error("Unable to retrieve remote sensor telemetry. Please try again.");
      }

      const weatherPayload: WeatherData = await response.json();
      setWeatherData(weatherPayload);

      // Add to search history if not present (keep unique, max 5)
      setSearchHistory(prev => {
        const filtered = prev.filter(item => item.id !== city.id);
        const updated = [city, ...filtered].slice(0, 5);
        return updated;
      });

      // 2. Perform Meteorological rule intelligence evaluation client side instantly
      setIsAnalyzingWeather(true);
      setLoadingStep("Calibrating atmospheric telemetry parameters...");

      // Simulate a small transition delay for gorgeous UX telemetry analysis feel
      await new Promise(resolve => setTimeout(resolve, 500));

      const analysisResult = analyzeWeatherTelemetry(
        `${city.name}${city.country ? `, ${city.country}` : ""}`, 
        weatherPayload
      );
      setAiAnalysis(analysisResult);

    } catch (err: any) {
      console.error("Fetch weather flow failure:", err);
      setErrorMessage(err.message || "An unexpected communication fault occurred.");
    } finally {
      setIsFetchingWeather(false);
      setIsAnalyzingWeather(false);
      setLoadingStep("");
    }
  };

  const selectSuggestedCity = (city: GeoCity) => {
    setSelectedCity(city);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser or iframe environment.");
      return;
    }

    setLoadingStep("Acquiring GPS latitude/longitude...");
    setIsFetchingWeather(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Perform full reverse lookup lookup with BigDataCloud and Nominatim (OpenStreetMap)
          setLoadingStep("Resolving spatial coordinate names...");
          
          let resolvedCityName = "";
          let resolvedCountry = "";
          let resolvedCountryCode = "";

          try {
            const reverseRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            if (reverseRes.ok) {
              const reverseData = await reverseRes.json();
              resolvedCityName = reverseData.city || reverseData.locality || reverseData.principalSubdivision || "";
              resolvedCountry = reverseData.countryName || "";
              resolvedCountryCode = reverseData.countryCode || "";
            }
          } catch (e) {
            console.warn("BigDataCloud reverse geocode failed, falling back to Nominatim", e);
          }

          if (!resolvedCityName) {
            try {
              const reverseRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
              if (reverseRes.ok) {
                const reverseData = await reverseRes.json();
                const address = reverseData.address || {};
                resolvedCityName = address.city || address.town || address.village || address.suburb || address.county || "";
                resolvedCountry = address.country || "";
                resolvedCountryCode = (address.country_code || "").toUpperCase();
              }
            } catch (e) {
              console.warn("Nominatim reverse geocode failed", e);
            }
          }

          // Ultimate clean coordinate fallback if APIs return nothing
          if (!resolvedCityName) {
            resolvedCityName = `Zone [${latitude.toFixed(3)}, ${longitude.toFixed(3)}]`;
            resolvedCountry = "Unknown State";
            resolvedCountryCode = "LOC";
          }

          const localCity: GeoCity = {
            id: Math.floor(Math.random() * 1000000),
            name: resolvedCityName,
            latitude,
            longitude,
            country: resolvedCountry,
            country_code: resolvedCountryCode || "LOC"
          };
          
          setSelectedCity(localCity);
        } catch (err: any) {
          console.error("Reverse lookup failed:", err);
          const fallbackCity: GeoCity = {
            id: Date.now(),
            name: `Grid [${latitude.toFixed(2)}, ${longitude.toFixed(2)}]`,
            latitude,
            longitude,
            country: "GPS Coordinates",
            country_code: "LOC"
          };
          setSelectedCity(fallbackCity);
        } finally {
          setIsFetchingWeather(false);
        }
      },
      (err) => {
        console.error(err);
        setErrorMessage("Geolocation request denied or timed out. Please check permissions.");
        setIsFetchingWeather(false);
      },
      { timeout: 7000 }
    );
  };

  // Safe variables for metrics
  const activeCondition = weatherData?.current?.weather_code !== undefined
    ? getWeatherCondition(weatherData.current.weather_code)
    : null;

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-[#E2E8F0] font-sans antialiased pb-12 flex flex-col">
      
      {/* 1. Cockpit Header (Strictly Styled per Theme) */}
      <header className="h-20 shrink-0 flex items-center justify-between px-6 lg:px-12 border-b border-[#1E293B] bg-[#0F172A] relative z-40">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="text-xl md:text-2xl font-bold font-display tracking-tight text-white">
                {selectedCity.name}{selectedCity.country ? `, ${selectedCity.country_code || selectedCity.country}` : ""}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {isFetchingWeather || isAnalyzingWeather ? "REFRESHING" : "LIVE TELEMETRY"}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono tracking-wide">
              Meteorological Intelligence Engine v4.2 • Lat {selectedCity.latitude.toFixed(4)} Lng {selectedCity.longitude.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Dynamic Digital Clock & Date Display */}
        <div className="text-right hidden sm:block">
          <div className="text-2xl md:text-3xl font-light font-mono text-slate-100 tracking-wider">
            {currentTime || "12:00:00"}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
            {currentDateString || "Today"}
          </div>
        </div>
      </header>

      {/* 2. Top control panel for navigation and searching */}
      <section className="bg-[#0F172A]/70 border-b border-[#1E293B]/80 py-4 px-6 lg:px-12 relative z-30 select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Quick history anchors */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 flex items-center gap-1.5 mr-1">
              <WeatherIcon name="History" size={12} className="text-slate-400" />
              Recent Targets:
            </span>
            {searchHistory.map((hist) => (
              <button
                key={hist.id}
                onClick={() => setSelectedCity(hist)}
                disabled={isFetchingWeather}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  selectedCity.id === hist.id
                    ? "bg-indigo-500/10 border-indigo-400/50 text-indigo-300"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800/60"
                }`}
              >
                {hist.name}
              </button>
            ))}
          </div>

          {/* Location search cockpit with interactive Geolocation resolver */}
          <div ref={searchContainerRef} className="relative w-full md:w-80">
            <div className="relative">
              <input
                type="text"
                placeholder="Search geographical grid..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (searchResults.length > 0) {
                      selectSuggestedCity(searchResults[0]);
                    }
                  }
                }}
                className="w-full pl-9 pr-24 py-2 bg-slate-950 border border-[#334155] rounded-xl text-xs font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <WeatherIcon name="Search" size={14} />
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {isSearchingCities ? (
                  <span className="w-4 h-4 rounded-full border border-t-indigo-400 animate-spin shrink-0" />
                ) : (
                  <button
                    onClick={handleGeolocation}
                    title="Find current position using GPS coordinates"
                    className="p-1 text-slate-400 hover:text-indigo-400 bg-slate-900 rounded-md border border-slate-800 transition-colors"
                  >
                    <WeatherIcon name="Navigation" size={12} />
                  </button>
                )}
                <span className="text-[10px] bg-slate-800 border border-slate-700 font-bold px-1.5 py-0.5 rounded text-slate-400">
                  CTRL+K
                </span>
              </div>
            </div>

            {/* Auto Suggestions Dropdown Panel */}
            <AnimatePresence>
              {showSearchResults && (searchResults.length > 0 || isSearchingCities) && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 top-full mt-2 w-full bg-[#111827] border border-[#334155] rounded-xl shadow-2xl p-2 z-50 overflow-hidden"
                >
                  <p className="text-[10px] font-mono select-none px-2 py-1 border-b border-slate-800 text-slate-400/80 mb-1">
                    SUGGESTED SPATIAL TARGETS
                  </p>
                  <div className="max-h-60 overflow-y-auto space-y-0.5">
                    {searchResults.map((city) => (
                      <button
                        key={`${city.id}-${city.latitude}`}
                        onClick={() => selectSuggestedCity(city)}
                        className="w-full text-left p-2 hover:bg-slate-800/80 rounded-lg flex items-center justify-between text-xs transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 group-hover:text-indigo-400">
                            <WeatherIcon name="MapPin" size={12} />
                          </span>
                          <div>
                            <span className="font-semibold text-slate-200">{city.name}</span>
                            {city.country && <span className="text-[10px] text-slate-400 ml-1">({city.country_code || city.country})</span>}
                          </div>
                        </div>
                        <span className="font-mono text-[9px] text-slate-500">
                          {city.latitude.toFixed(2)}°N, {city.longitude.toFixed(2)}°E
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* 3. Error Warning Alerts Banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-500/10 border-b border-red-500/20 text-red-300 font-mono text-xs py-3 px-6 text-center shadow-inner relative z-10 flex items-center justify-center gap-2"
          >
            <WeatherIcon name="ShieldAlert" size={14} className="animate-bounce" />
            <span>METEOROLOGICAL_EXCEPTION: {errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="ml-4 underline hover:text-white font-semibold flex items-center gap-1"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Core Metric Grid Display (High Density Theme Layout) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* LEFT COLUMN: Current Condition Intelligence & Core Weather Stats */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Main Weather Card */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest text-[#94A3B8] uppercase">
                Sensor Telemetry
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-900 text-indigo-400 font-mono">
                CURRENT_GRID
              </span>
            </div>

            {weatherData?.current ? (
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-6xl font-bold tracking-tighter text-white font-display">
                      {weatherData.current.temperature_2m.toFixed(1)}°C
                    </h2>
                    <p className="text-sm font-medium text-indigo-300">
                      Real Feel: {weatherData.current.apparent_temperature.toFixed(1)}°C
                    </p>
                  </div>
                  
                  {activeCondition && (
                    <div className="flex flex-col items-center gap-1">
                      <div className={`p-4 bg-gradient-to-br ${activeCondition.bgGradient.split(" ")[0]} ${activeCondition.bgGradient.split(" ")[1]} rounded-2xl shadow-lg shadow-indigo-500/5`}>
                        <WeatherIcon name={activeCondition.iconName} size={42} className="text-slate-950" />
                      </div>
                      <span className="text-xs font-semibold text-slate-200 text-center mt-2">
                        {activeCondition.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Micro Narrative Box containing localized dynamic data description */}
                <div className="mt-6 p-4 bg-[#0F172A]/70 rounded-2xl border border-slate-700/50">
                  <p className="text-xs italic text-slate-300 leading-relaxed font-light">
                    "{aiAnalysis 
                      ? aiAnalysis.currentOverview 
                      : `Currently searching spatial vectors for ${selectedCity.name}. Sensor reads atmosphere temperature at ${weatherData.current.temperature_2m}°C with ambient wind speeds capping near ${weatherData.current.wind_speed_10m} km/h.`}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="w-10 h-10 rounded-full border border-t-indigo-400 animate-spin mb-4" />
                <p className="text-xs text-slate-400 font-mono">COLLECTING_ATMOSPHERE_PARAMETERS</p>
              </div>
            )}

            {/* Quick Metrics Subgrid on Left Panel */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-[#334155]/60">
              <div className="p-3 bg-slate-950/40 rounded-xl border border-[#334155]/50 hover:bg-slate-950/60 transition-colors">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Wind Speed</span>
                <p className="text-sm font-semibold text-white font-mono mt-0.5">
                  {weatherData?.current ? `${weatherData.current.wind_speed_10m.toFixed(1)} km/h` : "N/A"}
                </p>
                <span className="text-[9px] text-[#60A5FA] mt-0.5 block font-mono">ANEMOMETER</span>
              </div>
              <div className="p-3 bg-slate-950/40 rounded-xl border border-[#334155]/50 hover:bg-slate-950/60 transition-colors">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Humidity</span>
                <p className="text-sm font-semibold text-white font-mono mt-0.5">
                  {weatherData?.current ? `${weatherData.current.relative_humidity_2m}%` : "N/A"}
                </p>
                <span className="text-[9px] text-[#60A5FA] mt-0.5 block font-mono">HYGROMETER</span>
              </div>
              <div className="p-3 bg-slate-950/40 rounded-xl border border-[#334155]/50 hover:bg-slate-950/60 transition-colors">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Precipitation</span>
                <p className="text-sm font-semibold text-white font-mono mt-0.5">
                  {weatherData?.current ? `${weatherData.current.precipitation.toFixed(1)} mm` : "N/A"}
                </p>
                <span className="text-[9px] text-emerald-400 mt-0.5 block font-mono">PLUVIOMETER</span>
              </div>
              <div className="p-3 bg-slate-950/40 rounded-xl border border-[#334155]/50 hover:bg-slate-950/60 transition-colors">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Felt Temp</span>
                <p className="text-sm font-semibold text-white font-mono mt-0.5">
                  {weatherData?.current ? `${weatherData.current.apparent_temperature.toFixed(1)}°` : "N/A"}
                </p>
                <span className="text-[9px] text-[#60A5FA] mt-0.5 block font-mono">THERMAL_INDEX</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            {/* Quick Informational Tip */}
            <div className="p-4 bg-[#111827] border border-slate-800 rounded-2xl flex items-start gap-3">
              <span className="text-indigo-400 shrink-0 mt-0.5">
                <WeatherIcon name="Info" size={14} />
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                <strong className="text-slate-200 font-mono block mb-1">DATA RESOLUTION</strong>
                Open-Meteo updates sensor models globally. Real-time indices map hourly variables accurately to support hyper-local recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive 7-Day Forecast & Generative Agent Wisdom */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Header title block with live telemetry tracker */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-4">
              <span className="text-[10px] font-mono tracking-widest text-[#94A3B8] uppercase">
                7-Day Forecast Intelligence
              </span>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                Probability Distribution Trend (Precipitation)
              </span>
            </div>

            {weatherData?.daily ? (
              <div>
                {/* Visual horizontal list of columns containing weekly previews in high density design */}
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-3 mb-4">
                  {weatherData.daily.time.map((dayStr, idx) => {
                    const date = new Date(dayStr);
                    const weekName = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
                    const maxTemp = weatherData.daily.temperature_2m_max[idx];
                    const minTemp = weatherData.daily.temperature_2m_min[idx];
                    const dailyCode = weatherData.daily.weather_code[idx];
                    const dailyCondition = getWeatherCondition(dailyCode);
                    const dailyPrecip = weatherData.daily.precipitation_sum[idx];

                    return (
                      <div 
                        key={dayStr}
                        className={`bg-slate-900/60 rounded-xl p-3 text-center border transition-all ${
                          idx === 0 
                            ? "border-indigo-500/50 bg-indigo-950/10" 
                            : "border-slate-800/80 hover:border-slate-700"
                        }`}
                      >
                        <span className={`text-[10px] font-mono block ${idx === 0 ? "text-indigo-400 font-bold" : "text-slate-400"}`}>
                          {weekName}
                        </span>
                        
                        <div className="my-2.5 flex justify-center text-xl" title={dailyCondition.label}>
                          <WeatherIcon name={dailyCondition.iconName} className="text-slate-200" size={18} />
                        </div>

                        <div className="text-sm font-bold text-white tracking-tight">
                          {maxTemp.toFixed(0)}°
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {minTemp.toFixed(0)}°
                        </div>

                        {/* Interactive Spark visual line graph block mimicking mock up line graph with gradient opacity */}
                        <div className="h-6 bg-indigo-500/5 border border-indigo-500/10 rounded mt-3 relative overflow-hidden" title={`Rain sum: ${dailyPrecip.toFixed(1)}mm`}>
                          <div 
                            style={{ 
                              height: `${Math.min((dailyPrecip / 15) * 100 + 10, 100)}%`,
                              opacity: dailyPrecip > 0 ? 0.6 : 0.1
                            }}
                            className="absolute bottom-0 left-0 right-0 bg-indigo-400 transition-all duration-700"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mini trend info summary in 7-day visual card */}
                <div className="flex flex-col md:flex-row gap-4 text-xs bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  <div className="flex-1 border-r border-[#334155]/60 pr-4">
                    <span className="font-bold text-indigo-400 uppercase mr-2 font-mono">Intelligence:</span>
                    {aiAnalysis?.forecastBreakdown || "The system is currently computing atmospheric trends. Search for a specific spatial location above to trigger immediate deep meteorological evaluation with real telemetry."}
                  </div>
                  <div className="w-full md:w-1/3 flex flex-col justify-center gap-1">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-slate-400 uppercase">Avg High:</span>
                      <span className="font-mono text-slate-200 font-semibold">
                        {(weatherData.daily.temperature_2m_max.reduce((p, c) => p + c, 0) / 7).toFixed(1)}°C
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-slate-400 uppercase">Avg Low:</span>
                      <span className="font-mono text-slate-200 font-semibold">
                        {(weatherData.daily.temperature_2m_min.reduce((p, c) => p + c, 0) / 7).toFixed(1)}°C
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center">
                <p className="text-xs text-slate-500 font-mono">Forecast telemetry not currently initialized...</p>
              </div>
            )}
          </div>

          {/* AI Weather wisdom analysis details */}
          <AIPanel 
            analysis={aiAnalysis} 
            isLoading={isFetchingWeather || isAnalyzingWeather} 
            cityName={`${selectedCity.name}, ${selectedCity.country_code || selectedCity.country}`}
            loadingStep={loadingStep}
          />

          {/* BOTTOM BENTO GRAPHIC PANELS (Borders and left-hand glowing accent markers) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Clothing Bento */}
            <div className="bg-[#1E293B] border border-[#334155] border-l-4 border-l-[#3B82F6] rounded-xl p-5 flex flex-col justify-between shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">🧥</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono m-0">
                  Clothing Strategy
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed min-h-[4rem]">
                {aiAnalysis?.smartRecommendations.clothing || "Input coordinates to load real-time clothing metrics suited for today's forecast ranges."}
              </p>
            </div>

            {/* Activity bento */}
            <div className="bg-[#1E293B] border border-[#334155] border-l-4 border-l-[#F59E0B] rounded-xl p-5 flex flex-col justify-between shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">🚲</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono m-0">
                  Activity Optimizer
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed min-h-[4rem]">
                {aiAnalysis?.smartRecommendations.activities || "Outdoor sports availability, visibility levels, wind forecasts, and route conditions are evaluated on search."}
              </p>
            </div>

            {/* Warn bento */}
            <div className="bg-[#1E293B] border border-[#334155] border-l-4 border-l-[#EF4444] rounded-xl p-5 flex flex-col justify-between shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">⚠️</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono m-0">
                  Intelligence Advisory
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed min-h-[4rem]">
                {aiAnalysis?.smartRecommendations.alerts || "No severe indicators or active warning flags detected on initial grid check-in."}
              </p>
            </div>

          </div>

        </div>

      </main>

      {/* Footer System Status line */}
      <footer className="mt-auto border-t border-[#1E293B] py-4 px-6 md:px-12 bg-[#0F172A]/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
          <span>Weather Intelligence Cockpit • Version 4.2.1 • secure telemetry protocol enabled</span>
          <span>© {new Date().getFullYear()} • Global Geocoding Model (WMO_RESOLVE_ONLINE)</span>
        </div>
      </footer>

    </div>
  );
}

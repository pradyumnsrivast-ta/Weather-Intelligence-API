import React from "react";
import { WeatherData, getWeatherCondition } from "../types";
import { WeatherIcon } from "./WeatherIcons";
import { motion } from "motion/react";

interface ForecastListProps {
  dailyMetrics: WeatherData["daily"];
}

export function ForecastList({ dailyMetrics }: ForecastListProps) {
  // Translate ISO date strings (e.g. "2026-06-23") to beautifully formatted weekdays and dates
  const formatDay = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const shortDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    
    // Check if it is today
    const todayStr = new Date().toISOString().split("T")[0];
    if (dateStr === todayStr) {
      return { weekday: "Today", date: shortDate };
    }
    
    return { weekday: dayName, date: shortDate };
  };

  // Find the absolute highest and lowest temperatures across the entire week to calibrate the visual temperature bars
  const maxTempAvg = Math.max(...dailyMetrics.temperature_2m_max);
  const minTempAvg = Math.min(...dailyMetrics.temperature_2m_min);
  const totalRange = maxTempAvg - minTempAvg || 1;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-display font-semibold text-slate-800 flex items-center gap-2">
          <WeatherIcon name="Calendar" className="text-indigo-500" size={18} />
          <span>7-Day Future Forecast</span>
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          7_DAY_TELEMETRY
        </span>
      </div>

      <div className="space-y-3">
        {dailyMetrics.time.map((dateStr, idx) => {
          const { weekday, date } = formatDay(dateStr);
          const wmoCode = dailyMetrics.weather_code[idx];
          const cond = getWeatherCondition(wmoCode);
          const maxTemp = dailyMetrics.temperature_2m_max[idx];
          const minTemp = dailyMetrics.temperature_2m_min[idx];
          const maxWind = dailyMetrics.wind_speed_10m_max?.[idx] || 0;
          const precipSum = dailyMetrics.precipitation_sum?.[idx] || 0;

          // Calculate temperature range percentages for inline visualization bar
          const leftPercent = ((minTemp - minTempAvg) / totalRange) * 100;
          const widthPercent = ((maxTemp - minTemp) / totalRange) * 100;

          return (
            <motion.div
              key={dateStr}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between gap-4 p-3 rounded-2xl hover:bg-slate-50/70 transition-all border border-transparent hover:border-slate-100/50"
            >
              {/* Day info */}
              <div className="w-28 shrink-0">
                <p className="font-display font-semibold text-slate-800 text-sm">{weekday}</p>
                <p className="text-xs text-slate-400">{date}</p>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-3 w-32 shrink-0">
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${cond.bgGradient.split(" ")[0]} ${cond.bgGradient.split(" ")[1]} shrink-0 scale-90`}>
                  <WeatherIcon name={cond.iconName} className="text-slate-800" size={16} />
                </div>
                <span className="text-xs text-slate-600 font-medium truncate">{cond.label}</span>
              </div>

              {/* Temperature Bar Visualizer */}
              <div className="hidden sm:flex items-center gap-2 flex-grow mx-4">
                <span className="text-xs font-mono text-slate-400 w-8 text-right">{minTemp.toFixed(0)}°</span>
                <div className="relative h-1.5 bg-slate-100 rounded-full flex-grow overflow-hidden">
                  <div
                    style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                    className="absolute h-full bg-gradient-to-r from-orange-400 to-indigo-400 rounded-full"
                  />
                </div>
                <span className="text-xs font-mono text-slate-600 w-8 text-left font-medium">{maxTemp.toFixed(0)}°</span>
              </div>

              {/* Stats detail on right */}
              <div className="text-right w-20 shrink-0 space-y-0.5">
                <span className="inline-block sm:hidden text-xs font-semibold text-slate-700 font-mono mr-2">
                  {minTemp.toFixed(0)}°/{maxTemp.toFixed(0)}°
                </span>
                
                {precipSum > 0 ? (
                  <div className="flex items-center justify-end gap-1 text-[10px] text-blue-500 font-medium">
                    <WeatherIcon name="CloudRain" size={10} />
                    <span>{precipSum.toFixed(1)} mm</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-light">
                    <WeatherIcon name="Sun" size={10} />
                    <span>Dry</span>
                  </div>
                )}
                <div className="text-[10px] text-slate-400 font-mono">
                  🍃 {maxWind.toFixed(0)} km/h
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

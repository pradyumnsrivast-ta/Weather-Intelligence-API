import React from "react";
import { WeatherData } from "../types";
import { WeatherIcon } from "./WeatherIcons";
import { motion } from "motion/react";

interface WeatherStatsProps {
  currentMetrics: WeatherData["current"];
}

export function WeatherStats({ currentMetrics }: WeatherStatsProps) {
  const statsList = [
    {
      label: "Apparent Temp",
      value: `${currentMetrics.apparent_temperature.toFixed(1)}°C`,
      metric: `Felt thermal sensation`,
      icon: "Thermometer",
      colorClass: "bg-orange-500/10 text-orange-600",
      progress: Math.min(Math.max((currentMetrics.apparent_temperature + 10) / 50 * 100, 0), 100),
      progressColor: "bg-orange-500"
    },
    {
      label: "Humidity",
      value: `${currentMetrics.relative_humidity_2m}%`,
      metric: currentMetrics.relative_humidity_2m > 70 ? "High humidity levels" : currentMetrics.relative_humidity_2m < 30 ? "Dry ambient levels" : "Comfortable levels",
      icon: "Droplets",
      colorClass: "bg-blue-500/10 text-blue-600",
      progress: currentMetrics.relative_humidity_2m,
      progressColor: "bg-blue-500"
    },
    {
      label: "Wind Speed",
      value: `${currentMetrics.wind_speed_10m.toFixed(1)} km/h`,
      metric: currentMetrics.wind_speed_10m > 25 ? "Gale breeze warning" : currentMetrics.wind_speed_10m > 12 ? "Moderate wind speeds" : "Calm and peaceful",
      icon: "Wind",
      colorClass: "bg-emerald-500/10 text-emerald-600",
      progress: Math.min((currentMetrics.wind_speed_10m / 60) * 100, 100),
      progressColor: "bg-emerald-500"
    },
    {
      label: "Precipitation",
      value: `${currentMetrics.precipitation.toFixed(1)} mm`,
      metric: currentMetrics.precipitation > 2 ? "Active downpour" : currentMetrics.precipitation > 0 ? "Light drizzle/moisture" : "Completely dry",
      icon: "CloudRain",
      colorClass: "bg-indigo-500/10 text-indigo-600",
      progress: Math.min((currentMetrics.precipitation / 15) * 100, 100),
      progressColor: "bg-indigo-500"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statsList.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.08 }}
          className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">{stat.label}</span>
            <div className={`p-2 rounded-xl ${stat.colorClass}`}>
              <WeatherIcon name={stat.icon} size={16} />
            </div>
          </div>
          
          <div className="space-y-1 mt-1">
            <h4 className="text-2xl font-display font-semibold text-slate-800 tracking-tight">
              {stat.value}
            </h4>
            <p className="text-[11px] text-slate-400 font-light truncate">
              {stat.metric}
            </p>
          </div>

          {/* Spark Gauge Line */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${stat.progress}%` }}
              transition={{ duration: 1, delay: idx * 0.1 }}
              className={`h-full ${stat.progressColor} rounded-full`} 
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

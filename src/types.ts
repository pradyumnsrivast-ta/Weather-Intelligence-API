import { LucideIcon } from "lucide-react";

export interface GeoCity {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  admin1?: string;
  country?: string;
}

export interface GeocodingResponse {
  results?: GeoCity[];
  generationtime_ms?: number;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
  };
}

export interface WeatherIntelligenceResponse {
  currentOverview: string;
  forecastBreakdown: string;
  smartRecommendations: {
    clothing: string;
    activities: string;
    alerts: string;
  };
}

export interface WmoCodeDetails {
  label: string;
  iconName: string;
  bgGradient: string; // Tailwind bg gradient class
}

export function getWeatherCondition(code: number): WmoCodeDetails {
  // Map WMO codes: https://open-meteo.com/en/docs
  switch (code) {
    case 0:
      return { 
        label: "Clear Sky", 
        iconName: "Sun", 
        bgGradient: "from-amber-400 to-orange-500 text-amber-900" 
      };
    case 1:
      return { 
        label: "Mainly Clear", 
        iconName: "CloudSun", 
        bgGradient: "from-amber-200 to-yellow-400 text-yellow-900" 
      };
    case 2:
      return { 
        label: "Partly Cloudy", 
        iconName: "CloudSun", 
        bgGradient: "from-blue-200 to-sky-400 text-sky-950" 
      };
    case 3:
      return { 
        label: "Overcast", 
        iconName: "Cloud", 
        bgGradient: "from-slate-300 to-slate-400 text-slate-900" 
      };
    case 45:
    case 48:
      return { 
        label: "Foggy", 
        iconName: "CloudFog", 
        bgGradient: "from-zinc-300 to-zinc-400 text-zinc-900" 
      };
    case 51:
    case 53:
    case 55:
      return { 
        label: "Drizzle", 
        iconName: "CloudDrizzle", 
        bgGradient: "from-sky-100 to-sky-300 text-sky-900" 
      };
    case 56:
    case 57:
      return { 
        label: "Freezing Drizzle", 
        iconName: "CloudSnow", 
        bgGradient: "from-blue-100 to-slate-300 text-blue-900" 
      };
    case 61:
    case 63:
    case 65:
      return { 
        label: "Rain", 
        iconName: "CloudRain", 
        bgGradient: "from-indigo-300 to-indigo-500 text-indigo-950" 
      };
    case 66:
    case 67:
      return { 
        label: "Freezing Rain", 
        iconName: "CloudRain", 
        bgGradient: "from-purple-200 to-indigo-400 text-indigo-900" 
      };
    case 71:
    case 73:
    case 75:
      return { 
        label: "Snowfall", 
        iconName: "Snowflake", 
        bgGradient: "from-blue-50 to-indigo-200 text-indigo-900" 
      };
    case 77:
      return { 
        label: "Snow Grains", 
        iconName: "Snowflake", 
        bgGradient: "from-zinc-100 to-zinc-200 text-zinc-900" 
      };
    case 80:
    case 81:
    case 82:
      return { 
        label: "Rain Showers", 
        iconName: "CloudRain", 
        bgGradient: "from-sky-300 to-indigo-400 text-indigo-900" 
      };
    case 85:
    case 86:
      return { 
        label: "Snow Showers", 
        iconName: "Snowflake", 
        bgGradient: "from-blue-100 to-sky-200 text-blue-950" 
      };
    case 95:
      return { 
        label: "Thunderstorm", 
        iconName: "CloudLightning", 
        bgGradient: "from-violet-400 to-purple-600 text-purple-950" 
      };
    case 96:
    case 99:
      return { 
        label: "Thunderstorm with Hail", 
        iconName: "CloudLightning", 
        bgGradient: "from-purple-500 to-rose-600 text-rose-950" 
      };
    default:
      return { 
        label: "Unknown Conditions", 
        iconName: "HelpCircle", 
        bgGradient: "from-slate-200 to-slate-300 text-slate-800" 
      };
  }
}

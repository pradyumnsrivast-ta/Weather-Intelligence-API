import React from "react";
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudDrizzle, 
  CloudRain, 
  Snowflake, 
  CloudLightning, 
  HelpCircle,
  Wind,
  Droplets,
  Thermometer,
  ShieldAlert,
  Shirt,
  Calendar,
  Compass,
  Search,
  Navigation,
  Sparkles,
  Info,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  History
} from "lucide-react";

interface WeatherIconProps {
  name: string;
  className?: string;
  size?: number;
}

export function WeatherIcon({ name, className = "", size }: WeatherIconProps) {
  const iconProps = { className, ...(size ? { size } : {}) };

  switch (name) {
    case "Sun":
      return <Sun {...iconProps} />;
    case "CloudSun":
      return <CloudSun {...iconProps} />;
    case "Cloud":
      return <Cloud {...iconProps} />;
    case "CloudFog":
      return <CloudFog {...iconProps} />;
    case "CloudDrizzle":
      return <CloudDrizzle {...iconProps} />;
    case "CloudRain":
      return <CloudRain {...iconProps} />;
    case "Snowflake":
      return <Snowflake {...iconProps} />;
    case "CloudLightning":
      return <CloudLightning {...iconProps} />;
    case "Wind":
      return <Wind {...iconProps} />;
    case "Droplets":
      return <Droplets {...iconProps} />;
    case "Thermometer":
      return <Thermometer {...iconProps} />;
    case "ShieldAlert":
      return <ShieldAlert {...iconProps} />;
    case "Shirt":
      return <Shirt {...iconProps} />;
    case "Calendar":
      return <Calendar {...iconProps} />;
    case "Compass":
      return <Compass {...iconProps} />;
    case "Search":
      return <Search {...iconProps} />;
    case "Navigation":
      return <Navigation {...iconProps} />;
    case "Sparkles":
      return <Sparkles {...iconProps} />;
    case "Info":
      return <Info {...iconProps} />;
    case "ChevronRight":
      return <ChevronRight {...iconProps} />;
    case "TrendingUp":
      return <TrendingUp {...iconProps} />;
    case "MapPin":
      return <MapPin {...iconProps} />;
    case "Clock":
      return <Clock {...iconProps} />;
    case "History":
      return <History {...iconProps} />;
    default:
      return <HelpCircle {...iconProps} />;
  }
}

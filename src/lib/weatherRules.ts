import { WeatherData, WeatherIntelligenceResponse, getWeatherCondition } from "../types";

/**
 * Procedural meteorological analysis engine to replace Gemini API calls.
 * This runs fully locally, instantly, with zero external dependencies.
 */
export function analyzeWeatherTelemetry(cityName: string, weather: WeatherData): WeatherIntelligenceResponse {
  const current = weather.current;
  const daily = weather.daily;

  const currentCondition = getWeatherCondition(current.weather_code);
  const temp = current.temperature_2m;
  const feel = current.apparent_temperature;
  const wind = current.wind_speed_10m;
  const humidity = current.relative_humidity_2m;
  const precip = current.precipitation;

  // 1. Compile current overview narrative
  let currentOverview = "";
  const tempDesc = temp < 0 ? "freezing" : temp < 10 ? "cold" : temp < 18 ? "cool" : temp < 26 ? "mildly warm" : "hot";
  
  const weatherLabel = currentCondition.label.toLowerCase();
  currentOverview = `Atmosphere in ${cityName} feels ${tempDesc} at ${temp.toFixed(1)}°C (felt as ${feel.toFixed(1)}°C) under ${weatherLabel} conditions. `;

  if (wind > 20) {
    currentOverview += `Speeds of ${wind.toFixed(1)} km/h present a persistent breeze. `;
  } else if (wind < 5) {
    currentOverview += `Wind index indicates calm, stagnant air movement. `;
  } else {
    currentOverview += `A light, comfortable breeze of ${wind.toFixed(1)} km/h is recorded. `;
  }

  if (precip > 2) {
    currentOverview += `Active precipitation sum registering at ${precip.toFixed(1)} mm represents steady wet surfaces currently.`;
  } else if (humidity > 80) {
    currentOverview += `High relative humidity registers at ${humidity}%, making the air feel notably dense and moist.`;
  } else if (humidity < 35) {
    currentOverview += `Relative humidity is low (${humidity}%), indicating crisp dry atmospheric conditions.`;
  } else {
    currentOverview += `Optimal ambient humidity measured at ${humidity}%.`;
  }

  // 2. Compile weekly trend group periods
  let forecastBreakdown = "";
  const maxTemps = daily.temperature_2m_max;
  const minTemps = daily.temperature_2m_min;
  const codes = daily.weather_code;
  const precips = daily.precipitation_sum;

  const avgHigh = maxTemps.reduce((a, b) => a + b, 0) / 7;
  const avgLow = minTemps.reduce((a, b) => a + b, 0) / 7;

  // Wet days calculation
  const wetDaysIndices: number[] = [];
  precips.forEach((p, idx) => {
    if (p > 1.0) wetDaysIndices.push(idx);
  });

  if (wetDaysIndices.length === 0) {
    forecastBreakdown = `Expect a highly stable, completely dry weekly progression. Clearer weather profiles persist with high-pressure ridges dominating the airspace. daily high temperatures will average a peak around ${avgHigh.toFixed(1)}°C, with nocturnal lows settling down around ${avgLow.toFixed(1)}°C.`;
  } else if (wetDaysIndices.length >= 4) {
    forecastBreakdown = `Expect persistent damp conditions with multiple low-pressure troughs tracking over the area. Significant precipitation accumulation is distributed across ${wetDaysIndices.length} days of the week. Commutes will experience wet surfaces under recurring high-moisture events averaging high limits of ${avgHigh.toFixed(1)}°C.`;
  } else {
    // Group trends
    const firstWetIndex = wetDaysIndices[0];
    const dayStr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][(new Date(daily.time[firstWetIndex])).getDay()];
    
    forecastBreakdown = `Active weather fluctuations preview a mostly moderate week. High points are anticipated to touch ${avgHigh.toFixed(1)}°C, dropping down near ${avgLow.toFixed(1)}°C. Notable moisture precipitation is isolated around ${dayStr}, transitioning afterwards into a more stable, dry wind pattern for the rest of the 7-day outlook.`;
  }

  // 3. Compile tactical recommendations
  let clothing = "";
  let activities = "";
  let alerts = "";

  // Clothing strategy logic
  if (temp < 6) {
    clothing = "Heavy thermal layering is strongly advised. Wear a windproof insulated winter parka, thermal headwear, and insulated gloves to protect against the real-feel freezing temperatures.";
  } else if (temp < 15) {
    clothing = "Cooler ambient air suggests wearing moderate double-layer configurations. A fleece jacket, light trench coat, or heavy sweater paired with warm trousers is optimal.";
  } else if (temp < 24) {
    clothing = "Comfortable light layers. A long-sleeve cotton shirt, standard denim, or a light cardigan is ideal. Keep sunglasses on hand for sunny periods.";
  } else {
    clothing = "Summer activewear. Select light, highly breathable fabrics. UV protection is recommended; carry sunglasses, wear a sunhat, and apply protective sunscreen.";
  }

  // Add wet guard if raining
  if (precip > 0.5 || daily.precipitation_sum[0] > 1.0) {
    clothing += " Additionally, carry an umbrella and wear a waterproof outer shell with moisture-resistant footwear to avoid damp elements.";
  }

  // Activity Optimizer strategy logic
  if (precip > 1.5) {
    activities = "Active precipitation of water or sleet reduces outdoor suitability. Commuting conditions indicate slick surfaces and reduced visibility. Transition training, exercise, and leisure plans indoors.";
  } else if (wind > 35) {
    activities = "Elevated gust warnings. Cycling, running, and tennis are not recommended due to high aerodynamic drag forces of atmospheric draft. Commuting caution is warranted.";
  } else if (temp > 30) {
    activities = "Extreme temperature indicators. For athletic exercises, plan activities during the cooler early-morning or late-evening margins. Stay fully hydrated and prefer air-conditioned indoor segments.";
  } else if (temp < 4) {
    activities = "Freezing thermal threshold. Commutes will feel chilly with potential icy road margins. Outdoor runs are suited only with appropriate heavy winter sport textiles; otherwise, keep training indoor.";
  } else {
    activities = "Optimal weather envelope for outdoors. Excellent indicators for cycling, training, running, and pedestrian commuting. Take advantage of stable atmospheric conditions.";
  }

  // Alerts intelligence
  const elements: string[] = [];
  if (temp > 33) elements.push(`Hypertherly Hazard: Extreme daytime highs reaching ${temp.toFixed(1)}°C.`);
  if (temp < 0) elements.push(`Frost warning: Freezing thermal values index below 0°C may lead to micro-ice formations on roads.`);
  if (wind > 40) elements.push(`Severe Wind warning: Persistent gusts tracking above 40 km/h present draft risks.`);
  if (precip > 5.0 || daily.precipitation_sum[0] > 10.0) {
    elements.push(`High precipitation sum advisory: Local accumulation may exacerbate drainage backflow.`);
  }

  alerts = elements.join(" | ");

  return {
    currentOverview,
    forecastBreakdown,
    smartRecommendations: {
      clothing,
      activities,
      alerts
    }
  };
}

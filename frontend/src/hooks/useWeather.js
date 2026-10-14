import { useEffect, useState } from "react";

const conditions = {
  0: "मौसम सफा",
  1: "अधिकांश सफा",
  2: "हल्का बदली",
  3: "बदली",
  45: "कुहिरो",
  48: "कुहिरो",
  51: "हल्का पानी",
  53: "झरी",
  55: "पानी परेको",
  61: "हल्का वर्षा",
  63: "वर्षा भइरहेको",
  65: "भारी वर्षा",
  71: "हल्का हिउँ",
  73: "हिउँ परेको",
  75: "भारी हिउँ",
  80: "छिटपुट वर्षा",
  81: "वर्षा",
  82: "भारी वर्षा",
  95: "आँधी",
  96: "आँधीसहित वर्षा",
  99: "आँधीसहित भारी वर्षा"
};

export default function useWeather() {
  const [weather, setWeather] = useState(null);
  useEffect(() => {
    let mounted = true;
    fetch("https://api.open-meteo.com/v1/forecast?latitude=27.7172&longitude=85.3240&current_weather=true")
      .then((r) => r.json())
      .then((d) => {
        if (!mounted || !d.current_weather) return;
        const w = d.current_weather;
        setWeather({
          city: "काठमाडौं",
          temp: Math.round(w.temperature),
          condition: conditions[w.weathercode] || "सामान्य",
          humidity: 60
        });
      })
      .catch(() => {
        if (mounted) setWeather({ city: "काठमाडौं", temp: 20, condition: "हवा", humidity: 60 });
      });
    return () => { mounted = false; };
  }, []);
  return { weather, loading: !weather };
}
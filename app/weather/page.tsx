'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getWeather, WeatherData } from '@/services/weatherApi';
import { Loader2, Cloud, Sun, CloudRain, Wind, Thermometer } from 'lucide-react';
import { motion } from 'framer-motion';

function WeatherContent() {
  const searchParams = useSearchParams();
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const name = searchParams.get('name');

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [funActivities, setFunActivities] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    if (lat && lon) {
      const fetchData = async () => {
        try {
          const data = await getWeather(parseFloat(lat), parseFloat(lon));
          setWeather(data);

          // Trigger AI generation
          setLoadingAI(true);
          const aiRes = await fetch('/api/generate-fun', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              weather: data.current,
              location: name
            }),
          });
          console.log(aiRes);
          const aiData = await aiRes.json();
          setFunActivities(aiData.activities || []);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
          setLoadingAI(false);
        }
      };
      fetchData();
    }
  }, [lat, lon, name]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-800">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-indigo-600" />
        <p className="text-xl font-medium animate-pulse">Checking the skies...</p>
      </div>
    );
  }

  if (!weather) return <div className="text-slate-800 text-center mt-20">Failed to load weather.</div>;

  const temp = weather.current.temperature_2m;
  const isDay = weather.current.is_day;

  return (
    <div className="min-h-screen p-8 flex flex-col items-center max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl p-8 mb-8 text-slate-800 shadow-lg relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-slate-900">{name}</h1>
            <div className="flex items-center gap-4">
              <span className="text-6xl font-bold text-slate-800">{Math.round(temp)}°C</span>
              {isDay ? <Sun className="w-16 h-16 text-yellow-500" /> : <Cloud className="w-16 h-16 text-slate-400" />}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm font-medium">
            {/* Additional weather details could go here */}
            <div className="flex items-center gap-2 bg-white/40 p-3 rounded-xl shadow-sm">
              <Thermometer className="w-5 h-5 text-indigo-600" />
              <span>Feels like {Math.round(temp)}°</span>
            </div>
            <div className="flex items-center gap-2 bg-white/40 p-3 rounded-xl shadow-sm">
              <Wind className="w-5 h-5 text-blue-500" />
              <span>Windy</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="w-full">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="bg-white/40 p-2 rounded-lg shadow-sm">Fun Works</span>
          <span className="text-base font-normal text-slate-600">AI Suggested Activities</span>
        </h2>

        {loadingAI ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-white/20 backdrop-blur-md rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {funActivities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/40 backdrop-blur-md border border-white/50 p-6 rounded-2xl shadow-sm hover:shadow-md hover:bg-white/60 transition-all duration-300 cursor-pointer group"
              >
                <p className="text-lg text-slate-800 font-medium leading-relaxed group-hover:scale-105 transition-transform duration-300">
                  {activity}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WeatherPage() {
  return (
    <Suspense fallback={<div className="text-slate-800 text-center p-10">Loading...</div>}>
      <WeatherContent />
    </Suspense>
  );
}

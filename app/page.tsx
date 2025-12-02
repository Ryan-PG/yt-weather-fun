import LocationSearch from '@/components/LocationSearch';
import { CloudSun, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-20 right-20 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="z-10 text-center space-y-8 max-w-2xl w-full">
        <div className="relative inline-block">
          <h1 className="text-6xl font-bold text-slate-800 drop-shadow-sm tracking-tight">
            Ryan Weather Fun
          </h1>
          <CloudSun className="absolute -top-12 -right-12 w-24 h-24 text-yellow-400 drop-shadow-md animate-bounce-slow" />
        </div>

        <p className="text-xl text-slate-700 font-medium">
          Discover fun activities tailored to your weather.
        </p>

        <div className="mt-12">
          <LocationSearch />
        </div>

        <div className="mt-16 flex items-center justify-center gap-2 text-slate-600 text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Powered by AI & Open-Meteo</span>
        </div>
      </div>
    </main>
  );
}

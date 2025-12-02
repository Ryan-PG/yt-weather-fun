'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { searchLocations, Location } from '@/services/weatherApi';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function LocationSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        const locations = await searchLocations(query);
        setResults(locations);
        setIsLoading(false);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (location: Location) => {
    setQuery(`${location.name}, ${location.country}`);
    setIsOpen(false);
    router.push(`/weather?lat=${location.latitude}&lon=${location.longitude}&name=${encodeURIComponent(location.name)}`);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md mx-auto z-50">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
        <div className="relative flex items-center bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden transition-all duration-300 focus-within:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] focus-within:bg-white/60">
          <Search className="w-5 h-5 text-gray-500 ml-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your city..."
            className="w-full px-4 py-4 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 font-medium"
          />
          {isLoading && <Loader2 className="w-5 h-5 text-indigo-500 animate-spin mr-4" />}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute w-full mt-4 bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] overflow-hidden"
          >
            <ul className="py-2">
              {results.map((location) => (
                <li key={location.id}>
                  <button
                    onClick={() => handleSelect(location)}
                    className="w-full px-6 py-3 flex items-center gap-3 text-left hover:bg-white/50 transition-colors duration-200 group"
                  >
                    <div className="p-2 bg-white/40 rounded-full text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-200">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">{location.name}</p>
                      <p className="text-sm text-gray-500">{location.admin1 ? `${location.admin1}, ` : ''}{location.country}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

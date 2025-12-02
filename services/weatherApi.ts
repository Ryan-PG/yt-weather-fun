export interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export interface WeatherData {
  current: {
    temperature_2m: number;
    weather_code: number;
    is_day: number;
  };
}

const GEOCODING_API_URL = process.env.NEXT_PUBLIC_GEOCODING_API_URL || 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = process.env.NEXT_PUBLIC_WEATHER_API_URL || 'https://api.open-meteo.com/v1/forecast';

export async function searchLocations(query: string): Promise<Location[]> {
  if (!query || query.length < 2) return [];

  try {
    const response = await fetch(`${GEOCODING_API_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
    if (!response.ok) throw new Error('Failed to fetch locations');
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
}

export async function getWeather(lat: number, lon: number) {
  try {
    const response = await fetch(`${WEATHER_API_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&timezone=auto`);
    if (!response.ok) throw new Error('Failed to fetch weather');
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
}

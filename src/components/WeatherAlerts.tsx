import { useState, useEffect } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, Wind, AlertTriangle, Thermometer, Umbrella } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'windy';
  precipitation: number;
  windSpeed: number;
  humidity: number;
  alerts: WeatherAlert[];
}

interface WeatherAlert {
  severity: 'low' | 'medium' | 'high';
  message: string;
  recommendation: string;
}

export default function WeatherAlerts() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeatherData = async () => {
    try {
      const mockWeather: WeatherData = {
        temperature: 22 + Math.random() * 10,
        condition: ['sunny', 'cloudy', 'rainy', 'windy'][Math.floor(Math.random() * 4)] as any,
        precipitation: Math.random() * 100,
        windSpeed: 10 + Math.random() * 30,
        humidity: 40 + Math.random() * 40,
        alerts: []
      };

      if (mockWeather.precipitation > 60) {
        mockWeather.alerts.push({
          severity: 'high',
          message: 'גשם כבד צפוי היום',
          recommendation: 'הביא מעיל גשם ושקול לדחות חלוקות לא דחופות'
        });
      } else if (mockWeather.precipitation > 30) {
        mockWeather.alerts.push({
          severity: 'medium',
          message: 'גשם קל צפוי',
          recommendation: 'הביא מטריה והגן על הדואר'
        });
      }

      if (mockWeather.temperature > 35) {
        mockWeather.alerts.push({
          severity: 'high',
          message: 'חום קיצוני',
          recommendation: 'שתה הרבה מים וקח הפסקות תכופות'
        });
      } else if (mockWeather.temperature > 30) {
        mockWeather.alerts.push({
          severity: 'medium',
          message: 'יום חם',
          recommendation: 'הישאר מחוץ לשמש בשעות הצהריים'
        });
      }

      if (mockWeather.windSpeed > 40) {
        mockWeather.alerts.push({
          severity: 'high',
          message: 'רוחות חזקות',
          recommendation: 'הקפד לאבטח את הדואר היטב'
        });
      }

      if (mockWeather.temperature < 10) {
        mockWeather.alerts.push({
          severity: 'medium',
          message: 'קר מאוד',
          recommendation: 'הלבש שכבות והתחמם'
        });
      }

      setWeather(mockWeather);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="text-yellow-500" size={32} />;
      case 'cloudy': return <Cloud className="text-gray-500" size={32} />;
      case 'rainy': return <CloudRain className="text-blue-500" size={32} />;
      case 'snowy': return <CloudSnow className="text-blue-300" size={32} />;
      case 'windy': return <Wind className="text-gray-600" size={32} />;
      default: return <Sun className="text-yellow-500" size={32} />;
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'sunny': return 'שמשי';
      case 'cloudy': return 'מעונן';
      case 'rainy': return 'גשום';
      case 'snowy': return 'שלג';
      case 'windy': return 'סוער';
      default: return 'לא ידוע';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 border-red-400 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-400 text-blue-800';
      default: return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return 'ℹ️';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <p className="text-gray-600">לא ניתן לטעון נתוני מזג אוויר</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-lg p-6 border border-blue-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {getWeatherIcon(weather.condition)}
          <div>
            <h2 className="text-2xl font-bold text-gray-800">מזג אוויר</h2>
            <p className="text-sm text-gray-600">{getConditionText(weather.condition)}</p>
          </div>
        </div>
        <div className="text-4xl font-bold text-gray-800">
          {Math.round(weather.temperature)}°C
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Umbrella size={20} className="text-blue-500" />
            <span className="text-xs text-gray-600">גשם</span>
          </div>
          <div className="text-xl font-bold text-gray-800">{Math.round(weather.precipitation)}%</div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Wind size={20} className="text-gray-500" />
            <span className="text-xs text-gray-600">רוח</span>
          </div>
          <div className="text-xl font-bold text-gray-800">{Math.round(weather.windSpeed)} קמ"ש</div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer size={20} className="text-red-500" />
            <span className="text-xs text-gray-600">לחות</span>
          </div>
          <div className="text-xl font-bold text-gray-800">{Math.round(weather.humidity)}%</div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={20} className="text-yellow-500" />
            <span className="text-xs text-gray-600">התראות</span>
          </div>
          <div className="text-xl font-bold text-gray-800">{weather.alerts.length}</div>
        </div>
      </div>

      {weather.alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={20} />
            התראות מזג אוויר
          </h3>
          {weather.alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`rounded-lg p-4 border-2 ${getSeverityColor(alert.severity)} transition-all duration-300 hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
                <div className="flex-1">
                  <h4 className="font-bold mb-1">{alert.message}</h4>
                  <p className="text-sm opacity-90">{alert.recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {weather.alerts.length === 0 && (
        <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">☀️</div>
          <p className="text-green-800 font-medium">תנאי מזג אוויר מצוינים לחלוקת דואר!</p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-600 text-center">
        מתעדכן כל 30 דקות | נתונים לאזור המרכז
      </div>
    </div>
  );
}

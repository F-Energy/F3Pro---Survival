import React, { useState, useEffect } from 'react';
import { 
  CloudLightning, 
  Wind, 
  Thermometer, 
  TrendingDown, 
  AlertTriangle, 
  CloudSnow, 
  Zap,
  Compass
} from 'lucide-react';
import { WeatherData } from '../types/survival';

export const WeatherModule: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>({
    tempF: 28,
    windSpeedMph: 24,
    windDirection: 'WNW',
    pressureHpa: 1008.4,
    pressureTrend: 'FALLING_STORM',
    humidityPercent: 82,
    freezeRisk: 'CRITICAL',
    cloudCeilingFt: 4500,
    lightningDistanceMiles: null,
    elevationFt: 8650,
  });

  // Lightning Flash-to-Bang Timer state
  const [lightningState, setLightningState] = useState<'IDLE' | 'TIMING' | 'RESULT'>('IDLE');
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  useEffect(() => {
    let interval: any = null;
    if (lightningState === 'TIMING') {
      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lightningState]);

  const handleStartLightningTimer = () => {
    setSecondsElapsed(0);
    setLightningState('TIMING');
  };

  const handleStopLightningTimer = () => {
    setLightningState('RESULT');
    const distMiles = Number((secondsElapsed / 5).toFixed(1));
    setWeather(prev => ({ ...prev, lightningDistanceMiles: distMiles }));
  };

  // Wind Chill calculation
  const windChill = Math.round(
    35.74 + 0.6215 * weather.tempF - 35.75 * Math.pow(weather.windSpeedMph, 0.16) + 0.4275 * weather.tempF * Math.pow(weather.windSpeedMph, 0.16)
  );

  return (
    <div className="space-y-6 pb-12 font-mono">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0b1426] border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-yellow-400 mb-1">
            <CloudLightning className="w-4 h-4" />
            <span>SATELLITE BAROMETER & MICROCLIMATE ENGINE</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">Weather Prediction & Lightning Proximity Solver</h1>
          <p className="text-xs text-slate-400 mt-1">
            Mountain Sector Elevation: {weather.elevationFt.toLocaleString()} ft · Barometer: {weather.pressureHpa} hPa (Falling Fast)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs shrink-0">
          <span className="px-3 py-1.5 rounded-lg bg-red-950 text-red-400 border border-red-800 font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
            FREEZE & BLIZZARD RISK
          </span>
        </div>
      </div>

      {/* 4 Metric Weather Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Temp & Wind Chill */}
        <div className="p-4 rounded-xl bg-[#0b1426] border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1"><Thermometer className="w-4 h-4 text-sky-400" /> Temperature</span>
            <span className="text-sky-400 font-bold">Sub-Freezing</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100">{weather.tempF}°F</span>
            <span className="text-xs text-slate-400">Feels: {windChill}°F</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Wind Chill Hazard: Extreme exposure risk in 30 mins.
          </div>
        </div>

        {/* Barometer Trend */}
        <div className="p-4 rounded-xl bg-[#0b1426] border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1"><TrendingDown className="w-4 h-4 text-red-400" /> Barometer</span>
            <span className="text-red-400 font-bold">Dropping Fast</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100">{weather.pressureHpa}</span>
            <span className="text-xs text-slate-400">hPa (-3.6/3hr)</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Rapid pressure drop indicates severe mountain cold front within 2 hours.
          </div>
        </div>

        {/* Wind Speed */}
        <div className="p-4 rounded-xl bg-[#0b1426] border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1"><Wind className="w-4 h-4 text-yellow-400" /> Wind Velocity</span>
            <span className="text-yellow-400 font-bold">{weather.windDirection}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100">{weather.windSpeedMph}</span>
            <span className="text-xs text-slate-400">mph gusts</span>
          </div>
          <div className="text-[10px] text-slate-400">
            High ridge wind turbulence. Avoid open cliff line exposure.
          </div>
        </div>

        {/* Cloud Ceiling & Freeze */}
        <div className="p-4 rounded-xl bg-[#0b1426] border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1"><CloudSnow className="w-4 h-4 text-purple-400" /> Freeze Level</span>
            <span className="text-purple-400 font-bold">Critical</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100">4,500</span>
            <span className="text-xs text-slate-400">ft cloud base</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Snow accumulation estimated: 4-8 inches tonight.
          </div>
        </div>

      </div>

      {/* Main Grid: Lightning Flash-to-Bang Calculator (6 cols) & Elevation Solver (6 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Flash-to-Bang Lightning Distance Calculator */}
        <div className="md:col-span-6 p-5 rounded-xl bg-[#0b1426] border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h2 className="text-base font-bold text-slate-100">Thunder-to-Lightning Distance Calculator</h2>
            </div>
            <span className="text-xs text-yellow-400 font-bold">Flash-to-Bang Solver</span>
          </div>

          <p className="text-xs text-slate-300">
            Click "SAW LIGHTNING FLASH", wait until you hear the acoustic thunder strike, then click "HEARD THUNDER". Aegis calculates storm proximity.
          </p>

          <div className="p-6 rounded-xl bg-[#060b17] border border-slate-800 text-center space-y-4">
            <div className="text-4xl font-extrabold font-mono text-yellow-400">
              {secondsElapsed}s
            </div>

            {lightningState === 'IDLE' && (
              <button
                onClick={handleStartLightningTimer}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-lg uppercase tracking-wider transition-colors shadow-lg shadow-yellow-400/20"
              >
                ⚡ Saw Lightning Flash (Start Timer)
              </button>
            )}

            {lightningState === 'TIMING' && (
              <button
                onClick={handleStopLightningTimer}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg uppercase tracking-wider animate-pulse transition-colors"
              >
                🔊 Heard Thunder Strike (Stop Timer)
              </button>
            )}

            {lightningState === 'RESULT' && (
              <div className="space-y-2">
                <div className="text-sm font-bold text-slate-100">
                  Lightning Strike Distance: <span className="text-yellow-400 text-xl font-extrabold">{weather.lightningDistanceMiles} Miles</span>
                </div>
                <p className="text-xs text-slate-300">
                  {weather.lightningDistanceMiles && weather.lightningDistanceMiles <= 6
                    ? 'CRITICAL DANGER: Storm is within 6 miles! Seek immediate low-ground shelter away from tall trees.'
                    : 'Storm is approaching. Prepare shelter and secure solar equipment.'}
                </p>
                <button
                  onClick={() => setLightningState('IDLE')}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded font-semibold"
                >
                  Reset Timer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mountain Elevation Weather Solver */}
        <div className="md:col-span-6 p-5 rounded-xl bg-[#0b1426] border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-sky-400" />
              <h2 className="text-base font-bold text-slate-100">Mountain Elevation Weather Solver</h2>
            </div>
            <span className="text-xs text-sky-400 font-bold">-3.5°F / 1,000ft</span>
          </div>

          <p className="text-xs text-slate-300">
            For every 1,000 feet of mountain elevation gain, ambient temperature drops approximately 3.5°F (6.5°C).
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded bg-[#060b17] border border-slate-800 flex justify-between items-center">
              <span>Base Camp (6,000 ft)</span>
              <span className="font-bold text-slate-200">37°F</span>
            </div>
            <div className="p-3 rounded bg-[#060b17] border border-slate-800 flex justify-between items-center">
              <span>Current Position (8,650 ft)</span>
              <span className="font-bold text-yellow-400">28°F</span>
            </div>
            <div className="p-3 rounded bg-[#060b17] border border-slate-800 flex justify-between items-center">
              <span>Summit Ridge (11,500 ft)</span>
              <span className="font-bold text-red-400">18°F (High Frostbite Risk)</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

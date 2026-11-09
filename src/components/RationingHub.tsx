import React, { useState } from 'react';
import { 
  Activity, 
  Droplets, 
  Flame, 
  Calendar, 
  TrendingDown, 
  Bot, 
  Sparkles, 
  ChevronRight, 
  RotateCcw,
  Scale,
  CheckCircle2,
  Clock,
  Zap,
  Sun,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { InventoryItem, TripScenario } from '../types/survival';

interface RationingHubProps {
  inventory: InventoryItem[];
  scenario: TripScenario;
  waterIntakeMl: number;
  setWaterIntakeMl: React.Dispatch<React.SetStateAction<number>>;
  consumedCalories: number;
  setConsumedCalories: React.Dispatch<React.SetStateAction<number>>;
}

// 30-Day Battery Usage & Power Efficiency Trend Data
const batteryTrendData = [
  { day: 'Day 1', battery: 100, solarWh: 450, burnWh: 280, efficiency: 96 },
  { day: 'Day 5', battery: 92, solarWh: 420, burnWh: 310, efficiency: 92 },
  { day: 'Day 10', battery: 85, solarWh: 510, burnWh: 290, efficiency: 89 },
  { day: 'Day 15', battery: 78, solarWh: 380, burnWh: 340, efficiency: 83 },
  { day: 'Day 20', battery: 89, solarWh: 580, burnWh: 270, efficiency: 94 },
  { day: 'Day 25', battery: 83, solarWh: 440, burnWh: 320, efficiency: 87 },
  { day: 'Day 30', battery: 91, solarWh: 530, burnWh: 290, efficiency: 95 },
];

export const RationingHub: React.FC<RationingHubProps> = ({
  inventory,
  scenario,
  waterIntakeMl,
  setWaterIntakeMl,
  consumedCalories,
  setConsumedCalories,
}) => {
  // Calorie Calculator state
  const [weightKg, setWeightKg] = useState<number>(75);
  const [tempF, setTempF] = useState<number>(28);
  const [exertion, setExertion] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME'>('HIGH');
  const [rationMode, setRationMode] = useState<'STRICT' | 'BALANCED' | 'HIGH_ENERGY'>('BALANCED');

  // AI Advisor state
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Daily target hydration base
  const hydrationTargetMl = Math.round(3000 + (exertion === 'EXTREME' ? 1200 : exertion === 'HIGH' ? 800 : exertion === 'MEDIUM' ? 400 : 0) + (tempF < 32 ? 400 : 0));

  // BMR calculation
  const bmr = Math.round(10 * weightKg + 625 - 250);
  const exertionMultiplier = exertion === 'EXTREME' ? 1.8 : exertion === 'HIGH' ? 1.5 : exertion === 'MEDIUM' ? 1.3 : 1.1;
  const coldBurnMultiplier = tempF < 32 ? 1.15 : tempF < 50 ? 1.05 : 1.0;
  const targetDailyCalories = Math.round(bmr * exertionMultiplier * coldBurnMultiplier);

  // Calculate Total Inventory Metrics
  const totalWaterInStockMl = inventory
    .filter((i) => i.category === 'WATER')
    .reduce((sum, i) => sum + (i.unit.includes('bladder') || i.unit.includes('L') ? i.quantity * 5000 : 0), 60000);

  const totalCaloriesInStock = inventory
    .filter((i) => i.caloriesPerUnit > 0)
    .reduce((sum, i) => sum + i.quantity * i.caloriesPerUnit, 0);

  const totalFuelCanisters = inventory
    .filter((i) => i.category === 'FUEL')
    .reduce((sum, i) => sum + i.quantity, 0);

  // Depletion calculations
  const calorieBurnPerDay = rationMode === 'STRICT' ? 1600 : rationMode === 'BALANCED' ? targetDailyCalories : targetDailyCalories * 1.2;
  const waterBurnPerDayMl = hydrationTargetMl;

  const daysOfFoodRemaining = Math.max(1, Math.round(totalCaloriesInStock / calorieBurnPerDay));
  const daysOfWaterRemaining = Math.max(1, Math.round(totalWaterInStockMl / waterBurnPerDayMl));
  const daysOfFuelRemaining = Math.round(totalFuelCanisters * 3.5);

  // Perishable priority items
  const perishables = inventory
    .filter((i) => i.perishable || new Date(i.expirationDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000)
    .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());

  // Call AI Advisor
  const handleAskAI = async (queryText?: string) => {
    const promptToUse = queryText || aiPrompt;
    if (!promptToUse.trim()) return;

    setAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          scenario,
          inventorySummary: inventory.map(i => `${i.name}: ${i.quantity} ${i.unit} (Exp: ${i.expirationDate})`).join('; '),
          userStats: { weightKg, tempF, exertion, targetDailyCalories }
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAiResponse(data.advice);
      } else {
        setAiResponse(`Notice: ${data.advice || 'Conserve water and consume perishables immediately.'}`);
      }
    } catch (err) {
      setAiResponse('AEGIS Advisor system offline. Conserve water and consume perishable items within 48 hours.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-mono">
      
      {/* Banner Div: CSS Selector 2 */}
      <div 
        className="p-4 sm:p-6 rounded-xl border border-slate-700 relative overflow-hidden shadow-xl"
        style={{ backgroundColor: '#203b72' }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-600">
          <div>
            <div className="flex items-center gap-2 text-xs text-yellow-300 mb-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
              <span>OFF-GRID RATIONING SOLVER</span>
              <span>·</span>
              <span className="text-slate-200">Scenario: {scenario.replace(/_/g, ' ')}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              30-Day Depletion & Rationing Core
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
              Real-time mathematical burn rates optimizing water, calories, stove fuel, and portable LiFePO4 battery power.
            </p>
          </div>

          {/* Rationing Strategy Selector */}
          <div className="flex items-center p-1 bg-slate-950/60 rounded-lg border border-slate-600 shrink-0 text-xs">
            <button
              onClick={() => setRationMode('STRICT')}
              className={`px-3 py-1.5 rounded-md transition-colors ${rationMode === 'STRICT' ? 'bg-yellow-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              Strict (1,600 kcal)
            </button>
            <button
              onClick={() => setRationMode('BALANCED')}
              className={`px-3 py-1.5 rounded-md transition-colors ${rationMode === 'BALANCED' ? 'bg-yellow-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              Balanced ({targetDailyCalories} kcal)
            </button>
            <button
              onClick={() => setRationMode('HIGH_ENERGY')}
              className={`px-3 py-1.5 rounded-md transition-colors ${rationMode === 'HIGH_ENERGY' ? 'bg-yellow-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              High Energy
            </button>
          </div>
        </div>

        {/* 4 Critical Depletion Forecast Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          
          {/* Days of Food: CSS Selector 11 */}
          <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-600 relative">
            <div 
              className="flex items-center justify-between text-slate-200 mb-2"
              style={{ fontSize: '15px' }}
            >
              <span className="flex items-center gap-1.5"><Flame className="w-4 h-4 text-yellow-300" /> Food Reserve</span>
              <span className="text-[10px] text-yellow-300 font-bold">{totalCaloriesInStock.toLocaleString()} kcal</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold ${daysOfFoodRemaining < 10 ? 'text-red-400' : 'text-white'}`}>
                {daysOfFoodRemaining}
              </span>
              <span className="text-xs text-slate-300">Days Remaining</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-700">
              <div 
                className={`h-full transition-all duration-500 ${daysOfFoodRemaining >= 30 ? 'bg-emerald-400' : daysOfFoodRemaining >= 15 ? 'bg-yellow-400' : 'bg-red-500'}`}
                style={{ width: `${Math.min(100, (daysOfFoodRemaining / 30) * 100)}%` }}
              />
            </div>
          </div>

          {/* Days of Water */}
          <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-600 relative">
            <div className="flex items-center justify-between text-xs text-slate-200 mb-2">
              <span className="flex items-center gap-1.5"><Droplets className="w-4 h-4 text-sky-300" /> Water Reserve</span>
              <span className="text-[10px] text-sky-300 font-bold">{(totalWaterInStockMl / 1000).toFixed(0)}L Stored</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold ${daysOfWaterRemaining < 7 ? 'text-red-400' : 'text-white'}`}>
                {daysOfWaterRemaining}
              </span>
              <span className="text-xs text-slate-300">Days Remaining</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-700">
              <div 
                className={`h-full transition-all duration-500 ${daysOfWaterRemaining >= 30 ? 'bg-sky-400' : daysOfWaterRemaining >= 14 ? 'bg-yellow-400' : 'bg-red-500'}`}
                style={{ width: `${Math.min(100, (daysOfWaterRemaining / 30) * 100)}%` }}
              />
            </div>
          </div>

          {/* Days of Cooking Fuel */}
          <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-600 relative">
            <div className="flex items-center justify-between text-xs text-slate-200 mb-2">
              <span className="flex items-center gap-1.5"><TrendingDown className="w-4 h-4 text-orange-300" /> Stove Fuel</span>
              <span className="text-[10px] text-orange-300 font-bold">{totalFuelCanisters} Canisters</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{daysOfFuelRemaining}</span>
              <span className="text-xs text-slate-300">Days Stove Heat</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-700">
              <div 
                className="h-full bg-orange-400 transition-all duration-500"
                style={{ width: `${Math.min(100, (daysOfFuelRemaining / 30) * 100)}%` }}
              />
            </div>
          </div>

          {/* Daily Burn Rate */}
          <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-600 relative">
            <div className="flex items-center justify-between text-xs text-slate-200 mb-2">
              <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-emerald-300" /> Target Daily Burn</span>
              <span className="text-[10px] text-emerald-300 font-bold">100% Target</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-yellow-300">{calorieBurnPerDay}</span>
              <span className="text-xs text-slate-300">kcal / Day</span>
            </div>
            <p className="text-[10px] text-slate-300 mt-2 truncate">
              {rationMode === 'STRICT' ? 'Survival Ration Mode' : 'Optimal Stamina Balance'}
            </p>
          </div>

        </div>
      </div>

      {/* Main Grid: CSS Selector 8 */}
      <div 
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 rounded-xl border border-slate-700"
        style={{ backgroundColor: '#1a3773' }}
      >
        
        {/* Left Column (7 cols): Rationing Order, Calorie Matrix & AI Assistant */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Child 1 of Left Col: CSS Selector 3 */}
          <div 
            className="p-5 rounded-xl border border-slate-600 shadow-lg space-y-3"
            style={{ backgroundColor: '#1c4353' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-600/80">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-yellow-300" />
                <h2 className="text-base font-bold text-white">30-Day Rationing Consumption Schedule</h2>
              </div>
              <span className="text-xs text-slate-200">Perishability Order</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              
              {/* Phase 1 */}
              <div className="p-2.5 rounded bg-red-950/40 border border-red-800/60 space-y-1">
                <div className="flex items-center justify-between text-red-300 font-bold">
                  <span>PHASE 1 (Days 1–4)</span>
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="font-semibold text-white">Fresh Goods</div>
                <p className="text-[10px] text-slate-200">
                  Eat fresh produce & dairy first.
                </p>
              </div>

              {/* Phase 2 */}
              <div className="p-2.5 rounded bg-yellow-950/40 border border-yellow-700/60 space-y-1">
                <div className="flex items-center justify-between text-yellow-300 font-bold">
                  <span>PHASE 2 (Days 5–12)</span>
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="font-semibold text-white">Canned Goods</div>
                <p className="text-[10px] text-slate-200">
                  Heavy canned stews & beans.
                </p>
              </div>

              {/* Phase 3 */}
              <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800/60 space-y-1">
                <div className="flex items-center justify-between text-emerald-300 font-bold">
                  <span>PHASE 3 (Days 13–24)</span>
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="font-semibold text-white">Freeze-Dried</div>
                <p className="text-[10px] text-slate-200">
                  MRE pouches & snowmelt.
                </p>
              </div>

              {/* Phase 4 */}
              <div className="p-2.5 rounded bg-sky-950/40 border border-sky-800/60 space-y-1">
                <div className="flex items-center justify-between text-sky-300 font-bold">
                  <span>PHASE 4 (Days 25–30+)</span>
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="font-semibold text-white">High-Density</div>
                <p className="text-[10px] text-slate-200">
                  Peanut butter & honey fats.
                </p>
              </div>

            </div>
          </div>

          {/* Child 2 of Left Col: CSS Selector 5 */}
          <div 
            className="p-5 rounded-xl border border-slate-600 space-y-4 shadow-lg"
            style={{ backgroundColor: '#1b366b' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-yellow-300" />
                <h2 className="text-base font-bold text-white">Daily Calorie Consumption & Metabolism</h2>
              </div>
              <span className="text-xs text-yellow-300 font-bold">
                Target: {targetDailyCalories} kcal/day
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              
              <div className="space-y-1 p-2.5 rounded bg-slate-950/40 border border-slate-700">
                <label className="text-slate-300 flex justify-between">
                  <span>Weight</span>
                  <span className="text-white font-bold">{weightKg} kg</span>
                </label>
                <input
                  type="range"
                  min={50}
                  max={120}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full accent-yellow-400"
                />
              </div>

              <div className="space-y-1 p-2.5 rounded bg-slate-950/40 border border-slate-700">
                <label className="text-slate-300 flex justify-between">
                  <span>Temp (°F)</span>
                  <span className="text-white font-bold">{tempF}°F</span>
                </label>
                <input
                  type="range"
                  min={-10}
                  max={90}
                  value={tempF}
                  onChange={(e) => setTempF(Number(e.target.value))}
                  className="w-full accent-yellow-400"
                />
              </div>

              <div className="space-y-1 p-2.5 rounded bg-slate-950/40 border border-slate-700">
                <label className="text-slate-300 block">Exertion</label>
                <select
                  value={exertion}
                  onChange={(e: any) => setExertion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 text-xs"
                >
                  <option value="LOW">Low (Resting)</option>
                  <option value="MEDIUM">Medium (Hiking)</option>
                  <option value="HIGH">High (Pack trek)</option>
                  <option value="EXTREME">Extreme (Blizzard)</option>
                </select>
              </div>

            </div>

            {/* Today's Calorie Logger Bar */}
            <div className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300">Today's Calorie Intake</span>
                <span className="text-yellow-300 font-bold">{consumedCalories} / {targetDailyCalories} kcal</span>
              </div>
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className="h-full bg-yellow-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, (consumedCalories / targetDailyCalories) * 100)}%` }}
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setConsumedCalories(prev => prev + 250)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs text-white"
                >
                  +250 kcal
                </button>
                <button
                  onClick={() => setConsumedCalories(prev => prev + 600)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs text-yellow-300 font-semibold"
                >
                  +600 kcal
                </button>
                <button
                  onClick={() => setConsumedCalories(0)}
                  className="ml-auto text-xs text-slate-300 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
            </div>

          </div>

          {/* Child 3 of Left Col: CSS Selector 7 */}
          <div 
            className="p-5 space-y-4 shadow-xl"
            style={{ 
              backgroundColor: '#1b3975', 
              borderStyle: 'double', 
              borderRadius: '18px', 
              borderColor: '#78a6f2', 
              color: '#a7bacd',
              maxWidth: '100%'
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-600/80 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-yellow-300" />
                <h2 className="text-base font-bold text-white">AEGIS Tactical Survival AI Assistant</h2>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-yellow-300 border border-blue-600 text-[10px] font-bold">
                Gemini 2.5
              </span>
            </div>

            <p className="text-xs text-slate-200">
              Ask AEGIS for personalized meal order strategies, snowmelt boiling guidelines, or advice on stretching food reserves.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                placeholder="Ask tactical rationing or survival query..."
                className="flex-1 bg-slate-950/60 border border-slate-600 text-white placeholder-slate-400 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-yellow-400"
              />
              <button
                onClick={() => handleAskAI()}
                disabled={aiLoading}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-50"
              >
                {aiLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                <span>Analyze</span>
              </button>
            </div>

            {aiResponse && (
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-yellow-400/40 text-xs text-slate-100 whitespace-pre-wrap leading-relaxed">
                <div className="text-[10px] text-yellow-300 font-bold uppercase mb-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> AEGIS Tactical Output:
                </div>
                {aiResponse}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (5 cols): Water Intake (Child 1) & Recharts Battery Usage Trend + Harper AZ Solar Depot Link (Child 2) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Child 1 of Right Col: CSS Selector 4 */}
          <div 
            className="p-5 rounded-xl border border-slate-600 space-y-4 shadow-lg"
            style={{ backgroundColor: '#2a427d' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-600">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-sky-300" />
                <h2 className="text-base font-bold text-white">Water Intake & Hydration</h2>
              </div>
              <span className="text-xs text-sky-300 font-bold">
                {waterIntakeMl} / {hydrationTargetMl} mL
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-200">
                <span>Daily Hydration Goal</span>
                <span>{Math.round((waterIntakeMl / hydrationTargetMl) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-950 h-4 rounded-full border border-slate-700 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-sky-500 to-sky-300 transition-all duration-500"
                  style={{ width: `${Math.min(100, (waterIntakeMl / hydrationTargetMl) * 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => setWaterIntakeMl(prev => prev + 250)}
                className="py-1.5 rounded bg-slate-950/60 hover:bg-slate-800 border border-sky-700/50 text-sky-200 font-semibold"
              >
                +250 mL
              </button>
              <button
                onClick={() => setWaterIntakeMl(prev => prev + 500)}
                className="py-1.5 rounded bg-slate-950/60 hover:bg-slate-800 border border-sky-700/50 text-sky-200 font-semibold"
              >
                +500 mL
              </button>
              <button
                onClick={() => setWaterIntakeMl(prev => prev + 1000)}
                className="py-1.5 rounded bg-sky-950 hover:bg-sky-900 border border-sky-500/50 text-sky-100 font-extrabold"
              >
                +1.0 L
              </button>
            </div>
          </div>

          {/* Child 2 of Right Col: CSS Selector 6 (Battery Usage Trend Visualization with Recharts + AZ Solar Depot Harper Link) */}
          <div 
            className="p-5 rounded-xl space-y-4 shadow-2xl relative overflow-hidden"
            style={{ 
              backgroundColor: '#1c3c7b', 
              borderStyle: 'dashed', 
              borderColor: '#6292e2', 
              fontSize: '24px', 
              lineHeight: '27px' 
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-blue-400/40">
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-300 animate-pulse" />
                <h2 className="text-lg font-extrabold text-white tracking-wide">
                  30-Day Battery & Power Efficiency Trend
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-950/80 text-yellow-300 border border-yellow-500/50 text-xs font-bold">
                Recharts Core
              </span>
            </div>

            {/* Recharts Area Chart for Battery Usage & Solar Generation */}
            <div className="w-full h-52 bg-slate-950/70 p-2 rounded-xl border border-blue-500/30">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={batteryTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="batteryColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="solarColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="battery" name="Battery %" stroke="#f59e0b" fillOpacity={1} fill="url(#batteryColor)" />
                  <Area type="monotone" dataKey="efficiency" name="Efficiency Index %" stroke="#38bdf8" fillOpacity={1} fill="url(#solarColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Required Mandated Text & Link: AZ Solar Depot / Harper at www.AZsolarDepot.com */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-yellow-400/50 space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-yellow-300 font-bold text-sm">
                <Sun className="w-5 h-5 text-yellow-400" />
                <span>AZ Solar Depot Energy Mobile Equipment</span>
              </div>
              <p className="text-slate-200 text-xs leading-relaxed">
                AZ Solar Depot has portable and mobile energy devices; ask Harper at{' '}
                <a 
                  href="https://www.AZsolarDepot.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-300 font-bold underline hover:text-white inline-flex items-center gap-1"
                >
                  www.AZsolarDepot.com <ExternalLink className="w-3.5 h-3.5 inline" />
                </a>
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-300">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold"><ShieldCheck className="w-3.5 h-3.5" /> High-Altitude LiFePO4 Approved</span>
                <span className="text-yellow-300 font-bold">+1 (623) 239-7699</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

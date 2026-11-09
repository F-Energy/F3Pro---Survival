import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Scale, 
  Luggage, 
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { GearItem, TripScenario } from '../types/survival';
import { getSavedGear, saveGear, INITIAL_GEAR } from '../services/storage';

interface GearChecklistProps {
  scenario: TripScenario;
}

export const GearChecklist: React.FC<GearChecklistProps> = ({ scenario }) => {
  const [gear, setGear] = useState<GearItem[]>(getSavedGear());
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCat, setNewItemCat] = useState<GearItem['category']>('CLOTHING_TOOLS');
  const [newItemWeightG, setNewItemWeightG] = useState(300);

  const togglePacked = (id: string) => {
    const updated = gear.map(item => {
      if (item.id === id) return { ...item, packed: !item.packed };
      return item;
    });
    setGear(updated);
    saveGear(updated);
  };

  const addCustomGear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: GearItem = {
      id: `gear-user-${Date.now()}`,
      name: newItemName,
      category: newItemCat,
      packed: true,
      weightGrams: Number(newItemWeightG),
      essentialLevel: 'HIGH',
    };

    const updated = [newItem, ...gear];
    setGear(updated);
    saveGear(updated);
    setNewItemName('');
  };

  // Weight Math
  const totalWeightG = gear.reduce((sum, item) => sum + (item.packed ? item.weightGrams : 0), 0);
  const totalWeightKg = (totalWeightG / 1000).toFixed(2);
  const totalWeightLbs = (totalWeightG / 453.592).toFixed(1);

  const packedCount = gear.filter(g => g.packed).length;
  const progressPercent = Math.round((packedCount / gear.length) * 100);

  const filteredGear = gear.filter(g => filterCategory === 'ALL' || g.category === filterCategory);

  const resetPresetForScenario = (sc: TripScenario) => {
    setGear(INITIAL_GEAR);
    saveGear(INITIAL_GEAR);
  };

  return (
    <div className="space-y-6 pb-12 font-mono">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0b1426] border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-yellow-400 mb-1">
            <Luggage className="w-4 h-4" />
            <span>EXPEDITION GEAR ENGINE</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">Personalized Survival Gear Checklist & Load Calculator</h1>
          <p className="text-xs text-slate-400 mt-1">
            Packed Items: {packedCount} / {gear.length} ({progressPercent}%) · Total Payload: {totalWeightKg} kg ({totalWeightLbs} lbs)
          </p>
        </div>

        {/* Load Preset Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => resetPresetForScenario(scenario)}
            className="px-3 py-1.5 bg-[#060b17] hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs rounded-lg flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-yellow-400" />
            <span>Reset Preset</span>
          </button>
        </div>
      </div>

      {/* Payload & Weight Ergonomics Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Pack Load */}
        <div className="p-4 rounded-xl bg-[#0b1426] border border-slate-800 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs text-slate-400">Total Pack Load</div>
            <div className="text-2xl font-extrabold text-yellow-400 mt-1">{totalWeightKg} kg</div>
            <div className="text-[10px] text-slate-400">{totalWeightLbs} lbs load</div>
          </div>
          <Scale className="w-8 h-8 text-yellow-400/40" />
        </div>

        {/* Packing Progress */}
        <div className="p-4 rounded-xl bg-[#0b1426] border border-slate-800 shadow-lg">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Gear Prepared</span>
            <span className="text-emerald-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-[#060b17] h-3 rounded-full overflow-hidden border border-slate-800 mt-2">
            <div 
              className="h-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-2">
            {gear.length - packedCount} critical items remaining to pack.
          </div>
        </div>

        {/* Ergonomics & Load Distribution Status */}
        <div className="p-4 rounded-xl bg-[#0b1426] border border-slate-800 text-xs space-y-1 shadow-lg">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" /> Ergonomics Load Rating
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {Number(totalWeightKg) > 25 
              ? 'Warning: Payload exceeds 25kg (55 lbs). Consider dropping non-essential shelter gear or sharing load with team.' 
              : 'Pack payload is within optimal mountain endurance threshold (<25kg).'}
          </p>
        </div>

      </div>

      {/* Add Custom Gear & Category Filter */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        
        {/* Add Gear Form */}
        <form onSubmit={addCustomGear} className="md:col-span-8 flex flex-wrap sm:flex-nowrap gap-2 bg-[#0b1426] p-3 rounded-xl border border-slate-800 shadow-lg">
          <input
            type="text"
            required
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Add custom gear item (e.g. Cold Weather Gloves)..."
            className="flex-1 bg-[#060b17] border border-slate-800 text-slate-100 placeholder-slate-500 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-yellow-400"
          />
          <input
            type="number"
            value={newItemWeightG}
            onChange={(e) => setNewItemWeightG(Number(e.target.value))}
            placeholder="Weight (g)"
            className="w-24 bg-[#060b17] border border-slate-800 text-slate-100 rounded-lg px-2 py-1.5 text-xs"
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Gear
          </button>
        </form>

        {/* Category Filter */}
        <div className="md:col-span-4 flex items-center">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-[#0b1426] border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-3"
          >
            <option value="ALL">All Categories</option>
            <option value="SHELTER_SLEEP">Shelter & Sleeping</option>
            <option value="WATER_PURIFICATION">Water Purification</option>
            <option value="NAVIGATION_COMM">Navigation & Comm</option>
            <option value="FIRE_LIGHT">Fire & Lighting</option>
            <option value="COOKING_NUTRITION">Cooking & Stove</option>
            <option value="FIRST_AID_HYGIENE">First Aid & Trauma</option>
            <option value="CLOTHING_TOOLS">Tools & Clothing</option>
          </select>
        </div>

      </div>

      {/* Gear Checklist Items */}
      <div className="bg-[#0b1426] border border-slate-800 rounded-xl p-4 space-y-2 shadow-xl">
        {filteredGear.map((item) => (
          <div
            key={item.id}
            onClick={() => togglePacked(item.id)}
            className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
              item.packed
                ? 'bg-[#060b17] border-slate-800 text-slate-200'
                : 'bg-[#0b1426]/60 border-slate-800/60 text-slate-500 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <button className="text-yellow-400 shrink-0">
                {item.packed ? <CheckSquare className="w-5 h-5 text-yellow-400" /> : <Square className="w-5 h-5 text-slate-600" />}
              </button>
              <div>
                <div className={`text-xs font-bold ${item.packed ? 'text-slate-100' : 'text-slate-400 line-through'}`}>
                  {item.name}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>Category: {item.category.replace('_', ' ')}</span>
                  {item.notes && <span>· {item.notes}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs shrink-0">
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                item.essentialLevel === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-[#060b17] text-slate-400'
              }`}>
                {item.essentialLevel}
              </span>
              <span className="text-slate-300 font-bold">{item.weightGrams}g</span>
            </div>
          </div>
        ))}

        {filteredGear.length === 0 && (
          <div className="text-center py-6 text-slate-400 text-xs">
            No gear items in this category.
          </div>
        )}
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Trash2, 
  Edit3,
  Clock, 
  Droplets, 
  Flame, 
  Zap, 
  HeartPulse, 
  Wrench,
  Utensils,
  Check
} from 'lucide-react';
import { InventoryItem, SupplyCategory } from '../types/survival';

interface FoodInventoryProps {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

export const FoodInventory: React.FC<FoodInventoryProps> = ({
  inventory,
  setInventory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [perishableOnly, setPerishableOnly] = useState(false);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // New item form state
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<SupplyCategory>('STAPLE_FOOD');
  const [itemQty, setItemQty] = useState(1);
  const [itemUnit, setItemUnit] = useState('pouches');
  const [itemCalories, setItemCalories] = useState(500);
  const [itemWeightOz, setItemWeightOz] = useState(8);
  const [itemExpDate, setItemExpDate] = useState('2027-12-31');
  const [itemPerishable, setItemPerishable] = useState(false);
  const [itemMinThreshold, setItemMinThreshold] = useState(2);
  const [itemLocation, setItemLocation] = useState('Crate A');

  // Open add modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setItemName('');
    setItemCategory('STAPLE_FOOD');
    setItemQty(1);
    setItemUnit('pouches');
    setItemCalories(500);
    setItemWeightOz(8);
    setItemExpDate('2027-12-31');
    setItemPerishable(false);
    setItemMinThreshold(2);
    setItemLocation('Crate A');
    setIsAddModalOpen(true);
  };

  // Open edit modal for item
  const handleOpenEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCategory(item.category);
    setItemQty(item.quantity);
    setItemUnit(item.unit);
    setItemCalories(item.caloriesPerUnit);
    setItemWeightOz(item.weightOz);
    setItemExpDate(item.expirationDate);
    setItemPerishable(item.perishable);
    setItemMinThreshold(item.minThreshold);
    setItemLocation(item.location);
    setIsAddModalOpen(true);
  };

  // Filter items
  const filteredItems = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesPerishable = !perishableOnly || item.perishable;
    return matchesSearch && matchesCat && matchesPerishable;
  });

  // Calculate Expiration Status
  const getExpStatus = (expDateStr: string, isPerishable: boolean) => {
    const expTime = new Date(expDateStr).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'EXPIRED', color: 'bg-red-950 text-red-400 border-red-800' };
    if (diffDays <= 7 || isPerishable) return { label: `Exp: ${diffDays}d`, color: 'bg-yellow-950/60 text-yellow-400 border-yellow-700/50' };
    return { label: 'Fresh', color: 'bg-emerald-950 text-emerald-400 border-emerald-800' };
  };

  const getCategoryIcon = (cat: SupplyCategory) => {
    switch (cat) {
      case 'WATER': return <Droplets className="w-4 h-4 text-sky-400" />;
      case 'PERISHABLE_FOOD': return <Utensils className="w-4 h-4 text-red-400" />;
      case 'STAPLE_FOOD': return <Package className="w-4 h-4 text-yellow-400" />;
      case 'FREEZE_DRIED': return <Flame className="w-4 h-4 text-orange-400" />;
      case 'FUEL': return <Flame className="w-4 h-4 text-amber-500" />;
      case 'POWER_BATTERY': return <Zap className="w-4 h-4 text-yellow-300" />;
      case 'MEDICAL': return <HeartPulse className="w-4 h-4 text-rose-400" />;
      default: return <Wrench className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    if (editingItem) {
      // Update existing item
      setInventory(prev => prev.map(i => {
        if (i.id === editingItem.id) {
          return {
            ...i,
            name: itemName.trim(),
            category: itemCategory,
            quantity: Number(itemQty),
            unit: itemUnit,
            caloriesPerUnit: Number(itemCalories),
            weightOz: Number(itemWeightOz),
            expirationDate: itemExpDate,
            perishable: itemPerishable,
            minThreshold: Number(itemMinThreshold),
            location: itemLocation,
          };
        }
        return i;
      }));
    } else {
      // Add new item
      const item: InventoryItem = {
        id: `inv-user-${Date.now()}`,
        name: itemName.trim(),
        category: itemCategory,
        quantity: Number(itemQty),
        unit: itemUnit,
        caloriesPerUnit: Number(itemCalories),
        weightOz: Number(itemWeightOz),
        expirationDate: itemExpDate,
        perishable: itemPerishable,
        minThreshold: Number(itemMinThreshold),
        location: itemLocation,
      };

      setInventory(prev => [item, ...prev]);
    }

    setIsAddModalOpen(false);
  };

  const handleQtyChange = (id: string, delta: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const updated = Math.max(0, item.quantity + delta);
        return { ...item, quantity: updated };
      }
      return item;
    }));
  };

  const handleDeleteItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6 pb-12 font-mono">
      
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0b1426] border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-yellow-400 mb-1">
            <Package className="w-4 h-4" />
            <span>RATION & INVENTORY DATABASE</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">Food & Survival Supply Inventory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Total Items: {inventory.length} | Depleted Alerts: {inventory.filter(i => i.quantity <= i.minThreshold).length}
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-md shadow-yellow-400/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Supply Item</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name or storage location..."
            className="w-full bg-[#060b17] border border-slate-800 text-slate-100 placeholder-slate-500 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-yellow-400"
          />
        </div>

        <div className="md:col-span-7 flex items-center gap-2 overflow-x-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#060b17] border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400"
          >
            <option value="ALL">All Categories</option>
            <option value="WATER">Water</option>
            <option value="PERISHABLE_FOOD">Perishable Food</option>
            <option value="STAPLE_FOOD">Staple Food</option>
            <option value="FREEZE_DRIED">Freeze-Dried MRE</option>
            <option value="FUEL">Stove Fuel</option>
            <option value="POWER_BATTERY">Power & Battery</option>
            <option value="MEDICAL">Medical & First Aid</option>
          </select>

          <button
            onClick={() => setPerishableOnly(!perishableOnly)}
            className={`px-3 py-2 text-xs rounded-lg border whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              perishableOnly ? 'bg-yellow-400 text-slate-950 font-bold border-yellow-400' : 'bg-[#060b17] text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Expiring Only</span>
          </button>
        </div>
      </div>

      {/* Inventory Table / Grid */}
      <div className="bg-[#0b1426] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#060b17] border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3 font-semibold">Item & Category</th>
                <th className="px-4 py-3 font-semibold">Quantity</th>
                <th className="px-4 py-3 font-semibold">Calories / Unit</th>
                <th className="px-4 py-3 font-semibold">Weight</th>
                <th className="px-4 py-3 font-semibold">Expiration & Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map((item) => {
                const status = getExpStatus(item.expirationDate, item.perishable);
                const isLow = item.quantity <= item.minThreshold;

                return (
                  <tr key={item.id} className={`hover:bg-slate-800/30 transition-colors ${isLow ? 'bg-yellow-950/10' : ''}`}>
                    
                    {/* Item & Category */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-[#060b17] border border-slate-800 shrink-0">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 flex items-center gap-2">
                            <span>{item.name}</span>
                            {isLow && (
                              <span className="px-1.5 py-0.2 bg-red-950 text-red-400 border border-red-800 text-[9px] font-bold rounded">
                                LOW STOCK
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {item.category.replace('_', ' ')} · Location: {item.location}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Quantity Selector */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQtyChange(item.id, -1)}
                          className="w-6 h-6 rounded bg-[#060b17] border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-xs"
                          title="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="font-bold text-slate-100 min-w-[40px] text-center">
                          {item.quantity} {item.unit}
                        </span>
                        <button
                          onClick={() => handleQtyChange(item.id, 1)}
                          className="w-6 h-6 rounded bg-[#060b17] border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-xs"
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Calories */}
                    <td className="px-4 py-3.5 font-bold text-yellow-400">
                      {item.caloriesPerUnit > 0 ? `${(item.caloriesPerUnit * item.quantity).toLocaleString()} kcal total` : 'N/A'}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {item.caloriesPerUnit} kcal/{item.unit}
                      </div>
                    </td>

                    {/* Weight */}
                    <td className="px-4 py-3.5 text-slate-300">
                      {(item.weightOz * item.quantity).toFixed(1)} oz
                    </td>

                    {/* Expiration */}
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${status.color}`}>
                        {status.label}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {item.expirationDate}
                      </div>
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-yellow-400 rounded hover:bg-slate-800 transition-colors"
                          title="Edit supply item details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
                          title="Delete supply item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">
                    No matching inventory items found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
          <div className="bg-[#0b1426] border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              {editingItem ? <Edit3 className="w-5 h-5 text-yellow-400" /> : <Plus className="w-5 h-5 text-yellow-400" />}
              <span>{editingItem ? 'Edit Inventory Item' : 'Add New Supply / Food Item'}</span>
            </h2>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Organic Dried Cranberries"
                  className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2 focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={itemCategory}
                    onChange={(e: any) => setItemCategory(e.target.value)}
                    className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2 focus:outline-none focus:border-yellow-400"
                  >
                    <option value="PERISHABLE_FOOD">Perishable Food</option>
                    <option value="STAPLE_FOOD">Staple Food</option>
                    <option value="FREEZE_DRIED">Freeze-Dried MRE</option>
                    <option value="WATER">Water</option>
                    <option value="FUEL">Stove Fuel</option>
                    <option value="POWER_BATTERY">Power & Battery</option>
                    <option value="MEDICAL">Medical</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Quantity & Unit</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      value={itemQty}
                      onChange={(e) => setItemQty(Number(e.target.value))}
                      className="w-16 bg-[#060b17] border border-slate-800 text-slate-100 rounded px-2 py-2"
                    />
                    <input
                      type="text"
                      value={itemUnit}
                      onChange={(e) => setItemUnit(e.target.value)}
                      className="flex-1 bg-[#060b17] border border-slate-800 text-slate-100 rounded px-2 py-2"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Calories Per Unit</label>
                  <input
                    type="number"
                    value={itemCalories}
                    onChange={(e) => setItemCalories(Number(e.target.value))}
                    className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Weight (oz)</label>
                  <input
                    type="number"
                    value={itemWeightOz}
                    onChange={(e) => setItemWeightOz(Number(e.target.value))}
                    className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Expiration Date</label>
                  <input
                    type="date"
                    value={itemExpDate}
                    onChange={(e) => setItemExpDate(e.target.value)}
                    className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Storage Location</label>
                  <input
                    type="text"
                    value={itemLocation}
                    onChange={(e) => setItemLocation(e.target.value)}
                    className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="perish"
                  checked={itemPerishable}
                  onChange={(e) => setItemPerishable(e.target.checked)}
                  className="accent-yellow-400"
                />
                <label htmlFor="perish" className="text-slate-300">Item is Perishable (Expiring within 7 days)</label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded font-bold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? 'Save Changes' : 'Save New Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

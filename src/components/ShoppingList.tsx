import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  CheckSquare, 
  Square, 
  Copy, 
  Check, 
  RefreshCw,
  Smartphone,
  Users
} from 'lucide-react';
import { InventoryItem, ShoppingListItem } from '../types/survival';
import { generateAutoShoppingList } from '../services/storage';

interface ShoppingListProps {
  inventory: InventoryItem[];
}

export const ShoppingList: React.FC<ShoppingListProps> = ({ inventory }) => {
  const [items, setItems] = useState<ShoppingListItem[]>(() => generateAutoShoppingList(inventory));
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('STAPLE_FOOD');
  const [newItemQty, setNewItemQty] = useState(2);
  const [copiedSync, setCopiedSync] = useState(false);
  const [syncCodeInput, setSyncCodeInput] = useState('');
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const togglePurchased = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) return { ...item, purchased: !item.purchased };
      return item;
    }));
  };

  const handleAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ShoppingListItem = {
      id: `shop-manual-${Date.now()}`,
      name: newItemName,
      category: newItemCategory as any,
      currentQty: 0,
      targetQty: Number(newItemQty),
      unit: 'items',
      purchased: false,
      urgent: true,
    };

    setItems(prev => [newItem, ...prev]);
    setNewItemName('');
  };

  // Generate Device-to-Device Offline Sync Code
  const syncPayload = btoa(JSON.stringify({
    timestamp: Date.now(),
    device: 'AEGIS-NODE-ALPHA',
    itemsCount: items.length,
    shoppingItems: items,
  }));

  const handleCopySyncCode = () => {
    navigator.clipboard.writeText(syncPayload);
    setCopiedSync(true);
    setTimeout(() => setCopiedSync(false), 2500);
  };

  const handleImportSyncCode = () => {
    if (!syncCodeInput.trim()) return;
    try {
      const decoded = JSON.parse(atob(syncCodeInput.trim()));
      if (decoded.shoppingItems && Array.isArray(decoded.shoppingItems)) {
        setItems(decoded.shoppingItems);
        setSyncStatusMsg(`Successfully synced ${decoded.shoppingItems.length} items from P2P peer node (${decoded.device || 'Peer'}).`);
        setSyncCodeInput('');
      } else {
        setSyncStatusMsg('Invalid sync code structure.');
      }
    } catch {
      setSyncStatusMsg('Error decoding peer sync payload. Ensure full code was copied.');
    }
  };

  return (
    <div className="space-y-6 pb-12 font-mono">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0b1426] border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-yellow-400 mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span>AUTO-GENERATED SHOPPING & P2P SYNC ENGINE</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">Depleted Inventory Shopping List & Multi-Device Sync</h1>
          <p className="text-xs text-slate-400 mt-1">
            Auto-created from low inventory levels (<span className="text-yellow-400 font-bold">{items.filter(i => !i.purchased).length} pending items</span>).
          </p>
        </div>

        <button
          onClick={() => setItems(generateAutoShoppingList(inventory))}
          className="px-3 py-1.5 bg-[#060b17] hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs rounded-lg flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 text-yellow-400" />
          <span>Regenerate from Inventory</span>
        </button>
      </div>

      {/* Main Grid: Shopping List (7 cols) & Device Sync Drawer (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Shopping List Items */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Add Item Form */}
          <form onSubmit={handleAddManualItem} className="p-3 rounded-xl bg-[#0b1426] border border-slate-800 flex gap-2 shadow-lg">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Add shopping item (e.g. LifeStraw filter)..."
              className="flex-1 bg-[#060b17] border border-slate-800 text-slate-100 placeholder-slate-500 rounded-lg px-3 py-1.5 text-xs"
            />
            <input
              type="number"
              min="1"
              value={newItemQty}
              onChange={(e) => setNewItemQty(Number(e.target.value))}
              className="w-16 bg-[#060b17] border border-slate-800 text-slate-100 rounded-lg px-2 py-1.5 text-xs"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>

          {/* List Cards */}
          <div className="bg-[#0b1426] border border-slate-800 rounded-xl p-4 space-y-2 shadow-xl">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => togglePurchased(item.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  item.purchased
                    ? 'bg-[#060b17] border-slate-800 text-slate-500 opacity-60'
                    : 'bg-[#060b17] border-slate-800 text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button className="text-yellow-400 shrink-0">
                    {item.purchased ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5 text-slate-600" />}
                  </button>
                  <div>
                    <div className={`text-xs font-bold ${item.purchased ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Need: {item.targetQty} {item.unit} · Current Stock: {item.currentQty}
                    </div>
                  </div>
                </div>

                {item.urgent && !item.purchased && (
                  <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-800 text-[9px] font-bold rounded">
                    URGENT DEPLETION
                  </span>
                )}
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs">
                No items on shopping list. All inventory levels optimal!
              </div>
            )}
          </div>

        </div>

        {/* Device-to-Device P2P Offline Sync Simulator */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="p-5 rounded-xl bg-[#0b1426] border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-yellow-400" />
                <h2 className="text-base font-bold text-slate-100">Cross-Device Offline Sync</h2>
              </div>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold rounded">
                Local Mesh / QR
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Sync shopping lists & depleted inventory across family members' devices without cellular data or cloud dependency.
            </p>

            {/* Export Sync Code */}
            <div className="space-y-2 p-3 rounded-lg bg-[#060b17] border border-slate-800 text-xs">
              <div className="flex justify-between items-center text-slate-300 font-bold">
                <span>Device Export Payload (Copy/Share)</span>
                <Smartphone className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono break-all max-h-20 overflow-y-auto">
                {syncPayload.slice(0, 120)}...
              </div>
              <button
                onClick={handleCopySyncCode}
                className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedSync ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSync ? 'Sync Code Copied!' : 'Copy Device Sync Payload'}</span>
              </button>
            </div>

            {/* Import Sync Code */}
            <div className="space-y-2 p-3 rounded-lg bg-[#060b17] border border-slate-800 text-xs">
              <div className="text-slate-300 font-bold">Import Peer Device Payload</div>
              <input
                type="text"
                value={syncCodeInput}
                onChange={(e) => setSyncCodeInput(e.target.value)}
                placeholder="Paste code from another device..."
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 rounded px-2.5 py-1.5 text-xs font-mono"
              />
              <button
                onClick={handleImportSyncCode}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded transition-colors"
              >
                Sync with Peer Device
              </button>
            </div>

            {syncStatusMsg && (
              <div className="p-3 rounded bg-yellow-950/30 border border-yellow-700/50 text-yellow-300 text-xs font-mono">
                {syncStatusMsg}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

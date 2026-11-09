import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Sun, 
  Send, 
  Bell, 
  CheckCircle2, 
  Radio, 
  Zap, 
  Flame, 
  PhoneCall,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { PushNotification, LogisticsTicket, UserLocation } from '../types/survival';

interface LogisticsHubProps {
  userLocation: UserLocation;
  onOpenLocationModal: () => void;
}

export const LogisticsHub: React.FC<LogisticsHubProps> = ({ userLocation, onOpenLocationModal }) => {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [itemCategory, setItemCategory] = useState<string>('Solar & Battery Arrays');
  const [itemDetails, setItemDetails] = useState<string>('2x 200W Foldable Solar Kit + 512Wh LiFePO4 Battery');
  const [quantity, setQuantity] = useState<number>(1);
  const [dropCoords, setDropCoords] = useState<string>(
    `${userLocation.address}, ${userLocation.cityState} (${userLocation.lat}°N, ${userLocation.lng}°W)`
  );

  useEffect(() => {
    setDropCoords(`${userLocation.address}, ${userLocation.cityState} (${userLocation.lat}°N, ${userLocation.lng}°W)`);
  }, [userLocation]);
  const [urgency, setUrgency] = useState<'STANDARD' | 'HIGH' | 'EMERGENCY'>('HIGH');
  const [userNotes, setUserNotes] = useState<string>('Requesting extra MC4 extension cables if available.');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastTicket, setLastTicket] = useState<LogisticsTicket | null>(null);

  // Fetch Push Notifications from backend
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/logistics/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch {
      // Fallback notifications if server offline
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // Submit Text Notification request to Harper at AZ Solar Depot
  const handleSendDispatchText = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/logistics/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemCategory,
          itemDetails,
          quantity,
          dropCoordinates: dropCoords,
          urgency,
          userNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const ticket: LogisticsTicket = {
          ticketId: data.ticketId,
          itemCategory,
          itemDetails,
          quantity,
          status: 'SATELLITE_DISPATCHED',
          recipient: 'Harper @ AZ Solar Depot',
          recipientPhone: '+1 (623) 239-7699',
          dropCoordinates: dropCoords,
          urgency,
          timestamp: data.timestamp,
          etaNotes: data.estimatedETA,
        };
        setLastTicket(ticket);
        fetchNotifications();
      }
    } catch (err) {
      console.error('Dispatch error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPreset = (details: string, cat: string) => {
    setItemCategory(cat);
    setItemDetails(details);
  };

  return (
    <div className="space-y-6 pb-12 font-mono">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0b1426] border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-2 text-xs text-yellow-400 mb-1">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>SATELLITE LOGISTICS MANAGEMENT SYSTEM</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">AZ Solar Depot Dispatch & Supply Chain</h1>
          <p className="text-xs text-slate-400 mt-1">
            Direct text messaging link to <span className="text-yellow-400 font-bold">Harper</span> at <span className="text-yellow-400 font-bold">AZ Solar Depot (+1 623-239-7699)</span> for rapid energy replenishment.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#060b17] p-2.5 rounded-lg border border-slate-800 text-xs shrink-0">
          <PhoneCall className="w-4 h-4 text-emerald-400" />
          <div>
            <div className="text-slate-200 font-bold">Harper @ AZ Solar Depot</div>
            <div className="text-[10px] text-slate-400">+1 (623) 239-7699 · Sat-Link Active</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Request Form (7 cols) & Notification Feed (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Request Energy Supplies from Harper */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="p-5 rounded-xl bg-[#0b1426] border border-slate-800 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-yellow-400" />
                <h2 className="text-base font-bold text-slate-100">Request Energy & Power Supplies</h2>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-sky-400 border border-blue-800 font-bold">
                Sat-Text Direct
              </span>
            </div>

            {/* Quick Order Presets */}
            <div className="space-y-2">
              <div className="text-xs text-slate-400">Rapid Order Presets:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickPreset('2x 200W Foldable Solar Kit + 512Wh LiFePO4 Power Station', 'Solar & Battery')}
                  className="p-2.5 rounded bg-[#060b17] hover:bg-slate-800 border border-slate-800 text-left text-slate-200 hover:border-yellow-400/50 transition-colors"
                >
                  <div className="font-bold text-yellow-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> 200W Solar + 512Wh Battery
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Harper's top-rated mountain power bundle</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('5 Gal Propane Tank + 2000W Dual Fuel Generator', 'Fuel & Generator')}
                  className="p-2.5 rounded bg-[#060b17] hover:bg-slate-800 border border-slate-800 text-left text-slate-200 hover:border-yellow-400/50 transition-colors"
                >
                  <div className="font-bold text-orange-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> Propane + 2kW Generator
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">High-altitude power outage backup</div>
                </button>
              </div>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSendDispatchText} className="space-y-4 text-xs">
              
              <div>
                <label className="text-slate-400 block mb-1">Item Category</label>
                <input
                  type="text"
                  required
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                  className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Item Details / Specification</label>
                <textarea
                  required
                  rows={2}
                  value={itemDetails}
                  onChange={(e) => setItemDetails(e.target.value)}
                  className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Urgency Priority</label>
                  <select
                    value={urgency}
                    onChange={(e: any) => setUrgency(e.target.value)}
                    className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded-lg px-3 py-2"
                  >
                    <option value="STANDARD">Standard Logistics</option>
                    <option value="HIGH">High Priority (Within 2 hrs)</option>
                    <option value="EMERGENCY">Emergency (Immediate Drone/Convey)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 flex items-center justify-between">
                  <span>Drop Zone GPS Coordinates</span>
                  <MapPin className="w-3.5 h-3.5 text-yellow-400" />
                </label>
                <input
                  type="text"
                  value={dropCoords}
                  onChange={(e) => setDropCoords(e.target.value)}
                  className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Logistics Notes for Harper</label>
                <input
                  type="text"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Additional request details..."
                  className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded-lg px-3 py-2"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-yellow-400/20 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Transmitting Satellite Request...' : 'Send Text Notification to Harper @ AZ Solar Depot'}</span>
              </button>

            </form>

          </div>

          {/* Ticket Receipt Modal/Card */}
          {lastTicket && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/50 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Satellite Ticket Confirmed</span>
                <span>Ref: {lastTicket.ticketId}</span>
              </div>
              <p className="text-slate-200">
                Text notification successfully dispatched to <span className="font-bold text-yellow-400">{lastTicket.recipient} ({lastTicket.recipientPhone})</span>.
              </p>
              <div className="p-2.5 rounded bg-[#060b17] border border-slate-800 text-[11px] text-slate-400">
                ETA: {lastTicket.etaNotes} · Drop Point: {lastTicket.dropCoordinates}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Real-Time Satellite Push Notifications Feed */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="p-5 rounded-xl bg-[#0b1426] border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-400" />
                <h2 className="text-base font-bold text-slate-100">Live Satellite Logistics Notifications</h2>
              </div>
              <button
                onClick={fetchNotifications}
                className="p-1 text-slate-400 hover:text-slate-100 rounded"
                title="Refresh Push Feed"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[500px] overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-lg border space-y-1.5 transition-colors ${
                    notif.priority === 'URGENT'
                      ? 'bg-red-950/20 border-red-900/50'
                      : 'bg-[#060b17] border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-yellow-400 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> {notif.sender}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="font-semibold text-slate-100">{notif.title}</div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No active push notifications.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

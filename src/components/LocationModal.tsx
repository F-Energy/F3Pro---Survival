import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  X, 
  Check, 
  Compass, 
  Building, 
  Mountain,
  AlertCircle
} from 'lucide-react';
import { UserLocation } from '../types/survival';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: UserLocation;
  setUserLocation: (loc: UserLocation) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  userLocation,
  setUserLocation,
}) => {
  const [address, setAddress] = useState(userLocation.address || '');
  const [cityState, setCityState] = useState(userLocation.cityState || '');
  const [landmarkNotes, setLandmarkNotes] = useState(userLocation.landmarkNotes || '');
  const [elevationFt, setElevationFt] = useState(userLocation.elevationFt || 8650);
  const [isLocating, setIsLocating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Use browser GPS Geolocation
  const handleUseGPS = () => {
    if (!('geolocation' in navigator)) {
      setStatusMsg('GPS Geolocation not supported by this browser. Enter address manually.');
      return;
    }

    setIsLocating(true);
    setStatusMsg('Acquiring satellite GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));

        const updated: UserLocation = {
          ...userLocation,
          lat,
          lng,
          isManualAddress: false,
          updatedAt: new Date().toISOString(),
        };

        setUserLocation(updated);
        setIsLocating(false);
        setStatusMsg(`GPS Lock Acquired: ${lat}° N, ${lng}° W`);
      },
      (err) => {
        setIsLocating(false);
        setStatusMsg(`GPS Lock failed: ${err.message}. Please type manual address below.`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSaveManualAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    // Simple deterministic hash offset for coordinates if custom address is typed
    const simpleHash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mockLatOffset = ((simpleHash % 100) - 50) * 0.005;
    const mockLngOffset = ((simpleHash % 80) - 40) * 0.005;

    const newLat = Number((userLocation.lat + mockLatOffset).toFixed(4));
    const newLng = Number((userLocation.lng + mockLngOffset).toFixed(4));

    const updated: UserLocation = {
      address: address.trim(),
      cityState: cityState.trim() || 'Custom Sector',
      landmarkNotes: landmarkNotes.trim(),
      lat: newLat,
      lng: newLng,
      elevationFt: Number(elevationFt),
      isManualAddress: true,
      updatedAt: new Date().toISOString(),
    };

    setUserLocation(updated);
    setStatusMsg('Manual address saved and synced to SOS Beacon, Map, and Logistics!');
    setTimeout(() => {
      onClose();
      setStatusMsg(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
      <div className="bg-[#0b1426] border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-yellow-400" />
            <h2 className="text-base font-bold text-slate-100">Set Current Survival Location & Address</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Enter the exact physical address, landmark, or cabin location where you are currently located. This address will be attached to emergency SOS satellite alerts and logistics drop requests.
        </p>

        {/* GPS Quick Acquire Button */}
        <div className="p-3 rounded-lg bg-[#060b17] border border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-sky-400" /> Auto-Detect via GPS Satellite
            </div>
            <div className="text-[10px] text-slate-400">
              Current Lock: {userLocation.lat}° N, {userLocation.lng}° W
            </div>
          </div>
          <button
            onClick={handleUseGPS}
            disabled={isLocating}
            className="px-3 py-1.5 bg-sky-950 hover:bg-sky-900 border border-sky-600 text-sky-300 font-bold text-xs rounded transition-colors shrink-0 disabled:opacity-50"
          >
            {isLocating ? 'Locating...' : 'Acquire GPS'}
          </button>
        </div>

        {/* Manual Address Form */}
        <form onSubmit={handleSaveManualAddress} className="space-y-3 text-xs">
          
          <div>
            <label className="text-slate-400 block mb-1 font-bold flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-yellow-400" /> Street Address / Location Line 1
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 14820 Pike National Forest Ridge Rd"
              className="w-full bg-[#060b17] border border-slate-800 text-slate-100 placeholder-slate-500 rounded px-3 py-2 focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">City, State / ZIP</label>
              <input
                type="text"
                value={cityState}
                onChange={(e) => setCityState(e.target.value)}
                placeholder="e.g. Woodland Park, CO 80863"
                className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2 focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 flex items-center gap-1">
                <Mountain className="w-3.5 h-3.5 text-yellow-400" /> Elevation (ft)
              </label>
              <input
                type="number"
                value={elevationFt}
                onChange={(e) => setElevationFt(Number(e.target.value))}
                className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Landmark Notes / Cabin Sector Details</label>
            <input
              type="text"
              value={landmarkNotes}
              onChange={(e) => setLandmarkNotes(e.target.value)}
              placeholder="e.g. Red cabin 2 miles past North Ridge overlook"
              className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2"
            />
          </div>

          {statusMsg && (
            <div className="p-2.5 rounded bg-yellow-950/40 border border-yellow-700/50 text-yellow-300 text-xs font-mono">
              {statusMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold rounded shadow-lg shadow-yellow-400/20 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Address
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

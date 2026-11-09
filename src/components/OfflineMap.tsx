import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, 
  Droplets, 
  TreePine, 
  Radio, 
  Flame, 
  Mountain, 
  Plus, 
  Minus, 
  CheckCircle2,
  BookOpen,
  MapPin,
  Trash2,
  Check
} from 'lucide-react';
import { NaturalResource, ResourceType, UserLocation } from '../types/survival';
import { INITIAL_RESOURCES } from '../services/storage';

interface OfflineMapProps {
  userLocation: UserLocation;
  onOpenLocationModal: () => void;
}

export const OfflineMap: React.FC<OfflineMapProps> = ({ userLocation, onOpenLocationModal }) => {
  const [resources, setResources] = useState<NaturalResource[]>(INITIAL_RESOURCES);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedResource, setSelectedResource] = useState<NaturalResource | null>(INITIAL_RESOURCES[0]);
  
  // Custom Waypoint modal state
  const [isAddWaypointOpen, setIsAddWaypointOpen] = useState(false);
  const [wpName, setWpName] = useState('');
  const [wpType, setWpType] = useState<ResourceType>('WATER_SOURCE');
  const [wpLat, setWpLat] = useState<number>(userLocation.lat);
  const [wpLng, setWpLng] = useState<number>(userLocation.lng);
  const [wpElev, setWpElev] = useState<number>(userLocation.elevationFt);
  const [wpDesc, setWpDesc] = useState('');
  const [wpPrepNotes, setWpPrepNotes] = useState('');

  // Map Viewport state
  const [zoom, setZoom] = useState<number>(1.2);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [heading, setHeading] = useState<number>(42);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filter resources
  const filteredResources = resources.filter(
    r => selectedType === 'ALL' || r.type === selectedType
  );

  // Render Topo Canvas Map in Ocean Blue & Yellowish Gold
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background (Deep Nautical Navy background)
    ctx.fillStyle = '#060d1d';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    ctx.scale(zoom, zoom);

    // Draw Topographic Contour Lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    for (let r = 50; r < 600; r += 45) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Grid Coordinates
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.5;

    for (let x = -600; x <= 600; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, -600);
      ctx.lineTo(x, 600);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-600, x);
      ctx.lineTo(600, x);
      ctx.stroke();
    }

    // River / Water Contour Line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-350, -200);
    ctx.bezierCurveTo(-100, -100, 50, 100, 300, 250);
    ctx.stroke();

    // User GPS Location (Center Pin in Yellowish Gold)
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Heading Pointer Beam in Golden Amber Glow
    ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 90, (heading - 25) * Math.PI / 180, (heading + 25) * Math.PI / 180);
    ctx.fill();

    // Render Natural Resource Markers
    filteredResources.forEach((res) => {
      const dx = (res.lng - (-105.0441)) * 12000;
      const dy = -(res.lat - 38.8524) * 12000;

      const isSelected = selectedResource?.id === res.id;

      let markerColor = '#34d399';
      if (res.type === 'WATER_SOURCE') markerColor = '#38bdf8';
      if (res.type === 'SHELTER_SPOT') markerColor = '#c084fc';
      if (res.type === 'SIGNAL_SPOT') markerColor = '#fb7185';
      if (res.type === 'FIREWOOD_ZONE') markerColor = '#fb923c';

      ctx.fillStyle = markerColor;
      ctx.shadowColor = markerColor;
      ctx.shadowBlur = isSelected ? 15 : 5;
      
      ctx.beginPath();
      ctx.arc(dx, dy, isSelected ? 9 : 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (isSelected) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(dx, dy, 14, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = isSelected ? '#fef08a' : '#94a3b8';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(res.name, dx + 12, dy + 4);
    });

    ctx.restore();

  }, [zoom, pan, heading, filteredResources, selectedResource]);

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'WATER_SOURCE': return <Droplets className="w-4 h-4 text-sky-400" />;
      case 'EDIBLE_PLANT': return <TreePine className="w-4 h-4 text-emerald-400" />;
      case 'SHELTER_SPOT': return <Mountain className="w-4 h-4 text-purple-400" />;
      case 'SIGNAL_SPOT': return <Radio className="w-4 h-4 text-rose-400" />;
      case 'FIREWOOD_ZONE': return <Flame className="w-4 h-4 text-orange-400" />;
    }
  };

  const handleOpenAddWaypoint = () => {
    setWpName('My Custom Waypoint Cache');
    setWpType('WATER_SOURCE');
    setWpLat(userLocation.lat);
    setWpLng(userLocation.lng);
    setWpElev(userLocation.elevationFt);
    setWpDesc('Custom emergency stash marked during expedition.');
    setWpPrepNotes('Verify seal on water bladder before consumption.');
    setIsAddWaypointOpen(true);
  };

  const handleSaveWaypoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wpName.trim()) return;

    const newRes: NaturalResource = {
      id: `res-custom-${Date.now()}`,
      name: wpName.trim(),
      type: wpType,
      lat: Number(wpLat),
      lng: Number(wpLng),
      elevationFt: Number(wpElev),
      description: wpDesc.trim() || 'Custom user waypoint.',
      safetyRating: 'SAFE',
      prepNotes: wpPrepNotes.trim() || 'Custom notes.',
    };

    setResources(prev => [newRes, ...prev]);
    setSelectedResource(newRes);
    setIsAddWaypointOpen(false);
  };

  const handleDeleteWaypoint = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
    if (selectedResource?.id === id) {
      setSelectedResource(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-mono">
      
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0b1426] border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-yellow-400 mb-1">
            <Compass className="w-4 h-4" />
            <span>OFFLINE TOPOGRAPHIC & RESOURCE MATRIX</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">Mountain Sector Offline Map & Natural Resources</h1>
          <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
            <span className="text-yellow-400 font-bold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {userLocation.address}, {userLocation.cityState}
            </span>
            <span>·</span>
            <span>Lat: {userLocation.lat}° N · Lng: {userLocation.lng}° W · Elev: {userLocation.elevationFt.toLocaleString()} ft</span>
          </div>
        </div>

        {/* Change Address Button & Add Waypoint Button */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleOpenAddWaypoint}
            className="px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow"
          >
            <Plus className="w-3.5 h-3.5" /> Add Waypoint Pin
          </button>
          <button
            onClick={onOpenLocationModal}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-400 font-bold border border-yellow-400/40 text-xs flex items-center gap-1.5 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" /> Edit Current Address
          </button>
        </div>
      </div>

      {/* Filter Buttons Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-xs bg-[#0b1426] p-3 rounded-xl border border-slate-800">
        <span className="text-slate-400 font-bold mr-2">Filter Layer:</span>
        <button
          onClick={() => setSelectedType('ALL')}
          className={`px-3 py-1.5 rounded-lg border transition-colors ${selectedType === 'ALL' ? 'bg-yellow-400 text-slate-950 font-bold border-yellow-400' : 'bg-[#060b17] text-slate-400 border-slate-800 hover:text-slate-200'}`}
        >
          All ({resources.length})
        </button>
        <button
          onClick={() => setSelectedType('WATER_SOURCE')}
          className={`px-3 py-1.5 rounded-lg border transition-colors ${selectedType === 'WATER_SOURCE' ? 'bg-sky-400 text-slate-950 font-bold border-sky-400' : 'bg-[#060b17] text-slate-400 border-slate-800 hover:text-slate-200'}`}
        >
          Water
        </button>
        <button
          onClick={() => setSelectedType('EDIBLE_PLANT')}
          className={`px-3 py-1.5 rounded-lg border transition-colors ${selectedType === 'EDIBLE_PLANT' ? 'bg-emerald-400 text-slate-950 font-bold border-emerald-400' : 'bg-[#060b17] text-slate-400 border-slate-800 hover:text-slate-200'}`}
        >
          Edible Plants
        </button>
        <button
          onClick={() => setSelectedType('SHELTER_SPOT')}
          className={`px-3 py-1.5 rounded-lg border transition-colors ${selectedType === 'SHELTER_SPOT' ? 'bg-purple-400 text-slate-950 font-bold border-purple-400' : 'bg-[#060b17] text-slate-400 border-slate-800 hover:text-slate-200'}`}
        >
          Shelters
        </button>
        <button
          onClick={() => setSelectedType('SIGNAL_SPOT')}
          className={`px-3 py-1.5 rounded-lg border transition-colors ${selectedType === 'SIGNAL_SPOT' ? 'bg-rose-500 text-white font-bold border-rose-500' : 'bg-[#060b17] text-slate-400 border-slate-800 hover:text-slate-200'}`}
        >
          Sat Signal
        </button>
      </div>

      {/* Main Grid: Interactive Map (8 cols) & Detail Drawer (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Map Canvas Frame */}
        <div className="lg:col-span-8 rounded-xl bg-[#060d1d] border border-slate-800 overflow-hidden relative min-h-[480px] shadow-2xl">
          
          {/* Top Map HUD Overlay */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-[#060b17]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200 font-bold">GPS LOCK ACTIVE</span>
            <span className="text-slate-600">|</span>
            <span className="text-yellow-400">Heading: {heading}° NE</span>
          </div>

          {/* Zoom Controls */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 bg-[#060b17]/90 backdrop-blur-md p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setZoom(prev => Math.min(3, prev + 0.3))}
              className="p-2 text-slate-300 hover:text-yellow-400 hover:bg-slate-800 rounded"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(0.6, prev - 0.3))}
              className="p-2 text-slate-300 hover:text-yellow-400 hover:bg-slate-800 rounded"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Canvas Component */}
          <canvas
            ref={canvasRef}
            width={800}
            height={520}
            className="w-full h-full cursor-crosshair block"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left - rect.width / 2;
              const clickY = e.clientY - rect.top - rect.height / 2;
              
              let closest: NaturalResource | null = null;
              let minDistance = 99999;

              filteredResources.forEach(res => {
                const dx = (res.lng - (-105.0441)) * 12000;
                const dy = -(res.lat - 38.8524) * 12000;
                const dist = Math.hypot(clickX - dx * (rect.width/800), clickY - dy * (rect.height/520));
                if (dist < minDistance && dist < 40) {
                  minDistance = dist;
                  closest = res;
                }
              });

              if (closest) setSelectedResource(closest);
            }}
          />

          {/* Bottom Map Legend Overlay */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 bg-[#060b17]/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Water</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Edible Plant</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Shelter</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Satellite SOS</span>
            </div>
            <span className="text-slate-500">Scale: 1:24,000 USGS Topo</span>
          </div>

        </div>

        {/* Right Column (4 cols): Selected Natural Resource & Foraging Guide */}
        <div className="lg:col-span-4 space-y-4">
          
          {selectedResource ? (
            <div className="p-5 rounded-xl bg-[#0b1426] border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  {getResourceIcon(selectedResource.type)}
                  <h2 className="text-base font-bold text-slate-100">{selectedResource.name}</h2>
                </div>
                {selectedResource.id.startsWith('res-custom-') && (
                  <button
                    onClick={() => handleDeleteWaypoint(selectedResource.id)}
                    className="p-1 text-slate-500 hover:text-red-400 rounded"
                    title="Delete custom waypoint"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Coordinates & Distance */}
              <div className="p-3 rounded-lg bg-[#060b17] border border-slate-800 text-xs space-y-1">
                <div className="text-slate-400">Location Specs:</div>
                <div className="text-slate-200 font-bold">
                  {selectedResource.lat}° N, {selectedResource.lng}° W
                </div>
                <div className="text-yellow-400 text-[11px]">
                  Elevation: {selectedResource.elevationFt.toLocaleString()} ft
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 text-xs">
                <div className="text-slate-400 font-bold">Resource Description:</div>
                <p className="text-slate-300 leading-relaxed bg-[#060b17] p-2.5 rounded border border-slate-800">
                  {selectedResource.description}
                </p>
              </div>

              {/* Edible Plant Specific Guidelines */}
              {selectedResource.type === 'EDIBLE_PLANT' && (
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <BookOpen className="w-4 h-4" /> Wild Foraging & Identification Notes
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-400">Edible Parts:</span> {selectedResource.edibleParts || 'Leaves & Roots'}
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-400">Seasonality:</span> {selectedResource.seasonality || 'Spring-Autumn'}
                  </div>
                </div>
              )}

              {/* Preparation & Safety Protocol */}
              <div className="p-3 rounded-lg bg-yellow-950/20 border border-yellow-700/40 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Purification & Preparation Protocol
                </div>
                <p className="text-slate-300 leading-normal">
                  {selectedResource.prepNotes}
                </p>
              </div>

            </div>
          ) : (
            <div className="p-8 rounded-xl bg-[#0b1426] border border-slate-800 text-center text-slate-400 text-xs">
              Click any natural resource marker on the map to view detailed safety, foraging, and purification instructions.
            </div>
          )}

          {/* Quick List of Nearby Resources */}
          <div className="p-4 rounded-xl bg-[#0b1426] border border-slate-800 space-y-2 text-xs shadow-xl">
            <div className="text-slate-400 font-bold uppercase text-[10px] pb-1 border-b border-slate-800 flex justify-between">
              <span>Nearby Sector Resource Directory</span>
              <span>{resources.length} Points</span>
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {resources.map(res => (
                <button
                  key={res.id}
                  onClick={() => setSelectedResource(res)}
                  className={`w-full text-left p-2 rounded transition-colors flex items-center justify-between ${
                    selectedResource?.id === res.id ? 'bg-yellow-400/20 border border-yellow-400/50 text-yellow-300 font-bold' : 'bg-[#060b17] hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {getResourceIcon(res.type)}
                    <span className="truncate">{res.name}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0">{res.elevationFt} ft</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Add Waypoint Pin Modal */}
      {isAddWaypointOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1426] border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-yellow-400" /> Drop Custom Waypoint Pin
            </h2>

            <form onSubmit={handleSaveWaypoint} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Waypoint Name</label>
                <input
                  type="text"
                  required
                  value={wpName}
                  onChange={(e) => setWpName(e.target.value)}
                  className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Type</label>
                  <select
                    value={wpType}
                    onChange={(e: any) => setWpType(e.target.value)}
                    className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2"
                  >
                    <option value="WATER_SOURCE">Water Source</option>
                    <option value="EDIBLE_PLANT">Edible Plant</option>
                    <option value="SHELTER_SPOT">Shelter Spot</option>
                    <option value="SIGNAL_SPOT">Signal Spot</option>
                    <option value="FIREWOOD_ZONE">Firewood Zone</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Elevation (ft)</label>
                  <input
                    type="number"
                    value={wpElev}
                    onChange={(e) => setWpElev(Number(e.target.value))}
                    className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={wpLat}
                    onChange={(e) => setWpLat(Number(e.target.value))}
                    className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Longitude (°W)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={wpLng}
                    onChange={(e) => setWpLng(Number(e.target.value))}
                    className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description</label>
                <input
                  type="text"
                  value={wpDesc}
                  onChange={(e) => setWpDesc(e.target.value)}
                  className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Safety & Prep Notes</label>
                <input
                  type="text"
                  value={wpPrepNotes}
                  onChange={(e) => setWpPrepNotes(e.target.value)}
                  className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddWaypointOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded font-bold flex items-center gap-1"
                >
                  <Check className="w-4 h-4" /> Save Waypoint Pin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

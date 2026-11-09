import React, { useState } from 'react';
import { 
  Shield, 
  Battery, 
  Activity, 
  Radio, 
  AlertTriangle, 
  Menu, 
  X, 
  Sun, 
  Eye, 
  Zap,
  Lock,
  Compass,
  ShoppingBag,
  Package,
  MapPin,
  CloudLightning,
  Truck,
  Flame
} from 'lucide-react';
import { UserLocation, AppPowerMode } from '../types/survival';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  powerMode: AppPowerMode;
  setPowerMode: (mode: AppPowerMode) => void;
  batteryLevel: number;
  shakeEnabled: boolean;
  setShakeEnabled: (enabled: boolean) => void;
  triggerSOSManual: () => void;
  unreadNotifsCount: number;
  userLocation: UserLocation;
  onOpenLocationModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  powerMode,
  setPowerMode,
  batteryLevel,
  shakeEnabled,
  setShakeEnabled,
  triggerSOSManual,
  unreadNotifsCount,
  userLocation,
  onOpenLocationModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);

  const navLinks = [
    { id: 'rationing', label: 'Rationing & Forecast', icon: Activity },
    { id: 'inventory', label: 'Food Inventory', icon: Package },
    { id: 'map', label: 'Offline Map & Resources', icon: MapPin },
    { id: 'gear', label: 'Gear Checklist', icon: Compass },
    { id: 'logistics', label: 'AZ Solar Logistics', icon: Truck, badge: unreadNotifsCount > 0 ? unreadNotifsCount : null },
    { id: 'weather', label: 'Satellite Weather', icon: CloudLightning },
    { id: 'shopping', label: 'Shopping & Sync', icon: ShoppingBag },
    { id: 'vault', label: 'Encrypted Vault', icon: Lock },
  ];

  return (
    <header 
      className="sticky top-0 z-40 backdrop-blur-md border-b border-[#1b6d85] text-white shadow-xl shadow-slate-950/30"
      style={{ backgroundColor: '#108bd3' }}
    >
      {/* Top Utility Bar: CSS Selector 1 */}
      <div 
        className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4"
        style={{ backgroundColor: '#062790' }}
      >
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-11 h-11 rounded-xl bg-slate-950/20 border border-white/30 flex items-center justify-center text-yellow-300 shadow-md shadow-slate-950/20">
            {/* CSS Selector 5 */}
            <Shield 
              className="w-6 h-6 text-yellow-300 rounded" 
              style={{ backgroundColor: '#090dee' }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              {/* CSS Selector 7 */}
              <span 
                className="font-mono font-extrabold tracking-wider text-[22px] sm:text-[24px] leading-[30px] text-white uppercase drop-shadow-sm px-1 rounded"
                style={{ backgroundColor: '#062790' }}
              >
                F3Pro~{/* CSS Selector 6 */}<span 
                  className="text-yellow-300 px-1 rounded"
                  style={{ backgroundColor: '#062790' }}
                >SURVIVAL #111</span>
              </span>
              <span className="hidden xl:inline-block px-2 py-0.5 text-[11px] font-mono font-bold uppercase bg-slate-950/40 text-sky-200 border border-white/20 rounded-md">
                100% Offline
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 overflow-x-auto py-1.5">
          {navLinks.map((link, idx) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`relative px-3.5 py-2 text-xs xl:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap min-h-[44px] ${
                  isActive
                    ? 'bg-yellow-400 text-slate-950 font-bold shadow-lg shadow-black/20 scale-105'
                    : 'text-slate-100 hover:text-yellow-200 hover:bg-slate-950/20'
                }`}
                style={idx === 0 ? { fontSize: '12px' } : undefined} // CSS Selector 2
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="ml-1 px-1.5 py-0.2 bg-red-600 text-white font-mono text-[10px] rounded-full font-bold shadow">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Controls */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* button 1: Manual Address Button (CSS Selector 3) */}
          <button
            onClick={onOpenLocationModal}
            className="px-3 py-2 rounded-lg bg-slate-950/30 hover:bg-slate-950/40 border border-white/30 text-xs sm:text-sm font-mono text-white flex items-center gap-2 transition-colors max-w-[170px] sm:max-w-[240px] min-h-[44px]"
            title={`Current Address: ${userLocation.address}, ${userLocation.cityState}. Click to change.`}
          >
            <MapPin className="w-4 h-4 text-yellow-300 shrink-0" />
            <span style={{ fontSize: '12px' }} className="truncate font-medium">
              {userLocation.address ? userLocation.address.split(',')[0] : 'Set Address'}
            </span>
          </button>

          {/* div 1: Battery Status (CSS Selector 4) */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-950/30 border border-white/20 font-mono text-white min-h-[44px]">
            <Battery className={`w-4 h-4 ${batteryLevel <= 20 ? 'text-red-400 animate-pulse' : 'text-yellow-300'}`} />
            <span className="font-bold text-xs sm:text-sm">{batteryLevel}%</span>
          </div>

          {/* button 2: Power Mode Selector */}
          <div className="relative">
            <button
              onClick={() => setModeMenuOpen(!modeMenuOpen)}
              className="px-3 py-2 rounded-lg bg-slate-950/30 hover:bg-slate-950/40 border border-white/30 text-xs sm:text-sm font-mono font-bold text-yellow-300 flex items-center gap-1.5 transition-colors min-h-[44px]"
              title="Change Display & Battery Power Mode"
            >
              {powerMode === 'RED_VISION_NIGHT' && <Eye className="w-4 h-4 text-red-300" />}
              {powerMode === 'OLED_BATTERY_SAVER' && <Zap className="w-4 h-4 text-sky-200" />}
              {powerMode === 'STANDARD_TACTICAL' && <Sun className="w-4 h-4 text-yellow-300" />}
              {powerMode === 'MINIMAL_EMERGENCY' && <Flame className="w-4 h-4 text-red-300" />}
              <span className="hidden md:inline">
                {powerMode === 'RED_VISION_NIGHT' ? 'Red Night' : powerMode === 'OLED_BATTERY_SAVER' ? 'OLED Saver' : powerMode === 'MINIMAL_EMERGENCY' ? 'Emergency' : 'Standard'}
              </span>
            </button>

            {modeMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-xs font-mono">
                <div className="px-3 py-2 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-semibold">
                  Select Power Mode
                </div>
                <button
                  onClick={() => { setPowerMode('STANDARD_TACTICAL'); setModeMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-slate-800 ${powerMode === 'STANDARD_TACTICAL' ? 'text-yellow-400 font-bold' : 'text-slate-200'}`}
                >
                  <span className="flex items-center gap-2"><Sun className="w-4 h-4 text-yellow-400" /> Standard Tactical</span>
                  <span className="text-[10px] text-slate-400">100% UI</span>
                </button>
                <button
                  onClick={() => { setPowerMode('OLED_BATTERY_SAVER'); setModeMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-slate-800 ${powerMode === 'OLED_BATTERY_SAVER' ? 'text-sky-400 font-bold' : 'text-slate-200'}`}
                >
                  <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-sky-400" /> OLED Battery Saver</span>
                  <span className="text-[10px] text-sky-400">-40% Power</span>
                </button>
                <button
                  onClick={() => { setPowerMode('RED_VISION_NIGHT'); setModeMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-slate-800 ${powerMode === 'RED_VISION_NIGHT' ? 'text-red-400 font-bold' : 'text-slate-200'}`}
                >
                  <span className="flex items-center gap-2"><Eye className="w-4 h-4 text-red-500" /> Red Night Vision</span>
                  <span className="text-[10px] text-red-400">Scotopic</span>
                </button>
                <button
                  onClick={() => { setPowerMode('MINIMAL_EMERGENCY'); setModeMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-slate-800 ${powerMode === 'MINIMAL_EMERGENCY' ? 'text-red-500 font-bold' : 'text-slate-200'}`}
                >
                  <span className="flex items-center gap-2"><Flame className="w-4 h-4 text-red-500" /> Emergency Minimalist</span>
                  <span className="text-[10px] text-red-400">Max Survival</span>
                </button>
              </div>
            )}
          </div>

          {/* button 3: Shake Detection Toggle */}
          <button
            onClick={() => setShakeEnabled(!shakeEnabled)}
            className="px-3 py-2 rounded-lg text-xs font-mono transition-colors hidden sm:flex items-center gap-1.5 min-h-[44px]"
            style={{
              borderStyle: 'dotted',
              borderColor: 'rgba(255, 255, 255, 0.4)',
              borderWidth: '2px',
              color: '#eddfdf',
              fontSize: '18px'
            }}
            title={shakeEnabled ? 'Shake-to-SOS Active (Shake device for emergency)' : 'Shake Detection Disabled'}
          >
            <Radio className={`w-4 h-4 ${shakeEnabled ? 'animate-pulse text-yellow-300' : 'text-slate-400'}`} />
            <span style={{ fontSize: '18px' }}>{shakeEnabled ? 'Shake SOS ON' : 'Shake OFF'}</span>
          </button>

          {/* button 4: Direct SOS Trigger Button */}
          <button
            onClick={triggerSOSManual}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-mono font-extrabold tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-red-900/50 active:scale-95 transition-transform min-h-[44px]"
          >
            <AlertTriangle className="w-4 h-4 text-white animate-pulse" />
            <span>SOS</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white rounded-lg bg-slate-950/30 border border-white/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1e6f85] border-b border-[#1b6d85] px-4 py-4 space-y-2 font-mono shadow-2xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-bold transition-colors min-h-[48px] ${
                  isActive
                    ? 'bg-yellow-400 text-slate-950 font-bold shadow'
                    : 'text-white hover:bg-slate-950/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="px-2.5 py-0.5 bg-red-600 text-white text-xs rounded-full font-bold">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

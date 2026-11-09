/**
 * Aegis Survival - 30-Day Off-Grid & Power Outage Rationing Core System
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RationingHub } from './components/RationingHub';
import { FoodInventory } from './components/FoodInventory';
import { OfflineMap } from './components/OfflineMap';
import { GearChecklist } from './components/GearChecklist';
import { LogisticsHub } from './components/LogisticsHub';
import { WeatherModule } from './components/WeatherModule';
import { ShoppingList } from './components/ShoppingList';
import { EncryptedVault } from './components/EncryptedVault';
import { SOSBeaconModal } from './components/SOSBeaconModal';
import { LocationModal } from './components/LocationModal';
import { AppPowerMode, InventoryItem, TripScenario, UserLocation } from './types/survival';
import { getSavedInventory, saveInventory, getSavedLocation, saveLocation } from './services/storage';
import { Radio, AlertTriangle, MapPin } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('rationing');
  const [powerMode, setPowerMode] = useState<AppPowerMode>('STANDARD_TACTICAL');
  const [batteryLevel, setBatteryLevel] = useState<number>(94);
  const [scenario, setScenario] = useState<TripScenario>('MOUNTAIN_30_DAY');

  // Location State (Address & Coordinates)
  const [userLocation, setUserLocation] = useState<UserLocation>(getSavedLocation);
  const [locationModalOpen, setLocationModalOpen] = useState<boolean>(false);

  // Shared Data State
  const [inventory, setInventory] = useState<InventoryItem[]>(getSavedInventory);
  const [waterIntakeMl, setWaterIntakeMl] = useState<number>(1750);
  const [consumedCalories, setConsumedCalories] = useState<number>(1250);

  // SOS Beacon & Shake Detection State
  const [shakeEnabled, setShakeEnabled] = useState<boolean>(true);
  const [sosModalOpen, setSosModalOpen] = useState<boolean>(false);
  const [isShakeTriggered, setIsShakeTriggered] = useState<boolean>(false);

  // Unread Notifications Count
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(2);

  // Save inventory & location changes
  useEffect(() => {
    saveInventory(inventory);
  }, [inventory]);

  useEffect(() => {
    saveLocation(userLocation);
  }, [userLocation]);

  // Real device battery API if available
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      }).catch(() => {});
    }
  }, []);

  // Accelerometer Shake Detection
  useEffect(() => {
    if (!shakeEnabled) return;

    let lastX = 0, lastY = 0, lastZ = 0;
    let lastTime = Date.now();

    const handleMotion = (event: DeviceMotionEvent) => {
      const current = event.accelerationIncludingGravity;
      if (!current) return;

      const currentTime = Date.now();
      if ((currentTime - lastTime) > 100) {
        const diffTime = currentTime - lastTime;
        lastTime = currentTime;

        const deltaX = (current.x || 0) - lastX;
        const deltaY = (current.y || 0) - lastY;
        const deltaZ = (current.z || 0) - lastZ;

        const speed = Math.abs(deltaX + deltaY + deltaZ) / diffTime * 10000;

        if (speed > 1200) { // Vigorous shake threshold
          setIsShakeTriggered(true);
          setSosModalOpen(true);
        }

        lastX = current.x || 0;
        lastY = current.y || 0;
        lastZ = current.z || 0;
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [shakeEnabled]);

  const triggerSOSManual = () => {
    setIsShakeTriggered(false);
    setSosModalOpen(true);
  };

  // Determine container classes based on Power Mode
  const getPowerModeContainerClass = () => {
    switch (powerMode) {
      case 'RED_VISION_NIGHT':
        return 'mode-red-vision min-h-screen bg-[#050a14] text-red-500';
      case 'OLED_BATTERY_SAVER':
        return 'min-h-screen bg-[#050a14] text-slate-100 opacity-90';
      case 'MINIMAL_EMERGENCY':
        return 'min-h-screen bg-[#050a14] text-yellow-400';
      default:
        return 'min-h-screen bg-[#070d1a] text-slate-100';
    }
  };

  return (
    <div 
      className={getPowerModeContainerClass()}
      style={{ backgroundColor: '#274e9f' }}
    >
      
      {/* Header Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        powerMode={powerMode}
        setPowerMode={setPowerMode}
        batteryLevel={batteryLevel}
        shakeEnabled={shakeEnabled}
        setShakeEnabled={setShakeEnabled}
        triggerSOSManual={triggerSOSManual}
        unreadNotifsCount={unreadNotifsCount}
        userLocation={userLocation}
        onOpenLocationModal={() => setLocationModalOpen(true)}
      />

      {/* Main Container: CSS Selector 9 */}
      <main 
        className="max-w-7xl mx-auto px-4 sm:px-6 py-6"
        style={{ backgroundColor: '#062790' }}
      >
        
        {/* Minimalist Emergency Mode View Override */}
        {powerMode === 'MINIMAL_EMERGENCY' ? (
          <div className="space-y-6 max-w-2xl mx-auto font-mono text-center py-8">
            <div className="p-6 rounded-xl bg-[#0b1426] border-2 border-red-600 space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center mx-auto animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold text-red-500 uppercase tracking-widest">
                MINIMALIST EMERGENCY SURVIVAL MODE ACTIVE
              </h1>
              <div className="p-3 bg-[#060b17] rounded border border-slate-800 text-xs text-yellow-400 font-bold flex items-center justify-center gap-1.5">
                <MapPin className="w-4 h-4" /> {userLocation.address}, {userLocation.cityState}
              </div>

              <div className="grid grid-cols-2 gap-3 text-left text-xs pt-2">
                <div className="p-3 bg-[#060b17] rounded border border-slate-800">
                  <div className="text-slate-400">Water Target</div>
                  <div className="text-sky-400 font-bold text-base">{waterIntakeMl} / 3500 mL</div>
                </div>
                <div className="p-3 bg-[#060b17] rounded border border-slate-800">
                  <div className="text-slate-400">Days Food Left</div>
                  <div className="text-yellow-400 font-bold text-base">28 Days</div>
                </div>
              </div>

              <button
                onClick={triggerSOSManual}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg uppercase tracking-wider shadow-xl shadow-red-600/40"
              >
                DISTRESS SOS BEACON
              </button>

              <button
                onClick={() => setPowerMode('STANDARD_TACTICAL')}
                className="text-xs text-slate-400 hover:text-slate-200 underline pt-2 block mx-auto"
              >
                Exit Emergency Mode
              </button>
            </div>
          </div>
        ) : (
          /* Standard Multi-Tab Views */
          <>
            {activeTab === 'rationing' && (
              <RationingHub
                inventory={inventory}
                scenario={scenario}
                waterIntakeMl={waterIntakeMl}
                setWaterIntakeMl={setWaterIntakeMl}
                consumedCalories={consumedCalories}
                setConsumedCalories={setConsumedCalories}
              />
            )}

            {activeTab === 'inventory' && (
              <FoodInventory
                inventory={inventory}
                setInventory={setInventory}
              />
            )}

            {activeTab === 'map' && (
              <OfflineMap
                userLocation={userLocation}
                onOpenLocationModal={() => setLocationModalOpen(true)}
              />
            )}

            {activeTab === 'gear' && <GearChecklist scenario={scenario} />}

            {activeTab === 'logistics' && (
              <LogisticsHub
                userLocation={userLocation}
                onOpenLocationModal={() => setLocationModalOpen(true)}
              />
            )}

            {activeTab === 'weather' && <WeatherModule />}

            {activeTab === 'shopping' && <ShoppingList inventory={inventory} />}

            {activeTab === 'vault' && <EncryptedVault />}
          </>
        )}

      </main>

      {/* Manual Address & Location Modal */}
      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        userLocation={userLocation}
        setUserLocation={setUserLocation}
      />

      {/* SOS Beacon Countdown & Strobe Modal */}
      <SOSBeaconModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        isShakeTriggered={isShakeTriggered}
        userLocation={userLocation}
      />

      {/* Quick Shake Test Trigger Floating Button (For Desktop Testing) */}
      <div className="fixed bottom-4 right-4 z-30 flex items-center gap-2">
        <button
          onClick={() => setLocationModalOpen(true)}
          className="px-3 py-2 rounded-full bg-[#0b1426]/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xl backdrop-blur-md"
          title="Manually Edit Current Address"
        >
          <MapPin className="w-3.5 h-3.5 text-yellow-400" />
          <span className="hidden md:inline">{userLocation.address ? userLocation.address.split(',')[0] : 'Edit Address'}</span>
        </button>

        <button
          onClick={() => {
            setIsShakeTriggered(true);
            setSosModalOpen(true);
          }}
          className="px-3 py-2 rounded-full bg-[#0b1426]/90 hover:bg-slate-800 border border-yellow-400/50 text-yellow-400 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xl backdrop-blur-md"
          title="Simulate Device Shake Trigger (Accelerometer Event)"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse text-yellow-400" />
          <span className="hidden sm:inline">Simulate Shake SOS</span>
        </button>
      </div>

    </div>
  );
}

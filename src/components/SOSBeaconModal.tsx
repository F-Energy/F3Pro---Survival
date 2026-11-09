import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Radio, 
  Volume2, 
  VolumeX, 
  Eye, 
  X, 
  CheckCircle2, 
  MapPin, 
  Battery, 
  Satellite,
  Vibrate
} from 'lucide-react';
import { UserLocation } from '../types/survival';
import { playSOSMorseSound, startAcousticSiren, stopAcousticSiren, triggerHapticSOS } from '../services/audioBeacon';

interface SOSBeaconModalProps {
  isOpen: boolean;
  onClose: () => void;
  isShakeTriggered?: boolean;
  userLocation: UserLocation;
}

export const SOSBeaconModal: React.FC<SOSBeaconModalProps> = ({
  isOpen,
  onClose,
  isShakeTriggered = false,
  userLocation,
}) => {
  const [countdown, setCountdown] = useState<number>(5);
  const [beaconActive, setBeaconActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [strobeEnabled, setStrobeEnabled] = useState<boolean>(true);
  const [strobeColor, setStrobeColor] = useState<'WHITE' | 'RED' | 'BLACK'>('WHITE');
  const [satelliteSent, setSatelliteSent] = useState<boolean>(false);

  // Countdown logic for shake trigger
  useEffect(() => {
    let timer: any = null;
    if (isOpen && !beaconActive && countdown > 0) {
      triggerHapticSOS();
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setBeaconActive(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, beaconActive, countdown]);

  // Activate beacon sound & strobe
  useEffect(() => {
    if (beaconActive) {
      if (soundEnabled) {
        startAcousticSiren();
      }
      triggerHapticSOS();

      // Satellite transmission simulation
      setTimeout(() => setSatelliteSent(true), 2000);

      // Screen Strobe Morse Flash Loop
      let strobeInterval: any = null;
      if (strobeEnabled) {
        let flash = false;
        strobeInterval = setInterval(() => {
          setStrobeColor(flash ? 'WHITE' : 'RED');
          flash = !flash;
        }, 300);
      }

      return () => {
        stopAcousticSiren();
        if (strobeInterval) clearInterval(strobeInterval);
      };
    } else {
      stopAcousticSiren();
    }
  }, [beaconActive, soundEnabled, strobeEnabled]);

  const handleCancel = () => {
    stopAcousticSiren();
    setBeaconActive(false);
    setCountdown(5);
    setSatelliteSent(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between p-4 sm:p-6 font-mono selection:bg-none select-none">
      
      {/* Background Strobe Light Effect if active */}
      {beaconActive && strobeEnabled && (
        <div 
          className={`absolute inset-0 z-0 transition-colors duration-100 ${
            strobeColor === 'WHITE' ? 'bg-white' : strobeColor === 'RED' ? 'bg-red-600' : 'bg-black'
          }`}
        />
      )}

      {/* Header Overlay */}
      <div className="relative z-10 w-full max-w-2xl flex items-center justify-between bg-zinc-950/90 backdrop-blur-md p-3.5 rounded-xl border border-red-800 text-white shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-extrabold text-red-500 uppercase tracking-widest">
          <AlertTriangle className="w-5 h-5 animate-pulse text-red-500" />
          <span>AEGIS SATELLITE DISTRESS BEACON</span>
        </div>
        <button
          onClick={handleCancel}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded flex items-center gap-1 shadow"
        >
          <X className="w-4 h-4" /> CANCEL SOS
        </button>
      </div>

      {/* Main Center Display */}
      <div className="relative z-10 max-w-xl w-full text-center space-y-6 my-auto">
        
        {!beaconActive ? (
          /* Countdown Screen */
          <div className="bg-zinc-950/90 backdrop-blur-md p-8 rounded-2xl border-2 border-red-600 space-y-5 text-white shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 text-red-500 flex items-center justify-center mx-auto animate-bounce">
              <Radio className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-red-500 uppercase tracking-wider">
                {isShakeTriggered ? 'ACCELEROMETER SHAKE SOS DETECTED' : 'EMERGENCY SOS BEACON INITIATING'}
              </h2>
              <p className="text-xs text-zinc-300 mt-2">
                Haptic Morse SOS pattern pulsing. Activating high-decibel acoustic siren & satellite Search & Rescue packet in:
              </p>
            </div>

            <div className="text-6xl font-black font-mono text-red-500 tracking-tighter my-4 animate-pulse">
              00:0{countdown}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg border border-zinc-700"
              >
                CANCEL FALSE ALARM
              </button>
              <button
                onClick={() => setBeaconActive(true)}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-red-600/40"
              >
                TRIGGER SOS IMMEDIATELY
              </button>
            </div>
          </div>
        ) : (
          /* Active SOS Strobe & Satellite Broadcast Display */
          <div className="bg-zinc-950/95 backdrop-blur-md p-8 rounded-2xl border-4 border-red-600 space-y-6 text-white shadow-2xl">
            
            <div className="flex items-center justify-center gap-2 text-red-500 font-extrabold text-lg uppercase tracking-widest animate-pulse">
              <Radio className="w-6 h-6" /> DISTRESS BEACON BROADCASTING
            </div>

            {/* Controls bar (Mute siren, disable strobe) */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 ${
                  soundEnabled ? 'bg-red-950 border-red-700 text-red-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-red-500" /> : <VolumeX className="w-4 h-4" />}
                <span>{soundEnabled ? 'Siren Audio ON' : 'Siren Muted'}</span>
              </button>

              <button
                onClick={() => setStrobeEnabled(!strobeEnabled)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 ${
                  strobeEnabled ? 'bg-amber-950 border-amber-700 text-amber-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{strobeEnabled ? 'Strobe Light ON' : 'Strobe Off'}</span>
              </button>
            </div>

            {/* Satellite Transmission Packet */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-left space-y-2">
              <div className="flex justify-between text-zinc-400 border-b border-zinc-800 pb-1.5">
                <span className="flex items-center gap-1 text-cyan-400"><Satellite className="w-3.5 h-3.5" /> Satellite Packet</span>
                <span className={satelliteSent ? 'text-emerald-400 font-bold' : 'text-amber-400 animate-pulse'}>
                  {satelliteSent ? '✓ TRANSMITTED TO SAR' : 'CONNECTING IRIDIUM...'}
                </span>
              </div>
              <div className="text-yellow-400 font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Physical Address: {userLocation.address}, {userLocation.cityState}
              </div>
              <div className="text-zinc-200">
                GPS Lat: <span className="text-amber-400 font-bold">{userLocation.lat}° N</span> · Long: <span className="text-amber-400 font-bold">{userLocation.lng}° W</span>
              </div>
              <div className="text-zinc-200">
                Elevation: <span className="text-zinc-400">{userLocation.elevationFt.toLocaleString()} ft</span> · Battery: <span className="text-emerald-400">92%</span>
              </div>
              <div className="text-zinc-400 text-[11px] pt-1 border-t border-zinc-800">
                Emergency Message: "AEGIS SOS: Emergency at {userLocation.address}, {userLocation.cityState} ({userLocation.lat},{userLocation.lng}). Request immediate SAR dispatch."
              </div>
            </div>

            <button
              onClick={handleCancel}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-extrabold text-xs rounded-lg uppercase tracking-wider"
            >
              TERMINATE SOS BROADCAST
            </button>

          </div>
        )}

      </div>

      {/* Footer Info */}
      <div className="relative z-10 text-[10px] text-zinc-400 font-mono bg-zinc-950/80 px-4 py-2 rounded-lg border border-zinc-800">
        Haptic Morse Code SOS: 3 Short Vibration Pulses · 3 Long Pulses · 3 Short Pulses
      </div>

    </div>
  );
};

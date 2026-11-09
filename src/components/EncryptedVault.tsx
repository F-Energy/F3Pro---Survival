import React, { useState } from 'react';
import { 
  Lock, 
  HeartPulse, 
  PhoneCall, 
  FileText, 
  Save, 
  Eye, 
  EyeOff
} from 'lucide-react';
import { EncryptedVaultData } from '../types/survival';
import { encryptVault, decryptVault } from '../services/storage';

const INITIAL_VAULT: EncryptedVaultData = {
  bloodType: 'O NEGATIVE (Universal Donor)',
  allergies: 'Severe Penicillin allergy. No NSAIDs.',
  medicalConditions: 'Type-1 Asthma (Albuterol inhaler in Bag Pocket 2).',
  iceContactName: 'Sarah Frost (Spouse)',
  iceContactPhone: '+1 (480) 555-0188',
  satelliteKeyId: 'IRIDIUM-KEY-8849-AEGIS-SECURE',
  passportIdNotes: 'US Passport #A88492019 · Drivers Lic #AZ-89201',
  emergencyInstructions: 'In event of incapacitation, ping Satellite Relay #9 and notify Search & Rescue with GPS lock.',
};

export const EncryptedVault: React.FC = () => {
  const [pin, setPin] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [vaultData, setVaultData] = useState<EncryptedVaultData>(INITIAL_VAULT);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPin, setShowPin] = useState<boolean>(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      setErrorMsg('PIN must be at least 4 digits.');
      return;
    }

    const raw = localStorage.getItem('aegis_encrypted_vault_store');
    if (raw) {
      const decrypted = await decryptVault(pin, raw);
      if (decrypted) {
        setVaultData(decrypted);
        setIsUnlocked(true);
        setErrorMsg(null);
      } else {
        setErrorMsg('Invalid Master PIN. Decryption failed.');
      }
    } else {
      setIsUnlocked(true);
      setErrorMsg(null);
    }
  };

  const handleSaveVault = async () => {
    if (!pin) return;
    const encryptedStr = await encryptVault(pin, vaultData);
    localStorage.setItem('aegis_encrypted_vault_store', encryptedStr);
    setSuccessMsg('Vault data encrypted with AES-256 and saved to secure offline storage.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleLockVault = () => {
    setIsUnlocked(false);
    setPin('');
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6 pb-12 font-mono">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0b1426] border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-yellow-400 mb-1">
            <Lock className="w-4 h-4" />
            <span>AES-256 CLIENT-SIDE ENCRYPTED VAULT</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">Encrypted Emergency Medical & ICE Records</h1>
          <p className="text-xs text-slate-400 mt-1">
            Status: {isUnlocked ? <span className="text-emerald-400 font-bold">UNLOCKED (Decrypted)</span> : <span className="text-yellow-400 font-bold">LOCKED (AES-256 Encrypted)</span>}
          </p>
        </div>

        {isUnlocked && (
          <button
            onClick={handleLockVault}
            className="px-3 py-1.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-xs rounded-lg flex items-center gap-1.5 shrink-0 font-bold"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Vault</span>
          </button>
        )}
      </div>

      {/* Locked Screen */}
      {!isUnlocked ? (
        <div className="max-w-md mx-auto p-6 rounded-xl bg-[#0b1426] border border-slate-800 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-100">Enter Master Security PIN</h2>
            <p className="text-xs text-slate-400 mt-1">
              Your sensitive medical records, blood type, and satellite key passes are encrypted offline using Web Crypto AES-GCM.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-3">
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 4-8 digit Master PIN..."
                className="w-full bg-[#060b17] border border-slate-800 text-slate-100 text-center text-lg tracking-widest rounded-lg px-3 py-2.5 focus:outline-none focus:border-yellow-400"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMsg && (
              <div className="text-xs text-red-400 bg-red-950/30 p-2 rounded border border-red-800">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-lg uppercase tracking-wider transition-colors shadow-lg shadow-yellow-400/20"
            >
              Decrypt & Access Vault
            </button>
          </form>

          <p className="text-[10px] text-slate-400">
            Default test PIN: <span className="text-yellow-400 font-bold">1234</span>
          </p>
        </div>
      ) : (
        /* Unlocked Vault Editor */
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Medical Info */}
            <div className="p-5 rounded-xl bg-[#0b1426] border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm pb-2 border-b border-slate-800">
                <HeartPulse className="w-4 h-4" /> Medical & Allergy Records
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Blood Type</label>
                  <input
                    type="text"
                    value={vaultData.bloodType}
                    onChange={(e) => setVaultData({ ...vaultData, bloodType: e.target.value })}
                    className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2 font-bold text-yellow-400"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Critical Allergies</label>
                  <input
                    type="text"
                    value={vaultData.allergies}
                    onChange={(e) => setVaultData({ ...vaultData, allergies: e.target.value })}
                    className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Medical Conditions & Prescription Medications</label>
                  <textarea
                    rows={2}
                    value={vaultData.medicalConditions}
                    onChange={(e) => setVaultData({ ...vaultData, medicalConditions: e.target.value })}
                    className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contacts & Sat Keys */}
            <div className="p-5 rounded-xl bg-[#0b1426] border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm pb-2 border-b border-slate-800">
                <PhoneCall className="w-4 h-4" /> Emergency ICE Contacts & Satellite Keys
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Primary ICE Contact Name</label>
                  <input
                    type="text"
                    value={vaultData.iceContactName}
                    onChange={(e) => setVaultData({ ...vaultData, iceContactName: e.target.value })}
                    className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Primary ICE Phone Number</label>
                  <input
                    type="text"
                    value={vaultData.iceContactPhone}
                    onChange={(e) => setVaultData({ ...vaultData, iceContactPhone: e.target.value })}
                    className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Satellite Transponder Key ID</label>
                  <input
                    type="text"
                    value={vaultData.satelliteKeyId}
                    onChange={(e) => setVaultData({ ...vaultData, satelliteKeyId: e.target.value })}
                    className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2 font-mono text-sky-400"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Emergency Instructions & ID Notes */}
          <div className="p-5 rounded-xl bg-[#0b1426] border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm pb-2 border-b border-slate-800">
              <FileText className="w-4 h-4" /> Emergency Instructions & ID Vault Notes
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Passport & Identification Numbers</label>
                <input
                  type="text"
                  value={vaultData.passportIdNotes}
                  onChange={(e) => setVaultData({ ...vaultData, passportIdNotes: e.target.value })}
                  className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Emergency SAR Instructions</label>
                <input
                  type="text"
                  value={vaultData.emergencyInstructions}
                  onChange={(e) => setVaultData({ ...vaultData, emergencyInstructions: e.target.value })}
                  className="w-full bg-[#060b17] border border-slate-800 text-slate-100 rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {successMsg && (
                <div className="text-xs text-emerald-400 font-bold">
                  ✓ {successMsg}
                </div>
              )}
              <button
                onClick={handleSaveVault}
                className="ml-auto px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-lg shadow-yellow-400/20"
              >
                <Save className="w-4 h-4" /> Save & Re-Encrypt Vault
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Unlock, 
  KeyRound, 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle,
  Settings2,
  RefreshCw
} from 'lucide-react';
import { CoupleProfile, ActivePartnerView } from '../types';

interface CouplePinAuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  profile: CoupleProfile;
  onAuthenticate: (partner: ActivePartnerView) => void;
  onUpdateProfile: (newProfile: CoupleProfile) => void;
  currentActivePartner?: ActivePartnerView;
  isInitialGate?: boolean;
}

export const CouplePinAuthModal: React.FC<CouplePinAuthModalProps> = ({
  isOpen,
  onClose,
  profile,
  onAuthenticate,
  onUpdateProfile,
  currentActivePartner,
  isInitialGate = false,
}) => {
  const [selectedPartner, setSelectedPartner] = useState<'partner1' | 'partner2' | null>('partner1');
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [isEditPinMode, setIsEditPinMode] = useState(false);

  // Edit PIN states
  const [editP1Name, setEditP1Name] = useState(profile.partner1Name || 'Upendra');
  const [editP2Name, setEditP2Name] = useState(profile.partner2Name || 'Hina');
  const [editP1Pin, setEditP1Pin] = useState(profile.partner1Pin || '1111');
  const [editP2Pin, setEditP2Pin] = useState(profile.partner2Pin || '2222');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const partner1Pin = profile.partner1Pin || '1111';
  const partner2Pin = profile.partner2Pin || '2222';

  const handleKeyPress = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setErrorMsg(null);

    if (newPin.length === 4) {
      verifyPin(newPin);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const verifyPin = (enteredPin: string) => {
    if (!selectedPartner) {
      setErrorMsg('Please select a partner first');
      return;
    }

    const expectedPin = selectedPartner === 'partner1' ? partner1Pin : partner2Pin;

    if (enteredPin === expectedPin) {
      setSuccessAnimation(true);
      setErrorMsg(null);
      setTimeout(() => {
        onAuthenticate(selectedPartner);
        setPin('');
        setSuccessAnimation(false);
        if (onClose) onClose();
      }, 500);
    } else {
      setErrorMsg(`Incorrect PIN for ${selectedPartner === 'partner1' ? profile.partner1Name : profile.partner2Name}.`);
      setPin('');
    }
  };

  const handleSavePinSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (editP1Pin.length !== 4 || editP2Pin.length !== 4) {
      setErrorMsg('PINs must be exactly 4 digits');
      return;
    }

    const updated: CoupleProfile = {
      ...profile,
      partner1Name: editP1Name.trim() || 'Partner 1',
      partner2Name: editP2Name.trim() || 'Partner 2',
      partner1Pin: editP1Pin,
      partner2Pin: editP2Pin,
    };

    onUpdateProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditPinMode(false);
    }, 800);
  };

  const handleEnterAsTogether = () => {
    onAuthenticate('together');
    if (onClose) onClose();
  };

  return (
    <div
      id="couple-pin-auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-md p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-stone-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-stone-100 shadow-2xl relative overflow-hidden"
      >
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center relative z-10 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600/30 to-amber-500/30 border border-rose-500/40 text-rose-300 mb-3 shadow-inner">
            {successAnimation ? (
              <Unlock className="w-7 h-7 text-emerald-400 animate-bounce" />
            ) : (
              <Heart className="w-7 h-7 text-rose-400 fill-rose-400/20" />
            )}
          </div>
          <h2 className="text-2xl font-serif tracking-tight text-stone-100">
            {isInitialGate ? 'Welcome to TogetherLens' : 'Couple Private Vault'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            {isEditPinMode
              ? 'Customize partner names and 4-digit secret PINs'
              : 'Enter your 4-digit PIN to access your personal perspective'}
          </p>
        </div>

        {!isEditPinMode ? (
          <div className="space-y-6 relative z-10">
            {/* Partner Selection Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Partner 1 Button */}
              <button
                id="select-partner-1-btn"
                type="button"
                onClick={() => {
                  setSelectedPartner('partner1');
                  setPin('');
                  setErrorMsg(null);
                }}
                className={`relative p-3.5 rounded-2xl border transition-all text-left flex flex-col items-center justify-center gap-2 ${
                  selectedPartner === 'partner1'
                    ? 'border-rose-500/80 bg-gradient-to-b from-rose-950/40 to-stone-900 shadow-lg shadow-rose-950/40 ring-2 ring-rose-500/30'
                    : 'border-stone-800 bg-stone-900/60 hover:border-stone-700 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="relative">
                  <img
                    src={profile.partner1Avatar}
                    alt={profile.partner1Name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-rose-400/50 shadow"
                  />
                  {selectedPartner === 'partner1' && (
                    <span className="absolute -bottom-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 shadow">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <span className="block font-medium text-sm text-stone-100">{profile.partner1Name}</span>
                  <span className="text-[11px] text-rose-300/80">Partner 1 (His View)</span>
                </div>
              </button>

              {/* Partner 2 Button */}
              <button
                id="select-partner-2-btn"
                type="button"
                onClick={() => {
                  setSelectedPartner('partner2');
                  setPin('');
                  setErrorMsg(null);
                }}
                className={`relative p-3.5 rounded-2xl border transition-all text-left flex flex-col items-center justify-center gap-2 ${
                  selectedPartner === 'partner2'
                    ? 'border-amber-500/80 bg-gradient-to-b from-amber-950/40 to-stone-900 shadow-lg shadow-amber-950/40 ring-2 ring-amber-500/30'
                    : 'border-stone-800 bg-stone-900/60 hover:border-stone-700 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="relative">
                  <img
                    src={profile.partner2Avatar}
                    alt={profile.partner2Name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-amber-400/50 shadow"
                  />
                  {selectedPartner === 'partner2' && (
                    <span className="absolute -bottom-1 -right-1 bg-amber-600 text-white rounded-full p-0.5 shadow">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <span className="block font-medium text-sm text-stone-100">{profile.partner2Name}</span>
                  <span className="text-[11px] text-amber-300/80">Partner 2 (Her View)</span>
                </div>
              </button>
            </div>

            {/* PIN Display Dots */}
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-4 mb-2">
                {[0, 1, 2, 3].map((idx) => {
                  const filled = pin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full transition-all duration-200 flex items-center justify-center ${
                        filled
                          ? selectedPartner === 'partner1'
                            ? 'bg-rose-500 ring-4 ring-rose-500/30 scale-110'
                            : 'bg-amber-500 ring-4 ring-amber-500/30 scale-110'
                          : 'bg-stone-800 border border-stone-700'
                      }`}
                    >
                      {filled && showPin && (
                        <span className="text-[10px] font-bold text-stone-950">{pin[idx]}</span>
                      )}
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800 transition"
                  title={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-rose-400 text-xs mt-1 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  id={`keypad-${digit}`}
                  type="button"
                  onClick={() => handleKeyPress(digit)}
                  className="h-12 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 active:scale-95 border border-stone-700/50 text-stone-100 font-medium text-lg transition flex items-center justify-center shadow-sm"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPin('')}
                className="h-12 rounded-xl bg-stone-800/40 hover:bg-stone-800 active:scale-95 border border-stone-700/30 text-stone-400 hover:text-stone-200 text-xs transition flex items-center justify-center"
              >
                Clear
              </button>
              <button
                id="keypad-0"
                type="button"
                onClick={() => handleKeyPress('0')}
                className="h-12 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 active:scale-95 border border-stone-700/50 text-stone-100 font-medium text-lg transition flex items-center justify-center shadow-sm"
              >
                0
              </button>
              <button
                id="keypad-backspace"
                type="button"
                onClick={handleBackspace}
                className="h-12 rounded-xl bg-stone-800/40 hover:bg-stone-800 active:scale-95 border border-stone-700/30 text-stone-400 hover:text-stone-200 text-xs transition flex items-center justify-center font-semibold"
              >
                ⌫
              </button>
            </div>

            {/* Default PIN Helper & Actions */}
            <div className="pt-2 border-t border-stone-800 flex flex-col gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    <strong>Default PINs:</strong> {profile.partner1Name} (<code className="bg-stone-900 px-1 py-0.5 rounded text-amber-300 font-mono">{partner1Pin}</code>) • {profile.partner2Name} (<code className="bg-stone-900 px-1 py-0.5 rounded text-amber-300 font-mono">{partner2Pin}</code>)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-400">
                <button
                  id="open-edit-pin-btn"
                  type="button"
                  onClick={() => setIsEditPinMode(true)}
                  className="inline-flex items-center gap-1 hover:text-amber-300 transition underline underline-offset-4"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  Customize Names & PINs
                </button>

                <button
                  id="enter-together-view-btn"
                  type="button"
                  onClick={handleEnterAsTogether}
                  className="inline-flex items-center gap-1 hover:text-rose-300 transition"
                >
                  <Users className="w-3.5 h-3.5" />
                  Shared View (Both)
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Edit PINs Form */
          <form onSubmit={handleSavePinSettings} className="space-y-4 relative z-10">
            <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Partner 1 Profile & PIN
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">Name</label>
                  <input
                    type="text"
                    value={editP1Name}
                    onChange={(e) => setEditP1Name(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-rose-500"
                    placeholder="e.g. Upendra"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">4-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    value={editP1Pin}
                    onChange={(e) => setEditP1Pin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-100 font-mono focus:outline-none focus:border-rose-500"
                    placeholder="1111"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Partner 2 Profile & PIN
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">Name</label>
                  <input
                    type="text"
                    value={editP2Name}
                    onChange={(e) => setEditP2Name(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Hina"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">4-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    value={editP2Pin}
                    onChange={(e) => setEditP2Pin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-100 font-mono focus:outline-none focus:border-amber-500"
                    placeholder="2222"
                    required
                  />
                </div>
              </div>
            </div>

            {saveSuccess && (
              <div className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs text-center flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>PINs and Names successfully updated!</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditPinMode(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-stone-700 text-stone-300 text-xs font-medium hover:bg-stone-800 transition"
              >
                Back to Sign In
              </button>
              <button
                id="save-pins-btn"
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white text-xs font-medium hover:opacity-90 shadow-md transition"
              >
                Save New PINs
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

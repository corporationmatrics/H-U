import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  Hourglass, 
  Calendar, 
  Clock, 
  Sparkles, 
  Heart, 
  Volume2, 
  Play, 
  Pause, 
  Plus, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Share2, 
  ShieldCheck, 
  Gift, 
  AlertCircle,
  X,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { TimeCapsule, PhotoItem, CoupleProfile, TierLevel } from '../types';

interface TimeCapsuleStudioProps {
  capsules: TimeCapsule[];
  photos: PhotoItem[];
  profile: CoupleProfile;
  tier: TierLevel;
  onAddCapsule: (capsule: TimeCapsule) => void;
  onUnlockCapsule: (id: string) => void;
  onSelectPhoto: (photo: PhotoItem) => void;
  onShowToast: (msg: string) => void;
}

const WAX_COLORS: Record<string, { bg: string; text: string; ring: string; border: string }> = {
  rose: { bg: 'bg-rose-600', text: 'text-rose-200', ring: 'ring-rose-400', border: 'border-rose-500' },
  gold: { bg: 'bg-amber-600', text: 'text-amber-200', ring: 'ring-amber-400', border: 'border-amber-500' },
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-200', ring: 'ring-emerald-400', border: 'border-emerald-500' },
  purple: { bg: 'bg-purple-600', text: 'text-purple-200', ring: 'ring-purple-400', border: 'border-purple-500' },
  teal: { bg: 'bg-teal-600', text: 'text-teal-200', ring: 'ring-teal-400', border: 'border-teal-500' },
};

export const TimeCapsuleStudio: React.FC<TimeCapsuleStudioProps> = ({
  capsules,
  photos,
  profile,
  tier,
  onAddCapsule,
  onUnlockCapsule,
  onSelectPhoto,
  onShowToast,
}) => {
  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsule | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);

  // New capsule form state
  const [newTitle, setNewTitle] = useState('');
  const [newSealedBy, setNewSealedBy] = useState<'Partner 1 (Alex)' | 'Partner 2 (Taylor)'>('Partner 1 (Alex)');
  const [newSealedFor, setNewSealedFor] = useState<'Partner 1 (Alex)' | 'Partner 2 (Taylor)' | 'Both of Us'>('Partner 2 (Taylor)');
  const [newUnlockType, setNewUnlockType] = useState<'date' | 'days_together' | 'anniversary'>('anniversary');
  const [newTargetDate, setNewTargetDate] = useState('2026-10-14');
  const [newTargetDays, setNewTargetDays] = useState<number>(profile.daysTogether + 365);
  const [newAnniversaryYear, setNewAnniversaryYear] = useState<number>(5);
  const [newSecretMessage, setNewSecretMessage] = useState('');
  const [newHintClue, setNewHintClue] = useState('');
  const [newWaxColor, setNewWaxColor] = useState<'rose' | 'amber' | 'emerald' | 'purple' | 'gold'>('rose');
  const [newSelectedPhotoIds, setNewSelectedPhotoIds] = useState<string[]>([]);

  // Simulated audio playback effect
  useEffect(() => {
    let interval: any;
    if (playingAudioId) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setPlayingAudioId(null);
            return 0;
          }
          return prev + 4;
        });
      }, 300);
    } else {
      setAudioProgress(0);
    }
    return () => clearInterval(interval);
  }, [playingAudioId]);

  const calculateTimeRemaining = (capsule: TimeCapsule) => {
    if (capsule.isUnlocked) {
      return { isReady: true, label: 'Unlocked & Revealed' };
    }

    if (capsule.unlockType === 'days_together' && capsule.unlockTargetDaysTogether) {
      const daysLeft = capsule.unlockTargetDaysTogether - profile.daysTogether;
      if (daysLeft <= 0) {
        return { isReady: true, label: 'Ready to Unlock!' };
      }
      return { isReady: false, label: `${daysLeft} days remaining (${profile.daysTogether}/${capsule.unlockTargetDaysTogether} days)` };
    }

    if (capsule.unlockTargetDate) {
      const targetTime = new Date(capsule.unlockTargetDate).getTime();
      const nowTime = new Date().getTime();
      const diffMs = targetTime - nowTime;

      if (diffMs <= 0) {
        return { isReady: true, label: 'Ready to Unlock!' };
      }

      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return { isReady: false, label: `${diffDays}d ${diffHours}h until unlock` };
    }

    return { isReady: false, label: 'Locked' };
  };

  const handleCreateCapsule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSecretMessage.trim()) {
      onShowToast('Please fill out the capsule title and secret message!');
      return;
    }

    const created: TimeCapsule = {
      id: `capsule-${Date.now()}`,
      title: newTitle,
      sealedBy: newSealedBy,
      sealedFor: newSealedFor,
      sealedAtDate: new Date().toISOString(),
      unlockType: newUnlockType,
      unlockTargetDate: newUnlockType === 'anniversary' ? `${2021 + newAnniversaryYear}-10-14T00:00:00Z` : `${newTargetDate}T00:00:00Z`,
      unlockTargetDaysTogether: newUnlockType === 'days_together' ? newTargetDays : undefined,
      anniversaryYear: newUnlockType === 'anniversary' ? newAnniversaryYear : undefined,
      secretMessage: newSecretMessage,
      hintClue: newHintClue || 'A surprise sealed with love...',
      waxSealColor: newWaxColor,
      photoIds: newSelectedPhotoIds.length > 0 ? newSelectedPhotoIds : [photos[0]?.id || 'photo-1'],
      isUnlocked: false,
    };

    onAddCapsule(created);
    setIsCreateModalOpen(false);
    // Reset form
    setNewTitle('');
    setNewSecretMessage('');
    setNewHintClue('');
    setNewSelectedPhotoIds([]);
    onShowToast(`💌 Sealed Time Capsule: "${created.title}" with a holographic wax stamp!`);
  };

  const handleTriggerUnlock = (capsule: TimeCapsule) => {
    onUnlockCapsule(capsule.id);
    setSelectedCapsule({ ...capsule, isUnlocked: true });
    onShowToast(`🎉 Time Capsule "${capsule.title}" Unsealed! Hidden memories revealed.`);
  };

  const handleToggleAudio = (id: string) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
      setAudioProgress(0);
      onShowToast('🎙️ Playing partner audio memo...');
    }
  };

  const togglePhotoSelection = (id: string) => {
    if (newSelectedPhotoIds.includes(id)) {
      setNewSelectedPhotoIds(newSelectedPhotoIds.filter(pid => pid !== id));
    } else {
      setNewSelectedPhotoIds([...newSelectedPhotoIds, id]);
    }
  };

  return (
    <div id="time-capsule-studio" className="space-y-8 animate-fade-in font-sans">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-950/40 via-stone-900 to-amber-950/40 border border-rose-800/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <Hourglass className="w-3.5 h-3.5 text-rose-400" />
              <span>Future Milestone &amp; Anniversary Vault</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif-title font-bold text-stone-100 tracking-tight">
              Couple Time Capsules
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Seal secret letters, voice memos, and private photos that remain locked until a future anniversary or milestone day count. Surprise your partner when the day arrives.
            </p>
          </div>

          <button
            id="seal-new-capsule-btn"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-xl shadow-rose-950/50 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Seal a New Capsule</span>
          </button>
        </div>

        {/* Milestone Bar */}
        <div className="mt-6 pt-6 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
            <span>Current Relationship Clock: <strong>{profile.daysTogether} Days Together</strong></span>
          </div>
          <div className="flex items-center gap-4 text-stone-300">
            <span>Next Milestone: <strong>{profile.daysTogether < 2000 ? '2,000 Days' : '5th Anniversary'}</strong></span>
            <span>Sealed Capsules: <strong className="text-rose-400">{capsules.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Capsules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {capsules.map((capsule) => {
          const status = calculateTimeRemaining(capsule);
          const wax = WAX_COLORS[capsule.waxSealColor] || WAX_COLORS.rose;
          const isUnlocked = capsule.isUnlocked;

          return (
            <div
              key={capsule.id}
              className={`rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between group ${
                isUnlocked
                  ? 'bg-stone-900/90 border-emerald-500/40 shadow-xl'
                  : 'bg-stone-900/70 border-stone-800 hover:border-rose-500/40 shadow-lg'
              }`}
            >
              {/* Envelope Flap Header Decoration */}
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                      {isUnlocked ? '✨ Revealed Memory' : '🔒 Sealed Time Capsule'}
                    </span>
                    <h3 className="font-serif-title font-bold text-lg text-stone-100 group-hover:text-rose-300 transition-colors line-clamp-2">
                      {capsule.title}
                    </h3>
                  </div>

                  {/* Wax Seal Medallion */}
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg border-2 ring-4 ${wax.bg} ${wax.border} ${wax.ring} ${wax.text}`}
                    title={`Wax Seal by ${capsule.sealedBy}`}
                  >
                    {isUnlocked ? (
                      <Unlock className="w-5 h-5 text-white" />
                    ) : (
                      <Lock className="w-5 h-5 text-white" />
                    )}
                  </div>
                </div>

                {/* Sealed info pills */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-300">
                    From: <strong>{capsule.sealedBy.split(' ')[2]?.replace(/[()]/g, '') || capsule.sealedBy}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-rose-300">
                    For: <strong>{capsule.sealedFor}</strong>
                  </span>
                </div>

                {/* Hint / Clue */}
                <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800/80 text-xs text-stone-400 italic">
                  &ldquo;{capsule.hintClue}&rdquo;
                </div>

                {/* Locked / Unlocked Content Preview */}
                {isUnlocked ? (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-stone-200 line-clamp-3 font-serif bg-stone-950/60 p-3 rounded-xl border border-stone-800">
                      {capsule.secretMessage}
                    </p>

                    {/* Sealed Photos Thumbnails */}
                    <div className="flex items-center gap-2">
                      {capsule.photoIds.map((pid) => {
                        const p = photos.find(item => item.id === pid);
                        if (!p) return null;
                        return (
                          <button
                            key={pid}
                            onClick={() => onSelectPhoto(p)}
                            className="w-12 h-12 rounded-xl overflow-hidden ring-1 ring-emerald-500/40 hover:scale-105 transition-transform shrink-0"
                          >
                            <img src={p.thumbnail || p.url} alt="Memory" className="w-full h-full object-cover" />
                          </button>
                        );
                      })}
                      <span className="text-[10px] font-mono text-stone-400">
                        {capsule.photoIds.length} Photos
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center space-y-2 bg-stone-950/40 rounded-2xl border border-dashed border-stone-800">
                    <Hourglass className="w-5 h-5 text-amber-400 mx-auto animate-pulse" />
                    <span className="text-xs font-mono font-bold text-amber-300 block">
                      {status.label}
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      Contains {capsule.photoIds.length} hidden photos &amp; love note
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-stone-950/70 border-t border-stone-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedCapsule(capsule)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 hover:text-white transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-rose-400" />
                  <span>Inspect Capsule</span>
                </button>

                {!isUnlocked ? (
                  <button
                    onClick={() => handleTriggerUnlock(capsule)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                    title="Unlock and pop this time capsule"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Unseal / Pop Capsule</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Revealed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Capsule Modal */}
      {selectedCapsule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-stone-900 rounded-3xl border border-rose-500/30 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-md">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-title font-bold text-xl text-stone-100">
                    {selectedCapsule.title}
                  </h3>
                  <span className="text-xs font-mono text-stone-400">
                    Sealed on {new Date(selectedCapsule.sealedAtDate).toLocaleDateString()} by {selectedCapsule.sealedBy}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCapsule(null)}
                className="p-2 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If Unlocked: Show Full Letter, Voice Memo & Photos */}
            {selectedCapsule.isUnlocked ? (
              <div className="space-y-6 animate-fade-in">
                
                {/* Love Note Document */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-stone-950 to-stone-900 border border-amber-800/30 shadow-inner space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-amber-400/80">
                    <span>💌 Sealed Love Letter</span>
                    <span>To: {selectedCapsule.sealedFor}</span>
                  </div>
                  <p className="font-serif text-sm sm:text-base text-stone-200 leading-relaxed italic whitespace-pre-line">
                    &ldquo;{selectedCapsule.secretMessage}&rdquo;
                  </p>
                  <div className="text-right text-xs font-serif text-rose-300">
                    — Forever Yours, {selectedCapsule.sealedBy}
                  </div>
                </div>

                {/* Voice Memo Player */}
                {selectedCapsule.voiceMemoNote && (
                  <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleAudio(selectedCapsule.id)}
                        className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-md transition-all shrink-0"
                      >
                        {playingAudioId === selectedCapsule.id ? (
                          <Pause className="w-4 h-4 fill-white" />
                        ) : (
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-stone-200 block truncate">
                          Partner Audio Memo ({selectedCapsule.audioMemoDurationSeconds || 45}s)
                        </span>
                        <span className="text-[11px] text-stone-400 truncate block">
                          {selectedCapsule.voiceMemoNote}
                        </span>
                      </div>
                    </div>

                    <div className="w-24 sm:w-32 h-2 bg-stone-800 rounded-full overflow-hidden shrink-0">
                      <div 
                        className="h-full bg-purple-500 transition-all duration-300"
                        style={{ width: `${playingAudioId === selectedCapsule.id ? audioProgress : 0}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Photos Gallery */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400">
                    Sealed Memories ({selectedCapsule.photoIds.length} Photos)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedCapsule.photoIds.map((pid) => {
                      const p = photos.find(item => item.id === pid);
                      if (!p) return null;
                      return (
                        <div
                          key={pid}
                          onClick={() => onSelectPhoto(p)}
                          className="aspect-square rounded-2xl overflow-hidden ring-1 ring-stone-700 hover:ring-rose-500 cursor-pointer group relative"
                        >
                          <img src={p.thumbnail || p.url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-end">
                            <span className="text-[11px] text-white font-medium truncate">{p.title}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            ) : (
              // Locked State with countdown and unlock button
              <div className="py-8 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-stone-950 border-2 border-amber-500/40 ring-8 ring-amber-500/10 flex items-center justify-center mx-auto text-amber-400 shadow-2xl">
                  <Lock className="w-8 h-8 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-lg font-serif-title font-bold text-stone-100">
                    This Memory Is Sealed Until Future Milestone
                  </h4>
                  <p className="text-xs text-stone-400 max-w-md mx-auto">
                    {calculateTimeRemaining(selectedCapsule).label}
                  </p>
                </div>

                <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 text-xs text-stone-300 italic max-w-md mx-auto">
                  &ldquo;{selectedCapsule.hintClue}&rdquo;
                </div>

                <div className="pt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => handleTriggerUnlock(selectedCapsule)}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-xl shadow-amber-950/50 transition-all hover:scale-105"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Unseal Capsule Now (Anniversary Reveal)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create New Time Capsule Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <form 
            onSubmit={handleCreateCapsule}
            className="w-full max-w-2xl bg-stone-900 rounded-3xl border border-rose-500/30 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-md">
                  <Hourglass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-title font-bold text-xl text-stone-100">
                    Seal a Secret Time Capsule
                  </h3>
                  <p className="text-xs text-stone-400">
                    Lock memories and secret messages for future milestone reveals
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title & Partners */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-300">Capsule Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Secret Letter for our 5th Anniversary"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:border-rose-500 outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-300">Sealed By</label>
                <select
                  value={newSealedBy}
                  onChange={(e) => setNewSealedBy(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:border-rose-500 outline-hidden"
                >
                  <option value="Partner 1 (Alex)">Alex (Partner 1)</option>
                  <option value="Partner 2 (Taylor)">Taylor (Partner 2)</option>
                </select>
              </div>
            </div>

            {/* Unlock Trigger Type */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-stone-300">When Should This Capsule Unlock?</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setNewUnlockType('anniversary')}
                  className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                    newUnlockType === 'anniversary'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-stone-950 border-stone-800 text-stone-400'
                  }`}
                >
                  <Calendar className="w-4 h-4 mx-auto mb-1" />
                  <span>Anniversary Year</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewUnlockType('days_together')}
                  className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                    newUnlockType === 'days_together'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-stone-950 border-stone-800 text-stone-400'
                  }`}
                >
                  <Clock className="w-4 h-4 mx-auto mb-1" />
                  <span>Days Together</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewUnlockType('date')}
                  className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                    newUnlockType === 'date'
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                      : 'bg-stone-950 border-stone-800 text-stone-400'
                  }`}
                >
                  <Lock className="w-4 h-4 mx-auto mb-1" />
                  <span>Specific Date</span>
                </button>
              </div>

              {/* Target Input */}
              <div className="pt-2">
                {newUnlockType === 'anniversary' && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-400">Unlock on our:</span>
                    <select
                      value={newAnniversaryYear}
                      onChange={(e) => setNewAnniversaryYear(Number(e.target.value))}
                      className="px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-rose-300 text-xs font-bold"
                    >
                      <option value={5}>5th Anniversary (Oct 14, 2026)</option>
                      <option value={6}>6th Anniversary (Oct 14, 2027)</option>
                      <option value={10}>10th Anniversary (Oct 14, 2031)</option>
                    </select>
                  </div>
                )}

                {newUnlockType === 'days_together' && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-400">Unlock at:</span>
                    <input
                      type="number"
                      value={newTargetDays}
                      onChange={(e) => setNewTargetDays(Number(e.target.value))}
                      className="w-32 px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-amber-300 text-xs font-bold"
                    />
                    <span className="text-xs text-stone-500">Days (Currently: {profile.daysTogether})</span>
                  </div>
                )}

                {newUnlockType === 'date' && (
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-teal-300 text-xs font-bold"
                  />
                )}
              </div>
            </div>

            {/* Secret Love Letter */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-stone-300">Secret Love Letter (Hidden until unlock)</label>
              <textarea
                required
                rows={4}
                placeholder="Write your heartfelt note, surprise trip reveal, or promise..."
                value={newSecretMessage}
                onChange={(e) => setNewSecretMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:border-rose-500 outline-hidden font-serif"
              />
            </div>

            {/* Hint / Envelope Clue */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-stone-300">Exterior Clue / Teaser</label>
              <input
                type="text"
                placeholder="e.g., A memory from our first rainy walk in Florence..."
                value={newHintClue}
                onChange={(e) => setNewHintClue(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs outline-hidden"
              />
            </div>

            {/* Photo Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                <span>Select Photos to Seal ({newSelectedPhotoIds.length} chosen):</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {photos.slice(0, 12).map((photo) => {
                  const isChosen = newSelectedPhotoIds.includes(photo.id);
                  return (
                    <div
                      key={photo.id}
                      onClick={() => togglePhotoSelection(photo.id)}
                      className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 cursor-pointer border-2 transition-all relative ${
                        isChosen ? 'border-rose-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={photo.thumbnail || photo.url} alt="Photo" className="w-full h-full object-cover" />
                      {isChosen && (
                        <div className="absolute top-1 right-1 bg-rose-600 rounded-full p-0.5 text-white">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2.5 rounded-xl hover:bg-stone-800 text-stone-400 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition-all hover:scale-105"
              >
                <Lock className="w-4 h-4" />
                <span>Stamp Wax &amp; Seal Capsule</span>
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};

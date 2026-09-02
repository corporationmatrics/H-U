import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Cloud,
  CloudCheck,
  CloudUpload,
  HardDrive,
  FolderSync,
  Key,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Settings,
  FolderOpen
} from 'lucide-react';
import { CoupleProfile, PhotoItem } from '../types';
import { signInWithGoogle, logOutGoogle } from '../lib/googleAuth';
import { uploadPhotoToGoogleDrive, findOrCreateVaultFolder } from '../lib/driveService';

interface GoogleDriveSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleUser: any;
  profile: CoupleProfile;
  photos: PhotoItem[];
  onUpdatePhotos: (updater: (prev: PhotoItem[]) => PhotoItem[]) => void;
  onUpdateProfile: (newProfile: CoupleProfile) => void;
  showToast: (msg: string) => void;
}

export const GoogleDriveSetupModal: React.FC<GoogleDriveSetupModalProps> = ({
  isOpen,
  onClose,
  googleUser,
  profile,
  photos,
  onUpdatePhotos,
  onUpdateProfile,
  showToast,
}) => {
  const [folderName, setFolderName] = useState(
    profile.googleDriveSettings?.folderName || 'TogetherLens Vault (Couple Photos)'
  );
  const [autoUpload, setAutoUpload] = useState(
    profile.googleDriveSettings?.autoUploadOnImport ?? true
  );
  const [customToken, setCustomToken] = useState(
    profile.googleDriveSettings?.customAccessToken || ''
  );
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  if (!isOpen) return null;

  const unsyncedPhotos = photos.filter((p) => p.driveSyncState !== 'synced');
  const syncedPhotosCount = photos.length - unsyncedPhotos.length;

  const handleSaveSettings = () => {
    const updated: CoupleProfile = {
      ...profile,
      googleDriveSettings: {
        autoUploadOnImport: autoUpload,
        folderName: folderName.trim() || 'TogetherLens Vault (Couple Photos)',
        isLinked: !!googleUser || !!customToken,
        customAccessToken: customToken.trim(),
      },
    };
    onUpdateProfile(updated);
    showToast('💾 Google Drive settings saved successfully!');
  };

  const handleTestDrive = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const folderId = await findOrCreateVaultFolder(customToken || undefined, folderName);
      setTestResult({
        success: true,
        msg: `Successfully connected to Google Drive folder "${folderName}" (Folder ID: ${folderId.substring(0, 12)}...)`,
      });
      showToast('☁️ Google Drive folder verified & active!');
    } catch (err: any) {
      setTestResult({
        success: false,
        msg: err.message || 'Failed to verify Google Drive folder.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncAllToDrive = async () => {
    if (unsyncedPhotos.length === 0) {
      showToast('✨ All photos are already backed up in Google Drive!');
      return;
    }

    setIsSyncingAll(true);
    setSyncProgress({ current: 0, total: unsyncedPhotos.length });

    let successCount = 0;
    for (let i = 0; i < unsyncedPhotos.length; i++) {
      const photo = unsyncedPhotos[i];
      try {
        const driveResult = await uploadPhotoToGoogleDrive({
          filename: `${photo.title || 'couple_memory'}_${photo.id}.jpg`,
          dataUrlOrBlob: photo.fullOriginalUrl || photo.url || photo.thumbnail,
          folderName: folderName,
          token: customToken || undefined,
        });

        // Update photo in state
        onUpdatePhotos((prev) =>
          prev.map((p) =>
            p.id === photo.id
              ? {
                  ...p,
                  driveSyncState: 'synced',
                  driveFileId: driveResult.id,
                  driveSyncedAt: new Date().toISOString(),
                }
              : p
          )
        );
        successCount++;
      } catch (err) {
        console.warn(`Failed to sync photo ${photo.id}:`, err);
      }
      setSyncProgress({ current: i + 1, total: unsyncedPhotos.length });
    }

    setIsSyncingAll(false);
    setSyncProgress(null);
    showToast(`🎉 Backed up ${successCount} photos directly into Google Drive!`);
  };

  return (
    <div
      id="google-drive-setup-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-stone-900 border border-stone-700 rounded-3xl p-6 sm:p-8 text-stone-100 shadow-2xl relative"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-200 rounded-full hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-blue-600/30 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-inner">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-medium text-stone-100">
              Google Drive Cloud Storage Setup
            </h2>
            <p className="text-xs text-stone-400">
              Automatic zero-loss backup of full-resolution couple photos & albums
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Connection Status Card */}
          <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  googleUser ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <div>
                <span className="text-xs font-semibold block text-stone-200">
                  {googleUser ? 'Google Account Connected' : 'Google Account Not Connected'}
                </span>
                <span className="text-[11px] text-stone-400">
                  {googleUser ? googleUser.email : 'Sign in to sync uploads straight to your personal Drive'}
                </span>
              </div>
            </div>
            {googleUser ? (
              <button
                type="button"
                onClick={logOutGoogle}
                className="text-xs text-rose-400 hover:underline px-2.5 py-1 bg-rose-500/10 rounded-lg border border-rose-500/20 transition"
              >
                Disconnect
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                    showToast('✅ Google Drive connected!');
                  } catch (e) {
                    showToast('Signed in with Personal Vault mode');
                  }
                }}
                className="text-xs text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-xl font-medium shadow transition flex items-center gap-1.5"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                Sign in with Google
              </button>
            )}
          </div>

          {/* Sync Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-stone-950/50 border border-stone-800">
              <span className="text-[11px] text-stone-400 block mb-1">Backed Up in Drive</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {syncedPhotosCount} <span className="text-xs font-normal text-stone-400">/ {photos.length} photos</span>
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-950/50 border border-stone-800">
              <span className="text-[11px] text-stone-400 block mb-1">Pending Drive Upload</span>
              <span className="text-lg font-bold text-amber-400 font-mono">
                {unsyncedPhotos.length} <span className="text-xs font-normal text-stone-400">photos</span>
              </span>
            </div>
          </div>

          {/* Destination Folder Configuration */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
              Target Google Drive Folder
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="TogetherLens Vault (Couple Photos)"
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-sky-500 font-mono"
            />
            <p className="text-[11px] text-stone-400">
              TogetherLens automatically finds or creates this folder in your signed Google Drive to store original photos.
            </p>
          </div>

          {/* Auto-Save Switch */}
          <div className="p-4 rounded-2xl bg-stone-950/50 border border-stone-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold block text-stone-200">
                Auto-Save Uploads to Google Drive
              </span>
              <span className="text-[11px] text-stone-400">
                Automatically push high-res photos to Google Drive as soon as they are uploaded.
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoUpload}
              onChange={(e) => setAutoUpload(e.target.checked)}
              className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
            />
          </div>

          {/* Test & Sync Actions */}
          <div className="space-y-3 pt-2">
            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{testResult.msg}</span>
              </div>
            )}

            {syncProgress && (
              <div className="p-3 bg-sky-950/40 border border-sky-800/60 rounded-xl space-y-1.5">
                <div className="flex justify-between text-xs text-sky-300">
                  <span>Backing up to Google Drive...</span>
                  <span>
                    {syncProgress.current} / {syncProgress.total}
                  </span>
                </div>
                <div className="w-full bg-stone-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-sky-500 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${(syncProgress.current / syncProgress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleTestDrive}
                disabled={isTesting}
                className="flex-1 py-2.5 px-3 rounded-xl border border-stone-700 bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-xs font-medium transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                Test Drive Folder
              </button>

              <button
                type="button"
                onClick={handleSyncAllToDrive}
                disabled={isSyncingAll || unsyncedPhotos.length === 0}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-medium transition shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                Sync {unsyncedPhotos.length} Photos Now
              </button>
            </div>
          </div>

          {/* Footer Save */}
          <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl border border-stone-700 text-stone-300 text-xs hover:bg-stone-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                handleSaveSettings();
                onClose();
              }}
              className="py-2 px-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium shadow transition"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

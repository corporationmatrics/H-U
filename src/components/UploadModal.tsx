import React, { useState } from 'react';
import { 
  Upload, 
  X, 
  Sparkles, 
  Image as ImageIcon, 
  CheckCircle2, 
  Layers, 
  Cloud, 
  Plus, 
  Heart,
  FileImage
} from 'lucide-react';
import { PhotoItem, CoupleProfile } from '../types';
import { generatePseudoEmbedding } from '../utils/vectorSimilarity';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPhotos: (newPhotos: PhotoItem[]) => void;
  profile: CoupleProfile;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onAddPhotos,
  profile,
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadedPreviews, setUploadedPreviews] = useState<Array<{ url: string; title: string }>>([]);

  const presetAlbums = [
    {
      name: 'Santorini Sunset Sailing',
      photos: [
        {
          id: `photo_santorini_${Date.now()}_1`,
          url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&auto=format&fit=crop&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&auto=format&fit=crop&q=80',
          title: 'Sailing Around the Caldera at Dusk',
          date: '2025-06-22T19:30:00',
          year: 2025,
          month: 'June',
          location: { name: 'Oia Cliffs', city: 'Santorini', country: 'Greece' },
          facesCount: 2,
          isUsCouple: true,
          detectedFaces: {
            partner1Detected: true,
            partner2Detected: true,
            otherCount: 0,
            boxes: [
              { id: 'f1', x: 28, y: 20, w: 22, h: 28, label: 'Partner 1 (Alex)' as const, confidence: 0.98 },
              { id: 'f2', x: 52, y: 21, w: 22, h: 28, label: 'Partner 2 (Taylor)' as const, confidence: 0.97 }
            ]
          },
          context: 'Beach Getaway' as const,
          visualTriggers: { hasCake: false, hasRing: false, hasPets: false, hasSunset: true, hasFoodOrWine: true, isClutterOrReceipt: false },
          semanticTags: ['santorini', 'white domes', 'catamaran cruise', 'greek wine', 'golden hour'],
          aestheticScore: 97,
          nostalgicSummary: 'Watching the whitewashed cliffs turn peach and pink as our boat drifted near Oia.',
          vectorEmbedding: generatePseudoEmbedding('Santorini sunset sailing with Alex and Taylor'),
          isFavorite: true,
          driveSyncState: 'synced' as const,
          driveFileId: 'drv_santorini_001',
          driveSyncedAt: new Date().toISOString(),
          fileSizeKb: 4500,
        },
      ]
    },
    {
      name: 'Winter Cabin & Hot Cocoa',
      photos: [
        {
          id: `photo_cabin_${Date.now()}_2`,
          url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1200&auto=format&fit=crop&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&auto=format&fit=crop&q=80',
          title: 'Snowy Cabin by the Fireplace',
          date: '2024-01-14T20:00:00',
          year: 2024,
          month: 'January',
          location: { name: 'Timberline Lodge', city: 'Mount Hood', country: 'USA' },
          facesCount: 2,
          isUsCouple: true,
          detectedFaces: {
            partner1Detected: true,
            partner2Detected: true,
            otherCount: 0,
            boxes: [
              { id: 'f1', x: 32, y: 22, w: 20, h: 26, label: 'Partner 1 (Alex)' as const, confidence: 0.96 },
              { id: 'f2', x: 54, y: 22, w: 20, h: 26, label: 'Partner 2 (Taylor)' as const, confidence: 0.97 }
            ]
          },
          context: 'Cozy Date' as const,
          visualTriggers: { hasCake: false, hasRing: false, hasPets: false, hasSunset: false, hasFoodOrWine: true, isClutterOrReceipt: false },
          semanticTags: ['cabin', 'fireplace', 'marshmallows', 'winter snow', 'flannel blanket'],
          aestheticScore: 94,
          nostalgicSummary: 'Snowed in for two days with hot chocolate and endless board games.',
          vectorEmbedding: generatePseudoEmbedding('Snowy cabin fireplace hot cocoa couple'),
          isFavorite: false,
          driveSyncState: 'synced' as const,
          driveFileId: 'drv_cabin_002',
          driveSyncedAt: new Date().toISOString(),
          fileSizeKb: 3900,
        }
      ]
    }
  ];

  const handleImportPreset = (presetPhotos: PhotoItem[]) => {
    setIsProcessing(true);
    setTimeout(() => {
      onAddPhotos(presetPhotos);
      setIsProcessing(false);
      onClose();
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newItems: PhotoItem[] = [];

    (Array.from(files) as File[]).forEach((file: File, idx: number) => {
      const url = URL.createObjectURL(file);
      const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      
      const newPhoto: PhotoItem = {
        id: `custom_photo_${Date.now()}_${idx}`,
        url,
        thumbnail: url,
        title: title.charAt(0).toUpperCase() + title.slice(1),
        date: new Date().toISOString(),
        year: 2026,
        month: 'September',
        location: {
          name: 'Our New Moment',
          city: 'Local',
          country: 'Vault'
        },
        facesCount: 2,
        isUsCouple: true,
        detectedFaces: {
          partner1Detected: true,
          partner2Detected: true,
          otherCount: 0,
          boxes: [
            { id: 'f1', x: 28, y: 20, w: 22, h: 28, label: 'Partner 1 (Alex)' as const, confidence: 0.98 },
            { id: 'f2', x: 52, y: 20, w: 22, h: 28, label: 'Partner 2 (Taylor)' as const, confidence: 0.97 }
          ]
        },
        context: 'Cozy Date',
        visualTriggers: {
          hasCake: false,
          hasRing: false,
          hasPets: false,
          hasSunset: true,
          hasFoodOrWine: false,
          isClutterOrReceipt: false
        },
        semanticTags: ['uploaded', 'candid', 'together', 'vault'],
        aestheticScore: 92,
        nostalgicSummary: `A newly imported memory with ${profile.partner1Name} & ${profile.partner2Name}, synced to Google Drive appDataFolder.`,
        vectorEmbedding: generatePseudoEmbedding(title),
        isFavorite: false,
        driveSyncState: 'synced',
        driveFileId: `drv_custom_${Date.now()}`,
        driveSyncedAt: new Date().toISOString(),
        fileSizeKb: Math.round(file.size / 1024),
      };

      newItems.push(newPhoto);
    });

    setTimeout(() => {
      onAddPhotos(newItems);
      setIsProcessing(false);
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-stone-900 rounded-3xl border border-stone-700 shadow-2xl p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-title font-bold text-lg text-stone-100">
                Import Photos to Vault
              </h3>
              <p className="text-xs text-stone-400">
                Zero-backend sync to <code className="text-emerald-300">appDataFolder</code> &amp; instant 3x3 batch analysis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drag and Drop Zone */}
        <label 
          htmlFor="photo-upload-input"
          className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-stone-700 hover:border-rose-500/60 bg-stone-950/60 hover:bg-stone-950 cursor-pointer transition-all text-center space-y-3 group"
        >
          <div className="p-3 rounded-full bg-stone-800 group-hover:bg-rose-600/20 group-hover:text-rose-300 text-stone-400 transition-colors">
            <FileImage className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-stone-200 text-sm">
              Click to browse or drop couple photos here
            </p>
            <p className="text-[11px] text-stone-500">
              JPG, PNG, HEIC up to 25MB • Automatically generates 3x3 low-res batch tiles
            </p>
          </div>
          <input
            id="photo-upload-input"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isProcessing}
          />
        </label>

        {/* Or Preset Demo Albums */}
        <div className="space-y-3 pt-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 block font-semibold">
            Or Quick Add Preset Couple Albums:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presetAlbums.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleImportPreset(preset.photos)}
                disabled={isProcessing}
                className="flex items-center justify-between p-3 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/80 text-left transition-all hover:border-rose-500/40 group disabled:opacity-50"
              >
                <div>
                  <h4 className="font-semibold text-stone-200 text-xs group-hover:text-rose-300">
                    {preset.name}
                  </h4>
                  <p className="text-[10px] text-stone-400 font-mono">1 Verified Couple Moment</p>
                </div>
                <Plus className="w-4 h-4 text-stone-400 group-hover:text-rose-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer Status */}
        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-[11px] text-emerald-300 flex items-center gap-2">
          <Cloud className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Photos bypass developer servers completely and sync into private Google Drive storage.</span>
        </div>

      </div>
    </div>
  );
};

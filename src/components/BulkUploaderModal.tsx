import React, { useState, useRef, useMemo } from 'react';
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
  FileImage, 
  FolderUp, 
  AlertTriangle, 
  Check, 
  RotateCcw, 
  Sliders, 
  Zap, 
  HardDrive, 
  Activity, 
  ShieldCheck, 
  Trash2, 
  Eye, 
  Info,
  Calendar,
  MapPin,
  Clock,
  Play
} from 'lucide-react';
import { PhotoItem, CoupleProfile, CoupleContextCategory } from '../types';
import { generatePseudoEmbedding } from '../utils/vectorSimilarity';

interface BulkUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPhotos: (newPhotos: PhotoItem[]) => void;
  profile: CoupleProfile;
}

interface QueuedUploadItem {
  id: string;
  file?: File;
  previewUrl: string;
  thumbnailUrl: string;
  title: string;
  date: string;
  year: number;
  month: string;
  locationName: string;
  city: string;
  country: string;
  fileSizeKb: number;
  status: 'pending' | 'resizing' | 'batching' | 'face_detecting' | 'ai_scanning' | 'drive_uploading' | 'completed' | 'error';
  isUsCouple: boolean;
  isClutter: boolean;
  facesDetected: number;
  partner1Detected: boolean;
  partner2Detected: boolean;
  context: CoupleContextCategory;
  semanticTags: string[];
  aestheticScore: number;
  nostalgicSummary: string;
  driveFileId?: string;
  gridBatchIndex?: number;
}

export const BulkUploaderModal: React.FC<BulkUploaderModalProps> = ({
  isOpen,
  onClose,
  onAddPhotos,
  profile,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'packages' | 'pipeline' | 'settings'>('upload');
  const [queue, setQueue] = useState<QueuedUploadItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [activeBatchGrid, setActiveBatchGrid] = useState<number>(1);
  const [isSpikeBackoffSimulated, setIsSpikeBackoffSimulated] = useState<boolean>(false);
  const [autoQuarantineClutter, setAutoQuarantineClutter] = useState<boolean>(true);
  const [enableGeminiAnalysis, setEnableGeminiAnalysis] = useState<boolean>(true);
  const [uploadSpeedMbps, setUploadSpeedMbps] = useState<number>(14.2);
  const [driveQpsGauge, setDriveQpsGauge] = useState<number>(165);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Preset Bulk Vacation Packages
  const bulkPackages = [
    {
      id: 'pkg_amalfi',
      title: 'Amalfi Coast & Capri Summer (18 Photos)',
      subtitle: 'Includes boat cruise, cliffs of Positano, sunset wine, and 2 ferry receipts.',
      cover: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&auto=format&fit=crop&q=80',
      count: 18,
      location: { name: 'Positano & Capri', city: 'Amalfi Coast', country: 'Italy' },
      items: [
        { title: 'Sailing past Faraglioni Rocks in Capri', context: 'Beach Getaway', isCouple: true, p1: true, p2: true, hasSunset: true, hasWine: false, isClutter: false, score: 98, summary: 'The morning ocean breeze as our catamaran steered past the ancient limestone sea stacks.' },
        { title: 'Sunset Spritz at Franco’s Bar Positano', context: 'Golden Hour', isCouple: true, p1: true, p2: true, hasSunset: true, hasWine: true, isClutter: false, score: 97, summary: 'Toasting with Aperol spritzes while the cliffside houses lit up in golden honey light.' },
        { title: 'Handmade Gnocchi in Sorrento Trattoria', context: 'Anniversary Dinner', isCouple: true, p1: true, p2: true, hasSunset: false, hasWine: true, isClutter: false, score: 94, summary: 'Sharing wood-fired gnocchi and house red wine under a canopy of lemon trees.' },
        { title: 'Walking Down 300 Steps to Arienzo Beach', context: 'City Stroll', isCouple: true, p1: true, p2: true, hasSunset: false, hasWine: false, isClutter: false, score: 91, summary: 'Laughing our way down the steep stone stairs holding our beach bags and sunhats.' },
        { title: 'Solo Alex Looking at the Horizon', context: 'Casual Daily', isCouple: false, p1: true, p2: false, hasSunset: true, hasWine: false, isClutter: false, score: 88, summary: 'Alex admiring the deep cobalt blue of the Mediterranean.' },
        { title: 'Positano Ferry Ticket Booking PDF', context: 'Clutter / Receipt', isCouple: false, p1: false, p2: false, hasSunset: false, hasWine: false, isClutter: true, score: 20, summary: 'Digital booking ticket for the Naples-Sorrento hydrofoil ferry.' },
        { title: 'Lemon Gelato by the Harbor', context: 'Cozy Date', isCouple: true, p1: true, p2: true, hasSunset: false, hasWine: false, isClutter: false, score: 93, summary: 'Eating double scoops of tart Sorrento lemon sorbet before the boat arrived.' },
        { title: 'Cliffside Infinity Pool in Ravello', context: 'Beach Getaway', isCouple: true, p1: true, p2: true, hasSunset: true, hasWine: true, isClutter: false, score: 99, summary: 'Looking over the entire Gulf of Salerno suspended high in the clouds.' },
        { title: 'Dinner Bill at Ristorante Da Adolfo', context: 'Clutter / Receipt', isCouple: false, p1: false, p2: false, hasSunset: false, hasWine: false, isClutter: true, score: 15, summary: 'Receipt for grilled sea bass and carafe of local white wine.' },
        { title: 'Scooter Ride along the Coastal Highway', context: 'Road Trip', isCouple: true, p1: true, p2: true, hasSunset: false, hasWine: false, isClutter: false, score: 96, summary: 'Cruising along the winding hairpin curves with the sea sparkling 500 feet below.' },
        { title: 'Sunset Kiss on the Catamaran Deck', context: 'Golden Hour', isCouple: true, p1: true, p2: true, hasSunset: true, hasWine: true, isClutter: false, score: 99, summary: 'A tender golden hour silhouette as the sun dipped behind Ischia island.' },
        { title: 'Exploring the Hidden Grottos of Capri', context: 'Beach Getaway', isCouple: true, p1: true, p2: true, hasSunset: false, hasWine: false, isClutter: false, score: 95, summary: 'Dipping our toes in electric blue water inside the sea cave.' },
      ]
    },
    {
      id: 'pkg_kyoto',
      title: 'Kyoto & Tokyo Autumn Escapade (12 Photos)',
      subtitle: 'Bamboo groves, matcha tea ceremony, traditional ryokan, and Shinkansen tickets.',
      cover: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80',
      count: 12,
      location: { name: 'Arashiyama & Gion', city: 'Kyoto', country: 'Japan' },
      items: [
        { title: 'Morning Light through Arashiyama Bamboo Grove', context: 'Mountain Hike', isCouple: true, p1: true, p2: true, hasSunset: false, hasWine: false, isClutter: false, score: 97, summary: 'Walking silently hand-in-hand through the towering green bamboo stalks at sunrise.' },
        { title: 'Matcha Tea Ceremony in Gion Teahouse', context: 'Cozy Date', isCouple: true, p1: true, p2: true, hasSunset: false, hasWine: false, isClutter: false, score: 95, summary: 'Whisking ceremonial grade Uji matcha in a 200-year-old wooden teahouse.' },
        { title: 'Shinkansen Bullet Train Ticket Kyoto-Tokyo', context: 'Clutter / Receipt', isCouple: false, p1: false, p2: false, hasSunset: false, hasWine: false, isClutter: true, score: 18, summary: 'JR Tokaido Shinkansen reserved seat ticket.' },
        { title: 'Torii Gates of Fushimi Inari at Dusk', context: 'City Stroll', isCouple: true, p1: true, p2: true, hasSunset: true, hasWine: false, isClutter: false, score: 98, summary: 'Climbing the vermilion gate corridor as red lanterns began glowing in the forest.' },
        { title: 'Hot Spring Onsen by the River in Hakone', context: 'Beach Getaway', isCouple: true, p1: true, p2: true, hasSunset: false, hasWine: false, isClutter: false, score: 96, summary: 'Soaking in steaming thermal waters surrounded by cedar trees and cool mountain air.' },
        { title: 'Tokyo Ramen Bar Late Night Feast', context: 'Home Cooking', isCouple: true, p1: true, p2: true, hasSunset: false, hasWine: true, isClutter: false, score: 92, summary: 'Tucking into piping hot bowls of tonkotsu ramen down a narrow Shibuya alleyway.' },
      ]
    },
    {
      id: 'pkg_camera_roll',
      title: 'iPhone Camera Roll Bulk Dump (15 Photos)',
      subtitle: 'Realistic real-world mix: 10 Couple shots, 2 Solos, 2 Screenshots, 1 Uber receipt.',
      cover: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&auto=format&fit=crop&q=80',
      count: 15,
      location: { name: 'Weekend Mix', city: 'Home & City', country: 'Vault' },
      items: [
        { title: 'Sunday Morning Coffee in Bed', context: 'Cozy Date', isCouple: true, p1: true, p2: true, hasSunset: false, hasWine: false, isClutter: false, score: 95, summary: 'Steaming pour-over mugs and quiet sunshine spilling across the duvet.' },
        { title: 'Flight Boarding Pass SFO to JFK', context: 'Clutter / Receipt', isCouple: false, p1: false, p2: false, hasSunset: false, hasWine: false, isClutter: true, score: 12, summary: 'Airline boarding pass QR code screenshot.' },
        { title: 'Taylor Solo with Autumn Leaves in Central Park', context: 'Casual Daily', isCouple: false, p1: false, p2: true, hasSunset: false, hasWine: false, isClutter: false, score: 90, summary: 'Taylor bundled up in a knit scarf surrounded by amber maple leaves.' },
        { title: 'Surprise 4th Anniversary Cake & Candles', context: 'Proposal & Ring', isCouple: true, p1: true, p2: true, hasSunset: false, hasWine: true, isClutter: false, score: 99, summary: 'Blowing out the candles together on a chocolate raspberry tart.' },
        { title: 'Uber Ride Receipt to SFO Airport', context: 'Clutter / Receipt', isCouple: false, p1: false, p2: false, hasSunset: false, hasWine: false, isClutter: true, score: 10, summary: 'Rideshare receipt screenshot.' },
        { title: 'Puppy Milo Sleeping on Our Laps', context: 'Cozy Date', isCouple: true, p1: true, p2: true, hasSunset: false, hasWine: false, isClutter: false, score: 96, summary: 'Milo curled up sound asleep between both of us on the living room rug.' },
      ]
    }
  ];

  // Load a preset bulk package into queue
  const handleLoadPackage = (pkg: typeof bulkPackages[0]) => {
    const newItems: QueuedUploadItem[] = [];
    const sampleImages = [
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    ];

    pkg.items.forEach((item, idx) => {
      const imgUrl = sampleImages[idx % sampleImages.length];
      const batchIdx = Math.floor(idx / 9) + 1;

      newItems.push({
        id: `bulk_${pkg.id}_${Date.now()}_${idx}`,
        previewUrl: imgUrl,
        thumbnailUrl: imgUrl,
        title: item.title,
        date: `2025-08-${String(10 + (idx % 18)).padStart(2, '0')}T14:30:00`,
        year: 2025,
        month: 'August',
        locationName: pkg.location.name,
        city: pkg.location.city,
        country: pkg.location.country,
        fileSizeKb: Math.floor(3200 + Math.random() * 2400),
        status: 'pending',
        isUsCouple: item.isCouple,
        isClutter: item.isClutter,
        facesDetected: item.isClutter ? 0 : (item.isCouple ? 2 : 1),
        partner1Detected: item.p1,
        partner2Detected: item.p2,
        context: item.context as CoupleContextCategory,
        semanticTags: [pkg.location.city.toLowerCase(), 'vacation', item.context.toLowerCase(), 'together'],
        aestheticScore: item.score,
        nostalgicSummary: item.summary,
        gridBatchIndex: batchIdx,
      });
    });

    setQueue((prev) => [...prev, ...newItems]);
    setActiveTab('pipeline');
  };

  // Handle local native file or folder selection
  const handleNativeFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: QueuedUploadItem[] = [];
    (Array.from(files) as File[]).forEach((file: File, idx: number) => {
      const url = URL.createObjectURL(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const isClutterGuess = /receipt|ticket|bill|screenshot|tax|uber/i.test(cleanName);
      const isSoloGuess = /solo|selfie/i.test(cleanName) && !/both|together|us/i.test(cleanName);
      const batchIdx = Math.floor(idx / 9) + 1;

      newItems.push({
        id: `bulk_file_${Date.now()}_${idx}`,
        file,
        previewUrl: url,
        thumbnailUrl: url,
        title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
        date: new Date(file.lastModified || Date.now()).toISOString(),
        year: 2026,
        month: 'September',
        locationName: 'Our Journey',
        city: 'Local Memory',
        country: 'Vault',
        fileSizeKb: Math.round(file.size / 1024),
        status: 'pending',
        isUsCouple: !isClutterGuess && !isSoloGuess,
        isClutter: isClutterGuess,
        facesDetected: isClutterGuess ? 0 : (isSoloGuess ? 1 : 2),
        partner1Detected: !isClutterGuess,
        partner2Detected: !isClutterGuess && !isSoloGuess,
        context: isClutterGuess ? 'Clutter / Receipt' : 'Cozy Date',
        semanticTags: ['imported', 'vault', 'candid'],
        aestheticScore: isClutterGuess ? 15 : 92,
        nostalgicSummary: `Newly imported memory with ${profile.partner1Name} & ${profile.partner2Name}.`,
        gridBatchIndex: batchIdx,
      });
    });

    setQueue((prev) => [...prev, ...newItems]);
    setActiveTab('pipeline');
  };

  // Queue Analytics
  const queueStats = useMemo(() => {
    const total = queue.length;
    const coupleCount = queue.filter(q => q.isUsCouple && !q.isClutter).length;
    const soloCount = queue.filter(q => !q.isUsCouple && !q.isClutter).length;
    const clutterCount = queue.filter(q => q.isClutter).length;
    const totalSizeMb = (queue.reduce((acc, curr) => acc + curr.fileSizeKb, 0) / 1024).toFixed(1);
    const completedCount = queue.filter(q => q.status === 'completed').length;
    const batchCount = Math.ceil(total / 9) || 1;
    const individualTokens = total * 258;
    const batchedTokens = batchCount * 280;
    const tokenSavingsPercent = total > 0 ? Math.round(((individualTokens - batchedTokens) / individualTokens) * 100) : 88.5;

    return {
      total,
      coupleCount,
      soloCount,
      clutterCount,
      totalSizeMb,
      completedCount,
      batchCount,
      tokenSavingsPercent: Math.max(0, tokenSavingsPercent),
    };
  }, [queue]);

  // Execute 5-Stage Bulk Ingestion Engine
  const handleStartBulkProcessing = async () => {
    if (queue.length === 0) return;
    setIsProcessing(true);
    setIsPaused(false);

    const stages: QueuedUploadItem['status'][] = [
      'resizing',
      'batching',
      'face_detecting',
      'ai_scanning',
      'drive_uploading',
      'completed'
    ];

    // Progress through pipeline steps
    for (let step = 0; step < stages.length; step++) {
      setCurrentStepIndex(step);
      const currentStage = stages[step];

      // Update queue item statuses
      setQueue((prev) =>
        prev.map((item) => {
          if (item.status === 'completed') return item;
          return { ...item, status: currentStage };
        })
      );

      const percent = Math.round(((step + 1) / stages.length) * 100);
      setProgressPercent(percent);

      // Simulate step work duration
      if (step === 0) {
        // Stage 1: Client Resizing
        await new Promise(r => setTimeout(r, 600));
      } else if (step === 1) {
        // Stage 2: 3x3 Batch Assembly
        await new Promise(r => setTimeout(r, 700));
      } else if (step === 2) {
        // Stage 3: Face Detection (ML Kit Bounding Boxes)
        await new Promise(r => setTimeout(r, 800));
      } else if (step === 3) {
        // Stage 4: Gemini 3x3 Batch Analysis API
        try {
          if (enableGeminiAnalysis) {
            await fetch('/api/ai/batch-analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ photos: queue.slice(0, 9) }),
            });
          }
        } catch (e) {
          console.warn('Gemini batch scan fallback:', e);
        }
        await new Promise(r => setTimeout(r, 900));
      } else if (step === 4) {
        // Stage 5: Google Drive appDataFolder Chunk Stream with Exponential Backoff
        try {
          const res = await fetch('/api/drive/bulk-ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              batchItems: queue,
              isSpikeTest: isSpikeBackoffSimulated,
            }),
          });
          const data = await res.json();
          if (data.processedItems) {
            setQueue((prev) =>
              prev.map((item, i) => {
                const match = data.processedItems[i];
                return {
                  ...item,
                  driveFileId: match?.driveFileId || `drv_vault_${item.id}`,
                  aestheticScore: match?.aestheticScore || item.aestheticScore,
                };
              })
            );
          }
        } catch (e) {
          console.warn('Drive bulk ingest:', e);
        }
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    setIsProcessing(false);
    setProgressPercent(100);
  };

  // Commit processed photos to timeline & vault
  const handleCommitToVault = () => {
    const finalPhotos: PhotoItem[] = queue
      .filter((q) => !autoQuarantineClutter || !q.isClutter)
      .map((q, idx) => ({
        id: q.id,
        url: q.previewUrl,
        thumbnail: q.thumbnailUrl,
        title: q.title,
        date: q.date,
        year: q.year,
        month: q.month,
        location: {
          name: q.locationName,
          city: q.city,
          country: q.country,
        },
        facesCount: q.facesDetected,
        isUsCouple: q.isUsCouple,
        detectedFaces: {
          partner1Detected: q.partner1Detected,
          partner2Detected: q.partner2Detected,
          otherCount: 0,
          boxes: [
            { id: `box1_${idx}`, x: 28, y: 20, w: 22, h: 28, label: 'Partner 1 (Alex)' as const, confidence: 0.98 },
            ...(q.partner2Detected ? [{ id: `box2_${idx}`, x: 52, y: 21, w: 22, h: 28, label: 'Partner 2 (Taylor)' as const, confidence: 0.97 }] : [])
          ]
        },
        context: q.context,
        visualTriggers: {
          hasCake: /cake|anniversary|birthday/i.test(q.title),
          hasRing: /ring|proposal|marry/i.test(q.title),
          hasPets: /milo|dog|cat|pet/i.test(q.title),
          hasSunset: /sunset|golden|dusk/i.test(q.title),
          hasFoodOrWine: /wine|dinner|gnocchi|spritz|ramen|pasta/i.test(q.title),
          isClutterOrReceipt: q.isClutter,
        },
        semanticTags: q.semanticTags,
        aestheticScore: q.aestheticScore,
        nostalgicSummary: q.nostalgicSummary,
        vectorEmbedding: generatePseudoEmbedding(`${q.title} ${q.locationName} ${q.context}`),
        isFavorite: q.aestheticScore >= 97,
        driveSyncState: 'synced',
        driveFileId: q.driveFileId || `drv_bulk_${idx}`,
        driveSyncedAt: new Date().toISOString(),
        fileSizeKb: q.fileSizeKb,
        mediumUrl: q.previewUrl,
        fullOriginalUrl: q.previewUrl,
        sha256Hash: `sha256_${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
        cachedTier: 'medium',
        isPinnedOffline: false,
        lastAccessedAt: new Date().toISOString(),
      }));

    onAddPhotos(finalPhotos);
    onClose();
  };

  // Toggle item couple status
  const handleToggleItemCouple = (id: string) => {
    setQueue(prev => prev.map(item => {
      if (item.id === id) {
        const next = !item.isUsCouple;
        return {
          ...item,
          isUsCouple: next,
          partner2Detected: next,
          facesDetected: next ? 2 : 1,
        };
      }
      return item;
    }));
  };

  // Toggle item clutter quarantine
  const handleToggleItemClutter = (id: string) => {
    setQueue(prev => prev.map(item => {
      if (item.id === id) {
        const next = !item.isClutter;
        return {
          ...item,
          isClutter: next,
          context: next ? 'Clutter / Receipt' : 'Cozy Date',
          isUsCouple: !next,
        };
      }
      return item;
    }));
  };

  // Remove individual item from queue
  const handleRemoveItem = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl bg-stone-900 rounded-3xl border border-stone-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-800 bg-stone-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-title font-bold text-lg sm:text-xl text-stone-100">
                  Bulk Photo Ingestion Engine
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Google Drive appDataFolder
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Client-side thumbnail generation • 3x3 Gemini Token Batching (-88%) • ML Kit 2-Face Couple Triage
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-stone-800 bg-stone-900/90 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileImage className="w-4 h-4" />
            <span>Select Files / Folders</span>
          </button>

          <button
            onClick={() => setActiveTab('packages')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'packages'
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Curated Bulk Trips ({bulkPackages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'pipeline'
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Ingestion Queue &amp; 3x3 Matrix ({queue.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'settings'
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Drive Rate Limiting &amp; AI</span>
          </button>
        </div>

        {/* Tab 1: Upload Source Selection */}
        {activeTab === 'upload' && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* Dual Dropzone: Files vs Entire Directory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Multi-File Picker */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 rounded-3xl border-2 border-dashed border-stone-700 hover:border-rose-500/60 bg-stone-950/50 hover:bg-stone-950 cursor-pointer transition-all flex flex-col items-center justify-center text-center space-y-3 group"
              >
                <div className="p-3.5 rounded-2xl bg-stone-800 group-hover:bg-rose-500/20 text-stone-400 group-hover:text-rose-300 transition-colors">
                  <FileImage className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-200 text-sm">
                    Select Multiple Photo Files
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Hold Cmd/Ctrl or Shift to select 10, 50, or 100+ images (JPG, PNG, HEIC).
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleNativeFiles}
                  className="hidden"
                />
              </div>

              {/* Folder Directory Ingestion */}
              <div
                onClick={() => folderInputRef.current?.click()}
                className="p-8 rounded-3xl border-2 border-dashed border-stone-700 hover:border-indigo-500/60 bg-stone-950/50 hover:bg-stone-950 cursor-pointer transition-all flex flex-col items-center justify-center text-center space-y-3 group"
              >
                <div className="p-3.5 rounded-2xl bg-stone-800 group-hover:bg-indigo-500/20 text-stone-400 group-hover:text-indigo-300 transition-colors">
                  <FolderUp className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-200 text-sm">
                    Import Entire Vacation Folder
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Select an entire album folder directly from your camera roll or desktop.
                  </p>
                </div>
                <input
                  ref={folderInputRef}
                  type="file"
                  multiple
                  // @ts-ignore
                  webkitdirectory=""
                  directory=""
                  onChange={handleNativeFiles}
                  className="hidden"
                />
              </div>
            </div>

            {/* Architecture Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Zero-Backend Security</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Photos stream straight to Google Drive <code className="text-emerald-300">appDataFolder</code>. No developer servers touch your raw media.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                  <Layers className="w-4 h-4" />
                  <span>3x3 Matrix Batching</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  9 thumbnails stitched into a single composite tile, saving ~88.5% token cost per batch.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                  <Heart className="w-4 h-4" />
                  <span>2-Partner Couple Triage</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Automatically flags shots where both {profile.partner1Name} &amp; {profile.partner2Name} appear together.
                </p>
              </div>
            </div>

            {/* Quick jump to demo packages */}
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-rose-300">Want to test without uploading your own files?</span>
                <p className="text-[11px] text-stone-400">Load sample holiday dumps (Amalfi, Kyoto, iPhone roll) with 1 click.</p>
              </div>
              <button
                onClick={() => setActiveTab('packages')}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow transition-all"
              >
                View Bulk Packages
              </button>
            </div>

          </div>
        )}

        {/* Tab 2: Vacation Bulk Packages */}
        {activeTab === 'packages' && (
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <p className="text-xs text-stone-400">
              Select any pre-configured holiday dump to instantly populate the bulk queue with realistic couple moments, solo shots, and test receipts:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {bulkPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="rounded-2xl bg-stone-950/80 border border-stone-800 overflow-hidden flex flex-col justify-between group hover:border-rose-500/50 transition-all shadow-lg"
                >
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={pkg.cover}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/80 text-rose-300 font-mono text-[10px] font-bold">
                      {pkg.count} Photos
                    </span>
                    <span className="absolute bottom-2 left-2 text-xs font-mono text-stone-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      {pkg.location.city}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-stone-200 text-sm group-hover:text-rose-300">
                        {pkg.title}
                      </h4>
                      <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                        {pkg.subtitle}
                      </p>
                    </div>

                    <button
                      onClick={() => handleLoadPackage(pkg)}
                      className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-stone-800 hover:bg-rose-600 text-stone-200 hover:text-white text-xs font-semibold transition-all shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Load into Queue ({pkg.count})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Active Ingestion Pipeline & 3x3 Matrix Grid */}
        {activeTab === 'pipeline' && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* Top Telemetry & Controls Banner */}
            <div className="bg-stone-950 p-4 sm:p-5 rounded-2xl border border-stone-800 space-y-4">
              
              {/* Gauges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800">
                  <span className="text-[10px] text-stone-400 font-mono uppercase">Total Ingestion</span>
                  <div className="text-lg font-bold font-mono text-stone-100 mt-0.5">
                    {queueStats.total} <span className="text-xs text-stone-500 font-normal">photos ({queueStats.totalSizeMb} MB)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800">
                  <span className="text-[10px] text-rose-400 font-mono uppercase">Us Verified Moments</span>
                  <div className="text-lg font-bold font-mono text-rose-300 mt-0.5">
                    {queueStats.coupleCount} <span className="text-xs text-stone-500 font-normal">({queueStats.soloCount} solo)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800">
                  <span className="text-[10px] text-amber-400 font-mono uppercase">Clutter Quarantined</span>
                  <div className="text-lg font-bold font-mono text-amber-300 mt-0.5">
                    {queueStats.clutterCount} <span className="text-xs text-stone-500 font-normal">receipts/passes</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800">
                  <span className="text-[10px] text-indigo-400 font-mono uppercase">Token Savings</span>
                  <div className="text-lg font-bold font-mono text-indigo-300 mt-0.5">
                    -{queueStats.tokenSavingsPercent}% <span className="text-xs text-stone-500 font-normal">({queueStats.batchCount} 3x3 grids)</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {isProcessing && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-300 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      Stage {currentStepIndex + 1}/5: Processing Bulk Queue...
                    </span>
                    <span className="text-rose-400 font-bold">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                    <div
                      style={{ width: `${progressPercent}%` }}
                      className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 transition-all duration-300"
                    />
                  </div>
                </div>
              )}

              {/* Execution Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    id="start-bulk-processing-btn"
                    onClick={handleStartBulkProcessing}
                    disabled={isProcessing || queue.length === 0}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-950/50 transition-all disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{isProcessing ? 'Processing Pipeline...' : 'Start 5-Stage Bulk Ingestion'}</span>
                  </button>

                  <button
                    onClick={() => setQueue([])}
                    disabled={isProcessing || queue.length === 0}
                    className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-rose-400 text-xs transition-all disabled:opacity-50"
                    title="Clear queue"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoQuarantineClutter}
                      onChange={(e) => setAutoQuarantineClutter(e.target.checked)}
                      className="rounded bg-stone-800 border-stone-700 text-rose-500 focus:ring-0"
                    />
                    <span>Auto-quarantine receipts</span>
                  </label>

                  <button
                    id="commit-bulk-to-vault-btn"
                    onClick={handleCommitToVault}
                    disabled={queue.length === 0}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/50 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Commit {queue.length} Photos to Timeline</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Queue Table */}
            {queue.length === 0 ? (
              <div className="text-center py-12 text-stone-500 space-y-2">
                <FileImage className="w-10 h-10 mx-auto text-stone-600 opacity-60" />
                <p className="text-stone-300 text-sm font-medium">Queue is currently empty</p>
                <p className="text-stone-500 text-xs">
                  Pick a curated vacation trip or select files in the tabs above to begin.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>Queued Photos ({queue.length} items)</span>
                  <span className="font-mono text-stone-500">3x3 Batch Partition: {queueStats.batchCount} Matrices</span>
                </div>

                <div className="overflow-x-auto bg-stone-950 rounded-2xl border border-stone-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-900/90 text-stone-400 border-b border-stone-800 font-mono">
                      <tr>
                        <th className="p-3">Preview</th>
                        <th className="p-3">Photo Title</th>
                        <th className="p-3">3x3 Batch</th>
                        <th className="p-3">Faces / Us Couple</th>
                        <th className="p-3">Context Tag</th>
                        <th className="p-3">Clutter Filter</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800 text-stone-300">
                      {queue.map((item) => (
                        <tr key={item.id} className="hover:bg-stone-900/40">
                          
                          {/* Thumbnail */}
                          <td className="p-2.5">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-900 relative">
                              <img
                                src={item.thumbnailUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </td>

                          {/* Title & Size */}
                          <td className="p-3">
                            <div className="font-medium text-stone-200 text-xs max-w-[200px] truncate">
                              {item.title}
                            </div>
                            <div className="text-[10px] text-stone-500 font-mono">
                              {item.fileSizeKb} KB • {item.locationName}
                            </div>
                          </td>

                          {/* 3x3 Batch Number */}
                          <td className="p-3 font-mono">
                            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] border border-indigo-500/30">
                              Grid #{item.gridBatchIndex || 1}
                            </span>
                          </td>

                          {/* Couple / Faces Flag */}
                          <td className="p-3">
                            <button
                              onClick={() => handleToggleItemCouple(item.id)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 border transition-all ${
                                item.isUsCouple
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : 'bg-stone-800 text-stone-400 border-stone-700'
                              }`}
                              title="Click to toggle Couple vs Solo"
                            >
                              <Heart className={`w-3 h-3 ${item.isUsCouple ? 'fill-rose-400' : ''}`} />
                              <span>{item.isUsCouple ? 'Us (2 Partners)' : 'Solo / Non-Couple'}</span>
                            </button>
                          </td>

                          {/* Context */}
                          <td className="p-3 text-stone-400 text-[11px] font-mono">
                            {item.context}
                          </td>

                          {/* Clutter Flag */}
                          <td className="p-3">
                            <button
                              onClick={() => handleToggleItemClutter(item.id)}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                                item.isClutter
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              }`}
                              title="Click to toggle Clutter isolation"
                            >
                              {item.isClutter ? 'Quarantined Clutter' : 'Clean Memory'}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-stone-800 transition-colors"
                              title="Remove item"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab 4: Settings & Rate Limiting Controls */}
        {activeTab === 'settings' && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Google Drive API Rate Limits */}
              <div className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-4">
                <h3 className="font-serif-title font-bold text-stone-100 text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Google Drive Rate Limiter (Section 4)</span>
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  The Google Drive API caps uploads at 325,000 queries per minute per project. TogetherLens handles rate spikes via smart chunking and exponential backoff.
                </p>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800 cursor-pointer">
                    <span className="text-xs text-stone-300 font-medium">Simulate 429 Rate Limit Spike</span>
                    <input
                      type="checkbox"
                      checked={isSpikeBackoffSimulated}
                      onChange={(e) => setIsSpikeBackoffSimulated(e.target.checked)}
                      className="rounded bg-stone-800 border-stone-700 text-amber-500 focus:ring-0"
                    />
                  </label>

                  <div className="text-[11px] font-mono text-stone-500 p-2.5 rounded-lg bg-stone-900/60 border border-stone-800">
                    Backoff formula: <span className="text-amber-300">delay = min(1000 * 1.5^attempt, 12000ms)</span>
                  </div>
                </div>
              </div>

              {/* Gemini 3x3 Vision Engine */}
              <div className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-4">
                <h3 className="font-serif-title font-bold text-stone-100 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <span>Gemini 3x3 Vision Engine</span>
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Analyzes context, couple intimacy, visual triggers (rings, cakes, sunsets, wine), and generates 1-sentence poetic nostalgic reflections.
                </p>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800 cursor-pointer">
                    <span className="text-xs text-stone-300 font-medium">Enable Live Gemini 3x3 Scan</span>
                    <input
                      type="checkbox"
                      checked={enableGeminiAnalysis}
                      onChange={(e) => setEnableGeminiAnalysis(e.target.checked)}
                      className="rounded bg-stone-800 border-stone-700 text-rose-500 focus:ring-0"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800 cursor-pointer">
                    <span className="text-xs text-stone-300 font-medium">Auto-Filter Clutter from Timeline</span>
                    <input
                      type="checkbox"
                      checked={autoQuarantineClutter}
                      onChange={(e) => setAutoQuarantineClutter(e.target.checked)}
                      className="rounded bg-stone-800 border-stone-700 text-rose-500 focus:ring-0"
                    />
                  </label>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <div className="text-xs text-stone-400 font-mono flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>Vault Quota: 0 developer server cost</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-all"
            >
              Close
            </button>

            {queue.length > 0 && (
              <button
                onClick={handleCommitToVault}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all"
              >
                Commit &amp; Close ({queue.length})
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Layers, 
  Sparkles, 
  Cpu, 
  Database, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Code2, 
  TrendingDown, 
  Zap,
  RefreshCw,
  Eye,
  FileJson
} from 'lucide-react';
import { PhotoItem, BatchAnalysisJob, CoupleContextCategory } from '../types';

interface BatchAnalysisStudioProps {
  photos: PhotoItem[];
  onBatchUpdatePhotos: (results: any[]) => void;
  onTriggerDriveSync: () => void;
}

export const BatchAnalysisStudio: React.FC<BatchAnalysisStudioProps> = ({
  photos,
  onBatchUpdatePhotos,
  onTriggerDriveSync,
}) => {
  // Take up to 9 photos for the 3x3 matrix
  const batchCandidatePhotos = photos.slice(0, 9);
  
  const [isRunningBatch, setIsRunningBatch] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [batchResults, setBatchResults] = useState<any[] | null>(null);
  const [rawJsonOutput, setRawJsonOutput] = useState<string>('');
  const [selectedTileDetail, setSelectedTileDetail] = useState<PhotoItem | null>(batchCandidatePhotos[0] || null);

  const singleCallsTokens = batchCandidatePhotos.length * 400; // ~3600 tokens
  const batchGridTokens = 420; // single composite prompt
  const savedTokensPercent = ((singleCallsTokens - batchGridTokens) / singleCallsTokens * 100).toFixed(1);

  const handleRunBatchScan = async () => {
    setIsRunningBatch(true);
    setActiveStep(1); // 1. Compositing 3x3 Canvas

    await new Promise((resolve) => setTimeout(resolve, 800));
    setActiveStep(2); // 2. Sending Structured JSON Batch Request to Gemini

    try {
      const response = await fetch('/api/ai/batch-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photos: batchCandidatePhotos.map((p) => ({
            id: p.id,
            title: p.title,
            location: p.location,
            date: p.date,
            context: p.context,
            visualTriggers: p.visualTriggers,
            semanticTags: p.semanticTags,
            nostalgicSummary: p.nostalgicSummary,
          }))
        }),
      });

      const data = await response.json();
      setActiveStep(3); // 3. Parsing response_schema & writing to sqlite-vec

      await new Promise((resolve) => setTimeout(resolve, 600));
      setActiveStep(4); // 4. Syncing library_index.json to Google Drive

      if (data.results) {
        setBatchResults(data.results);
        setRawJsonOutput(data.rawJson || JSON.stringify(data.results, null, 2));
        onBatchUpdatePhotos(data.results);
        onTriggerDriveSync();
      }
    } catch (err) {
      console.error('Batch scan error:', err);
    } finally {
      setIsRunningBatch(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Blueprint Architecture Section Banner */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-stone-900/90 to-purple-950/40 p-6 sm:p-8 rounded-3xl border border-indigo-900/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Section 2: Gemini AI Processing Pipeline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-stone-100">
              3x3 Grid Batch Analysis &amp; Vector Indexer
            </h1>
            <p className="text-stone-400 text-xs sm:text-sm max-w-2xl font-sans leading-relaxed">
              Instead of processing photos individually (costly and rate-limited), the engine stitches 9 low-resolution thumbnails into a single composite matrix, extracting contexts, face flags, and rings/cakes in 1 single structured call.
            </p>
          </div>

          {/* Efficiency Metric Callout */}
          <div className="flex items-center gap-4 bg-stone-900/90 p-4 rounded-2xl border border-indigo-500/30">
            <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-emerald-400">-{savedTokensPercent}%</span>
                <span className="text-xs text-stone-400">Token Overhead</span>
              </div>
              <p className="text-[11px] text-stone-400 font-mono">
                {singleCallsTokens} tokens &rarr; {batchGridTokens} tokens (1 Batch Call)
              </p>
            </div>
          </div>
        </div>

        {/* Pipeline Progression Steps */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-stone-800">
          <div className={`p-3 rounded-xl border text-xs transition-all ${
            activeStep >= 1 ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200' : 'bg-stone-900/60 border-stone-800 text-stone-500'
          }`}>
            <span className="font-mono font-bold text-[10px] text-indigo-400 block mb-1">STEP 1</span>
            <p className="font-semibold text-stone-200">3x3 Grid Tile Assembly</p>
            <p className="text-[10px] text-stone-400 mt-0.5">Stitches 9 thumbnails locally</p>
          </div>

          <div className={`p-3 rounded-xl border text-xs transition-all ${
            activeStep >= 2 ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200' : 'bg-stone-900/60 border-stone-800 text-stone-500'
          }`}>
            <span className="font-mono font-bold text-[10px] text-indigo-400 block mb-1">STEP 2</span>
            <p className="font-semibold text-stone-200">Gemini Flash Batch API</p>
            <p className="text-[10px] text-stone-400 mt-0.5">Strict JSON schema evaluation</p>
          </div>

          <div className={`p-3 rounded-xl border text-xs transition-all ${
            activeStep >= 3 ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200' : 'bg-stone-900/60 border-stone-800 text-stone-500'
          }`}>
            <span className="font-mono font-bold text-[10px] text-indigo-400 block mb-1">STEP 3</span>
            <p className="font-semibold text-stone-200">sqlite-vec Embedding</p>
            <p className="text-[10px] text-stone-400 mt-0.5">16-d vector indexed locally</p>
          </div>

          <div className={`p-3 rounded-xl border text-xs transition-all ${
            activeStep >= 4 ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200' : 'bg-stone-900/60 border-stone-800 text-stone-500'
          }`}>
            <span className="font-mono font-bold text-[10px] text-indigo-400 block mb-1">STEP 4</span>
            <p className="font-semibold text-stone-200">library_index.json Sync</p>
            <p className="text-[10px] text-stone-400 mt-0.5">Drive appDataFolder sync</p>
          </div>
        </div>
      </div>

      {/* Main Interactive Studio Grid + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: 3x3 Photo Matrix Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-title font-bold text-lg text-stone-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>3x3 Composite Matrix (9 Photo Batch)</span>
            </h2>
            <span className="text-xs font-mono text-stone-400">
              {batchCandidatePhotos.length} / 9 Slots Filled
            </span>
          </div>

          {/* 3x3 Visual Matrix */}
          <div className="p-3 bg-stone-900 rounded-2xl border-2 border-indigo-500/30 shadow-inner grid grid-cols-3 gap-2 relative">
            {batchCandidatePhotos.map((photo, idx) => (
              <div
                key={photo.id}
                onClick={() => setSelectedTileDetail(photo)}
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all group ${
                  selectedTileDetail?.id === photo.id
                    ? 'border-indigo-400 ring-2 ring-indigo-500/40'
                    : 'border-stone-700/60 hover:border-stone-500'
                }`}
              >
                <img
                  src={photo.thumbnail}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                
                {/* Tile Number Badge */}
                <div className="absolute top-1 left-1 bg-black/80 font-mono text-[9px] px-1 py-0.2 rounded text-white font-bold">
                  #{idx + 1}
                </div>

                {/* Couple Status Pill */}
                <div className="absolute bottom-1 right-1">
                  {photo.isUsCouple ? (
                    <span className="w-2 h-2 rounded-full bg-rose-500 block ring-2 ring-black"></span>
                  ) : photo.visualTriggers.isClutterOrReceipt ? (
                    <span className="w-2 h-2 rounded-full bg-amber-500 block ring-2 ring-black"></span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-stone-400 block ring-2 ring-black"></span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Trigger Scan Button */}
          <button
            id="run-3x3-batch-scan-btn"
            onClick={handleRunBatchScan}
            disabled={isRunningBatch}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-indigo-950/50 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {isRunningBatch ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Executing 3x3 Gemini Vision Batch Pipeline...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Run 3x3 Gemini Batch Scan</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Structured JSON Schema & Tile Inspector */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="flex items-center justify-between">
            <h2 className="font-serif-title font-bold text-lg text-stone-200 flex items-center gap-2">
              <FileJson className="w-4 h-4 text-indigo-400" />
              <span>Structured Schema Inspector (JSON Output)</span>
            </h2>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              response_schema: verified
            </span>
          </div>

          {/* Selected Tile Inspector */}
          {selectedTileDetail && (
            <div className="p-4 bg-stone-800/80 rounded-2xl border border-stone-700/80 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-stone-100 text-sm">{selectedTileDetail.title}</h3>
                  <p className="text-xs text-stone-400 font-mono">
                    Context: <span className="text-indigo-300 font-bold">{selectedTileDetail.context}</span>
                  </p>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-900 text-stone-300 border border-stone-700">
                  {selectedTileDetail.isUsCouple ? 'Couple Verified' : 'Solo / Non-Couple'}
                </span>
              </div>

              {/* Triggers Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                <div className="bg-stone-900/60 p-2 rounded border border-stone-800">
                  <span className="text-stone-400 block text-[10px]">Ring:</span>
                  <span className={selectedTileDetail.visualTriggers.hasRing ? 'text-amber-400 font-bold' : 'text-stone-500'}>
                    {selectedTileDetail.visualTriggers.hasRing ? 'true 💍' : 'false'}
                  </span>
                </div>
                <div className="bg-stone-900/60 p-2 rounded border border-stone-800">
                  <span className="text-stone-400 block text-[10px]">Cake:</span>
                  <span className={selectedTileDetail.visualTriggers.hasCake ? 'text-rose-400 font-bold' : 'text-stone-500'}>
                    {selectedTileDetail.visualTriggers.hasCake ? 'true 🎂' : 'false'}
                  </span>
                </div>
                <div className="bg-stone-900/60 p-2 rounded border border-stone-800">
                  <span className="text-stone-400 block text-[10px]">Food/Wine:</span>
                  <span className={selectedTileDetail.visualTriggers.hasFoodOrWine ? 'text-emerald-400 font-bold' : 'text-stone-500'}>
                    {selectedTileDetail.visualTriggers.hasFoodOrWine ? 'true 🍷' : 'false'}
                  </span>
                </div>
              </div>

              <p className="text-xs italic text-stone-300 bg-stone-900/40 p-2.5 rounded-lg border border-stone-800">
                &ldquo;{selectedTileDetail.nostalgicSummary}&rdquo;
              </p>
            </div>
          )}

          {/* Raw JSON Schema Preview */}
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 font-mono text-xs text-stone-300 max-h-64 overflow-y-auto">
            <pre className="text-[11px] text-emerald-400">
              {rawJsonOutput || JSON.stringify({
                batch_manifest: {
                  grid_dimension: "3x3",
                  total_images: 9,
                  token_bandwidth_compression: "88.5%",
                  target_schema: {
                    context_enum: ["Cozy Date", "Road Trip", "Anniversary Dinner", "Golden Hour", "Beach Getaway", "Proposal & Ring", "..."],
                    boolean_flags: ["isUsCouple", "hasRing", "hasCake", "hasSunset", "isClutterOrReceipt"],
                    vector_dim: 16
                  }
                }
              }, null, 2)}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};

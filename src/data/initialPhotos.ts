import { PhotoItem, CoupleProfile } from '../types';

export const initialCoupleProfile: CoupleProfile = {
  partner1Name: 'Alex',
  partner2Name: 'Taylor',
  partner1Avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  partner2Avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  anniversaryDate: '2022-09-01',
  relationshipTitle: 'Alex & Taylor’s Story',
  daysTogether: 1461,
};

export const rawInitialPhotos: PhotoItem[] = [
  {
    id: 'photo-1',
    url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1200&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&auto=format&fit=crop&q=80',
    title: 'Anniversary Dinner by Candlelight',
    date: '2025-09-01T20:15:00',
    year: 2025,
    month: 'September',
    location: {
      name: 'Osteria del Sole',
      city: 'Florence',
      country: 'Italy'
    },
    facesCount: 2,
    isUsCouple: true,
    detectedFaces: {
      partner1Detected: true,
      partner2Detected: true,
      otherCount: 0,
      boxes: [
        { id: 'f1', x: 28, y: 22, w: 22, h: 28, label: 'Partner 1 (Alex)', confidence: 0.98 },
        { id: 'f2', x: 54, y: 20, w: 22, h: 30, label: 'Partner 2 (Taylor)', confidence: 0.99 }
      ]
    },
    context: 'Anniversary Dinner',
    visualTriggers: {
      hasCake: true,
      hasRing: true,
      hasPets: false,
      hasSunset: false,
      hasFoodOrWine: true,
      isClutterOrReceipt: false
    },
    semanticTags: ['anniversary', 'candlelight', 'wine', 'cake', 'florence', 'italian dinner', 'romantic toast'],
    aestheticScore: 96,
    nostalgicSummary: 'Toasting our 3rd anniversary over handmade pasta and tiramisu in Tuscany.',
    vectorEmbedding: [0.82, 0.15, 0.91, 0.44, 0.12, 0.77, 0.93, 0.22, 0.31, 0.88, 0.14, 0.65, 0.79, 0.43, 0.11, 0.95],
    isFavorite: true,
    driveSyncState: 'synced',
    driveFileId: 'drv_appdata_001_anniv',
    driveSyncedAt: '2025-09-02T01:10:00Z',
    fileSizeKb: 4280
  },
  {
    id: 'photo-2',
    url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=1200&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&auto=format&fit=crop&q=80',
    title: 'Golden Hour at the Coast',
    date: '2024-09-01T18:42:00',
    year: 2024,
    month: 'September',
    location: {
      name: 'Big Sur Cliffs',
      city: 'California',
      country: 'USA'
    },
    facesCount: 2,
    isUsCouple: true,
    detectedFaces: {
      partner1Detected: true,
      partner2Detected: true,
      otherCount: 0,
      boxes: [
        { id: 'f1', x: 35, y: 18, w: 20, h: 26, label: 'Partner 1 (Alex)', confidence: 0.97 },
        { id: 'f2', x: 52, y: 19, w: 20, h: 26, label: 'Partner 2 (Taylor)', confidence: 0.98 }
      ]
    },
    context: 'Golden Hour',
    visualTriggers: {
      hasCake: false,
      hasRing: false,
      hasPets: false,
      hasSunset: true,
      hasFoodOrWine: false,
      isClutterOrReceipt: false
    },
    semanticTags: ['sunset', 'golden hour', 'ocean cliffs', 'wind in hair', 'holding hands', 'pacific coast'],
    aestheticScore: 98,
    nostalgicSummary: 'Standing together on the Pacific Coast Highway as the sun dipped beneath the marine layer.',
    vectorEmbedding: [0.94, 0.28, 0.41, 0.89, 0.62, 0.18, 0.74, 0.85, 0.19, 0.45, 0.78, 0.32, 0.91, 0.21, 0.54, 0.88],
    isFavorite: true,
    driveSyncState: 'synced',
    driveFileId: 'drv_appdata_002_bigsur',
    driveSyncedAt: '2024-09-02T00:30:00Z',
    fileSizeKb: 3890
  },
  {
    id: 'photo-3',
    url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&auto=format&fit=crop&q=80',
    title: 'Baking Sourdough on Sunday Morning',
    date: '2026-04-12T10:30:00',
    year: 2026,
    month: 'April',
    location: {
      name: 'Our Cozy Apartment',
      city: 'Seattle',
      country: 'USA'
    },
    facesCount: 2,
    isUsCouple: true,
    detectedFaces: {
      partner1Detected: true,
      partner2Detected: true,
      otherCount: 0,
      boxes: [
        { id: 'f1', x: 25, y: 15, w: 24, h: 32, label: 'Partner 1 (Alex)', confidence: 0.95 },
        { id: 'f2', x: 55, y: 16, w: 24, h: 32, label: 'Partner 2 (Taylor)', confidence: 0.96 }
      ]
    },
    context: 'Home Cooking',
    visualTriggers: {
      hasCake: false,
      hasRing: false,
      hasPets: false,
      hasSunset: false,
      hasFoodOrWine: true,
      isClutterOrReceipt: false
    },
    semanticTags: ['cooking together', 'flour on face', 'kitchen morning', 'coffee', 'cozy pajamas', 'sunday breakfast'],
    aestheticScore: 92,
    nostalgicSummary: 'Flour everywhere and fresh coffee brewing on a rainy Sunday morning.',
    vectorEmbedding: [0.35, 0.88, 0.72, 0.15, 0.42, 0.65, 0.81, 0.29, 0.76, 0.52, 0.18, 0.83, 0.44, 0.71, 0.28, 0.62],
    isFavorite: false,
    driveSyncState: 'synced',
    driveFileId: 'drv_appdata_003_bake',
    driveSyncedAt: '2026-04-12T18:00:00Z',
    fileSizeKb: 3450
  },
  {
    id: 'photo-4',
    url: 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?w=1200&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?w=400&auto=format&fit=crop&q=80',
    title: 'The Engagement in the Dolomites',
    date: '2023-09-01T15:20:00',
    year: 2023,
    month: 'September',
    location: {
      name: 'Seceda Ridge',
      city: 'Val Gardena',
      country: 'Italy'
    },
    facesCount: 2,
    isUsCouple: true,
    detectedFaces: {
      partner1Detected: true,
      partner2Detected: true,
      otherCount: 0,
      boxes: [
        { id: 'f1', x: 30, y: 25, w: 20, h: 28, label: 'Partner 1 (Alex)', confidence: 0.99 },
        { id: 'f2', x: 50, y: 24, w: 20, h: 28, label: 'Partner 2 (Taylor)', confidence: 0.99 }
      ]
    },
    context: 'Proposal & Ring',
    visualTriggers: {
      hasCake: false,
      hasRing: true,
      hasPets: false,
      hasSunset: true,
      hasFoodOrWine: false,
      isClutterOrReceipt: false
    },
    semanticTags: ['proposal', 'engagement ring', 'mountain peaks', 'tears of joy', 'dolomites', 'she said yes'],
    aestheticScore: 99,
    nostalgicSummary: 'The exact moment Alex dropped to one knee overlooking the jagged peaks of Seceda.',
    vectorEmbedding: [0.99, 0.32, 0.88, 0.92, 0.45, 0.12, 0.95, 0.78, 0.22, 0.89, 0.61, 0.41, 0.97, 0.35, 0.15, 0.98],
    isFavorite: true,
    driveSyncState: 'synced',
    driveFileId: 'drv_appdata_004_proposal',
    driveSyncedAt: '2023-09-02T12:00:00Z',
    fileSizeKb: 5120
  },
  {
    id: 'photo-5',
    url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1200&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400&auto=format&fit=crop&q=80',
    title: 'Convertible Road Trip Along Highway 1',
    date: '2024-07-20T14:10:00',
    year: 2024,
    month: 'July',
    location: {
      name: 'Carmel-by-the-Sea',
      city: 'California',
      country: 'USA'
    },
    facesCount: 2,
    isUsCouple: true,
    detectedFaces: {
      partner1Detected: true,
      partner2Detected: true,
      otherCount: 0,
      boxes: [
        { id: 'f1', x: 22, y: 20, w: 25, h: 30, label: 'Partner 1 (Alex)', confidence: 0.96 },
        { id: 'f2', x: 56, y: 22, w: 24, h: 29, label: 'Partner 2 (Taylor)', confidence: 0.97 }
      ]
    },
    context: 'Road Trip',
    visualTriggers: {
      hasCake: false,
      hasRing: false,
      hasPets: false,
      hasSunset: false,
      hasFoodOrWine: false,
      isClutterOrReceipt: false
    },
    semanticTags: ['road trip', 'sunglasses', 'windy hair', 'convertible car', 'summer road', 'playlist on blast'],
    aestheticScore: 94,
    nostalgicSummary: 'Singing every lyric with the top down all the way from San Francisco to Santa Barbara.',
    vectorEmbedding: [0.75, 0.45, 0.32, 0.81, 0.89, 0.52, 0.61, 0.44, 0.28, 0.73, 0.58, 0.67, 0.82, 0.38, 0.49, 0.70],
    isFavorite: false,
    driveSyncState: 'synced',
    driveFileId: 'drv_appdata_005_roadtrip',
    driveSyncedAt: '2024-07-21T02:00:00Z',
    fileSizeKb: 4100
  },
  {
    id: 'photo-6',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
    title: 'Tokyo Street Food Evening',
    date: '2025-05-18T21:40:00',
    year: 2025,
    month: 'May',
    location: {
      name: 'Omoide Yokocho',
      city: 'Tokyo',
      country: 'Japan'
    },
    facesCount: 2,
    isUsCouple: true,
    detectedFaces: {
      partner1Detected: true,
      partner2Detected: true,
      otherCount: 0,
      boxes: [
        { id: 'f1', x: 30, y: 18, w: 22, h: 28, label: 'Partner 1 (Alex)', confidence: 0.94 },
        { id: 'f2', x: 55, y: 19, w: 22, h: 28, label: 'Partner 2 (Taylor)', confidence: 0.95 }
      ]
    },
    context: 'City Stroll',
    visualTriggers: {
      hasCake: false,
      hasRing: false,
      hasPets: false,
      hasSunset: false,
      hasFoodOrWine: true,
      isClutterOrReceipt: false
    },
    semanticTags: ['tokyo', 'neon alley', 'yakitori', 'night stroll', 'rain reflections', 'umbrella share'],
    aestheticScore: 95,
    nostalgicSummary: 'Sharing skewers and warm sake under the glowing red paper lanterns in Shinjuku.',
    vectorEmbedding: [0.68, 0.72, 0.85, 0.39, 0.25, 0.89, 0.77, 0.63, 0.51, 0.82, 0.34, 0.79, 0.65, 0.88, 0.31, 0.74],
    isFavorite: true,
    driveSyncState: 'synced',
    driveFileId: 'drv_appdata_006_tokyo',
    driveSyncedAt: '2025-05-19T04:15:00Z',
    fileSizeKb: 4620
  },
  {
    id: 'photo-7',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    title: 'Taylor’s Solo Coffee Break in Montmartre',
    date: '2024-11-05T15:00:00',
    year: 2024,
    month: 'November',
    location: {
      name: 'Café de Flore',
      city: 'Paris',
      country: 'France'
    },
    facesCount: 1,
    isUsCouple: false, // Solo shot
    detectedFaces: {
      partner1Detected: false,
      partner2Detected: true,
      otherCount: 0,
      boxes: [
        { id: 'f2', x: 38, y: 15, w: 28, h: 36, label: 'Partner 2 (Taylor)', confidence: 0.99 }
      ]
    },
    context: 'Casual Daily',
    visualTriggers: {
      hasCake: false,
      hasRing: false,
      hasPets: false,
      hasSunset: false,
      hasFoodOrWine: true,
      isClutterOrReceipt: false
    },
    semanticTags: ['solo portrait', 'croissant', 'espresso', 'paris cafe', 'autumn scarf', 'reading a book'],
    aestheticScore: 89,
    nostalgicSummary: 'Taylor enjoying a quiet espresso while waiting for the rain to clear in Paris.',
    vectorEmbedding: [0.41, 0.65, 0.58, 0.32, 0.18, 0.44, 0.62, 0.25, 0.81, 0.49, 0.29, 0.72, 0.38, 0.59, 0.19, 0.48],
    isFavorite: false,
    driveSyncState: 'synced',
    driveFileId: 'drv_appdata_007_paris_solo',
    driveSyncedAt: '2024-11-06T00:00:00Z',
    fileSizeKb: 3100
  },
  {
    id: 'photo-8',
    url: 'https://images.unsplash.com/photo-1554415707-9e4c019feab9?w=1200&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1554415707-9e4c019feab9?w=400&auto=format&fit=crop&q=80',
    title: 'Flight Boarding Pass & Train Ticket (Auto-Filtered Clutter)',
    date: '2024-07-19T08:00:00',
    year: 2024,
    month: 'July',
    location: {
      name: 'SFO Terminal 2',
      city: 'San Francisco',
      country: 'USA'
    },
    facesCount: 0,
    isUsCouple: false,
    detectedFaces: {
      partner1Detected: false,
      partner2Detected: false,
      otherCount: 0,
      boxes: []
    },
    context: 'Clutter / Receipt',
    visualTriggers: {
      hasCake: false,
      hasRing: false,
      hasPets: false,
      hasSunset: false,
      hasFoodOrWine: false,
      isClutterOrReceipt: true
    },
    semanticTags: ['ticket', 'receipt', 'boarding pass', 'document screenshot', 'clutter'],
    aestheticScore: 18,
    nostalgicSummary: 'Automatic receipt & ticket snapshot, filtered out from The Us Timeline.',
    vectorEmbedding: [0.05, 0.10, 0.02, 0.08, 0.03, 0.01, 0.04, 0.02, 0.07, 0.01, 0.06, 0.03, 0.02, 0.05, 0.01, 0.04],
    isFavorite: false,
    driveSyncState: 'synced',
    driveFileId: 'drv_appdata_008_clutter_ticket',
    driveSyncedAt: '2024-07-19T10:00:00Z',
    fileSizeKb: 1200
  },
  {
    id: 'photo-9',
    url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1200&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&auto=format&fit=crop&q=80',
    title: 'Adopting Milo on Saturday Afternoon',
    date: '2023-12-16T13:45:00',
    year: 2023,
    month: 'December',
    location: {
      name: 'Seattle Animal Shelter',
      city: 'Seattle',
      country: 'USA'
    },
    facesCount: 2,
    isUsCouple: true,
    detectedFaces: {
      partner1Detected: true,
      partner2Detected: true,
      otherCount: 0,
      boxes: [
        { id: 'f1', x: 24, y: 16, w: 22, h: 28, label: 'Partner 1 (Alex)', confidence: 0.97 },
        { id: 'f2', x: 58, y: 18, w: 22, h: 28, label: 'Partner 2 (Taylor)', confidence: 0.98 }
      ]
    },
    context: 'Celebration & Party',
    visualTriggers: {
      hasCake: false,
      hasRing: false,
      hasPets: true,
      hasSunset: false,
      hasFoodOrWine: false,
      isClutterOrReceipt: false
    },
    semanticTags: ['puppy adoption', 'golden retriever puppy', 'first pet', 'smiling couple', 'milestone', 'family expansion'],
    aestheticScore: 97,
    nostalgicSummary: 'The day our family grew by four paws. Milo fell asleep in our arms on the ride home.',
    vectorEmbedding: [0.88, 0.91, 0.48, 0.67, 0.35, 0.82, 0.94, 0.56, 0.39, 0.75, 0.81, 0.62, 0.89, 0.47, 0.22, 0.93],
    isFavorite: true,
    driveSyncState: 'synced',
    driveFileId: 'drv_appdata_009_milo_pet',
    driveSyncedAt: '2023-12-17T00:00:00Z',
    fileSizeKb: 4950
  },
  {
    id: 'photo-10',
    url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&auto=format&fit=crop&q=80',
    title: 'Autumn Mountain Hike in the Cascades',
    date: '2025-10-14T11:20:00',
    year: 2025,
    month: 'October',
    location: {
      name: 'Mount Rainier National Park',
      city: 'Washington',
      country: 'USA'
    },
    facesCount: 2,
    isUsCouple: true,
    detectedFaces: {
      partner1Detected: true,
      partner2Detected: true,
      otherCount: 0,
      boxes: [
        { id: 'f1', x: 30, y: 22, w: 20, h: 26, label: 'Partner 1 (Alex)', confidence: 0.96 },
        { id: 'f2', x: 52, y: 21, w: 20, h: 26, label: 'Partner 2 (Taylor)', confidence: 0.97 }
      ]
    },
    context: 'Mountain Hike',
    visualTriggers: {
      hasCake: false,
      hasRing: false,
      hasPets: false,
      hasSunset: false,
      hasFoodOrWine: false,
      isClutterOrReceipt: false
    },
    semanticTags: ['hiking', 'flannel jackets', 'mountain peak', 'fall foliage', 'trail summit', 'crisp air'],
    aestheticScore: 93,
    nostalgicSummary: 'Reaching the summit overlook just as the alpine mist cleared to reveal Mount Rainier.',
    vectorEmbedding: [0.72, 0.38, 0.44, 0.95, 0.81, 0.22, 0.69, 0.88, 0.15, 0.54, 0.89, 0.35, 0.77, 0.29, 0.63, 0.84],
    isFavorite: false,
    driveSyncState: 'synced',
    driveFileId: 'drv_appdata_010_rainier_hike',
    driveSyncedAt: '2025-10-15T02:00:00Z',
    fileSizeKb: 4320
  }
];

export const initialPhotos: PhotoItem[] = rawInitialPhotos.map((p, idx): PhotoItem => {
  const baseImg = p.url.split('?')[0];
  return {
    ...p,
    thumbnail: `${baseImg}?auto=format&fit=crop&w=280&q=70`,
    mediumUrl: `${baseImg}?auto=format&fit=crop&w=1280&q=80`,
    fullOriginalUrl: `${baseImg}?auto=format&fit=crop&w=3840&q=95`,
    sha256Hash: `sha256_e89a3f2b${p.id.replace('photo-', '').padStart(4, '0')}`,
    isPinnedOffline: idx === 0, // Pin first milestone memory by default
    cachedTier: idx < 3 ? 'medium' : 'thumb',
    lastAccessedAt: new Date(Date.now() - idx * 3600000 * 4).toISOString(),
  };
});



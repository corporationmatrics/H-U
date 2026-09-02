import { PhotoItem, CoupleProfile, TimeCapsule } from '../types';
import { initialPhotos, initialCoupleProfile } from '../data/initialPhotos';

const DB_NAME = 'TogetherLensDB';
const DB_VERSION = 1;
const STORE_PHOTOS = 'photos';
const STORE_META = 'meta';

/**
 * Open or upgrade IndexedDB database for large multi-MB photo & base64 persistence.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        db.createObjectStore(STORE_PHOTOS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

/**
 * Loads persisted photos from IndexedDB; falls back to localStorage / initialPhotos.
 */
export async function loadPersistedPhotos(): Promise<PhotoItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_PHOTOS], 'readonly');
      const store = transaction.objectStore(STORE_PHOTOS);
      const request = store.getAll();

      request.onsuccess = () => {
        const storedPhotos: PhotoItem[] = request.result || [];
        if (storedPhotos && storedPhotos.length > 0) {
          resolve(storedPhotos);
        } else {
          // Check localStorage legacy fallback
          try {
            const ls = localStorage.getItem('togetherlens_photos');
            if (ls) {
              const parsed = JSON.parse(ls);
              if (Array.isArray(parsed) && parsed.length > 0) {
                // Save to indexedDB for next time
                savePersistedPhotos(parsed).catch(console.error);
                resolve(parsed);
                return;
              }
            }
          } catch (e) {}
          resolve(initialPhotos);
        }
      };

      request.onerror = () => {
        resolve(initialPhotos);
      };
    });
  } catch (err) {
    console.warn('IndexedDB unavailable, falling back to in-memory/initialPhotos:', err);
    try {
      const ls = localStorage.getItem('togetherlens_photos');
      if (ls) {
        const parsed = JSON.parse(ls);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialPhotos;
  }
}

/**
 * Persists photos to IndexedDB reliably (supports high-res base64 / blob URLs / metadata).
 */
export async function savePersistedPhotos(photos: PhotoItem[]): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_PHOTOS], 'readwrite');
    const store = transaction.objectStore(STORE_PHOTOS);

    // Clear and re-populate
    store.clear();
    for (const photo of photos) {
      store.put(photo);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn('IndexedDB write error, attempting localStorage fallback:', err);
    try {
      // Store lightweight JSON without huge fullOriginalUrl if exceeds quota
      const lightweight = photos.map(p => ({
        ...p,
        // Trim large fullOriginalUrl only if it's huge data URL
        fullOriginalUrl: p.fullOriginalUrl?.startsWith('data:') && p.fullOriginalUrl.length > 500000
          ? p.thumbnail
          : p.fullOriginalUrl,
      }));
      localStorage.setItem('togetherlens_photos', JSON.stringify(lightweight));
    } catch (lsErr) {
      console.error('LocalStorage fallback also failed:', lsErr);
    }
  }
}

/**
 * Persists couple profile info.
 */
export async function savePersistedProfile(profile: CoupleProfile): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_META], 'readwrite');
    const store = transaction.objectStore(STORE_META);
    store.put({ key: 'profile', data: profile });
    localStorage.setItem('togetherlens_couple_profile', JSON.stringify(profile));
  } catch (err) {
    localStorage.setItem('togetherlens_couple_profile', JSON.stringify(profile));
  }
}

export async function loadPersistedProfile(): Promise<CoupleProfile> {
  try {
    const ls = localStorage.getItem('togetherlens_couple_profile');
    if (ls) {
      return JSON.parse(ls);
    }
  } catch (e) {}
  return initialCoupleProfile;
}

/**
 * Converts a File object to a persistent Base64 Data URL so refreshed pages keep uploaded custom images.
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

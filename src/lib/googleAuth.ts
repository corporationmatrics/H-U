import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase client safely
let authInstance: any = null;
try {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  authInstance = getAuth(app);
} catch (e) {
  console.warn('Firebase Auth client initialization note:', e);
}

export const auth = authInstance;

export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

const provider = new GoogleAuthProvider();
DRIVE_SCOPES.forEach((scope) => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export interface MockGoogleUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

/**
 * Initialize Google auth listener on app boot.
 */
export const initAuth = (
  onAuthSuccess?: (user: any, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (!auth) {
    // Check if user previously connected in demo mode
    const savedDemo = localStorage.getItem('togetherlens_demo_user');
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        if (onAuthSuccess) onAuthSuccess(parsed, 'mock_drive_token_' + Date.now());
        return () => {};
      } catch (e) {}
    }
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }

  try {
    return onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        if (cachedAccessToken) {
          if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
        } else if (!isSigningIn) {
          if (onAuthSuccess) {
            onAuthSuccess(user, cachedAccessToken || '');
          }
        }
      } else {
        // Check demo mode
        const savedDemo = localStorage.getItem('togetherlens_demo_user');
        if (savedDemo) {
          try {
            const parsed = JSON.parse(savedDemo);
            if (onAuthSuccess) onAuthSuccess(parsed, 'mock_drive_token_' + Date.now());
            return;
          } catch (e) {}
        }
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    });
  } catch (err) {
    console.warn('Auth state listener fallback:', err);
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }
};

/**
 * Trigger Google Sign-in popup with Google Drive scopes, with graceful fallback.
 */
export const signInWithGoogle = async (): Promise<{ user: any; accessToken: string; isDemo?: boolean }> => {
  try {
    isSigningIn = true;
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    cachedAccessToken = credential?.accessToken || 'drv_live_token_' + Date.now();
    localStorage.removeItem('togetherlens_demo_user');
    return { 
      user: result.user, 
      accessToken: cachedAccessToken || '' 
    };
  } catch (error: any) {
    console.warn('Direct Firebase Google Sign-in popup error (e.g. unauthorized domain or popup blocked). Using Instant Drive Vault Mode:', error);
    
    // Fallback: Create connected couple session
    const demoUser: MockGoogleUser = {
      uid: 'demo_user_togetherlens',
      email: 'alex.taylor.story@gmail.com',
      displayName: 'Alex & Taylor (Personal Drive)',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    };
    cachedAccessToken = 'drv_demo_vault_token_' + Date.now();
    localStorage.setItem('togetherlens_demo_user', JSON.stringify(demoUser));

    return {
      user: demoUser,
      accessToken: cachedAccessToken,
      isDemo: true,
    };
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get current in-memory cached OAuth token for Drive API calls.
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

/**
 * Log out from Firebase session.
 */
export const logOutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged as firebaseOnAuthStateChanged, User } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { PlantingPlanResponse, SavedPlan } from "../types";

// Re-export types
export type { User };
// Re-export the original onAuthStateChanged for type compatibility, 
// though we will guard its usage in App.tsx
export { onAuthStateChanged } from "firebase/auth";

const getFirebaseConfig = () => {
  // 1. Try Window object (WordPress injection)
  if (typeof window !== 'undefined' && (window as any).ROOT_REGENERATE_SETTINGS?.firebaseConfig) {
    return (window as any).ROOT_REGENERATE_SETTINGS.firebaseConfig;
  }
  
  // 2. Fallback/Env Variables
  // Using process.env checks including VITE_ prefixes to support standard and Vite environments
  // while avoiding typescript errors with import.meta.env
  return {
    apiKey: process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID
  };
};

const config = getFirebaseConfig();

// Check if we have a valid configuration
const isConfigValid = config.apiKey && config.apiKey !== "YOUR_FIREBASE_API_KEY" && config.apiKey !== undefined;

let app: any;
let authInstance: any;
let dbInstance: any;

if (isConfigValid) {
  try {
    app = initializeApp(config);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.log("Running in Demo Mode (No Firebase Config Found)");
}

// Export instances
export const auth = authInstance;
export const db = dbInstance;

// --- Unified Service Functions (Handle Real Auth vs Demo Mode) ---

// 1. Auth Subscription
export const subscribeToAuth = (callback: (user: User | null) => void) => {
  if (auth) {
    // Real Firebase
    return firebaseOnAuthStateChanged(auth, callback);
  } else {
    // Demo Mode
    const storedUser = localStorage.getItem('demo_user');
    if (storedUser) {
      callback(JSON.parse(storedUser) as User);
    } else {
      callback(null);
    }
    // Return dummy unsubscribe
    return () => {}; 
  }
};

// 2. Sign In
export const signInWithGoogle = async () => {
  if (auth) {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } else {
    // Demo Mode Simulation
    const demoUser = {
      uid: 'demo-user-123',
      displayName: 'Demo Gardener',
      email: 'gardener@example.com',
      photoURL: null,
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => '',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({})
    } as unknown as User;
    
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    // Force page reload to pick up the change since we don't have a real listener in demo mode
    window.location.reload(); 
  }
};

// 3. Logout
export const logout = async () => {
  if (auth) {
    await signOut(auth);
  } else {
    localStorage.removeItem('demo_user');
    window.location.reload();
  }
};

// 4. Save Plan
export const savePlantingPlanToDb = async (userId: string, plan: PlantingPlanResponse, name: string) => {
  if (db) {
    // Real Firebase
    const docRef = await addDoc(collection(db, "plans"), {
      userId,
      name,
      createdAt: Timestamp.now(),
      data: plan
    });
    return docRef.id;
  } else {
    // Demo Mode (LocalStorage)
    const existingPlans = JSON.parse(localStorage.getItem('demo_plans') || '[]');
    const newPlan = {
      id: `demo-plan-${Date.now()}`,
      userId,
      name,
      createdAt: new Date().toISOString(), // Store as string in LS
      data: plan
    };
    localStorage.setItem('demo_plans', JSON.stringify([newPlan, ...existingPlans]));
    
    // Fake delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return newPlan.id;
  }
};

// 5. Get Plans
export const getUserPlans = async (userId: string): Promise<SavedPlan[]> => {
  if (db) {
    // Real Firebase
    try {
      const q = query(
        collection(db, "plans"), 
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const plans: SavedPlan[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        plans.push({
          id: doc.id,
          name: data.name,
          createdAt: data.createdAt.toDate(),
          data: data.data as PlantingPlanResponse
        });
      });
      return plans;
    } catch (error) {
      console.error("Error getting plans", error);
      return [];
    }
  } else {
    // Demo Mode
    const existingPlans = JSON.parse(localStorage.getItem('demo_plans') || '[]');
    return existingPlans.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt) // Convert string back to Date
    }));
  }
};
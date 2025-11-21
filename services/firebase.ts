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
  
  // 2. Try Environment variables
  // Note: These will be replaced by your bundler during build
  return {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  };
};

const config = getFirebaseConfig();

// Simple check to see if we have a real key or if it's missing/placeholder
const isConfigValid = config.apiKey && config.apiKey !== "YOUR_FIREBASE_API_KEY";

let app: any;
let authInstance: any;
let dbInstance: any;

if (isConfigValid) {
  try {
    app = initializeApp(config);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization failed. Check your configuration.", error);
  }
} else {
  console.warn("Firebase configuration is missing or invalid. Authentication features will be disabled.");
}

// Export instances (might be undefined if config is invalid)
export const auth = authInstance;
export const db = dbInstance;

// Auth Functions
export const signInWithGoogle = async () => {
  if (!auth) {
    alert("Authentication is not configured. Please check the app settings.");
    return;
  }
  
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    console.error("Error signing in with Google", error);
    if (error.code === 'auth/api-key-not-valid') {
      alert("Configuration Error: Invalid Firebase API Key.");
    } else {
      throw error;
    }
  }
};

export const logout = async () => {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};

// Database Functions
export const savePlantingPlanToDb = async (userId: string, plan: PlantingPlanResponse, name: string) => {
  if (!db) throw new Error("Database not configured");
  
  try {
    const docRef = await addDoc(collection(db, "plans"), {
      userId,
      name,
      createdAt: Timestamp.now(),
      data: plan
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving plan", error);
    throw error;
  }
};

export const getUserPlans = async (userId: string): Promise<SavedPlan[]> => {
  if (!db) return [];

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
};
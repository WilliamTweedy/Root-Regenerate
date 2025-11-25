import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser, deleteUser } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Plant, ChatMessage, HarvestLog, PlantingPlanResponse, SavedPlan } from "../types";

// Define User interface
export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

// --- Configuration ---
// These are pulled from process.env via vite.config.ts
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase only if config is present
const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

// --- Helper for ID Generation (Fallback) ---
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

// --- Helper for Demo Mode Storage (Fallback) ---
const safeSetItem = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
      console.warn("LocalStorage quota exceeded.");
    }
  }
};

// --- Auth ---

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  if (auth) {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          metadata: {
            creationTime: firebaseUser.metadata.creationTime,
            lastSignInTime: firebaseUser.metadata.lastSignInTime,
          }
        });
      } else {
        callback(null);
      }
    });
  } else {
    // Demo Mode
    const storedUser = localStorage.getItem('demo_user');
    if (storedUser) {
      callback(JSON.parse(storedUser) as User);
    } else {
      callback(null);
    }
    return () => {}; 
  }
};

export const signInWithGoogle = async () => {
  if (auth) {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  } else {
    // Demo Mode
    const demoUser: User = {
      uid: 'demo-user-123',
      displayName: 'Demo Gardener',
      email: 'gardener@example.com',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gardener',
      emailVerified: true,
      metadata: {
        creationTime: new Date().toUTCString(),
        lastSignInTime: new Date().toUTCString(),
      }
    };
    safeSetItem('demo_user', demoUser);
    window.location.reload(); 
  }
};

export const logout = async () => {
  if (auth) {
    await signOut(auth);
  } else {
    localStorage.removeItem('demo_user');
    window.location.reload();
  }
};

// --- Chat ---

export const subscribeToChat = (roomId: string, callback: (messages: ChatMessage[]) => void) => {
  if (db) {
     const q = query(collection(db, "chats", roomId, "messages"), orderBy("timestamp", "asc"));
     return onSnapshot(q, (snapshot) => {
       const msgs = snapshot.docs.map(doc => ({
         id: doc.id,
         ...doc.data(),
         timestamp: doc.data().timestamp?.toDate() || new Date()
       })) as ChatMessage[];
       callback(msgs);
     });
  } else {
    // Demo Mode logic...
    const loadMock = () => {
      const mockKey = `demo_chat_${roomId}`;
      const stored = localStorage.getItem(mockKey);
      let msgs: ChatMessage[] = [];
      if (stored) {
        msgs = JSON.parse(stored).map((m: any) => ({...m, timestamp: new Date(m.timestamp)}));
      } else {
        msgs = [{
            id: '1', text: `Welcome to the ${roomId} group!`, userId: 'bot', userName: 'GardenBot', userLevel: 'Master Gardener', timestamp: new Date()
        }];
      }
      callback(msgs);
    };
    loadMock();
    const interval = setInterval(loadMock, 2000); 
    return () => clearInterval(interval);
  }
};

export const sendMessage = async (roomId: string, text: string, user: User) => {
  if (db) {
    await addDoc(collection(db, "chats", roomId, "messages"), {
      text,
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      userLevel: "Gardener",
      timestamp: new Date()
    });
  } else {
    const mockKey = `demo_chat_${roomId}`;
    const stored = JSON.parse(localStorage.getItem(mockKey) || '[]');
    const newMsg = {
      id: generateId(), text, userId: user.uid, userName: user.displayName || "Anonymous", userLevel: "Apprentice", timestamp: new Date()
    };
    safeSetItem(mockKey, [...stored, newMsg]);
  }
};

// --- Plants ---

export const addPlant = async (userId: string, plant: Omit<Plant, 'id'>) => {
  if (db) {
    // Create new doc ref to get ID
    const docRef = await addDoc(collection(db, "users", userId, "plants"), {
      ...plant,
      plantedDate: plant.plantedDate.toISOString() // Firestore prefers ISO or Timestamp
    });
    return docRef.id;
  } else {
    const mockKey = `demo_plants_${userId}`;
    const stored = JSON.parse(localStorage.getItem(mockKey) || '[]');
    const newPlant = { ...plant, id: generateId() };
    safeSetItem(mockKey, [...stored, newPlant]);
    return newPlant.id;
  }
};

export const updatePlantStatus = async (userId: string, plantId: string, isPlanted: boolean) => {
  if (db) {
    const plantRef = doc(db, "users", userId, "plants", plantId);
    await updateDoc(plantRef, { isPlanted });
  } else {
    const mockKey = `demo_plants_${userId}`;
    const stored = JSON.parse(localStorage.getItem(mockKey) || '[]');
    const updated = stored.map((p: any) => p.id === plantId ? { ...p, isPlanted } : p);
    safeSetItem(mockKey, updated);
  }
};

export const deletePlant = async (userId: string, plantId: string) => {
  if (db) {
    await deleteDoc(doc(db, "users", userId, "plants", plantId));
  } else {
    const mockKey = `demo_plants_${userId}`;
    const stored = JSON.parse(localStorage.getItem(mockKey) || '[]');
    const filtered = stored.filter((p: any) => p.id !== plantId);
    safeSetItem(mockKey, filtered);
  }
};

export const getPlants = async (userId: string): Promise<Plant[]> => {
  if (db) {
    const q = query(collection(db, "users", userId, "plants"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      plantedDate: new Date(doc.data().plantedDate)
    })) as Plant[];
  } else {
    const mockKey = `demo_plants_${userId}`;
    const stored = JSON.parse(localStorage.getItem(mockKey) || '[]');
    return stored.map((p: any) => ({ ...p, plantedDate: new Date(p.plantedDate) }));
  }
};

// --- Harvest ---

export const addHarvest = async (userId: string, harvest: Omit<HarvestLog, 'id'>) => {
  if (db) {
    await addDoc(collection(db, "users", userId, "harvests"), {
      ...harvest,
      date: harvest.date.toISOString()
    });
  } else {
    const mockKey = `demo_harvests_${userId}`;
    const stored = JSON.parse(localStorage.getItem(mockKey) || '[]');
    const newHarvest = { ...harvest, id: generateId() };
    safeSetItem(mockKey, [...stored, newHarvest]);
  }
};

export const deleteHarvest = async (userId: string, harvestId: string) => {
  if (db) {
    await deleteDoc(doc(db, "users", userId, "harvests", harvestId));
  } else {
    const mockKey = `demo_harvests_${userId}`;
    const stored = JSON.parse(localStorage.getItem(mockKey) || '[]');
    const filtered = stored.filter((h: any) => h.id !== harvestId);
    safeSetItem(mockKey, filtered);
  }
};

export const getHarvests = async (userId: string): Promise<HarvestLog[]> => {
  if (db) {
    const q = query(collection(db, "users", userId, "harvests"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: new Date(doc.data().date)
    })) as HarvestLog[];
  } else {
    const mockKey = `demo_harvests_${userId}`;
    const stored = JSON.parse(localStorage.getItem(mockKey) || '[]');
    return stored.map((h: any) => ({ ...h, date: new Date(h.date) }));
  }
};

// --- Plans ---

export const savePlantingPlanToDb = async (userId: string, plan: PlantingPlanResponse, name: string): Promise<string> => {
  if (db) {
    const docRef = await addDoc(collection(db, "users", userId, "plans"), {
      userId,
      name,
      data: plan,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } else {
    const mockKey = `demo_plans_${userId}`;
    const stored = JSON.parse(localStorage.getItem(mockKey) || '[]');
    const newId = generateId();
    const newPlan: SavedPlan = { id: newId, userId, name, data: plan, createdAt: new Date() };
    safeSetItem(mockKey, [...stored, newPlan]);
    return newId;
  }
};

export const getUserPlans = async (userId: string): Promise<SavedPlan[]> => {
  if (db) {
    const q = query(collection(db, "users", userId, "plans"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: new Date(doc.data().createdAt)
    })) as SavedPlan[];
  } else {
    const mockKey = `demo_plans_${userId}`;
    const stored = JSON.parse(localStorage.getItem(mockKey) || '[]');
    return stored.map((p: any) => ({ ...p, createdAt: new Date(p.createdAt) }));
  }
};

// --- Account Management ---

export const deleteUserAccount = async (userId: string) => {
  try {
    if (db) {
      // 1. Delete Plants
      const plants = await getPlants(userId);
      for (const p of plants) await deleteDoc(doc(db, "users", userId, "plants", p.id));

      // 2. Delete Harvests
      const harvests = await getHarvests(userId);
      for (const h of harvests) await deleteDoc(doc(db, "users", userId, "harvests", h.id));

      // 3. Delete Plans
      const plans = await getUserPlans(userId);
      for (const p of plans) await deleteDoc(doc(db, "users", userId, "plans", p.id));
      
      // 4. Delete Auth
      if (auth && auth.currentUser) {
          await deleteUser(auth.currentUser);
      }
    } else {
      // Demo Mode
      localStorage.removeItem('demo_user');
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
            if(key.includes(userId)) localStorage.removeItem(key);
      });
      window.location.reload();
    }
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};
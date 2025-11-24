import { Plant, ChatMessage, HarvestLog, PlantingPlanResponse, SavedPlan } from "../types";

// Define User interface locally since we are removing firebase dependency
export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export const auth = null;
export const db = null;

// --- Helper for ID Generation ---
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

// --- Helper for Demo Mode Storage ---

const safeSetItem = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
      console.warn("LocalStorage quota exceeded. Attempting to strip image data...");
      
      // Helper to strip images from object
      const stripImages = (obj: any): any => {
        if (Array.isArray(obj)) {
          return obj.map(stripImages);
        } else if (typeof obj === 'object' && obj !== null) {
          const newObj: any = {};
          for (const k in obj) {
            // Check for image keys with large string values
            if ((k === 'imageUrl' || k === 'photoURL' || k === 'image' || k === 'preview') && typeof obj[k] === 'string' && obj[k].length > 500) {
              newObj[k] = null; // Remove image data
            } else if (typeof obj[k] === 'string' && obj[k].startsWith('data:image')) {
               newObj[k] = null;
            } else {
              newObj[k] = stripImages(obj[k]);
            }
          }
          return newObj;
        }
        return obj;
      };

      const cleanData = stripImages(data);
      
      try {
        localStorage.setItem(key, JSON.stringify(cleanData));
        console.log("Saved data with images removed to save space.");
      } catch (retryError) {
        console.error("Still failed to save to LocalStorage even after stripping images.", retryError);
      }
    } else {
      console.error("LocalStorage error:", e);
    }
  }
};

// --- Auth ---

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  if (auth) {
    return () => {};
  } else {
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
    // Unreachable in this mock version
  } else {
    const demoUser: User = {
      uid: 'demo-user-123',
      displayName: 'Demo Gardener',
      email: 'gardener@example.com',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gardener',
      emailVerified: true,
    };
    safeSetItem('demo_user', demoUser);
    window.location.reload(); 
  }
};

export const logout = async () => {
  if (auth) {
    // Unreachable
  } else {
    localStorage.removeItem('demo_user');
    window.location.reload();
  }
};

// --- Chat ---

export const subscribeToChat = (roomId: string, callback: (messages: ChatMessage[]) => void) => {
  if (db) {
     return () => {};
  } else {
    const loadMock = () => {
      const mockKey = `demo_chat_${roomId}`;
      const stored = localStorage.getItem(mockKey);
      let msgs: ChatMessage[] = [];
      
      if (stored) {
        msgs = JSON.parse(stored).map((m: any) => ({...m, timestamp: new Date(m.timestamp)}));
      } else {
        msgs = [
          {
            id: '1',
            text: `Welcome to the ${roomId} group! Any tips for aphids?`,
            userId: 'bot',
            userName: 'GardenBot',
            userLevel: 'Master Gardener',
            timestamp: new Date(Date.now() - 86400000)
          }
        ];
        safeSetItem(mockKey, msgs);
      }
      callback(msgs);
    };
    
    loadMock();
    const interval = setInterval(loadMock, 2000); 
    return () => clearInterval(interval);
  }
};

export const sendMessage = async (roomId: string, text: string, user: User) => {
  const msg = {
    text,
    userId: user.uid,
    userName: user.displayName || "Anonymous",
    userLevel: "Apprentice", 
    timestamp: new Date()
  };

  if (db) {
    // Unreachable
  } else {
    const mockKey = `demo_chat_${roomId}`;
    const stored = JSON.parse(localStorage.getItem(mockKey) || '[]');
    const newMsg = {
      ...msg,
      id: generateId(),
    };
    safeSetItem(mockKey, [...stored, newMsg]);
  }
};

// --- Plants ---

export const addPlant = async (userId: string, plant: Omit<Plant, 'id'>) => {
  if (db) {
    // Unreachable
  } else {
    const mockKey = `demo_plants_${userId}`;
    const stored = JSON.parse(localStorage.getItem(mockKey) || '[]');
    const newPlant = { ...plant, id: generateId() };
    safeSetItem(mockKey, [...stored, newPlant]);
  }
};

export const updatePlantStatus = async (userId: string, plantId: string, isPlanted: boolean) => {
  if (db) {
    // Unreachable
  } else {
    const mockKey = `demo_plants_${userId}`;
    const stored = JSON.parse(localStorage.getItem(mockKey) || '[]');
    const updated = stored.map((p: any) => {
      if (p.id === plantId) return { ...p, isPlanted };
      return p;
    });
    safeSetItem(mockKey, updated);
  }
};

export const deletePlant = async (userId: string, plantId: string) => {
  if (db) {
    // Unreachable
  } else {
    const mockKey = `demo_plants_${userId}`;
    const stored = JSON.parse(localStorage.getItem(mockKey) || '[]');
    // Ensure we filter out the specific ID
    const filtered = stored.filter((p: any) => p.id !== plantId);
    safeSetItem(mockKey, filtered);
  }
};

export const getPlants = async (userId: string): Promise<Plant[]> => {
  if (db) {
    return [];
  } else {
    const mockKey = `demo_plants_${userId}`;
    const stored = JSON.parse(localStorage.getItem(mockKey) || '[]');
    
    // AUTO-REPAIR: Check for missing IDs in legacy data and fix them on the fly
    let dataWasRepaired = false;
    const plants = stored.map((p: any) => {
       if (!p.id) {
           p.id = generateId(); // Assign a new ID if missing
           dataWasRepaired = true;
       }
       return { ...p, plantedDate: new Date(p.plantedDate) };
    });

    // Save repair immediately
    if (dataWasRepaired) {
        console.log("Repaired database: Assigned missing IDs to plants.");
        safeSetItem(mockKey, plants);
    }

    return plants;
  }
};

// --- Harvest ---

export const addHarvest = async (userId: string, harvest: Omit<HarvestLog, 'id'>) => {
  if (db) {
    // Unreachable
  } else {
    const mockKey = `demo_harvests_${userId}`;
    const stored = JSON.parse(localStorage.getItem(mockKey) || '[]');
    const newHarvest = { ...harvest, id: generateId() };
    safeSetItem(mockKey, [...stored, newHarvest]);
  }
};

export const getHarvests = async (userId: string): Promise<HarvestLog[]> => {
  if (db) {
    return [];
  } else {
    const mockKey = `demo_harvests_${userId}`;
    const stored = JSON.parse(localStorage.getItem(mockKey) || '[]');
    return stored.map((h: any) => ({ ...h, date: new Date(h.date) }));
  }
};

// --- Plans ---

export const savePlantingPlanToDb = async (userId: string, plan: PlantingPlanResponse, name: string): Promise<string> => {
  if (db) {
     return "";
  } else {
    const mockKey = `demo_plans_${userId}`;
    const stored = JSON.parse(localStorage.getItem(mockKey) || '[]');
    const newId = generateId();
    const newPlan: SavedPlan = { 
      id: newId, 
      userId, 
      name, 
      data: plan, 
      createdAt: new Date() 
    };
    safeSetItem(mockKey, [...stored, newPlan]);
    return newId;
  }
};

export const getUserPlans = async (userId: string): Promise<SavedPlan[]> => {
  if (db) {
    return [];
  } else {
    const mockKey = `demo_plans_${userId}`;
    const stored = JSON.parse(localStorage.getItem(mockKey) || '[]');
    return stored.map((p: any) => ({ ...p, createdAt: new Date(p.createdAt) }));
  }
};
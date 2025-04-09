/**
 * Database manager for the decentralized network application
 * Uses IndexedDB to persist network state, messages, and content
 */

// Database initialization with better error handling for deployment environments
export const initDatabase = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // Check if IndexedDB is supported
    if (!window.indexedDB) {
      console.error("Your browser doesn't support IndexedDB. Some features may not work correctly.");
      reject(new Error("IndexedDB not supported"));
      return;
    }
    
    const request = indexedDB.open('DecentralizedNetworkDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains('nodes')) {
        db.createObjectStore('nodes', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('messages')) {
        db.createObjectStore('messages', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('content')) {
        db.createObjectStore('content', { keyPath: 'cid' });
      }
      
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    };
    
    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
    
    request.onerror = (event) => {
      console.error("Database error:", (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
    
    // Handle edge cases that might occur in some deployment environments
    request.onblocked = () => {
      console.warn("Database opening blocked. Please close other tabs with this site open");
      reject(new Error("Database blocked"));
    };
  });
};

// Generic function to add items to a store with retry mechanism for deployment stability
export const addToStore = async <T>(
  storeName: string, 
  item: T
): Promise<T> => {
  let retries = 3;
  
  while (retries > 0) {
    try {
      const db = await initDatabase();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);
        
        request.onsuccess = () => {
          resolve(item);
        };
        
        request.onerror = () => {
          console.error(`Error adding item to ${storeName}:`, request.error);
          reject(request.error);
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
        
        transaction.onerror = (event) => {
          console.error(`Transaction error for ${storeName}:`, event);
          reject(new Error(`Transaction failed for ${storeName}`));
        };
      });
    } catch (error) {
      retries--;
      if (retries === 0) throw error;
      console.warn(`Database operation failed, retrying... (${retries} attempts left)`);
      // Small delay before retry
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  throw new Error(`Failed to add item to ${storeName} after multiple attempts`);
};

// Generic function to get all items from a store with improved error handling
export const getAllFromStore = async <T>(storeName: string): Promise<T[]> => {
  try {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result as T[]);
      };
      
      request.onerror = () => {
        console.error(`Error getting items from ${storeName}:`, request.error);
        reject(request.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error(`Failed to get items from ${storeName}:`, error);
    // Return empty array instead of throwing to make the application more resilient
    return [];
  }
};

// Generic function to get item by id
export const getFromStore = async <T>(
  storeName: string, 
  id: string
): Promise<T | null> => {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    
    request.onsuccess = () => {
      resolve(request.result as T || null);
    };
    
    request.onerror = () => {
      console.error(`Error getting item from ${storeName}:`, request.error);
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Generic function to delete item by id
export const deleteFromStore = async (
  storeName: string, 
  id: string
): Promise<void> => {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      console.error(`Error deleting item from ${storeName}:`, request.error);
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Clear a store
export const clearStore = async (storeName: string): Promise<void> => {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      console.error(`Error clearing ${storeName}:`, request.error);
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Add/update metadata
export const setMetadata = async (key: string, value: any): Promise<void> => {
  await addToStore('metadata', { key, value, updatedAt: new Date() });
};

// Get metadata
export const getMetadata = async (key: string): Promise<any> => {
  const result = await getFromStore<{key: string, value: any}>('metadata', key);
  return result?.value || null;
};

// Function to check database health - useful for deployed environments
export const checkDatabaseHealth = async (): Promise<{ status: 'ok' | 'error', message: string }> => {
  try {
    await initDatabase();
    return { status: 'ok', message: 'Database connection is healthy' };
  } catch (error) {
    return { 
      status: 'error', 
      message: `Database connection error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

// Graceful fallback mechanism if IndexedDB is unavailable
let memoryFallback: Record<string, any[]> = {
  nodes: [],
  messages: [],
  content: [],
  metadata: []
};

export const useMemoryFallback = async (storeName: string): Promise<boolean> => {
  try {
    await initDatabase();
    return false; // DB is working, no need for fallback
  } catch (error) {
    console.warn(`Using memory fallback for ${storeName} due to IndexedDB issues`);
    return true; // Use memory fallback
  }
};

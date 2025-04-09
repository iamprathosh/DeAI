
/**
 * Database manager for the decentralized network application
 * Uses IndexedDB to persist network state, messages, and content
 */

// Database initialization
export const initDatabase = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
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
  });
};

// Generic function to add items to a store
export const addToStore = async <T>(
  storeName: string, 
  item: T
): Promise<T> => {
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
  });
};

// Generic function to get all items from a store
export const getAllFromStore = async <T>(storeName: string): Promise<T[]> => {
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

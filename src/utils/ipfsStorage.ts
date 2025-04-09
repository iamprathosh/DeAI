
/**
 * Browser-based IPFS-like storage system using IndexedDB
 */

// Generate a content identifier (CID) similar to IPFS
const generateCID = (content: string): string => {
  // Simple hash function for demo purposes
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Format to look like an IPFS CID
  return 'Qm' + Math.abs(hash).toString(16).padStart(44, '0');
};

// Initialize the IndexedDB database
const initDB = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('IPFSSimDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('contents')) {
        db.createObjectStore('contents', { keyPath: 'cid' });
      }
    };
    
    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
    
    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

// Add content to our simulated IPFS storage
export const addToIPFS = async (content: string): Promise<string> => {
  const cid = generateCID(content);
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['contents'], 'readwrite');
    const store = transaction.objectStore('contents');
    
    const request = store.put({
      cid,
      content,
      timestamp: Date.now()
    });
    
    request.onsuccess = () => {
      resolve(cid);
      console.log(`Content added with CID: ${cid}`);
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
};

// Get content from our simulated IPFS storage
export const getFromIPFS = async (cid: string): Promise<string> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['contents'], 'readonly');
    const store = transaction.objectStore('contents');
    const request = store.get(cid);
    
    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result.content);
        console.log(`Content retrieved for CID: ${cid}`);
      } else {
        reject(new Error('Content not found'));
      }
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
};

// List all CIDs in the storage
export const listAllCIDs = async (): Promise<string[]> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['contents'], 'readonly');
    const store = transaction.objectStore('contents');
    const request = store.getAllKeys();
    
    request.onsuccess = () => {
      resolve(request.result as string[]);
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
};

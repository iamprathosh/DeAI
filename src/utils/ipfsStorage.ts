/**
 * Browser-based IPFS-like storage system using IndexedDB
 */
import { addToStore, getAllFromStore, getFromStore, deleteFromStore } from "./databaseManager";

// Type definition for stored content
export type IPFSContent = {
  cid: string;
  content: string;
  timestamp: number;
  size?: number;
  type?: string;
  metadata?: Record<string, any>;
};

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

// Add content to our simulated IPFS storage
export const addToIPFS = async (
  content: string, 
  metadata?: Record<string, any>
): Promise<string> => {
  const cid = generateCID(content);
  
  const ipfsContent: IPFSContent = {
    cid,
    content,
    timestamp: Date.now(),
    size: new Blob([content]).size,
    type: typeof content,
    metadata
  };
  
  await addToStore('content', ipfsContent);
  
  console.log(`Content added with CID: ${cid}`);
  return cid;
};

// Get content from our simulated IPFS storage
export const getFromIPFS = async (cid: string): Promise<string> => {
  const result = await getFromStore<IPFSContent>('content', cid);
  
  if (!result) {
    throw new Error('Content not found');
  }
  
  console.log(`Content retrieved for CID: ${cid}`);
  return result.content;
};

// Delete content from our simulated IPFS storage
export const deleteContent = async (cid: string): Promise<boolean> => {
  try {
    await deleteFromStore('content', cid);
    console.log(`Content deleted for CID: ${cid}`);
    return true;
  } catch (error) {
    console.error(`Error deleting content with CID: ${cid}`, error);
    throw error;
  }
};

// List all CIDs in the storage
export const listAllCIDs = async (): Promise<string[]> => {
  const contents = await getAllFromStore<IPFSContent>('content');
  return contents.map(item => item.cid);
};

// Get all content with metadata
export const getAllContent = async (): Promise<IPFSContent[]> => {
  return await getAllFromStore<IPFSContent>('content');
};

// Get content metadata
export const getContentInfo = async (cid: string): Promise<Omit<IPFSContent, 'content'> | null> => {
  const content = await getFromStore<IPFSContent>('content', cid);
  
  if (!content) {
    return null;
  }
  
  // Return everything except the actual content
  const { content: _, ...info } = content;
  return info;
};

// Update content metadata
export const updateContentMetadata = async (
  cid: string, 
  metadata: Record<string, any>
): Promise<boolean> => {
  const content = await getFromStore<IPFSContent>('content', cid);
  
  if (!content) {
    return false;
  }
  
  content.metadata = { ...content.metadata, ...metadata };
  await addToStore('content', content);
  
  return true;
};

// Search content by metadata
export const searchContent = async (
  query: Record<string, any>
): Promise<IPFSContent[]> => {
  const allContent = await getAllFromStore<IPFSContent>('content');
  
  return allContent.filter(item => {
    if (!item.metadata) return false;
    
    for (const [key, value] of Object.entries(query)) {
      if (item.metadata[key] !== value) {
        return false;
      }
    }
    
    return true;
  });
};

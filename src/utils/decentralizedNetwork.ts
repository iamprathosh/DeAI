
import { toast } from "sonner";
import { 
  addToStore, 
  getAllFromStore, 
  getFromStore, 
  getMetadata, 
  setMetadata 
} from "./databaseManager";

// Define types for our network simulation
export type NetworkNode = {
  id: string;
  type: 'llm' | 'ipfs' | 'standard';
  isActive: boolean;
  connectedNodes: string[];
  createdAt?: number;
  lastSeen?: number;
};

export type NetworkMessage = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  type: 'query' | 'response' | 'storage' | 'retrieval';
  content: string;
  timestamp: number;
  delivered?: boolean;
};

// Simulated network state
let networkNodes: NetworkNode[] = [];
let networkMessages: NetworkMessage[] = [];
let messageListeners: ((message: NetworkMessage) => void)[] = [];
let isInitialized = false;

// Load network state from database
export const loadNetworkState = async (): Promise<void> => {
  try {
    const nodes = await getAllFromStore<NetworkNode>('nodes');
    const messages = await getAllFromStore<NetworkMessage>('messages');
    
    if (nodes.length > 0) {
      networkNodes = nodes;
      console.log('Loaded network nodes from database:', nodes.length);
    }
    
    if (messages.length > 0) {
      networkMessages = messages;
      console.log('Loaded network messages from database:', messages.length);
    }
    
    const initialized = await getMetadata('networkInitialized');
    isInitialized = !!initialized;
    
    if (!isInitialized) {
      await initializeNetwork();
    }
  } catch (error) {
    console.error('Error loading network state:', error);
    // If loading fails, initialize a new network
    if (!isInitialized) {
      await initializeNetwork();
    }
  }
};

// Initialize the network with some default nodes
export const initializeNetwork = async (): Promise<NetworkNode[]> => {
  const newNodes: NetworkNode[] = [];
  
  // Create LLM node
  newNodes.push({
    id: 'llm-main',
    type: 'llm',
    isActive: true,
    connectedNodes: [],
    createdAt: Date.now(),
    lastSeen: Date.now()
  });
  
  // Create IPFS nodes
  for (let i = 0; i < 5; i++) {
    newNodes.push({
      id: `ipfs-${i}`,
      type: 'ipfs',
      isActive: true,
      connectedNodes: [],
      createdAt: Date.now(),
      lastSeen: Date.now()
    });
  }
  
  // Create standard nodes
  for (let i = 0; i < 15; i++) {
    newNodes.push({
      id: `node-${i}`,
      type: 'standard',
      isActive: Math.random() > 0.1, // Some nodes might be inactive
      connectedNodes: [],
      createdAt: Date.now(),
      lastSeen: Date.now()
    });
  }
  
  // Connect nodes
  newNodes.forEach(node => {
    const otherNodes = newNodes.filter(n => n.id !== node.id);
    // Connect each node to 2-5 other random nodes
    const connections = Math.floor(2 + Math.random() * 3);
    
    for (let i = 0; i < connections; i++) {
      const randomNode = otherNodes[Math.floor(Math.random() * otherNodes.length)];
      if (!node.connectedNodes.includes(randomNode.id)) {
        node.connectedNodes.push(randomNode.id);
      }
    }
    
    // Ensure LLM is connected to all IPFS nodes
    if (node.id === 'llm-main') {
      newNodes
        .filter(n => n.type === 'ipfs')
        .forEach(ipfsNode => {
          if (!node.connectedNodes.includes(ipfsNode.id)) {
            node.connectedNodes.push(ipfsNode.id);
          }
          if (!ipfsNode.connectedNodes.includes(node.id)) {
            ipfsNode.connectedNodes.push(node.id);
          }
        });
    }
  });
  
  // Save to memory and database
  networkNodes = newNodes;
  
  // Save each node to the database
  for (const node of newNodes) {
    await addToStore('nodes', node);
  }
  
  // Mark network as initialized
  await setMetadata('networkInitialized', true);
  isInitialized = true;
  
  console.log('Network initialized with nodes:', newNodes.length);
  return newNodes;
};

// Send a message through the network
export const sendNetworkMessage = (
  fromId: string,
  toId: string,
  type: NetworkMessage['type'],
  content: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fromNode = networkNodes.find(n => n.id === fromId);
    const toNode = networkNodes.find(n => n.id === toId);
    
    if (!fromNode || !toNode) {
      reject(new Error('Node not found'));
      return;
    }
    
    if (!fromNode.isActive || !toNode.isActive) {
      reject(new Error('One of the nodes is inactive'));
      return;
    }
    
    // Check if nodes are connected (directly or via other nodes)
    let canReach = false;
    
    // Direct connection
    if (fromNode.connectedNodes.includes(toId)) {
      canReach = true;
    } else {
      // Check if there's an indirect path (simplified)
      for (const intermediateId of fromNode.connectedNodes) {
        const intermediateNode = networkNodes.find(n => n.id === intermediateId);
        if (intermediateNode && intermediateNode.isActive && intermediateNode.connectedNodes.includes(toId)) {
          canReach = true;
          break;
        }
      }
    }
    
    if (!canReach) {
      reject(new Error('No path between nodes'));
      return;
    }
    
    // Create and send message
    const message: NetworkMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      fromNodeId: fromId,
      toNodeId: toId,
      type,
      content,
      timestamp: Date.now(),
      delivered: false
    };
    
    // Add to memory
    networkMessages.push(message);
    
    // Store in database asynchronously
    addToStore('messages', message).catch(err => {
      console.error('Failed to store message in database:', err);
    });
    
    // Update node last seen time
    fromNode.lastSeen = Date.now();
    toNode.lastSeen = Date.now();
    
    // Update nodes in database
    addToStore('nodes', fromNode).catch(err => {
      console.error('Failed to update from node:', err);
    });
    
    addToStore('nodes', toNode).catch(err => {
      console.error('Failed to update to node:', err);
    });
    
    // Notify listeners
    messageListeners.forEach(listener => listener(message));
    
    // Simulate network delay
    setTimeout(() => {
      // Mark as delivered
      message.delivered = true;
      
      // Update in database
      addToStore('messages', message).catch(err => {
        console.error('Failed to update message status:', err);
      });
      
      resolve(message.id);
      toast.info(`Message delivered: ${type} from ${fromId.substring(0, 8)}... to ${toId.substring(0, 8)}...`);
    }, 300 + Math.random() * 700); // Random delay between 300-1000ms
  });
};

// Subscribe to network messages
export const subscribeToMessages = (listener: (message: NetworkMessage) => void): () => void => {
  messageListeners.push(listener);
  return () => {
    messageListeners = messageListeners.filter(l => l !== listener);
  };
};

// Get all active nodes
export const getActiveNodes = (): NetworkNode[] => {
  return networkNodes.filter(node => node.isActive);
};

// Get message history
export const getMessageHistory = async (limit: number = 100): Promise<NetworkMessage[]> => {
  const messages = await getAllFromStore<NetworkMessage>('messages');
  return messages
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};

// Get node details
export const getNodeDetails = async (nodeId: string): Promise<NetworkNode | null> => {
  return await getFromStore<NetworkNode>('nodes', nodeId);
};

// Update node status
export const updateNodeStatus = async (nodeId: string, isActive: boolean): Promise<NetworkNode | null> => {
  const node = await getFromStore<NetworkNode>('nodes', nodeId);
  
  if (!node) {
    return null;
  }
  
  node.isActive = isActive;
  node.lastSeen = Date.now();
  
  await addToStore('nodes', node);
  
  // Update in memory
  const index = networkNodes.findIndex(n => n.id === nodeId);
  if (index !== -1) {
    networkNodes[index] = node;
  }
  
  return node;
};

// Initialize the network when module is loaded
loadNetworkState().catch(err => {
  console.error('Error initializing network:', err);
});

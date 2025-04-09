import { toast } from "sonner";

// Define types for our network simulation
export type NetworkNode = {
  id: string;
  type: 'llm' | 'ipfs' | 'standard';
  isActive: boolean;
  connectedNodes: string[];
};

export type NetworkMessage = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  type: 'query' | 'response' | 'storage' | 'retrieval';
  content: string;
  timestamp: number;
};

// Simulated network state
let networkNodes: NetworkNode[] = [];
let networkMessages: NetworkMessage[] = [];
let messageListeners: ((message: NetworkMessage) => void)[] = [];

// Initialize the network with some default nodes
export const initializeNetwork = () => {
  // Create LLM node
  networkNodes.push({
    id: 'llm-main',
    type: 'llm',
    isActive: true,
    connectedNodes: []
  });
  
  // Create IPFS nodes
  for (let i = 0; i < 5; i++) {
    networkNodes.push({
      id: `ipfs-${i}`,
      type: 'ipfs',
      isActive: true,
      connectedNodes: []
    });
  }
  
  // Create standard nodes
  for (let i = 0; i < 15; i++) {
    networkNodes.push({
      id: `node-${i}`,
      type: 'standard',
      isActive: Math.random() > 0.1, // Some nodes might be inactive
      connectedNodes: []
    });
  }
  
  // Connect nodes
  networkNodes.forEach(node => {
    const otherNodes = networkNodes.filter(n => n.id !== node.id);
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
      networkNodes
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
  
  console.log('Network initialized with nodes:', networkNodes);
  return networkNodes;
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
      timestamp: Date.now()
    };
    
    networkMessages.push(message);
    
    // Notify listeners
    messageListeners.forEach(listener => listener(message));
    
    // Simulate network delay
    setTimeout(() => {
      resolve(message.id);
      toast(`Message delivered: ${type} from ${fromId.substring(0, 8)}... to ${toId.substring(0, 8)}...`);
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

// Initialize the network on first load
initializeNetwork();

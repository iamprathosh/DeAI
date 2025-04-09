/**
 * Backend Simulation for Demonstration Purposes
 * This module simulates various backend services interacting with the decentralized network
 */

import { sendNetworkMessage, getActiveNodes, NetworkNode } from './decentralizedNetwork';
import { addToIPFS, getFromIPFS, getAllContent, updateContentMetadata } from './ipfsStorage';
import { toast } from "sonner";

// Types for backend simulation
export type BackendService = {
  id: string;
  name: string;
  type: 'api' | 'database' | 'compute' | 'storage' | 'analytics';
  status: 'online' | 'offline' | 'degraded';
  region: string;
  connections: string[];
  lastRequest?: number;
  processedRequests: number;
  avgResponseTime: number;
};

export type ServiceRequest = {
  id: string;
  serviceId: string;
  type: 'read' | 'write' | 'compute' | 'query' | 'analyze';
  payload: string;
  timestamp: number;
  completed?: boolean;
  responseTime?: number;
  cid?: string;
};

// State management
let backendServices: BackendService[] = [];
let serviceRequests: ServiceRequest[] = [];
let serviceListeners: ((service: BackendService, request?: ServiceRequest) => void)[] = [];
let isBackendInitialized = false;
let simulationInterval: number | undefined;

// Service names and types for more realistic simulation
const serviceNames = {
  api: ['RESTful Gateway', 'GraphQL Endpoint', 'API Proxy', 'Integration Service', 'Gateway Service'],
  database: ['Document Store', 'Graph Database', 'Time Series DB', 'Key-Value Store', 'SQL Service'],
  compute: ['Compute Cluster', 'Processing Engine', 'Execution Runtime', 'Serverless Function', 'Task Runner'],
  storage: ['Object Store', 'Block Storage', 'Content Cache', 'Data Lake', 'Archive Service'],
  analytics: ['Analytics Engine', 'Metrics Processor', 'Log Analyzer', 'ML Pipeline', 'Data Warehouse']
};

const regions = ['us-east', 'us-west', 'eu-central', 'ap-south', 'ap-northeast'];

// Initialize backend services
export const initializeBackendServices = async (forceReinit = false): Promise<BackendService[]> => {
  if (isBackendInitialized && !forceReinit) {
    return backendServices;
  }
  
  try {
    // Create a variety of backend services
    backendServices = [];
    
    // Create API services
    for (let i = 0; i < 3; i++) {
      backendServices.push(createService('api', i));
    }
    
    // Create database services
    for (let i = 0; i < 2; i++) {
      backendServices.push(createService('database', i));
    }
    
    // Create compute services
    for (let i = 0; i < 2; i++) {
      backendServices.push(createService('compute', i));
    }
    
    // Create storage services
    for (let i = 0; i < 3; i++) {
      backendServices.push(createService('storage', i));
    }
    
    // Create analytics services
    for (let i = 0; i < 2; i++) {
      backendServices.push(createService('analytics', i));
    }
    
    // Connect services to each other and to network nodes
    connectServices();
    
    // Clear previous requests
    serviceRequests = [];
    
    // Save to IPFS for persistence
    await addToIPFS(JSON.stringify(backendServices), {
      type: 'system-data',
      name: 'backend-services',
      timestamp: Date.now()
    });
    
    // Start simulation if not already running
    startBackendSimulation();
    
    isBackendInitialized = true;
    console.log('Backend services initialized:', backendServices.length);
    return backendServices;
  } catch (error) {
    console.error('Failed to initialize backend services:', error);
    toast.error('Failed to initialize backend simulation');
    return [];
  }
};

// Helper to create a service with realistic properties
const createService = (type: BackendService['type'], index: number): BackendService => {
  const names = serviceNames[type];
  const name = names[index % names.length];
  const region = regions[Math.floor(Math.random() * regions.length)];
  
  return {
    id: `${type}-${index}`,
    name: `${name}-${index + 1}`,
    type,
    status: Math.random() > 0.9 ? 'degraded' : 'online',
    region,
    connections: [],
    processedRequests: 0,
    avgResponseTime: 50 + Math.random() * 200
  };
};

// Connect services to each other and network nodes
const connectServices = () => {
  // Connect services to each other based on realistic patterns
  backendServices.forEach(service => {
    const otherServices = backendServices.filter(s => s.id !== service.id);
    
    // Different connection patterns based on service type
    switch (service.type) {
      case 'api':
        // API services connect to database and compute services
        const dbServices = otherServices.filter(s => s.type === 'database');
        const computeServices = otherServices.filter(s => s.type === 'compute');
        
        // Connect to 1-2 database services
        for (let i = 0; i < Math.min(2, dbServices.length); i++) {
          if (!service.connections.includes(dbServices[i].id)) {
            service.connections.push(dbServices[i].id);
          }
        }
        
        // Connect to 1-2 compute services
        for (let i = 0; i < Math.min(2, computeServices.length); i++) {
          if (!service.connections.includes(computeServices[i].id)) {
            service.connections.push(computeServices[i].id);
          }
        }
        break;
        
      case 'database':
        // Databases connect to storage services
        const storageServices = otherServices.filter(s => s.type === 'storage');
        
        // Connect to 1-2 storage services
        for (let i = 0; i < Math.min(2, storageServices.length); i++) {
          if (!service.connections.includes(storageServices[i].id)) {
            service.connections.push(storageServices[i].id);
          }
        }
        break;
        
      case 'compute':
        // Compute services connect to databases and analytics
        const dbs = otherServices.filter(s => s.type === 'database');
        const analytics = otherServices.filter(s => s.type === 'analytics');
        
        // Connect to a database
        if (dbs.length > 0) {
          const db = dbs[Math.floor(Math.random() * dbs.length)];
          if (!service.connections.includes(db.id)) {
            service.connections.push(db.id);
          }
        }
        
        // Connect to analytics
        if (analytics.length > 0) {
          const analytic = analytics[Math.floor(Math.random() * analytics.length)];
          if (!service.connections.includes(analytic.id)) {
            service.connections.push(analytic.id);
          }
        }
        break;
        
      case 'storage':
        // Storage services mostly stand alone
        break;
        
      case 'analytics':
        // Analytics connects to databases and storage
        const databases = otherServices.filter(s => s.type === 'database');
        const storage = otherServices.filter(s => s.type === 'storage');
        
        // Connect to databases
        for (let i = 0; i < Math.min(2, databases.length); i++) {
          if (!service.connections.includes(databases[i].id)) {
            service.connections.push(databases[i].id);
          }
        }
        
        // Connect to storage
        if (storage.length > 0) {
          const store = storage[Math.floor(Math.random() * storage.length)];
          if (!service.connections.includes(store.id)) {
            service.connections.push(store.id);
          }
        }
        break;
    }
  });
};

// Start background simulation for backend services
export const startBackendSimulation = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
  }
  
  // Run simulation every 5 seconds
  simulationInterval = window.setInterval(() => {
    simulateBackendActivity();
  }, 5000);
  
  // Initial simulation
  simulateBackendActivity();
};

// Stop backend simulation
export const stopBackendSimulation = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = undefined;
  }
};

// Simulate backend service activity
const simulateBackendActivity = () => {
  if (!isBackendInitialized || backendServices.length === 0) return;
  
  // Choose 1-3 random services to simulate activity
  const activityCount = 1 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < activityCount; i++) {
    // Select a random service
    const serviceIndex = Math.floor(Math.random() * backendServices.length);
    const service = backendServices[serviceIndex];
    
    // Update last request time
    service.lastRequest = Date.now();
    service.processedRequests += 1;
    
    // Random jitter for response time
    const jitter = (Math.random() * 50) - 25; // +/- 25ms
    service.avgResponseTime = Math.max(10, service.avgResponseTime + jitter * 0.1);
    
    // Occasional status changes
    if (Math.random() > 0.95) {
      service.status = service.status === 'online' ? 'degraded' : 'online';
    }
    
    // Create a service request
    const requestTypes: ServiceRequest['type'][] = ['read', 'write', 'compute', 'query', 'analyze'];
    const requestType = requestTypes[Math.floor(Math.random() * requestTypes.length)];
    
    const payloads = [
      '{"action":"fetch","resource":"user-data"}',
      '{"action":"update","resource":"metrics"}',
      '{"action":"process","resource":"transactions"}',
      '{"action":"analyze","resource":"logs"}',
      '{"action":"store","resource":"assets"}'
    ];
    
    const request: ServiceRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      serviceId: service.id,
      type: requestType,
      payload: payloads[Math.floor(Math.random() * payloads.length)],
      timestamp: Date.now(),
      completed: true,
      responseTime: service.avgResponseTime + jitter
    };
    
    // Store in requests array
    serviceRequests.push(request);
    
    // If we have a connected service, simulate data flow between them
    if (service.connections.length > 0) {
      const targetServiceId = service.connections[Math.floor(Math.random() * service.connections.length)];
      const targetService = backendServices.find(s => s.id === targetServiceId);
      
      if (targetService) {
        // Update target service
        targetService.lastRequest = Date.now();
        targetService.processedRequests += 1;
        
        // Notify listeners about both services
        notifyServiceListeners(service, request);
        notifyServiceListeners(targetService);
        
        // Store data in IPFS occasionally for persistence
        if (Math.random() > 0.7) {
          storeServiceActivity(service, targetService, request).catch(err => {
            console.error('Failed to store service activity:', err);
          });
        }
      }
    } else {
      // Notify listeners about the service
      notifyServiceListeners(service, request);
    }
  }
  
  // Save updated services occasionally
  if (Math.random() > 0.8) {
    addToIPFS(JSON.stringify({
      services: backendServices,
      timestamp: Date.now(),
      metrics: {
        totalRequests: serviceRequests.length,
        activeServices: backendServices.filter(s => s.status === 'online').length,
        avgResponseTime: backendServices.reduce((sum, s) => sum + s.avgResponseTime, 0) / backendServices.length
      }
    }), {
      type: 'system-metrics',
      timestamp: Date.now()
    }).catch(err => {
      console.error('Failed to store system metrics:', err);
    });
  }
  
  // Limit the number of stored requests
  if (serviceRequests.length > 100) {
    serviceRequests = serviceRequests.slice(-100);
  }
};

// Store service activity in IPFS
const storeServiceActivity = async (
  sourceService: BackendService, 
  targetService: BackendService,
  request: ServiceRequest
) => {
  const activityData = {
    sourceService: sourceService.id,
    targetService: targetService.id,
    request: request.id,
    requestType: request.type,
    timestamp: Date.now(),
    payload: request.payload
  };
  
  // Store in IPFS
  const cid = await addToIPFS(JSON.stringify(activityData), {
    type: 'service-activity',
    timestamp: Date.now()
  });
  
  // Update request with CID
  request.cid = cid;
  
  return cid;
};

// Get all backend services
export const getAllBackendServices = (): BackendService[] => {
  return backendServices;
};

// Get recent service requests
export const getServiceRequests = (limit: number = 20): ServiceRequest[] => {
  return serviceRequests
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};

// Get a specific backend service
export const getBackendService = (serviceId: string): BackendService | undefined => {
  return backendServices.find(service => service.id === serviceId);
};

// Subscribe to service updates
export const subscribeToServiceUpdates = (
  listener: (service: BackendService, request?: ServiceRequest) => void
): () => void => {
  serviceListeners.push(listener);
  return () => {
    serviceListeners = serviceListeners.filter(l => l !== listener);
  };
};

// Notify service listeners
const notifyServiceListeners = (service: BackendService, request?: ServiceRequest) => {
  serviceListeners.forEach(listener => listener(service, request));
};

// Process a query through backend and decentralized network
export const processBackendQuery = async (
  query: string,
  sourceServiceId?: string
): Promise<{
  response: string;
  responseCid: string;
  processingPath: string[];
  processingTime: number;
}> => {
  const startTime = Date.now();
  console.log('Processing backend query:', query);
  
  // Processing path through services and nodes
  const processingPath: string[] = ['client'];
  
  // Choose a source service if not provided (default to an API service)
  if (!sourceServiceId) {
    const apiServices = backendServices.filter(s => s.type === 'api' && s.status === 'online');
    if (apiServices.length > 0) {
      sourceServiceId = apiServices[Math.floor(Math.random() * apiServices.length)].id;
    } else {
      sourceServiceId = backendServices[0].id;
    }
  }
  
  const sourceService = backendServices.find(s => s.id === sourceServiceId);
  if (!sourceService) {
    throw new Error('Source service not found');
  }
  
  // Update service metrics
  sourceService.lastRequest = Date.now();
  sourceService.processedRequests++;
  processingPath.push(sourceServiceId);
  
  // Step 1: Create service request
  const request: ServiceRequest = {
    id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    serviceId: sourceService.id,
    type: 'query',
    payload: query,
    timestamp: Date.now()
  };
  serviceRequests.push(request);
  
  // Step 2: Route through connected services based on service type
  let currentService = sourceService;
  let remainingPath = 2; // Limit path length for performance
  
  while (remainingPath > 0 && currentService.connections.length > 0) {
    const nextServiceId = currentService.connections[Math.floor(Math.random() * currentService.connections.length)];
    const nextService = backendServices.find(s => s.id === nextServiceId);
    
    if (nextService) {
      // Update next service
      nextService.lastRequest = Date.now();
      nextService.processedRequests++;
      processingPath.push(nextServiceId);
      
      // Move to next service
      currentService = nextService;
      remainingPath--;
      
      // Add artificial delay to simulate processing time
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 200));
    } else {
      break;
    }
  }
  
  // Step 3: Store the query in IPFS through a storage service
  const storageServices = backendServices.filter(s => s.type === 'storage' && s.status === 'online');
  const storageService = storageServices.length > 0 
    ? storageServices[Math.floor(Math.random() * storageServices.length)]
    : null;
  
  if (storageService) {
    processingPath.push(storageService.id);
    storageService.lastRequest = Date.now();
    storageService.processedRequests++;
  }
  
  const queryCid = await addToIPFS(query, { 
    type: 'backend-query',
    timestamp: Date.now(),
    path: processingPath.join('->')
  });
  
  // Step 4: Send query to network and LLM through a compute service
  const computeServices = backendServices.filter(s => s.type === 'compute' && s.status === 'online');
  const computeService = computeServices.length > 0
    ? computeServices[Math.floor(Math.random() * computeServices.length)]
    : null;
  
  if (computeService) {
    processingPath.push(computeService.id);
    computeService.lastRequest = Date.now();
    computeService.processedRequests++;
  }
  
  // Connect to decentralized network via a random standard node
  const standardNodeId = `node-${Math.floor(Math.random() * 15)}`;
  await sendNetworkMessage('backend', standardNodeId, 'query', queryCid);
  processingPath.push(standardNodeId);
  
  // Route to LLM node
  await sendNetworkMessage(standardNodeId, 'llm-main', 'query', queryCid);
  processingPath.push('llm-main');
  
  // Step 5: Generate a response based on the query
  const responses = [
    `Based on backend analysis of "${query.substring(0, 20)}...", our decentralized services have determined that this request requires attention to network topology optimization.`,
    `The backend services have processed "${query.substring(0, 20)}..." and determined that the distributed consensus algorithm shows promising efficiency metrics.`,
    `After routing through ${processingPath.length} nodes, your query "${query.substring(0, 20)}..." has been analyzed and we've identified relevant patterns in the network traffic.`,
    `Our backend simulation for "${query.substring(0, 20)}..." indicates that latency could be reduced by optimizing the service-to-service communication patterns.`,
    `The query "${query.substring(0, 20)}..." has been successfully processed through our backend services. The simulation suggests scaling compute resources to improve throughput.`
  ];
  
  const response = responses[Math.floor(Math.random() * responses.length)];
  
  // Step 6: Store response in IPFS
  const ipfsNodeId = `ipfs-${Math.floor(Math.random() * 5)}`;
  await sendNetworkMessage('llm-main', ipfsNodeId, 'storage', response);
  processingPath.push(ipfsNodeId);
  
  const responseCid = await addToIPFS(response, { 
    type: 'backend-response',
    queryId: queryCid,
    timestamp: Date.now(),
    path: processingPath.join('->'),
    serviceMetrics: {
      servicesInvolved: processingPath.filter(p => p.includes('-')).length,
      nodesInvolved: processingPath.filter(p => p.includes('node-') || p.includes('ipfs-') || p === 'llm-main').length,
      processingTime: Date.now() - startTime
    }
  });
  
  // Link query to response
  await updateContentMetadata(queryCid, {
    responseCid,
    processed: true,
    timestamp: Date.now()
  });
  
  // Step 7: Route response back through services
  
  // First through analytic service if available
  const analyticsServices = backendServices.filter(s => s.type === 'analytics' && s.status === 'online');
  const analyticsService = analyticsServices.length > 0
    ? analyticsServices[Math.floor(Math.random() * analyticsServices.length)]
    : null;
  
  if (analyticsService) {
    processingPath.push(analyticsService.id);
    analyticsService.lastRequest = Date.now();
    analyticsService.processedRequests++;
  }
  
  // Then back through compute service
  if (computeService) {
    processingPath.push(computeService.id);
    computeService.lastRequest = Date.now();
    computeService.processedRequests++;
  }
  
  // Through API service
  if (sourceService) {
    processingPath.push(sourceService.id);
    sourceService.lastRequest = Date.now();
    sourceService.processedRequests++;
  }
  
  // And finally back to the client
  processingPath.push('client');
  
  // Complete the request
  request.completed = true;
  request.responseTime = Date.now() - request.timestamp;
  request.cid = responseCid;
  
  // Update service with latest response time
  if (sourceService) {
    const newAvg = (sourceService.avgResponseTime * 0.7) + (request.responseTime * 0.3);
    sourceService.avgResponseTime = Math.round(newAvg);
  }
  
  const processingTime = Date.now() - startTime;
  
  console.log(`Backend query processed in ${processingTime}ms through ${processingPath.length} steps`);
  
  return {
    response,
    responseCid,
    processingPath,
    processingTime
  };
};

// Get metrics for the backend system
export const getBackendMetrics = () => {
  const totalRequests = serviceRequests.length;
  const activeServices = backendServices.filter(s => s.status === 'online').length;
  const degradedServices = backendServices.filter(s => s.status === 'degraded').length;
  const avgResponseTime = Math.round(
    backendServices.reduce((sum, s) => sum + s.avgResponseTime, 0) / backendServices.length
  );
  
  const requestsByType: Record<string, number> = {};
  serviceRequests.forEach(req => {
    requestsByType[req.type] = (requestsByType[req.type] || 0) + 1;
  });
  
  const servicesByType: Record<string, number> = {};
  backendServices.forEach(service => {
    servicesByType[service.type] = (servicesByType[service.type] || 0) + 1;
  });
  
  return {
    totalServices: backendServices.length,
    activeServices,
    degradedServices,
    totalRequests,
    avgResponseTime,
    requestsByType,
    servicesByType,
    timestamp: Date.now()
  };
};
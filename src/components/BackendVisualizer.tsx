import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Server, Database, Activity, HardDrive, BarChart3, Zap, Clock, ArrowRight } from 'lucide-react';
import { 
  initializeBackendServices, 
  getAllBackendServices, 
  getServiceRequests, 
  subscribeToServiceUpdates,
  getBackendMetrics,
  processBackendQuery,
  BackendService,
  ServiceRequest
} from '@/utils/backendSimulation';

interface ServiceNodeProps {
  service: BackendService;
  onClick?: () => void;
  isActive?: boolean;
  showConnections?: boolean;
}

const ServiceNode = ({ service, onClick, isActive, showConnections = false }: ServiceNodeProps) => {
  const getServiceIcon = () => {
    switch (service.type) {
      case 'api':
        return <Server className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'compute':
        return <Activity className="h-4 w-4" />;
      case 'storage':
        return <HardDrive className="h-4 w-4" />;
      case 'analytics':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (service.status) {
      case 'online':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'degraded':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'offline':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-500 border-slate-500/30';
    }
  };

  return (
    <div
      className={`
        relative p-3 rounded-md border bg-slate-800 hover:bg-slate-700 transition-all
        ${isActive ? 'ring-2 ring-blue-500 bg-slate-700' : 'ring-0'}
        cursor-pointer
      `}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-slate-700">{getServiceIcon()}</div>
          <div>
            <h3 className="text-sm font-medium text-white">{service.name}</h3>
            <p className="text-xs text-slate-400">{service.region}</p>
          </div>
        </div>
        <Badge variant="outline" className={`text-xs ${getStatusColor()}`}>
          {service.status}
        </Badge>
      </div>

      <div className="flex justify-between text-xs text-slate-400 mt-3">
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3" />
          <span>{service.processedRequests} req</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{Math.round(service.avgResponseTime)}ms</span>
        </div>
      </div>

      {showConnections && service.connections.length > 0 && (
        <div className="mt-3 pt-2 border-t border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Connections:</p>
          <div className="flex flex-wrap gap-1">
            {service.connections.map(connId => (
              <Badge key={connId} variant="outline" className="text-xs bg-slate-700">
                {connId}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const BackendVisualizer = () => {
  const [services, setServices] = useState<BackendService[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeService, setActiveService] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [processingQuery, setProcessingQuery] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize backend services
  useEffect(() => {
    const initBackend = async () => {
      setIsLoading(true);
      try {
        const services = await initializeBackendServices();
        setServices(services);
        const requests = getServiceRequests();
        setRequests(requests);
        setMetrics(getBackendMetrics());
        
        addToLog('Backend services initialized');
      } catch (error) {
        console.error('Failed to initialize backend services:', error);
        addToLog('Failed to initialize backend services');
      } finally {
        setIsLoading(false);
      }
    };
    
    initBackend();
    
    // Subscribe to service updates
    const unsubscribe = subscribeToServiceUpdates((service, request) => {
      // Update services
      setServices(prevServices => {
        return prevServices.map(s => 
          s.id === service.id ? service : s
        );
      });
      
      // Add new request if available
      if (request) {
        setRequests(prev => [request, ...prev].slice(0, 20));
        
        // Add to log
        addToLog(`${service.name} processed ${request.type} request`);
      }
      
      // Update metrics occasionally
      if (Math.random() > 0.7) {
        setMetrics(getBackendMetrics());
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Helper to add a log message
  const addToLog = (message: string) => {
    setSimulationLog(prev => {
      const timestamp = new Date().toLocaleTimeString();
      return [...prev, `[${timestamp}] ${message}`].slice(-100);
    });
  };
  
  // Scroll to bottom of log when it changes
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [simulationLog]);
  
  // Function to trigger a simulated backend query
  const triggerSimulatedQuery = async () => {
    setProcessingQuery(true);
    
    const queries = [
      "Analyze current network throughput",
      "Optimize storage distribution",
      "Predict node failure probability",
      "Calculate optimal routing paths",
      "Evaluate consensus algorithm efficiency"
    ];
    
    const selectedQuery = queries[Math.floor(Math.random() * queries.length)];
    
    try {
      addToLog(`Processing query: "${selectedQuery}"`);
      
      // Select a random API service if available, otherwise use any available service
      let sourceServiceId: string | undefined;
      const apiServices = services.filter(s => s.type === 'api' && s.status === 'online');
      
      if (apiServices.length > 0) {
        const sourceService = apiServices[Math.floor(Math.random() * apiServices.length)];
        sourceServiceId = sourceService.id;
        addToLog(`Query routed through API service: ${sourceService.name}`);
      }
      
      const result = await processBackendQuery(selectedQuery, sourceServiceId);
      
      addToLog(`Query processed through ${result.processingPath.length} steps`);
      addToLog(`Processing time: ${result.processingTime}ms`);
      addToLog(`Response: "${result.response}"`);
      
      // Update services and metrics
      setServices([...getAllBackendServices()]);
      setRequests(getServiceRequests());
      setMetrics(getBackendMetrics());
    } catch (error) {
      console.error('Error processing backend query:', error);
      addToLog('Error processing backend query');
    } finally {
      setProcessingQuery(false);
    }
  };

  return (
    <Card className="p-4 bg-slate-800 border-slate-700">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Server className="h-5 w-5 text-blue-400" />
            Backend Services Simulation
          </h2>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs"
              disabled={isLoading || processingQuery}
              onClick={() => triggerSimulatedQuery()}
            >
              {processingQuery ? (
                <><RefreshCw className="h-3 w-3 mr-2 animate-spin" /> Processing</>
              ) : (
                <>Simulate Query</>
              )}
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs"
              disabled={isLoading}
              onClick={async () => {
                setIsLoading(true);
                await initializeBackendServices(true);
                setServices([...getAllBackendServices()]);
                setRequests(getServiceRequests());
                setMetrics(getBackendMetrics());
                addToLog('Backend services reinitialized');
                setIsLoading(false);
              }}
            >
              {isLoading ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="services" className="flex-1 flex flex-col">
          <TabsList>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services" className="flex-1 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {isLoading ? (
                <div className="col-span-full flex justify-center items-center py-12">
                  <RefreshCw className="h-6 w-6 text-blue-400 animate-spin" />
                </div>
              ) : services.length > 0 ? (
                services.map(service => (
                  <ServiceNode 
                    key={service.id} 
                    service={service} 
                    isActive={activeService === service.id}
                    onClick={() => setActiveService(service.id === activeService ? null : service.id)}
                    showConnections={activeService === service.id}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-slate-500">
                  No backend services available
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="requests" className="flex-1 mt-2">
            <ScrollArea className="h-[400px] pr-4">
              {requests.length > 0 ? (
                <div className="space-y-2">
                  {requests.map(request => {
                    const service = services.find(s => s.id === request.serviceId);
                    return (
                      <div key={request.id} className="p-3 rounded-md bg-slate-700 border border-slate-600">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs bg-slate-600">
                                {request.type}
                              </Badge>
                              <span className="text-sm text-slate-300">
                                {service?.name || request.serviceId}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 font-mono">
                              {request.payload}
                            </p>
                          </div>
                          <div className="text-xs text-slate-400">
                            {request.responseTime ? `${request.responseTime}ms` : '...'}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-600">
                          <span className="text-xs text-slate-400">
                            {new Date(request.timestamp).toLocaleTimeString()}
                          </span>
                          <Badge variant={request.completed ? "outline" : "secondary"} className="text-xs">
                            {request.completed ? "Completed" : "Processing"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  No requests available
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="metrics" className="flex-1 mt-2">
            {metrics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card className="p-4 bg-slate-700 border-slate-600">
                    <h4 className="text-xs text-slate-400 mb-1">Total Services</h4>
                    <p className="text-2xl font-bold text-white">{metrics.totalServices}</p>
                  </Card>
                  <Card className="p-4 bg-slate-700 border-slate-600">
                    <h4 className="text-xs text-slate-400 mb-1">Active Services</h4>
                    <p className="text-2xl font-bold text-green-400">{metrics.activeServices}</p>
                  </Card>
                  <Card className="p-4 bg-slate-700 border-slate-600">
                    <h4 className="text-xs text-slate-400 mb-1">Total Requests</h4>
                    <p className="text-2xl font-bold text-blue-400">{metrics.totalRequests}</p>
                  </Card>
                  <Card className="p-4 bg-slate-700 border-slate-600">
                    <h4 className="text-xs text-slate-400 mb-1">Avg Response Time</h4>
                    <p className="text-2xl font-bold text-purple-400">{metrics.avgResponseTime}ms</p>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 bg-slate-700 border-slate-600">
                    <h4 className="text-sm text-slate-300 mb-3">Services by Type</h4>
                    <div className="space-y-2">
                      {Object.entries(metrics.servicesByType).map(([type, count]: [string, any]) => (
                        <div key={type} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {type === 'api' && <Server className="h-3 w-3 text-blue-400" />}
                            {type === 'database' && <Database className="h-3 w-3 text-green-400" />}
                            {type === 'compute' && <Activity className="h-3 w-3 text-yellow-400" />}
                            {type === 'storage' && <HardDrive className="h-3 w-3 text-purple-400" />}
                            {type === 'analytics' && <BarChart3 className="h-3 w-3 text-red-400" />}
                            <span className="text-xs text-slate-300 capitalize">{type}</span>
                          </div>
                          <span className="text-xs font-medium text-white">{count}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-slate-700 border-slate-600">
                    <h4 className="text-sm text-slate-300 mb-3">Requests by Type</h4>
                    <div className="space-y-2">
                      {Object.entries(metrics.requestsByType).map(([type, count]: [string, any]) => (
                        <div key={type} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                            >
                              {type}
                            </Badge>
                          </div>
                          <span className="text-xs font-medium text-white">{count}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="h-6 w-6 text-blue-400 animate-spin" />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="logs" className="flex-1 mt-2">
            <Card className="p-2 bg-slate-700 border-slate-600 h-[400px] overflow-hidden">
              <ScrollArea className="h-full pr-4">
                <div className="font-mono text-xs">
                  {simulationLog.length > 0 ? (
                    <div className="space-y-1">
                      {simulationLog.map((log, index) => (
                        <div key={index} className="text-slate-300">{log}</div>
                      ))}
                      <div ref={logEndRef} />
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      No logs available
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default BackendVisualizer;
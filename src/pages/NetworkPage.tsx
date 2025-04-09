import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import NetworkVisualization from '@/components/NetworkVisualization';
import BackendVisualizer from '@/components/BackendVisualizer';
import Navigation from '@/components/Navigation';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Activity, Database, Cpu, Network, Signal, MessageCircle, RefreshCw } from 'lucide-react';
import { listAllCIDs } from '@/utils/ipfsStorage';
import { getActiveNodes, NetworkMessage, subscribeToMessages, loadNetworkState, initializeNetwork } from '@/utils/decentralizedNetwork';

const NetworkPage = () => {
  const [activeNodes, setActiveNodes] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [storedItems, setStoredItems] = useState(0);
  const [networkActivity, setNetworkActivity] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initNetwork = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Force network initialization
      await loadNetworkState();
      
      // Update node count
      setActiveNodes(getActiveNodes().length);
      
      // Get stored content count
      const cids = await listAllCIDs();
      setStoredItems(cids.length);
      
      setLoading(false);
    } catch (err) {
      console.error("Failed to initialize network:", err);
      setError("Failed to initialize network. Please try refreshing the page.");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize network and get counts
    initNetwork();
    
    // Subscribe to network messages
    const unsubscribe = subscribeToMessages((message: NetworkMessage) => {
      setMessageCount(prev => prev + 1);
      
      // Flash network activity indicator
      setNetworkActivity(true);
      setTimeout(() => setNetworkActivity(false), 1000);
      
      if (message.type === 'storage') {
        // Update storage count when storage-related message is received
        listAllCIDs().then(cids => setStoredItems(cids.length));
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log("Current pathname:", window.location.pathname);
  }, [window.location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Navigation />
        <div className="container mx-auto py-16 flex flex-col items-center justify-center">
          <div className="animate-spin mb-4">
            <RefreshCw className="h-10 w-10 text-blue-400" />
          </div>
          <p className="text-white text-lg">Initializing network simulation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Navigation />
        <div className="container mx-auto py-16 flex flex-col items-center justify-center">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 mb-6">
            <h2 className="text-red-400 text-xl mb-2">Error</h2>
            <p className="text-white mb-4">{error}</p>
            <Button onClick={initNetwork}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Network Initialization
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Navigation />
      
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Network className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Network Monitoring</h1>
          </div>
          <p className="text-slate-300">Real-time visualization of the decentralized network</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-6 flex flex-col items-center justify-center text-center">
            <div className={`p-3 mb-3 rounded-full ${networkActivity ? 'bg-blue-500/20 animate-pulse' : 'bg-slate-700'}`}>
              <Signal className="h-8 w-8 text-blue-400" />
            </div>
            <div className="text-4xl font-bold text-white">{activeNodes}</div>
            <div className="text-sm text-slate-300">Active Nodes</div>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700 p-6 flex flex-col items-center justify-center text-center">
            <div className={`p-3 mb-3 rounded-full ${networkActivity ? 'bg-green-500/20 animate-pulse' : 'bg-slate-700'}`}>
              <MessageCircle className="h-8 w-8 text-green-400" />
            </div>
            <div className="text-4xl font-bold text-white">{messageCount}</div>
            <div className="text-sm text-slate-300">Network Messages</div>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700 p-6 flex flex-col items-center justify-center text-center">
            <div className="p-3 mb-3 rounded-full bg-slate-700">
              <Database className="h-8 w-8 text-purple-400" />
            </div>
            <div className="text-4xl font-bold text-white">{storedItems}</div>
            <div className="text-sm text-slate-300">Stored Content Items</div>
            <Link to="/storage" className="mt-3 text-xs text-purple-400 hover:text-purple-300 underline">
              View in Storage Explorer
            </Link>
          </Card>
        </div>
        
        <Card className="p-4 bg-slate-800 border-slate-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            Network Visualization
          </h2>
          <div className="h-[500px] relative bg-slate-900 rounded-lg overflow-hidden">
            <NetworkVisualization />
          </div>
          <div className="mt-4 text-sm text-slate-300">
            <p>This is a simulated decentralized network running entirely in your browser using IndexedDB for storage. 
            Data is routed through virtual nodes and stored with content addressing similar to IPFS.</p>
          </div>
        </Card>
        
        {/* Backend Services Visualization */}
        <BackendVisualizer />
      </div>
    </div>
  );
};

export default NetworkPage;

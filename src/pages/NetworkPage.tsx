
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import NetworkVisualization from '@/components/NetworkVisualization';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Activity, Database, Cpu } from 'lucide-react';
import { listAllCIDs } from '@/utils/ipfsStorage';
import { getActiveNodes, NetworkMessage, subscribeToMessages } from '@/utils/decentralizedNetwork';

const NetworkPage = () => {
  const [activeNodes, setActiveNodes] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [storedItems, setStoredItems] = useState(0);

  useEffect(() => {
    // Update node count
    setActiveNodes(getActiveNodes().length);
    
    // Get stored content count
    const updateStorageCount = async () => {
      const cids = await listAllCIDs();
      setStoredItems(cids.length);
    };
    
    updateStorageCount();
    
    // Subscribe to network messages
    const unsubscribe = subscribeToMessages((message: NetworkMessage) => {
      setMessageCount(prev => prev + 1);
      
      if (message.type === 'storage') {
        setTimeout(updateStorageCount, 500);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto py-8">
        <div className="mb-6 flex justify-between items-center">
          <Link to="/">
            <Button variant="ghost" className="text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to App
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">Network Monitoring</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card className="p-6 bg-slate-800 text-white border-slate-700">
            <Cpu className="h-8 w-8 text-accent-blue mb-2" />
            <div className="text-4xl font-bold">{activeNodes}</div>
            <div className="text-sm text-slate-300">Active Nodes</div>
          </Card>
          
          <Card className="p-6 bg-slate-800 text-white border-slate-700">
            <Activity className="h-8 w-8 text-green-400 mb-2" />
            <div className="text-4xl font-bold">{messageCount}</div>
            <div className="text-sm text-slate-300">Messages Processed</div>
          </Card>
          
          <Card className="p-6 bg-slate-800 text-white border-slate-700">
            <Database className="h-8 w-8 text-purple mb-2" />
            <div className="text-4xl font-bold">{storedItems}</div>
            <div className="text-sm text-slate-300">Stored Content Items</div>
          </Card>
        </div>
        
        <Card className="p-4 bg-slate-800 border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Network Visualization</h2>
          <div className="h-[600px] relative bg-slate-900 rounded-lg">
            <NetworkVisualization />
          </div>
          <div className="mt-4 text-sm text-slate-300">
            <p>This is a simulated decentralized network running entirely in your browser using IndexedDB for storage. 
            Data is routed through virtual nodes and stored with content addressing similar to IPFS.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NetworkPage;

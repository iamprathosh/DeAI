
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getActiveNodes, NetworkMessage, subscribeToMessages } from '@/utils/decentralizedNetwork';
import { listAllCIDs } from '@/utils/ipfsStorage';
import { Database, Network, Activity, FileText } from 'lucide-react';

const NetworkStats = () => {
  const [activeNodes, setActiveNodes] = useState<number>(0);
  const [messageCount, setMessageCount] = useState<number>(0);
  const [storedContentCount, setStoredContentCount] = useState<number>(0);
  const [networkActivity, setNetworkActivity] = useState<boolean>(false);
  
  useEffect(() => {
    // Get initial counts
    const nodes = getActiveNodes();
    setActiveNodes(nodes.length);
    
    // Count stored content
    const updateStoredContent = async () => {
      const cids = await listAllCIDs();
      setStoredContentCount(cids.length);
    };
    
    updateStoredContent();
    
    // Subscribe to network messages
    const unsubscribe = subscribeToMessages((message: NetworkMessage) => {
      setMessageCount(prev => prev + 1);
      
      // Flash network activity indicator
      setNetworkActivity(true);
      setTimeout(() => setNetworkActivity(false), 1000);
      
      // Update content count for storage operations
      if (message.type === 'storage') {
        setTimeout(() => {
          updateStoredContent();
        }, 500);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  return (
    <Card className="p-4 bg-white bg-opacity-90 backdrop-blur-sm">
      <h3 className="text-sm font-medium text-slate-700 mb-3">Network Statistics</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-accent-blue" />
          <span className="text-xs text-slate-600">Active Nodes:</span>
          <Badge variant="outline" className="text-xs">{activeNodes}</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Activity className={`h-4 w-4 ${networkActivity ? 'text-green-500' : 'text-slate-400'}`} />
          <span className="text-xs text-slate-600">Messages:</span>
          <Badge variant="outline" className="text-xs">{messageCount}</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-purple" />
          <span className="text-xs text-slate-600">Stored Items:</span>
          <Badge variant="outline" className="text-xs">{storedContentCount}</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-teal" />
          <span className="text-xs text-slate-600">Storage:</span>
          <Badge variant="outline" className="text-xs">Browser DB</Badge>
        </div>
      </div>
    </Card>
  );
};

export default NetworkStats;

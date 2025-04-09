
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getActiveNodes, NetworkMessage, subscribeToMessages, getMessageHistory } from '@/utils/decentralizedNetwork';
import { listAllCIDs, getAllContent } from '@/utils/ipfsStorage';
import { Database, Network, Activity, FileText, HardDrive } from 'lucide-react';

const NetworkStats = () => {
  const [activeNodes, setActiveNodes] = useState<number>(0);
  const [messageCount, setMessageCount] = useState<number>(0);
  const [storedContentCount, setStoredContentCount] = useState<number>(0);
  const [totalStorageSize, setTotalStorageSize] = useState<string>("0 KB");
  const [networkActivity, setNetworkActivity] = useState<boolean>(false);
  
  useEffect(() => {
    // Get initial counts
    const nodes = getActiveNodes();
    setActiveNodes(nodes.length);
    
    // Count stored content and messages
    const updateStats = async () => {
      // Get content stats
      const contents = await getAllContent();
      setStoredContentCount(contents.length);
      
      // Calculate total storage size
      const totalBytes = contents.reduce((total, item) => total + (item.size || 0), 0);
      setTotalStorageSize(formatBytes(totalBytes));
      
      // Get message count
      const messages = await getMessageHistory();
      setMessageCount(messages.length);
    };
    
    updateStats();
    
    // Subscribe to network messages
    const unsubscribe = subscribeToMessages((message: NetworkMessage) => {
      setMessageCount(prev => prev + 1);
      
      // Flash network activity indicator
      setNetworkActivity(true);
      setTimeout(() => setNetworkActivity(false), 1000);
      
      // Update content count for storage operations
      if (message.type === 'storage') {
        setTimeout(() => {
          updateStats();
        }, 500);
      }
    });
    
    // Refresh stats periodically
    const refreshInterval = setInterval(() => {
      updateStats();
    }, 30000); // Every 30 seconds
    
    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);
  
  // Format bytes to human-readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
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
          <HardDrive className="h-4 w-4 text-teal" />
          <span className="text-xs text-slate-600">Storage:</span>
          <Badge variant="outline" className="text-xs">{totalStorageSize}</Badge>
        </div>
      </div>
    </Card>
  );
};

export default NetworkStats;

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { getAllContent, deleteContent } from '@/utils/ipfsStorage';
import { loadNetworkState } from '@/utils/decentralizedNetwork';
import { toast } from "sonner";
import { Database, Trash2, FileText, Code, Image, FileBadge, RefreshCw } from 'lucide-react';
import { formatBytes } from '@/utils/helpers';

interface StorageItem {
  cid: string;
  content: string;
  type: string;
  size: number;
  timestamp: number;
}

const StoragePage = () => {
  const [storedItems, setStoredItems] = useState<StorageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchStorageItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Make sure the network is initialized first
      await loadNetworkState();
      
      const items = await getAllContent();
      setStoredItems(items);
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Failed to load storage items. Database might not be initialized properly.');
      toast.error('Failed to load storage items');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchStorageItems();
  }, []);
  
  const handleDelete = async (cid: string) => {
    try {
      await deleteContent(cid);
      setStoredItems(items => items.filter(item => item.cid !== cid));
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };
  
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'text/plain':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'application/json':
        return <Code className="h-5 w-5 text-purple-500" />;
      case 'image/png':
      case 'image/jpeg':
        return <Image className="h-5 w-5 text-green-500" />;
      default:
        return <FileBadge className="h-5 w-5 text-slate-500" />;
    }
  };
  
  const truncateCID = (cid: string) => {
    return `${cid.substring(0, 6)}...${cid.substring(cid.length - 4)}`;
  };
  
  const truncateContent = (content: string) => {
    return content.length > 40 ? `${content.substring(0, 40)}...` : content;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation />
        <div className="container mx-auto py-16 flex flex-col items-center justify-center">
          <div className="animate-spin mb-4">
            <RefreshCw className="h-10 w-10 text-purple-500" />
          </div>
          <p className="text-slate-800 text-lg">Loading storage data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation />
        <div className="container mx-auto py-16 flex flex-col items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-red-500 text-xl mb-2">Error</h2>
            <p className="text-slate-700 mb-4">{error}</p>
            <Button onClick={fetchStorageItems}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Loading Storage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-6 w-6 text-purple" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-blue via-purple to-teal bg-clip-text text-transparent">Storage Explorer</h1>
          </div>
          <p className="text-slate-600">Browse content items stored in the decentralized IPFS-like storage</p>
          <div className="mt-3">
            <Button variant="outline" onClick={fetchStorageItems} className="text-sm">
              <RefreshCw className="h-3 w-3 mr-2" />
              Refresh Storage Data
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {storedItems.length === 0 ? (
            <Card className="p-6 flex flex-col items-center justify-center h-40 bg-white bg-opacity-70">
              <Database className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-slate-500">No content items stored yet</p>
            </Card>
          ) : (
            storedItems.map((item) => (
              <Card key={item.cid} className="overflow-hidden bg-white bg-opacity-80 backdrop-blur-sm hover:shadow-md transition-shadow">
                <div className="p-4 border-b border-slate-100">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {getFileIcon(item.type)}
                      <h3 className="font-medium text-slate-800">{truncateCID(item.cid)}</h3>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-500"
                      onClick={() => handleDelete(item.cid)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="bg-slate-50 p-3 rounded-md mb-3 max-h-24 overflow-hidden text-slate-600 text-sm">
                    <pre className="whitespace-pre-wrap">{truncateContent(item.content)}</pre>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Type: {item.type}</span>
                    <span>Size: {formatBytes(item.size)}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    Added: {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StoragePage;
import { useState } from 'react';
import { Link } from 'react-router-dom';
import NetworkVisualization from './NetworkVisualization';
import ChatInterface from './ChatInterface';
import NetworkStats from './NetworkStats';
import IPFSVisualizer from './IPFSVisualizer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sun, Star, Database, Lock, Cpu, Network, ChevronRight, Zap } from 'lucide-react';

const DecentralizedAppVisual = () => {
  const [activeNode, setActiveNode] = useState('LLM');
  
  const handleSendMessage = (message: string) => {
    // The actual processing is now handled by the ChatInterface component
    toast.info("Message sent to decentralized network");
  };

  return (
    <div className="relative w-full h-full min-h-[700px] overflow-hidden">
      {/* Background network visualization */}
      <div className="absolute inset-0 z-0 opacity-70">
        <NetworkVisualization />
      </div>
      
      {/* Frosted glass overlay */}
      <div className="absolute inset-0 z-10 bg-white bg-opacity-20 backdrop-blur-sm"></div>
      
      {/* Content */}
      <div className="relative z-20 w-full h-full container flex flex-col items-center justify-center py-8">
        <div className="w-full max-w-5xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent-blue via-purple to-teal bg-clip-text text-transparent">
              Decentralized AI Network
            </h1>
            <p className="mt-2 text-slate-600">
              Powered by browser-based peer-to-peer simulation, LLM processing and IPFS-like storage
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="w-full lg:w-1/2">
              <ChatInterface onSendMessage={handleSendMessage} />
            </div>
            
            <div className="w-full lg:w-1/2 space-y-6">
              <NetworkStats />
              
              <div className="flex flex-col md:flex-row gap-4">
                <Link to="/network" className="flex-1">
                  <Card className="p-5 bg-opacity-90 hover:bg-opacity-100 backdrop-blur-sm hover:shadow-md transition-all flex items-center gap-4 bg-gradient-to-r from-blue-50 to-slate-50">
                    <div className="p-3 rounded-full bg-blue-100">
                      <Network className="h-6 w-6 text-accent-blue" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-800">Network Monitor</h3>
                      <p className="text-sm text-slate-500">View real-time activity and visualization</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </Card>
                </Link>
                
                <Link to="/storage" className="flex-1">
                  <Card className="p-5 bg-opacity-90 hover:bg-opacity-100 backdrop-blur-sm hover:shadow-md transition-all flex items-center gap-4 bg-gradient-to-r from-purple-50 to-slate-50">
                    <div className="p-3 rounded-full bg-purple-100">
                      <Database className="h-6 w-6 text-purple" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-800">Storage Explorer</h3>
                      <p className="text-sm text-slate-500">Browse IPFS-like content storage</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </Card>
                </Link>
              </div>
              
              <Card className="p-4 bg-opacity-80 backdrop-blur-sm bg-gradient-to-r from-slate-50 to-blue-50">
                <h3 className="font-medium text-slate-800 mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent-blue" />
                  About This Demo
                </h3>
                <p className="text-sm text-slate-600">
                  This application simulates a decentralized network with LLM processing and IPFS-style 
                  content addressing, all running in your browser. Ask the AI assistant a question to see 
                  it process through the network and store responses using content-addressed storage.
                </p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-white bg-opacity-50">Simulated P2P</Badge>
                  <Badge variant="outline" className="bg-white bg-opacity-50">LLM Processing</Badge>
                  <Badge variant="outline" className="bg-white bg-opacity-50">IPFS-like Storage</Badge>
                  <Badge variant="outline" className="bg-white bg-opacity-50">IndexedDB Persistence</Badge>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecentralizedAppVisual;

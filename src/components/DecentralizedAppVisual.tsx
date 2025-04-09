import { useState } from 'react';
import NetworkVisualization from './NetworkVisualization';
import ChatInterface from './ChatInterface';
import NetworkStats from './NetworkStats';
import IPFSVisualizer from './IPFSVisualizer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, Star, Database, Lock, Cpu } from 'lucide-react';

const DecentralizedAppVisual = () => {
  const [activeNode, setActiveNode] = useState('LLM');
  
  const handleSendMessage = (message: string) => {
    // The actual processing is now handled by the ChatInterface component
    toast.info("Message sent to decentralized network");
  };

  return (
    <div className="relative w-full h-full min-h-[600px] overflow-hidden">
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
          
          <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
            {/* Left side - Chat interface */}
            <div className="w-full lg:w-1/2">
              <ChatInterface onSendMessage={handleSendMessage} />
              <div className="mt-4">
                <NetworkStats />
              </div>
            </div>
            
            {/* Right side - Network info and visualization */}
            <div className="w-full lg:w-1/2 space-y-4">
              <Card className="p-5 bg-white bg-opacity-90 backdrop-blur-lg shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-lg">Network Status</h3>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-accent-blue" />
                      <span>LLM Node</span>
                    </div>
                    <Badge variant="secondary" className="bg-accent-blue/10 text-accent-blue border-accent-blue/20">
                      Processing
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-purple" />
                      <span>IPFS Storage</span>
                    </div>
                    <Badge variant="secondary" className="bg-purple/10 text-purple border-purple/20">
                      Connected
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-teal" />
                      <span>Encryption</span>
                    </div>
                    <Badge variant="secondary" className="bg-teal/10 text-teal border-teal/20">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-accent-magenta" />
                      <span>Peer Nodes</span>
                    </div>
                    <Badge variant="secondary" className="bg-accent-magenta/10 text-accent-magenta border-accent-magenta/20">
                      Browser-based
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <Sun className="h-5 w-5 text-amber-500" />
                      <span>Network Health</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div key={star} className="w-2 h-2 rounded-full bg-amber-400"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
              
              <Tabs defaultValue="dataflow">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="dataflow">Data Flow</TabsTrigger>
                  <TabsTrigger value="ipfs">IPFS Storage</TabsTrigger>
                </TabsList>
                <TabsContent value="dataflow" className="mt-2">
                  <Card className="p-5 bg-white bg-opacity-75 backdrop-blur-lg shadow-lg overflow-hidden">
                    <h3 className="font-medium text-lg mb-3">Data Flow Visualization</h3>
                    <div className="flex items-center justify-center h-52 relative">
                      <div className="absolute inset-0 flex items-center justify-center opacity-25">
                        <div className="w-24 h-24 rounded-full border-4 border-accent-blue animate-pulse-slow"></div>
                        <div className="absolute w-36 h-36 rounded-full border-2 border-purple animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute w-48 h-48 rounded-full border border-teal animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                      </div>
                      <div className="text-xs text-slate-500 text-center absolute bottom-0">
                        Browser-based simulation of decentralized data flow
                      </div>
                    </div>
                  </Card>
                </TabsContent>
                <TabsContent value="ipfs" className="mt-2">
                  <Card className="p-5 bg-white bg-opacity-75 backdrop-blur-lg shadow-lg overflow-hidden">
                    <h3 className="font-medium text-lg mb-3">IPFS Visualization</h3>
                    <div className="h-52">
                      <IPFSVisualizer className="w-full h-full" />
                    </div>
                    <div className="text-xs text-slate-500 text-center mt-2">
                      Content-addressed storage using IndexedDB
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecentralizedAppVisual;

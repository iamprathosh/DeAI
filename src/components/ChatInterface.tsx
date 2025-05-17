import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { processDeAIQuery, resetDeAIChatHistory } from '@/utils/llmSimulation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  cid?: string;
  processingPath?: string[];
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
}

const ChatInterface = ({ onSendMessage }: ChatInterfaceProps) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "Welcome! I'm a decentralized AI assistant. Ask me anything about Web3, IPFS, or AI technology. You can also try the DeAI assistant mode.", 
      isUser: false, 
      timestamp: new Date() 
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [useDeAI, setUseDeAI] = useState<boolean>(false); // New state for DeAI toggle

  useEffect(() => {
    // Reset DeAI chat history when the component mounts or when switching modes
    resetDeAIChatHistory();
  }, [useDeAI]);


  const handleSend = async () => {
    if (input.trim() === '') return;
    
    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    onSendMessage(input); // This prop might need to be re-evaluated based on its usage
    const currentInput = input;
    setInput('');
    setIsThinking(true);
    
    try {
      let response, responseCid, processingPath;
      let toastTitle = "Decentralized Processing Complete";
      let toastDescription = "";

      if (useDeAI) {
        const deaiResult = await processDeAIQuery(currentInput);
        response = deaiResult.response;
        responseCid = deaiResult.responseCid;
        processingPath = deaiResult.processingPath;
        toastTitle = "DeAI Processing Complete";
        toastDescription = `Processed by DeAI. Response stored at CID: ${responseCid.substring(0, 10)}...`;
      } else {
        const originalResult = await processDeAIQuery(currentInput);
        response = originalResult.response;
        responseCid = originalResult.responseCid;
        processingPath = originalResult.processingPath;
        toastDescription = `Routed through ${processingPath.length} nodes. Response stored at CID: ${responseCid.substring(0, 10)}...`;
      }
      
      const aiMessage: Message = {
        id: messages.length + 2, // Ensure unique ID
        text: response,
        isUser: false,
        timestamp: new Date(),
        cid: responseCid,
        processingPath
      };
      
      setMessages(msgs => [...msgs, aiMessage]);
      
      toast.success(toastTitle, {
        description: toastDescription,
      });

    } catch (error) {
      console.error('Error processing query:', error);
      const mode = useDeAI ? "DeAI assistant" : "decentralized network";
      const errorMessage: Message = {
        id: messages.length + 2, // Ensure unique ID
        text: `Sorry, there was an error processing your request through the ${mode}.`,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(msgs => [...msgs, errorMessage]);
      
      toast.error("Network Error", {
        description: `Failed to process through ${mode}.`,
      });
    } finally {
      setIsThinking(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Card className="flex flex-col bg-white bg-opacity-95 backdrop-blur-lg shadow-lg rounded-xl overflow-hidden w-full max-w-lg h-[500px] border border-slate-200">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Chat Assistant</h2>
        <div className="flex items-center space-x-2">
          <Switch
            id="deai-toggle"
            checked={useDeAI}
            onCheckedChange={() => {
              setUseDeAI(!useDeAI);
              // Optionally, clear messages or add a system message about mode switch
              setMessages(prev => [...prev, {
                id: prev.length + 1,
                text: `Switched to ${!useDeAI ? 'DeAI Assistant' : 'Decentralized Network'} mode.`,
                isUser: false,
                timestamp: new Date(),
                processingPath: ['system']
              }]);
            }}
          />
          <Label htmlFor="deai-toggle" className="text-sm text-slate-600">
            Use DeAI Assistant
          </Label>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${msg.isUser ? 'bg-accent-blue text-white' : 'bg-slate-200 text-slate-800'}`}>
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs mt-1 ${msg.isUser ? 'text-blue-200' : 'text-slate-500'}">
                {msg.timestamp.toLocaleTimeString()}
                {msg.cid && (
                  <span title={`IPFS CID: ${msg.cid} | Path: ${msg.processingPath?.join(' -> ')}`}>
                    {' '}| CID: {msg.cid.substring(0,8)}...
                  </span>
                )}
                {msg.processingPath && !msg.cid && (
                   <span title={`Path: ${msg.processingPath?.join(' -> ')}`}>
                    {' '}| Path: {msg.processingPath.join(' -> ')}
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-3 rounded-lg bg-slate-200 text-slate-800">
              <p className="text-sm italic">Assistant is typing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none"
            disabled={isThinking}
          />
          <Button onClick={handleSend} disabled={isThinking || input.trim() === ''} className="bg-accent-blue hover:bg-accent-blue-dark">
            Send
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;

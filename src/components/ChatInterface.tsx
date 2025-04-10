import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { processQuery } from '@/utils/llmSimulation';
import { toast } from "sonner";
import { getGeminiData, connectToGemini, disconnectFromGemini } from '@/utils/geminiSimulation';

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
      text: "Welcome! I'm a decentralized AI assistant. Ask me anything about Web3, IPFS, or AI technology.", 
      isUser: false, 
      timestamp: new Date() 
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Gemini-specific state variables
  const [geminiStatus, setGeminiStatus] = useState<string>('disconnected');
  const [geminiData, setGeminiData] = useState<string>('');

  const handleSend = async () => {
    if (input.trim() === '') return;
    
    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    onSendMessage(input);
    setInput('');
    setIsThinking(true);
    
    try {
      // Process the query through our simulated backend
      const { response, responseCid, processingPath } = await processQuery(input);
      
      const aiMessage: Message = {
        id: messages.length + 2,
        text: response,
        isUser: false,
        timestamp: new Date(),
        cid: responseCid,
        processingPath
      };
      
      setMessages(msgs => [...msgs, aiMessage]);
      
      // Show notification about the decentralized processing
      toast.success("Decentralized Processing Complete", {
        description: `Routed through ${processingPath.length} nodes. Response stored at CID: ${responseCid.substring(0, 10)}...`,
      });
    } catch (error) {
      console.error('Error processing query:', error);
      
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Sorry, there was an error processing your request through the decentralized network.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(msgs => [...msgs, errorMessage]);
      
      toast.error("Network Error", {
        description: "Failed to process through decentralized network.",
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

  // Gemini-specific event handlers
  const connectToGemini = () => {
    setGeminiStatus('connected');
    setGeminiData('Gemini data loaded');
  };

  const disconnectFromGemini = () => {
    setGeminiStatus('disconnected');
    setGeminiData('');
  };

  return (
    <Card className="flex flex-col bg-white bg-opacity-95 backdrop-blur-lg shadow-lg rounded-xl overflow-hidden w-full max-w-lg h-[500px] border border-slate-200">
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50">
        <h2 className="text-lg font-medium text-slate-800">Decentralized AI Assistant</h2>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-2 w-2 rounded-full bg-accent-blue animate-pulse"></div>
          <span className="text-xs text-slate-500">Connected to the browser-based network</span>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            style={{ animationDelay: `${(message.id - 1) * 0.1}s` }}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isUser 
                  ? 'bg-accent-blue text-white rounded-tr-none' 
                  : 'bg-slate-100 text-slate-800 rounded-tl-none'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              {message.cid && (
                <div className="text-xs mt-1 opacity-70">
                  CID: {message.cid.substring(0, 10)}...
                </div>
              )}
              <div className="text-xs mt-1 opacity-70 text-right">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-3 rounded-lg rounded-tl-none max-w-[80%]">
              <div className="flex space-x-1 items-center">
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <div className="text-xs mt-2 text-slate-500">Processing through decentralized network...</div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSend();
              }
            }}
            className="flex-grow bg-slate-50"
            disabled={isThinking}
          />
          <Button 
            onClick={handleSend} 
            disabled={isThinking || input.trim() === ''}
            size="icon"
            className="bg-accent-blue hover:bg-blue-600 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Gemini-specific controls */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Button onClick={connectToGemini} disabled={geminiStatus === 'connected'}>
            Connect to Gemini
          </Button>
          <Button onClick={disconnectFromGemini} disabled={geminiStatus === 'disconnected'}>
            Disconnect from Gemini
          </Button>
        </div>
        {geminiStatus === 'connected' && (
          <div className="mt-2 text-xs text-slate-500">
            {geminiData}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ChatInterface;

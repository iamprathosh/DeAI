
import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
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
  
  const handleSend = () => {
    if (input.trim() === '') return;
    
    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    onSendMessage(input);
    setInput('');
    setIsThinking(true);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "The decentralized network ensures your data remains private and secure across the network. IPFS technology allows for persistent storage without central servers.",
        "That's an interesting question about LLMs. These models operate across our network to provide accurate and responsive answers while maintaining privacy.",
        "In our decentralized architecture, data flows through encrypted pathways between nodes, with IPFS providing content-addressed storage rather than location-based retrieval.",
        "The advantages of this approach include enhanced privacy, reduced central points of failure, and improved resilience against network outages or censorship.",
      ];
      
      const aiMessage: Message = {
        id: messages.length + 2,
        text: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(msgs => [...msgs, aiMessage]);
      setIsThinking(false);
    }, 2000);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Card className="flex flex-col bg-white bg-opacity-95 backdrop-blur-lg shadow-lg rounded-xl overflow-hidden w-full max-w-lg h-[500px] border border-slate-200">
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50">
        <h2 className="text-lg font-medium text-slate-800">Decentralized AI Assistant</h2>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-2 w-2 rounded-full bg-accent-blue animate-pulse"></div>
          <span className="text-xs text-slate-500">Connected to the network</span>
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
            onKeyPress={handleKeyPress}
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
    </Card>
  );
};

export default ChatInterface;

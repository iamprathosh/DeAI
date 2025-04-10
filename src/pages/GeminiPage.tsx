import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { getGeminiData, connectToGemini, disconnectFromGemini } from '@/utils/geminiSimulation';

const GeminiPage = () => {
  const [geminiStatus, setGeminiStatus] = useState<string>('disconnected');
  const [geminiData, setGeminiData] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (geminiStatus === 'connected') {
      setLoading(true);
      getGeminiData()
        .then(data => setGeminiData(data))
        .catch(error => {
          console.error('Error fetching Gemini data:', error);
          toast.error('Failed to load Gemini data');
        })
        .finally(() => setLoading(false));
    }
  }, [geminiStatus]);

  const handleConnect = () => {
    connectToGemini()
      .then(() => {
        setGeminiStatus('connected');
        toast.success('Connected to Gemini');
      })
      .catch(error => {
        console.error('Error connecting to Gemini:', error);
        toast.error('Failed to connect to Gemini');
      });
  };

  const handleDisconnect = () => {
    disconnectFromGemini()
      .then(() => {
        setGeminiStatus('disconnected');
        setGeminiData('');
        toast.success('Disconnected from Gemini');
      })
      .catch(error => {
        console.error('Error disconnecting from Gemini:', error);
        toast.error('Failed to disconnect from Gemini');
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto py-8">
        <Card className="p-6 bg-white bg-opacity-80 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Gemini Page</h1>
          <div className="flex items-center gap-2 mb-4">
            <Button onClick={handleConnect} disabled={geminiStatus === 'connected'}>
              Connect to Gemini
            </Button>
            <Button onClick={handleDisconnect} disabled={geminiStatus === 'disconnected'}>
              Disconnect from Gemini
            </Button>
          </div>
          {loading ? (
            <p className="text-slate-600">Loading Gemini data...</p>
          ) : (
            <p className="text-slate-600">{geminiData}</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default GeminiPage;

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { checkDatabaseHealth } from '@/utils/databaseManager';

const DatabaseWarning = () => {
  const [dbError, setDbError] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkDb = async () => {
      setChecking(true);
      try {
        const health = await checkDatabaseHealth();
        setDbError(health.status === 'error');
      } catch (error) {
        setDbError(true);
      } finally {
        setChecking(false);
      }
    };
    
    checkDb();
    
    // Check again if user switches tabs, as private browsing status might change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkDb();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (checking || !dbError || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Alert variant="destructive" className="bg-white border-red-200">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Browser Storage Unavailable</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-2">
            This application requires browser storage access (IndexedDB) which may be blocked in private browsing mode
            or by certain browser settings.
          </p>
          <div className="flex gap-2 mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setDismissed(true)}
              className="text-xs"
            >
              Dismiss
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="text-xs"
            >
              Reload Page
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DatabaseWarning;
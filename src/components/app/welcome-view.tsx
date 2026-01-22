import { useState } from 'react';
import { type UseSessionReturn } from '@livekit/components-react';
import { appConfig } from '@/lib/app-config';
import { StartAudioButton } from '@/components/agents-ui/start-audio-button';
import { Button } from '@/components/ui/button';

interface WelcomeViewProps {
  session: UseSessionReturn;
}

export default function WelcomeView({ session }: WelcomeViewProps) {
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setError(null);
    setIsConnecting(true);
    try {
      await session.start();
    } catch (error) {
      console.error('Failed to start session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect. Please check your configuration.';
      setError(errorMessage);
      
      // Check if it's a configuration issue
      if (!appConfig.sandboxId && !appConfig.tokenEndpoint) {
        setError('No token source configured. Please set VITE_SANDBOX_ID or VITE_TOKEN_ENDPOINT in your .env file.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
        {/* Logo Section */}
        {appConfig.logo && (
          <div className="w-24 h-24 mb-4">
            <img
              src={appConfig.logo}
              alt={appConfig.companyName}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Title and Description */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">{appConfig.pageTitle}</h1>
          <p className="text-lg text-slate-300">{appConfig.pageDescription}</p>
        </div>

        {/* Start Button */}
        <div className="w-full space-y-4">
          <Button
            onClick={handleConnect}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            style={{ backgroundColor: appConfig.accent }}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : appConfig.startButtonText}
          </Button>
          
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
              {(!appConfig.sandboxId && !appConfig.tokenEndpoint) && (
                <p className="text-xs text-muted-foreground mt-2">
                  Add VITE_SANDBOX_ID or VITE_TOKEN_ENDPOINT to your .env file
                </p>
              )}
            </div>
          )}
          
          {/* Start Audio Button (for browsers that block autoplay) */}
          <StartAudioButton
            label="Enable Audio"
            size="lg"
            variant="outline"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

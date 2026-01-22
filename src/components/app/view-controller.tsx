import { useRef } from 'react';
import { useSession, SessionProvider } from '@livekit/components-react';
import { TokenSource, TokenSourceConfigurable, type TokenSourceFetchOptions } from 'livekit-client';
import { appConfig } from '@/lib/app-config';
import WelcomeView from './welcome-view';
import SessionView from './session-view';

export default function ViewController() {
  const agentName = appConfig.agentName || '';

  // Create token source based on available configuration
  // Use useRef to keep the same instance across renders
  const tokenSource: TokenSourceConfigurable = useRef(
    (() => {
      if (appConfig.sandboxId) {
        // Use sandbox token server if sandbox ID is provided
        return TokenSource.sandboxTokenServer(appConfig.sandboxId);
      } else if (appConfig.tokenEndpoint) {
        // Use custom token endpoint if provided
        return TokenSource.url(appConfig.tokenEndpoint);
      } else {
        // Fallback: try to use sandbox with a warning
        console.warn('No token source configured. Please set VITE_SANDBOX_ID or VITE_TOKEN_ENDPOINT in your .env file.');
        // This will likely fail, but at least we tried
        return TokenSource.sandboxTokenServer('invalid-sandbox-id');
      }
    })()
  ).current;

  const tokenOptions: TokenSourceFetchOptions = { agentName };

  const session = useSession(tokenSource, tokenOptions);

  // Note: We don't clean up the session in a useEffect because:
  // 1. React Strict Mode causes double renders which would disconnect prematurely
  // 2. The session manages its own lifecycle and will clean up when needed
  // 3. Users can disconnect manually via the disconnect button in SessionView
  // If cleanup on unmount is needed, handle it at the App level or use a ref-based approach

  const isConnected = session.connectionState === 'connected';

  return (
    <SessionProvider session={session}>
      <div className="h-screen w-screen">
        {!isConnected ? (
          <WelcomeView session={session} />
        ) : (
          <SessionView session={session} />
        )}
      </div>
    </SessionProvider>
  );
}

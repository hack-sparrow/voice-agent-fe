import { useState } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
  BarVisualizer,
  useVoiceAssistant,
} from '@livekit/components-react';
import '@livekit/components-styles';

interface VoiceAssistantProps {
  token?: string;
}

const VoiceAssistantContent = () => {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BarVisualizer
          state={state}
          trackRef={audioTrack}
          barCount={15}
          options={{ minHeight: 20, maxHeight: 100 }}
        />
      </div>
      <RoomAudioRenderer />
      <ControlBar />
    </div>
  );
};

const VoiceAssistant = ({ token: initialToken }: VoiceAssistantProps) => {
  const [token, setToken] = useState<string | null>(initialToken || null);
  const [serverUrl, setServerUrl] = useState<string>(
    import.meta.env.VITE_LIVEKIT_URL || ''
  );
  const [status, setStatus] = useState<string>('Ready to connect');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const fetchToken = async () => {
    setIsConnecting(true);
    setStatus('Connecting...');

    try {
      const sandboxId = import.meta.env.VITE_SANDBOX_ID;
      const endpoint = import.meta.env.VITE_TOKEN_ENDPOINT;

      let data;
      if (sandboxId) {
        const res = await fetch(
          'https://cloud-api.livekit.io/api/sandbox/connection-details',
          {
            method: 'POST',
            headers: {
              'X-Sandbox-ID': sandboxId,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ room_name: 'voice-agent-room' }),
          }
        );
        if (!res.ok) throw new Error(`Sandbox fetch failed: ${res.statusText}`);
        data = await res.json();
        // Sandbox returns { participantToken, serverUrl, ... }
        setToken(data.participantToken);
        setServerUrl(data.serverUrl);
      } else if (endpoint) {
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Failed to fetch token');
        data = await res.json();
        setToken(data.accessToken || data.token);
        if (data.url) setServerUrl(data.url);
      } else {
        setStatus('No token configuration found. Check .env');
        setIsConnecting(false);
        return;
      }
      setStatus('Connected');
    } catch (e) {
      setStatus(`Connection failed: ${e instanceof Error ? e.message : String(e)}`);
      console.error(e);
      setIsConnecting(false);
    }
  };

  const handleConnect = () => {
    if (!token && !isConnecting) {
      fetchToken();
    }
  };

  if (token && serverUrl) {
    return (
      <LiveKitRoom
        serverUrl={serverUrl}
        token={token}
        connect={true}
        audio={true}
        video={false}
        style={{ height: '100vh', width: '100%' }}
      >
        <VoiceAssistantContent />
      </LiveKitRoom>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100%',
        gap: '1rem',
      }}
    >
      <h1>Voice Assistant</h1>
      <p>{status}</p>
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: isConnecting ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: isConnecting ? 'not-allowed' : 'pointer',
        }}
      >
        {isConnecting ? 'Connecting...' : 'Connect'}
      </button>
      {status.includes('No token') && (
        <p style={{ fontSize: '0.875rem', color: '#666' }}>
          Check frontend/.env.example
        </p>
      )}
    </div>
  );
};

export default VoiceAssistant;

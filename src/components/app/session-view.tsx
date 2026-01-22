import { useEffect, useState } from 'react';
import { type UseSessionReturn, useRoomContext, useVoiceAssistant, VideoTrack } from '@livekit/components-react';
import { RoomEvent, ParticipantKind } from 'livekit-client';
import { AgentSessionProvider } from '@/components/agents-ui/agent-session-provider';
import { AgentControlBar } from '@/components/agents-ui/agent-control-bar';
import { AgentAudioVisualizerBar } from '@/components/agents-ui/agent-audio-visualizer-bar';
import { AgentChatTranscript } from '@/components/agents-ui/agent-chat-transcript';
import { AgentDisconnectButton } from '@/components/agents-ui/agent-disconnect-button';
import ToolVisualizer from '@/components/custom/ToolVisualizer';
import SummaryView from '@/components/custom/SummaryView';
import { appConfig } from '@/lib/app-config';

interface SessionViewProps {
  session: UseSessionReturn;
}

export default function SessionView({ session }: SessionViewProps) {
  const room = useRoomContext();
  const { state, audioTrack, videoTrack, agent } = useVoiceAssistant();
  const [currentTool, setCurrentTool] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [_agentJoined, setAgentJoined] = useState(false);

  // Log agent state changes
  useEffect(() => {
    if (state) {
      console.log('[Agent Status] Agent state changed:', {
        state,
        hasAudioTrack: !!audioTrack,
        hasVideoTrack: !!videoTrack,
      });
    }
  }, [state, agent, audioTrack, videoTrack]);

  // Check if agent has joined the room and log participant status
  useEffect(() => {
    if (!room) {
      console.log('[Agent Status] Room not available yet');
      return;
    }

    const logParticipantInfo = (participant: any, event: string) => {
      console.log(`[Agent Status] ${event}:`, {
        identity: participant.identity,
        kind: participant.kind,
        sid: participant.sid,
        isAgent: participant.kind === ParticipantKind.AGENT,
        tracks: Array.from(participant.trackPublications.values()).map((t: any) => ({
          sid: t.sid,
          name: t.trackName,
          kind: t.kind,
          source: t.source,
          isMuted: t.isMuted,
          isSubscribed: t.isSubscribed,
        })),
      });
    };

    const checkAgentJoined = () => {
      const remoteParticipants = Array.from(room.remoteParticipants.values());
      const agentParticipants = remoteParticipants.filter(
        (participant) => participant.kind === ParticipantKind.AGENT
      );
      const hasAgent = agentParticipants.length > 0;
      
      console.log('[Agent Status] Remote participants check:', {
        totalRemoteParticipants: remoteParticipants.length,
        agentParticipants: agentParticipants.map((p) => ({
          identity: p.identity,
          sid: p.sid,
          tracks: p.trackPublications.size,
        })),
        hasAgent,
      });

      setAgentJoined(hasAgent);

      if (hasAgent) {
        console.log(`[Agent Status] ✅ AGENT PARTICIPANT(S) FOUND:`, 
          agentParticipants.map((p) => p.identity)
        );
      } else {
        console.log('[Agent Status] ⚠️ No agent participants in room');
      }
    };

    // Log initial room state
    console.log('[Agent Status] Room state:', {
      roomName: room.name,
      roomState: room.state,
      localParticipant: {
        identity: room.localParticipant?.identity,
        sid: room.localParticipant?.sid,
        kind: room.localParticipant?.kind,
      },
      remoteParticipantsCount: room.remoteParticipants.size,
    });

    // Check initially
    checkAgentJoined();

    // Listen for participant connections
    const handleParticipantConnected = (participant: any) => {
      logParticipantInfo(participant, 'Participant connected');
      if (participant.kind === ParticipantKind.AGENT) {
        console.log(`[Agent Status] ✅ AGENT PARTICIPANT JOINED - Identity: ${participant.identity}, SID: ${participant.sid}`);
      }
      checkAgentJoined();
    };

    const handleParticipantDisconnected = (participant: any) => {
      logParticipantInfo(participant, 'Participant disconnected');
      if (participant.kind === ParticipantKind.AGENT) {
        console.log(`[Agent Status] ⚠️ AGENT PARTICIPANT DISCONNECTED - Identity: ${participant.identity}`);
      }
      checkAgentJoined();
    };

    const handleTrackPublished = (publication: any, participant: any) => {
      console.log('[Agent Status] Track published:', {
        participantIdentity: participant.identity,
        participantKind: participant.kind,
        trackSid: publication.sid,
        trackName: publication.trackName,
        trackKind: publication.kind,
        trackSource: publication.source,
        isAgent: participant.kind === ParticipantKind.AGENT,
      });
      if (participant.kind === ParticipantKind.AGENT) {
        console.log(`[Agent Status] ✅ Agent published track: ${publication.trackName} (${publication.kind})`);
      }
    };

    const handleTrackUnpublished = (publication: any, participant: any) => {
      console.log('[Agent Status] Track unpublished:', {
        participantIdentity: participant.identity,
        participantKind: participant.kind,
        trackSid: publication.sid,
        trackName: publication.trackName,
        isAgent: participant.kind === ParticipantKind.AGENT,
      });
    };

    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    room.on(RoomEvent.TrackPublished, handleTrackPublished);
    room.on(RoomEvent.TrackUnpublished, handleTrackUnpublished);

    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
      room.off(RoomEvent.TrackPublished, handleTrackPublished);
      room.off(RoomEvent.TrackUnpublished, handleTrackUnpublished);
    };
  }, [room]);

  // Listen for tool calls and summaries from the agent
  useEffect(() => {
    if (!room) return;

    const onDataReceived = (payload: Uint8Array, _participant: any) => {
      const strData = new TextDecoder().decode(payload);
      try {
        const data = JSON.parse(strData);
        if (data.type === 'tool_call') {
          setCurrentTool({ tool: data.tool, args: data.args });
          // Clear tool visualization after 3 seconds
          setTimeout(() => setCurrentTool(null), 3000);
        } else if (data.type === 'call_summary') {
          setSummary(data.data);
        }
      } catch (e) {
        console.error('Failed to parse data', e);
      }
    };

    room.on(RoomEvent.DataReceived, onDataReceived);

    return () => {
      room.off(RoomEvent.DataReceived, onDataReceived);
    };
  }, [room]);

  return (
    <AgentSessionProvider session={session}>
      <div className="flex flex-col h-full w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Tool Visualizer */}
        <ToolVisualizer currentTool={currentTool} />

        {/* Summary View */}
        {summary && <SummaryView summary={summary} />}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
          {/* Avatar/Video Section */}
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="w-64 h-64 rounded-full border-4 border-purple-500/30 shadow-[0_0_50px_rgba(139,92,246,0.3)] overflow-hidden relative bg-black">
              {videoTrack ? (
                <VideoTrack
                  trackRef={videoTrack}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-indigo-900/20">
                  <div className="w-32 h-32 rounded-full bg-purple-500/50 absolute opacity-50 blur-3xl animate-pulse" />
                  <img
                    src="https://api.dicebear.com/9.x/bottts/svg?seed=Agent"
                    alt="Avatar"
                    className="w-40 h-40 z-10"
                  />
                </div>
              )}
            </div>

            <h1 className="text-2xl font-light tracking-wide text-slate-200">
              {appConfig.companyName}
            </h1>

            <div className="flex flex-col items-center gap-3">
              {/* Room Connection Status */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    room?.state === 'connected' ? 'bg-green-400' : 'bg-yellow-400'
                  }`}
                />
                <span className="text-slate-200">
                  {room?.state === 'connected' ? 'Connected' : 'Connecting...'}
                </span>
              </div>

              {/* Agent State Status */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    audioTrack && videoTrack
                      ? 'bg-green-400'
                      : audioTrack
                      ? state === 'listening' || state === 'speaking' || state === 'thinking'
                        ? 'bg-green-400'
                        : state === 'idle'
                        ? 'bg-blue-400'
                        : state === 'failed'
                        ? 'bg-red-400'
                        : 'bg-yellow-400'
                      : 'bg-yellow-400'
                  }`}
                />
                <span className="text-slate-200">
                  {audioTrack && videoTrack
                    ? 'Agent: Connected'
                    : audioTrack
                    ? `Agent: ${
                        state === 'idle'
                          ? 'Idle'
                          : state === 'listening'
                          ? 'Listening'
                          : state === 'thinking'
                          ? 'Thinking'
                          : state === 'speaking'
                          ? 'Speaking'
                          : state === 'failed'
                          ? 'Error'
                          : state
                          ? state.charAt(0).toUpperCase() + state.slice(1)
                          : 'Ready'
                      }`
                    : 'Agent: Joining...'}
                </span>
              </div>
            </div>
          </div>

          {/* Audio Visualizer */}
          {audioTrack && (
            <div className="w-full max-w-2xl mb-8">
              <AgentAudioVisualizerBar
                audioTrack={audioTrack}
                state={state}
                barCount={15}
                className="h-24"
              />
            </div>
          )}

          {/* Chat Transcript */}
          {appConfig.supportsChatInput && (
            <div className="w-full max-w-2xl mb-8">
              <AgentChatTranscript />
            </div>
          )}
        </div>

        {/* Control Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex-1">
              <AgentControlBar
                controls={{
                  microphone: true,
                  camera: appConfig.supportsVideoInput,
                  screenShare: appConfig.supportsScreenShare,
                }}
              />
            </div>
            <div className="ml-4">
              <AgentDisconnectButton />
            </div>
          </div>
        </div>
      </div>
    </AgentSessionProvider>
  );
}

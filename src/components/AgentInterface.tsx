import React, { useEffect, useState } from 'react';
import { useRoomContext, RoomAudioRenderer } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import ToolVisualizer from './custom/ToolVisualizer';
import SummaryView from './custom/SummaryView';
import './AgentInterface.css';

// RoomInner was the actual content. We now export it as the default component.
const AgentInterface: React.FC = () => {
    const room = useRoomContext();
    const [currentTool, setCurrentTool] = useState<any>(null);
    const [summary, setSummary] = useState<any>(null);

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
                console.error("Failed to parse data", e);
            }
        };

        room.on(RoomEvent.DataReceived, onDataReceived);
        
        return () => {
            room.off(RoomEvent.DataReceived, onDataReceived);
        };
    }, [room]);

    return (
        <div className="agent-container">
            <ToolVisualizer currentTool={currentTool} />
            {summary && <SummaryView summary={summary} />}
            
            <div className="avatar-section">
                {/* Avatar / Video Placeholder */}
                <div className="avatar-wrapper">
                     {/* Render agent video if available, else placeholder */}
                     <div className="avatar-placeholder">
                        <div className="avatar-glow"></div>
                        <img src="https://api.dicebear.com/9.x/bottts/svg?seed=Agent" alt="Avatar" className="avatar-img" />
                     </div>
                </div>
                
                <h1 className="agent-title">
                    Voice Assistant
                </h1>
                
                <div className="status-badge">
                    <div className="status-indicator">
                        <div className={`status-dot ${room.state === 'connected' ? 'connected' : 'connecting'}`} />
                        {room.state === 'connected' ? 'Connected' : 'Connecting...'}
                    </div>
                </div>
            </div>

             {/* Hidden audio handling */}
             <RoomAudioRenderer />
        </div>
    );
}

export default AgentInterface;

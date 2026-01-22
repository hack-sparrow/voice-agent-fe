import React from 'react';
import { motion } from 'framer-motion';
import './SummaryView.css';

interface SummaryViewProps {
  summary: {
    summary: string;
    appointments: any[];
    preferences: string;
    timestamp: string;
  };
}

const SummaryView: React.FC<SummaryViewProps> = ({ summary }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="summary-overlay"
    >
      <div className="summary-card">
        <div className="summary-header">
          <h2 className="summary-title">Call Summary</h2>
          <p className="summary-time">
            {new Date(summary.timestamp).toLocaleString()}
          </p>
        </div>
        
        <div className="summary-content">
          <div>
            <h3 className="section-title">
              Overview
            </h3>
            <p className="section-text">
              {summary.summary}
            </p>
          </div>

          <div>
            <h3 className="section-title">
              Booked Appointments
            </h3>
            {summary.appointments.length > 0 ? (
              <div className="appt-list">
                {summary.appointments.map((appt, i) => (
                  <div key={i} className="appt-item">
                    {appt}
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text">No new appointments booked.</p>
            )}
          </div>

          {summary.preferences && summary.preferences !== "None" && (
             <div>
                <h3 className="section-title">
                  User Preferences
                </h3>
                <p className="pref-box">
                  {summary.preferences}
                </p>
             </div>
          )}
        </div>
        
        <div className="summary-footer">
            <button 
                onClick={() => window.location.reload()}
                className="restart-btn"
            >
                Start New Conversation
            </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SummaryView;

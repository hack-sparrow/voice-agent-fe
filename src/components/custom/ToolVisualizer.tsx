import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ToolVisualizer.css';

interface ToolVisualizerProps {
  currentTool: {
    tool: string;
    args: any;
  } | null;
}

const ToolVisualizer: React.FC<ToolVisualizerProps> = ({ currentTool }) => {
  return (
    <div className="tool-visualizer">
      <AnimatePresence>
        {currentTool && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="tool-card"
          >
            <div className="tool-header">
              <div className="status-dot" />
              <span className="status-text">
                Agent Action
              </span>
            </div>
            
            <h3 className="tool-name">
              {currentTool.tool.replace(/_/g, ' ')}
            </h3>
            
            {Object.keys(currentTool.args).length > 0 && (
              <div className="tool-args">
                {JSON.stringify(currentTool.args, null, 2)}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToolVisualizer;

import React from 'react';

const tools = [
  { name: 'WindowLevel', label: 'W/L', icon: '🌓' },
  { name: 'Length', label: 'Length', icon: '📏' },
  { name: 'Probe', label: 'Probe', icon: '📍' },
  { name: 'RectangleROI', label: 'Rect', icon: '⬜' },
  { name: 'EllipticalROI', label: 'Ellipse', icon: '⭕' },
  { name: 'Bidirectional', label: 'Bidirect', icon: '↔️' },
];

const AnnotationToolbar = ({ activeTool, onToolSelect }) => {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      padding: '10px',
      backgroundColor: '#222',
      borderBottom: '1px solid #444',
      justifyContent: 'center',
      zIndex: 20
    }}>
      {tools.map((tool) => (
        <button
          key={tool.name}
          onClick={() => onToolSelect(tool.name)}
          title={tool.name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            minWidth: '60px',
            border: '1px solid',
            borderColor: activeTool === tool.name ? '#646cff' : 'transparent',
            backgroundColor: activeTool === tool.name ? 'rgba(100, 108, 255, 0.2)' : '#333',
            color: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            fontSize: '11px',
            fontWeight: activeTool === tool.name ? 'bold' : 'normal'
          }}
        >
          <span style={{ fontSize: '18px', marginBottom: '4px' }}>{tool.icon}</span>
          {tool.label}
        </button>
      ))}
    </div>
  );
};

export default AnnotationToolbar;

import React from 'react';

const tools = [
  { name: 'WindowLevel', label: 'W/L' },
  { name: 'Length', label: 'Length' },
  { name: 'Probe', label: 'Probe' },
  { name: 'RectangleROI', label: 'RectangleROI' },
  { name: 'EllipticalROI', label: 'EllipticalROI' },
  { name: 'Bidirectional', label: 'Bidirectional' },
  { name: 'Angle', label: 'Angle' },
  { name: 'CobbAngle', label: 'Cobb Angle' },
  { name: 'CircleROI', label: 'Circle ROI' },
  { name: 'ArrowAnnotate', label: 'ArrowAnnotate' },
  { name: 'PlanarFreehandROI', label: 'PlanarFreehandROI' },
  { name: 'Eraser', label: 'Eraser' },
];

const AnnotationToolbar = ({ activeTool, onToolSelect, onOrientationChange, onSave, onClear }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      padding: '5px 10px',
      backgroundColor: '#f0f0f0',
      borderBottom: '1px solid #ccc',
      color: '#000',
      fontSize: '14px',
      zIndex: 20
    }}>
      <select 
        value={activeTool}
        onChange={(e) => onToolSelect(e.target.value)}
        style={{
          padding: '2px 5px',
          border: '1px solid #767676',
          borderRadius: '2px',
          backgroundColor: 'white',
          fontSize: '14px',
          minWidth: '150px'
        }}
      >
        {tools.map((tool) => (
          <option key={tool.name} value={tool.name}>
            {tool.label}
          </option>
        ))}
      </select>

      <div style={{ display: 'flex', gap: '2px' }}>
        <button 
          onClick={() => onOrientationChange('flipH')}
          style={{ padding: '2px 8px', border: '1px solid #767676', backgroundColor: '#efefef', cursor: 'pointer', borderRadius: '2px' }}
        >
          Flip H
        </button>
        <button 
          onClick={() => onOrientationChange('flipV')}
          style={{ padding: '2px 8px', border: '1px solid #767676', backgroundColor: '#efefef', cursor: 'pointer', borderRadius: '2px' }}
        >
          Flip V
        </button>
        <button 
          onClick={() => onOrientationChange('rotate90')}
          style={{ padding: '2px 8px', border: '1px solid #767676', backgroundColor: '#efefef', cursor: 'pointer', borderRadius: '2px' }}
        >
          Rotate Delta 90
        </button>
        <button 
          onClick={() => onOrientationChange('center')}
          style={{ padding: '2px 8px', border: '1px solid #767676', backgroundColor: '#efefef', cursor: 'pointer', borderRadius: '2px' }}
        >
          Center View
        </button>

        <div style={{ width: '1px', height: '20px', backgroundColor: '#bbb', margin: '0 5px' }} />

        <button 
          onClick={onSave}
          style={{ 
            padding: '2px 12px', 
            border: '1px solid rgb(0, 102, 204)', 
            backgroundColor: 'rgb(0, 120, 215)', 
            color: 'white',
            cursor: 'pointer', 
            borderRadius: '2px',
            fontWeight: 'bold'
          }}
        >
          Save
        </button>

        <button 
          onClick={onClear}
          style={{ 
            padding: '2px 12px', 
            border: '1px solid rgb(204, 51, 0)', 
            backgroundColor: 'rgb(235, 87, 87)', 
            color: 'white',
            cursor: 'pointer', 
            borderRadius: '2px',
            fontWeight: 'bold'
          }}
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default AnnotationToolbar;

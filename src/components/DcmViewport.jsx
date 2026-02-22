import React, { useRef, useEffect, useState } from 'react';
import { Enums as csEnums } from '@cornerstonejs/core';
import { useCornerstone } from '../hooks/useCornerstone';
import { dicomService } from '../services/dicomService';
import AnnotationToolbar from './AnnotationToolbar';
import { Enums as csToolsEnums } from '@cornerstonejs/tools';
import { setupToolGroup } from '../config/cornerstoneConfig';

/**
 * DcmViewport Component
 * @param {Object} props
 * @param {Array} props.dcmFiles - Array of { name, url }
 * @param {string} props.id - Unique ID for the viewport
 */
const DcmViewport = ({ dcmFiles = [], id = 'default-viewport' }) => {
  const elementRef = useRef(null);
  const { isInitialized, renderingEngine } = useCornerstone(elementRef, id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTool, setActiveTool] = useState('WindowLevel');
  const hasCenteredRef = useRef(false);

  useEffect(() => {
    if (!isInitialized || !renderingEngine || dcmFiles.length === 0) return;

    const element = elementRef.current;
    if (!element) return;

    async function loadImages() {
      const imageIds = dcmFiles.map(file => dicomService.getCornerstoneImageId(file.url));
      const viewport = renderingEngine.getViewport(id);
      if (!viewport) return;

      try {
        await viewport.setStack(imageIds);
        
        // Wait for the first image to render before centering
        const onImageRendered = () => {
          if (!hasCenteredRef.current) {
            renderingEngine.resize();
            viewport.resetCamera();
            viewport.render();
            hasCenteredRef.current = true;
          }
        };

        element.addEventListener(csEnums.Events.IMAGE_RENDERED, onImageRendered);
        
        // As a fallback, trigger centering after a delay
        setTimeout(() => {
          if (!hasCenteredRef.current) {
            renderingEngine.resize();
            viewport.resetCamera();
            viewport.render();
            hasCenteredRef.current = true;
          }
        }, 300);

      } catch (err) {
        console.error('DcmViewport LOAD ERROR:', err);
      }
    }

    loadImages();

    // Resize handling: ensure viewport canvas matches container size
    const resizeObserver = new ResizeObserver(() => {
      if (renderingEngine) {
        renderingEngine.resize();
        const viewport = renderingEngine.getViewport(id);
        if (viewport) {
          viewport.render();
        }
      }
    });
    resizeObserver.observe(element);

    const handleImageChange = (evt) => {
      // In 1.x, the property is imageIdIndex
      const { imageIdIndex } = evt.detail;
      if (typeof imageIdIndex === 'number') {
        setCurrentIndex(imageIdIndex);
      }
    };

    element.addEventListener(csEnums.Events.STACK_NEW_IMAGE, handleImageChange);

    return () => {
      resizeObserver.disconnect();
      element.removeEventListener(csEnums.Events.STACK_NEW_IMAGE, handleImageChange);
    };
  }, [isInitialized, renderingEngine, dcmFiles, id]);

  const navigate = (direction) => {
    const viewport = renderingEngine?.getViewport(id);
    if (!viewport) return;

    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < dcmFiles.length) {
      viewport.setImageIdIndex(newIndex);
      setCurrentIndex(newIndex);
    }
  };

  const handleToolSelect = (toolName) => {
    // 1. Get the tool group
    const toolGroupInstance = setupToolGroup();
    if (!toolGroupInstance) return;

    // Ensure this viewport is still in the tool group (safeguard)
    if (!toolGroupInstance.getViewportIds().includes(id)) {
      toolGroupInstance.addViewport(id, renderingEngine.id);
    }

    // 2. Define our tools
    const annotationTools = ['Length', 'Probe', 'RectangleROI', 'EllipticalROI', 'Bidirectional'];
    const primaryTools = ['WindowLevel', ...annotationTools];

    // 3. Set all primary-compatible tools to Passive
    // This clears any existing Primary mouse button bindings
    primaryTools.forEach(t => {
      toolGroupInstance.setToolPassive(t);
    });

    // 4. Set the selected tool as Active on the Primary mouse button
    toolGroupInstance.setToolActive(toolName, {
      bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
    });

    // 5. Ensure Zoom and Pan remain on their respective buttons
    // (In case they were inadvertently changed or to be safe)
    toolGroupInstance.setToolActive('Zoom', {
      bindings: [{ mouseButton: csToolsEnums.MouseBindings.Secondary }],
    });
    toolGroupInstance.setToolActive('Pan', {
      bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary }],
    });

    // 6. Mandatory for v1.x: Update React state and trigger render
    setActiveTool(toolName);
    
    // Force a render cycle to ensure tool state is reflected
    setTimeout(() => {
      if (renderingEngine) {
        const viewport = renderingEngine.getViewport(id);
        if (viewport) {
          viewport.render();
          renderingEngine.renderViewports([id]);
        }
      }
    }, 50);
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      backgroundColor: '#000', 
      borderRadius: '8px', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      <AnnotationToolbar activeTool={activeTool} onToolSelect={handleToolSelect} />
      
      <div
        ref={elementRef}
        style={{ 
          flex: 1, 
          width: '100%', 
          minHeight: '0', 
          position: 'relative', 
          cursor: activeTool === 'WindowLevel' ? 'default' : 'crosshair',
          // Subtle border to see the interaction area
          border: '1px solid rgba(255,255,255,0.05)'
        }}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Navigation Overlay */}
      {dcmFiles.length > 1 && (
        <>
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: '12px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            zIndex: 10
          }}>
            <button 
              onClick={() => navigate(-1)}
              disabled={currentIndex === 0}
              style={{
                background: 'none',
                border: 'none',
                color: currentIndex === 0 ? '#555' : 'white',
                cursor: currentIndex === 0 ? 'default' : 'pointer',
                fontSize: '20px',
                padding: '0 10px'
              }}
            >
              ◀
            </button>
            <span style={{ color: 'white', fontSize: '14px', minWidth: '60px', textAlign: 'center' }}>
              {currentIndex + 1} / {dcmFiles.length}
            </span>
            <button 
              onClick={() => navigate(1)}
              disabled={currentIndex === dcmFiles.length - 1}
              style={{
                background: 'none',
                border: 'none',
                color: currentIndex === dcmFiles.length - 1 ? '#555' : 'white',
                cursor: currentIndex === dcmFiles.length - 1 ? 'default' : 'pointer',
                fontSize: '20px',
                padding: '0 10px'
              }}
            >
              ▶
            </button>
          </div>

          <div style={{
            padding: '5px 12px',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '11px',
            textAlign: 'center',
            backgroundColor: '#000'
          }}>
            Tip: Use Mouse Wheel to scroll images
          </div>
        </>
      )}
    </div>
  );
};

export default DcmViewport;

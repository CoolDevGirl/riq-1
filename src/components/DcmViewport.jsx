import React, { useRef, useEffect, useState } from 'react';
import { Enums as csEnums } from '@cornerstonejs/core';
import { useCornerstone } from '../hooks/useCornerstone';
import { dicomService } from '../services/dicomService';
import AnnotationToolbar from './AnnotationToolbar';
import * as cornerstoneTools from '@cornerstonejs/tools';
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
        
        // Robust Centering & Resizing Logic
        const centerImage = () => {
          if (!renderingEngine || !viewport || !elementRef.current) return;
          
          window.requestAnimationFrame(() => {
            renderingEngine.resize();
            viewport.resetCamera();
            viewport.render();
            console.log(`[Cornerstone] Centering: ${elementRef.current.clientWidth}x${elementRef.current.clientHeight}`);
          });
          hasCenteredRef.current = true;
        };

        const onImageRendered = () => {
          if (!hasCenteredRef.current) {
            centerImage();
          }
        };

        element.addEventListener(csEnums.Events.IMAGE_RENDERED, onImageRendered);
        
        // Multiple fallback triggers to ensure stability as layout settles
        setTimeout(centerImage, 50);
        setTimeout(centerImage, 250);
        setTimeout(centerImage, 750);
        setTimeout(centerImage, 1500);

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

    // 2. Define our tools supported by our dropdown
    const annotationTools = [
      'Length', 'Probe', 'RectangleROI', 'EllipticalROI', 'CircleROI',
      'Bidirectional', 'Angle', 'CobbAngle', 'ArrowAnnotate', 
      'PlanarFreehandROI', 'Eraser'
    ];
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

  const handleSaveAnnotations = () => {
    const element = elementRef.current;
    if (!element) return;

    // List of annotation tools to collect data from
    const annotationTools = [
      'Length', 'Probe', 'RectangleROI', 'EllipticalROI', 'CircleROI',
      'Bidirectional', 'Angle', 'CobbAngle', 'ArrowAnnotate', 
      'PlanarFreehandROI'
    ];

    const allAnnotations = {};

    annotationTools.forEach(toolName => {
      // annotation.state.getAnnotations(toolName, element) is the standard 1.x way
      const toolAnnotations = setupToolGroup()._toolInstances[toolName] 
        ? cornerstoneTools.annotation.state.getAnnotations(toolName, element)
        : [];
        
      if (toolAnnotations && toolAnnotations.length > 0) {
        allAnnotations[toolName] = toolAnnotations;
      }
    });

    if (Object.keys(allAnnotations).length === 0) {
      alert('No annotations found to save.');
      return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allAnnotations, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `annotations_${id}_${new Date().getTime()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    console.log('[Cornerstone] Annotations exported successfully');
  };

  const handleClearAnnotations = () => {
    if (window.confirm('Are you sure you want to clear all annotations?')) {
      cornerstoneTools.annotation.state.removeAllAnnotations();
      
      // Force render to clear visuals
      if (renderingEngine) {
        const viewport = renderingEngine.getViewport(id);
        if (viewport) {
          viewport.render();
          renderingEngine.renderViewports([id]);
        }
      }
      console.log('[Cornerstone] All annotations cleared');
    }
  };

  const handleOrientationChange = (type) => {
    const viewport = renderingEngine?.getViewport(id);
    if (!viewport) return;

    if (type === 'flipH') {
      const camera = viewport.getCamera();
      viewport.setCamera({ flipHorizontal: !camera.flipHorizontal });
    } else if (type === 'flipV') {
      const camera = viewport.getCamera();
      viewport.setCamera({ flipVertical: !camera.flipVertical });
    } else if (type === 'rotate90') {
      const camera = viewport.getCamera();
      viewport.setCamera({ rotation: (camera.rotation || 0) + 90 });
    } else if (type === 'center') {
      renderingEngine.resize();
      viewport.resetCamera();
      viewport.render();
      console.log('[Cornerstone] Viewport Manual Reset');
    }
    
    viewport.render();
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
      position: 'relative',
      minWidth: '0'
    }}>
      <AnnotationToolbar 
        activeTool={activeTool} 
        onToolSelect={handleToolSelect} 
        onOrientationChange={handleOrientationChange}
        onSave={handleSaveAnnotations}
        onClear={handleClearAnnotations}
      />
      
      <div
        ref={elementRef}
        style={{ 
          flex: 1, 
          width: '100%', 
          minHeight: '0', 
          minWidth: '0',
          position: 'relative', 
          cursor: activeTool === 'WindowLevel' ? 'default' : 'crosshair',
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

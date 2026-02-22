import { useEffect, useRef, useState } from 'react';
import {
  RenderingEngine,
  Enums,
  getRenderingEngine,
} from '@cornerstonejs/core';
import { ToolGroupManager } from '@cornerstonejs/tools';
import {
  initCornerstone,
  setupToolGroup,
  TOOL_GROUP_ID,
} from '../config/cornerstoneConfig';

const RENDERING_ENGINE_ID = 'MY_RENDERING_ENGINE';

export function useCornerstone(elementRef, viewportId) {
  const [isInitialized, setIsInitialized] = useState(false);
  const renderingEngineRef = useRef(null);

  useEffect(() => {
    async function setup() {
      if (!elementRef.current) return;

      await initCornerstone();

      let renderingEngine = getRenderingEngine(RENDERING_ENGINE_ID);
      if (!renderingEngine) {
        renderingEngine = new RenderingEngine(RENDERING_ENGINE_ID);
      }
      renderingEngineRef.current = renderingEngine;

      const viewportInput = {
        viewportId,
        type: Enums.ViewportType.STACK,
        element: elementRef.current,
        defaultOptions: {
          background: [0, 0, 0],
        },
      };

      renderingEngine.enableElement(viewportInput);
      renderingEngine.resize();
      
      // Setup tools
      const toolGroup = setupToolGroup();
      if (!toolGroup.getViewportIds().includes(viewportId)) {
        toolGroup.addViewport(viewportId, RENDERING_ENGINE_ID);
      }

      setIsInitialized(true);
    }

    setup();

    return () => {
      if (renderingEngineRef.current) {
        try {
          renderingEngineRef.current.disableElement(viewportId);
          
        // Cleanup tool group registration
        const toolGroup = ToolGroupManager.getToolGroup(TOOL_GROUP_ID);
        if (toolGroup && toolGroup.removeViewports) {
          toolGroup.removeViewports(RENDERING_ENGINE_ID, viewportId);
        }
        } catch (err) {
          console.warn('Cornerstone cleanup warning:', err);
        }
      }
    };
  }, [elementRef, viewportId]);

  return { isInitialized, renderingEngine: renderingEngineRef.current };
}

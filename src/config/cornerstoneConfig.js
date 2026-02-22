import {
  init as csRenderInit,
  metaData,
  imageLoader,
  registerImageLoader,
} from '@cornerstonejs/core';
import * as cornerstone from '@cornerstonejs/core';
import {
  init as csToolsInit,
  addTool,
  WindowLevelTool,
  ZoomTool,
  PanTool,
  StackScrollTool,
  LengthTool,
  ProbeTool,
  RectangleROITool,
  EllipticalROITool,
  BidirectionalTool,
  AngleTool,
  ArrowAnnotateTool,
  EraserTool,
  PlanarFreehandROITool,
  ToolGroupManager,
  Enums as csToolsEnums,
  annotation,
} from '@cornerstonejs/tools';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
import * as dicomParser from 'dicom-parser';

let initPromise = null;

export async function initCornerstone() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Initialize Core
    await csRenderInit();

    // Initialize Tools
    await csToolsInit();

    // Initialize Image Loader
    // In 1.x, we MUST set external dependencies
    cornerstoneDICOMImageLoader.external.cornerstone = cornerstone;
    cornerstoneDICOMImageLoader.external.dicomParser = dicomParser;
    
    cornerstoneDICOMImageLoader.configure({
      useWebWorkers: false, // More stable for debugging
    });

    // Explicitly register loaders
    registerImageLoader('wadouri', cornerstoneDICOMImageLoader.wadouri.loadImage);
    registerImageLoader('wadors', cornerstoneDICOMImageLoader.wadors.loadImage);

    // Register metadata provider
    metaData.addProvider(
      cornerstoneDICOMImageLoader.wadouri.metaData.metaDataProvider
    );
    metaData.addProvider(
      cornerstoneDICOMImageLoader.wadors.metaData.metaDataProvider
    );

    // Setup Tools
    addTool(WindowLevelTool);
    addTool(ZoomTool);
    addTool(PanTool);
    addTool(StackScrollTool);
    addTool(LengthTool);
    addTool(ProbeTool);
    addTool(RectangleROITool);
    addTool(EllipticalROITool);
    addTool(BidirectionalTool);
    addTool(AngleTool);
    addTool(ArrowAnnotateTool);
    addTool(EraserTool);
    addTool(PlanarFreehandROITool);

    // Set global annotation styles (Yellow for visibility)
    annotation.config.style.setDefaultToolStyles({
      global: {
        color: 'rgb(255, 255, 0)',
        lineWidth: '2',
      },
    });

    console.log('Cornerstone3D 1.70.3 Initialized');
  })();

  return initPromise;
}

export const TOOL_GROUP_ID = 'MY_TOOL_GROUP';

export function setupToolGroup() {
  let toolGroup = ToolGroupManager.getToolGroup(TOOL_GROUP_ID);

  if (!toolGroup) {
    toolGroup = ToolGroupManager.createToolGroup(TOOL_GROUP_ID);

    toolGroup.addTool(WindowLevelTool.toolName);
    toolGroup.addTool(ZoomTool.toolName);
    toolGroup.addTool(PanTool.toolName);
    toolGroup.addTool(StackScrollTool.toolName);
    toolGroup.addTool(LengthTool.toolName);
    toolGroup.addTool(ProbeTool.toolName);
    toolGroup.addTool(RectangleROITool.toolName);
    toolGroup.addTool(EllipticalROITool.toolName);
    toolGroup.addTool(BidirectionalTool.toolName);
    toolGroup.addTool(AngleTool.toolName);
    toolGroup.addTool(ArrowAnnotateTool.toolName);
    toolGroup.addTool(EraserTool.toolName);
    toolGroup.addTool(PlanarFreehandROITool.toolName);

    toolGroup.setToolActive(WindowLevelTool.toolName, {
      bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
    });
    toolGroup.setToolActive(ZoomTool.toolName, {
      bindings: [{ mouseButton: csToolsEnums.MouseBindings.Secondary }],
    });
    toolGroup.setToolActive(PanTool.toolName, {
      bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary }],
    });
    toolGroup.setToolActive(StackScrollTool.toolName);

    // Set annotation tools to passive by default
    toolGroup.setToolPassive(LengthTool.toolName);
    toolGroup.setToolPassive(ProbeTool.toolName);
    toolGroup.setToolPassive(RectangleROITool.toolName);
    toolGroup.setToolPassive(EllipticalROITool.toolName);
    toolGroup.setToolPassive(BidirectionalTool.toolName);
    toolGroup.setToolPassive(AngleTool.toolName);
    toolGroup.setToolPassive(ArrowAnnotateTool.toolName);
    toolGroup.setToolPassive(EraserTool.toolName);
    toolGroup.setToolPassive(PlanarFreehandROITool.toolName);
  }

  return toolGroup;
}

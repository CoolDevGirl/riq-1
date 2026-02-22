import {
  init as csRenderInit,
  metaData,
  imageLoader,
  registerImageLoader,
  Settings,
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
  CobbAngleTool,
  CircleROITool,
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
    addTool(CobbAngleTool);
    addTool(CircleROITool);

    // Set global annotation styles (Green for high visibility)
    annotation.config.style.setDefaultToolStyles({
      global: {
        color: 'rgb(0, 255, 0)',
        lineWidth: '2',
        textBoxVisibility: true,
        textBoxColor: 'rgb(0, 255, 0)',
        textBoxFontSize: '14px',
        textBoxBackground: 'rgba(0, 0, 0, 0.4)',
        textBoxPadding: '4',
        shadow: true,
      },
    });

    // Prevent drawing outside the image bounds globally
    // This affects annotation tools like Length, Angle, etc.
    Settings.getRuntimeSettings().set('preventHandleOutsideImage', true);

    console.log('Cornerstone3D 1.70.3 Initialized');
  })();

  return initPromise;
}

export const TOOL_GROUP_ID = 'MY_TOOL_GROUP';

export function setupToolGroup() {
  let toolGroup = ToolGroupManager.getToolGroup(TOOL_GROUP_ID);
  const isNew = !toolGroup;

  if (isNew) {
    toolGroup = ToolGroupManager.createToolGroup(TOOL_GROUP_ID);
  }

  const desiredTools = [
    { name: WindowLevelTool.toolName, tool: WindowLevelTool },
    { name: ZoomTool.toolName, tool: ZoomTool },
    { name: PanTool.toolName, tool: PanTool },
    { name: StackScrollTool.toolName, tool: StackScrollTool },
    { name: LengthTool.toolName, tool: LengthTool },
    { name: ProbeTool.toolName, tool: ProbeTool },
    { name: RectangleROITool.toolName, tool: RectangleROITool },
    { name: EllipticalROITool.toolName, tool: EllipticalROITool },
    { name: BidirectionalTool.toolName, tool: BidirectionalTool },
    { name: AngleTool.toolName, tool: AngleTool },
    { name: ArrowAnnotateTool.toolName, tool: ArrowAnnotateTool },
    { name: EraserTool.toolName, tool: EraserTool },
    { name: PlanarFreehandROITool.toolName, tool: PlanarFreehandROITool },
    { name: CobbAngleTool.toolName, tool: CobbAngleTool },
    { name: CircleROITool.toolName, tool: CircleROITool },
  ];

  desiredTools.forEach(({ name, tool }) => {
    // Check silently if the tool is already added to the tool group
    // In 1.x, ToolGroup has a _toolInstances map. Using it directly avoids getToolInstance warning.
    const isToolAdded = !!toolGroup._toolInstances[name];

    if (!isToolAdded) {
      try {
        // Double-check if registered with library globally first
        // If not registered globally, add it here as a safeguard
        toolGroup.addTool(name, {
          preventHandleOutsideImage: true,
        });
        toolGroup.setToolPassive(name);
      } catch (e) {
        console.warn(`[Cornerstone] Warning: Could not register ${name} to ToolGroup.`, e);
      }
    }
  });

  if (isNew) {
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
  }

  return toolGroup;
}

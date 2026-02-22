# Professional DICOM Viewer with Cornerstone3D

A modern, high-performance medical image viewer built with React and Cornerstone3D. This viewer supports advanced annotation tools, image orientation manipulation, and measurement export.

## 🚀 Features

- **Advanced Annotations**: Includes Length, Angle, Cobb Angle, Rectangle/Elliptical/Circle ROI, Arrow Annotate, and more.
- **Image Orientation**: Flip Horizontal, Flip Vertical, and 90-degree Rotation.
- **Strict Boundaries**: Prevents drawing measurements outside the medical image bounds.
- **Measurement Export**: Save all drawn annotations as a structured JSON file with a single click.
- **Dynamic Loading**: Supports stack scrolling and navigation for multi-slice DICOM series.
- **Professional UI**: Streamlined dropdown toolbar with high-visibility (Green) annotation styles.

## 🛠️ Tech Stack & Dependencies

This project uses **Cornerstone3D v1.x (Stable)** for broad compatibility and performance.

### Core Packages
| Package | Version | Description |
| :--- | :--- | :--- |
| `@cornerstonejs/core` | `1.70.3` | Rendering Engine for DICOM imaging |
| `@cornerstonejs/tools` | `1.70.3` | Annotation and interaction tool library |
| `@cornerstonejs/dicom-image-loader` | `1.70.3` | DICOM parsing and loading services |
| `dicom-parser` | `^1.8.21` | Low-level DICOM parsing dependency |
| `react` | `^19.2.0` | Frontend framework |
| `vite` | `^8.0.0-beta.13` | Modern build tool and dev server |
| `hammerjs` | `^2.0.8` | Touch and gesture support |

## ⚙️ Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## 📖 Usage Instructions

1. **Tool Selection**: Use the dropdown menu at the top to select measurement tools (e.g., Length, Cobb Angle).
2. **Drawing**: Click and drag on the image to place annotations. Measurement digits will appear in green.
3. **Orientation**: Use the Flip/Rotate buttons to adjust the view.
4. **Saving**: Click the blue **Save** button to download a JSON file of your current measurements.

---
*Developed for professional DICOM visualization and analysis.*

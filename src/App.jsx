import React, { useState, useEffect } from 'react';
import './App.css';
import DcmViewport from './components/DcmViewport';
import { dicomService } from './services/dicomService';

function App() {
  const [dcmFiles, setDcmFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getImages() {
      setLoading(true);
      // Fetching from your local Orthanc server
      const images = await dicomService.fetchOrthancInstances('http://localhost:8042');
      setDcmFiles(images);
      setLoading(false);
    }

    getImages();
  }, []);

  return (
    <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#1a1a1a', color: 'white' }}>
      <header style={{ padding: '20px', textAlign: 'center' }}>
        <h1>DICOM Viewer Demo</h1>
        <p>Dynamic DICOM loading with Cornerstone3D</p>
      </header>
      
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '800px', height: '600px', border: '2px solid #333', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', position: 'relative' }}>
          {loading ? (
            <div style={{ color: 'white', textAlign: 'center', marginTop: '45%' }}>Loading DICOM files from Orthanc...</div>
          ) : dcmFiles.length > 0 ? (
            <DcmViewport dcmFiles={dcmFiles} id="main-viewport" />
          ) : (
            <div style={{ color: '#888', textAlign: 'center', marginTop: '45%' }}>
              No DICOM files found at http://localhost:8042.<br/>
              Ensure Orthanc is running and CORS is enabled.
            </div>
          )}
        </div>
      </main>

      <footer style={{ padding: '10px', textAlign: 'center', fontSize: '0.8rem', color: '#888' }}>
        Use Left Mouse for Window/Level, Right Mouse for Zoom, Middle Mouse for Pan
      </footer>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Hämta lista på filer när komponenten laddas
    fetchFiles();

    // Sätt upp WebSocket-anslutning för realtidsuppdateringar
    const ws = new WebSocket('ws://localhost:3001');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'fileProcessed') {
        setStatus(`Fil bearbetad: ${data.filename}`);
        fetchFiles();
      }
    };

    return () => ws.close();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:3001/files');
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      setStatus('Kunde inte hämta filer');
    }
  };

  return (
    <div className="App">
      <h1>Magic Folder</h1>
      <div className="status">{status}</div>
      <div className="files-container">
        <h2>Cleaned Files:</h2>
        <ul>
          {files.map((file, index) => (
            <li key={index}>
              <span className="filename">{file.name}</span>
              <span className="timestamp">{new Date(file.processedAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App; 
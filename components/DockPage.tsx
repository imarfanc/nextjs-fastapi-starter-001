import React, { useEffect, useState } from 'react';
import Head from 'next/head';

export default function DockPage() {
  const [folderStructure, setFolderStructure] = useState({});
  const [lastUsedApp, setLastUsedApp] = useState('None');

  useEffect(() => {
    // Load the JavaScript files
    const script1 = document.createElement('script');
    script1.src = '/static/app.js';
    script1.async = true;
    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = '/static/settings.js';
    script2.async = true;
    document.body.appendChild(script2);

    // Clean up
    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Dock - Folder Organizer</title>
        <link rel="stylesheet" href="/static/styles.css" />
      </Head>
      <div id="app">
        <div id="top-buttons">
          <button id="settingsButton">⚙️</button>
          <button id="use-last-folder">🔄</button>
        </div>
        <h1>Folder Organizer</h1>
        <div id="last-used-app">Last used app: {lastUsedApp}</div>
        <div id="folder-structure"></div>
      </div>
      <div id="status-bar"></div>
      <div id="settingsPopover" className="settings-popover">
        <h3>Settings</h3>
        <div id="folder-select">
          <input type="text" id="folder-path" placeholder="Enter folder path" />
          <button onClick={() => processFolder()}>Process Folder</button>
        </div>
        <div id="python-interpreter">
          <input type="text" id="python-path" placeholder="Enter Python interpreter path" />
          <button onClick={() => setPythonInterpreter()}>Set Python Path</button>
        </div>
        <button onClick={() => changeBackground()}>Change Background</button>
        <button onClick={() => changeFont()}>Change Font</button>
        <button onClick={() => increaseFontSize()}>Increase Font Size</button>
        <button onClick={() => decreaseFontSize()}>Decrease Font Size</button>
      </div>
    </>
  );
}

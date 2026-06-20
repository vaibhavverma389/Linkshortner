import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ShortenerForm from './components/ShortenerForm';
import Dashboard from './components/Dashboard';

function App() {
  const [links, setLinks] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [redirectPath, setRedirectPath] = useState(null);

  // Check if pathname contains a short slug to redirect
  useEffect(() => {
    const path = window.location.pathname;
    if (path && path !== '/') {
      const code = path.substring(1);
      setRedirectPath(code);
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      setTimeout(() => {
        window.location.replace(`${apiBase}/${code}`);
      }, 1000);
    }
  }, []);

  // Toast Notification helper
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Sync links clicks and status from database
  const syncLinks = async (codesToSync) => {
    const codes = codesToSync || JSON.parse(localStorage.getItem('shortened_links') || '[]');
    if (codes.length === 0) return;

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/urls/stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codes }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      
      // Sort links by creation date descending
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setLinks(sortedData);
    } catch (error) {
      console.error('Failed to sync links:', error);
      throw error;
    }
  };

  // Load links on mount
  useEffect(() => {
    syncLinks().catch(() => {
      // Quietly ignore backend offline on initial load
    });
  }, []);

  // Callback when a new link is successfully shortened
  const handleLinkShortened = (newLink) => {
    // Add to state
    setLinks((prev) => [newLink, ...prev]);

    // Save code to localStorage
    const storedCodes = JSON.parse(localStorage.getItem('shortened_links') || '[]');
    if (!storedCodes.includes(newLink.shortCode)) {
      storedCodes.push(newLink.shortCode);
      localStorage.setItem('shortened_links', JSON.stringify(storedCodes));
    }
  };

  // Delete link from local history list
  const handleDeleteLink = (shortCode) => {
    // Filter out from local state
    setLinks((prev) => prev.filter((link) => link.shortCode !== shortCode));

    // Remove from localStorage
    const storedCodes = JSON.parse(localStorage.getItem('shortened_links') || '[]');
    const updatedCodes = storedCodes.filter((code) => code !== shortCode);
    localStorage.setItem('shortened_links', JSON.stringify(updatedCodes));
    
    addToast('Link removed from history', 'success');
  };

  if (redirectPath) {
    return (
      <>
        <div className="glow-blob-1"></div>
        <div className="glow-blob-2"></div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px' }}>
          <div className="glass-panel-glow" style={{ padding: '48px', textAlign: 'center', maxWidth: '450px', width: '100%' }}>
            <div className="float-animation" style={{ fontSize: '3rem', marginBottom: '24px' }}>🚀</div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '12px', fontWeight: 600 }}>Redirecting you...</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Hold tight! We are routing you to your destination.
            </p>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
              <div className="badge">lnk.sh/{redirectPath}</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="glow-blob-1"></div>
      <div className="glow-blob-2"></div>
      
      <Navbar />

      <main className="container">
        <ShortenerForm onSuccess={handleLinkShortened} addToast={addToast} />
        
        <Dashboard 
          links={links} 
          onDeleteLink={handleDeleteLink} 
          onRefresh={syncLinks} 
          addToast={addToast} 
        />
      </main>

      {/* Global Glassmorphic Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span style={{ fontSize: '1.2rem' }}>
              {toast.type === 'success' ? '✨' : '⚠️'}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;

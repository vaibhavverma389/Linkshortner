import React, { useEffect, useState } from 'react';
import LinkCard from './LinkCard';
import { BarChart2, Link, TrendingUp, RefreshCw, Layers } from 'lucide-react';

const Dashboard = ({ links, onDeleteLink, onRefresh, addToast }) => {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await onRefresh();
      addToast('Analytics synchronized!', 'success');
    } catch (err) {
      addToast('Sync failed: ' + err.message, 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Calculate stats
  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, item) => sum + (item.clicks || 0), 0);
  const topLink = totalLinks > 0 
    ? [...links].sort((a, b) => b.clicks - a.clicks)[0] 
    : null;

  return (
    <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
      
      {/* Dashboard Stats Header */}
      {totalLinks > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '36px' }}>
          
          <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(217, 70, 239, 0.1)', padding: '12px', borderRadius: '12px', display: 'flex' }}>
              <Link size={20} style={{ color: '#d946ef' }} />
            </div>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Links</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '2px' }}>{totalLinks}</h3>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '12px', borderRadius: '12px', display: 'flex' }}>
              <BarChart2 size={20} style={{ color: '#8b5cf6' }} />
            </div>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Clicks</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '2px' }}>{totalClicks}</h3>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(244, 114, 182, 0.1)', padding: '12px', borderRadius: '12px', display: 'flex' }}>
              <TrendingUp size={20} style={{ color: '#f472b6' }} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Link</p>
              {topLink ? (
                <h3 
                  style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  title={`${topLink.shortCode} (${topLink.clicks} clicks)`}
                >
                  {topLink.shortCode} <span style={{ color: '#f472b6', fontSize: '0.85rem', fontWeight: 500 }}>({topLink.clicks} clicks)</span>
                </h3>
              ) : (
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2px' }}>N/A</h3>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Main Dashboard Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} style={{ color: '#d946ef' }} />
          Recent Links
        </h2>
        
        {totalLinks > 0 && (
          <button 
            className="btn-secondary" 
            onClick={handleSync} 
            disabled={syncing}
            style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '8px' }}
          >
            <RefreshCw size={14} className={syncing ? 'float-animation' : ''} />
            {syncing ? 'Syncing...' : 'Sync Clicks'}
          </button>
        )}
      </div>

      {totalLinks === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '24px', borderRadius: '50%', display: 'flex', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <Link size={40} style={{ color: '#475569' }} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>No links shortened yet</h3>
          <p style={{ color: '#94a3b8', maxWidth: '400px', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Create your first short link using the form above to start tracking clicks, views, and QR codes instantly.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {links.map((link) => (
            <LinkCard 
              key={link.shortCode} 
              url={link} 
              onDelete={onDeleteLink} 
              addToast={addToast} 
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default Dashboard;

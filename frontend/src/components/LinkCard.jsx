import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, BarChart2, Calendar, QrCode, ExternalLink, Trash2, Download } from 'lucide-react';

const LinkCard = ({ url, onDelete, addToast }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url.shortUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url.shortUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      addToast('Copied link to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      addToast('Failed to copy link to clipboard', 'error');
    }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById(`qr-${url.shortCode}`);
    if (!svg) return;
    const svgXml = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `qr-code-${url.shortCode}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    addToast('QR Code downloaded!', 'success');
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (_) {
      return 'N/A';
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
      
      {/* Clicks & Action Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="badge">
          <BarChart2 size={14} style={{ color: '#d946ef' }} />
          <span>{url.clicks} {url.clicks === 1 ? 'click' : 'clicks'}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn-secondary" 
            style={{ padding: '8px', borderRadius: '8px' }} 
            onClick={() => setShowQR(!showQR)}
            title="Toggle QR Code"
          >
            <QrCode size={16} />
          </button>
          
          <button 
            className="btn-secondary" 
            style={{ padding: '8px', borderRadius: '8px', color: '#f43f5e' }} 
            onClick={() => onDelete(url.shortCode)}
            title="Remove from history"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Main Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Short Link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a 
            href={url.shortUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              fontSize: '1.25rem', 
              fontWeight: 600, 
              color: '#d946ef', 
              textDecoration: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              wordBreak: 'break-all'
            }}
          >
            {url.shortUrl.replace(/^https?:\/\//i, '')}
            <ExternalLink size={14} style={{ flexShrink: 0 }} />
          </a>
        </div>

        {/* Long Link (Truncated) */}
        <p style={{ 
          color: '#94a3b8', 
          fontSize: '0.9rem', 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          maxWidth: '100%' 
        }} title={url.originalUrl}>
          {url.originalUrl}
        </p>
      </div>

      {/* Footer Info & Copy */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px', marginTop: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.85rem' }}>
          <Calendar size={14} />
          <span>{formatDate(url.createdAt)}</span>
        </div>

        <button 
          className="btn-primary" 
          onClick={handleCopy} 
          style={{ 
            padding: '10px 18px', 
            fontSize: '0.85rem', 
            borderRadius: '8px',
            background: copied ? '#10b981' : undefined,
            boxShadow: copied ? '0 4px 15px rgba(16, 185, 129, 0.2)' : undefined
          }}
        >
          {copied ? (
            <>
              <Check size={14} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy Link
            </>
          )}
        </button>
      </div>

      {/* QR Code Expanded Section */}
      {showQR && (
        <div 
          style={{ 
            marginTop: '8px', 
            paddingTop: '20px', 
            borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '16px',
            animation: 'fadeInUp 0.3s ease-out' 
          }}
        >
          <div style={{ background: 'white', padding: '12px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <QRCodeSVG 
              id={`qr-${url.shortCode}`} 
              value={url.shortUrl} 
              size={128} 
              level="H" 
              includeMargin={false}
            />
          </div>
          <button 
            className="btn-secondary" 
            style={{ width: '100%', fontSize: '0.85rem', padding: '10px' }} 
            onClick={downloadQRCode}
          >
            <Download size={14} />
            Download SVG QR Code
          </button>
        </div>
      )}

    </div>
  );
};

export default LinkCard;

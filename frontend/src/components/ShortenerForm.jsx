import React, { useState } from 'react';
import { Link2, Sparkles, AlertCircle } from 'lucide-react';

const ShortenerForm = ({ onSuccess, addToast }) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let targetUrl = originalUrl.trim();
    if (!targetUrl) {
      setError('Please enter a URL');
      return;
    }

    // Premium UX: Prepend https:// if user didn't write it
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    // Basic URL format validation
    try {
      new URL(targetUrl);
    } catch (_) {
      setError('Please enter a valid URL (e.g., google.com or https://example.com)');
      return;
    }

    // Custom code validation if filled
    if (customCode.trim()) {
      const codeRegex = /^[a-zA-Z0-9-_]{3,15}$/;
      if (!codeRegex.test(customCode.trim())) {
        setError('Custom alias must be 3-15 characters and contain only letters, numbers, hyphens (-) or underscores (_).');
        return;
      }
    }

    setLoading(true);

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl: targetUrl,
          customCode: customCode.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Trigger success flow
      addToast('Link shortened successfully!', 'success');
      onSuccess(data);
      setOriginalUrl('');
      setCustomCode('');
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel-glow animate-fade-in" style={{ padding: '32px', marginBottom: '40px' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={20} style={{ color: '#d946ef' }} />
        Shorten a long URL
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="input-group">
          <label className="input-label" htmlFor="long-url">DESTINATION URL</label>
          <div style={{ position: 'relative' }}>
            <Link2 size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
            <input
              id="long-url"
              type="text"
              className="glass-input"
              style={{ paddingLeft: '48px' }}
              placeholder="Paste a link to shorten (e.g. google.com)"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="custom-slug">
            CUSTOM ALIAS <span style={{ color: '#475569', fontSize: '0.8rem', fontWeight: 'normal' }}>(OPTIONAL)</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', color: '#475569', fontSize: '0.95rem', userSelect: 'none' }}>
              lnk.sh /
            </span>
            <input
              id="custom-slug"
              type="text"
              className="glass-input"
              style={{ paddingLeft: '75px' }}
              placeholder="my-custom-slug"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e', fontSize: '0.9rem', background: 'rgba(244, 63, 94, 0.1)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
          {loading ? 'Shortening link...' : 'Shorten Link'}
        </button>
      </form>
    </div>
  );
};

export default ShortenerForm;

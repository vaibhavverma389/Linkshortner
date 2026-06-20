import express from 'express';
import validUrl from 'valid-url';
import Url from '../models/Url.js';

const router = express.Router();

// Helper to generate a random 6-char slug
const generateSlug = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// @route   POST /api/shorten
// @desc    Shorten a URL or create custom alias
router.post('/shorten', async (req, res) => {
  const { originalUrl, customCode } = req.body;

  // Validate request
  if (!originalUrl) {
    return res.status(400).json({ error: 'Original URL is required' });
  }

  // Validate original URL format
  if (!validUrl.isWebUri(originalUrl)) {
    return res.status(400).json({ error: 'Invalid URL format. Please include http:// or https://' });
  }

  try {
    let shortCode;

    // Handle custom alias
    if (customCode) {
      // Validate custom slug format (3 to 15 chars, alphanumeric, hyphens, underscores)
      const codeRegex = /^[a-zA-Z0-9-_]{3,15}$/;
      if (!codeRegex.test(customCode)) {
        return res.status(400).json({ 
          error: 'Custom alias must be 3-15 characters long and contain only letters, numbers, hyphens (-) or underscores (_).' 
        });
      }

      // Check if custom alias is already taken
      const existingUrl = await Url.findOne({ shortCode: customCode });
      if (existingUrl) {
        return res.status(400).json({ error: 'Custom alias is already in use' });
      }
      shortCode = customCode;
    } else {
      // Generate a unique 6-char slug
      let unique = false;
      let retries = 0;
      while (!unique && retries < 5) {
        shortCode = generateSlug(6);
        const existing = await Url.findOne({ shortCode });
        if (!existing) {
          unique = true;
        }
        retries++;
      }
      if (!unique) {
        return res.status(500).json({ error: 'Failed to generate a unique short link. Please try again.' });
      }
    }

    // Create and save database record
    const newUrl = new Url({
      originalUrl,
      shortCode,
      createdAt: new Date(),
    });

    await newUrl.save();

    res.status(201).json({
      originalUrl: newUrl.originalUrl,
      shortCode: newUrl.shortCode,
      shortUrl: `${process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`}/${newUrl.shortCode}`,
      clicks: newUrl.clicks,
      createdAt: newUrl.createdAt,
    });
  } catch (error) {
    console.error('Shorten Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/urls/stats
// @desc    Get bulk stats for a list of shortCodes (used for client-side dashboard sync)
router.post('/urls/stats', async (req, res) => {
  const { codes } = req.body;

  if (!codes || !Array.isArray(codes)) {
    return res.status(400).json({ error: 'A list of short codes is required' });
  }

  try {
    const urls = await Url.find({ shortCode: { $in: codes } });
    const formattedUrls = urls.map(url => ({
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`}/${url.shortCode}`,
      clicks: url.clicks,
      createdAt: url.createdAt,
      lastAccessed: url.lastAccessed,
    }));
    res.json(formattedUrls);
  } catch (error) {
    console.error('Stats Sync Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

import express from 'express';
import validUrl from 'valid-url';
import Url from '../models/Url.js';

const router = express.Router();

const RESERVED_SLUGS = new Set([
  'api',
  'health',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'stats',
  'shorten',
  'admin',
  'null',
  'undefined'
]);

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
  if (!originalUrl || typeof originalUrl !== 'string') {
    return res.status(400).json({ error: 'Original URL is required' });
  }

  const trimmedUrl = originalUrl.trim();

  // Validate original URL format
  if (!validUrl.isWebUri(trimmedUrl)) {
    return res.status(400).json({ error: 'Invalid URL format. Please include http:// or https://' });
  }

  try {
    let shortCode;

    // Handle custom alias
    if (customCode && typeof customCode === 'string') {
      const trimmedCustom = customCode.trim();

      // Check against reserved routes
      if (RESERVED_SLUGS.has(trimmedCustom.toLowerCase())) {
        return res.status(400).json({ error: 'This custom alias is reserved by the system. Please pick another.' });
      }

      // Validate custom slug format (3 to 15 chars, alphanumeric, hyphens, underscores)
      const codeRegex = /^[a-zA-Z0-9-_]{3,15}$/;
      if (!codeRegex.test(trimmedCustom)) {
        return res.status(400).json({ 
          error: 'Custom alias must be 3-15 characters long and contain only letters, numbers, hyphens (-) or underscores (_).' 
        });
      }

      // Check if custom alias is already taken
      const existingUrl = await Url.findOne({ shortCode: trimmedCustom });
      if (existingUrl) {
        return res.status(400).json({ error: 'Custom alias is already in use' });
      }
      shortCode = trimmedCustom;
    } else {
      // Generate a unique 6-char slug
      let unique = false;
      let retries = 0;
      while (!unique && retries < 5) {
        shortCode = generateSlug(6);
        if (!RESERVED_SLUGS.has(shortCode.toLowerCase())) {
          const existing = await Url.findOne({ shortCode });
          if (!existing) {
            unique = true;
          }
        }
        retries++;
      }
      if (!unique) {
        return res.status(500).json({ error: 'Failed to generate a unique short link. Please try again.' });
      }
    }

    // Create and save database record
    const newUrl = new Url({
      originalUrl: trimmedUrl,
      shortCode,
      createdAt: new Date(),
    });

    await newUrl.save();

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

    return res.status(201).json({
      originalUrl: newUrl.originalUrl,
      shortCode: newUrl.shortCode,
      shortUrl: `${baseUrl}/${newUrl.shortCode}`,
      clicks: newUrl.clicks,
      createdAt: newUrl.createdAt,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'This alias was just taken. Please try another one.' });
    }
    console.error('Shorten Error:', error);
    return res.status(500).json({ error: 'Server error occurred while shortening the link.' });
  }
});

// @route   POST /api/urls/stats
// @desc    Get bulk stats for a list of shortCodes (used for client-side dashboard sync)
router.post('/urls/stats', async (req, res) => {
  const { codes } = req.body;

  if (!codes || !Array.isArray(codes)) {
    return res.status(400).json({ error: 'A list of short codes is required' });
  }

  // Sanitize and deduplicate incoming codes
  const uniqueCodes = Array.from(new Set(codes.filter(c => typeof c === 'string' && c.trim().length > 0)));

  if (uniqueCodes.length === 0) {
    return res.json([]);
  }

  try {
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

    const urls = await Url.find({ shortCode: { $in: uniqueCodes } })
      .select('originalUrl shortCode clicks createdAt lastAccessed -_id')
      .lean();

    const formattedUrls = urls.map(url => ({
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      clicks: url.clicks || 0,
      createdAt: url.createdAt,
      lastAccessed: url.lastAccessed,
    }));

    return res.json(formattedUrls);
  } catch (error) {
    console.error('Stats Sync Error:', error);
    return res.status(500).json({ error: 'Server error occurred while fetching analytics.' });
  }
});

export default router;

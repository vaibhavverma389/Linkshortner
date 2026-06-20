import express from 'express';
import Url from '../models/Url.js';

const router = express.Router();

// @route   GET /:code
// @desc    Redirect to original URL and track clicks
router.get('/:code', async (req, res) => {
  const { code } = req.params;

  try {
    const url = await Url.findOne({ shortCode: code });

    if (url) {
      // Increment clicks and update access time
      url.clicks += 1;
      url.lastAccessed = new Date();
      await url.save();

      // Perform HTTP 302 temporary redirect
      return res.redirect(url.originalUrl);
    } else {
      // Return a themed HTML page for 404
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Link Not Found | LinkShort</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
          <style>
            body {
              background: #0b0713;
              color: #f1f1f1;
              font-family: 'Outfit', sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              overflow: hidden;
            }
            /* Glowing background gradients */
            body::before {
              content: '';
              position: absolute;
              width: 400px;
              height: 400px;
              background: radial-gradient(circle, rgba(162, 28, 175, 0.15) 0%, rgba(0, 0, 0, 0) 70%);
              top: 20%;
              left: 30%;
              z-index: -1;
            }
            body::after {
              content: '';
              position: absolute;
              width: 500px;
              height: 500px;
              background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(0, 0, 0, 0) 70%);
              bottom: 10%;
              right: 20%;
              z-index: -1;
            }
            .card {
              background: rgba(255, 255, 255, 0.03);
              backdrop-filter: blur(16px);
              -webkit-backdrop-filter: blur(16px);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 24px;
              padding: 48px;
              text-align: center;
              box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
              max-width: 420px;
              width: 85%;
              animation: fadeInUp 0.6s ease-out;
            }
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .icon {
              font-size: 4rem;
              margin-bottom: 24px;
              display: inline-block;
              animation: float 3s ease-in-out infinite;
            }
            @keyframes float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            h1 {
              color: #f1f1f1;
              margin: 0 0 12px 0;
              font-size: 2.2rem;
              font-weight: 700;
              letter-spacing: -0.5px;
            }
            p {
              font-size: 1.05rem;
              line-height: 1.6;
              color: #a0aec0;
              margin: 0 0 32px 0;
            }
            a {
              display: inline-block;
              padding: 14px 28px;
              background: linear-gradient(135deg, #a21caf 0%, #8b5cf6 100%);
              color: white;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 600;
              box-shadow: 0 4px 15px rgba(162, 28, 175, 0.3);
              transition: all 0.3s ease;
            }
            a:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(162, 28, 175, 0.5);
            }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="icon">🔍</span>
            <h1>Link Not Found</h1>
            <p>The shortened URL you are trying to visit does not exist, was typed incorrectly, or has expired.</p>
            <a href="http://localhost:5173">Go to LinkShortener</a>
          </div>
        </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('Redirect Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

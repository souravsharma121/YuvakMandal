const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');

// Helper to ensure absolute URL for images
function absoluteUrl(req, url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) {
    return `${req.protocol}://${req.get('host')}${url}`;
  }
  return `${req.protocol}://${req.get('host')}/${url}`;
}

// Escape HTML to avoid injection in meta tags
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Share route for initiative (gallery) items
router.get('/initiative/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const item = await Gallery.findById(id).populate('createdBy');

    const title = item?.title || 'Initiative';
    const description = item?.description || 'Check out this initiative';
    const imgUrl = item?.images && item.images.length > 0 ? absoluteUrl(req, item.images[0].url) : null;

    // Fallback image served from public/static-data if available
    const fallback = `${req.protocol}://${req.get('host')}/static-data/splashlogo.png`;
    const finalImage = imgUrl || fallback;

    const initiativePath = `/initiative/${id}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${initiativePath}`;

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${finalImage}" />
  <meta property="og:url" content="${fullUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${finalImage}" />
  <title>${escapeHtml(title)}</title>
  <!-- Redirect to SPA route after providing meta tags for scrapers -->
  <meta http-equiv="refresh" content="0;url=${initiativePath}" />
</head>
<body>
  <p>Redirecting to <a href="${initiativePath}">${initiativePath}</a></p>
</body>
</html>`;

    res.set('Content-Type', 'text/html');
    return res.send(html);
  } catch (err) {
    console.error('Share route error', err);
    return res.status(404).send('Not found');
  }
});

module.exports = router;

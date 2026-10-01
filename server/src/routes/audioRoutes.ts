import { Router, Request, Response } from 'express';

const router = Router();

router.post('/validate-url', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      res.status(400).json({
        success: false,
        errorType: 'INVALID_URL',
        message: 'Please provide a valid audio URL.'
      });
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        res.status(400).json({
          success: false,
          errorType: 'INVALID_PROTOCOL',
          message: 'URL protocol must be HTTP or HTTPS.'
        });
        return;
      }
    } catch {
      res.status(400).json({
        success: false,
        errorType: 'INVALID_URL',
        message: 'The provided URL is not a well-formed web address.'
      });
      return;
    }

    // Attempt a HEAD or range GET request to inspect content type
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'WavePlay/1.0 (Audio Resource Validator)'
        }
      });
      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || '';
      const contentLength = response.headers.get('content-length');

      const isAudio =
        contentType.includes('audio/') ||
        contentType.includes('video/ogg') ||
        contentType.includes('application/ogg') ||
        contentType.includes('application/octet-stream') ||
        /\.(mp3|wav|ogg|m4a|aac|flac|weba)(\?.*)?$/i.test(parsedUrl.pathname);

      if (!response.ok && response.status !== 206) {
        if (response.status === 403 || response.status === 401) {
          res.status(400).json({
            success: false,
            errorType: 'ACCESS_DENIED',
            message: 'Access denied: The server requires authentication or rejects access.'
          });
          return;
        }
        res.status(400).json({
          success: false,
          errorType: 'RESOURCE_UNAVAILABLE',
          message: `The server responded with status HTTP ${response.status}. Resource is unavailable.`
        });
        return;
      }

      // Extract filename from pathname as fallback title
      const pathSegments = parsedUrl.pathname.split('/');
      const rawFileName = decodeURIComponent(pathSegments[pathSegments.length - 1] || 'Web Audio Track');
      const cleanTitle = rawFileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      res.json({
        success: true,
        playable: isAudio,
        contentType,
        contentLength: contentLength ? parseInt(contentLength, 10) : undefined,
        suggestedTitle: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
        suggestedArtist: parsedUrl.hostname,
        url
      });
    } catch (fetchErr: any) {
      if (fetchErr.name === 'AbortError') {
        res.status(408).json({
          success: false,
          errorType: 'TIMEOUT',
          message: 'The audio host took too long to respond. Connection timed out.'
        });
        return;
      }

      res.status(400).json({
        success: false,
        errorType: 'NETWORK_ERROR',
        message: 'Could not connect to the remote host. Please verify the URL and network reachability.'
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      errorType: 'SERVER_ERROR',
      message: error.message || 'Validation failed'
    });
  }
});

export default router;

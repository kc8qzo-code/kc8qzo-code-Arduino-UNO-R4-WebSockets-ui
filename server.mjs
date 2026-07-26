import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer, request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { extname, join, normalize, resolve, sep } from 'node:path';

const host = process.env.HOST ?? '0.0.0.0';
const port = Number.parseInt(process.env.PORT ?? '4200', 10);
const apiTarget = new URL(process.env.API_TARGET ?? 'http://localhost:8080');
const publicDirectory = resolve(
  process.env.STATIC_DIR ?? 'dist/Arduino_Communication_Ui/browser',
);

const contentTypes = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT: ${process.env.PORT}`);
}

if (!existsSync(join(publicDirectory, 'index.html'))) {
  throw new Error(
    `Production build not found in ${publicDirectory}. Run "npm run build" first.`,
  );
}

function getFilePath(requestUrl) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname);
  } catch {
    return null;
  }

  const candidate = resolve(publicDirectory, `.${sep}${normalize(pathname)}`);
  if (candidate !== publicDirectory && !candidate.startsWith(`${publicDirectory}${sep}`)) {
    return null;
  }

  if (existsSync(candidate) && statSync(candidate).isFile()) {
    return candidate;
  }

  // Angular handles client-side routes after index.html is loaded.
  return extname(pathname) === '' ? join(publicDirectory, 'index.html') : null;
}

function proxyApi(request, response) {
  const requestImpl = apiTarget.protocol === 'https:' ? httpsRequest : httpRequest;
  const upstream = requestImpl(
    new URL(request.url ?? '/', apiTarget),
    {
      method: request.method,
      headers: {
        ...request.headers,
        host: apiTarget.host,
      },
    },
    (upstreamResponse) => {
      response.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
      upstreamResponse.pipe(response);
    },
  );

  upstream.on('error', (error) => {
    console.error(`API proxy error for ${request.url}:`, error.message);
    if (!response.headersSent) {
      response.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    response.end('Bad Gateway');
  });

  request.pipe(upstream);
}

const server = createServer((request, response) => {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
  if (pathname === '/api' || pathname.startsWith('/api/')) {
    proxyApi(request, response);
    return;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method Not Allowed');
    return;
  }

  const filePath = getFilePath(request.url ?? '/');
  if (!filePath) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not Found');
    return;
  }

  const extension = extname(filePath).toLowerCase();
  const isHtml = extension === '.html';
  response.writeHead(200, {
    'Content-Type': contentTypes[extension] ?? 'application/octet-stream',
    'Content-Length': statSync(filePath).size,
    'Cache-Control': isHtml
      ? 'no-cache'
      : 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  });

  if (request.method === 'HEAD') {
    response.end();
  } else {
    createReadStream(filePath).pipe(response);
  }
});

server.on('error', (error) => {
  if (error.code === 'EACCES') {
    console.error(
      `Cannot listen on ${host}:${port}: permission denied. ` +
        'Choose another port with the PORT environment variable.',
    );
  } else if (error.code === 'EADDRINUSE') {
    console.error(
      `Cannot listen on ${host}:${port}: the port is already in use. ` +
        'Stop the other process or choose another port with the PORT environment variable.',
    );
  } else {
    console.error('Production server failed to start:', error);
  }

  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`Serving ${publicDirectory} at http://${host}:${port}`);
  console.log(`Proxying /api requests to ${apiTarget.origin}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

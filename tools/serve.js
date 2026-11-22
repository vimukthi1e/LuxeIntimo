#!/usr/bin/env node
/*
 * LUXE INTIMO — tiny local static server (Node fallback).
 * Zero dependencies. No build step.
 *
 *   node tools/serve.js         -> first free port from 8080
 *   node tools/serve.js 8080    -> explicit port
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');

const ROOT = path.dirname(__dirname);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json'
};

function findFreePort(start, end) {
  return new Promise((resolve, reject) => {
    let port = start;
    const tryPort = () => {
      if (port >= end) return reject(new Error('No free port found.'));
      const srv = net.createServer();
      srv.once('error', () => { port += 1; tryPort(); });
      srv.once('listening', () => {
        srv.close(() => resolve(port));
      });
      srv.listen(port, '127.0.0.1');
    };
    tryPort();
  });
}

function openBrowser(url) {
  const { exec } = require('child_process');
  const platform = process.platform;
  try {
    if (platform === 'win32') exec('start "" "' + url + '"', { windowsHide: true });
    else if (platform === 'darwin') exec('open "' + url + '"');
    else exec('xdg-open "' + url + '"');
  } catch (e) { /* non-fatal */ }
}

function serve(port) {
  const server = http.createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch (e) {
      res.writeHead(400); return res.end('Bad request');
    }
    if (pathname.endsWith('/')) pathname += 'index.html';

    const filePath = path.join(ROOT, path.normalize(pathname).replace(/^(\.\.[/\\])+/, ''));
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403); return res.end('Forbidden');
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('404 Not Found');
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': TYPES[ext] || 'application/octet-stream',
        'Cache-Control': 'no-cache'
      });
      res.end(data);
    });
  });

  server.listen(port, '127.0.0.1', () => {
    const url = 'http://localhost:' + port + '/';
    console.log('');
    console.log('   ==================================================');
    console.log('    LUXE INTIMO  -  local server (node)');
    console.log('   ==================================================');
    console.log('    URL      :  ' + url);
    console.log('    Folder   :  ' + ROOT);
    console.log('    Stop     :  press Ctrl+C');
    console.log('   ==================================================');
    console.log('');
    setTimeout(() => openBrowser(url), 900);
  });

  server.on('error', (e) => {
    console.error('Server error:', e.message);
    process.exit(1);
  });
}

const explicit = parseInt(process.argv[2], 10);
const portPromise = Number.isFinite(explicit)
  ? Promise.resolve(explicit)
  : findFreePort(8080, 8120);

portPromise.then(serve).catch((e) => {
  console.error(e.message);
  process.exit(1);
});
import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import { polyfillHandler } from './polyfill-handler.js';

const app = new Hono();

app.onError((error, c) => {
  console.error('Internal App Error:', error, error.stack, error.message);
  return c.text('Internal Server Error', 500);
});

app.get('*', async (c) => {
  // console.log(c.env); // ok
  // console.log(c.res); // ok
  console.log(c.req); // crashed here !!!!!
  // console.log(c.req.header('User-Agent')); // ok
  // console.log(c.req.path); // ok
  // console.log(c.req.url); // ok
  if (/\/polyfill(\.min)?\.js$/.test(c.req.path)) {
    return polyfillHandler(c);
  }
  c.res.headers.set(
    'Cache-Control',
    'public, s-maxage=31536000, max-age=604800, stale-while-revalidate=604800, stale-if-error=604800, immutable'
  );
  return c.text('Not Found', 404);
});

app.notFound((c) => {
  c.res.headers.set(
    'Cache-Control',
    'public, s-maxage=31536000, max-age=604800, stale-while-revalidate=604800, stale-if-error=604800, immutable'
  );
  return c.text('Not Found', 404);
});

app.get('/', (c) => c.text('This is polyfill service for foo frontend!'));

serve(app, (info) => {
  console.log(`Listening on http://localhost:${info.port}`); // Listening on http://localhost:3000
});

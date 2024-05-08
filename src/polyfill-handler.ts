import { Context, Env } from 'hono';
import { normalise_querystring_parameters_for_polyfill_bundle } from './normalise-query-parameters.js';
import polyfillio from 'polyfill-library';
import { getPolyfillParameters } from './get-polyfill-parameters.js';
import { URL } from 'url';

export async function polyfillHandler(c: Context<Env, '*', {}>) {
  let requestURL = new URL(c.req.url);

  requestURL.search = normalise_querystring_parameters_for_polyfill_bundle(
    c.req,
    requestURL.searchParams
  ).toString();

  let response = await polyfill(requestURL, c);

  response.headers.set(
    'useragent_normaliser',
    requestURL.searchParams.get('ua')
  );

  let vary = response.headers.get('vary');
  if (vary) {
    if (!/\bUser-Agent\b/.test(vary)) {
      response.headers.set('vary', `${vary}, User-Agent`);
    }
  } else {
    response.headers.set('vary', 'User-Agent');
  }

  if (vary) {
    if (!/\bAccept-Encoding\b/.test(vary)) {
      response.headers.set('vary', `${vary}, Accept-Encoding`);
    }
  } else {
    response.headers.set('vary', 'Accept-Encoding');
  }

  if (
    c.req.header('if-modified-since') &&
    response.headers.get('last-modified') &&
    new Date(c.req.header('if-modified-since')) >=
      new Date(response.headers.get('last-modified'))
  ) {
    response.headers.set('age', '0');
    response = new Response(undefined, {
      status: 304,
      headers: response.headers,
    });
  }

  if (response.status == 304 || response.status == 200) {
    response.headers.set('Age', '0');
  }

  return response;
}

function respondWithBundle(c: Context, bundle: string) {
  c.status(200);
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
  c.header(
    'Cache-Control',
    'public, s-maxage=31536000, max-age=604800, stale-while-revalidate=604800, stale-if-error=604800, immutable'
  );
  c.header('Content-Type', 'text/javascript; charset=UTF-8');
  c.header('x-compress-hint', 'on');

  return c.body(bundle);
}

// TODO: Implement ReadableStream getIterator() and [@@asyncIterator]() methods
// eslint-disable-next-line no-unused-vars
// const decoder = new TextDecoder();
// async function streamToString(stream) {
//   let string = '';
//   let reader = stream.getReader();
//   // eslint-disable-next-line no-constant-condition
//   while (true) {
//     const { done, value } = await reader.read();
//     if (done) {
//       return string;
//     }
//     string += decoder.decode(value);
//   }
// }

async function polyfill(requestURL: URL, c: Context<Env, '*', {}>) {
  const parameters = getPolyfillParameters(requestURL);
  let bundle = await polyfillio.getPolyfillString(parameters);
  return respondWithBundle(c, bundle);
}

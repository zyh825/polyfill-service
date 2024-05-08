import latestUserAgentNormaliser from '@financial-times/polyfill-useragent-normaliser/lib/normalise-user-agent-c-at-e.js';
import { HonoRequest } from 'hono';

export function normalise_querystring_parameters_for_polyfill_bundle(
  originalRequest: HonoRequest,
  currentQuerystring: URLSearchParams
) {
  const newQuerystring = new URLSearchParams();

  let features;
  if ((features = currentQuerystring.get('features'))) {
    // # Parameter has already been set, use the already set value.
    try {
      try {
        features = decodeURIComponent(features);
      } catch {
        /* empty */
      }
      newQuerystring.set('features', features);
    } catch {
      // This is here because the VCL version of polyfill.io would silently ignore URI Errors
      newQuerystring.set('features', features);
    }
  } else {
    // # Parameter has not been set, use the default value.
    newQuerystring.set('features', 'default');
  }

  let excludes;
  if ((excludes = currentQuerystring.get('excludes'))) {
    try {
      // # Parameter has already been set, use the already set value.
      try {
        excludes = decodeURIComponent(excludes);
      } catch {
        /* empty */
      }
      newQuerystring.set('excludes', excludes);
    } catch {
      // This is here because the VCL version of polyfill.io would silently ignore URI Errors
      newQuerystring.set('excludes', excludes);
    }
  } else {
    newQuerystring.set('excludes', '');
  }

  let unknown;
  if ((unknown = currentQuerystring.get('unknown'))) {
    newQuerystring.set('unknown', unknown);
  } else {
    // # If unknown is not set, set to default value "polyfill"
    newQuerystring.set('unknown', 'polyfill');
  }

  let flags;
  if ((flags = currentQuerystring.get('flags'))) {
    // # Parameter has already been set, use the already set value.
    try {
      flags = decodeURIComponent(flags);
    } catch {
      /* empty */
    }
    newQuerystring.set('flags', flags);
  } else {
    // # If flags is not set, set to default value ""
    newQuerystring.set('flags', '');
  }

  newQuerystring.set('version', '');

  let ua;
  if ((ua = currentQuerystring.get('ua'))) {
    try {
      newQuerystring.set('ua', decodeURIComponent(ua));
    } catch {
      /* empty */
    }
  } else {
    // # If ua is not set, normalise the User-Agent header based upon the version of the polyfill-library that has been requested.
    const useragent = originalRequest.header('User-Agent');
    const normalisedUserAgent = latestUserAgentNormaliser.normalize(useragent);
    newQuerystring.set('ua', normalisedUserAgent);
  }

  let callback;
  if ((callback = currentQuerystring.get('callback'))) {
    newQuerystring.set('callback', callback);
  } else {
    // # If callback is not set, set to default value ""
    newQuerystring.set('callback', '');
  }

  return newQuerystring;
}

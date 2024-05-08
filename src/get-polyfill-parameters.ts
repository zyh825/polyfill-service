import { latestVersion } from './config.js';
import { IFlagsParameter } from './interface.js';

function featuresFromQueryParameter(
  featuresParameter: string,
  flagsParameter: string
) {
  const features = featuresParameter.split(',').filter((f) => f.length);
  const globalFlags = flagsParameter ? flagsParameter.split(',') : [];
  const featuresWithFlags: IFlagsParameter = {};

  for (const feature of features.sort()) {
    // Eliminate XSS vuln
    const safeFeature = feature.replaceAll(/[*/]/g, '');
    const [name, ...featureSpecificFlags] = safeFeature.split('|');
    featuresWithFlags[name.replaceAll('?', '')] = {
      flags: new Set(featureSpecificFlags.concat(globalFlags)),
    };
  }

  if (featuresWithFlags.all) {
    featuresWithFlags.default = featuresWithFlags.all;
    delete featuresWithFlags.all;
  }

  return featuresWithFlags;
}

export function getPolyfillParameters(requestURL: URL) {
  const query = requestURL.searchParams;
  const path = requestURL.pathname;
  const excludes = query.get('excludes') || '';
  const features = query.get('features') || 'default';
  const unknown = query.get('unknown') || 'polyfill';
  // const version = query.get('version'); // 不支持定制版本号
  const callback = query.get('callback');
  const ua = query.get('ua');
  const flags = query.get('flags');

  const uaString = ua || '';
  const strict = Object.prototype.hasOwnProperty.call(query, 'strict');

  return {
    excludes: excludes ? excludes.split(',') : [],
    features: featuresFromQueryParameter(features, flags),
    minify: path.endsWith('.min.js'),
    callback: /^[\w.]+$/.test(callback || '') ? callback : false,
    unknown,
    uaString,
    version: latestVersion,
    strict,
  };
}

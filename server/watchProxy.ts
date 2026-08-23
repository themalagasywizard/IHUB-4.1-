const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const ALLOWED_HOSTS = new Set([
  'vidsrcme.ru',
  'www.vidsrcme.ru',
  'data.vidsrcme.ru',
  'vidsrc.me',
  'www.vidsrc.me',
  'vidsrc.xyz',
  'www.vidsrc.xyz',
  'vidsrc.to',
  'vidsrc.cc',
  'vsembed.ru',
  'vidsrc-embed.ru',
  'cloudorchestranova.com',
  'www.cloudorchestranova.com',
  'cloudnestra.com',
  'www.cloudnestra.com',
]);

export const isAllowedHost = (host: string) => {
  const value = host.toLowerCase().replace(/:\d+$/, '');
  if (ALLOWED_HOSTS.has(value)) return true;
  return (
    value.endsWith('.vidsrcme.ru') ||
    value.endsWith('.cloudorchestranova.com') ||
    value.endsWith('.cloudnestra.com') ||
    value.endsWith('.vidsrc.me') ||
    value.endsWith('.vidsrc.xyz')
  );
};

const interceptorScript = `
<script>
(function () {
  var PREFIX = '/watch-proxy/';
  function rewrite(url) {
    if (!url || typeof url !== 'string') return url;
    if (/^(blob:|data:|javascript:|about:|#)/i.test(url)) return url;
    try {
      var parsed = new URL(url, location.href);
      if (parsed.pathname.indexOf(PREFIX) === 0) return url;
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return url;
      return PREFIX + parsed.host + parsed.pathname + parsed.search + parsed.hash;
    } catch (err) {
      return url;
    }
  }

  var nativeFetch = window.fetch;
  window.fetch = function (input, init) {
    if (typeof input === 'string') input = rewrite(input);
    else if (input && typeof input.url === 'string') input = new Request(rewrite(input.url), input);
    return nativeFetch.call(this, input, init);
  };

  var xhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    var args = Array.prototype.slice.call(arguments);
    if (typeof url === 'string') args[1] = rewrite(url);
    return xhrOpen.apply(this, args);
  };

  function patchSrc(proto) {
    if (!proto) return;
    var descriptor = Object.getOwnPropertyDescriptor(proto, 'src');
    if (!descriptor || !descriptor.set) return;
    Object.defineProperty(proto, 'src', {
      get: descriptor.get,
      set: function (value) { descriptor.set.call(this, rewrite(value)); },
      configurable: true
    });
  }
  patchSrc(HTMLIFrameElement && HTMLIFrameElement.prototype);
  patchSrc(HTMLScriptElement && HTMLScriptElement.prototype);
  patchSrc(HTMLImageElement && HTMLImageElement.prototype);
  patchSrc(HTMLSourceElement && HTMLSourceElement.prototype);
  patchSrc(HTMLVideoElement && HTMLVideoElement.prototype);
  patchSrc(HTMLMediaElement && HTMLMediaElement.prototype);

  var setAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    if (typeof name === 'string' && /^(src|href)$/i.test(name) && typeof value === 'string') {
      value = rewrite(value);
    }
    return setAttribute.call(this, name, value);
  };
})();
</script>
`;

const toProxyPath = (absoluteUrl: string) => {
  try {
    const parsed = new URL(absoluteUrl);
    if (!isAllowedHost(parsed.host)) return absoluteUrl;
    return `/watch-proxy/${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return absoluteUrl;
  }
};

const rewriteHtml = (html: string, finalUrl: URL) => {
  const base = `/watch-proxy/${finalUrl.host}/`;
  let next = html;

  if (/<head/i.test(next)) {
    next = next.replace(/<head([^>]*)>/i, `<head$1><base href="${base}">${interceptorScript}`);
  } else {
    next = `${interceptorScript}${next}`;
  }

  next = next.replace(
    /(src|href|data-api|action)=["'](https?:\/\/[^"']+)["']/gi,
    (_match, attr: string, url: string) => `${attr}="${toProxyPath(url)}"`
  );

  return next;
};

const rewriteJson = (text: string) =>
  text.replace(/https?:\/\/[^\s"'\\]+/g, (url) => toProxyPath(url));

const parseTarget = (requestUrl: URL) => {
  const rest = requestUrl.pathname.replace(/^\/watch-proxy\/?/, '');
  const slash = rest.indexOf('/');
  if (slash === -1) {
    return { host: rest, path: `/${requestUrl.search}` };
  }
  return {
    host: rest.slice(0, slash),
    path: `${rest.slice(slash)}${requestUrl.search}`,
  };
};

export const handleWatchProxy = async (request: Request): Promise<Response> => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,HEAD,POST,OPTIONS',
        'access-control-allow-headers': '*',
      },
    });
  }

  const requestUrl = new URL(request.url);
  const { host, path } = parseTarget(requestUrl);

  if (!host || !isAllowedHost(host)) {
    return new Response('Host is not allowed', { status: 403 });
  }

  const target = new URL(`https://${host}${path || '/'}`);
  const headers = new Headers();
  headers.set('user-agent', request.headers.get('user-agent') || BROWSER_UA);
  headers.set('accept', request.headers.get('accept') || '*/*');
  headers.set('accept-language', request.headers.get('accept-language') || 'en-US,en;q=0.9');
  headers.set('referer', 'https://vidsrcme.ru/');
  headers.set('origin', 'https://vidsrcme.ru');

  const range = request.headers.get('range');
  if (range) headers.set('range', range);

  const upstream = await fetch(target, {
    method: request.method === 'HEAD' ? 'GET' : request.method,
    headers,
    redirect: 'follow',
    body:
      request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS'
        ? undefined
        : request.body,
  });

  const contentType = upstream.headers.get('content-type') || '';
  const outHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (
      lower === 'x-frame-options' ||
      lower === 'content-security-policy' ||
      lower === 'content-security-policy-report-only' ||
      lower === 'report-to' ||
      lower === 'nel'
    ) {
      return;
    }
    outHeaders.set(key, value);
  });
  outHeaders.set('access-control-allow-origin', '*');
  outHeaders.delete('content-encoding');

  const finalUrl = new URL(upstream.url || target.toString());

  if (contentType.includes('text/html')) {
    const html = rewriteHtml(await upstream.text(), finalUrl);
    outHeaders.set('content-type', 'text/html; charset=utf-8');
    outHeaders.delete('content-length');
    return new Response(html, { status: upstream.status, headers: outHeaders });
  }

  if (contentType.includes('application/json') || contentType.includes('text/json')) {
    const json = rewriteJson(await upstream.text());
    outHeaders.delete('content-length');
    return new Response(json, { status: upstream.status, headers: outHeaders });
  }

  return new Response(upstream.body, { status: upstream.status, headers: outHeaders });
};

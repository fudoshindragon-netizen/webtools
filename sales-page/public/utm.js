/**
 * UTM first-touch (session) + NOBODY RUNS checkout link rewriting.
 * Safe when no UTMs are present. Custom va() events are best-effort (Pro plan).
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'mvl_utm_v1';
  var GUMROAD = 'https://microventurelabs.gumroad.com/l/kttygj';
  var STRIPE = 'https://buy.stripe.com/28E4gzaOweZIdli5iK0ZW0d';
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  function readStored() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function writeStored(utm) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
    } catch (e) {
      /* private mode / quota — ignore */
    }
  }

  function fromQuery() {
    var params = new URLSearchParams(window.location.search);
    var out = {};
    var found = false;
    UTM_KEYS.forEach(function (key) {
      var v = params.get(key);
      if (v) {
        out[key] = String(v).trim();
        found = true;
      }
    });
    return found ? out : null;
  }

  /** First-touch for the session: keep existing storage; only seed from URL if empty. */
  function getUtm() {
    var stored = readStored();
    if (stored) return stored;
    var fresh = fromQuery();
    if (fresh) writeStored(fresh);
    return fresh;
  }

  function sanitizePart(value) {
    if (!value) return '';
    return String(value)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 40);
  }

  function buildClientReferenceId(utm) {
    var parts = [
      sanitizePart(utm.utm_campaign) || 'none',
      sanitizePart(utm.utm_source) || 'none',
      sanitizePart(utm.utm_medium) || 'none',
      sanitizePart(utm.utm_content) || 'none',
    ];
    var id = parts.join('__');
    if (id.length > 200) id = id.slice(0, 200);
    return id;
  }

  function appendParams(url, params) {
    var u = new URL(url);
    Object.keys(params).forEach(function (k) {
      if (params[k] != null && params[k] !== '') u.searchParams.set(k, params[k]);
    });
    return u.toString();
  }

  function rewriteHref(href, utm) {
    if (!href || !utm) return href;
    var base = href.split('?')[0].split('#')[0];
    if (base === GUMROAD || href.indexOf(GUMROAD) === 0) {
      return appendParams(GUMROAD, {
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        utm_content: utm.utm_content,
        utm_term: utm.utm_term,
      });
    }
    if (base === STRIPE || href.indexOf(STRIPE) === 0) {
      var stripeParams = {
        client_reference_id: buildClientReferenceId(utm),
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        utm_content: utm.utm_content,
        utm_term: utm.utm_term,
      };
      return appendParams(STRIPE, stripeParams);
    }
    return href;
  }

  function isCheckoutHref(href) {
    if (!href) return false;
    return href.indexOf(GUMROAD) === 0 || href.indexOf(STRIPE) === 0;
  }

  function providerFromHref(href) {
    if (href.indexOf(GUMROAD) === 0) return 'gumroad';
    if (href.indexOf(STRIPE) === 0) return 'stripe';
    return 'unknown';
  }

  function trackCheckoutClick(provider, utm) {
    try {
      if (typeof window.va !== 'function') return;
      window.va('event', {
        name: 'checkout_click',
        data: {
          provider: provider,
          utm_campaign: (utm && utm.utm_campaign) || '',
          utm_source: (utm && utm.utm_source) || '',
          utm_medium: (utm && utm.utm_medium) || '',
          utm_content: (utm && utm.utm_content) || '',
        },
      });
    } catch (e) {
      /* Custom events need Pro; ignore on Hobby / missing insights */
    }
  }

  function apply() {
    var utm = getUtm();
    var anchors = document.querySelectorAll('a[href]');
    for (var i = 0; i < anchors.length; i++) {
      var a = anchors[i];
      var href = a.getAttribute('href') || '';
      if (!isCheckoutHref(href)) continue;

      if (utm) {
        var next = rewriteHref(href, utm);
        if (next && next !== href) a.setAttribute('href', next);
      }

      if (a.dataset.mvlUtmBound) continue;
      a.dataset.mvlUtmBound = '1';
      a.addEventListener('click', function (ev) {
        var link = ev.currentTarget;
        var current = link.getAttribute('href') || '';
        var currentUtm = getUtm();
        trackCheckoutClick(providerFromHref(current), currentUtm);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }

  // Expose for local tests
  window.__mvlUtm = {
    getUtm: getUtm,
    rewriteHref: rewriteHref,
    buildClientReferenceId: buildClientReferenceId,
    GUMROAD: GUMROAD,
    STRIPE: STRIPE,
  };
})();

(function whatNextContentScript() {
  // Extra client-side safety net, on top of the domain blocklist enforced in
  // the background worker: never even attempt to read a page that has a
  // password field or is served over a login-looking path.
  function looksSensitive(): boolean {
    if (document.querySelector('input[type="password"]')) return true;
    const path = location.pathname.toLowerCase();
    return ['/login', '/signin', '/checkout', '/payment', '/account/security'].some((p) =>
      path.includes(p),
    );
  }

  function getMetaDescription(): string {
    const meta = document.querySelector('meta[name="description"]');
    return meta?.getAttribute('content')?.slice(0, 300) ?? '';
  }

  function sendSignal() {
    if (looksSensitive()) return;
    if (!document.title) return;

    chrome.runtime.sendMessage({
      type: 'PAGE_SIGNAL',
      url: location.href,
      title: document.title.slice(0, 200),
      description: getMetaDescription(),
    });
  }

  // initial capture once the page has settled
  if (document.readyState === 'complete') {
    sendSignal();
  } else {
    window.addEventListener('load', sendSignal, { once: true });
  }

  // single-page apps change the document title without a full navigation —
  // watch for that instead of re-injecting on every route change
  let lastTitle = document.title;
  const observer = new MutationObserver(() => {
    if (document.title !== lastTitle) {
      lastTitle = document.title;
      sendSignal();
    }
  });
  const titleEl = document.querySelector('title');
  if (titleEl) {
    observer.observe(titleEl, { childList: true });
  }
})();

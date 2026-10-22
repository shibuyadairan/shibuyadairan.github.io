(function () {
  var root = document.documentElement;
  var siteRoot = new URL('.', document.currentScript.src).pathname;
  var theme = new URLSearchParams(location.search).get('theme');

  if (theme !== 'light' && theme !== 'dark') {
    try {
      theme = localStorage.getItem('theme');
    } catch (error) {
      theme = null;
    }
  }

  if (theme !== 'light' && theme !== 'dark') {
    theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  root.setAttribute('data-theme', theme);

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href]');
    if (!link) return;

    var current = new URL(location.href);
    var destination = new URL(link.href, current.href);
    var internal = destination.protocol === current.protocol && destination.pathname.indexOf(siteRoot) === 0;
    var sameDocument = destination.pathname === current.pathname &&
      destination.search === current.search && destination.hash !== current.hash;

    if (link.matches('.crumb a, .back a') && internal && history.length > 1) {
      var previous;
      var previousPath = '';
      try {
        previous = JSON.parse(sessionStorage.getItem('shibyadairan:navigation-return-position'));
      } catch (error) {}
      if (previous && previous.destination === current.href) {
        try {
          previousPath = new URL(previous.url).pathname;
        } catch (error) {}
      }
      if (previousPath.indexOf(siteRoot) === 0) {
        event.preventDefault();
        history.back();
        return;
      }
    }

    if (internal && !sameDocument) {
      destination.searchParams.set('theme', root.getAttribute('data-theme'));
      link.href = destination.href;
      try {
        sessionStorage.setItem('shibyadairan:navigation-return-position', JSON.stringify({
          url: current.href,
          y: window.scrollY,
          destination: destination.href
        }));
      } catch (error) {}
      return;
    }

    var href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#' || href.charAt(0) === '/' || /^[a-z][a-z\d+.-]*:/i.test(href)) return;
    destination.searchParams.set('theme', root.getAttribute('data-theme'));
    link.href = destination.href;
  }, true);

  window.addEventListener('pageshow', function () {
    var saved;
    try {
      saved = JSON.parse(sessionStorage.getItem('shibyadairan:navigation-return-position'));
    } catch (error) {}
    if (!saved || saved.url !== location.href) return;

    try {
      sessionStorage.removeItem('shibyadairan:navigation-return-position');
    } catch (error) {}

    var html = document.documentElement;
    var behavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, saved.y);
    html.style.scrollBehavior = behavior;
  });
})();

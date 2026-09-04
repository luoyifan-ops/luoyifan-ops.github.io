// Lightweight hover/tap tooltips for chart elements.
// Any SVG element with a data-tooltip attribute gets a floating label
// that follows the pointer on hover, and a tap-to-reveal on touch devices.
document.addEventListener('DOMContentLoaded', function () {
  var tooltip = document.createElement('div');
  tooltip.className = 'chart-tooltip';
  document.body.appendChild(tooltip);

  function showAt(x, y, text) {
    tooltip.textContent = text;
    tooltip.style.left = (x + 14) + 'px';
    tooltip.style.top = (y + 14) + 'px';
    tooltip.classList.add('visible');
  }
  function hide() {
    tooltip.classList.remove('visible');
  }

  document.querySelectorAll('[data-tooltip]').forEach(function (el) {
    var text = el.getAttribute('data-tooltip');

    el.addEventListener('mouseenter', function (e) {
      showAt(e.clientX, e.clientY, text);
    });
    el.addEventListener('mousemove', function (e) {
      showAt(e.clientX, e.clientY, text);
    });
    el.addEventListener('mouseleave', hide);

    el.addEventListener('touchstart', function (e) {
      var t = e.touches[0];
      showAt(t.clientX, t.clientY, text);
      window.clearTimeout(el._tttimer);
      el._tttimer = window.setTimeout(hide, 2200);
    }, { passive: true });
  });

  // ---------- scroll reveal for boxed content ----------
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealIO.observe(el); });
  }

  // ---------- side dot nav: active section highlight ----------
  var sideLinks = document.querySelectorAll('.side-nav a');
  if (sideLinks.length) {
    var sectionIds = Array.prototype.map.call(sideLinks, function (a) {
      return a.getAttribute('href').slice(1);
    });
    var sectionEls = sectionIds
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          sideLinks.forEach(function (a) { a.classList.remove('active'); });
          var link = document.querySelector('.side-nav a[href="#' + entry.target.id + '"]');
          if (link) link.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sectionEls.forEach(function (el) { navIO.observe(el); });
  }
});

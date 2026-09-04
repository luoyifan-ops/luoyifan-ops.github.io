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

  // ---------- fullpage slide controller (desktop only, index.html) ----------
  var slidesWrap = document.querySelector('.slides');
  var isFullpage = !!slidesWrap && window.matchMedia('(min-width:901px)').matches;
  var sideLinks = document.querySelectorAll('.side-nav a');

  if (isFullpage) {
    document.body.classList.add('fullpage');
    var slideEls = Array.prototype.slice.call(slidesWrap.querySelectorAll('.slide'));
    var idx = 0;
    var animating = false;
    var revealedSlides = new WeakSet();

    function revealSlide(slide) {
      if (revealedSlides.has(slide)) return;
      revealedSlides.add(slide);
      var kids = slide.querySelectorAll('.reveal');
      kids.forEach(function (child, i) {
        setTimeout(function () { child.classList.add('visible'); }, 120 + i * 90);
      });
    }

    function updateDots() {
      sideLinks.forEach(function (a) { a.classList.remove('active'); });
      var link = document.querySelector('.side-nav a[href="#' + slideEls[idx].id + '"]');
      if (link) link.classList.add('active');
    }

    function activate(newIdx) {
      if (newIdx < 0 || newIdx >= slideEls.length || newIdx === idx || animating) return;
      animating = true;
      slideEls[idx].classList.remove('active');
      idx = newIdx;
      var target = slideEls[idx];
      target.classList.add('active');
      var inner = target.querySelector('.slide-inner');
      if (inner) inner.scrollTop = 0;
      revealSlide(target);
      updateDots();
      history.replaceState(null, '', '#' + target.id);
      setTimeout(function () { animating = false; }, 650);
    }

    slideEls[0].classList.add('active');
    revealSlide(slideEls[0]);
    updateDots();

    function canAdvance(dir) {
      var inner = slideEls[idx].querySelector('.slide-inner');
      if (!inner) return true;
      if (dir > 0) return inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 2;
      return inner.scrollTop <= 2;
    }

    window.addEventListener('wheel', function (e) {
      if (animating) { e.preventDefault(); return; }
      var dir = e.deltaY > 0 ? 1 : -1;
      if (canAdvance(dir)) {
        e.preventDefault();
        activate(idx + dir);
      }
    }, { passive: false });

    var touchStartY = 0;
    window.addEventListener('touchstart', function (e) { touchStartY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      var dy = touchStartY - e.touches[0].clientY;
      if (Math.abs(dy) < 40 || animating) return;
      var dir = dy > 0 ? 1 : -1;
      if (canAdvance(dir)) {
        activate(idx + dir);
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); activate(idx + 1); }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); activate(idx - 1); }
    });

    // any in-page hash link (nav, side-nav, hero CTA) drives the slide controller
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var targetId = a.getAttribute('href').slice(1);
        var i = slideEls.findIndex(function (s) { return s.id === targetId; });
        if (i !== -1) {
          e.preventDefault();
          activate(i);
        }
      });
    });
  }

  // ---------- scroll reveal for boxed content (non-fullpage / mobile fallback) ----------
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && !isFullpage) {
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

  // ---------- side dot nav: active section highlight (non-fullpage) ----------
  if (sideLinks.length && !isFullpage) {
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

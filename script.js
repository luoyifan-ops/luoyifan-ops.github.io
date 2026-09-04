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
    var committing = false;
    var revealedSlides = new WeakSet();
    var OFFSET = 44;
    var WHEEL_THRESHOLD = 70;
    var wheelTotal = 0;
    var wheelResetTimer = null;

    function hardResetOthers(keepIdx) {
      // defensive cleanup: guarantees no stray slide is left half-visible
      // from an interrupted gesture (this is what caused the "ghost" bleed-through)
      slideEls.forEach(function (s, i) {
        if (i === keepIdx) return;
        s.classList.remove('active', 'settling');
        s.style.transition = 'none';
        s.style.opacity = 0;
        s.style.transform = '';
        s.style.transition = '';
      });
    }

    function revealSlide(slide) {
      if (revealedSlides.has(slide)) return;
      revealedSlides.add(slide);

      var kids = slide.querySelectorAll('.reveal');
      kids.forEach(function (child) {
        child.classList.add('visible');
      });
    }

    function updateDots() {
      sideLinks.forEach(function (a) { a.classList.remove('active'); });
      var link = document.querySelector('.side-nav a[href="#' + slideEls[idx].id + '"]');
      if (link) link.classList.add('active');
    }

    // initial state
    slideEls[0].classList.add('active');
    slideEls[0].style.opacity = 1;
    revealSlide(slideEls[0]);
    updateDots();

    function directTransition(targetIdx) {
      if (targetIdx < 0 || targetIdx >= slideEls.length || targetIdx === idx || committing) return;
      committing = true;
      hardResetOthers(idx);
      var from = slideEls[idx];
      var direction = targetIdx > idx ? 1 : -1;
      var to = slideEls[targetIdx];
      to.style.transition = 'none';
      to.style.opacity = 0;
      to.style.transform = 'translateY(' + (direction > 0 ? OFFSET : -OFFSET) + 'px)';
      to.classList.add('active');
      revealSlide(to);
      void to.offsetWidth;
      to.style.transition = '';
      from.classList.add('settling');
      to.classList.add('settling');
      from.style.opacity = 0;
      from.style.transform = 'translateY(' + (direction > 0 ? -OFFSET : OFFSET) + 'px)';
      to.style.opacity = 1;
      to.style.transform = 'translateY(0px)';

      setTimeout(function () {
        idx = targetIdx;
        hardResetOthers(idx);
        to.classList.remove('settling');
        to.classList.add('active');
        to.style.opacity = 1;
        to.style.transform = 'translateY(0px)';
        var inner = to.querySelector('.slide-inner');
        if (inner) inner.scrollTop = direction > 0 ? 0 : Math.max(0, inner.scrollHeight - inner.clientHeight);
        committing = false;
        updateDots();
        history.replaceState(null, '', '#' + to.id);
      }, 440);
    }

    function canAdvance(dir) {
      var inner = slideEls[idx].querySelector('.slide-inner');
      if (!inner || inner.scrollHeight <= inner.clientHeight + 2) return true;
      if (dir > 0) return inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 2;
      return inner.scrollTop <= 2;
    }

    window.addEventListener('wheel', function (e) {
      if (committing) { e.preventDefault(); return; }

      if (e.deltaY === 0) return;
      var dir = e.deltaY > 0 ? 1 : -1;
      if (!canAdvance(dir)) { wheelTotal = 0; return; }
      var target = idx + dir;
      if (target < 0 || target >= slideEls.length) return;
      e.preventDefault();
      wheelTotal = wheelTotal && Math.sign(wheelTotal) !== dir ? 0 : wheelTotal;
      wheelTotal += e.deltaY;
      clearTimeout(wheelResetTimer);
      wheelResetTimer = setTimeout(function () { wheelTotal = 0; }, 180);
      if (Math.abs(wheelTotal) >= WHEEL_THRESHOLD) {
        wheelTotal = 0;
        directTransition(target);
      }
    }, { passive: false });

    var touchLastY = 0, touchTotal = 0;
    window.addEventListener('touchstart', function (e) {
      touchLastY = e.touches[0].clientY;
      touchTotal = 0;
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (committing) { e.preventDefault(); return; }
      var y = e.touches[0].clientY;
      var dy = touchLastY - y;
      touchLastY = y;
      if (Math.abs(dy) < 1) return;
      var dir = dy > 0 ? 1 : -1;
      if (!canAdvance(dir)) { touchTotal = 0; return; }
      var target = idx + dir;
      if (target < 0 || target >= slideEls.length) return;
      e.preventDefault();
      touchTotal += dy;
      if (Math.abs(touchTotal) >= 50) directTransition(target);
    }, { passive: false });

    window.addEventListener('keydown', function (e) {
      if (committing) return;
      var dir = (e.key === 'ArrowDown' || e.key === 'PageDown') ? 1 :
        ((e.key === 'ArrowUp' || e.key === 'PageUp') ? -1 : 0);
      if (!dir) return;
      e.preventDefault();
      var inner = slideEls[idx].querySelector('.slide-inner');
      if (!canAdvance(dir) && inner) {
        inner.scrollBy({ top: dir * inner.clientHeight * 0.8, behavior: 'smooth' });
        return;
      }
      directTransition(idx + dir);
    });

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var targetId = a.getAttribute('href').slice(1);
        var i = slideEls.findIndex(function (s) { return s.id === targetId; });
        if (i !== -1) {
          e.preventDefault();
          directTransition(i);
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

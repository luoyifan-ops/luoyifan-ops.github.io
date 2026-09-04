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
    var direction = 0;   // -1 or +1 while mid-scrub, 0 when settled
    var progress = 0;    // 0..1 fade progress toward slideEls[idx+direction]
    var committing = false;
    var settleTimer = null;
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

    // initial state
    slideEls[0].classList.add('active');
    slideEls[0].style.opacity = 1;
    revealSlide(slideEls[0]);
    updateDots();

    var OFFSET = 46; // px of vertical travel during the fade

    function applyProgress() {
      var exitY = direction > 0 ? -OFFSET : OFFSET;
      slideEls[idx].style.opacity = String(1 - progress);
      slideEls[idx].style.transform = 'translateY(' + (exitY * progress) + 'px)';
      if (direction !== 0) {
        var t = slideEls[idx + direction];
        var enterY = direction > 0 ? OFFSET : -OFFSET;
        t.classList.add('active');
        t.style.opacity = String(progress);
        t.style.transform = 'translateY(' + (enterY * (1 - progress)) + 'px)';
      }
    }

    function finish(targetIdx) {
      committing = true;
      var from = slideEls[idx];
      from.classList.add('settling');
      var dir = targetIdx > idx ? 1 : (targetIdx < idx ? -1 : direction);
      if (targetIdx !== idx) {
        var to = slideEls[targetIdx];
        to.classList.add('active', 'settling');
        void to.offsetWidth; // force reflow so the transition catches the change
        from.style.opacity = 0;
        from.style.transform = 'translateY(' + (dir > 0 ? -OFFSET : OFFSET) + 'px)';
        to.style.opacity = 1;
        to.style.transform = 'translateY(0px)';
      } else if (direction !== 0) {
        var neighbor = slideEls[idx + direction];
        neighbor.classList.add('settling');
        neighbor.style.opacity = 0;
        neighbor.style.transform = 'translateY(' + (direction > 0 ? OFFSET : -OFFSET) + 'px)';
        from.style.opacity = 1;
        from.style.transform = 'translateY(0px)';
      }
      setTimeout(function () {
        slideEls.forEach(function (s, i) {
          s.classList.remove('settling');
          s.style.transform = '';
          if (i !== targetIdx) { s.classList.remove('active'); s.style.opacity = 0; }
          else { s.style.opacity = 1; }
        });
        idx = targetIdx;
        direction = 0; progress = 0; committing = false;
        var inner = slideEls[idx].querySelector('.slide-inner');
        if (inner) inner.scrollTop = 0;
        revealSlide(slideEls[idx]);
        updateDots();
        history.replaceState(null, '', '#' + slideEls[idx].id);
      }, 440);
    }

    function canAdvance(dir) {
      var inner = slideEls[idx].querySelector('.slide-inner');
      if (!inner) return true;
      if (dir > 0) return inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 2;
      return inner.scrollTop <= 2;
    }

    window.addEventListener('wheel', function (e) {
      if (committing) { e.preventDefault(); return; }

      var dir = e.deltaY > 0 ? 1 : -1;

      if (direction === 0) {
        if (!canAdvance(dir)) return; // let the slide's own content scroll first
        var target = idx + dir;
        if (target < 0 || target >= slideEls.length) return;
        direction = dir;
      } else if (dir !== direction) {
        // user reversed mid-scrub: ease back toward the current slide
        progress = Math.max(0, progress - Math.abs(e.deltaY) / 450);
        e.preventDefault();
        applyProgress();
        clearTimeout(settleTimer);
        settleTimer = setTimeout(function () { finish(progress >= 0.5 ? idx + direction : idx); }, 140);
        return;
      }

      e.preventDefault();
      progress = Math.min(1, progress + Math.abs(e.deltaY) / 450);
      applyProgress();

      clearTimeout(settleTimer);
      settleTimer = setTimeout(function () {
        finish(progress >= 0.5 ? idx + direction : idx);
      }, 140);
    }, { passive: false });

    var touchStartY = 0, touchLastY = 0;
    window.addEventListener('touchstart', function (e) {
      touchStartY = touchLastY = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (committing) return;
      var y = e.touches[0].clientY;
      var dy = touchLastY - y; // positive = finger moving up = scroll down
      touchLastY = y;
      if (Math.abs(dy) < 1) return;
      var dir = dy > 0 ? 1 : -1;

      if (direction === 0) {
        if (!canAdvance(dir)) return;
        var target = idx + dir;
        if (target < 0 || target >= slideEls.length) return;
        direction = dir;
      } else if (dir !== direction) {
        progress = Math.max(0, progress - Math.abs(dy) / 220);
        applyProgress();
        clearTimeout(settleTimer);
        settleTimer = setTimeout(function () { finish(progress >= 0.5 ? idx + direction : idx); }, 160);
        return;
      }

      progress = Math.min(1, progress + Math.abs(dy) / 220);
      applyProgress();
      clearTimeout(settleTimer);
      settleTimer = setTimeout(function () {
        finish(progress >= 0.5 ? idx + direction : idx);
      }, 160);
    }, { passive: true });

    window.addEventListener('keydown', function (e) {
      if (committing) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        if (idx + 1 < slideEls.length) { direction = 1; progress = 1; applyProgress(); finish(idx + 1); }
      }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        if (idx - 1 >= 0) { direction = -1; progress = 1; applyProgress(); finish(idx - 1); }
      }
    });

    function jumpTo(targetIdx) {
      if (targetIdx === idx || committing) return;
      direction = targetIdx > idx ? 1 : -1;
      progress = 1;
      var enterY = direction > 0 ? OFFSET : -OFFSET;
      slideEls[targetIdx].style.opacity = 0;
      slideEls[targetIdx].style.transform = 'translateY(' + enterY + 'px)';
      slideEls[targetIdx].classList.add('active');
      applyProgress();
      finish(targetIdx);
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var targetId = a.getAttribute('href').slice(1);
        var i = slideEls.findIndex(function (s) { return s.id === targetId; });
        if (i !== -1) {
          e.preventDefault();
          jumpTo(i);
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

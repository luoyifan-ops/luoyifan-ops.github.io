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
    var OFFSET = 78; // px of vertical travel during the fade — bumped up so the motion actually reads

    function hardResetOthers(keepIdx) {
      // defensive cleanup: guarantees no stray slide is left half-visible
      // from an interrupted gesture (this is what caused the "ghost" bleed-through)
      slideEls.forEach(function (s, i) {
        if (i === keepIdx) return;
        s.classList.remove('active', 'settling');
        s.style.transition = 'none';
        s.style.opacity = 0;
        s.style.transform = '';
        void s.offsetWidth;
        s.style.transition = '';
      });
    }

    function revealSlide(slide) {
      if (revealedSlides.has(slide)) return;
      revealedSlides.add(slide);

      if (slide.id === 'projects') {
        var intro = slide.querySelector('.proj-intro');
        var head = slide.querySelector('.block-head');
        setTimeout(function () {
          if (intro) intro.classList.add('hide');
          if (head) head.classList.add('show');
        }, 600);
        var kids = slide.querySelectorAll('.reveal');
        kids.forEach(function (child, i) {
          setTimeout(function () { child.classList.add('visible'); }, 1050 + i * 110);
        });
        return;
      }

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
      var dir = targetIdx > idx ? 1 : (targetIdx < idx ? -1 : direction);
      from.classList.add('settling');
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
        slideEls.forEach(function (s) { s.classList.remove('settling'); });
        hardResetOthers(targetIdx);
        slideEls[targetIdx].classList.add('active');
        slideEls[targetIdx].style.opacity = 1;
        idx = targetIdx;
        direction = 0; progress = 0; committing = false;
        var inner = slideEls[idx].querySelector('.slide-inner');
        if (inner) inner.scrollTop = 0;
        revealSlide(slideEls[idx]);
        updateDots();
        history.replaceState(null, '', '#' + slideEls[idx].id);
      }, 480);
    }

    // begins a transition that isn't driven by a continuous gesture
    // (keyboard, nav click, side-nav dot) — sets the incoming slide's
    // starting position instantly, then lets finish() animate it in.
    function directTransition(targetIdx) {
      if (targetIdx < 0 || targetIdx >= slideEls.length || targetIdx === idx || committing) return;
      hardResetOthers(idx);
      direction = targetIdx > idx ? 1 : -1;
      var enterY = direction > 0 ? OFFSET : -OFFSET;
      var to = slideEls[targetIdx];
      to.style.transition = 'none';
      to.style.opacity = 0;
      to.style.transform = 'translateY(' + enterY + 'px)';
      to.classList.add('active');
      void to.offsetWidth;
      to.style.transition = '';
      finish(targetIdx);
    }

    function canAdvance() {
      return true; // every wheel/touch tick advances the page — no more getting stuck
                   // scrolling through a tall section before it'll let you continue
    }

    window.addEventListener('wheel', function (e) {
      if (committing) { e.preventDefault(); return; }

      var dir = e.deltaY > 0 ? 1 : -1;

      if (direction === 0) {
        if (!canAdvance()) return; // let the slide's own content scroll first
        var target = idx + dir;
        if (target < 0 || target >= slideEls.length) return;
        hardResetOthers(idx);
        direction = dir;
      } else if (dir !== direction) {
        // user reversed mid-scrub: ease back toward the current slide
        progress = Math.max(0, progress - Math.abs(e.deltaY) / 380);
        e.preventDefault();
        applyProgress();
        clearTimeout(settleTimer);
        settleTimer = setTimeout(function () { finish(progress >= 0.5 ? idx + direction : idx); }, 140);
        return;
      }

      e.preventDefault();
      progress = Math.min(1, progress + Math.abs(e.deltaY) / 380);
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
        if (!canAdvance()) return;
        var target = idx + dir;
        if (target < 0 || target >= slideEls.length) return;
        hardResetOthers(idx);
        direction = dir;
      } else if (dir !== direction) {
        progress = Math.max(0, progress - Math.abs(dy) / 200);
        applyProgress();
        clearTimeout(settleTimer);
        settleTimer = setTimeout(function () { finish(progress >= 0.5 ? idx + direction : idx); }, 160);
        return;
      }

      progress = Math.min(1, progress + Math.abs(dy) / 200);
      applyProgress();
      clearTimeout(settleTimer);
      settleTimer = setTimeout(function () {
        finish(progress >= 0.5 ? idx + direction : idx);
      }, 160);
    }, { passive: true });

    window.addEventListener('keydown', function (e) {
      if (committing) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); directTransition(idx + 1); }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); directTransition(idx - 1); }
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

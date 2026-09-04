document.addEventListener('DOMContentLoaded', function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Meaningful chart annotations on the case-study pages.
  var tooltipTargets = document.querySelectorAll('[data-tooltip]');
  if (tooltipTargets.length) {
    var tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    document.body.appendChild(tooltip);
    function showTooltip(x, y, text) {
      tooltip.textContent = text;
      tooltip.style.left = Math.min(x + 14, window.innerWidth - 280) + 'px';
      tooltip.style.top = (y + 14) + 'px';
      tooltip.classList.add('visible');
    }
    tooltipTargets.forEach(function (el) {
      el.addEventListener('pointerenter', function (e) { showTooltip(e.clientX, e.clientY, el.getAttribute('data-tooltip')); });
      el.addEventListener('pointermove', function (e) { showTooltip(e.clientX, e.clientY, el.getAttribute('data-tooltip')); });
      el.addEventListener('pointerleave', function () { tooltip.classList.remove('visible'); });
    });
  }

  var revealEls = document.querySelectorAll('.reveal-group');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  // Whole-word rotation keeps the headline alive without a typewriter effect.
  var rotator = document.querySelector('.rotator');
  if (rotator && !reducedMotion) {
    var words = ['evidence.', 'strategy.', 'decisions.'];
    var wordIndex = 0;
    window.setInterval(function () {
      var current = rotator.querySelector('span');
      current.className = 'out';
      window.setTimeout(function () {
        wordIndex = (wordIndex + 1) % words.length;
        var next = document.createElement('span');
        next.textContent = words[wordIndex];
        next.className = 'in';
        rotator.replaceChildren(next);
      }, 300);
    }, 3000);
  }

  // Animate only the three hero proof points, once.
  var counters = document.querySelectorAll('.count');
  if (counters.length && !reducedMotion && 'IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = Number(el.dataset.count);
        var suffix = el.dataset.suffix || '';
        var start = performance.now();
        function tick(now) {
          var progress = Math.min(1, (now - start) / 850);
          var eased = 1 - Math.pow(1 - progress, 3);
          var value = Math.round(target * eased);
          el.textContent = (el.dataset.format === 'comma' ? value.toLocaleString('en-US') : value) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.7 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  var sections = Array.prototype.slice.call(document.querySelectorAll('.snap-section[id]'));
  var sideLinks = Array.prototype.slice.call(document.querySelectorAll('.side-nav a'));
  var progressFill = document.querySelector('.side-progress span');
  var timeline = document.querySelector('.timeline');
  var timelineItems = Array.prototype.slice.call(document.querySelectorAll('.timeline-item'));
  var heroBackdrop = document.querySelector('.hero-backdrop');
  var scrollQueued = false;

  function updateScrollEffects() {
    scrollQueued = false;
    var viewportMid = window.scrollY + window.innerHeight * 0.46;
    var activeIndex = 0;
    sections.forEach(function (section, index) {
      if (section.offsetTop <= viewportMid) activeIndex = index;
    });
    sideLinks.forEach(function (link, index) {
      link.classList.toggle('active', index === activeIndex);
      link.classList.toggle('complete', index < activeIndex);
      if (index === activeIndex) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (progressFill && sideLinks.length > 1) {
      progressFill.style.height = (activeIndex / (sideLinks.length - 1) * 100) + '%';
    }

    if (timeline) {
      var rect = timeline.getBoundingClientRect();
      var timelineProgress = Math.max(0, Math.min(1, (window.innerHeight * 0.58 - rect.top) / Math.max(1, rect.height)));
      timeline.style.setProperty('--timeline-progress', (timelineProgress * 100) + '%');
      var nearest = 0;
      var nearestDistance = Infinity;
      timelineItems.forEach(function (item, index) {
        var distance = Math.abs(item.getBoundingClientRect().top - window.innerHeight * 0.42);
        if (distance < nearestDistance) { nearest = index; nearestDistance = distance; }
      });
      timelineItems.forEach(function (item, index) { item.classList.toggle('is-current', index === nearest); });
    }

    if (heroBackdrop && !reducedMotion && window.scrollY < window.innerHeight * 1.2) {
      heroBackdrop.style.transform = 'translate3d(0,' + (window.scrollY * 0.14) + 'px,0)';
    }
  }

  function queueScrollEffects() {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScrollEffects); }
  }
  if (sections.length) {
    updateScrollEffects();
    window.addEventListener('scroll', queueScrollEffects, { passive: true });
    window.addEventListener('resize', queueScrollEffects);
  }

  // Short directional fallback for project-to-case navigation.
  document.querySelectorAll('a.project-card').forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || reducedMotion) return;
      event.preventDefault();
      var destination = link.href;
      document.querySelectorAll('.project-card').forEach(function (card) {
        if (card !== link) card.style.opacity = '.35';
      });
      link.style.transform = 'translateY(-8px) scale(1.015)';
      document.querySelector('main').classList.add('page-leaving');
      window.setTimeout(function () { window.location.href = destination; }, 300);
    });
  });
});

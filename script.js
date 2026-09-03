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
});

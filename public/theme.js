(function () {
  var KEY = 'launchpad-theme';
  function read() {
    try { var v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : 'system'; } catch (e) { return 'system'; }
  }
  function apply(v) {
    if (v === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', v);
  }
  apply(read());
  document.addEventListener('DOMContentLoaded', function () {
    var group = document.getElementById('theme');
    var current = read();
    group.querySelectorAll('input').forEach(function (input) {
      input.checked = input.value === current;
      input.addEventListener('change', function () {
        apply(input.value);
        try { localStorage.setItem(KEY, input.value); } catch (e) {}
      });
    });
  });
})();

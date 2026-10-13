/* 관리자 화면 주간/야간 전환 (메인 포트폴리오와 같은 저장 키 'poke_theme' 사용) */
(function () {
  'use strict';
  var btn = document.getElementById('btn-theme-toggle');
  var icon = document.getElementById('theme-icon');
  function paint() {
    if (icon) icon.className = document.body.classList.contains('dark-theme') ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
  try {
    if (localStorage.getItem('poke_theme') === 'dark') document.body.classList.add('dark-theme');
  } catch (e) { /* 저장소를 못 쓰면 기본 테마 */ }
  paint();
  if (btn) {
    btn.addEventListener('click', function () {
      document.body.classList.toggle('dark-theme');
      try { localStorage.setItem('poke_theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light'); } catch (e) { }
      paint();
    });
  }
})();

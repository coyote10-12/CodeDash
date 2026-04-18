function start() {
  const levelButtons = document.querySelectorAll('.levels button');
  levelButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lvl = parseInt(btn.getAttribute('data-level'), 10);
      localStorage.setItem('level', lvl);
      window.location.href = 'main.html';
    });
  });
  
  document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'index.html';
  });

}

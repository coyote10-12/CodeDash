function start() {
  const buttons = document.querySelectorAll('.grid button');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-player');
        localStorage.setItem('player', type);
        alert('Selected: ' + type.toUpperCase());
      });
    });
    
    document.getElementById('backBtn').addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  
}

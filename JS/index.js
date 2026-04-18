function start() {

  document.getElementById('startBtn').addEventListener('click', () => {
    // go to level select
    window.location.href = 'file.html';
  });
  
  document.getElementById('playerBtn').addEventListener('click', () => {
    window.location.href = 'default.html';
  });
  
}

function start() {
  
  document.getElementById('resumeBtn').addEventListener('click', () => {
    // just go back to the game
    window.location.href = 'main.html';
  });
  
  document.getElementById('levelSelectBtn').addEventListener('click', () => {
    window.location.href = 'file.html';
  });
  
  document.getElementById('menuBtn').addEventListener('click', () => {
    window.location.href = 'index.html';
  });

}

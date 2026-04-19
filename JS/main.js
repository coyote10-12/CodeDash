function start() {
  
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  
  let keys = {};
  window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === 'Escape') {
      window.location.href = 'style.html';
    }
  });
  window.addEventListener('keyup', e => {
    keys[e.key.toLowerCase()] = false;
  });
  
  /* ---- Player selection & level ---- */
  const playerType = localStorage.getItem('player') || 'c';
  const currentLevelIndex = parseInt(localStorage.getItem('level'), 10) || 1;
  
  document.getElementById('hudPlayer').textContent = 'Player: ' + playerType.toUpperCase();
  document.getElementById('hudLevel').textContent = 'Level: ' + currentLevelIndex;
  
  /* ---- Player stats by language ---- */
  function getPlayerStats(type){
    // base
    let speed = 3.2;
    let jump = 11;
    let maxHealth = 3;
    let dashSpeed = 0;
    let jumpModifier = 1;
  
    switch(type){
      case 'c': // balanced
        break;
      case 'cpp': // faster movement
        speed = 4.2;
        break;
      case 'csharp': // higher jump
        jump = 13;
        break;
      case 'java': // extra health
        maxHealth = 4;
        break;
      case 'js': // faster dash
        dashSpeed = 6;
        break;
      case 'python': // slower but longer jump
        speed = 2.6;
        jump = 12.5;
        jumpModifier = 1.1;
        break;
    }
    return {speed, jump, maxHealth, dashSpeed, jumpModifier};
  }
  
  const stats = getPlayerStats(playerType);
  let health = stats.maxHealth;
  document.getElementById('hudHealth').textContent = 'Health: ' + health;
  
  /* ---- Level data ---- */
  const levels = {
    1: {
      platforms: [
        {x:0,y:480,w:960,h:60}, // ground
        {x:200,y:400,w:120,h:20},
        {x:400,y:340,w:120,h:20},
        {x:650,y:300,w:120,h:20}
      ],
      spikes: [
        {x:350,y:460},
      ],
      checkpoints: [
        {x:220,y:380}
      ],
      goal: {x:880,y:440}
    },
    2: {
      platforms: [
        {x:0,y:480,w:960,h:60},
        {x:150,y:420,w:100,h:20},
        {x:320,y:360,w:80,h:10},   // half platform
        {x:480,y:320,w:80,h:10},
        {x:640,y:360,w:100,h:20},
        {x:780,y:320,w:80,h:10}
      ],
      spikes: [
        {x:260,y:460},
        {x:540,y:460},
        {x:700,y:460}
      ],
      checkpoints: [
        {x:340,y:340},
        {x:680,y:340}
      ],
      goal: {x:900,y:440}
    },
    3: {
      platforms: [
        {x:0,y:480,w:960,h:60},
        {x:140,y:420,w:80,h:10},
        {x:260,y:380,w:80,h:10},
        {x:380,y:340,w:80,h:10},
        {x:500,y:300,w:80,h:10},
        {x:620,y:340,w:80,h:10},
        {x:740,y:380,w:80,h:10}
      ],
      spikes: [
        {x:200,y:460},
        {x:320,y:460},
        {x:440,y:460},
        {x:560,y:460},
        {x:680,y:460}
      ],
      checkpoints: [
        {x:260,y:360},
        {x:500,y:280},
        {x:740,y:360}
      ],
      goal: {x:900,y:440}
    },
    4: {
      platforms: [
        {x:0,y:480,w:960,h:60},
        {x:120,y:420,w:100,h:20},
        {x:260,y:360,w:80,h:10},
        {x:380,y:320,w:80,h:10},
        {x:520,y:360,w:100,h:20},
        {x:680,y:320,w:80,h:10},
        {x:820,y:280,w:80,h:10}
      ],
      spikes: [
        {x:220,y:460},
        {x:340,y:460},
        {x:460,y:460},
        {x:580,y:460},
        {x:700,y:460},
        {x:820,y:460}
      ],
      checkpoints: [
        {x:260,y:340},
        {x:520,y:340}
      ],
      goal: {x:900,y:260}
    },
    5: {
      platforms: [
        {x:0,y:480,w:960,h:60},
        {x:160,y:420,w:80,h:10},
        {x:280,y:380,w:80,h:10},
        {x:400,y:340,w:80,h:10},
        {x:520,y:300,w:80,h:10},
        {x:640,y:260,w:80,h:10},
        {x:760,y:300,w:80,h:10},
        {x:880,y:340,w:80,h:10}
      ],
      spikes: [
        {x:220,y:460},
        {x:340,y:460},
        {x:460,y:460},
        {x:580,y:460},
        {x:700,y:460},
        {x:820,y:460}
      ],
      checkpoints: [
        {x:280,y:360},
        {x:520,y:280}
      ],
      goal: {x:900,y:320}
    }
  };
  
  const level = levels[currentLevelIndex] || levels[1];
  
  /* ---- Player ---- */
  const player = {
    x:50,
    y:400,
    w:32,
    h:48,
    vx:0,
    vy:0,
    onGround:false,
    facing:1,
    dashTimer:0
  };
  
  let currentCheckpoint = {x:player.x, y:player.y};
  if (level.checkpoints && level.checkpoints.length > 0) {
    currentCheckpoint = {x:level.checkpoints[0].x, y:level.checkpoints[0].y};
  }
  
  /* ---- Helpers ---- */
  function rectsOverlap(a,b){
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
  }
  
  /* ---- Game loop ---- */
  let last = performance.now();
  function loop(now){
    const dt = Math.min(40, now - last) / 16.67;
    last = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  
  /* ---- Update ---- */
  function update(dt){
    // movement input
    const left = keys['arrowleft'] || keys['a'];
    const right = keys['arrowright'] || keys['d'];
    const jumpKey = keys['w'] || keys['arrowup'] || keys[' '];
  
    if (left) {
      player.vx = -stats.speed;
      player.facing = -1;
    } else if (right) {
      player.vx = stats.speed;
      player.facing = 1;
    } else {
      player.vx *= 0.8;
    }
  
    // dash (JS only)
    if (stats.dashSpeed > 0 && keys['shift']) {
      player.vx = stats.dashSpeed * player.facing;
    }
  
    // jump
    if (jumpKey && player.onGround) {
      player.vy = -stats.jump * stats.jumpModifier;
      player.onGround = false;
    }
  
    // gravity
    player.vy += 0.6;
    if (player.vy > 18) player.vy = 18;
  
    // apply movement
    player.x += player.vx;
    player.y += player.vy;
  
    // collision with platforms
    player.onGround = false;
    level.platforms.forEach(p => {
      const rect = {x:p.x,y:p.y,w:p.w,h:p.h};
      const prevY = player.y - player.vy;
      if (rectsOverlap({x:player.x,y:player.y,w:player.w,h:player.h}, rect)) {
        // coming from above
        if (prevY + player.h <= p.y) {
          player.y = p.y - player.h;
          player.vy = 0;
          player.onGround = true;
        } else if (prevY >= p.y + p.h) {
          // hitting from below
          player.y = p.y + p.h;
          player.vy = 0;
        } else {
          // side collision
          if (player.x + player.w/2 < p.x + p.w/2) {
            player.x = p.x - player.w;
          } else {
            player.x = p.x + p.w;
          }
          player.vx = 0;
        }
      }
    });
  
    // spikes (triangle but treat as rect at base)
    for (const s of level.spikes) {
      const spikeRect = {x:s.x,y:s.y,w:32,h:20};
      if (rectsOverlap({x:player.x,y:player.y,w:player.w,h:player.h}, spikeRect)) {
        damageAndRespawn();
        break;
      }
    }
  
    // checkpoints
    if (level.checkpoints) {
      for (const c of level.checkpoints) {
        const cpRect = {x:c.x-10,y:c.y-30,w:20,h:30};
        if (rectsOverlap({x:player.x,y:player.y,w:player.w,h:player.h}, cpRect)) {
          currentCheckpoint = {x:c.x,y:c.y};
        }
      }
    }
  
    // goal
    if (level.goal) {
      const g = level.goal;
      const goalRect = {x:g.x,y:g.y,w:40,h:40};
      if (rectsOverlap({x:player.x,y:player.y,w:player.w,h:player.h}, goalRect)) {
        alert('Level complete!');
        // optionally auto-advance
        const next = Math.min(5, currentLevelIndex + 1);
        localStorage.setItem('level', next);
        window.location.href = 'file.html';
      }
    }
  
    // bounds
    if (player.y > H + 200) {
      damageAndRespawn();
    }
  }
  
  /* ---- Damage & respawn ---- */
  function damageAndRespawn(){
    health -= 1;
    if (health <= 0) {
      alert('Game Over');
      health = stats.maxHealth;
      localStorage.setItem('level', 1);
      window.location.href = 'index.html';
      return;
    }
    document.getElementById('hudHealth').textContent = 'Health: ' + health;
    player.x = currentCheckpoint.x;
    player.y = currentCheckpoint.y;
    player.vx = 0;
    player.vy = 0;
  }
  
  /* ---- Render ---- */
  function render(){
    ctx.clearRect(0,0,W,H);
  
    // background
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#0f172a');
    g.addColorStop(1,'#020617');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);
  
    // platforms
    level.platforms.forEach(p => {
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(p.x,p.y,p.w,p.h);
    });
  
    // spikes (triangles)
    level.spikes.forEach(s => {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(s.x + 16, s.y);      // top
      ctx.lineTo(s.x, s.y + 20);      // left
      ctx.lineTo(s.x + 32, s.y + 20); // right
      ctx.closePath();
      ctx.fill();
    });
  
    // checkpoints
    if (level.checkpoints) {
      level.checkpoints.forEach(c => {
        const active = (c.x === currentCheckpoint.x && c.y === currentCheckpoint.y);
        ctx.fillStyle = active ? '#22c55e' : '#6b7280';
        ctx.fillRect(c.x-6, c.y-30, 12, 30);
      });
    }
  
    // goal
    if (level.goal) {
      const g = level.goal;
      ctx.fillStyle = '#eab308';
      ctx.fillRect(g.x, g.y, 40, 40);
    }
  
    // player (simple rect; you can swap to images)
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(player.x, player.y, player.w, player.h);
  }

}

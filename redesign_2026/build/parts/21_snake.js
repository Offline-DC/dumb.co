
  /* ==========================================================================
     Grant's snake, ported out of src/Phone/SnakeGame.tsx
     Same rules as the live site: 12x15 grid, 200ms tick easing down to 80ms,
     walls kill you, and the same ↑ ↑ ↓ ↓ ← → unlock from Phone.tsx. It plays
     inside the flip-phone illustration's screen on about.exe, driven by the
     drawn keypad (invisible hotspots over the nav ring) or the arrow keys.
     ========================================================================== */
  const SNK = { COLS: 12, ROWS: 15, START: 200, DECREMENT: 25, MIN: 80 };
  const SNAKE_SEQUENCE = ['up', 'up', 'down', 'down', 'left', 'right'];
  const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

  let snake = null;          // null while the screen is showing portraits
  let snakeTimer = null;
  let seqBuf = [];

  const screenEl = () => document.getElementById('tcl-screen');
  /* the phone sits behind the .exe window, so it is only playable once that
     window has been shrunk into the egg — otherwise arrow keys would fight
     with whatever section is open */
  const phonePlayable = () => !!document.querySelector('#winmodal.collapsed');

  /* every keypad press goes through here: it either drives the game or feeds
     the unlock sequence */
  function teamKey(dir){
    if(!phonePlayable()) return;
    if(snake){ snakeTurn(dir); return; }
    seqBuf = seqBuf.concat(dir).slice(-SNAKE_SEQUENCE.length);
    if(seqBuf.join(',') === SNAKE_SEQUENCE.join(',')){ seqBuf = []; startSnake(); }
  }

  function randomFood(body){
    let f;
    do {
      f = { x: Math.floor(Math.random() * SNK.COLS), y: Math.floor(Math.random() * SNK.ROWS) };
    } while(body.some(s => s.x === f.x && s.y === f.y));
    return f;
  }

  function startSnake(){
    const scr = screenEl();
    if(!scr) return;
    const body = [{x:6,y:7},{x:6,y:8},{x:6,y:9}];
    snake = { body, food: randomFood(body), dir: 'up', pending: 'up',
              score: 0, speed: SNK.START, over: false };

    scr.classList.add('playing');
    const cells = Array.from({length: SNK.COLS * SNK.ROWS}, () => '<i></i>').join('');
    let root = document.getElementById('snake-root');
    if(!root){
      root = document.createElement('div');
      root.id = 'snake-root';
      scr.appendChild(root);
    }
    root.innerHTML = `
      <div class="sn-hud"><span class="sn-pill"></span><b>0</b></div>
      <div class="sn-grid" id="sn-grid"
           style="grid-template-columns:repeat(${SNK.COLS},1fr);grid-template-rows:repeat(${SNK.ROWS},1fr);">${cells}</div>`;
    drawSnake();
    snakeLoop();
  }

  function snakeLoop(){
    clearInterval(snakeTimer);
    snakeTimer = setInterval(snakeTick, snake.speed);
  }

  function snakeTurn(dir){
    if(!snake || snake.over) return;
    if(OPPOSITE[dir] === snake.dir) return;   // no reversing, same as the original
    snake.pending = dir;
  }

  function snakeTick(){
    if(!snake || snake.over) return;
    snake.dir = snake.pending;
    const head = snake.body[0];
    const next = {
      x: head.x + (snake.dir === 'right' ? 1 : snake.dir === 'left' ? -1 : 0),
      y: head.y + (snake.dir === 'down'  ? 1 : snake.dir === 'up'   ? -1 : 0),
    };
    if(next.x < 0 || next.x >= SNK.COLS || next.y < 0 || next.y >= SNK.ROWS) return snakeOver();

    const ate = next.x === snake.food.x && next.y === snake.food.y;
    snake.body = ate ? [next, ...snake.body] : [next, ...snake.body.slice(0, -1)];
    if(ate){
      snake.score += 1;
      snake.food = randomFood(snake.body);
      snake.speed = Math.max(SNK.MIN, snake.speed - SNK.DECREMENT);
      snakeLoop();
    }
    drawSnake();
  }

  function drawSnake(){
    const grid = document.getElementById('sn-grid');
    if(!grid) return;
    const cells = grid.children;
    const set = new Set(snake.body.map(s => s.x + ',' + s.y));
    const head = snake.body[0];
    for(let y = 0; y < SNK.ROWS; y++){
      for(let x = 0; x < SNK.COLS; x++){
        const el = cells[y * SNK.COLS + x];
        const isHead = head.x === x && head.y === y;
        const isFood = snake.food.x === x && snake.food.y === y;
        el.className = isHead ? 'head' : set.has(x + ',' + y) ? 'body' : isFood ? 'food' : '';
      }
    }
    const hud = document.querySelector('#snake-root .sn-hud b');
    if(hud) hud.textContent = snake.score;
  }

  function snakeOver(){
    snake.over = true;
    clearInterval(snakeTimer);
    const root = document.getElementById('snake-root');
    if(root) root.innerHTML =
      `<div class="sn-over"><span>GAME<br/>OVER</span><b>${snake.score}</b><i>back to the team…</i></div>`;
    setTimeout(stopSnake, 3000);   // the original returns to the menu after 3s
  }

  function stopSnake(){
    clearInterval(snakeTimer);
    snakeTimer = null;
    snake = null;
    seqBuf = [];
    const root = document.getElementById('snake-root');
    if(root) root.remove();
    screenEl()?.classList.remove('playing');
  }

  /* arrow keys work too, but only while about.exe is the open window */
  window.addEventListener('keydown', (e) => {
    if(!screenEl() || !phonePlayable()) return;
    const dir = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right' }[e.key];
    if(!dir) return;
    e.preventDefault();
    teamKey(dir);
  });

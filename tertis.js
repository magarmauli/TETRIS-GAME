(() => {
    const ROWS = 20;
    const COLS = 10;

    const POINTS = [0, 40, 100, 300, 1200];

    const COLORS = [
      null,
      "block-1",
      "block-2",
      "block-3",
      "block-4",
      "block-5",
      "block-6",
      "block-7",
    ];

    const SHAPES = [
      [],
      // I
      [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0],
      ],
      // J
      [
        [2,0,0],
        [2,2,2],
        [0,0,0],
      ],
      // L
      [
        [0,0,3],
        [3,3,3],
        [0,0,0],
      ],
      // O
      [
        [4,4],
        [4,4],
      ],
      // S
      [
        [0,5,5],
        [5,5,0],
        [0,0,0],
      ],
      // T
      [
        [0,6,0],
        [6,6,6],
        [0,0,0],
      ],
      // Z
      [
        [7,7,0],
        [0,7,7],
        [0,0,0],
      ],
    ];

    const boardElement = document.getElementById("board");
    const nextElement = document.getElementById("next");
    const scoreElement = document.getElementById("score");
    const linesElement = document.getElementById("lines");
    const gameOverElement = document.getElementById("game-over");
    const pauseButton = document.getElementById("pause-button");
    const restartButton = document.getElementById("restart-button");

    let board = [];
    let currentPiece;
    let currentX, currentY;
    let dropInterval = 1000;
    let dropCounter = 0;
    let lastTime = 0;
    let nextPiece;
    let score = 0;
    let linesCleared = 0;
    let gameRunning = false;
    let gamePaused = false;


    function createBoard() {
      return Array.from({length: ROWS}, () => new Array(COLS).fill(0));
    }

    // Draw the board and current piece
    function renderBoard() {
      boardElement.innerHTML = "";
      for(let r=0; r<ROWS; r++) {
        for(let c=0; c<COLS; c++) {
          const cell = document.createElement("div");
          cell.className = "cell";
          if(board[r][c] !== 0) {
            cell.classList.add(COLORS[board[r][c]]);
          }
          boardElement.appendChild(cell);
        }
      }
      if(currentPiece) {
        for(let r=0; r<currentPiece.length; r++){
          for(let c=0; c<currentPiece[r].length; c++){
            if(currentPiece[r][c] !== 0){
              const x = currentX + c;
              const y = currentY + r;
              if(y>=0 && y<ROWS && x>=0 && x<COLS){
                const index = y * COLS + x;
                boardElement.children[index].classList.add(COLORS[currentPiece[r][c]]);
              }
            }
          }
        }
      }
    }

    // Draw the next piece preview
    function renderNext() {
      nextElement.innerHTML = "";
      for(let r=0; r<4; r++){
        for(let c=0; c<4; c++){
          const cell = document.createElement("div");
          cell.className = "cell";
          if(nextPiece && r < nextPiece.length && c < nextPiece[r].length && nextPiece[r][c] !== 0){
            cell.classList.add(COLORS[nextPiece[r][c]]);
          }
          nextElement.appendChild(cell);
        }
      }
    }

    // Rotate matrix clockwise
    function rotate(matrix){
      const N = matrix.length;
      let result = Array.from({length: N}, () => new Array(N).fill(0));
      for(let r=0; r<N; r++){
        for(let c=0; c<N; c++){
          result[c][N-1-r] = matrix[r][c];
        }
      }
      return result;
    }

    // Check for collision
    function collide(board, piece, x, y){
      for(let r=0; r<piece.length; r++){
        for(let c=0; c<piece[r].length; c++){
          if(piece[r][c] !== 0){
            let px = x + c;
            let py = y + r;
            if(px < 0 || px >= COLS || py >= ROWS || (py >= 0 && board[py][px] !== 0)){
              return true;
            }
          }
        }
      }
      return false;
    }

    // Merge piece into board
    function merge(piece, x, y){
      for(let r=0; r<piece.length; r++){
        for(let c=0; c<piece[r].length; c++){
          if(piece[r][c] !== 0){
            let px = x + c;
            let py = y + r;
            if(px>=0 && px<COLS && py>=0 && py<ROWS){
              board[py][px] = piece[r][c];
            }
          }
        }
      }
    }

    // Clear full lines and update score
    function clearLines(){
      let lines = 0;
      outer: for(let r=ROWS-1; r>=0; r--){
        for(let c=0; c<COLS; c++){
          if(board[r][c] === 0) continue outer;
        }
        const row = board.splice(r, 1)[0].fill(0);
        board.unshift(row);
        lines++;
        r++;
      }
      if(lines > 0){
        score += POINTS[lines];
        linesCleared += lines;
        updateScore();
      }
    }

    // Update score and lines display
    function updateScore(){
      scoreElement.textContent = score;
      linesElement.textContent = linesCleared;
    }

    // Create piece by type
    function createPiece(type){
      return SHAPES[type].map(row => row.slice());
    }

    // Drop piece by one row or place if collision
    function drop(){
      if(!gameRunning || gamePaused) return;
      if(!collide(board, currentPiece, currentX, currentY + 1)){
        currentY++;
      } else {
        merge(currentPiece, currentX, currentY);
        clearLines();
        spawnPiece();
        if(collide(board, currentPiece, currentX, currentY)){
          gameOver();
        }
      }
      renderBoard();
    }

    // Hard drop piece
    function hardDrop(){
      if(!gameRunning || gamePaused) return;
      while(!collide(board, currentPiece, currentX, currentY + 1)){
        currentY++;
      }
      drop();
    }

    // Move piece
    function move(dir){
      if(!gameRunning || gamePaused) return;
      if(!collide(board, currentPiece, currentX + dir, currentY)){
        currentX += dir;
        renderBoard();
      }
    }

    // Rotate piece
    function rotatePiece(){
      if(!gameRunning || gamePaused) return;
      let rotated = rotate(currentPiece);
      let offset = 0;
      while(collide(board, rotated, currentX + offset, currentY)){
        offset = offset > 0 ? -offset : 1 - offset;
        if(offset > currentPiece[0].length) return;
      }
      currentPiece = rotated;
      currentX += offset;
      renderBoard();
    }

    function spawnPiece(){
      currentPiece = nextPiece || createPiece(randomInt(1, SHAPES.length-1));
      nextPiece = createPiece(randomInt(1, SHAPES.length-1));
      currentX = Math.floor(COLS / 2) - Math.floor(currentPiece[0].length / 2);
      currentY = -getTopOffset(currentPiece);
      renderNext();
      updateScore();
    }

    function getTopOffset(piece){
      for(let r=0; r<piece.length; r++){
        for(let c=0; c<piece[r].length; c++){
          if(piece[r][c] !== 0) return r;
        }
      }
      return 0;
    }

    // Game over - show overlay
    function gameOver(){
      gameRunning = false;
      gamePaused = false;
      gameOverElement.classList.add("visible");
      gameOverElement.setAttribute("aria-hidden", "false");
      gameOverElement.focus();
      pauseButton.textContent = "Pause";
      pauseButton.setAttribute("aria-pressed", "false");
    }

    // Reset / start game
    function resetGame(){
      board = createBoard();
      score = 0;
      linesCleared = 0;
      dropInterval = 1000;
      currentX = 0;
      currentY = 0;
      currentPiece = null;
      nextPiece = null;
      gameRunning = true;
      gamePaused = false;
      spawnPiece();
      renderBoard();
      updateScore();
      gameOverElement.classList.remove("visible");
      gameOverElement.setAttribute("aria-hidden", "true");
      lastTime = 0;
      pauseButton.textContent = "Pause";
      pauseButton.setAttribute("aria-pressed", "false");
    }

    function randomInt(min, max){
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Game loop - auto drop pieces with time
    function update(time = 0){
      if(!gameRunning || gamePaused) return;
      const deltaTime = time - lastTime;
      lastTime = time;
      dropCounter += deltaTime;
      if(dropCounter > dropInterval){
        drop();
        dropCounter = 0;
      }
      requestAnimationFrame(update);
    }

    // Keyboard controls
    document.addEventListener("keydown", e => {
      if(!gameRunning && e.key !== "Enter" && e.key !== " ") return;
      switch(e.key){
        case "ArrowLeft":
          e.preventDefault();
          move(-1);
          break;
        case "ArrowRight":
          e.preventDefault();
          move(1);
          break;
        case "ArrowDown":
          e.preventDefault();
          drop();
          break;
        case "ArrowUp":
          e.preventDefault();
          rotatePiece();
          break;
        case " ":
          e.preventDefault();
          hardDrop();
          break;
        case "Enter":
          if(!gameRunning){
            resetGame();
            update();
          }
          break;
      }
    });

    pauseButton.addEventListener("click", () => {
      if(!gameRunning) return;
      gamePaused = !gamePaused;
      pauseButton.textContent = gamePaused ? "Resume" : "Pause";
      pauseButton.setAttribute("aria-pressed", gamePaused.toString());
      if(!gamePaused){
        lastTime = performance.now();
        update();
      }
    });

    restartButton.addEventListener("click", () => {
      resetGame();
      update();
    });

    gameOverElement.addEventListener("click", () => {
      resetGame();
      update();
    });

    // Initialize game
    resetGame();
    update();

  })();
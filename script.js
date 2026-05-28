const boardCanvas = document.getElementById("game-board");
const boardContext = boardCanvas.getContext("2d");
const nextCanvas = document.getElementById("next-piece");
const nextContext = nextCanvas.getContext("2d");

const startButton = document.getElementById("start-button");
const pauseButton = document.getElementById("pause-button");
const boardOverlay = document.getElementById("board-overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const statusTitle = document.getElementById("status-title");
const statusDetail = document.getElementById("status-detail");
const levelPill = document.getElementById("level-pill");

const scoreValue = document.getElementById("score-value");
const linesValue = document.getElementById("lines-value");
const bestValue = document.getElementById("best-value");
const levelValue = document.getElementById("level-value");

const controlButtons = Array.from(document.querySelectorAll("[data-action]"));

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const PREVIEW_BLOCK = 24;
const STORAGE_KEY = "neon-stack-best-score";
const SCORE_TABLE = [0, 100, 300, 500, 800];
const HOLD_DELAY = 150;
const HOLD_INTERVAL = 80;
const REPEATABLE_ACTIONS = new Set(["left", "right", "down"]);

const PIECES = {
  I: {
    color: "#56E2FF",
    matrix: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  J: {
    color: "#5D8BFF",
    matrix: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  L: {
    color: "#FF9A3C",
    matrix: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  O: {
    color: "#FFD54C",
    matrix: [
      [1, 1],
      [1, 1],
    ],
  },
  S: {
    color: "#8FE44D",
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
  },
  T: {
    color: "#D96BFF",
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  Z: {
    color: "#FF607D",
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
  },
};

const pieceKeys = Object.keys(PIECES);

const state = {
  board: createEmptyBoard(),
  bag: [],
  nextQueue: [],
  current: null,
  score: 0,
  lines: 0,
  level: 1,
  best: Number.parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10),
  running: false,
  paused: false,
  gameOver: false,
  animationFrame: null,
  lastFrameTime: 0,
  dropAccumulator: 0,
};

const holdState = {
  intervalId: null,
};

const keyboardHoldState = {
  activeKey: null,
  delayId: null,
  intervalId: null,
};

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function cloneMatrix(matrix) {
  return matrix.map((row) => [...row]);
}

function shuffle(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function getDropInterval() {
  return Math.max(120, 920 - (state.level - 1) * 65);
}

function ensureNextQueue() {
  while (state.nextQueue.length < 3) {
    if (state.bag.length === 0) {
      state.bag = shuffle(pieceKeys);
    }

    state.nextQueue.push(state.bag.pop());
  }
}

function getSpawnY(matrix) {
  const firstFilledRow = matrix.findIndex((row) => row.some(Boolean));
  return firstFilledRow > 0 ? -firstFilledRow : 0;
}

function createPiece(type) {
  const matrix = cloneMatrix(PIECES[type].matrix);

  return {
    type,
    matrix,
    x: Math.floor(COLS / 2) - Math.ceil(matrix[0].length / 2),
    y: getSpawnY(matrix),
  };
}

function collides(piece, offsetX = 0, offsetY = 0, testMatrix = piece.matrix) {
  for (let row = 0; row < testMatrix.length; row += 1) {
    for (let col = 0; col < testMatrix[row].length; col += 1) {
      if (!testMatrix[row][col]) {
        continue;
      }

      const boardX = piece.x + col + offsetX;
      const boardY = piece.y + row + offsetY;

      if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
        return true;
      }

      if (boardY >= 0 && state.board[boardY][boardX]) {
        return true;
      }
    }
  }

  return false;
}

function rotateMatrix(matrix, direction = 1) {
  const size = matrix.length;
  const rotated = Array.from({ length: size }, () => Array(size).fill(0));

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (direction > 0) {
        rotated[col][size - 1 - row] = matrix[row][col];
      } else {
        rotated[size - 1 - col][row] = matrix[row][col];
      }
    }
  }

  return rotated;
}

function mergeCurrentPiece() {
  const { matrix, x, y, type } = state.current;

  for (let row = 0; row < matrix.length; row += 1) {
    for (let col = 0; col < matrix[row].length; col += 1) {
      if (!matrix[row][col]) {
        continue;
      }

      const boardY = y + row;

      if (boardY >= 0) {
        state.board[boardY][x + col] = type;
      }
    }
  }
}

function clearCompletedLines() {
  const remainingRows = state.board.filter((row) => row.some((cell) => !cell));
  const clearedLines = ROWS - remainingRows.length;
  const previousLevel = state.level;

  while (remainingRows.length < ROWS) {
    remainingRows.unshift(Array(COLS).fill(null));
  }

  state.board = remainingRows;

  if (clearedLines > 0) {
    state.lines += clearedLines;
    state.score += SCORE_TABLE[clearedLines] * state.level;
    state.level = Math.floor(state.lines / 10) + 1;
    const leveledUp = state.level > previousLevel;
    const detail = leveledUp
      ? `升到 Lv. ${state.level}，下落速度继续提升。`
      : "保持底部平整，下一块会更好处理。";
    updateStatus(clearedLines === 4 ? "Tetris!" : `消除了 ${clearedLines} 行`, detail);
  }
}

function spawnPiece() {
  ensureNextQueue();
  state.current = createPiece(state.nextQueue.shift());
  ensureNextQueue();
  drawNextPiece();

  if (collides(state.current)) {
    finishGame();
  }
}

function updateBestScore() {
  if (state.score > state.best) {
    state.best = state.score;
    localStorage.setItem(STORAGE_KEY, String(state.best));
  }
}

function finishGame() {
  state.running = false;
  state.gameOver = true;
  state.paused = false;
  updateBestScore();
  updateStats();
  clearHoldAction();
  clearKeyboardHold();
  updateStatus("游戏结束", "按 Enter、Space 或点击按钮，立刻再开一局。");
  setOverlay(
    true,
    "已出界",
    `本局拿到 ${state.score} 分。点击这里或上方按钮，直接重新开一局。`
  );
  syncButtons();
}

function lockPiece() {
  mergeCurrentPiece();
  clearCompletedLines();
  spawnPiece();
  updateStats();
}

function moveHorizontal(offset) {
  if (!canInteract()) {
    return;
  }

  if (!collides(state.current, offset, 0)) {
    state.current.x += offset;
  }
}

function rotateCurrent(direction = 1) {
  if (!canInteract()) {
    return;
  }

  const rotated = rotateMatrix(state.current.matrix, direction);
  const kickOffsets = [
    [0, 0],
    [-1, 0],
    [1, 0],
    [-2, 0],
    [2, 0],
    [0, -1],
  ];

  for (const [offsetX, offsetY] of kickOffsets) {
    if (!collides(state.current, offsetX, offsetY, rotated)) {
      state.current.matrix = rotated;
      state.current.x += offsetX;
      state.current.y += offsetY;
      return;
    }
  }
}

function softDrop(isManual = false) {
  if (!canInteract()) {
    return false;
  }

  if (!collides(state.current, 0, 1)) {
    state.current.y += 1;

    if (isManual) {
      state.score += 1;
      updateStats();
    }

    return true;
  }

  lockPiece();
  return false;
}

function hardDrop() {
  if (!canInteract()) {
    return;
  }

  let distance = 0;

  while (!collides(state.current, 0, 1)) {
    state.current.y += 1;
    distance += 1;
  }

  state.score += distance * 2;
  lockPiece();
}

function getGhostPiece() {
  const ghost = {
    ...state.current,
    matrix: state.current.matrix,
  };

  while (!collides(ghost, 0, 1)) {
    ghost.y += 1;
  }

  return ghost;
}

function getDisplayBest() {
  return Math.max(state.best, state.score);
}

function updateStats() {
  scoreValue.textContent = state.score.toString();
  linesValue.textContent = state.lines.toString();
  bestValue.textContent = getDisplayBest().toString();
  levelValue.textContent = state.level.toString();
  levelPill.textContent = `Lv. ${state.level}`;
}

function updateStatus(text, detail = "") {
  statusTitle.textContent = text;
  statusDetail.textContent = detail;
}

function setOverlay(isVisible, title, text) {
  boardOverlay.classList.toggle("is-visible", isVisible);
  overlayTitle.textContent = title;
  overlayText.textContent = text;
}

function syncButtons() {
  if (state.running && !state.gameOver) {
    startButton.textContent = "重新开始";
  } else if (state.gameOver) {
    startButton.textContent = "再来一局";
  } else {
    startButton.textContent = "开始游戏";
  }

  pauseButton.textContent = state.paused ? "继续" : "暂停";
  pauseButton.disabled = !state.running || state.gameOver;
}

function setPaused(nextPaused) {
  if (!state.running || state.gameOver) {
    return;
  }

  state.paused = nextPaused;

  if (state.paused) {
    clearHoldAction();
    clearKeyboardHold();
    updateStatus("已暂停", "点击棋盘、按 P 或暂停按钮，继续当前对局。");
    setOverlay(true, "暂停中", "先看看右侧预览，再点这里继续下落。");
  } else {
    updateStatus("继续冲分", "留意右侧预览，尽量保持中间区域通畅。");
    setOverlay(false, "", "");
    state.dropAccumulator = 0;
    state.lastFrameTime = 0;
  }

  syncButtons();
}

function resetGame() {
  clearHoldAction();
  clearKeyboardHold();
  state.board = createEmptyBoard();
  state.bag = [];
  state.nextQueue = [];
  state.current = null;
  state.score = 0;
  state.lines = 0;
  state.level = 1;
  state.running = true;
  state.paused = false;
  state.gameOver = false;
  state.lastFrameTime = 0;
  state.dropAccumulator = 0;
  ensureNextQueue();
  spawnPiece();
  updateStats();
  updateStatus("专注下落", "左右移动、上旋转、Space 直接落底。");
  setOverlay(false, "", "");
  syncButtons();
}

function canInteract() {
  return state.running && !state.paused && !state.gameOver && state.current;
}

function drawBackgroundGrid() {
  boardContext.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
  boardContext.fillStyle = "#06111f";
  boardContext.fillRect(0, 0, boardCanvas.width, boardCanvas.height);

  boardContext.strokeStyle = "rgba(255, 255, 255, 0.06)";
  boardContext.lineWidth = 1;

  for (let row = 0; row <= ROWS; row += 1) {
    boardContext.beginPath();
    boardContext.moveTo(0, row * BLOCK_SIZE + 0.5);
    boardContext.lineTo(boardCanvas.width, row * BLOCK_SIZE + 0.5);
    boardContext.stroke();
  }

  for (let col = 0; col <= COLS; col += 1) {
    boardContext.beginPath();
    boardContext.moveTo(col * BLOCK_SIZE + 0.5, 0);
    boardContext.lineTo(col * BLOCK_SIZE + 0.5, boardCanvas.height);
    boardContext.stroke();
  }
}

function drawCell(context, x, y, color, alpha = 1) {
  const inset = 2;
  context.save();
  context.globalAlpha = alpha;
  context.fillStyle = color;
  context.fillRect(
    x * BLOCK_SIZE + inset,
    y * BLOCK_SIZE + inset,
    BLOCK_SIZE - inset * 2,
    BLOCK_SIZE - inset * 2
  );
  context.fillStyle = "rgba(255, 255, 255, 0.18)";
  context.fillRect(
    x * BLOCK_SIZE + inset,
    y * BLOCK_SIZE + inset,
    BLOCK_SIZE - inset * 2,
    6
  );
  context.strokeStyle = "rgba(255, 255, 255, 0.1)";
  context.strokeRect(
    x * BLOCK_SIZE + inset + 0.5,
    y * BLOCK_SIZE + inset + 0.5,
    BLOCK_SIZE - inset * 2 - 1,
    BLOCK_SIZE - inset * 2 - 1
  );
  context.restore();
}

function drawPiece(piece, alpha = 1) {
  const color = PIECES[piece.type].color;

  for (let row = 0; row < piece.matrix.length; row += 1) {
    for (let col = 0; col < piece.matrix[row].length; col += 1) {
      if (!piece.matrix[row][col]) {
        continue;
      }

      const boardY = piece.y + row;

      if (boardY < 0) {
        continue;
      }

      drawCell(boardContext, piece.x + col, boardY, color, alpha);
    }
  }
}

function drawBoard() {
  drawBackgroundGrid();

  state.board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell) {
        drawCell(boardContext, colIndex, rowIndex, PIECES[cell].color);
      }
    });
  });

  if (!state.current) {
    return;
  }

  drawPiece(getGhostPiece(), 0.18);
  drawPiece(state.current, 1);
}

function drawPreviewCell(x, y, color) {
  const inset = 2;
  nextContext.fillStyle = color;
  nextContext.fillRect(
    x * PREVIEW_BLOCK + inset,
    y * PREVIEW_BLOCK + inset,
    PREVIEW_BLOCK - inset * 2,
    PREVIEW_BLOCK - inset * 2
  );
  nextContext.fillStyle = "rgba(255, 255, 255, 0.18)";
  nextContext.fillRect(
    x * PREVIEW_BLOCK + inset,
    y * PREVIEW_BLOCK + inset,
    PREVIEW_BLOCK - inset * 2,
    5
  );
}

function drawNextPiece() {
  nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  nextContext.fillStyle = "#07101d";
  nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

  const nextType = state.nextQueue[0];

  if (!nextType) {
    return;
  }

  const matrix = PIECES[nextType].matrix;
  const color = PIECES[nextType].color;
  const matrixWidth = matrix[0].length * PREVIEW_BLOCK;
  const matrixHeight = matrix.length * PREVIEW_BLOCK;
  const offsetX = Math.floor((nextCanvas.width - matrixWidth) / 2 / PREVIEW_BLOCK);
  const offsetY = Math.floor((nextCanvas.height - matrixHeight) / 2 / PREVIEW_BLOCK);

  for (let row = 0; row < matrix.length; row += 1) {
    for (let col = 0; col < matrix[row].length; col += 1) {
      if (matrix[row][col]) {
        drawPreviewCell(offsetX + col, offsetY + row, color);
      }
    }
  }
}

function render() {
  drawBoard();
  drawNextPiece();
}

function tick(timestamp) {
  if (!state.lastFrameTime) {
    state.lastFrameTime = timestamp;
  }

  const delta = timestamp - state.lastFrameTime;
  state.lastFrameTime = timestamp;

  if (state.running && !state.paused && !state.gameOver) {
    state.dropAccumulator += delta;

    if (state.dropAccumulator >= getDropInterval()) {
      state.dropAccumulator = 0;
      softDrop(false);
    }
  }

  render();
  state.animationFrame = window.requestAnimationFrame(tick);
}

function handleAction(action) {
  switch (action) {
    case "left":
      moveHorizontal(-1);
      break;
    case "right":
      moveHorizontal(1);
      break;
    case "rotate":
      rotateCurrent(1);
      break;
    case "down":
      softDrop(true);
      break;
    case "drop":
      hardDrop();
      break;
    case "pause":
      if (state.running && !state.gameOver) {
        setPaused(!state.paused);
      }
      break;
    default:
      break;
  }
}

function clearHoldAction() {
  if (holdState.intervalId) {
    window.clearInterval(holdState.intervalId);
    holdState.intervalId = null;
  }
}

function clearKeyboardHold(key = keyboardHoldState.activeKey) {
  if (key !== keyboardHoldState.activeKey) {
    return;
  }

  if (keyboardHoldState.delayId) {
    window.clearTimeout(keyboardHoldState.delayId);
    keyboardHoldState.delayId = null;
  }

  if (keyboardHoldState.intervalId) {
    window.clearInterval(keyboardHoldState.intervalId);
    keyboardHoldState.intervalId = null;
  }

  keyboardHoldState.activeKey = null;
}

function startKeyboardHold(key, action) {
  clearKeyboardHold();
  keyboardHoldState.activeKey = key;
  keyboardHoldState.delayId = window.setTimeout(() => {
    keyboardHoldState.delayId = null;
    keyboardHoldState.intervalId = window.setInterval(
      () => handleAction(action),
      HOLD_INTERVAL
    );
  }, HOLD_DELAY);
}

function attachControlEvents() {
  controlButtons.forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      clearHoldAction();

      const { action } = button.dataset;

      if (!action) {
        return;
      }

      if (!state.running && action !== "pause") {
        resetGame();
      }

      handleAction(action);

      if (REPEATABLE_ACTIONS.has(action)) {
        holdState.intervalId = window.setInterval(() => handleAction(action), 110);
      }
    });

    button.addEventListener("pointerup", clearHoldAction);
    button.addEventListener("pointerleave", clearHoldAction);
    button.addEventListener("pointercancel", clearHoldAction);
  });

  window.addEventListener("pointerup", clearHoldAction);
}

function handleKeydown(event) {
  const key = event.key.toLowerCase();
  const controlKeys = new Set([
    "arrowleft",
    "arrowright",
    "arrowup",
    "arrowdown",
    "z",
    "x",
    " ",
    "p",
    "enter",
  ]);

  if (!controlKeys.has(key)) {
    return;
  }

  event.preventDefault();

  if (event.repeat) {
    return;
  }

  if ((!state.running || state.gameOver) && key !== "p") {
    resetGame();

    if (key === "enter" || key === " ") {
      return;
    }
  }

  switch (key) {
    case "arrowleft":
      moveHorizontal(-1);
      startKeyboardHold(key, "left");
      break;
    case "arrowright":
      moveHorizontal(1);
      startKeyboardHold(key, "right");
      break;
    case "arrowup":
    case "x":
      rotateCurrent(1);
      break;
    case "z":
      rotateCurrent(-1);
      break;
    case "arrowdown":
      softDrop(true);
      startKeyboardHold(key, "down");
      break;
    case " ":
      hardDrop();
      break;
    case "p":
      if (state.running) {
        setPaused(!state.paused);
      }
      break;
    case "enter":
      resetGame();
      break;
    default:
      break;
  }
}

function handleKeyup(event) {
  clearKeyboardHold(event.key.toLowerCase());
}

function attachGlobalEvents() {
  startButton.addEventListener("click", resetGame);
  pauseButton.addEventListener("click", () => {
    if (state.running && !state.gameOver) {
      setPaused(!state.paused);
    }
  });
  boardOverlay.addEventListener("click", () => {
    if (!state.running || state.gameOver) {
      resetGame();
    } else if (state.paused) {
      setPaused(false);
    }
  });
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("keyup", handleKeyup);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.running && !state.paused && !state.gameOver) {
      setPaused(true);
    }

    if (document.hidden) {
      clearHoldAction();
      clearKeyboardHold();
    }
  });
}

function boot() {
  updateStats();
  syncButtons();
  updateStatus("准备就绪", "按 Enter / Space 开局，方向键移动，P 暂停。");
  setOverlay(
    true,
    "点击开局",
    "先用右侧预览做判断。桌面端可直接用键盘，移动端可用底部按钮操作。"
  );
  render();
  attachControlEvents();
  attachGlobalEvents();
  state.animationFrame = window.requestAnimationFrame(tick);
}

boot();

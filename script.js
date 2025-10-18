// Reset game state
function resetGame() {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  currentCans = 0;
  // reset milestone tracking
  milestoneState = {};
  // reset to difficulty default
  timeLeft = difficultySettings[currentDifficulty].time;
  document.getElementById('current-cans').textContent = currentCans;
  document.getElementById('timer').textContent = timeLeft;
  document.getElementById('achievements').textContent = '';
  document.getElementById('achievements').className = 'achievement';
  createGrid();
}

// Set up click handler for the reset button
document.getElementById('reset-game').addEventListener('click', resetGame);
// Difficulty settings (time in seconds, goal cans, spawn delay ms, obstacle chance)
const DIFFICULTY = {
  EASY: 'easy',
  NORMAL: 'normal',
  HARD: 'hard'
};

const difficultySettings = {
  // spawnDelay is in milliseconds (higher = slower spawn)
  [DIFFICULTY.EASY]:   { time: 45, goal: 15, spawnDelay: 1800, obstacleChance: 0.15 },
  [DIFFICULTY.NORMAL]: { time: 30, goal: 20, spawnDelay: 1400, obstacleChance: 0.25 },
  [DIFFICULTY.HARD]:   { time: 20, goal: 30, spawnDelay: 1000, obstacleChance: 0.35 }
};

let currentDifficulty = DIFFICULTY.NORMAL;

// Obstacle chance will be set per-difficulty
let OBSTACLE_CHANCE = difficultySettings[currentDifficulty].obstacleChance;
// Winning and losing messages
const winMessages = [
  "Amazing! You brought water to the village!",
  "Incredible speed! You're a Water Hero!",
  "You did it! Every drop counts!",
  "Victory! Clean water for all!"
];
const loseMessages = [
  "Try again! The village needs more water!",
  "So close! Give it another shot!",
  "Don't give up! Every can helps!",
  "Keep going! The world needs you!"
];
// Milestone definitions per difficulty: array of {threshold, message}
const milestoneDefinitions = {
  [DIFFICULTY.EASY]: [
    { threshold: 5, message: "Nice start!" },
    { threshold: 8, message: "Keep it up!" },
    { threshold: 12, message: "Halfway there!" }
  ],
  [DIFFICULTY.NORMAL]: [
    { threshold: 5, message: "Good progress!" },
    { threshold: 10, message: "Halfway there!" },
    { threshold: 15, message: "You're crushing it!" }
  ],
  [DIFFICULTY.HARD]: [
    { threshold: 8, message: "Solid start!" },
    { threshold: 15, message: "Halfway there!" },
    { threshold: 25, message: "Almost legendary!" }
  ]
};

// Show a milestone message temporarily in the achievement area
function showMilestone(msg) {
  // show as toast and also set the achievements area briefly
  showToast(msg);
  const achievement = document.getElementById('achievements');
  achievement.className = 'achievement milestone';
  achievement.textContent = msg;
  setTimeout(() => {
    if (!gameActive) return;
    achievement.className = 'achievement';
    achievement.textContent = '';
  }, 2200);
}

// Create a toast element and auto-remove after timeout
function showToast(text, timeout = 2400) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = text;
  container.appendChild(t);
  // schedule removal with out animation
  setTimeout(() => {
    t.style.animation = 'toastOut 280ms ease forwards';
    t.addEventListener('animationend', () => {
      if (t && t.parentNode) t.parentNode.removeChild(t);
    }, { once: true });
  }, timeout);
}
// Game configuration and state variables
let GOAL_CANS = difficultySettings[currentDifficulty].goal;        // Total items needed to collect
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let milestoneState = {};    // tracks which milestone thresholds have been shown this round
let spawnInterval;          // Holds the interval for spawning items
let timerInterval;          // Holds the interval for the countdown timer
let timeLeft = difficultySettings[currentDifficulty].time;          // Time left in seconds

// Creates the 3x3 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

// Ensure the grid is created when the page loads
createGrid();

// Spawns a new item in a random grid cell
function spawnWaterCan() {
  if (!gameActive) return; // Stop if the game is not active
  const cells = document.querySelectorAll('.grid-cell');
  
  // Clear all cells before spawning a new water can
  cells.forEach(cell => (cell.innerHTML = ''));

  // Select a random cell from the grid to place the item
  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  // Decide whether to spawn a can or an obstacle
  if (Math.random() < OBSTACLE_CHANCE) {
    // Spawn obstacle
    randomCell.innerHTML = `
      <div class="obstacle-wrapper">
        <div class="obstacle"></div>
      </div>
    `;
    const obstacle = randomCell.querySelector('.obstacle');
    if (obstacle) {
      obstacle.addEventListener('click', function handleObstacleClick(e) {
        if (!gameActive) return;
        // play shake+fade animation then remove
        obstacle.classList.add('obstacle-anim');
        obstacle.style.pointerEvents = 'none';
        // reduce count
        if (currentCans > 0) currentCans--;
        document.getElementById('current-cans').textContent = currentCans;
        // remove wrapper after animation
        const wrapper = randomCell.querySelector('.obstacle-wrapper');
        wrapper.addEventListener('animationend', () => {
          if (wrapper && wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
        }, { once: true });
      });
    }
  } else {
    // Spawn water can
    randomCell.innerHTML = `
      <div class="water-can-wrapper">
        <div class="water-can"></div>
      </div>
    `;
    // Add click event to the water can
    const can = randomCell.querySelector('.water-can');
    if (can) {
      can.addEventListener('click', function handleCanClick(e) {
        if (!gameActive) return;
        // play rotate+fade animation then remove
        can.classList.add('collect-anim');
        can.style.pointerEvents = 'none';
        currentCans++;
        document.getElementById('current-cans').textContent = currentCans;
        // check milestones for this difficulty
        const defs = milestoneDefinitions[currentDifficulty] || [];
        defs.forEach(m => {
          if (currentCans >= m.threshold && !milestoneState[m.threshold]) {
            milestoneState[m.threshold] = true;
            showMilestone(m.message);
          }
        });
        const wrapper = randomCell.querySelector('.water-can-wrapper');
        wrapper.addEventListener('animationend', () => {
          if (wrapper && wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
        }, { once: true });
      });
    }
  }

  // Pulse empty cells when clicked (feedback)
  randomCell.addEventListener('click', (e) => {
    // only pulse if click lands on empty area and game is active
    if (!gameActive) return;
    // if the target is the cell itself (not a child element)
    if (e.target === randomCell) {
      randomCell.classList.add('pulse');
      randomCell.addEventListener('animationend', () => randomCell.classList.remove('pulse'), { once: true });
    }
  });
}

// Initializes and starts a new game
function startGame() {
  if (gameActive) return; // Prevent starting a new game if one is already active
  gameActive = true;
  currentCans = 0;
  // reset milestone tracking for this round
  milestoneState = {};
  // initialize per difficulty
  timeLeft = difficultySettings[currentDifficulty].time;
  GOAL_CANS = difficultySettings[currentDifficulty].goal;
  OBSTACLE_CHANCE = difficultySettings[currentDifficulty].obstacleChance;
  document.getElementById('current-cans').textContent = currentCans;
  document.getElementById('timer').textContent = timeLeft;
  createGrid(); // Set up the game grid
  spawnInterval = setInterval(spawnWaterCan, difficultySettings[currentDifficulty].spawnDelay); // Spawn water cans based on difficulty
  timerInterval = setInterval(() => {
    if (!gameActive) return;
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  gameActive = false; // Mark the game as inactive
  clearInterval(spawnInterval); // Stop spawning water cans
  clearInterval(timerInterval); // Stop the timer

  // Show win/lose message
  const achievement = document.getElementById('achievements');
  let message = '';
  if (currentCans >= 20) {
    // use GOAL_CANS per difficulty
    if (currentCans >= GOAL_CANS) {
      message = winMessages[Math.floor(Math.random() * winMessages.length)];
      achievement.className = 'achievement win';
      // Confetti effect
      if (window.confetti) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } else {
      message = loseMessages[Math.floor(Math.random() * loseMessages.length)];
      achievement.className = 'achievement lose';
    }
    // note: this branch kept for safety; should be unreachable
  }
  achievement.textContent = message;
}

// Set up click handler for the start button
document.getElementById('start-game').addEventListener('click', startGame);

// Update the instructions / HUD for current difficulty
function updateHUDForDifficulty() {
  const instr = document.querySelector('.game-instructions');
  instr.textContent = `Collect ${difficultySettings[currentDifficulty].goal} items in ${difficultySettings[currentDifficulty].time} seconds!`;
  document.getElementById('timer').textContent = difficultySettings[currentDifficulty].time;
  document.getElementById('current-cans').textContent = currentCans;
}

// Difficulty button handlers
function setDifficulty(diff) {
  if (!difficultySettings[diff]) return;
  currentDifficulty = diff;
  // persist selection
  try { localStorage.setItem('wg_difficulty', diff); } catch (e) {}
  // update active button visual
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.diff-btn[data-diff="${diff}"]`);
  if (btn) btn.classList.add('active');
  // update runtime variables
  OBSTACLE_CHANCE = difficultySettings[currentDifficulty].obstacleChance;
  GOAL_CANS = difficultySettings[currentDifficulty].goal;
  timeLeft = difficultySettings[currentDifficulty].time;
  // if a game is running, restart the spawn interval with the new delay
  if (gameActive) {
    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnWaterCan, difficultySettings[currentDifficulty].spawnDelay);
  }
  updateHUDForDifficulty();
}

// Wire up buttons and restore previous selection
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const diff = btn.getAttribute('data-diff');
    setDifficulty(diff);
  });
});

// Restore saved difficulty on load
const saved = (function() { try { return localStorage.getItem('wg_difficulty'); } catch (e) { return null; } })();
if (saved && difficultySettings[saved]) {
  setDifficulty(saved);
} else {
  // default
  setDifficulty(currentDifficulty);
}

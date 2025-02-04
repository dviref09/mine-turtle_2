let groups = [];
let currentTurn = 0;
let gameStarted = false;
let explosionChance = 0.1;
let hasExploded = false;

const helloSound = new Audio("./sound/hello.mp3");
const explosionSound = new Audio("./sound/explosion.mp3");

const tasks = [
  "שירו שיר קבוצתי",
  "עשו תרגיל כושר קבוצתי",
  "ספרו בדיחה מצחיקה",
  "הציגו סצנה קומית",
  "רקדו ריקוד קבוצתי",
  "שחקו משחק מהיר",
  "ערכו תחרות המצאות"
];

function addGroup() {
  const input = document.getElementById("group-input");
  const name = input.value.trim();
  if (name && !groups.some(g => g.name === name)) {
    groups.push({ name: name, eliminated: false });
    input.value = "";
    renderGroups();
  }
}

function renderGroups() {
  const container = document.getElementById("groups-container");
  container.innerHTML = "";
  groups.forEach((group, index) => {
    const div = document.createElement("div");
    div.className = `group ${group.eliminated ? "eliminated" : ""} ${
      currentTurn === index && gameStarted ? "active" : ""
    }`;
    div.textContent = group.name;
    container.appendChild(div);
  });
}

function restartGame() {
  groups = [];
  currentTurn = 0;
  gameStarted = false;
  hasExploded = false;

  document.getElementById("setup-container").style.display = "block";
  document.getElementById("start-button").style.display = "inline-block";
  document.getElementById("restart-button").style.display = "none";
  
  const turtle = document.querySelector(".turtle");
  const explosion = document.querySelector(".explosion");
  turtle.style.transform = "scale(0)";
  explosion.style.transform = "scale(0)";
  
  document.getElementById("turn-indicator").textContent = "בשביל להתחיל צריך לפחות 2 שחקנים";
  
  renderGroups();
}

function startGame() {
  if (groups.length < 2) {
    alert("הוסף לפחות 2 קבוצות כדי להתחיל!");
    return;
  }
  gameStarted = true;
  document.getElementById("setup-container").style.display = "none";
  document.getElementById("start-button").style.display = "none";
  startAnimation();
  updateTurnIndicator();
}

function updateTurnIndicator() {
  const activePlayers = groups.filter((g) => !g.eliminated);
  if (activePlayers.length === 1) {
    setTimeout(() => {
      const turnIndicator = document.getElementById("turn-indicator");
      turnIndicator.textContent = `🎉 ${activePlayers[0].name} ניצח! 🎉`;
      gameStarted = false;
      createConfetti();
      document.getElementById("restart-button").style.display = "inline-block";
    }, 1000);
  } else if (gameStarted) {
    while (groups[currentTurn].eliminated) {
      currentTurn = (currentTurn + 1) % groups.length;
    }
    document.getElementById(
      "turn-indicator"
    ).textContent = `התור של ${groups[currentTurn].name}`;
  }
  renderGroups();
}

function handleTurtleClick() {
  if (!gameStarted || hasExploded) return;

  if (Math.random() < explosionChance) {
    groups[currentTurn].eliminated = true;
    explosionChance = 0.1;
    sayHello();
    setTimeout(() => {
      explodeTurtle();
    }, 1000);
  } else {
    explosionChance += 0.05;
    nextTurn();
  }
}

function showTaskModal() {
  if (!gameStarted || hasExploded) return;

  const modal = document.getElementById("task-modal");
  const taskText = document.getElementById("random-task");
  taskText.textContent = tasks[Math.floor(Math.random() * tasks.length)];
  modal.style.display = "flex";
}

function completeTask() {
  closeTaskModal();
  nextTurn();
}

function closeTaskModal() {
  document.getElementById("task-modal").style.display = "none";
}

function nextTurn() {
  currentTurn = (currentTurn + 1) % groups.length;
  updateTurnIndicator();
}

function sayHello() {
  helloSound.play();
  const speechBubble = document.querySelector(".speech-bubble");
  speechBubble.style.opacity = "1";
  speechBubble.style.transform = "scale(1)";
  setTimeout(() => {
    speechBubble.style.opacity = "0";
    speechBubble.style.transform = "scale(0)";
  }, 2000);
}

function explodeTurtle() {
  hasExploded = true;
  explosionSound.play();
  const turtle = document.querySelector(".turtle");
  const explosion = document.querySelector(".explosion");
  const speechBubble = document.querySelector(".speech-bubble");
  turtle.style.display = "none";
  speechBubble.style.display = "none";
  explosion.style.transform = "scale(2)";
  explosion.style.animation = "explode 0.8s forwards";

  setTimeout(() => {
    explosion.style.transform = "scale(0)";
    explosion.style.display = "none";
    turtle.style.display = "block";
    hasExploded = false;
    updateTurnIndicator();
  }, 2000);
}

function startAnimation() {
  const turtle = document.querySelector(".turtle");
  turtle.style.transform = "scale(1)";
}

function createConfetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  const numberOfPieces = 200;
  const colors = [
    "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", 
    "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50", 
    "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", 
    "#ff5722", "#795548", "#607d8b"
  ];

  function Piece() {
    this.x = canvas.width * Math.random();
    this.y = canvas.height * Math.random() - canvas.height;
    this.vx = 4 + Math.random() * 4;
    this.vy = 10 + Math.random() * 5;
    this.width = 8 + Math.random() * 8;
    this.height = this.width;
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  function createPieces() {
    for (let i = 0; i < numberOfPieces; i++) {
      pieces.push(new Piece());
    }
  }

  function drawPieces() {
    pieces.forEach((piece) => {
      ctx.beginPath();
      ctx.rect(piece.x, piece.y, piece.width, piece.height);
      ctx.fillStyle = piece.color;
      ctx.fill();
    });
  }

  function updatePieces() {
    pieces.forEach((piece) => {
      piece.y += piece.vy;
      piece.x += piece.vx;

      if (piece.y >= canvas.height) {
        piece.y = canvas.height;
      }
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPieces();
    updatePieces();
    requestAnimationFrame(render);
  }

  createPieces();
  render();
}

renderGroups();
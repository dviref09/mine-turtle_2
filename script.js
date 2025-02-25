let groups = [];
let currentTurn = 0;
let gameStarted = false;
let explosionChance = 0.0;
let hasExploded = false;

const helloSound = new Audio("./sound/hello.mp3");
const explosionSound = new Audio("./sound/explosion.mp3");

const tasks = [
    "עשו חיקוי של מורה מפורסם מהבית ספר שלכם.",
    "צרחו את השם שלכם כאילו אתם בסרט אימה.",
    "נסו לנהל שיחה שלמה בחרוזים.",
    "רקדו כאילו אתם במשחק Just Dance (המציאו את הריקוד).",
    "שחקו סצנה דרמטית שבה מישהו מגלה שהוא חייזר.",
    "המציאו פרסומת למוצר מגוחך (כמו משקפי שמש לחתולים).",
    "עשו תחרות של מבטים – הראשון שממצמץ מפסיד!",
    "עשו שיחת טלפון דמיונית שבה אתם מסבירים למישהו איך להשתמש בכפית.",
    "עמדו על רגל אחת ונסו לספר בדיחה בלי ליפול.",
    "שכנעו את הקבוצה שמלפפון הוא הפרי הכי טעים בעולם.",
    "הציגו סצנה מסרט מפורסם, אבל תחליפו את כל המילים במילה 'בננה'.",
    "שחקו סצנה שבה אתם מנסים לברוח מזומבי... אבל כולם נעים בסלואו-מושן."
];

let currentWheel = null;

const wheelDict = [
  { id: 0, text: "יש לכם 2 תורות" },
  { id: 1, text: "התפוצצתם!" },
  { id: 2, text: "לקבוצה אחריכם יש 2 תורות" },
  { id: 3, text: "ניצחתם!" },
  { id: 4, text: "אתם לא יכולים לעשות משימה" },
  { id: 5, text: "הקבוצה הבא לא יכולה לעשות משימה" },
  { id: 6, text: "הקבוצה שלכם תקבל פרס" },
];

// Wheel of Fortune Rewards and Punishments
const wheelItems = [0, 0, 0, 1, 2, 2, 2, 3, 4, 4, 4, 5, 5, 5, 6];

// Wheel setup
const wheelCanvas = document.getElementById("wheel");
const ctx = wheelCanvas.getContext("2d");
const wheelOverlay = document.getElementById("wheel-overlay");
const wheelResult = document.getElementById("wheel-result");
let isSpinning = false;
let rotationDegree = 0;

function drawWheel() {
  const sliceCount = wheelItems.length;
  const sliceAngle = (2 * Math.PI) / sliceCount;

  // Wheel background
  ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
  ctx.beginPath();
  ctx.arc(
    wheelCanvas.width / 2,
    wheelCanvas.height / 2,
    wheelCanvas.width / 2,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = "#f0f0f0";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#000";
  ctx.stroke();

  // Draw wheel slices with conic-gradient for a colorful effect
  for (let i = 0; i < sliceCount; i++) {
    ctx.beginPath();
    ctx.moveTo(wheelCanvas.width / 2, wheelCanvas.height / 2);
    ctx.arc(
      wheelCanvas.width / 2,
      wheelCanvas.height / 2,
      wheelCanvas.width / 2,
      i * sliceAngle,
      (i + 1) * sliceAngle
    );
    ctx.fillStyle = `hsl(${(i * 360) / sliceCount}, 100%, 60%)`; // Smooth color transition for slices
    ctx.fill();
    ctx.stroke();
  }

  // Draw text on slices with improved design
  ctx.font = "bold 18px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < sliceCount; i++) {
    const angle = sliceAngle * i + sliceAngle / 2;
    ctx.save();
    ctx.translate(wheelCanvas.width / 2, wheelCanvas.height / 2);
    ctx.rotate(angle); // Rotate each text to be aligned with the slice

    ctx.restore();
  }
}

// Spin the Wheel
function spinWheel() {
  if (isSpinning) return; // Prevent multiple spins at once

  isSpinning = true;
  const spinAngle = Math.random() * 360 + 1800; // Spin between 1800 and 2160 degrees
  const spinDuration = 3000; // Spin duration in ms

  // Wheel spin animation
  const spinStart = performance.now();
  function animateSpin(now) {
    const elapsedTime = now - spinStart;
    const rotation = (elapsedTime / spinDuration) * spinAngle;
    wheelCanvas.style.transform = `rotate(${rotation}deg)`;

    if (elapsedTime < spinDuration) {
      requestAnimationFrame(animateSpin);
    } else {
      isSpinning = false;
      const resultIndex = Math.floor(
        (rotation % 360) / (360 / wheelItems.length)
      );
      currentWheel = wheelDict[wheelItems[resultIndex]].id;
      showResult(wheelDict[wheelItems[resultIndex]].text);
      applyWheelResult(currentWheel);
    }
  }

  requestAnimationFrame(animateSpin);
}

// Show the result of the wheel spin
function showResult(result) {
  wheelOverlay.style.display = "flex";
  wheelResult.textContent = result;

  // Hide overlay after a brief time
  setTimeout(() => {
    wheelOverlay.style.display = "none";
    wheelResult.textContent = "";
  }, 3000);
}

// Initialize wheel
wheelCanvas.width = 300;
wheelCanvas.height = 300;
drawWheel();

function addGroup() {
  const input = document.getElementById("group-input");
  const name = input.value.trim();
  if (name && !groups.some((g) => g.name === name)) {
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
    div.addEventListener("click", () => {
      groups.splice(index, 1);
      renderGroups();
    });
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
  document.getElementById("game").style.display = "none";
  document.getElementById("win-indicator").style.display = "none";

  const turtle = document.querySelector(".turtle");
  const explosion = document.querySelector(".explosion");
  turtle.style.transform = "scale(0)";
  explosion.style.transform = "scale(0)";

  document.getElementById("turn-indicator").textContent =
    "בשביל להתחיל צריך לפחות 2 שחקנים";

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
  document.getElementById("game").style.display = "block";
  startAnimation();
  updateTurnIndicator();
}

function updateTurnIndicator() {
  const wheel = document.getElementById("wheel-section");
  const activePlayers = groups.filter((g) => !g.eliminated);
  if (activePlayers.length === 1) {
    setTimeout(() => {
        document.getElementById("game").style.display = "none"
      const turnIndicator = document.getElementById("win-indicator");
      turnIndicator.style.display = "block";
      turnIndicator.textContent = `🎉 ${activePlayers[0].name} ניצח! 🎉`;
      gameStarted = false;
      createConfetti();
      document.getElementById("restart-button").style.display = "inline-block";
    }, 1000);
  } else if (gameStarted) {
    if (wheel.style.display === "block") wheel.style.display = "none";
    document.getElementById("task-click").style.display = "inline-block";
    while (groups[currentTurn].eliminated) {
      currentTurn = (currentTurn + 1) % groups.length;
    }
    document.getElementById(
      "turn-indicator"
    ).textContent = `התור של ${groups[currentTurn].name}`;

    if (Math.random() > 0.9) {
    wheel.style.display = "block";
    }
    if (Math.random() < 0.05) {
        document.getElementById("task-click").style.display = "none";
    }
  }
  renderGroups();
}

function applyWheelResult(result) {
  switch (result) {
    case 0: // Press twice
      break;
    case 1: // Explode
      groups[currentTurn].eliminated = true;
      explosionChance = 0.05;
      sayHello();
      setTimeout(() => {
        explodeTurtle();
      }, 1000);
      currentWheel = null;

      break;

    case 2: // Next group presses twice
      nextTurn();

      break;

    case 3: // Win
      const turnIndicator = document.getElementById("turn-indicator");
      turnIndicator.textContent = `🎉 ${groups[currentTurn].name} ניצח! 🎉`;
      gameStarted = false;
      createConfetti();
      document.getElementById("restart-button").style.display = "inline-block";
      break;

    case 4: // Can't do task
      document.getElementById("task-click").style.display = "none";
      currentWheel = null;

      break;

    case 5: // Next group can't do task
      nextTurn();
      document.getElementById("task-click").style.display = "none";
      currentWheel = null;

      break;
    default:
        currentWheel = null;
      break;
  }
}

function handleTurtleClick() {
  if (!gameStarted || hasExploded) return;

  if (Math.random() < explosionChance) {
    groups[currentTurn].eliminated = true;
    explosionChance = 0.05;
    sayHello();
    setTimeout(() => {
      explodeTurtle();
    }, 1000);
  } else {
    explosionChance += 0.04;
    if (currentWheel === null) nextTurn();
    if (currentWheel == 0 || currentWheel == 2) {currentWheel = null;}
  }
  renderGroups();
}

function showTaskModal() {
  if (!gameStarted || hasExploded) return;

  const modal = document.getElementById("task-modal");
  const taskText = document.getElementById("random-task");
  taskText.textContent = tasks[Math.floor(Math.random() * tasks.length)];

  // Smooth transition in
  modal.style.opacity = "0";
  modal.style.display = "flex";
  setTimeout(() => {
    modal.style.opacity = "1";
  }, 50);
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
  speechBubble.style.display = "block";
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

  // Hide turtle and bubble before explosion
  turtle.style.display = "none";
  speechBubble.style.display = "none";

  // Create explosion effect
  explosion.style.display = "block";
  explosion.style.transform = "scale(2)";
  explosion.style.animation = "explode 1s forwards";

  // Multiple explosion layers (spark effects)
  for (let i = 0; i < 5; i++) {
    const spark = document.createElement("div");
    spark.classList.add("spark");
    spark.style.left = `${Math.random() * 100}%`;
    spark.style.animation = `spark 1s ease-out forwards ${Math.random() * 1}s`;
    explosion.appendChild(spark);
  }

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
    "#f44336",
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
    "#00bcd4",
    "#009688",
    "#4caf50",
    "#8bc34a",
    "#cddc39",
    "#ffeb3b",
    "#ffc107",
    "#ff9800",
    "#ff5722",
    "#795548",
    "#607d8b",
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

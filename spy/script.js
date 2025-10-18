import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, update, onValue, get, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let playerName = "";
let roomCode = "";
let isHost = false;
let currentImposter = null;
let currentWord = {};
let gameStarted = false;

// DOM Elements
const authSection = document.getElementById("authSection");
const gameSection = document.getElementById("gameSection");
const roomDisplay = document.getElementById("roomDisplay");
const statusEl = document.getElementById("status");
const playerList = document.getElementById("playerList");
const wordSection = document.getElementById("wordSection");
const wordDisplay = document.getElementById("wordDisplay");
const hintDisplay = document.getElementById("hintDisplay");
const hostControls = document.getElementById("hostControls");

// Buttons
document.getElementById("createRoomBtn").onclick = createRoom;
document.getElementById("joinRoomBtn").onclick = joinRoom;
document.getElementById("loginAdminBtn")?.addEventListener("click", loginAdmin);
document.getElementById("startGameBtn").onclick = startGame;
document.getElementById("nextRoundBtn").onclick = nextRound;
document.getElementById("revealImposterBtn").onclick = revealImposter;
document.getElementById("endGameBtn").onclick = endGame;

// Create room
async function createRoom() {
  playerName = document.getElementById("username").value.trim();
  if (!playerName) return alert("Enter your name first!");

  roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
  isHost = true;

  await set(ref(db, "games/" + roomCode), {
    host: playerName,
    started: false,
    reveal: false,
    players: {
      [playerName]: true
    }
  });

  openGame();
}

// Join room
async function joinRoom() {
  playerName = document.getElementById("username").value.trim();
  roomCode = document.getElementById("roomCode").value.trim().toUpperCase();
  if (!playerName || !roomCode) return alert("Enter both name and room!");

  const roomRef = ref(db, "games/" + roomCode + "/players/" + playerName);
  await set(roomRef, true);
  openGame();
}

// Admin login
function loginAdmin() {
  const user = document.getElementById("adminUser").value.trim();
  const pass = document.getElementById("adminPass").value.trim();
  if (user === "MP" && pass === "Admin140811") {
    alert("Admin logged in");
    isHost = true;
    hostControls.style.display = "block";
  } else {
    alert("Incorrect admin credentials");
  }
}

function openGame() {
  authSection.style.display = "none";
  gameSection.style.display = "block";
  roomDisplay.innerText = "Room: " + roomCode;
  statusEl.innerText = isHost ? "You are the host" : "Waiting for host to start...";

  const roomRef = ref(db, "games/" + roomCode + "/players");
  onValue(roomRef, (snapshot) => {
    const players = snapshot.val() || {};
    playerList.innerHTML = "<h3>Players:</h3><ul>" +
      Object.keys(players).map(p => `<li>${p}</li>`).join("") +
      "</ul>";
  });

  const gameRef = ref(db, "games/" + roomCode);
  onValue(gameRef, (snap) => {
    const data = snap.val();
    if (!data) return;
    gameStarted = data.started;

    // Sync current round data
    if (data.currentWord && data.currentImposter && data.started) {
      currentWord = data.currentWord;
      currentImposter = data.currentImposter;
      showWord();
    }

    // Reveal imposter across all devices
    if (data.reveal) {
      showRevealedImposter(data.currentImposter);
    } else {
      clearRevealedImposter();
    }
  });

  if (isHost) hostControls.style.display = "block";
}

// Start game
async function startGame() {
  const wordData = await getRandomWord();
  const playersSnap = await get(ref(db, "games/" + roomCode + "/players"));
  const players = Object.keys(playersSnap.val() || {});
  const imposter = players[Math.floor(Math.random() * players.length)];

  await update(ref(db, "games/" + roomCode), {
    started: true,
    currentWord: wordData,
    currentImposter: imposter,
    reveal: false
  });

  statusEl.innerText = "Game started!";
}

// Next round
async function nextRound() {
  const wordData = await getRandomWord();
  const playersSnap = await get(ref(db, "games/" + roomCode + "/players"));
  const players = Object.keys(playersSnap.val() || {});
  const imposter = players[Math.floor(Math.random() * players.length)];

  await update(ref(db, "games/" + roomCode), {
    currentWord: wordData,
    currentImposter: imposter,
    reveal: false
  });

  statusEl.innerText = "Next round started!";
}

// 🔥 Reveal imposter for everyone
async function revealImposter() {
  await update(ref(db, "games/" + roomCode), {
    reveal: true
  });
}

// All clients will react when reveal = true
function showRevealedImposter(name) {
  let existing = document.getElementById("revealBanner");
  if (!existing) {
    const banner = document.createElement("div");
    banner.id = "revealBanner";
    banner.style.background = "#dc2626";
    banner.style.color = "white";
    banner.style.padding = "10px";
    banner.style.marginTop = "15px";
    banner.style.borderRadius = "8px";
    banner.style.fontWeight = "bold";
    banner.innerText = `🚨 The Imposter is ${name}!`;
    wordSection.appendChild(banner);
  }
}

// Remove reveal banner (when new round starts)
function clearRevealedImposter() {
  const banner = document.getElementById("revealBanner");
  if (banner) banner.remove();
}

// End game
async function endGame() {
  await remove(ref(db, "games/" + roomCode));
  alert("Game ended.");
  window.location.reload();
}

// Show word / hint
function showWord() {
  wordSection.style.display = "block";

  if (playerName === currentImposter) {
    wordDisplay.innerText = "❓ You are the Imposter!";
    hintDisplay.innerText = "Hint: " + currentWord.hint;
  } else {
    wordDisplay.innerText = "Word: " + currentWord.word;
    hintDisplay.innerText = "Hint: " + currentWord.hint;
  }
}

// Get random word from Firebase
async function getRandomWord() {
  const wordsRef = ref(db, "words");
  const snapshot = await get(wordsRef);
  if (snapshot.exists()) {
    const words = Object.values(snapshot.val());
    const random = words[Math.floor(Math.random() * words.length)];
    return random;
  }
  return { word: "Unknown", hint: "No words found" };
}

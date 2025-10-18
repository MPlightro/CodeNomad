import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM elements
const authSection = document.getElementById("authSection");
const adminSection = document.getElementById("adminSection");
const gameSection = document.getElementById("gameSection");
const roomDisplay = document.getElementById("roomDisplay");
const statusEl = document.getElementById("status");
const playerListEl = document.getElementById("playerList");
const wordSection = document.getElementById("wordSection");
const wordDisplay = document.getElementById("wordDisplay");
const hintDisplay = document.getElementById("hintDisplay");
const hostControls = document.getElementById("hostControls");

// Buttons
const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const loginAdminBtn = document.getElementById("loginAdminBtn");
const startGameBtn = document.getElementById("startGameBtn");
const nextRoundBtn = document.getElementById("nextRoundBtn");
const revealImposterBtn = document.getElementById("revealImposterBtn");
const endGameBtn = document.getElementById("endGameBtn");

// State
let username = "";
let roomCode = "";
let isHost = false;
let currentImposter = null;
let currentWord = "";
let currentHint = "";

// --- Admin login ---
loginAdminBtn.onclick = () => {
  const user = document.getElementById("adminUser").value.trim();
  const pass = document.getElementById("adminPass").value.trim();
  if (user === "MP" && pass === "Admin140811") {
    alert("Admin logged in");
    isHost = true;
    hostControls.style.display = "block";
    authSection.style.display = "none";
    adminSection.style.display = "none";
    gameSection.style.display = "block";
  } else {
    alert("Incorrect admin credentials");
  }
};

// --- Create / Join Room ---
createRoomBtn.onclick = async () => {
  username = document.getElementById("username").value.trim();
  if (!username) return alert("Enter your name first!");

  roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
  isHost = true;

  await set(ref(db, "games/" + roomCode), {
    host: username,
    started: false,
    reveal: false,
    players: { [username]: true }
  });

  openGame();
};

joinRoomBtn.onclick = async () => {
  username = document.getElementById("username").value.trim();
  roomCode = document.getElementById("roomCode").value.trim().toUpperCase();
  if (!username || !roomCode) return alert("Enter both name and room code!");

  await set(ref(db, `games/${roomCode}/players/${username}`), true);
  openGame();
};

// --- Open Game UI ---
function openGame() {
  authSection.style.display = "none";
  gameSection.style.display = "block";
  roomDisplay.innerText = "Room: " + roomCode;
  statusEl.innerText = isHost ? "You are the host" : "Waiting for host...";

  // Update player list
  const playersRef = ref(db, "games/" + roomCode + "/players");
  onValue(playersRef, snapshot => {
    const players = snapshot.val() || {};
    playerListEl.innerHTML = "<h3>Players:</h3><ul>" +
      Object.keys(players).map(p => `<li>${p}</li>`).join("") +
      "</ul>";
  });

  // Listen for game updates
  const gameRef = ref(db, "games/" + roomCode);
  onValue(gameRef, snapshot => {
    const data = snapshot.val();
    if (!data) return;

    currentWord = data.currentWord || "";
    currentHint = data.currentHint || "";
    currentImposter = data.currentImposter || null;

    // Show word section
    wordSection.style.display = data.started ? "block" : "none";

    // Show word/hint
    if (username === currentImposter) {
      wordDisplay.innerText = "❓ You are the Imposter!";
    } else {
      wordDisplay.innerText = "Word: " + currentWord;
    }
    hintDisplay.innerText = "Hint: " + currentHint;

    // Show revealed info if needed
    if (data.reveal) {
      if (!document.getElementById("revealBox")) {
        const revealBox = document.createElement("p");
        revealBox.id = "revealBox";
        revealBox.style.color = "#ff2626";
        revealBox.style.fontWeight = "bold";
        revealBox.style.marginTop = "10px";
        revealBox.innerText = `Imposter: ${currentImposter} | Word: ${currentWord}`;
        wordSection.appendChild(revealBox);
      } else {
        document.getElementById("revealBox").innerText = `Imposter: ${currentImposter} | Word: ${currentWord}`;
      }
    } else {
      const revealBox = document.getElementById("revealBox");
      if (revealBox) revealBox.remove();
    }

    startGameBtn.style.display = data.started ? "none" : "inline-block";
  });

  if (isHost) hostControls.style.display = "block";
}

// --- Start Game ---
startGameBtn.onclick = async () => {
  const playersSnap = await get(ref(db, "games/" + roomCode + "/players"));
  const players = Object.keys(playersSnap.val() || {});
  const imposter = players[Math.floor(Math.random() * players.length)];

  const wordsSnap = await get(ref(db, "words"));
  let randomWord = { word: "Unknown", hint: "No words found" };
  if (wordsSnap.exists()) {
    const all = Object.values(wordsSnap.val());
    randomWord = all[Math.floor(Math.random() * all.length)];
  }

  await update(ref(db, "games/" + roomCode), {
    started: true,
    currentWord: randomWord.word,
    currentHint: randomWord.hint,
    currentImposter: imposter,
    reveal: false
  });
};

// --- Next Round ---
nextRoundBtn.onclick = async () => {
  const playersSnap = await get(ref(db, `games/${roomCode}/players`));
  const players = Object.keys(playersSnap.val() || {});
  const imposter = players[Math.floor(Math.random() * players.length)];

  const wordsSnap = await get(ref(db, "words"));
  let randomWord = { word: "Unknown", hint: "No words found" };
  if (wordsSnap.exists()) {
    const all = Object.values(wordsSnap.val());
    randomWord = all[Math.floor(Math.random() * all.length)];
  }

  await update(ref(db, "games/" + roomCode), {
    currentWord: randomWord.word,
    currentHint: randomWord.hint,
    currentImposter: imposter,
    reveal: false
  });
};

// --- Reveal Imposter & Word ---
revealImposterBtn.onclick = async () => {
  await update(ref(db, "games/" + roomCode), { reveal: true });
};

// --- End Game ---
endGameBtn.onclick = async () => {
  await remove(ref(db, "games/" + roomCode));
  alert("Game ended.");
  window.location.reload();
};

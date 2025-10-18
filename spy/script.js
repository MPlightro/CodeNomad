import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Elements
const joinBtn = document.getElementById("joinBtn");
const createBtn = document.getElementById("createBtn");
const startBtn = document.getElementById("startGameBtn");
const nextBtn = document.getElementById("nextRoundBtn");
const revealBtn = document.getElementById("revealImposterBtn");
const endBtn = document.getElementById("endGameBtn");
const gameArea = document.getElementById("gameArea");
const joinArea = document.getElementById("joinGame");
const playersList = document.getElementById("playersList");
const wordDisplay = document.getElementById("wordDisplay");
const hintDisplay = document.getElementById("hint");
const revealBox = document.getElementById("revealBox");
const playerTitle = document.getElementById("playerTitle");
const hostControls = document.getElementById("hostControls");

let username = "";
let roomCode = "";
let isHost = false;
let myWord = "";
let myHint = "";

// Join existing game
joinBtn.onclick = async () => {
  username = document.getElementById("username").value.trim();
  roomCode = document.getElementById("roomCode").value.trim();
  if (!username || !roomCode) return alert("Enter username and room code.");

  const roomRef = ref(db, `games/${roomCode}/players/${username}`);
  await set(roomRef, { name: username });

  startGameListener();
  joinArea.style.display = "none";
  gameArea.style.display = "block";
};

// Create game
createBtn.onclick = async () => {
  username = document.getElementById("username").value.trim();
  roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
  isHost = true;

  await set(ref(db, `games/${roomCode}`), {
    host: username,
    players: { [username]: { name: username } },
    started: false,
  });

  startGameListener();
  joinArea.style.display = "none";
  gameArea.style.display = "block";
  hostControls.style.display = "block";
  playerTitle.textContent = `Room: ${roomCode} (Host)`;
};

// Start game
startBtn.onclick = async () => {
  const playersSnap = await get(ref(db, `games/${roomCode}/players`));
  if (!playersSnap.exists()) return alert("No players!");

  const players = Object.keys(playersSnap.val());
  const imposter = players[Math.floor(Math.random() * players.length)];

  const wordsSnap = await get(ref(db, "words"));
  let randomWord = { word: "Unknown", hint: "No data" };
  if (wordsSnap.exists()) {
    const all = Object.values(wordsSnap.val());
    randomWord = all[Math.floor(Math.random() * all.length)];
  }

  await update(ref(db, `games/${roomCode}`), {
    started: true,
    imposter,
    currentWord: randomWord.word,
    currentHint: randomWord.hint,
    revealed: false,
  });
};

// Next round
nextBtn.onclick = async () => {
  const playersSnap = await get(ref(db, `games/${roomCode}/players`));
  if (!playersSnap.exists()) return;

  const players = Object.keys(playersSnap.val());
  const imposter = players[Math.floor(Math.random() * players.length)];

  const wordsSnap = await get(ref(db, "words"));
  let randomWord = { word: "Unknown", hint: "No data" };
  if (wordsSnap.exists()) {
    const all = Object.values(wordsSnap.val());
    randomWord = all[Math.floor(Math.random() * all.length)];
  }

  await update(ref(db, `games/${roomCode}`), {
    imposter,
    currentWord: randomWord.word,
    currentHint: randomWord.hint,
    revealed: false,
  });

  revealBox.textContent = ""; // clear previous reveal
};

// Reveal imposter & word for everyone
revealBtn.onclick = async () => {
  await update(ref(db, `games/${roomCode}`), { revealed: true });
};

// End game
endBtn.onclick = async () => {
  await remove(ref(db, `games/${roomCode}`));
  alert("Game ended.");
  location.reload();
};

// Listen for game updates
function startGameListener() {
  const gameRef = ref(db, `games/${roomCode}`);
  onValue(gameRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    // update player list
    const players = data.players ? Object.keys(data.players) : [];
    playersList.innerHTML = players.map(p => `<li>${p}</li>`).join("");

    // handle started state
    if (data.started) {
      const imposter = data.imposter;
      const word = data.currentWord;
      const hint = data.currentHint;
      const revealed = data.revealed || false;

      hintDisplay.textContent = "Hint: " + hint;

      if (username === imposter) {
        wordDisplay.textContent = "You are the Imposter!";
      } else {
        wordDisplay.textContent = "Word: " + word;
      }

      // Show revealed info for everyone
      if (revealed) {
        revealBox.textContent = `Imposter: ${imposter} | Word: ${word}`;
      } else {
        revealBox.textContent = "";
      }

      startBtn.style.display = "none";
    } else {
      wordDisplay.textContent = "";
      hintDisplay.textContent = "";
      revealBox.textContent = "";
    }
  });
}

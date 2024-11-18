let balance = 1000;
let betType = '';

// Function to set a cookie
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString(); // 864e5 is the number of milliseconds in a day
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

// Function to get a cookie
function getCookie(name) {
    return document.cookie.split('; ').reduce((r, c) => {
        const [key, value] = c.split('=');
        return key === name ? decodeURIComponent(value) : r;
    }, '');
}

// Function to delete a cookie
function deleteCookie(name) {
    setCookie(name, '', -1); // Set the cookie to expire in the past
}

// Load balance from cookie on page load
window.onload = function() {
    const savedBalance = getCookie('balance');
    if (savedBalance) {
        balance = parseInt(savedBalance);
    }
    document.getElementById('balance').innerText = balance;
};

// Event listeners for bet type radio buttons
document.querySelectorAll('.betType').forEach(radio => {
    radio.addEventListener('change', function() {
        betType = this.value; // Set betType based on selected radio button
    });
});

// Event listener for placing a bet
document.getElementById('placeBet').addEventListener('click', function() {
    const betAmount = parseInt(document.getElementById('betAmount').value);
    const resultDisplay = document.getElementById('result');

    // Validate bet amount
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
        resultDisplay.innerText = "Invalid bet amount.";
        return;
    }

    const outcome = Math.floor(Math.random() * 36) + 1; // Random outcome between 1 and 36
    resultDisplay.innerText = `The ball landed on: ${outcome}`;

    // Check if the betType is odd or even
    if (betType.toLowerCase() === "odd" || betType.toLowerCase() === "even") {
        if ((outcome % 2 === 0 && betType.toLowerCase() === "even") || (outcome % 2 !== 0 && betType.toLowerCase() === "odd")) {
            balance += betAmount;
            resultDisplay.innerText += " You win!";
        } else {
            balance -= betAmount;
            resultDisplay.innerText += " You lose!";
        }
    } else if (!isNaN(betType) && betType >= 1 && betType <= 36) { // Check if betType is a valid number
        if (outcome == betType) {
            balance += betAmount * 35; // Winning payout for a number bet
            resultDisplay.innerText += " You win!";
        } else {
            balance -= betAmount; // Losing the bet
            resultDisplay.innerText += " You lose!";
        }
    } else {
        resultDisplay.innerText = "Invalid bet type.";
    }

    // Update balance display and cookie
    document.getElementById('balance').innerText = balance;
    setCookie('balance', balance, 7); // Save balance in cookie for 7 days

    if (balance <= 0) {
        resultDisplay.innerText += " You've run out of balance. Game over.";
    }
});

// Reset Game Functionality
document.getElementById('resetGame').addEventListener('click', function() {
    balance = 1000;
    document.getElementById('balance').innerText = balance;
    document.getElementById('result').innerText = '';
    document.querySelectorAll('input[name="betType"]').forEach(radio => {
        radio.checked = false; // Uncheck all radio buttons
    });
    deleteCookie('balance'); // Delete the balance cookie on reset
});
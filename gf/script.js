document.getElementById("yesButton").onclick = function() {
    document.getElementById("response").innerText = "I'm so happy you said yes!";
};

let clickCount = 0; // Initialize click count

document.getElementById("noButton").onclick = function() {
    const noButton = document.getElementById("noButton");
    let currentSize = parseFloat(getComputedStyle(noButton).fontSize); // Get current font size in pixels
    let newSize = currentSize * 0.8; // Decrease size by 20%

    noButton.style.fontSize = newSize + "px"; // Set new font size

    clickCount++; // Increment click count

    if (clickCount >= 6) {
        noButton.style.display = 'none'; // Hide the button
    }
};
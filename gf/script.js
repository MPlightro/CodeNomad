let clickCount = 0; // Initialize click count

// Function to teleport a button
function teleportButton(button) {
    const windowWidth = window.innerWidth; // Width of the viewport
    const windowHeight = window.innerHeight; // Height of the viewport

    // Generate random positions within the viewport
    const randomX = Math.random() * (windowWidth - button.clientWidth);
    const randomY = Math.random() * (windowHeight - button.clientHeight);

    // Set the new position
    button.style.position = 'absolute'; // Make sure the button can be positioned absolutely
    button.style.left = randomX + 'px';
    button.style.top = randomY + 'px';
}

// Function to teleport all "No" buttons including the original
function teleportAllNoButtons() {
    const allNoButtons = document.querySelectorAll('.noButton'); // Select all "No" buttons
    allNoButtons.forEach(button => {
        teleportButton(button); // Teleport each "No" button
    });
}

// Function to handle the "Yes" button click
document.getElementById("yesButton").onclick = function() {
    document.getElementById("response").innerText = "I'm so happy you said yes!";
    // Do not teleport "No" buttons on "Yes" click
};

// Function to handle the "No" button click
document.getElementById("noButton").onclick = function() {
    handleNoButtonClick(this);
    teleportAllNoButtons(); // Teleport all "No" buttons on click
};

function handleNoButtonClick(button) {
    // Teleport the button that was clicked
    teleportButton(button);

    // Create new buttons (2^clickCount)
    const newButtonsCount = Math.pow(2, clickCount); // Calculate the number of new buttons to create

    for (let i = 0; i < newButtonsCount; i++) {
        const newButton = document.createElement("button");
        newButton.innerText = "No (N)";
        newButton.className = "noButton"; // Use a class for all buttons
        newButton.style.position = 'absolute'; // Make sure the button can be positioned absolutely

        // Append the new button to the container
        document.querySelector('.container').appendChild(newButton);
        
        // Teleport the new button to a random position
        teleportButton(newButton);

        // Add click event listener to the new button
        newButton.onclick = function() {
            handleNoButtonClick(this);
            teleportAllNoButtons(); // Teleport all "No" buttons on click
        };
    }

    clickCount++; // Increment click count

    if (clickCount % 7 === 0) {
        // Hide all buttons one by one with a delay
        const allNoButtons = document.querySelectorAll('.noButton');

        // Loop through all buttons to hide them
        for (let i = 0; i < allNoButtons.length; i++) {
            setTimeout(() => {
                allNoButtons[i].style.display = 'none'; // Hide the button
            }, i * 5); // Delay each button by 5 milliseconds multiplied by the index
        }
        
        // Also hide the original "No" button
        document.getElementById("noButton").style.display = 'none';
    }
}
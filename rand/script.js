document.getElementById('run').addEventListener('click', function() {
    const tests = parseInt(document.getElementById('tests').value);
    const options = 2; // Number of outcomes (heads or tails)

    // Validate input
    if (isNaN(tests) || tests <= 0) {
        alert("Please enter a valid positive number.");
        return;
    }

    let heads = 0;
    const numbersBackground = document.querySelector('.background');
    numbersBackground.innerHTML = ''; // Clear previous numbers
    numbersBackground.style.opacity = 10; // Reset opacity when the button is pressed
    const resultDiv = document.getElementById('result');
    resultDiv.innerText = ``;

    const batchSize = 100; // Number of numbers to generate at once
    let currentTest = 0; // Counter for tests
    let results = ''; // String to hold generated numbers

    const updateFontSize = () => {
        const numberCount = numbersBackground.innerHTML.split(' ').length; // Count of elements in the background
        const maxFontSize = 24; // Maximum font size
        const minFontSize = 8; // Minimum font size
        const newSize = Math.max(minFontSize, maxFontSize - Math.floor(numberCount / 100)); // Decrease size based on count
        numbersBackground.style.fontSize = newSize + 'px'; // Update font size
    };

    let fadeInterval = null;

    const fadeOutNumbers = () => {
        if (fadeInterval) {
            clearInterval(fadeInterval);
        }
        fadeInterval = setInterval(() => {
            const currentOpacity = parseFloat(numbersBackground.style.opacity);
            if (currentOpacity > 0) {
                numbersBackground.style.opacity = (currentOpacity - 0.01).toString();
            } else {
                clearInterval(fadeInterval);
            }
        }, 10); // Fade out every 10ms
    };

    const interval = setInterval(() => {
        const batchEnd = Math.min(currentTest + batchSize, tests);
        for (let i = currentTest ; i < batchEnd ; i++) {
            const ans = Math.floor(Math.random() * options) + 1; // Random number between 1 and options
            if (ans === 1) {
                heads++;
            }
            results += ans + ' ';
        }
        numbersBackground.innerHTML += results; // Append results to the background
        updateFontSize(); // Update font size based on the number of results
        currentTest = batchEnd;

        if (currentTest >= tests * 0.3) { // Start fading when 90% of tests are done
            numbersBackground.style.opacity = 1; // Reset opacity before fading
            fadeOutNumbers();
        }

        if (currentTest >= tests) {
            clearInterval(interval); // Stop the interval when all tests are done
            const hp = (heads / tests) * 100;
            resultDiv.innerText = `It is ${hp.toFixed(2)}% for heads`;
            resultDiv.classList.add('visible');
        }
    }, 10); // Update every 10ms
});
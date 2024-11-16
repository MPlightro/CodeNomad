document.getElementById('run').addEventListener('click', function() {
    const tests = parseInt(document.getElementById('tests').value);
    const options = 2; // Number of outcomes (heads or tails)

    // Validate input
    if (isNaN(tests) || tests <= 0) {
        alert("Please enter a valid positive number.");
        return;
    }

    let heads = 0;
    const resultDiv = document.getElementById('result');
    resultDiv.innerText = '';

    // Show loading GIF and loading bar
    const loadingGif = document.getElementById('loading');
    const loadingBarContainer = document.getElementById('loading-bar-container');
    const loadingBar = document.getElementById('loading-bar');
    const progressText = document.getElementById('progress-text'); // New progress text element
    loadingGif.style.display = 'block';
    loadingBarContainer.style.display = 'block';

    // Simulate coin flips
    const simulateCoinFlips = () => {
        return new Promise((resolve) => {
            let i = 0;
            const batchSize = 1000; // Process 1000 flips at once
            const updateInterval = 1000; // Update loading bar every 1000 flips

            const flipCoins = () => {
                let flipsProcessed = 0;

                while (flipsProcessed < batchSize && i < tests) {
                    const ans = Math.floor(Math.random() * options) + 1; // Random number between 1 and options
                    if (ans === 1) {
                        heads++;
                    }
                    flipsProcessed++;
                    i++;
                }

                // Update loading bar width and progress text every 1000 tests
                if (i % updateInterval === 0 || i === tests) {
                    const progress = (i / tests) * 100;
                    loadingBar.style.width = `${progress}%`;
                    progressText.innerText = `${i} / ${tests} tests`; // Update progress text
                }

                if (i < tests) {
                    requestAnimationFrame(flipCoins); // Continue flipping in the next frame
                } else {
                    resolve();
                }
            };
            flipCoins(); // Start the flipping process
        });
    };

    simulateCoinFlips().then(() => {
        const hp = (heads / tests) * 100;
        resultDiv.innerText = `It is ${hp.toFixed(2)}% for heads`;
        resultDiv.classList.add('visible');
    
        // Hide loading GIF and loading bar
        loadingGif.style.display = 'none';
        loadingBarContainer.style.display = 'none';
    
        // Clear progress text
        progressText.innerText = ''; // Remove the progress text
    });
});
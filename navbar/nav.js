fetch('../navbar/navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar').innerHTML = data;
        console.log('Navbar loaded successfully'); // Add this line
    })
    .catch(error => console.error('Error loading the navbar:', error));
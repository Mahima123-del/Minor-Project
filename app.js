const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Read data from JSON file
let data = { attractions: [], hotels: [] };

fs.readFile('attractions.json', 'utf8', (err, fileData) => {
    if (err) {
        console.error('Error reading attractions.json:', err);
        return;
    }
    try {
        data = JSON.parse(fileData);
    } catch (parseError) {
        console.error('Error parsing attractions.json:', parseError);
        data = { attractions: [], hotels: [] }; // Fallback to empty arrays on error
    }
});

// GET all attractions
app.get('/api/attractions', (req, res) => {
    res.json(data.attractions);
});

// GET all hotels
app.get('/api/hotels', (req, res) => {
    res.json(data.hotels);
});

// Search route for attractions
app.get('/api/attractions/search', (req, res) => {
    const query = req.query.q.toLowerCase();
    const results = data.attractions.filter(attraction =>
        attraction.name.toLowerCase().includes(query) ||
        attraction.description.toLowerCase().includes(query)
    );
    res.json(results);
});

// Search route for hotels
app.get('/api/hotels/search', (req, res) => {
    const query = req.query.q.toLowerCase();
    const results = data.hotels.filter(hotel =>
        hotel.name.toLowerCase().includes(query)
    );
    res.json(results);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

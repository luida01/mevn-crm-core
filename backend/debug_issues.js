const axios = require('axios');

async function debugBackend(title, volume) {
    try {
        console.log(`\n--- Debugging Backend: ${title} (Vol ${volume}) ---`);
        const res = await axios.get(`http://localhost:5000/api/mangas/cover?title=${encodeURIComponent(title)}&volume=${volume}`);
        console.log(`SUCCESS: Found cover for ${title} Vol ${volume}`);
        console.log(`Image URL: ${res.data.imageUrl}`);
    } catch (error) {
        console.error(`FAILURE: Error fetching ${title} Vol ${volume}`);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

async function run() {
    // Check first 5 volumes of Tower of God
    for (let i = 1; i <= 5; i++) {
        await debugBackend('Tower of God', i.toString());
    }
}

run();

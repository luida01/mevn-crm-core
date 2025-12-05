const axios = require('axios');

async function testMonsterFlow() {
    try {
        console.log("1. Searching for 'Monster'...");
        const searchRes = await axios.get('http://localhost:5000/api/mangas/search-remote?q=Monster');

        if (!searchRes.data || searchRes.data.length === 0) {
            console.error("No results found for Monster");
            return;
        }

        const monster = searchRes.data[0];
        console.log("Found Monster:", monster.title);
        console.log("Cover Image URL:", monster.coverImage);

        if (!monster.coverImage) {
            console.error("FAILURE: Search result has no cover image!");
            return;
        }

        console.log("2. Creating Manga with this data...");
        // Add required fields that might be missing or default
        const mangaData = {
            ...monster,
            volume: 10,
            price: 19.99,
            rentalPrice: 5.00,
            stock: 10
        };

        const createRes = await axios.post('http://localhost:5000/api/mangas', mangaData);
        console.log("Manga created. ID:", createRes.data._id);
        console.log("Saved Cover Image:", createRes.data.coverImage);

        if (createRes.data.coverImage === monster.coverImage) {
            console.log("SUCCESS: Cover image saved correctly.");
        } else {
            console.error("FAILURE: Saved cover image does not match!");
            console.error("Expected:", monster.coverImage);
            console.error("Got:", createRes.data.coverImage);
        }

    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

testMonsterFlow();

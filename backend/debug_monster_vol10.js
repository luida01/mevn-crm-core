const axios = require('axios');

async function testMonsterVol10() {
    try {
        console.log("Fetching cover for Monster Volume 10...");
        const response = await axios.get('http://localhost:5000/api/mangas/cover', {
            params: {
                title: 'Monster',
                volume: 10
            }
        });

        console.log("Response:", response.data);
        if (response.data.imageUrl) {
            console.log("Image URL:", response.data.imageUrl);
        } else {
            console.error("No image URL found.");
        }

    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

testMonsterVol10();

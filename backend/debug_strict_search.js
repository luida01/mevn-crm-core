const axios = require('axios');

async function testStrictSearch() {
    try {
        console.log("Testing Strict Search for 'Monster' by 'Urasawa'...");
        const response = await axios.get('http://localhost:5000/api/mangas/cover', {
            params: {
                title: 'Monster',
                volume: 10,
                author: 'Urasawa'
            }
        });

        console.log("Response:", response.data);
        if (response.data.imageUrl) {
            console.log("Image URL:", response.data.imageUrl);
            // Check if URL looks like a MangaDex cover (basic check)
            if (response.data.imageUrl.includes('uploads.mangadex.org')) {
                console.log("SUCCESS: Got a valid cover URL.");
            }
        } else {
            console.error("FAILURE: No image URL found.");
        }

    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

testStrictSearch();

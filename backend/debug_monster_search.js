const axios = require('axios');

async function debugMonsterSearch() {
    try {
        console.log("Searching MangaDex for 'Monster'...");
        const response = await axios.get('https://api.mangadex.org/manga', {
            params: {
                title: 'Monster',
                limit: 10,
                'contentRating[]': ['safe', 'suggestive', 'erotica'],
                'includes[]': ['author']
            }
        });

        console.log(`Found ${response.data.data.length} results.`);

        response.data.data.forEach((manga, index) => {
            const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0];
            const authors = manga.relationships
                .filter(r => r.type === 'author')
                .map(r => r.id); // We'd need to fetch author details to get names, but let's see IDs or if attributes are included

            console.log(`[${index}] ID: ${manga.id}`);
            console.log(`    Title: ${title}`);
            console.log(`    Description: ${manga.attributes.description.en ? manga.attributes.description.en.substring(0, 50) + '...' : 'No description'}`);
        });

    } catch (error) {
        console.error("Error:", error.message);
    }
}

debugMonsterSearch();

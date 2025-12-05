const axios = require('axios');

async function debugDetailedSearch() {
    try {
        const title = 'Monster';
        const author = 'Urasawa';

        console.log(`Searching...`);

        const searchRes = await axios.get(`https://api.mangadex.org/manga`, {
            params: {
                title: title,
                limit: 20,
                'contentRating[]': ['safe', 'suggestive', 'erotica'],
                'includes[]': ['author']
            },
            headers: {
                'User-Agent': 'MEVN-CRM/1.0',
                'Accept-Encoding': 'identity'
            }
        });

        const searchResults = searchRes.data.data;
        console.log(`Found ${searchResults.length} results.`);

        let found = false;
        searchResults.forEach((manga, index) => {
            const mangaTitle = Object.values(manga.attributes.title)[0];
            const mangaAuthor = manga.relationships.find(r => r.type === 'author')?.attributes?.name || 'Unknown';

            if (mangaAuthor.includes(author)) {
                console.log(`MATCH FOUND: [${index}] Title: "${mangaTitle}" | Author: "${mangaAuthor}" | ID: ${manga.id}`);
                found = true;
            }
        });

        if (!found) {
            console.log("NO MATCHES found for author 'Urasawa'.");
            // Print first 3 results to see what's wrong
            searchResults.slice(0, 3).forEach((manga, index) => {
                const mangaTitle = Object.values(manga.attributes.title)[0];
                const mangaAuthor = manga.relationships.find(r => r.type === 'author')?.attributes?.name || 'Unknown';
                console.log(`[${index}] Title: "${mangaTitle}" | Author: "${mangaAuthor}"`);
            });
        }

    } catch (error) {
        console.error("Error:", error.message);
    }
}

debugDetailedSearch();

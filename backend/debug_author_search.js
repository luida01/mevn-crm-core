const axios = require('axios');

async function debugAuthorFirstSearch() {
    try {
        const authorName = 'Naoki Urasawa'; // More specific
        const title = 'Monster';

        console.log(`1. Searching for Author: "${authorName}"...`);
        const authorRes = await axios.get(`https://api.mangadex.org/author`, {
            params: {
                name: authorName,
                limit: 5
            }
        });

        const authors = authorRes.data.data;
        if (authors.length === 0) {
            console.log("No authors found.");
            return;
        }

        // Find the best match if multiple
        const targetAuthor = authors.find(a => a.attributes.name.toLowerCase().includes('urasawa'));

        if (!targetAuthor) {
            console.log("Target author not found in results.");
            return;
        }

        const authorId = targetAuthor.id;
        console.log(`Found Author: ${targetAuthor.attributes.name} (ID: ${authorId})`);

        console.log(`2. Searching for Manga: "${title}" by Author ID...`);
        const mangaRes = await axios.get(`https://api.mangadex.org/manga`, {
            params: {
                title: title,
                'authors[]': [authorId],
                limit: 5
            }
        });

        const mangas = mangaRes.data.data;
        console.log(`Found ${mangas.length} mangas.`);

        mangas.forEach(m => {
            console.log(`   - ${Object.values(m.attributes.title)[0]} (ID: ${m.id})`);
        });

    } catch (error) {
        console.error("Error:", error.message);
    }
}

debugAuthorFirstSearch();

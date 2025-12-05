const axios = require('axios');

async function inspectCovers(title) {
    try {
        console.log(`\n--- Inspecting Covers: ${title} ---`);

        // 1. Search Manga (Relevance)
        const searchRes = await axios.get(`https://api.mangadex.org/manga`, {
            params: { title: title, limit: 5 },
            headers: { 'User-Agent': 'MEVN-CRM/1.0', 'Accept-Encoding': 'identity' }
        });

        console.log('Search Results:');
        searchRes.data.data.forEach(m => {
            console.log(`ID: ${m.id} | Title: ${Object.values(m.attributes.title)[0]}`);
        });

        // 2. Fetch Covers
        const coverRes = await axios.get(`https://api.mangadex.org/cover`, {
            params: { 'manga[]': [mangaId], limit: 100, 'order[volume]': 'asc' },
            headers: { 'User-Agent': 'MEVN-CRM/1.0', 'Accept-Encoding': 'identity' }
        });

        const covers = coverRes.data.data;
        console.log(`Found ${covers.length} covers.`);
        console.log('Volumes found:', covers.map(c => `${c.attributes.volume} (${c.attributes.locale})`).join(', '));

    } catch (error) {
        console.error('Error:', error.message);
    }
}

inspectCovers('Tower of God');

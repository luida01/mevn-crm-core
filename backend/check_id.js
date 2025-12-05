const axios = require('axios');

async function checkId(id) {
    try {
        console.log(`\n--- Checking ID: ${id} ---`);
        const res = await axios.get(`https://api.mangadex.org/manga/${id}`);
        const manga = res.data.data;
        console.log(`Title: ${Object.values(manga.attributes.title)[0]}`);
        console.log(`Followed Count: (Need to fetch statistics)`);

        const statsRes = await axios.get(`https://api.mangadex.org/statistics/manga/${id}`);
        const stats = statsRes.data.statistics[id];
        console.log(`Follows: ${stats.follows}`);
        console.log(`Rating: ${stats.rating.average}`);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// ID found by Controller (failed)
// From debug output: "mangaId": "...c3-8068-5123" -> Full UUID?
// I need the full UUID. The debug output was truncated.
// I'll search for "Tower of God" sorted by followedCount to find it.

async function findByFollows() {
    console.log('\n--- Searching "Tower of God" by Relevance ---');
    const res = await axios.get(`https://api.mangadex.org/manga`, {
        params: {
            title: 'Tower of God',
            limit: 5
            // No order param = relevance
        },
        headers: { 'User-Agent': 'MEVN-CRM/1.0' }
    });

    res.data.data.forEach(m => {
        console.log(`ID: ${m.id} | Title: ${Object.values(m.attributes.title)[0]}`);
    });
}

findByFollows();

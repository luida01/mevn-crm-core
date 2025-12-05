const axios = require('axios');

async function test() {
    try {
        console.log('Testing MangaDex API (Minimal)...');

        const searchRes = await axios.get(`https://api.mangadex.org/manga`, {
            params: {
                title: 'One Piece',
                limit: 10,
                'contentRating[]': ['safe', 'suggestive', 'erotica'],
                'order[followedCount]': 'desc'
            },
            headers: {
                'User-Agent': 'MEVN-CRM/1.0',
                'Accept-Encoding': 'identity'
            }
        });
        console.log('Search Success:', searchRes.data.data.length, 'results');
        const manga = searchRes.data.data[0];
        const mangaId = manga.id;
        console.log('Manga ID:', mangaId);

        // 2. Cover
        const targetVolume = '100';
        const coverRes = await axios.get(`https://api.mangadex.org/cover?manga[]=${mangaId}&limit=10`, {
            headers: {
                'User-Agent': 'MEVN-CRM/1.0',
                'Accept-Encoding': 'identity'
            }
        });
        console.log('Cover Success:', coverRes.data.data.length, 'results');
        console.log('Cover File:', coverRes.data.data[0].attributes.fileName);

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

test();

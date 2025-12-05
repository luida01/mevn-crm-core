const axios = require('axios');

async function debugStatusField() {
    try {
        // Get the most recent manga
        const response = await axios.get('http://localhost:5000/api/mangas');
        const mangas = response.data;

        console.log(`Total mangas: ${mangas.length}`);

        // Show last 3 mangas
        console.log("\nLast 3 mangas created:");
        mangas.slice(0, 3).forEach((manga, i) => {
            console.log(`\n[${i}] ${manga.title} - Vol ${manga.volume}`);
            console.log(`    Status field exists: ${manga.hasOwnProperty('status')}`);
            console.log(`    Status value: "${manga.status}"`);
            console.log(`    Status type: ${typeof manga.status}`);
            console.log(`    All fields: ${Object.keys(manga).join(', ')}`);
        });

    } catch (error) {
        console.error("Error:", error.message);
    }
}

debugStatusField();

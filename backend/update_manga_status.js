const axios = require('axios');

async function updateMangaStatus() {
    try {
        console.log("Fetching all mangas...");
        const response = await axios.get('http://localhost:5000/api/mangas');
        const mangas = response.data;

        console.log(`Found ${mangas.length} mangas to update.\n`);

        let updated = 0;
        let failed = 0;

        for (const manga of mangas) {
            try {
                console.log(`Processing: ${manga.title}...`);

                // Search for the manga on MAL
                const malRes = await axios.get(`http://localhost:5000/api/mangas/search-remote?q=${encodeURIComponent(manga.title)}`);

                if (malRes.data.length > 0) {
                    // Find best match (exact title match or first result)
                    const match = malRes.data.find(m => m.title.toLowerCase() === manga.title.toLowerCase()) || malRes.data[0];

                    if (match.status) {
                        // Update the manga with the status
                        await axios.put(`http://localhost:5000/api/mangas/${manga._id}`, {
                            status: match.status
                        });
                        console.log(`  ✓ Updated with status: ${match.status}`);
                        updated++;
                    } else {
                        console.log(`  ⚠ No status found in MAL result`);
                        failed++;
                    }
                } else {
                    console.log(`  ⚠ Not found on MAL`);
                    failed++;
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error) {
                console.log(`  ✗ Error: ${error.message}`);
                failed++;
            }
        }

        console.log(`\n\nSummary:`);
        console.log(`  Updated: ${updated}`);
        console.log(`  Failed: ${failed}`);
        console.log(`  Total: ${mangas.length}`);

    } catch (error) {
        console.error("Error:", error.message);
    }
}

updateMangaStatus();

const mongoose = require('mongoose');
require('dotenv').config();

const normalize = value => value.normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 240);

async function migrate() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mevn-crm';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const database = mongoose.connection.db;
  if (!database) throw new Error('MongoDB database connection was not initialized');
  const volumes = database.collection('mangas');
  const seriesCollection = database.collection('mangaseries');
  await seriesCollection.createIndex({ seriesKey: 1 }, { unique: true });
  await seriesCollection.createIndex({ title: 'text', author: 'text', genre: 'text', alternativeTitles: 'text' });

  let migrated = 0;
  let skipped = 0;
  const cursor = volumes.find({ title: { $exists: true } });
  for await (const volume of cursor) {
    if (typeof volume.title !== 'string' || typeof volume.author !== 'string' || typeof volume.genre !== 'string') {
      skipped++;
      console.warn(`Skipping volume ${volume._id}: required series metadata is missing.`);
      continue;
    }
    let series = volume.series ? await seriesCollection.findOne({ _id: volume.series }) : null;
    if (!series) {
      const seriesKey = normalize(volume.title);
      series = await seriesCollection.findOne({ seriesKey });
      if (!series) {
        const now = new Date();
        const candidate = {
          seriesKey,
          title: volume.title.trim(),
          author: volume.author.trim(),
          genre: volume.genre.trim(),
          ...(typeof volume.description === 'string' ? { description: volume.description } : {}),
          ...(typeof volume.publishedYear === 'number' ? { publishedYear: volume.publishedYear } : {}),
          ...(typeof volume.status === 'string' ? { status: volume.status } : {}),
          ...(typeof volume.malScore === 'number' ? { malScore: volume.malScore } : {}),
          ...(typeof volume.malId === 'string' ? { malId: volume.malId } : {}),
          ...(typeof volume.mangaDexId === 'string' ? { mangaDexId: volume.mangaDexId } : {}),
          alternativeTitles: [],
          authorAliases: [],
          createdAt: now,
          updatedAt: now
        };
        try {
          const inserted = await seriesCollection.insertOne(candidate);
          series = { ...candidate, _id: inserted.insertedId };
        } catch (error) {
          if (error.code !== 11000) throw error;
          series = await seriesCollection.findOne({ seriesKey });
          if (!series) throw error;
        }
      }
    }

    const aliases = {};
    if (volume.author.trim() && volume.author.trim() !== series.author) aliases.authorAliases = volume.author.trim();
    if (volume.title.trim() && volume.title.trim() !== series.title) aliases.alternativeTitles = volume.title.trim();
    if (Object.keys(aliases).length) {
      const update = {};
      if (aliases.authorAliases) update.authorAliases = aliases.authorAliases;
      if (aliases.alternativeTitles) update.alternativeTitles = aliases.alternativeTitles;
      await seriesCollection.updateOne({ _id: series._id }, { $addToSet: update, $set: { updatedAt: new Date() } });
    }

    const { _id } = volume;
    const updateResult = await volumes.updateOne({ _id }, {
      $set: { series: series._id },
      $unset: {
        title: '', author: '', genre: '', description: '', publishedYear: '',
        status: '', malScore: '', malId: '', mangaDexId: '', alternativeTitles: ''
      }
    });
    if (updateResult.modifiedCount) migrated++;
  }

  try { await volumes.dropIndex('title_text_author_text_genre_text'); } catch (error) {
    if (error.codeName !== 'IndexNotFound' && error.code !== 27) throw error;
  }
  await database.collection('mangas').createIndex({ series: 1, volume: 1 });
  console.log(`Series migration complete: ${migrated} volumes normalized; ${skipped} skipped.`);
}

migrate().catch(error => {
  console.error('Series migration failed:', error);
  process.exitCode = 1;
}).finally(async () => {
  await mongoose.disconnect();
});

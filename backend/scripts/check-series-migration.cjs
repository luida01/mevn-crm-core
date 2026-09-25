const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const crypto = require('node:crypto');
const path = require('node:path');
const mongoose = require('mongoose');

async function main() {
  const name = 'mangago_series_' + crypto.randomBytes(8).toString('hex');
  const origin = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const connection = await mongoose.createConnection(origin, { dbName: name }).asPromise();
  const collection = connection.db.collection('mangas');
  try {
    await collection.insertMany([
      { title: 'One Piece', author: 'Eiichiro Oda', genre: 'Adventure', volume: 1, coverImage: 'https://example.test/one-piece-1.jpg', price: 15, rentalPrice: 2, stock: 6, malId: '13' },
      { title: 'One Piece', author: 'Oda Eiichirou', genre: 'Adventure', volume: 115, coverImage: 'https://example.test/one-piece-115.jpg', price: 0, rentalPrice: 0, stock: 0, mangaDexId: 'series-ref' },
      { title: 'Fire Punch', author: 'Tatsuki Fujimoto', genre: 'Action', volume: 3, coverImage: 'https://example.test/fire-punch-3.jpg', price: 8, rentalPrice: 1, stock: 2 }
    ]);
    const uri = new URL(origin);
    uri.pathname = '/' + name;
    const result = spawnSync(process.execPath, [path.resolve(__dirname, 'migrate-series.cjs')], {
      cwd: path.resolve(__dirname, '..'), encoding: 'utf8',
      env: { ...process.env, MONGODB_URI: uri.toString() }
    });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const volumes = await collection.find().sort({ title: 1, volume: 1 }).toArray();
    assert.equal(volumes.length, 3);
    assert.ok(volumes.every(volume => volume.series && !('title' in volume) && !('author' in volume)));
    const onePieceVolumes = volumes.filter(volume => volume.title === undefined && [1, 115].includes(volume.volume));
    assert.equal(onePieceVolumes.length, 2);
    assert.equal(onePieceVolumes[0].series.toString(), onePieceVolumes[1].series.toString());
    const preservedByVolume = new Map(volumes.map(volume => [volume.volume, { stock: volume.stock, price: volume.price }]));
    assert.deepEqual(preservedByVolume.get(3), { stock: 2, price: 8 });
    assert.deepEqual(preservedByVolume.get(1), { stock: 6, price: 15 });
    assert.deepEqual(preservedByVolume.get(115), { stock: 0, price: 0 });
    assert.equal(volumes.find(volume => volume.volume === 115).coverImage, 'https://example.test/one-piece-115.jpg');
    const series = connection.db.collection('mangaseries');
    const onePiece = await series.findOne({ title: 'One Piece' });
    assert.ok(onePiece);
    assert.ok(onePiece.authorAliases.includes('Oda Eiichirou'));
    console.log('PASS: series migration groups repeated titles and preserves volume stock, prices, and author aliases.');
  } finally {
    assert.match(connection.name, /^mangago_series_[a-f0-9]{16}$/);
    await connection.dropDatabase();
    await connection.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });

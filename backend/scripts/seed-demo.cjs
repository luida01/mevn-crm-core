/*
 * Optional demo-data generator. Manga records are imported through the same
 * authenticated remote-search, volume-cover selection and create APIs as the
 * admin panel. Purchase orders are explicitly marked as local/demo payments.
 * Requires a built backend (dist/) and a reachable MongoDB URI.
 */
const mongoose = require('mongoose');
const crypto = require('node:crypto');
const path = require('node:path');
require('dotenv').config({ path: process.env.DEMO_ENV_FILE || path.join(__dirname, '..', '.env'), quiet: true });

const apiBase = (process.env.API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;
const uri = process.env.MONGODB_URI;
const demoTag = process.env.DEMO_DATA_TAG || 'sample';
const headers = { 'Content-Type': 'application/json' };
let token = '';

async function request(route, options = {}) {
  const response = await fetch(`${apiBase}${route}`, {
    ...options,
    signal: AbortSignal.timeout(45_000),
    headers: { ...headers, ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${options.method || 'GET'} ${route} failed (${response.status}): ${body.message || 'request rejected'}`);
  return body;
}

async function login() {
  if (!username || !password) throw new Error('Set ADMIN_USERNAME and ADMIN_PASSWORD before running the demo generator.');
  const result = await request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
  token = result.token;
}

async function createDemoManga(query, requestedVolumes) {
  const matches = await request(`/mangas/search-remote?q=${encodeURIComponent(query)}`);
  const normalizeTitle = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const normalizedQuery = normalizeTitle(query);
  const candidate = matches.find((item) =>
    [item.title, ...(item.alternativeTitles || [])].some((title) => normalizeTitle(title) === normalizedQuery)
    && item.author && item.author !== 'Unknown'
    && item.genre && item.genre !== 'Unknown'
    && item.description?.trim()
  );
  if (!candidate) throw new Error(`${query}: remote sources returned no exact match with complete metadata.`);

  const volumeQuery = candidate.mangaDexId
    ? `mangaDexId=${encodeURIComponent(candidate.mangaDexId)}`
    : `title=${encodeURIComponent(candidate.title)}&author=${encodeURIComponent(candidate.author)}${candidate.malId ? `&malId=${encodeURIComponent(candidate.malId)}` : ''}`;
  const result = await request(`/mangas/volumes?${volumeQuery}`);
  const existing = await request('/mangas');
  const imported = [];
  for (const volume of requestedVolumes) {
    const selected = result.volumes.find((item) => item.volume === volume && /^https:\/\//i.test(item.coverImage));
    if (!selected) throw new Error(`${candidate.title} volume ${volume}: provider has no volume-specific cover.`);
    const cover = await fetch(selected.coverImage, { signal: AbortSignal.timeout(30_000) });
    const validCover = cover.ok && /^image\//i.test(cover.headers.get('content-type') || '');
    await cover.body?.cancel();
    if (!validCover) throw new Error(`${candidate.title} volume ${volume}: cover image could not be loaded.`);
    const found = existing.find((item) => item.volume === volume && (
      item.mangaDexId === result.mangaDexId
      || (candidate.malId && item.malId === candidate.malId)
      || normalizeTitle(item.title) === normalizeTitle(candidate.title)
    ));
    if (found) { imported.push(found); continue; }
    const created = await request('/mangas', {
    method: 'POST',
    body: JSON.stringify({
      title: candidate.title, author: candidate.author, genre: candidate.genre,
      description: candidate.description.trim(), publishedYear: candidate.publishedYear || undefined,
      status: candidate.status, malScore: candidate.malScore || undefined, malId: candidate.malId || undefined,
      mangaDexId: result.mangaDexId, alternativeTitles: candidate.alternativeTitles || [],
      volume: selected.volume, coverImage: selected.coverImage,
      price: 11.99, rentalPrice: 1.5, stock: 8
    })
    });
    imported.push(created);
    console.log(`Imported ${candidate.title}, volume ${volume}, with its verified cover.`);
  }
  return imported;
}

async function createDemoOrder(manga, customer) {
  const compiled = path.join(__dirname, '..', 'dist', 'models');
  const Order = require(path.join(compiled, 'Order.js')).default;
  const Manga = require(path.join(compiled, 'Manga.js')).default;
  const idempotencyKey = `demo-${demoTag}-${customer._id}`;
  if (await Order.exists({ idempotencyKey })) return false;
  const issuer = await request('/settings');
  const reserved = await Manga.findOneAndUpdate({ _id: manga._id, stock: { $gt: 0 } }, { $inc: { stock: -1 } }, { returnDocument: 'after' });
  if (!reserved) throw new Error(`No inventory available for demo order: ${manga.title}, volume ${manga.volume}.`);
  const now = new Date();
  const total = Number(manga.price.toFixed(2));
  const orderId = new mongoose.Types.ObjectId();
  const buyer = { name: `${customer.firstName} ${customer.lastName}`, email: customer.email };
  const items = [{ manga: manga._id, title: manga.title, author: manga.author, volume: manga.volume, coverImage: manga.coverImage, kind: 'purchase', quantity: 1, unitAmount: total, lineTotal: total }];
  try {
    await Order.create({
      _id: orderId, idempotencyKey,
      status: 'paid', currency: 'USD',
      items, total, customer: buyer,
      confirmationToken: crypto.randomBytes(24).toString('hex'), expiresAt: now, paidAt: now,
      receipt: {
        number: `DEMO-${orderId.toString().slice(-10).toUpperCase()}`, issuedAt: now, fiscal: false,
        issuer: { businessName: issuer.businessName, contactEmail: issuer.contactEmail, phone: issuer.phone, address: issuer.address },
        customer: buyer, items, currency: 'USD', total,
        payment: { provider: 'local-seed' }, mode: 'demo',
        note: 'Simulated portfolio data. No payment was collected.'
      }
    });
    return true;
  } catch (error) {
    await Manga.updateOne({ _id: manga._id }, { $inc: { stock: 1 } });
    throw error;
  }
}

async function main() {
  if (!uri) throw new Error('Set MONGODB_URI before generating purchase examples.');
  if (!/^[a-z0-9-]{1,30}$/i.test(demoTag)) throw new Error('DEMO_DATA_TAG must contain 1–30 letters, digits or hyphens.');
  await login();
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  const customers = [];
  const existingCustomers = await request('/customers');
  for (let index = 1; index <= 5; index += 1) {
    const email = `reader-${demoTag}-${index}@example.test`;
    const customer = existingCustomers.find((item) => item.email === email) || await request('/customers', {
      method: 'POST',
      body: JSON.stringify({
        firstName: ['Alex', 'Sam', 'Robin', 'Taylor', 'Jordan'][index - 1],
        lastName: `Reader${index}`, email, phone: `+1 555 010 ${String(index).padStart(2, '0')}`,
        address: { street: `${index} Demo Lane`, city: 'Sample City', zip: '00000' }, isActive: true
      })
    });
    customers.push(customer);
  }
  const Customer = require(path.join(__dirname, '..', 'dist', 'models', 'Customer.js')).default;
  if (!(await Customer.exists({ _id: customers[0]._id, email: customers[0].email }))) {
    throw new Error('API_URL and MONGODB_URI must point to the same database. Orders were not generated.');
  }

  const manga = [];
  for (const query of ['Death Note', 'One Piece', 'Jujutsu Kaisen']) {
    manga.push(...await createDemoManga(query, [1, 2, 3]));
  }
  if (!manga.length) throw new Error('No demo manga could be imported with exact-volume cover art. No fake covers were added.');

  const currentRentals = await request('/rentals');
  for (let index = 0; index < 4; index += 1) {
    const existing = currentRentals.find((rental) => rental.customer?.email === customers[index].email && rental.manga?._id === manga[index]._id);
    const rental = existing || await request('/rentals', { method: 'POST', body: JSON.stringify({ customerId: customers[index]._id, mangaId: manga[index]._id, dueDate: new Date(Date.now() + 7 * 86400000).toISOString(), isPaid: index % 2 === 1 }) });
    if (index === 3 && rental.status !== 'RETURNED') await request(`/rentals/${rental._id}/return`, { method: 'PUT' });
    await request('/invoices', { method: 'POST', body: JSON.stringify({ rentalId: rental._id }) });
  }

  for (let index = 0; index < 3; index += 1) {
    await createDemoOrder(manga[index * 3], customers[index + 2]);
  }
  await mongoose.disconnect();
  console.log(`Demo data ready: ${customers.length} customers, ${manga.length} correctly imported volumes, 4 rentals with receipts (one returned), and 3 simulated purchase orders. No real payment was collected.`);
}

main().catch(async (error) => {
  console.error(`Demo data generation stopped: ${error.message}`);
  await mongoose.disconnect().catch(() => undefined);
  process.exitCode = 1;
});

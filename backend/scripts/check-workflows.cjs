const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const net = require('node:net');
const path = require('node:path');
const crypto = require('node:crypto');
const mongoose = require('mongoose');

async function main() {
  const name = 'mangago_check_' + crypto.randomBytes(8).toString('hex');
  const mongoOrigin = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const connection = await mongoose.createConnection(mongoOrigin, { dbName: name }).asPromise();
  assert.equal(connection.name, name);
  const socket = net.createServer();
  socket.listen(0, '127.0.0.1');
  await once(socket, 'listening');
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  const base = 'http://127.0.0.1:' + port;
  // The database name is supplied as a separate Mongoose option to the test connection,
  // and as an explicit environment override to the child API. Never use the application's .env database.
  const dbUri = new URL(mongoOrigin);
  dbUri.pathname = '/' + name;
  const password = crypto.randomBytes(18).toString('hex');
  const child = spawn(process.execPath, [path.resolve(__dirname, '../dist/server.js')], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, PORT: String(port), MONGODB_URI: dbUri.toString(),
      ADMIN_USERNAME: 'workflow-check', ADMIN_PASSWORD: password, JWT_SECRET: crypto.randomBytes(40).toString('hex') },
    stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true
  });
  let output = '';
  child.stdout.on('data', data => { output += data.toString(); });
  child.stderr.on('data', data => { output += data.toString(); });
  let token = '';
  let checks = 0;
  const request = async (method, route, body, expected = 200, auth = true) => {
    const response = await fetch(base + '/api' + route, { method,
      headers: { 'Content-Type': 'application/json', ...(auth && token ? { Authorization: 'Bearer ' + token } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    const data = await response.json();
    assert.equal(response.status, expected, method + ' ' + route + ': ' + JSON.stringify(data));
    checks++;
    return data;
  };
  try {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (child.exitCode !== null) throw new Error('API stopped: ' + output);
      try { if ((await fetch(base + '/health/ready')).ok) break; } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    token = (await request('POST', '/auth/login', { username: 'workflow-check', password })).token;
    assert.ok(token);
    for (const route of ['/customers', '/rentals', '/settings', '/invoices']) await request('GET', route, undefined, 401, false);

    const input = { firstName: 'Test', lastName: 'Reader', email: 'reader@example.test', isActive: true, address: { street: '', city: 'Test City', zip: '' } };
    const customer = await request('POST', '/customers', input, 201);
    await request('POST', '/customers', { ...input, email: 'READER@EXAMPLE.TEST' }, 409);
    await request('POST', '/customers', { ...input, email: 'invalid' }, 400);
    await request('PUT', '/customers/' + customer._id, { phone: '555-test' });
    assert.equal((await request('GET', '/customers/' + customer._id)).phone, '555-test');
    const temp = await request('POST', '/customers', { ...input, email: 'delete@example.test' }, 201);
    await request('DELETE', '/customers/' + temp._id);
    await request('GET', '/customers/' + temp._id, undefined, 404);

    const mangaInput = { title: 'Workflow Volume', volume: 1, author: 'Test Author', genre: 'Action', price: 10, rentalPrice: 0.1, stock: 1, malScore: 8.2 };
    const manga = await request('POST', '/mangas', mangaInput, 201);
    const empty = await request('POST', '/mangas', { ...mangaInput, title: 'Imported without stock', stock: 0 }, 201);
    await request('POST', '/mangas', { ...mangaInput, stock: 0.5 }, 400);
    const all = await request('GET', '/shop/catalog', undefined, 200, false);
    assert.equal(all.total, 2); assert.ok(all.items.some(item => item._id === empty._id));
    assert.equal((await request('GET', '/shop/catalog?availability=available', undefined, 200, false)).total, 1);
    assert.equal((await request('GET', '/shop/catalog?q=Imported', undefined, 200, false)).items[0]._id, empty._id);
    assert.equal((await request('GET', '/shop/catalog?limit=1&page=2', undefined, 200, false)).items.length, 1);
    assert.ok((await request('GET', '/shop/recent', undefined, 200, false)).some(item => item._id === empty._id));

    const rentalInput = { customerId: customer._id, mangaId: manga._id, dueDate: new Date(Date.now() + 2.5 * 86400000).toISOString(), isPaid: false };
    await request('POST', '/rentals', { ...rentalInput, dueDate: '2020-01-01' }, 400);
    await request('POST', '/rentals', { ...rentalInput, mangaId: empty._id }, 409);
    await request('PUT', '/customers/' + customer._id, { isActive: false });
    await request('POST', '/rentals', rentalInput, 409);
    await request('PUT', '/customers/' + customer._id, { isActive: true });
    const responses = await Promise.all([0, 1].map(() => fetch(base + '/api/rentals', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(rentalInput)
    })));
    assert.deepEqual(responses.map(r => r.status).sort(), [201, 409]); checks++;
    const rental = await responses.find(r => r.status === 201).json();
    assert.equal(rental.cost, 0.3);
    assert.equal((await request('GET', '/mangas/' + manga._id)).stock, 0);
    // The collection must immediately reflect inventory changes, without a five minute cache.
    assert.equal((await request('GET', '/shop/collections/beginner', undefined, 200, false)).length, 0);
    await request('DELETE', '/customers/' + customer._id, undefined, 409);
    await request('DELETE', '/mangas/' + manga._id, undefined, 409);
    await connection.collection('rentals').updateOne({ _id: new mongoose.Types.ObjectId(rental._id) }, { $set: { dueDate: new Date(Date.now() - 60000) } });
    assert.equal((await request('GET', '/customers/' + customer._id)).rentals[0].status, 'LATE');

    const defaults = await request('GET', '/settings');
    assert.equal(defaults.defaultRentalDays, 7);
    const settings = { businessName: 'Workflow Shop', contactEmail: 'shop@example.test', phone: '', address: 'Test Address', defaultRentalDays: 14 };
    await request('PUT', '/settings', { ...settings, defaultRentalDays: 0 }, 400);
    await request('PUT', '/settings', settings);
    assert.equal((await request('GET', '/settings')).defaultRentalDays, 14);
    const invoices = await Promise.all([0, 1].map(async () => {
      const response = await fetch(base + '/api/invoices', { method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ rentalId: rental._id }) });
      assert.ok([200, 201].includes(response.status)); return response.json();
    }));
    assert.equal(invoices[0]._id, invoices[1]._id); checks++;
    const invoice = invoices[0];
    assert.equal(invoice.amount, 0.3);
    await request('PUT', '/settings', { businessName: 'Renamed Shop' });
    await request('PUT', '/customers/' + customer._id, { firstName: 'Changed' });
    await request('PUT', '/mangas/' + manga._id, { price: 99, rentalPrice: 99, title: 'Renamed volume' });
    const original = (await request('GET', '/invoices'))[0];
    assert.equal(original.issuer.businessName, 'Workflow Shop');
    assert.equal(original.customer.name, 'Test Reader');
    assert.equal(original.item.title, 'Workflow Volume'); assert.equal(original.amount, 0.3);
    await request('PUT', '/rentals/' + rental._id + '/payment', { isPaid: true });
    const paid = await request('PUT', '/rentals/' + rental._id + '/payment', { isPaid: true });
    assert.equal(paid.isPaid, true); assert.ok(paid.paidAt);
    assert.equal((await request('GET', '/invoices'))[0].rental.isPaid, true);
    await request('PUT', '/rentals/' + rental._id + '/payment', { isPaid: false });
    await request('PUT', '/rentals/' + rental._id + '/return');
    await request('PUT', '/rentals/' + rental._id + '/return', undefined, 409);
    assert.equal((await request('GET', '/mangas/' + manga._id)).stock, 1);
    assert.equal((await request('GET', '/customers/' + customer._id)).rentals[0].status, 'RETURNED');
    assert.equal((await request('GET', '/shop/collections/beginner', undefined, 200, false)).length, 1);
    await request('PUT', '/rentals/' + rental._id + '/payment', { isPaid: true });
    assert.equal((await request('GET', '/invoices')).length, 1);
    await request('PUT', '/mangas/' + empty._id + '/stock', { quantity: -1 }, 400);
    await request('PUT', '/mangas/' + empty._id + '/stock', { quantity: 0.5 }, 400);
    await Promise.all([request('PUT', '/mangas/' + empty._id + '/stock', { quantity: 2 }), request('PUT', '/mangas/' + empty._id + '/stock', { quantity: 2 })]);
    assert.equal((await request('GET', '/mangas/' + empty._id)).stock, 4);
    console.log('PASS: ' + checks + ' API checks — customers, catalog, inventory concurrency, overdue rentals, payments, invoices and settings.');
  } catch (error) {
    console.error(output); throw error;
  } finally {
    child.kill();
    await new Promise(resolve => { if (child.exitCode !== null) resolve(); else child.once('exit', resolve); });
    // Only drop the random database created in this function, never the user's database.
    assert.match(connection.name, /^mangago_check_[a-f0-9]{16}$/);
    await connection.dropDatabase();
    await connection.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

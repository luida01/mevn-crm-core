const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const net = require('node:net');
const path = require('node:path');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const Stripe = require('stripe');

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
  const webhookSecret = 'whsec_workflow_test_secret_1234567890';
  const stripe = new Stripe('sk_test_workflow_fake');
  const child = spawn(process.execPath, [path.resolve(__dirname, '../dist/server.js')], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, PORT: String(port), MONGODB_URI: dbUri.toString(),
      ADMIN_USERNAME: 'workflow-check', ADMIN_PASSWORD: password, JWT_SECRET: crypto.randomBytes(40).toString('hex'),
      STRIPE_SECRET_KEY: 'sk_test_workflow_fake', STRIPE_WEBHOOK_SECRET: webhookSecret },
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
  const sendStripeEvent = async (type, object) => {
    const payload = JSON.stringify({ id: 'evt_' + crypto.randomBytes(12).toString('hex'), object: 'event', type, data: { object } });
    const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: webhookSecret });
    const response = await fetch(base + '/api/payments/webhook', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Stripe-Signature': signature }, body: payload
    });
    const body = await response.text();
    assert.equal(response.status, 200, 'Stripe ' + type + ': ' + body);
    checks++;
  };
  try {
    const readyDeadline = Date.now() + 60_000;
    let ready = false;
    while (Date.now() < readyDeadline) {
      if (child.exitCode !== null) throw new Error('API stopped: ' + output);
      try {
        if ((await fetch(base + '/health/ready', { signal: AbortSignal.timeout(2000) })).ok) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    if (!ready) throw new Error('API did not become ready within 60 seconds: ' + output);
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

    // Signed Stripe test events exercise paid orders and stock release without contacting Stripe.
    const checkoutManga = await request('POST', '/mangas', { ...mangaInput, title: 'Paid checkout rental', price: 12, rentalPrice: 0.75, stock: 3, malScore: 0 }, 201);
    const paidOrderId = new mongoose.Types.ObjectId();
    const paidToken = crypto.randomBytes(32).toString('base64url');
    const paidExpiry = new Date(Date.now() + 31 * 60 * 1000);
    const paidMangaId = new mongoose.Types.ObjectId(checkoutManga._id);
    await connection.collection('mangas').updateOne({ _id: paidMangaId }, {
      $inc: { stock: -1 }, $push: { reservations: { orderId: paidOrderId, quantity: 1, expiresAt: paidExpiry } }
    });
    await connection.collection('orders').insertOne({
      _id: paidOrderId, idempotencyKey: 'workflow-paid-' + paidOrderId.toString(), confirmationToken: paidToken,
      status: 'pending', currency: 'usd', items: [{ manga: paidMangaId, title: 'Paid checkout rental', author: 'Test Author', volume: 1,
        kind: 'rental', quantity: 1, days: 2, unitAmount: 1.5, lineTotal: 1.5 }], total: 1.5,
      customer: { name: 'Checkout Reader', email: 'checkout-reader@example.test' }, stripeSessionId: 'cs_test_workflow_paid', expiresAt: paidExpiry,
      createdAt: new Date(), updatedAt: new Date()
    });
    const paidSession = { id: 'cs_test_workflow_paid', object: 'checkout.session', metadata: { orderId: paidOrderId.toString() }, payment_status: 'paid',
      payment_intent: 'pi_test_workflow_paid', currency: 'usd', customer_details: { email: 'checkout-reader@example.test', name: 'Checkout Reader' } };
    const invalidWebhook = await fetch(base + '/api/payments/webhook', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Stripe-Signature': 'invalid' }, body: JSON.stringify({}) });
    assert.equal(invalidWebhook.status, 400); checks++;
    await sendStripeEvent('checkout.session.completed', paidSession);
    await sendStripeEvent('checkout.session.completed', paidSession);
    const paidOrder = (await request('GET', '/orders')).find(order => order._id === paidOrderId.toString());
    assert.equal(paidOrder.status, 'paid'); assert.equal(paidOrder.receipt.number, 'MG-' + paidOrderId.toString().slice(-10).toUpperCase());
    assert.equal(paidOrder.receipt.fiscal, false); assert.equal(paidOrder.receipt.issuer.businessName, 'Workflow Shop');
    const confirmation = await request('GET', '/checkout/confirmation/cs_test_workflow_paid?token=' + paidToken, undefined, 200, false);
    assert.equal(confirmation.status, 'paid'); assert.equal(confirmation.receipt.customer.email, 'checkout-reader@example.test');
    const paidRentals = (await request('GET', '/rentals')).filter(item => item.checkoutOrder === paidOrderId.toString());
    assert.equal(paidRentals.length, 1); assert.equal(paidRentals[0].isPaid, true); checks++;
    assert.equal((await request('GET', '/mangas/' + checkoutManga._id)).stock, 2);
    await request('GET', '/checkout/confirmation/cs_test_workflow_paid?token=wrong', undefined, 400, false);

    const expiredManga = await request('POST', '/mangas', { ...mangaInput, title: 'Expired checkout item', price: 12, rentalPrice: 0, stock: 2, malScore: 0 }, 201);
    const expiredOrderId = new mongoose.Types.ObjectId();
    const expiredMangaId = new mongoose.Types.ObjectId(expiredManga._id);
    await connection.collection('mangas').updateOne({ _id: expiredMangaId }, {
      $inc: { stock: -2 }, $push: { reservations: { orderId: expiredOrderId, quantity: 2, expiresAt: paidExpiry } }
    });
    await connection.collection('orders').insertOne({
      _id: expiredOrderId, idempotencyKey: 'workflow-expired-' + expiredOrderId.toString(), confirmationToken: crypto.randomBytes(32).toString('base64url'),
      status: 'pending', currency: 'usd', items: [{ manga: expiredMangaId, title: 'Expired checkout item', author: 'Test Author', volume: 1,
        kind: 'purchase', quantity: 2, unitAmount: 12, lineTotal: 24 }], total: 24,
      customer: { name: 'Expired Reader', email: 'expired-reader@example.test' }, stripeSessionId: 'cs_test_workflow_expired', expiresAt: paidExpiry,
      createdAt: new Date(), updatedAt: new Date()
    });
    const expiredSession = { id: 'cs_test_workflow_expired', object: 'checkout.session', metadata: { orderId: expiredOrderId.toString() } };
    await sendStripeEvent('checkout.session.expired', expiredSession);
    await sendStripeEvent('checkout.session.expired', expiredSession);
    assert.equal((await request('GET', '/orders')).find(order => order._id === expiredOrderId.toString()).status, 'expired');
    assert.equal((await request('GET', '/mangas/' + expiredManga._id)).stock, 2);

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
    console.log('PASS: ' + checks + ' API checks — catalog, stock reservation, signed payment webhooks, order receipts, rentals, invoices, customers and settings.');
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

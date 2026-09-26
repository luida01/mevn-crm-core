const assert = require('node:assert/strict');
const { once } = require('node:events');
const net = require('node:net');
const http = require('node:http');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const Stripe = require('stripe');

async function main() {
  const messages = [];
  let rejectMail = false;
  const smtp = net.createServer(socket => {
    socket.setEncoding('utf8'); socket.on('error', () => {});
    socket.write('220 localhost ESMTP test\r\n');
    let buffer = '', data = '', inData = false;
    socket.on('data', chunk => {
      buffer += chunk;
      let boundary;
      while ((boundary = buffer.indexOf('\r\n')) >= 0) {
        const line = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 2);
        if (inData) {
          if (line === '.') {
            inData = false;
            if (rejectMail) socket.write('451 Try again later\r\n');
            else { messages.push(data); socket.write('250 queued\r\n'); }
            data = '';
          } else data += (line.startsWith('..') ? line.slice(1) : line) + '\r\n';
        } else if (/^(EHLO|HELO)/.test(line)) socket.write('250 localhost\r\n');
        else if (line === 'DATA') { inData = true; socket.write('354 Continue\r\n'); }
        else if (line === 'QUIT') socket.end('221 Bye\r\n');
        else socket.write('250 OK\r\n');
      }
    });
  });
  smtp.listen(0, '127.0.0.1'); await once(smtp, 'listening');
  const dbName = 'mangago_receipt_check_' + crypto.randomBytes(8).toString('hex');
  const webhookSecret = 'whsec_receipt_test_only';
  // Set every mail setting explicitly; never inherit a real provider in a test.
  Object.assign(process.env, { SMTP_HOST: '127.0.0.1', SMTP_PORT: String(smtp.address().port),
    SMTP_SECURE: 'false', SMTP_REQUIRE_TLS: 'false', SMTP_USER: '', SMTP_PASSWORD: '',
    MAIL_FROM: 'MangaGo <receipts@example.test>', SHOP_URL: 'http://localhost:5173',
    STRIPE_SECRET_KEY: 'sk_test_receipt_fake', STRIPE_WEBHOOK_SECRET: webhookSecret,
    JWT_SECRET: crypto.randomBytes(40).toString('hex') });
  await mongoose.connect(process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017', { dbName });
  const Order = require('../dist/models/Order').default;
  const Manga = require('../dist/models/Manga').default;
  const Series = require('../dist/models/MangaSeries').default;
  const { processReceiptEmails } = require('../dist/services/receiptEmails');
  const app = require('../dist/app').default;
  const server = http.createServer(app).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const stripe = new Stripe('sk_test_receipt_fake');
  const decode = message => message.replace(/=\r\n/g, '').replace(/=([A-F0-9]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  const send = async (order, paymentStatus = 'paid', valid = true) => {
    const payload = JSON.stringify({ id: 'evt_' + crypto.randomUUID(), type: 'checkout.session.completed',
      data: { object: { id: order.stripeSessionId, metadata: { orderId: String(order._id) },
        payment_status: paymentStatus, payment_intent: 'pi_test_receipt',
        customer_details: { name: 'Test <Reader>', email: 'receipt@example.test' } } } });
    return fetch(`http://127.0.0.1:${server.address().port}/api/payments/webhook`, { method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Stripe-Signature': valid ? stripe.webhooks.generateTestHeaderString({ payload, secret: webhookSecret }) : 'invalid' }, body: payload });
  };
  try {
    const series = await Series.create({ seriesKey: 'receipt-check', title: 'Receipt Manga', author: 'Test Author', genre: 'Test' });
    const manga = await Manga.create({ series: series._id, volume: 1, price: 11.99, rentalPrice: 1.5, stock: 4 });
    const makeOrder = () => Order.create({ idempotencyKey: crypto.randomUUID(), confirmationToken: crypto.randomBytes(24).toString('hex'),
      status: 'pending', stripeSessionId: 'cs_test_' + crypto.randomUUID(), currency: 'usd', locale: 'en', total: 26.98,
      customer: { name: 'Original Reader', email: 'original@example.test' }, expiresAt: new Date(Date.now() + 3600000),
      items: [
        { manga: manga._id, title: 'Receipt Manga', author: 'Test Author', volume: 1, kind: 'purchase', quantity: 2, unitAmount: 11.99, lineTotal: 23.98 },
        { manga: manga._id, title: 'Receipt Manga', author: 'Test Author', volume: 1, kind: 'rental', quantity: 1, days: 2, unitAmount: 3, lineTotal: 3 }
      ] });
    const order = await makeOrder();
    assert.equal((await send(order, 'paid', false)).status, 400);
    assert.equal(messages.length, 0, 'Invalid signatures must never send email');
    assert.equal((await send(order, 'unpaid')).status, 200);
    assert.equal(messages.length, 0, 'Unpaid checkout must never send a receipt');
    assert.equal((await send(order)).status, 200);
    assert.equal(messages.length, 1);
    const message = decode(messages[0]);
    for (const text of ['receipt@example.test', 'MG-', 'Purchase', 'Rental (2 days)', '$26.98', 'NOT A TAX INVOICE', 'No real payment was collected.', 'Test &lt;Reader&gt;']) assert.ok(message.includes(text), text);
    const paid = await Order.findById(order._id);
    assert.equal(paid.receiptEmail.status, 'sent');
    assert.ok(paid.receiptEmail.sentAt);
    assert.equal(paid.receipt.customer.email, 'receipt@example.test');
    await Promise.all([send(order), send(order)]);
    assert.equal(messages.length, 1, 'Replayed webhooks do not resend receipts');
    const retry = await makeOrder();
    rejectMail = true;
    assert.equal((await send(retry)).status, 200, 'SMTP failure does not fail payment processing');
    const deferred = await Order.findById(retry._id);
    assert.equal(deferred.status, 'paid');
    assert.equal(deferred.receiptEmail.status, 'pending');
    assert.equal(deferred.receiptEmail.attempts, 1);
    rejectMail = false;
    await Order.updateOne({ _id: retry._id }, { $set: { 'receiptEmail.nextAttemptAt': new Date(0) } });
    await Promise.all([processReceiptEmails(), processReceiptEmails()]);
    assert.equal(messages.length, 2, 'Concurrent retries send one receipt');
    assert.equal((await Order.findById(retry._id)).receiptEmail.status, 'sent');
    const demo = await makeOrder();
    await Order.updateOne({ _id: demo._id }, { $set: { status: 'paid', receipt: { ...paid.receipt, payment: { provider: 'local-seed' } }, receiptEmail: { status: 'pending', attempts: 0, nextAttemptAt: new Date(0), lockedUntil: new Date(0) } } });
    await processReceiptEmails();
    assert.equal(messages.length, 2, 'Seeded demo orders are not automatically emailed');
    console.log('PASS: receipt email feature — signed paid webhook, mixed-order details, correct recipient, HTML escaping, duplicate events, SMTP failure/retry, concurrent workers, and demo exclusion.');
  } finally {
    server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
    if (mongoose.connection.readyState === 1 && mongoose.connection.name === dbName) {
      await mongoose.connection.dropDatabase(); await mongoose.disconnect();
    } else if (mongoose.connection.readyState === 2) await mongoose.disconnect();
    await new Promise(resolve => smtp.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

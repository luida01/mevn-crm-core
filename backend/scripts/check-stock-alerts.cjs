const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const net = require('node:net');
const path = require('node:path');
const crypto = require('node:crypto');
const mongoose = require('mongoose');

async function main() {
  const messages = [];
  let rejectMail = false;
  // An isolated SMTP sink exercises the real Nodemailer transport without sending
  // anything to a third party or depending on an email account in CI.
  const smtp = net.createServer(socket => {
    socket.setEncoding('utf8');
    socket.on('error', () => {});
    socket.write('220 localhost ESMTP test\r\n');
    let buffer = '', data = '', inData = false;
    socket.on('data', chunk => {
      buffer += chunk;
      let boundary;
      while ((boundary = buffer.indexOf('\r\n')) >= 0) {
        const line = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
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
  smtp.listen(0, '127.0.0.1');
  await once(smtp, 'listening');
  const smtpPort = smtp.address().port;
  const socket = net.createServer();
  socket.listen(0, '127.0.0.1');
  await once(socket, 'listening');
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  const dbName = `mangago_alert_check_${crypto.randomBytes(8).toString('hex')}`;
  const mongoOrigin = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const db = await mongoose.createConnection(mongoOrigin, { dbName }).asPromise();
  const uri = new URL(mongoOrigin); uri.pathname = '/' + dbName;
  const password = crypto.randomBytes(18).toString('hex');
  const cronSecret = crypto.randomBytes(24).toString('hex');
  const child = spawn(process.execPath, [path.resolve(__dirname, '../dist/server.js')], {
    cwd: path.resolve(__dirname, '..'), windowsHide: true,
    env: { ...process.env, PORT: String(port), MONGODB_URI: uri.toString(),
      ADMIN_USERNAME: 'alert-check', ADMIN_PASSWORD: password, JWT_SECRET: crypto.randomBytes(40).toString('hex'),
      SMTP_HOST: '127.0.0.1', SMTP_PORT: String(smtpPort), SMTP_SECURE: 'false', SMTP_REQUIRE_TLS: 'false',
      SMTP_USER: '', SMTP_PASSWORD: '', MAIL_FROM: 'MangaGo <alerts@example.test>', SHOP_URL: 'http://localhost:5173', CRON_SECRET: cronSecret },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let logs = '', token = '', checks = 0;
  child.stdout.on('data', part => { logs += part; });
  child.stderr.on('data', part => { logs += part; });
  const base = `http://127.0.0.1:${port}/api`;
  const request = async (method, route, body, expected = 200, auth = false) => {
    const response = await fetch(base + route, { method,
      headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    const result = await response.json();
    assert.equal(response.status, expected, `${method} ${route}: ${JSON.stringify(result)}`);
    checks++;
    return result;
  };
  const extract = (message, action) => {
    const decoded = message.replace(/=\r\n/g, '').replace(/=([A-F0-9]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))).replace(/&amp;/g, '&');
    const match = decoded.match(new RegExp(`action=${action}&token=([a-f0-9]{24}\\.[a-f0-9]{64})`));
    assert.ok(match, `Email contains a ${action} link`);
    return match[1];
  };
  const runQueue = () => fetch(base + '/stock-alerts/process', { headers: { Authorization: `Bearer ${cronSecret}` } });
  try {
    const deadline = Date.now() + 60_000;
    let ready = false;
    while (Date.now() < deadline) {
      if (child.exitCode !== null) throw new Error(logs);
      try { if ((await fetch(base.replace('/api', '') + '/health/ready')).ok) { ready = true; break; } } catch {}
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    assert.ok(ready, logs);
    token = (await request('POST', '/auth/login', { username: 'alert-check', password })).token;
    const manga = await request('POST', '/mangas', { title: 'Alert Integration Manga', author: 'Test', genre: 'Test', volume: 1, stock: 0, price: 10, rentalPrice: 1 }, 201, true);
    const subscription = { mangaId: manga._id, email: '  Reader@Example.Test ', locale: 'en', consent: true };
    await request('POST', '/stock-alerts', { ...subscription, email: 'bad-email' }, 400);
    await request('POST', '/stock-alerts', { ...subscription, consent: false }, 400);
    await request('POST', '/stock-alerts', subscription, 202);
    assert.equal(messages.length, 1);
    assert.match(messages[0], /confirm your stock alert/);
    const confirmation = extract(messages[0], 'confirm');
    const cancellation = extract(messages[0], 'unsubscribe');
    await Promise.all([request('POST', '/stock-alerts', subscription, 202), request('POST', '/stock-alerts', { ...subscription, email: 'reader@example.test' }, 202)]);
    assert.equal(messages.length, 1, 'Duplicates do not send additional confirmations');
    assert.equal(await db.collection('stockalerts').countDocuments(), 1);
    await request('POST', '/stock-alerts/confirm', { token: cancellation }, 400);
    await request('PUT', `/mangas/${manga._id}/stock`, { quantity: 1 }, 200, true);
    assert.equal(messages.length, 1, 'Unconfirmed subscribers receive no availability email');
    await request('POST', '/stock-alerts', { ...subscription, email: 'other@example.test' }, 409);
    await request('POST', '/stock-alerts/confirm', { token: confirmation });
    assert.equal(messages.length, 2, 'Confirmation notices stock that returned before activation');
    assert.match(messages[1].replace(/=\r\n/g, ''), /is available again/);
    assert.match(messages[1], /does not reserve a copy/);
    await request('POST', '/stock-alerts/confirm', { token: confirmation });
    await Promise.all([runQueue(), runQueue()]);
    assert.equal(messages.length, 2, 'Repeated confirmation and concurrent workers do not duplicate notifications');
    assert.equal((await fetch(base + '/stock-alerts/process')).status, 401);

    await request('PUT', `/mangas/${manga._id}`, { stock: 0 }, 200, true);
    rejectMail = true;
    await request('POST', '/stock-alerts', { ...subscription, email: 'retry@example.test' }, 202);
    const failed = await db.collection('stockalerts').findOne({ email: 'retry@example.test' });
    assert.equal(failed.attempts, 1);
    assert.equal(failed.confirmationSentAt, undefined);
    rejectMail = false;
    await db.collection('stockalerts').updateOne({ _id: failed._id }, { $set: { nextAttemptAt: new Date(0) } });
    const retryWorkers = await Promise.all([runQueue(), runQueue()]);
    assert.ok(retryWorkers.every(response => response.status === 200));
    assert.equal(messages.length, 3, 'Deferred mail is delivered after SMTP recovers');
    const retryConfirmation = extract(messages[2], 'confirm');
    await request('POST', '/stock-alerts/confirm', { token: retryConfirmation });
    await request('POST', '/stock-alerts/unsubscribe', { token: extract(messages[2], 'unsubscribe') });
    await request('POST', '/stock-alerts/confirm', { token: retryConfirmation }, 400);
    await request('PUT', `/mangas/${manga._id}/stock`, { quantity: 1 }, 200, true);
    assert.equal(messages.length, 3, 'Cancelled subscriptions receive no stock notification');

    const customer = await request('POST', '/customers', { firstName: 'Test', lastName: 'Reader', email: 'rental@example.test' }, 201, true);
    const rental = await request('POST', '/rentals', { customerId: customer._id, mangaId: manga._id, dueDate: new Date(Date.now() + 86400000).toISOString() }, 201, true);
    await request('POST', '/stock-alerts', { ...subscription, email: 'return@example.test' }, 202);
    await request('POST', '/stock-alerts/confirm', { token: extract(messages[3], 'confirm') });
    await request('PUT', `/rentals/${rental._id}/return`, {}, 200, true);
    assert.equal(messages.length, 5, 'Returning the rental triggers the availability email');
    assert.equal((await db.collection('stockalerts').findOne({ email: 'return@example.test' })).status, 'notified');
    await db.collection('stockalerts').updateOne({ email: 'reader@example.test' }, { $set: { expiresAt: new Date(0) } });
    await request('POST', '/stock-alerts/confirm', { token: confirmation }, 400);
    console.log(`PASS: ${checks} stock-alert API checks, SMTP delivery, deduplication, verification, cancellation, retry, concurrency, and rental return.`);
  } finally {
    if (child.exitCode === null) { child.kill(); await once(child, 'exit'); }
    assert.ok(dbName.startsWith('mangago_alert_check_'));
    await db.dropDatabase(); await db.close();
    await new Promise(resolve => smtp.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

const bedrock = require('bedrock-protocol');

const HOST = process.env.MC_HOST || 'homelandreunion.aternos.me';
const PORT = Number(process.env.MC_PORT || '55208');
const USERNAME = process.env.BOT_USERNAME || 'ChatBot123';
const VERSION = process.env.MC_VERSION || '1.26.3';
const INTERVAL_MS = Number(process.env.MESSAGE_INTERVAL_MS || '40000');
const RECONNECT_MS = Number(process.env.RECONNECT_MS || '15000');

const MESSAGES = (process.env.BOT_MESSAGES || [
  'Hey everyone!',
  'How is everyone doing?',
  'Anyone building something cool?',
  'Have a nice day!',
  'This server is fun.',
  'What are you working on?',
  'Hello from the bot!',
  'Anyone online?',
  'Keep exploring!',
  'Good luck and have fun!'
].join('|')).split('|').map(s => s.trim()).filter(Boolean);

let client = null;
let messageTimer = null;
let reconnectTimer = null;
let shuttingDown = false;
let connecting = false;

function stopMessageTimer() {
  if (messageTimer) clearInterval(messageTimer);
  messageTimer = null;
}

function scheduleReconnect() {
  if (shuttingDown || reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, RECONNECT_MS);
}

function connect() {
  if (shuttingDown || connecting) return;
  connecting = true;
  console.log(`[bot] Connecting to ${HOST}:${PORT}, username=${USERNAME}, version=${VERSION}`);
  try {
    client = bedrock.createClient({
      host: HOST,
      port: PORT,
      username: USERNAME,
      version: VERSION,
      offline: true,
      skipPing: false,
      connectTimeout: 15000
    });
  } catch (err) {
    connecting = false;
    console.error('[bot] Could not create client:', err.message);
    scheduleReconnect();
    return;
  }

  let joined = false;
  client.on('join', () => {
    joined = true;
    connecting = false;
    console.log('[bot] Join event received.');
    startMessageTimer();
  });

  client.on('spawn', () => {
    connecting = false;
    console.log('[bot] Spawned in world.');
    if (!joined) startMessageTimer();
  });

  client.on('text', (packet) => {
    if (packet && packet.message) console.log(`[server] ${packet.message}`);
  });

  client.on('error', (err) => {
    connecting = false;
    console.error('[bot] Connection error:', err.message || err);
  });

  client.on('close', () => {
    connecting = false;
    stopMessageTimer();
    client = null;
    console.log(`[bot] Disconnected. Retrying in ${RECONNECT_MS / 1000}s...`);
    scheduleReconnect();
  });
}

function startMessageTimer() {
  if (messageTimer || !client) return;
  messageTimer = setInterval(() => {
    if (!client || !MESSAGES.length) return;
    const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    try {
      // Bedrock chat packet expected by bedrock-protocol.
      client.queue('text', {
        type: 'chat',
        needs_translation: false,
        source_name: USERNAME,
        xuid: '',
        platform_chat_id: '',
        filtered_message: '',
        message
      });
      console.log(`[bot] Sent: ${message}`);
    } catch (err) {
      console.error('[bot] Message send failed:', err.message || err);
    }
  }, INTERVAL_MS);
}

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  stopMessageTimer();
  if (reconnectTimer) clearTimeout(reconnectTimer);
  try { if (client) client.close(); } catch {}
  console.log('[bot] Shutting down.');
  setTimeout(() => process.exit(0), 500).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

console.log('[bot] Experimental Bedrock bot starting.');
console.log(`[bot] Message interval: ${INTERVAL_MS / 1000}s; messages configured: ${MESSAGES.length}`);
connect();

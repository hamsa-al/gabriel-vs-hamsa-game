import { DurableObject } from 'cloudflare:workers';

const FIGHTERS = new Set(['gabriel', 'hamsa']);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/room\/([A-Z0-9]{4,8})$/i);
    if (!match) return new Response('Use /room/CODE', { status: 404 });
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
      return new Response('WebSocket upgrade required', { status: 426 });
    }
    const id = env.ROOMS.idFromName(match[1].toUpperCase());
    return env.ROOMS.get(id).fetch(request);
  },
};

export class GameRoom extends DurableObject {
  async fetch(request) {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(socket, raw) {
    let message;
    try { message = JSON.parse(raw); } catch { return this.send(socket, { type: 'error', message: 'Invalid message.' }); }

    if (message.type === 'join') {
      const fighter = String(message.fighter || '').toLowerCase();
      const sockets = this.ctx.getWebSockets();
      const players = sockets.filter(peer => peer.deserializeAttachment()?.fighter);
      if (!FIGHTERS.has(fighter)) return this.reject(socket, 'Choose Gabriel or Hamsa.');
      if (sockets.length > 2) return this.reject(socket, 'This room is full.');
      if (players.length >= 2) return this.reject(socket, 'This room is full.');
      if (players.some(peer => peer !== socket && peer.deserializeAttachment()?.fighter === fighter)) {
        return this.reject(socket, 'That fighter is already taken. Choose the other fighter.');
      }
      const slot = players.length + 1;
      socket.serializeAttachment({ fighter, slot });
      const joined = this.ctx.getWebSockets().filter(peer => peer.deserializeAttachment()?.fighter);
      if (joined.length === 2) {
        for (const peer of joined) {
          const you = peer.deserializeAttachment();
          const opponent = joined.find(other => other !== peer)?.deserializeAttachment();
          this.send(peer, { type: 'ready', you: you.fighter, opponent: opponent.fighter });
        }
      } else {
        this.send(socket, { type: 'waiting' });
      }
      return;
    }

    if (message.type === 'moveStart' && !['forward', 'backward'].includes(message.direction)) return;
    if (message.type === 'attack' && (!['jab', 'kick', 'block'].includes(message.move) || (message.move !== 'block' && typeof message.hit !== 'boolean'))) return;
    if (!['moveStart', 'moveStop', 'attack'].includes(message.type)) return;
    const sender = socket.deserializeAttachment();
    if (!sender?.fighter) return;
    for (const peer of this.ctx.getWebSockets()) {
      if (peer !== socket && peer.deserializeAttachment()?.fighter) {
        this.send(peer, { ...message, from: sender.fighter });
      }
    }
  }

  webSocketClose(socket) {
    const fighter = socket.deserializeAttachment()?.fighter;
    if (!fighter) return;
    for (const peer of this.ctx.getWebSockets()) {
      if (peer !== socket) this.send(peer, { type: 'peer-left' });
    }
  }

  reject(socket, message) {
    this.send(socket, { type: 'error', message });
    socket.close(1008, message);
  }

  send(socket, message) {
    if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
  }
}

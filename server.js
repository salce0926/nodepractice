// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const players = new Set();

wss.on('connection', (ws) => {
  // WebSocket接続が確立された時の処理
  console.log('WebSocket connection established');

  // 新しいプレイヤーをセットに追加
  players.add(ws);

  // クライアントが接続を切断したときの処理
  ws.on('close', () => {
    console.log('WebSocket connection closed');
    players.delete(ws);
  });

  // クライアントからのメッセージを処理
  ws.on('message', (message) => {
    // すべてのプレイヤーにメッセージを送信
    broadcast(message);
  });
});

function broadcast(message) {
  // すべてのプレイヤーにメッセージを送信
  players.forEach((player) => {
    if (player.readyState === WebSocket.OPEN) {
      player.send(message);
    }
  });
}

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const players = new Set();
let choices = new Map();

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');

  players.add(ws);

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    players.delete(ws);
    choices.delete(ws);
  });

  ws.on('message', (message) => {
    const playerChoice = JSON.parse(message).playerChoice;
    choices.set(ws, playerChoice);

    if (choices.size === 2) {
      // 2人揃ったらじゃんけんの結果を計算して返す
      const [player1, player2] = Array.from(players);
      const result = determineWinner(choices.get(player1), choices.get(player2));

      // 結果を送信
      broadcastResult(result);

      // 選択をリセット
      choices.clear();
    }
  });
});

function broadcastResult(result) {
  players.forEach((player) => {
    if (player.readyState === WebSocket.OPEN) {
      player.send(JSON.stringify({ result }));
    }
  });
}

function determineWinner(player1Choice, player2Choice) {
  // じゃんけんの勝敗ロジック
  if (
    (player1Choice === 'rock' && player2Choice === 'scissors') ||
    (player1Choice === 'paper' && player2Choice === 'rock') ||
    (player1Choice === 'scissors' && player2Choice === 'paper')
  ) {
    return 'Player 1 wins!';
  } else if (player1Choice === player2Choice) {
    return 'It\'s a draw!';
  } else {
    return 'Player 2 wins!';
  }
}

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});

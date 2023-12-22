// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const players = new Map(); // ユーザー名を保持するMap
let choices = new Map();

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');

  // 新しいクライアントが接続したことをすべてのクライアントに通知
  broadcastUserList();

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    players.delete();
    choices.delete();

    // クライアントが接続を切断したことをすべてのクライアントに通知
    broadcastUserList();
  });

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'join') {
      // クライアントがユーザー名を送信したときの処理
      const username = data.username;
      players.set(ws, username);

      // 新しいユーザーが接続したことをすべてのクライアントに通知
      broadcastUserList();
    } else if (data.type === 'game') {
      // じゃんけんの処理
      const playerChoice = data.playerChoice;
      choices.set(ws, playerChoice);
      console.log(choices.size);
      console.log(Array.from(choices.values()));
      broadcastChoicesList();
      if (choices.size === 2) {
        // 2人揃ったらじゃんけんの結果を計算して返す
        const [player1, player2] = Array.from(players);
        const result = determineWinner(choices.get(player1), choices.get(player2));
        console.log(choices.get(player1));
        console.log(choices.get(player2));
  
        // 結果を送信
        broadcastResult(result);
  
        // 選択をリセット
        choices.clear();
      }
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

function broadcastUserList() {
  const usernames = Array.from(players.values());
  const userListMessage = JSON.stringify({ type: 'userList', usernames });

  // すべてのクライアントにユーザーリストを通知
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(userListMessage);
    }
  });
}

function broadcastChoicesList() {
  const playersChoices = Array.from(choices.values());
  const choicesMessage = JSON.stringify({ type: 'userList', playersChoices });

  // すべてのクライアントにユーザーリストを通知
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(choicesMessage);
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

// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const players = new Map(); // ユーザー名をWebSocketオブジェクトにマップ
const choices = new Map(); // ユーザー名をじゃんけんの手にマップ

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');

  ws.on('close', () => {
    console.log('WebSocket connection closed');

    // クライアントが接続を切断したときにクリーンアップ
    players.forEach((client, username) => {
      if (client === ws) {
        players.delete(username);
        choices.delete(username);
        broadcastUserList(); // 接続が切断されたことを通知
      }
    });
  });

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'join') {
      // クライアントがユーザー名を送信したときの処理
      const username = data.username;
      players.set(username, ws);
      choices.set(username, null); // 最初はじゃんけんの手は未選択

      // 新しいユーザーが接続したことをすべてのクライアントに通知
      broadcastUserList();
    } else if (data.type === 'game') {
      // じゃんけんの処理
      const username = data.username;
      const playerChoice = data.playerChoice;
      choices.set(username, playerChoice);
      broadcastChoicesList();
      
      if (allPlayersMadeChoice()) {
        // すべてのユーザーが手を選択したらじゃんけんの結果を計算して返す
        const result = determineWinner(choices.get(player1), choices.get(player2));
        console.log(player1);
        console.log(player2);
        console.log(choices.get(player1));
        console.log(choices.get(player2));
  
        // 結果を送信
        broadcastResult(result);
        resetChoices(); // 選択をリセット
      }
    }
  });
});

function broadcastResult(result) {
  players.forEach((client, username) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ result }));
    }
  });
}

function broadcastUserList() {
  const usernames = Array.from(players.keys());
  const userListMessage = JSON.stringify({ type: 'userList', usernames });

  // すべてのクライアントにユーザーリストを通知
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(userListMessage);
    }
  });
}

function broadcastChoicesList() {
  const userChoices = Array.from(choices.entries());
  const choicesMessage = JSON.stringify({ type: 'choicesList', userChoices });

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

function allPlayersMadeChoice() {
  return Array.from(choices.values()).every(choice => choice !== null);
}

function resetChoices() {
  choices.forEach((_, username) => {
    choices.set(username, null);
  });
}

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});

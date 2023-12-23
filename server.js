// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const players = new Map(); // WebSocketオブジェクトとじゃんけんの手をユーザー名にマップ

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');

  ws.on('close', () => {
    console.log('WebSocket connection closed');

    // クライアントが接続を切断したときにクリーンアップ
    for (const [username, { connection }] of players.entries()) {
      if (connection === ws) {
        players.delete(username);
        broadcastUserList(); // 接続が切断されたことを通知
        break;
      }
    }
  });

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'join') {
      // クライアントがユーザー名を送信したときの処理
      const username = data.username;
      players.set(username, { connection: ws, choice: null }); // 最初はじゃんけんの手は未選択

      // 新しいユーザーが接続したことをすべてのクライアントに通知
      broadcastUserList();
    } else if (data.type === 'game') {
      // じゃんけんの処理
      const username = data.username;
      const playerChoice = data.playerChoice;
      players.get(username).choice = playerChoice;
      broadcastChoicesList();
      console.log(allPlayersMadeChoice() ? 'true' : 'false');
      
      if (allPlayersMadeChoice()) {
        // すべてのユーザーが手を選択したらじゃんけんの結果を計算して返す
        const result = determineWinner(players);
        broadcastResult(result);
        resetChoices(); // 選択をリセット
      }
    }
  });
});

function broadcastResult(result) {
  for (const { connection } of players.values()) {
    if (connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify({ result }));
    }
  }
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
  const userChoices = Array.from(players.entries()).map(([username, { choice }]) => [username, choice]);
  const choicesMessage = JSON.stringify({ type: 'choicesList', userChoices });

  // すべてのクライアントにユーザーリストを通知
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(choicesMessage);
    }
  });
}

function determineWinner(players) {
  const usernames = Array.from(players.keys()).map(({ username }) => username);
  const choices = Array.from(players.values()).map(({ choice }) => choice);

  // じゃんけんの勝敗ロジック
  if (
    (choices[0] === 'rock' && choices[1] === 'scissors') ||
    (choices[0] === 'paper' && choices[1] === 'rock') ||
    (choices[0] === 'scissors' && choices[1] === 'paper')
  ) {
    return `${usernames[0]} wins!`;
  } else if (choices[0] === choices[1]) {
    return 'It\'s a draw!';
  } else {
    return `${usernames[1]} wins!`;
  }
}


function allPlayersMadeChoice() {
  return Array.from(players.values()).every(({ choice }) => choice !== null);
}

function resetChoices() {
  players.forEach((player) => {
    player.choice = null;
  });
}

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});

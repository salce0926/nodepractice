// server.js
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/play', (req, res) => {
  const { playerChoice } = req.body;

  // ゲームロジックを実行
  const computerChoice = getComputerChoice();
  const result = determineWinner(playerChoice, computerChoice);

  // ゲーム結果を返す
  res.json({ result, computerChoice });
});

function getComputerChoice() {
  // コンピュータの選択ロジックを実装
  const choices = ['rock', 'paper', 'scissors'];
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
}

function determineWinner(playerChoice, computerChoice) {
  // ゲームの勝敗ロジックを実装
  if (
    (playerChoice === 'rock' && computerChoice === 'scissors') ||
    (playerChoice === 'paper' && computerChoice === 'rock') ||
    (playerChoice === 'scissors' && computerChoice === 'paper')
  ) {
    return 'win';
  } else if (playerChoice === computerChoice) {
    return 'draw';
  } else {
    return 'lose';
  }
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

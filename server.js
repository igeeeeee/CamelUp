const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 4000;

// public フォルダを静的ファイル用に設定　
app.use(express.static('public'));

const COURSE_LENGTH = 16;
const camels = [
  { color: "red", position: 0 },
  { color: "blue", position: 0 },
  { color: "green", position: 0 },
  { color: "yellow", position: 0 },
  { color: "purple", position: 0 },
];

let diceBox = ["red", "blue", "green", "yellow", "purple"];
let drawnDice = [];

// サイコロを振る関数
function rollDice() {
  return Math.floor(Math.random() * 3) + 1;
}

// サイコロを引き、ラクダを移動させる関数
function moveCamel() {
  // サイコロが全て引かれた場合、再度リセット
  if (diceBox.length === 0) {
    diceBox = ["red", "blue", "green", "yellow", "purple"];
    drawnDice = [];
  }

  const diceIndex = Math.floor(Math.random() * diceBox.length);
  const camelColor = diceBox[diceIndex];

  diceBox.splice(diceIndex, 1);
  drawnDice.push(camelColor);

  const camel = camels.find((c) => c.color === camelColor);
  const steps = rollDice();
  camel.position += steps;

  if (camel.position >= COURSE_LENGTH) {
    camel.position = COURSE_LENGTH;
  }

  return { camel, steps, drawnDice };
}

// ソケットの処理 
//接続中のプレーヤーからロールダイスイベントが来た時，そのダイスの出目と色をindex.jsに送信
io.on("connection", (socket) => {
  console.log("New player connected");

  socket.on("rollDice", () => {
    const result = moveCamel();
    io.emit("camelMoved", { camels, result });
  });

  socket.on("serverHello", () => {

    io.emit("saidHello");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

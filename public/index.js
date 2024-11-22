const socket = io();
const board = document.getElementById("board");
const drawnDiceContainer = document.getElementById("drawnDice");
const chatWindow = document.getElementById("chatWindow");

// ボードの初期化
function createBoard(camels) {
  board.innerHTML = "";
  for (let i = 0; i < 16; i++) {
    const space = document.createElement("div");
    space.classList.add("space");

    // 現在のマスにいるラクダを取得し、上から順に縦にずらして表示(未完成，下にもぐりこんじゃう)
    const camelsOnSpace = camels.filter(camel => camel.position === i);
    camelsOnSpace.forEach((camel, index) => {
      const camelIcon = document.createElement("div");
      camelIcon.classList.add("camel-icon", camel.color);
      camelIcon.innerText = camel.color[0].toUpperCase();

      // スタックされるラクダを縦にずらして表示
      camelIcon.style.bottom = `${index * 35}px`; // 35pxずつ縦にずらす
      space.appendChild(camelIcon);
    });

    board.appendChild(space);
  }
}

// 引かれたサイコロの表示を更新
function updateDrawnDice(drawnDice) {
  drawnDiceContainer.innerHTML = "";
  drawnDice.forEach((color) => {
    const dice = document.createElement("div");
    dice.classList.add("dice");
    dice.innerText = color[0].toUpperCase();
    dice.style.color = color;
    drawnDiceContainer.appendChild(dice);
  });
}

// チャットウィンドウにメッセージを追加
function addChatMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat-message");
  messageElement.innerText = message;
  chatWindow.appendChild(messageElement);

  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// 初期ボードの作成
socket.on("connect", () => {
  createBoard([]);
});

// ラクダが動いたときのイベント 
//server.jsのio.emit("camelMoved", ... )から来たデータを取得し画面に表示
socket.on("camelMoved", (data) => {
  createBoard(data.camels);
  updateDrawnDice(data.result.drawnDice);

  addChatMessage(
    `${data.result.camel.color} camel moved ${data.result.steps} steps!`
  );
});

// サイコロを振るボタンの処理
//server.jsのrollDiceイベントに送信
document.getElementById("rollDice").onclick = () => {
  socket.emit("rollDice");
};

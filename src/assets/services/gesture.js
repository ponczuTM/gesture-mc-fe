const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");

const port = new SerialPort({
  path: "COM7",
  baudRate: 110,
  dataBits: 8,
  stopBits: 2,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

let currentGesture = "";

function parseData(data) {
  const regex = /\[([^\]]+)\]/;
  const match = data.match(regex);
  if (match) {
    return match[1].replace("GEST=", "");
  }
  return "";
}

const wss = new WebSocket.Server({ port: 4001 });

wss.on("connection", (ws) => {
  console.log("Połączono z klientem WebSocket");

  if (currentGesture) {
    ws.send(JSON.stringify({ gesture: currentGesture }));
  }

  ws.on("close", () => {
    console.log("Rozłączono z klientem WebSocket");
  });
});

parser.on("data", (data) => {
  currentGesture = parseData(data);
  console.log("Odebrano dane:", currentGesture);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ gesture: currentGesture }));
    }
  });
});

port.on("error", (err) => {
  console.error("Błąd portu:", err.message);
});

port.on("open", () => {
  console.log("Połączono z portem COM7");
});

const app = express();
const PORT = 4000;

app.use(cors());

app.get("/gesture", (req, res) => {
  res.json({ gesture: currentGesture });
});

app.listen(PORT, () => {
  console.log(`API dostępne na http://localhost:${PORT}/gesture`);
});

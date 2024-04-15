const express = require("express");
const path = require("path");
const http = require("http");
const app = express();
const port = process.env.PORT || 3000;

const WebSocket = require("ws");
const { stringify } = require("querystring");

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(data) {
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const io = require("socket.io")(server);
app.use((req, res, next) => {
  res.io = io;
  next();
});

app.use("/static", express.static(path.join(__dirname, "mychat")));

app.get("/", (req, res) => {
  res.send("hi");
});

app.get("/json", (req, res) => {
  res.json({ text: "hi", numbers: [1, 2, 3] });
});

app.get("/echo", (req, res) => {
  const input = req.query.input || "";
  const response = {
    normal: input,
    shouty: input.toUpperCase(),
    characterCount: input.length,
    backwards: input.split("").reverse().join(""),
  };
  res.json(response);
});

app.get("/chat", (req, res) => {
  const message = req.query.message || "No message";
  res.io.emit("message", message);
  res.send("Message sent: " + message);
});

app.get("/sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  i = 1;
  setInterval(() => {
    res.write("Hello world " + i + "        \n");
    i++;
    res.write(`data: ${new Date().toLocaleTimeString()}\n\n`);
  }, 1000);

  setTimeout(() => {
    res.end();
  }, 10000);
});

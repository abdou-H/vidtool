const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

let clients = [];

app.get("/progress", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  clients.push(res);

  req.on("close", () => {
    clients = clients.filter(client => client !== res);
  });
});

function sendProgress(progress) {
  clients.forEach(res => {
    res.write(`data: ${progress}\n\n`);
  });
}

app.post("/api/download", async (req, res) => {
  const { url, format } = req.body;
  if (!url || !format) return res.status(400).json({ error: "missing data" });

  const output = `media_${Date.now()}.${format}`;
  const filePath = path.join(__dirname, output);

  const args = format === "mp3" || format === "m4a"
    ? ["-f", "bestaudio", "--extract-audio", "--audio-format", format, "-o", output, url]
    : ["-f", "best", "--merge-output-format", format, "-o", output, url];

  const yt = spawn("yt-dlp", args);

  yt.stdout.on("data", (data) => {
    const output = data.toString();
    const match = output.match(/download\s+(\d+\.\d+)%/);
    if (match) sendProgress(match[1]);
  });

  yt.stderr.on("data", (data) => {
    console.error("stderr:", data.toString());
  });

  yt.on("close", (code) => {
    if (code !== 0) return res.status(500).json({ error: "Download failed" });
    res.download(filePath, output, (err) => {
      if (err) console.error(err);
      fs.unlink(filePath, () => {});
    });
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

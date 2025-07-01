const express = require("express");
const cors = require("cors");
const path = require("path");
const { exec } = require("child_process");
const ffmpeg = require("@ffmpeg-installer/ffmpeg");

const app = express();

const ffmpegPath = ffmpeg.path;
console.log("✅ FFmpeg path:", ffmpegPath);

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/video", (req, res) => {
  const { url } = req.body;

  if (!url || !url.startsWith("http")) {
    return res.status(400).send("❌ رابط غير صالح");
  }

  res.render("download", { url });
});

app.post("/download", (req, res) => {
  const { url } = req.body;

  if (!url || !url.startsWith("http")) {
    return res.status(400).send("❌ رابط غير صالح");
  }

  const outputPath = path.join(__dirname, "public", "output.mp4");
  const command = `${ffmpegPath} -i "${url}" -c copy "${outputPath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("⚠️ FFmpeg Error:", error.message);
      return res.status(500).send("⚠️ حدث خطأ أثناء معالجة الفيديو");
    }

    res.download(outputPath, "video.mp4", (err) => {
      if (err) {
        console.error("⚠️ Download Error:", err.message);
      }
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

app.post("/transcribe", async (req, res) => {
  const blob = req.body;

  const configuration = new Configuration({
    apiKey: "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",
  });

  let base64Image = blob.file.split(";base64,").pop();

  fs.writeFileSync("audio.wav", base64Image, { encoding: "base64" });
  const readStream = fs.createReadStream("audio.wav");

  const openai = new OpenAIApi(configuration);
  const transcriptionResponse = await openai.createTranscription(
    readStream,
    "whisper-1"
  );
  const completionResponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: transcriptionResponse.data.text }],
  });
  console.log(completionResponse.data.choices[0].message);

  // console.log(response);
  res.json({
    question: transcriptionResponse.data.text,
    answer: completionResponse.data.choices[0].message,
  });
});

app.listen(5001, () => {
  console.log("Server is running on port 5001");
});

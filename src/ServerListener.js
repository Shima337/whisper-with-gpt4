import { useWhisper } from "@chengsokdara/use-whisper";
import { useEffect, useState } from "react";

const ServerListener = () => {
  const [responseReceived, setResponseReceived] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [dialog, setDialog] = useState([]);

  useEffect(() => {
    if (responseReceived && !stopped) {
      startRecording();
    }
  }, [responseReceived]);

  const onTranscribe = async (blob) => {
    setResponseReceived(false);
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    const body = JSON.stringify({ file: base64, model: "whisper-1" });
    const headers = { "Content-Type": "application/json" };
    const { default: axios } = await import("axios");
    const response = await axios.post(
      "http://localhost:5001/transcribe",
      body,
      {
        headers,
      }
    );

    const { question, answer } = await response.data;
    console.log("q a ", question, answer.content);

    setDialog((prev) => [
      ...prev,
      {
        question: question,
        answer: answer.content,
      },
    ]);

    console.log("dialog ", dialog);
    setResponseReceived(true);
    // you must return result from your server in Transcript format
    return {
      blob,
      text: question,
    };
  };

  const { transcript, startRecording, stopRecording } = useWhisper({
    // callback to handle transcription with custom server
    onTranscribe,
    nonStop: true, // keep recording as long as the user is speaking
    stopTimeout: 2000, // auto stop after 2 seconds
  });

  return (
    <div>
      <button
        onClick={() => {
          startRecording();
          setStopped(false);
        }}
      >
        Start
      </button>
      <button
        onClick={() => {
          stopRecording();
          setStopped(true);
        }}
      >
        Stop
      </button>
      <div>
        `` Your dialog:
        {dialog.map((x, index) => {
          return (
            <div key={index}>
              <p>You: {x.question}</p>
              <p>AI: {x.answer} </p>
            </div>
          );
        })}
      </div>
      {/* {transcript.text && <p>Transcribed Text: {transcript.text}</p>} */}
    </div>
  );
};

export default ServerListener;

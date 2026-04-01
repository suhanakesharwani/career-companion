// import { useState, useRef } from "react";

// export default function AiInterview() {
//   const [recording, setRecording] = useState(false);
//   const mediaRecorderRef = useRef(null);
//   const chunksRef = useRef([]);

//   const startRecording = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     const mediaRecorder = new MediaRecorder(stream);

//     mediaRecorderRef.current = mediaRecorder;
//     chunksRef.current = [];

//     mediaRecorder.ondataavailable = (e) => {
//       chunksRef.current.push(e.data);
//     };

//     mediaRecorder.onstop = () => {
//       const blob = new Blob(chunksRef.current, { type: "audio/wav" });
//       sendAudio(blob);
//     };

//     mediaRecorder.start();
//     setRecording(true);
//   };

//   const stopRecording = () => {
//     mediaRecorderRef.current.stop();
//     setRecording(false);
//   };

//   const sendAudio = async (audioBlob) => {
//     const formData = new FormData();
//     formData.append("audio", audioBlob);

//     const res = await fetch("http://127.0.0.1:8000/ai-interview/", {
//       method: "POST",
//       body: formData,
//     });

//     const data = await res.json();
//     console.log(data);
//   };

//   return (
//     <div>
//       <button onClick={startRecording} disabled={recording}>
//         🎤 Start
//       </button>
//       <button onClick={stopRecording} disabled={!recording}>
//         ⏹ Stop
//       </button>
//     </div>
//   );
// }
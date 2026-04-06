let socket = null;

export const connectSocket = (onOpen, onMessage, onClose, onError) => {
  socket = new WebSocket("ws://127.0.0.1:8000/ws/interview/");

  socket.onopen = () => { if (onOpen) onOpen(); };
  socket.onmessage = (event) => { if (onMessage) onMessage(event); };
  socket.onclose = () => { if (onClose) onClose(); };
  socket.onerror = (err) => { if (onError) onError(err); };
};

export const getSocket = () => socket;
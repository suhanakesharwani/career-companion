let socket = null;

export const connectSocket = (onOpen, onMessage, onClose, onError) => {
  socket = new WebSocket("wss://career-companion-backend-uhlf.onrender.com/ws/interview/");

  socket.onopen = () => { if (onOpen) onOpen(); };
  socket.onmessage = (event) => { if (onMessage) onMessage(event); };
  socket.onclose = () => { if (onClose) onClose(); };
  socket.onerror = (err) => { if (onError) onError(err); };
};

export const getSocket = () => socket;
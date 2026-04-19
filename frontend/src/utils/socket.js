let socket = null;

export const connectSocket = (onOpen, onMessage, onClose, onError) => {
  // Use wss:// if the site is https, otherwise use ws://
  const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
  const host = "career-companion-backend-uhlf.onrender.com";
  
  socket = new WebSocket(`${protocol}${host}/ws/interview/`);

  socket.onopen = () => { if (onOpen) onOpen(); };
  socket.onmessage = (event) => { if (onMessage) onMessage(event); };
  socket.onclose = () => { if (onClose) onClose(); };
  socket.onerror = (err) => { if (onError) onError(err); };
};

export const getSocket = () => socket;
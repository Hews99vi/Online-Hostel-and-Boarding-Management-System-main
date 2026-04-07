import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) {
    return socket;
  }

  socket = io("http://localhost:5000", {
    auth: {
      token,
    },
    autoConnect: false,
  });

  socket.connect();

  socket.on("connect", () => {
    console.log("Socket connected");
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  return socket;
};

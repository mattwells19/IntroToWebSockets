import { serveFile } from "std/http/file_server.ts";
import type { Handler } from "std/http/server.ts";

const socketConns = new Set<WebSocket>();
const messages: Array<string> = [];

export const wsHandler: Handler = (req) => {
  if (req.method === "GET" && req.url.endsWith("/ws/api/message")) {
    return new Response(JSON.stringify(messages));
  }

  // New WebSocket connection request thanks to the special header
  if (req.url.endsWith("/ws") && req.headers.get("upgrade") === "websocket") {
    // Upgrade connection from HTTP -> WS
    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.addEventListener("open", () => {
      socketConns.add(socket);
    });

    socket.addEventListener("message", (e) => {
      messages.push(e.data);
      socketConns.forEach((socketConn) => {
        if (socketConn.readyState === WebSocket.OPEN) {
          socketConn.send(e.data);
        } else {
          socketConns.delete(socketConn);
        }
      });
    });

    socket.addEventListener("close", () => {
      socketConns.delete(socket);
    });

    return response;
  }

  return serveFile(req, "./ws/ws.html");
};

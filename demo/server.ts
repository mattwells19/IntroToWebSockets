import { Handler, serve } from "std/http/server.ts";
import { serveDir } from "std/http/file_server.ts";

const socketConns = new Set<WebSocket>();

const handler: Handler = (req) => {
  const url = new URL(req.url);

  // New WebSocket connection request thanks to the special header
  if (
    url.pathname.endsWith("/ws") &&
    req.headers.get("upgrade") === "websocket"
  ) {
    // Upgrade connection from HTTP -> WS
    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.addEventListener("open", () => {
      socketConns.add(socket);
    });

    socket.addEventListener("message", (e) => {
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
  } else {
    // Regular HTTP requests get served static web files
    return serveDir(req, { fsRoot: "www" });
  }
};

await serve(handler, { port: 4000 }).then(() =>
  console.log(`HTTP webserver running. Access it at: http://localhost:4000/`)
);

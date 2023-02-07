import { serve } from "std/http/server.ts";
import { serveDir } from "std/http/file_server.ts";

const socketConns = new Set<WebSocket>();

const handler = (req: Request): Response | Promise<Response> => {
  const url = new URL(req.url);

  if (
    url.pathname.endsWith("/ws") &&
    req.headers.get("upgrade") === "websocket"
  ) {
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
    return serveDir(req, { fsRoot: "www" });
  }
};

await serve(handler, { port: 4000 }).then(() =>
  console.log(`HTTP webserver running. Access it at: http://localhost:4000/`)
);

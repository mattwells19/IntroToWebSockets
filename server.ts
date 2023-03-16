import { serveFile } from "std/http/file_server.ts";
import { Handler, serve } from "std/http/server.ts";
import { wsHandler } from "./ws/ws.ts";
import { httpHandler } from "./polling/polling.ts";

const handler: Handler = (req, conn) => {
  if (req.url.includes("ws")) {
    return wsHandler(req, conn);
  } else if (req.url.includes("polling")) {
    return httpHandler(req, conn);
  } else {
    return serveFile(req, "./index.html");
  }
};

await serve(handler, { port: 4000 }).then(() =>
  console.log(`HTTP webserver running. Access it at: http://localhost:4000/`)
);

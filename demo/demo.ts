import { serveFile } from "std/http/file_server.ts";
import { Handler, serve } from "std/http/server.ts";

const messages: Array<string> = [];

const handler: Handler = async (req) => {
  if (req.method === "POST" && req.url.endsWith("/api/message")) {
    const msg = await req.text();
    messages.push(msg);
    return new Response(JSON.stringify(messages));
  } else if (req.method === "GET" && req.url.endsWith("/api/message")) {
    return new Response(JSON.stringify(messages));
  }

  return serveFile(req, "./demo/demo.html");
};

await serve(handler, { port: 4000 }).then(() =>
  console.log(`HTTP webserver running. Access it at: http://localhost:4000/`)
);

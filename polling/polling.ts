import { serveFile } from "std/http/file_server.ts";
import type { Handler } from "std/http/server.ts";

const messages: Array<string> = [];

export const httpHandler: Handler = async (req) => {
  if (req.method === "POST" && req.url.endsWith("/api/message")) {
    const msg = await req.text();
    messages.push(msg);
    return new Response(JSON.stringify(messages));
  } else if (req.method === "GET" && req.url.endsWith("/api/message")) {
    return new Response(JSON.stringify(messages));
  }

  return serveFile(req, "./polling/polling.html");
};

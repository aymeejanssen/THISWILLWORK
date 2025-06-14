
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) {
    return new Response("Missing OpenAI API Key", { status: 500 });
  }

  // Upgrade to WebSocket connection
  const { socket, response } = Deno.upgradeWebSocket(req);

  let openaiSocket: WebSocket | null = null;

  socket.onopen = async () => {
    // Open connection to OpenAI Realtime API
    openaiSocket = new WebSocket(
      "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
      []
    );

    openaiSocket.onopen = () => {
      // Relay: ready for messages
      socket.send(JSON.stringify({ type: "proxy.connected" }));
    };

    openaiSocket.onmessage = (e) => {
      try {
        // Forward any backend messages to user
        if (typeof e.data === "string") {
          socket.send(e.data);
        } else if (e.data instanceof ArrayBuffer) {
          // OpenAI protocol is all JSON, so unlikely, but relay if occurs
          socket.send(e.data);
        }
      } catch (err) {
        socket.send(JSON.stringify({ type: "error", message: "Relay error: " + String(err) }));
      }
    };

    openaiSocket.onerror = (e) => {
      socket.send(JSON.stringify({ type: "error", message: "Error from OpenAI WebSocket" }));
      socket.close(1011, "OpenAI WebSocket error");
    };

    openaiSocket.onclose = (e) => {
      socket.send(JSON.stringify({ type: "info", message: "OpenAI WebSocket closed" }));
      socket.close(1000, "Session ended");
    };
  };

  socket.onmessage = (e) => {
    if (!openaiSocket || openaiSocket.readyState !== WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "error", message: "Backend socket not ready" }));
      return;
    }
    // Forward all frontend messages (audio, text, control) to OpenAI.
    if (typeof e.data === "string") {
      openaiSocket.send(e.data);
    } else if (e.data instanceof ArrayBuffer) {
      openaiSocket.send(e.data);
    }
  };

  socket.onerror = (_e) => {
    try {
      openaiSocket?.close(1011, "Client socket error");
    } catch {}
  };

  socket.onclose = (_e) => {
    try {
      openaiSocket?.close(1000, "Closed by client");
    } catch {}
  };

  return response;
});

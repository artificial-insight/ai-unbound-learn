import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const connectedClients = new Map<string, WebSocket>();

serve((req) => {
  const upgrade = req.headers.get("upgrade") || "";
  
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket", { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const clientId = crypto.randomUUID();

  socket.onopen = () => {
    console.log(`Client ${clientId} connected`);
    connectedClients.set(clientId, socket);
    
    // Send welcome message
    socket.send(JSON.stringify({
      type: "system",
      message: "Connected to live session"
    }));
  };

  socket.onmessage = (event) => {
    console.log(`Message from ${clientId}:`, event.data);
    
    try {
      const data = JSON.parse(event.data);
      
      // Broadcast to all other clients
      connectedClients.forEach((client, id) => {
        if (id !== clientId && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  socket.onclose = () => {
    console.log(`Client ${clientId} disconnected`);
    connectedClients.delete(clientId);
  };

  socket.onerror = (error) => {
    console.error(`WebSocket error for ${clientId}:`, error);
    connectedClients.delete(clientId);
  };

  return response;
});

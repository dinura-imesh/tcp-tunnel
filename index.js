const net = require("net");

// Configuration
const TUNNEL_PORT1 = 4545; // Port for the attacker to connect to
const TUNNEL_PORT2 = 5555; // Port for the target to connect to

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

// Create a server for TUNNEL_PORT1
const server1 = net.createServer((socket) => {
  console.log("Attacker connected");
  attackerClient = socket;

  if (targetClient) {
    forwardData(attackerClient, targetClient);
    forwardData(targetClient, attackerClient);
  }
});

// Create a server for TUNNEL_PORT2
const server2 = net.createServer((socket) => {
  console.log("Target connected");
  targetClient = socket;

  if (attackerClient) {
    forwardData(attackerClient, targetClient);
    forwardData(targetClient, attackerClient);
  }
});

// Start listening on TUNNEL_PORT1
server1.listen(TUNNEL_PORT1, () => {
  console.log(`Listening on port ${TUNNEL_PORT1} for attacker`);
});

// Start listening on TUNNEL_PORT2
server2.listen(TUNNEL_PORT2, () => {
  console.log(`Listening on port ${TUNNEL_PORT2} for target`);
});

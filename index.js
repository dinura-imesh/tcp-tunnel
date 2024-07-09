const net = require("net");

// Configuration
const LOCAL_PORT = 3000; // The port on which the forwarder will listen
const REMOTE_PORT = 8080; // The port to which the traffic will be forwarded
const REMOTE_HOST = "example.com"; // The host to which the traffic will be forwarded

// Create a server that listens for incoming connections
const server = net.createServer((localSocket) => {
  console.log(
    "New connection from",
    localSocket.remoteAddress,
    localSocket.remotePort
  );

  // Connect to the remote server
  const remoteSocket = net.createConnection(
    { host: REMOTE_HOST, port: REMOTE_PORT },
    () => {
      console.log("Connected to remote server");
    }
  );

  // Forward data from local to remote
  localSocket.on("data", (data) => {
    remoteSocket.write(data);
  });

  // Forward data from remote to local
  remoteSocket.on("data", (data) => {
    localSocket.write(data);
  });

  // Handle local socket close
  localSocket.on("close", () => {
    console.log("Local connection closed");
    remoteSocket.end();
  });

  // Handle remote socket close
  remoteSocket.on("close", () => {
    console.log("Remote connection closed");
    localSocket.end();
  });

  // Handle errors
  localSocket.on("error", (err) => {
    console.error("Local socket error", err);
    remoteSocket.end();
  });

  remoteSocket.on("error", (err) => {
    console.error("Remote socket error", err);
    localSocket.end();
  });
});

// Start the server
server.listen(LOCAL_PORT, () => {
  console.log(`TCP forwarder listening on port ${LOCAL_PORT}`);
});

const { spawn } = require("child_process");
const path = require("path");

function startBackend() {
  const backendPath = path.join(__dirname, "../POS_Backend/sari-sari-pos");

  console.log("Starting Flask from:", backendPath);

  const python = spawn("py", ["app.py"], {
    cwd: backendPath,
    stdio: "inherit",
    shell: true,
  });

  python.on("close", (code) => {
    console.log("Flask exited with code", code);
  });

  return python;
}

module.exports = { startBackend };

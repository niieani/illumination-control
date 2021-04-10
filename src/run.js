const TuyAPI = require("tuyapi");
const devices = require("./devices");
const { getScene, schema } = require("./aukey-helpers");

const device = new TuyAPI(devices[0]);

// Find device on network
device.find().then(() => {
  // Connect to device
  device.connect();
});

let resolved;
let ready = new Promise((resolve) => {
  resolved = resolve;
});

// Add event listeners
device.on("connected", async () => {
  console.log("Connected to device!");
  resolved();

  // turn on with inital settings:
  device.set({
    multiple: true,
    data: {
      [schema.mode]: "scene",
      [schema.power]: true,
      [schema.sceneDefinition]: getScene({
        targetSlotNth: 4,
        stages: [
          {
            crossfade: false,
            holdMs: 1000,
            hue: 10,
            saturation: 1000,
            lightness: 1000,
          },
        ],
      }),
    },
  });
});

device.on("disconnected", () => {
  console.log("Disconnected from device.");
  process.exit();
});

device.on("error", (error) => {
  console.log("Error!", error);
});

device.on("data", (data) => {
  console.log("Data from device:", data);
});

// disconnect on CTRL+C
process.on("SIGINT", () => {
  device.disconnect();
});

module.exports.device = device;
module.exports.ready = ready;

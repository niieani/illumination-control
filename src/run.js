const TuyAPI = require("./tuyapi");
const devices = require('./devices')
const {getColor, getScene, schema} = require('./aukey-helpers')

const device = new TuyAPI(devices[0]);

let stateHasChanged = false;

// https://github.com/TheAgentK/tuya-mqtt/blob/master/docs/DEVICES.md

// Find device on network
device.find().then(() => {
  // Connect to device
  device.connect();
});

/** @type {NodeJS.Timeout} */
let interval

let hue = 0
let saturation = 1000

let resolved
let ready = new Promise((resolve) => {resolved = resolve})

// Add event listeners
device.on("connected", async () => {
  console.log("Connected to device!");
  resolved();

  // turn on:
  // device.set({ multiple: true, data: {
  //   [schema.mode]: 'colour',
  //   [schema.power]: true,
  //   [schema.strength]: 1000,
  //   [schema.whiteTemperature]: 1000,
  // } });

  device.set({ multiple: true, data: {
    [schema.mode]: 'scene',
    [schema.power]: true,
    [schema.sceneDefinition]: getScene({
      targetSlotNth: 4,
      stages: [
        {crossfade: false, holdMs: 1000, hue: 10, saturation: 1000, lightness: 1000},
      ]
    }),
  } });
  // interval = setInterval(() => {
  //   console.log('changing color NOW', {hue, saturation})
  //   // device.set({ dps: schema.color, set: getColor(hue, 1000, 1000) });
  //   device.set({ dps: schema.sceneDefinition, set: getScene({
  //     targetSlotNth: 4,
  //     stages: [
  //       {crossfade: false, holdMs: 1000, hue, saturation: 1000, lightness: 1000},
  //     ]
  //   }) });
  //   hue += 20
  //   saturation -= 50
  //   if (hue > 360) hue = 0;
  //   if (saturation < 500) saturation = 1000
  // }, 2000);

  // if (interval.unref) interval.unref();
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
process.on('SIGINT', () => {
  device.disconnect();
});

module.exports.device = device
module.exports.ready = ready

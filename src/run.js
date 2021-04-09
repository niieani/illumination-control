const TuyAPI = require("tuyapi");
const devices = require('./devices')

const device = new TuyAPI(devices[0]);

let stateHasChanged = false;

// https://github.com/TheAgentK/tuya-mqtt/blob/master/docs/DEVICES.md

const schema = {
  power: '20',
  mode: '21',
  color: '24',
  // 0 - 1000
  strength: '22',
  // 0 - 1000
  whiteTemperature: '23',
  // header: '06' or '05' ? unknown -- maybe scene number?
  //                   '4646010000 03e803e8 00000000'
  /// saturation         '2828010022 020801f4 00000000'
  //  brightness       '2828010022 03e801f4 00000000'
  // light definition: 'SSSSMMHHHH CCCCBBBB PPPPTTTT'
  // (night) white  00 '0e0d000000 00000000 00c80000' -- minimum temp, 15% bright, min time?
  // (read)  white  01 '0e0d000000 00000000 03e801f4' -- medium temp (500), max bright (3e8 = 1000)
  // (soft)  green  04 '4646020078 03e803e8 00000000'
  //     dim green     '4646020078 03e8000a 00000000' -- breath mode, medium speed (17990)
  // same but flash 04 '4646010078 03e803e8 00000000
  // S - slide change speed
  // M - mode, 00 is static (one color), 01 is flash, 02 is crossfade
  // H - color hue (0 when in white)
  // C - color saturation (0 when in white)
  // B - color brightness (0 when in white)
  // P - white power 0-1000 (0 when in color)
  // T - white temperature 0-1000 (0 when in color)
  // one more missing is colour flash mode-- maybe that's the first 2
  //
  // there's 8 scenes to upload to device (or maybe that's just stored in the app?)
  // looks like whole light is 26 chars, e.g. white: '28280100000000000003e803e8'
  // every color in a scene finishes with '03e803e800000000'
  // of this, first 2 is saturation
  // next 2 is unknown
  // next 3 e.g. '1f4' is brightness
  // 2 chars before, unknown
  // 8 chars before, e.g. '46460100', prefixes every one
  // out of these, first six tell us about speed, e.g. '4646' or '6282' max speed?
  // next one is '0'
  // next two are either '00' or '10'
  // last 2 (or three?) are hue
  // and at the very beginning of scenes, 2 digits, e.g. '06', '05' -- hmm?
  //
  // e.g. '06464601000003e803e800000000464601007803e803e80000000046460100f003e803e800000000'
  //      '06282801000003e803e800000000282801007803e803e80000000028280100f003e803e800000000'
  // same but with max speed ^^
  //      '06282801002203e803e800000000282801007803e803e80000000028280100f003e803e800000000'
  // same but first color is different hue

  //      '06282801002203e801f400000000282801007803e803e80000000028280100f003e803e800000000'
  // same but first color 50% brightness

  //      '062828010022020801f400000000282801007803e803e80000000028280100f003e803e800000000'
  // same but first color 50% saturation

  //      '0628280100000000000003e803e8282801007803e803e80000000028280100f003e803e800000000'
  // same but first is 'white' LED
  // or with maximum scene colors (8):
  //      '05464601000003e803e800000000464601007803e803e80000000046460100f003e803e800000000464601003d03e803e80000000046460100ae03e803e800000000464601011303e803e800000000464601009d03e803e80000000046460100f103e803e800000000'
  // 05
  // 464601000003e803e800000000
  // 464601007803e803e800000000
  // 46460100f003e803e800000000
  // 464601003d03e803e800000000
  // 46460100ae03e803e800000000
  // 464601011303e803e800000000
  // 464601009d03e803e800000000
  // 46460100f103e803e800000000
  //

  // speed change:
  // 464601000003e803e800000000
  // 282801000003e803e800000000
  sceneDefinition: '25',
  turnOffAfterSeconds: '26',
}

// large changes can cause a timeout,
// because they wait until the light changes (and it's fluid) to respond

const getColor = (/** @type number */ hue, /** @type number */ saturation, /** @type number */ brightneses) => `${hue.toString(16).padStart(4, '0')}${saturation.toString(16).padStart(4, '0')}${brightneses.toString(16).padStart(4, '0')}`

// Find device on network
device.find().then(() => {
  // Connect to device
  device.connect();
});

/** @type {NodeJS.Timeout} */
let interval

let hue = 0

// Add event listeners
device.on("connected", async () => {
  console.log("Connected to device!");

  // turn on:
  // device.set({ multiple: true, data: {
  //   [schema.mode]: 'colour',
  //   [schema.power]: true,
  //   [schema.strength]: 1000,
  //   [schema.whiteTemperature]: 1000,
  // } });

  // interval = setInterval(() => {
  //   console.log('changing color NOW', hue)
  //   device.set({ dps: schema.color, set: getColor(hue, 1000, 1000) });
  //   hue += 20
  //   if (hue > 360) hue = 0;
  // }, 2000);

  // interval.unref();
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

  // console.log(`Boolean status of default property: ${data.dps["20"]}.`);

  // // Set default property to opposite
  // if (!stateHasChanged) {
  //   device.set({ dps: schema.power, set: true }); // !data.dps[schema.power]

  //   // Otherwise we'll be stuck in an endless
  //   // loop of toggling the state.
  //   stateHasChanged = true;
  // }
});

// disconnect on CTRL+C
process.on('SIGINT', () => {
  device.disconnect();
});

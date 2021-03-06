# Aukey Illumination Control

Use JavaScript to control your [Aukey Smart RGB Lamp](https://www.amazon.com/gp/product/B08TM4DBRB/ref=ppx_yo_dt_b_asin_title_o00_s00?ie=UTF8&psc=1) running on Tuya IoT firmware.

The protocol for setting color and scenes was reverse engineered and you can use simple helper functions from this repo to set them. You can even make combinations that aren't possible with the UI (e.g. scenes that mix fades with non-fades).

The light is very responsive on a good WiFi network, so I'm trying to do some audio visualization with the lamp, but you can use it for your own needs. :)

## Setup

You'll need to create a Tuya IoT account: https://iot.tuya.com/index/

It's a long an annoying process that takes upto 24 hours (due to the wait for their apis to propagate). Instructions for that are [here](https://github.com/codetheweb/tuyapi/blob/master/docs/SETUP.md).

Then clone this repo and create a file `src/devices.js`:

```js
module.exports = [
  // copy the output of the 'tuya-cli wizard' command, or if you have an id/key for your device:
  {
    name: 'AUKEY Living Room',
    id: 'my_api_id_here',
    key: 'my_api_secret_here'
  },
]
```

## Running

```
yarn
yarn start
```

This will open Electron and your light will start reacting to whather is coming from the default record device (by default likely your computer's microphone).

Do customize this behavior in `preload.js` to your liking.

## Usage

```js
const { device, ready } = require("./run");
const { getScene, schema } = require("./aukey-helpers");

await ready;

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
```

Check `aukey-helpers.js` for all supported options.

## Caveats

When using 'colour' mode, large changes (distant value from the previous one) can cause a timeout,
because the light fades to the other color and only then responds.
Workaround is to use the 'scene' mode with a single color and cross-fade disabled.

// @ts-check

const { device, ready } = require("./run");
const { getScene, schema } = require("./aukey-helpers");
const throttle = require("lodash/throttle");
const mean = require("lodash/mean");

let disposed = false;
let lastSceneDefinition;
let lastLightness = 0;

const updateLight = (data) => {
  if (disposed) return;
  const interestingData = data.slice(4);
  // const bass = ((data[0] + data[1] + data[2] + data[4]) - 400) * 2
  const bass = interestingData[0] / 255;
  const high = interestingData[interestingData.length - 1] / 255;
  const intensity = mean(interestingData) / 255;
  // const lightness = Math.round(Math.max(Math.min(bass, 1000), 0))
  const lightnessSrc = intensity ** 2;
  // not too bad:
  const lightness = Math.round(
    Math.max(Math.min(lightnessSrc * 1000, 1000), 0)
  );
  // const lightness = Math.round(Math.max(Math.min(data[4] * 3, 1000), 0))
  const hue = Math.round(Math.min(lightnessSrc * 360, 360));

  // TODO: calculate average/median frequency (which band has the strongest signal)

  const bar = [...interestingData]
    .map(
      (value, i) =>
        `${String(i).padStart(2, " ")}: ` +
        "█".repeat(value / 20) +
        ` (${value})`
    )
    .join("\n");
  console.log(bar, "\n", { hue, lightness });

  if (Math.abs(lastLightness - lightness) < 150) return;
  lastLightness = lightness;
  const sceneDefinition = getScene({
    targetSlotNth: 4,
    stages: [
      {
        crossfade: false,
        holdMs: 50,
        hue: 0,
        saturation: 1000,
        lightness, // : 1000,
        // lightness: Math.min(intensity * 10, 1000),
      },
    ],
  });
  if (lastSceneDefinition === sceneDefinition) return;
  // console.log('setting', {hue, lightness})

  device.set({
    multiple: true,
    data: {
      [schema.mode]: "scene",
      [schema.power]: true,
      [schema.sceneDefinition]: sceneDefinition,
    },
  });
  lastSceneDefinition = sceneDefinition;
};

const onReady = async () => {
  const disconnectEl = document.getElementById("disconnect");
  disconnectEl.addEventListener("click", () => {
    console.log("disconnecting");
    disposed = true;
    device.disconnect();
  });

  const audioContext = new AudioContext();
  await ready;

  // console.log(await navigator.mediaDevices.enumerateDevices())
  navigator.getUserMedia({ audio: true }, start_microphone, function (e) {
    console.error("Error capturing audio.");
  });

  function start_microphone(stream) {
    let microphone_stream = audioContext.createMediaStreamSource(stream);
    let analyserNode = audioContext.createAnalyser();
    analyserNode.smoothingTimeConstant = 0;
    analyserNode.fftSize = 32; // 2048

    microphone_stream.connect(analyserNode);
    let data = new Uint8Array(analyserNode.frequencyBinCount);

    const loopingFunction = throttle(() => {
      analyserNode.getByteFrequencyData(data);
      if (data.length) {
        // console.log(average * 10)
        updateLight([...data]);
      }
      loopingFunction();
      // TODO: update throttle to always react fast
    }, 100);

    loopingFunction();
  }
};

document.addEventListener("DOMContentLoaded", onReady, false);

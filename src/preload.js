// @ts-check

const { device, ready } = require("./run");
const { getScene, schema } = require("./aukey-helpers");
const throttle = require("lodash/throttle");
const mean = require("lodash/mean");

let disposed = false
let lastSceneDefinition
let lastLightness = 0

const updateLight = (data) => {
  if (disposed) return;
  const interestingData = data.slice(4)
  // const bass = ((data[0] + data[1] + data[2] + data[4]) - 400) * 2
  const bass = interestingData[0] / 255;
  const high = interestingData[interestingData.length - 1] / 255;
  const intensity = mean(interestingData) / 255;
  // const lightness = Math.round(Math.max(Math.min(bass, 1000), 0))
  const lightnessSrc = (intensity ** (2))
  // not too bad:
  const lightness = Math.round(Math.max(Math.min(lightnessSrc * 1000, 1000), 0))
  // const lightness = Math.round(Math.max(Math.min(data[4] * 3, 1000), 0))
  const hue = Math.round(Math.min(lightnessSrc * 360, 360))

  // TODO: calculate average/median frequency (which band has the strongest signal)

  const bar = [...interestingData]
  .map(
    (value, i) =>
      `${String(i).padStart(2, " ")}: ` +
      "█".repeat(value / 20) +
      ` (${value})`
  )
  .join("\n");
  console.log(bar, '\n', {hue, lightness});

  if (Math.abs(lastLightness - lightness) < 150) return
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
  })
  if (lastSceneDefinition === sceneDefinition) return
  // console.log('setting', {hue, lightness})

  device.set({
    multiple: true,
    data: {
      [schema.mode]: "scene",
      [schema.power]: true,
      [schema.sceneDefinition]: sceneDefinition,
    },
  });
  lastSceneDefinition = sceneDefinition
};

const onReady = async () => {
  const disconnectEl = document.getElementById("disconnect");
  disconnectEl.addEventListener("click", () => {
    console.log("disconnecting");
    disposed = true
    // device.disconnect();
  });

  const audioContext = new AudioContext();


  await ready;

  // console.log(await navigator.mediaDevices.enumerateDevices())
  navigator.getUserMedia({ audio: true }, start_microphone, function (e) {
    console.error("Error capturing audio.");
  });

  // function show_some_data(given_typed_array, num_row_to_display, label) {
  //   let size_buffer = given_typed_array.length;
  //   let index = 0;
  //   let max_index = num_row_to_display;

  //   console.log("__________ " + label);

  //   for (; index < max_index && index < size_buffer; index += 1) {
  //     console.log(given_typed_array[index]);
  //   }
  // }

  // function process_microphone_buffer(event) {
  //   // invoked by event loop

  //   let i, N, inp, microphone_output_buffer;

  //   microphone_output_buffer = event.inputBuffer.getChannelData(0); // just mono - 1 channel for now

  //   // microphone_output_buffer  <-- this buffer contains current gulp of data size BUFF_SIZE

  //   show_some_data(microphone_output_buffer, 5, "from getChannelData");
  // }

  function start_microphone(stream) {
    // let gain_node = audioContext.createGain();
    // gain_node.connect(audioContext.destination);

    let microphone_stream = audioContext.createMediaStreamSource(stream);
    // microphone_stream.connect(gain_node);
    // let BUFF_SIZE = 16384;

    // let script_processor_node = audioContext.createScriptProcessor(
    //   BUFF_SIZE,
    //   1,
    //   1
    // );
    // script_processor_node.addEventListener(
    //   "audioprocess",
    //   process_microphone_buffer
    // );

    // microphone_stream.connect(script_processor_node);

    // --- enable volume control for output speakers

    // document.getElementById("volume").addEventListener("change", function () {
    //   let curr_volume = this.value;
    //   gain_node.gain.value = curr_volume;

    //   console.log("curr_volume ", curr_volume);
    // });

    // --- setup FFT

    // let script_processor_fft_node = audioContext.createScriptProcessor(
    //   2048,
    //   1,
    //   1
    // );
    // script_processor_fft_node.connect(gain_node);

    let analyserNode = audioContext.createAnalyser();
    analyserNode.smoothingTimeConstant = 0;
    analyserNode.fftSize = 32; // 2048

    microphone_stream.connect(analyserNode);

    // analyserNode.connect(script_processor_fft_node);

    // script_processor_fft_node.addEventListener("audioprocess", function () {
    // get the average for the first channel
    let data = new Uint8Array(analyserNode.frequencyBinCount);

    const loopingFunction = throttle(() => {
      // @ts-expect-error
      let cancelId = requestAnimationFrame(loopingFunction);
      analyserNode.getByteFrequencyData(data);
      if (data.length) {
        // console.log(average * 10)
        updateLight([...data]);

        // show_some_data(data, 5, "from fft");
      }
    }, 100);

    loopingFunction();

    // draw the spectrogram
    // if (microphone_stream.playbackState == microphone_stream.PLAYING_STATE) {
    // });
  }
};

document.addEventListener("DOMContentLoaded", onReady, false);

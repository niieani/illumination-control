// @ts-check

const { device } = require("./run");
const throttle = require('lodash/throttle')
const mean = require('lodash/mean')

const ready = async () => {
  const disconnectEl = document.getElementById("disconnect");
  disconnectEl.addEventListener("click", () => {
    console.log("disconnecting");
    // device.disconnect();
  });

  const audioContext = new AudioContext();

  let BUFF_SIZE = 16384;

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
          const interestingData = [...data].slice(3)
          const average = mean(interestingData)
          const bar = [...interestingData, average].map((value, i) => `${String(i).padStart(2, ' ')}: ` + '█'.repeat(value / 20) + ` (${value})`).join('\n')
          console.log(bar)
          // show_some_data(data, 5, "from fft");
        }
      }, 250)

      loopingFunction();

      // draw the spectrogram
      // if (microphone_stream.playbackState == microphone_stream.PLAYING_STATE) {
    // });
  }
};

document.addEventListener("DOMContentLoaded", ready, false);

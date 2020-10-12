const initialText = document.getElementById("text");
initialText.innerText = "Click anywhere to start";
document.addEventListener("click", init);

const canvasWaveform = document.getElementById("canvas-waveform");
const waveCtx = canvasWaveform.getContext("2d");
waveCtx.fillStyle = "#000";
waveCtx.fillRect(0, 0, 150, 75);

const canvasFrequency = document.getElementById("canvas-frequency");
const freqCtx = canvasFrequency.getContext("2d");
freqCtx.fillStyle = "#000";
freqCtx.fillRect(0, 0, 150, 75);

const waveWidth = canvasWaveform.width;
const waveHeight = canvasWaveform.height;
const freqWidth = canvasFrequency.width;
const freqHeight = canvasFrequency.height;

let isSpacePressed = false;

let canvasBackgroundColor = "#000";
let canvasLineColor = "#eeff05";

const selectedWaveform = document.getElementById("option-waveform");

function init() {
    document.removeEventListener("click", init);
    initialText.innerText = "";

    const keyboard = document.getElementById("keyboard");

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const keysArray = [
        { key: 65, note: "c", freq: 261.63 },
        { key: 87, note: "c#", freq: 277.18 },
        { key: 83, note: "d", freq: 293.66 },
        { key: 69, note: "d#", freq: 311.13 },
        { key: 68, note: "e", freq: 329.63 },
        { key: 70, note: "f", freq: 349.23 },
        { key: 84, note: "f#", freq: 369.99 },
        { key: 71, note: "g", freq: 392 },
        { key: 89, note: "g#", freq: 415.3 },
        { key: 72, note: "a", freq: 440 },
        { key: 85, note: "a#", freq: 466.16 },
        { key: 74, note: "b", freq: 493.88 },
        // { key: 75, note: "c", freq: 523.25 },
    ];
    const oscArray = [];
    for (let n = 0; n < 13; n++) {
        oscArray.push(null);
    }
    const gainNode = audioCtx.createGain();
    const analyser = audioCtx.createAnalyser();
    gainNode.connect(analyser);
    analyser.connect(audioCtx.destination);

    document.addEventListener("keydown", (e) => {
        // console.log(e.keyCode);
        for (let [index, item] of keysArray.entries()) {
            if (item.key === e.keyCode) {
                keyboard.children[index].classList.add("pressed");
                if (oscArray[index] === null) {
                    let currentWaveForm = selectedWaveform.options[selectedWaveform.selectedIndex].value;
                    oscArray[index] = playTone(index, item.freq, currentWaveForm);
                    modifyGain(gainNode);
                    // console.log(oscArray);
                }
            }
        }

        if (e.keyCode === 32) {
            isSpacePressed = true;
        }
    });

    document.addEventListener("keyup", (e) => {
        for (let [index, item] of keysArray.entries()) {
            if (item.key === e.keyCode) {
                keyboard.children[index].classList.remove("pressed");
                if (oscArray[index] !== null) {
                    oscArray[index].stop();
                    oscArray[index] = null;
                    modifyGain(gainNode);
                }
            }
        }

        if (e.keyCode === 32) {
            isSpacePressed = false;
        }
    });

    function playTone(index, freq, wave) {
        let osc = audioCtx.createOscillator();
        osc.type = wave;
        osc.frequency.value = freq;
        osc.connect(gainNode);
        osc.start();
        return osc;
    }

    function modifyGain(gainNode) {
        //modify gain depending on how many notes are playing;
        let oscCount = 0;
        for (let osc of oscArray) {
            if (osc) {
                oscCount++;
            }
        }
        let val = Number((1 / oscCount).toFixed(2));
        if (val != Infinity) {
            gainNode.gain.value = val;
        }
    }

    //visualizing stuff
    analyser.fftSize = 2048;
    const waveBuffer = analyser.fftSize;
    const freqBuffer = analyser.frequencyBinCount;
    const waveData = new Uint8Array(waveBuffer);
    const freqData = new Uint8Array(freqBuffer);

    function draw() {
        requestAnimationFrame(draw);

        //draw a wave
        waveCtx.fillStyle = canvasBackgroundColor;
        waveCtx.fillRect(0, 0, freqWidth, freqHeight);

        analyser.getByteTimeDomainData(waveData);

        //debug
        if (isSpacePressed) {
            console.log(waveData);
        }

        waveCtx.lineWidth = 2;
        waveCtx.strokeStyle = canvasLineColor;

        const sliceWidth = (waveWidth * 1.0) / waveBuffer;
        let waveX = 0;

        waveCtx.beginPath();
        for (var i = 0; i < waveBuffer; i++) {
            const v = waveData[i] / 128.0;
            const y = (v * waveHeight) / 2;

            if (i === 0) waveCtx.moveTo(waveX, y);
            else waveCtx.lineTo(waveX, y);

            waveX += sliceWidth;
        }

        waveCtx.lineTo(waveWidth, waveHeight / 2);
        waveCtx.stroke();

        //draw frequency graph
        analyser.getByteFrequencyData(freqData);

        freqCtx.fillStyle = canvasBackgroundColor;
        freqCtx.fillRect(0, 0, freqWidth, freqHeight);

        const barWidth = (freqWidth / freqBuffer) * 2.5;
        let barHeight;
        let freqX = 0;

        for (let i = 0; i < freqBuffer; i++) {
            barHeight = freqData[i];

            freqCtx.fillStyle = canvasLineColor;
            freqCtx.fillRect(freqX, freqHeight - barHeight / 4, barWidth, barHeight / 2);

            freqX += barWidth + 1;
        }
    }

    draw();
}

const initialText = document.getElementById("text");

initialText.innerText = "Click anywhere to start";

document.addEventListener("click", init);

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
        { key: 75, note: "c", freq: 523.25 },
    ];
    const oscArray = [];
    for (let n = 0; n < 13; n++) {
        oscArray.push(null);
    }
    const gainNode = audioCtx.createGain();
    console.log(gainNode);
    gainNode.connect(audioCtx.destination);

    document.addEventListener("keydown", (e) => {
        console.log(e.keyCode);
        for (let [index, item] of keysArray.entries()) {
            if (item.key === e.keyCode) {
                keyboard.children[index].classList.add("pressed");
                if (oscArray[index] === null) {
                    oscArray[index] = playTone(index, item.freq);
                    // console.log(oscArray);
                }
            }
        }
    });

    document.addEventListener("keyup", (e) => {
        for (let [index, item] of keysArray.entries()) {
            if (item.key === e.keyCode) {
                keyboard.children[index].classList.remove("pressed");
                if (oscArray[index] !== null) {
                    oscArray[index].stop();
                    oscArray[index] = null;
                }
            }
        }
    });

    function playTone(index, freq) {
        let osc = audioCtx.createOscillator({
            type: "sine",
        });
        osc.frequency.value = freq;
        osc.connect(gainNode);
        modifyGain(gainNode);
        osc.start();
        return osc;
    }

    function modifyGain(gainNode) {
        //modify gain depending on how many notes are playing;
        let oscCount = 1;
        for (let osc of oscArray) {
            if (osc) {
                oscCount++;
                // console.log(osc);
            }
        }
        let val = Number((1 / oscCount).toFixed(2));
        gainNode.gain.value = val;
        // console.log(`oscillators playing: ${oscCount}, gain set to: ${val}`);
    }
}

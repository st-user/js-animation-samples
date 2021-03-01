/*global THREE */

const GRAPH_CANVAS_WIDTH = 480;
const GRAPH_CANVAS_WIDTH_LARGE = GRAPH_CANVAS_WIDTH * 2 + 12;
const GRAPH_CANVAS_HEIGHT = 160;

const $frequencyGraph = document.querySelector('#frequencyGraph');
$frequencyGraph.width = GRAPH_CANVAS_WIDTH;
$frequencyGraph.height = GRAPH_CANVAS_HEIGHT;

const $signalGraph = document.querySelector('#signalGraph');
$signalGraph.width = GRAPH_CANVAS_WIDTH;
$signalGraph.height = GRAPH_CANVAS_HEIGHT;

const $signalStrengthGraph = document.querySelector('#signalStrengthGraph');
$signalStrengthGraph.width = GRAPH_CANVAS_WIDTH_LARGE;
$signalStrengthGraph.height = GRAPH_CANVAS_HEIGHT;

const $playButton = document.querySelector('#play');
const $stopButton = document.querySelector('#stop');
const $audioSourceSeletion = document.querySelectorAll('input[name="audioSource"]');
const $volumeStrengthLowerLimit = document.querySelector('#volumeStrengthLowerLimit');
$stopButton.disabled = true;

let audioContext;
let source;
let mediaStream;
let isPlaying = false;
let volumeStrengthLowerLimit = 16;

const fillFrequencyGraph = () => {
    const ctx = $frequencyGraph.getContext('2d');
    ctx.fillStyle = 'gray';
    ctx.fillRect(0, 0, GRAPH_CANVAS_WIDTH, GRAPH_CANVAS_HEIGHT);
};

const analyseFrequency = analyser => {

    const ctx = $frequencyGraph.getContext('2d');
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    ctx.clearRect(0, 0, GRAPH_CANVAS_WIDTH, GRAPH_CANVAS_HEIGHT);

    const draw = () => {

        if (!isPlaying) {
            return;
        }

        analyser.getByteFrequencyData(dataArray);

        /* 背景 */
        fillFrequencyGraph();

        /* グラフ */
        const barWidth = (GRAPH_CANVAS_WIDTH / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {

            barHeight = dataArray[i] / 2;
            ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
            ctx.fillRect(x, GRAPH_CANVAS_HEIGHT - barHeight / 2, barWidth, barHeight);

            x += barWidth + 1;
        }

        requestAnimationFrame(draw);
    };
    draw();

};

const fillSignalGraph = () => {
    const ctx = $signalGraph.getContext('2d');
    ctx.fillStyle = '#1A4D64';
    ctx.fillRect(0, 0, GRAPH_CANVAS_WIDTH, GRAPH_CANVAS_HEIGHT);
};

const fillSignalStrengthGraph = () => {
    const strengthCtx = $signalStrengthGraph.getContext('2d');
    strengthCtx.fillStyle = '#54095E';
    strengthCtx.fillRect(0, 0, GRAPH_CANVAS_WIDTH_LARGE, GRAPH_CANVAS_HEIGHT);
};

const analyseSignal = analyser => {

    const ctx = $signalGraph.getContext('2d');
    const strengthCtx = $signalStrengthGraph.getContext('2d');

    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;

    const dataArray = new Uint8Array(bufferLength);

    ctx.clearRect(0, 0, GRAPH_CANVAS_WIDTH, GRAPH_CANVAS_HEIGHT);
    strengthCtx.clearRect(0, 0, GRAPH_CANVAS_WIDTH_LARGE, GRAPH_CANVAS_HEIGHT);

    let currentStrengthPlotCount = 0;
    const avg = arr => {
        const data = arr.map(d => Math.abs(d - 128)).filter(d => volumeStrengthLowerLimit <= d);
        return data.reduce((a, b) => a + b, 0) / arr.length;
    };

    const draw = () => {

        if (!isPlaying) {
            return;
        }

        analyser.getByteTimeDomainData(dataArray);

        fillSignalGraph();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#F5EB7F';
        ctx.beginPath();

        const sliceWidth = GRAPH_CANVAS_WIDTH * 1.0 / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {

            const value = dataArray[i] / 128.0;
            const y = value * GRAPH_CANVAS_HEIGHT / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.lineTo(GRAPH_CANVAS_WIDTH, GRAPH_CANVAS_HEIGHT / 2);
        ctx.stroke();

        /* strength */
        const plotCount = 600;
        const plotMergin = 5;
        const plotSlice = (GRAPH_CANVAS_WIDTH_LARGE - 2 * plotMergin) / plotCount;
        if (plotCount < currentStrengthPlotCount) {
            currentStrengthPlotCount = 0;
        }
        const plotValue = avg(dataArray) / 128.0;
        const plotX = plotMergin + plotSlice * currentStrengthPlotCount;
        const plotYSlice = GRAPH_CANVAS_HEIGHT;
        const plotY = GRAPH_CANVAS_HEIGHT - (plotValue * plotYSlice);

        if (currentStrengthPlotCount === 0) {
            fillSignalStrengthGraph();
            strengthCtx.lineWidth = 2;
            strengthCtx.strokeStyle = '#E1FADC';
            strengthCtx.beginPath();
            strengthCtx.moveTo(plotX, plotY);

        } else if (plotValue == 0) {
            strengthCtx.moveTo(plotX, plotY);
            document.dispatchEvent(new CustomEvent('mouthMove', {
                detail: {
                    isOpen: false
                }
            }));
        } else {
            strengthCtx.lineTo(plotX, plotY);
            strengthCtx.stroke();
            document.dispatchEvent(new CustomEvent('mouthMove', {
                detail: {
                    isOpen: true
                }
            }));
        }

        currentStrengthPlotCount++;

        requestAnimationFrame(draw);
    };

    draw();

};

const createSource = async () => {
    audioContext = new AudioContext();
    let checkedValue;
    $audioSourceSeletion.forEach($r => {
        if($r.checked) {
            checkedValue = $r.value;
        }
    });

    if (checkedValue === '0') {

        const decodeBuffer = arrayBuffer => {
            return new Promise(resolve => {
                return audioContext.decodeAudioData(arrayBuffer, buffer => {
                    resolve(buffer);
                });
            });
        };

        const audioUrl = 'assets/audio/sample_voice.mp3';
        const decodedBuffer = await fetch(audioUrl)
            .then(response => response.arrayBuffer())
            .then(decodeBuffer);
        source = audioContext.createBufferSource();
        source.buffer = decodedBuffer;
        source.loop = true;
        source.start(0);

    } else if (checkedValue === '1') {

        if (!navigator.mediaDevices) {
            alert('マイクが使用できない状態です');
            return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true, video: false
        });

        mediaStream = stream;
        source = audioContext.createMediaStreamSource(stream);
    }

};


$playButton.addEventListener('click', async () => {
    $playButton.disabled = true;
    $stopButton.disabled = false;
    isPlaying = true;

    await createSource();

    /* analyser */
    const frequencyAnalyser = audioContext.createAnalyser();
    analyseFrequency(frequencyAnalyser);
    source.connect(frequencyAnalyser);
    const signalAnalyser = audioContext.createAnalyser();
    analyseSignal(signalAnalyser);
    source.connect(signalAnalyser);

    source.connect(audioContext.destination);


});

$stopButton.addEventListener('click', () => {

    $playButton.disabled = false;
    $stopButton.disabled = true;
    isPlaying = false;

    if (source.stop) {
        source.stop();
    }

    if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
    }

    source = undefined;
    mediaStream = undefined;

});

$volumeStrengthLowerLimit.addEventListener('change', () => {
    const value = parseInt($volumeStrengthLowerLimit.value, 10);
    volumeStrengthLowerLimit = value;
});

fillFrequencyGraph();
fillSignalGraph();
fillSignalStrengthGraph();



/*
 * three.js
 * VRM
 */
const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

const $canvas = document.querySelector('#avatar');
$canvas.width = CANVAS_WIDTH;
$canvas.height = CANVAS_HEIGHT;


// レンダラー
const renderer = new THREE.WebGLRenderer({
    canvas: $canvas
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);

// カメラ
const camera = new THREE.PerspectiveCamera(45, CANVAS_WIDTH / CANVAS_HEIGHT);
camera.position.set(0.0, 1.5, -1.0);
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0.0, 1.5, 0.0);


// シーン
const scene = new THREE.Scene();

// ライト
const addLight = (x, y ,z) => {
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(x, y, z);
    scene.add(directionalLight);
};
addLight(1, 1, 1);
// addLight(-1, 1, 1);
// addLight(1, 1, -1);
// addLight(-1, 1, -1);




/*
 * three-vrm
 *
 */
let vrmModel;

window.addEventListener('dragover', event => event.preventDefault());
window.addEventListener('drop', event => {
    event.preventDefault();

    if (!event.dataTransfer.files || event.dataTransfer.files[0]) {
        const file = event.dataTransfer.files[0];
        const objectURL = URL.createObjectURL(file);

        const loader = new THREE.GLTFLoader();
        loader.load(objectURL, gltf => {

            THREE.VRMUtils.removeUnnecessaryJoints(gltf.scene);

            THREE.VRM.from(gltf).then(vrm => {

                scene.add(vrm.scene);
                vrmModel = vrm;
            });
        });
    }
});

const clock = new THREE.Clock();
const updateFrame = () => {
    controls.update();
    if (vrmModel) {
        vrmModel.update(clock.getDelta());
    }
    renderer.render(scene, camera);
    requestAnimationFrame(updateFrame);
};
updateFrame();


const mouthBlendShapeNameMap = {
    'mouth_A': THREE.VRMSchema.BlendShapePresetName.A,
    'mouth_I': THREE.VRMSchema.BlendShapePresetName.I,
    'mouth_U': THREE.VRMSchema.BlendShapePresetName.U,
    'mouth_E': THREE.VRMSchema.BlendShapePresetName.E,
    'mouth_O': THREE.VRMSchema.BlendShapePresetName.O,
};

const moveMouth = isOpen => {
    if (!vrmModel) {
        return;
    }
    Object.values(mouthBlendShapeNameMap).forEach(_name => {
        vrmModel.blendShapeProxy.setValue(_name, 0);
    });
    if (isOpen) {
        /* TODO 母音などを判断したlipsyncは未実装 */
        vrmModel.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.A, 0.4);
        vrmModel.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.U, 0.1);
    }
};

document.addEventListener('mouthMove', event => {
    const isOpen = event.detail.isOpen;
    moveMouth(isOpen);
});

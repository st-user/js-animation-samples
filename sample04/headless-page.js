/*global THREE */
/* Three.js */

const $canvas = document.createElement('canvas');
document.body.appendChild($canvas);

$canvas.width = 960;
$canvas.height = 540;

// レンダラー
const renderer = new THREE.WebGLRenderer({
    canvas: $canvas
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize($canvas.width, $canvas.height);

// カメラ
const camera = new THREE.PerspectiveCamera(45, $canvas.width / $canvas.height);
camera.position.set(0.0, 1.0, -3.0);
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0.0, 1.0, 0.0);

// シーン
const scene = new THREE.Scene();

// ライト
const addLight = (x, y ,z, intensity = 1) => {
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(x, y, z);
    directionalLight.intensity = intensity;
    scene.add(directionalLight);
    return directionalLight;
};
addLight(1, 1, -1);
// scene.add(new THREE.AmbientLight(0xffffff, 1));

const gridHelper = new THREE.GridHelper(100, 100);
const axes = new THREE.AxisHelper(100);
scene.add(gridHelper);
scene.add(axes);

let vrmModel;
let vrmAnimationFlg = false;

const clock = new THREE.Clock();
let animationMixer;

const setUpAnimation = vrm => {
    animationMixer = new THREE.AnimationMixer( vrm.scene );

    const quatA = new THREE.Quaternion( 0.0, 0.0, 0.0, 1.0 );
    const quatB = new THREE.Quaternion( 0.0, 0.0, 0.0, 1.0 );
    quatB.setFromEuler(new THREE.Euler( 0.0, Math.PI / 9, 0.0));

    const neckTrack = new THREE.QuaternionKeyframeTrack(
        vrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Neck ).name + '.quaternion', // name
        [ 0.0, 0.5, 1.0 ], // times
        [ ...quatA.toArray(), ...quatB.toArray(), ...quatA.toArray() ] // values
    );

    const clip = new THREE.AnimationClip('simpleAnimation', 1.0, [ neckTrack ]);
    const action = animationMixer.clipAction(clip);
    action.play();
};

const updateFrame = () => {
    controls.update();

    if (vrmAnimationFlg && vrmModel) {
        animationMixer.update(clock.getDelta());
    }

    if (vrmModel) {
        vrmModel.update(clock.getDelta());
    }
    renderer.render(scene, camera);
    requestAnimationFrame(updateFrame);
};
updateFrame();

const loadVrm = blob => {

    const objectURL = URL.createObjectURL(blob);
    const loader = new THREE.GLTFLoader();

    loader.load(objectURL, gltf => {

        THREE.VRMUtils.removeUnnecessaryJoints(gltf.scene);

        THREE.VRM.from(gltf).then(vrm => {

            scene.add(vrm.scene);
            vrmModel = vrm;
            setUpAnimation(vrm);
        });
    });
};

console.log('Three.js loaded.');




/* WebRTC */
const signalingChannel = new WebSocket('ws://localhost:8080/signaling');
signalingChannel.onopen = () => {
    signalingChannel.send(JSON.stringify({
        type: 'headlessPageLoaded'
    }));
};

const peerConnection = new RTCPeerConnection();
let dataChannel;
let canvasStream = $canvas.captureStream();
canvasStream.getTracks().forEach(
    track => peerConnection.addTrack(track, canvasStream)
);
let fileSize = 0;
const receiveBuffer = [];
let receivedSize = 0;

peerConnection.addEventListener('icecandidate', event => {
    console.log('icecandidate');
    if (event.candidate) {
        signalingChannel.send(JSON.stringify({
            type: 'icecandidate',
            rtcIceCandidateInit: event.candidate.toJSON()
        }));
    }
});


const acceptFile = metaData => {
    fileSize = metaData.fileSize;
    dataChannel.send(JSON.stringify({
        type: 'acceptFile'
    }));
};

const receiveFile = chunk => {

    receiveBuffer.push(chunk);
    receivedSize += chunk.byteLength;

    if (receivedSize === fileSize) {
        console.log(`Finish receiving file (${fileSize} bytes).`);
        const blob = new Blob(receiveBuffer);
        receiveBuffer.length = 0;
        loadVrm(blob);
    }
};

const animate = () => {
    vrmAnimationFlg = !vrmAnimationFlg;
};

const createAnswer = messageObj => {

    const offer = messageObj.offer;

    peerConnection.ondatachannel = event => {
        dataChannel = event.channel;
        dataChannel.onmessage = event => {
            if (typeof event.data === 'string') {
                const metaData = JSON.parse(event.data);
                console.log(metaData.type);

                switch(metaData.type) {
                case 'ping':
                    // console.log('ping');
                    break;
                case 'fileUploadStart':
                    acceptFile(metaData);
                    break;
                case 'animate':
                    animate();
                    break;
                default:
                    console.log(`Unexpected message type ${metaData.type}`);
                    return;
                }
            } else {
                receiveFile(event.data);
            }
        };
    };

    peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        .then(() => peerConnection.createAnswer())
        .then(answer => {
            peerConnection.setLocalDescription(answer)
                .then(() => {
                    signalingChannel.send(JSON.stringify({
                        type: 'answer',
                        answer: answer.toJSON()
                    }));
                });
        });

};

const handleICECandidate = messageObj => {
    console.log('handleICECandidate');
    const candidate = new RTCIceCandidate(messageObj.rtcIceCandidateInit);
    peerConnection.addIceCandidate(candidate);
};

signalingChannel.onmessage = event => {
    const messageObj = JSON.parse(event.data);
    const type = messageObj.type;

    // このサンプルではクライアント主導でsignalingする
    switch(type) {
    case 'offer':
        createAnswer(messageObj);
        break;
    case 'icecandidate':
        handleICECandidate(messageObj);
        break;
    default:
        console.log(`Unexpected message type ${type}`);
        break;
    }
};

signalingChannel.onclose = () => {
    console.log('Connection has been closed so reload the page later a bit.');
    document.querySelector('#signalingConnectionClosed').value = true;
};

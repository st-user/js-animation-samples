const $video = document.querySelector('video');
$video.width = 960;
$video.height = 540;
const aspectRatio = $video.width / $video.height;
const $startButton = document.querySelector('#startButton');
const $pingButton = document.querySelector('#pingButton');
const $animationButton = document.querySelector('#animationButton');
$startButton.disabled = true;
$pingButton.disabled = true;
$animationButton.disabled = true;

/* WebRTC */
const signalingChannel = new WebSocket('ws://localhost:8080/signaling');
signalingChannel.onopen = () => {
    console.log('opened.');
};

const peerConnection = new RTCPeerConnection();
let dataChannel;
let file;

peerConnection.addEventListener('icecandidate', event => {
    console.log('icecandidate');
    if (event.candidate) {
        signalingChannel.send(JSON.stringify({
            type: 'icecandidate',
            rtcIceCandidateInit: event.candidate.toJSON()
        }));
    }
});

peerConnection.ontrack = event => {
    console.log(event.streams);
    $video.srcObject = event.streams[0];
};

const transferFile = () => {

    const chunkSize = 16384;
    const fileReader = new FileReader();
    let offset = 0;

    fileReader.addEventListener('error', () => {
        console.error(`Encounter an error on reading file. ${offset}`);
    });
    fileReader.addEventListener('abort', () => {
        console.log(`File reading aborted. ${offset}`);
    });

    fileReader.addEventListener('load', event => {

        dataChannel.send(event.target.result);
        offset += event.target.result.byteLength;
        console.log(`FileRead.onload. current offset: ${offset} ${!file}`);

        if (offset < file.size) {
            readSlice(offset);
        }
    });
    const readSlice = o => {
        const slice = file.slice(offset, o + chunkSize);
        fileReader.readAsArrayBuffer(slice);
    };
    readSlice(0);
};

const createOffer = () => {
    console.log('createOffer');

    dataChannel = peerConnection.createDataChannel('RealTimeDataChannel');
    dataChannel.onmessage = event => {
        if (typeof event.data === 'string') {
            const metaData = JSON.parse(event.data);
            if (metaData.type === 'acceptFile') {
                transferFile();
            }
        }
    };

    peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true })
        .then(offer => {
            peerConnection.setLocalDescription(offer)
                .then(() => {
                    signalingChannel.send(JSON.stringify({
                        type: 'offer',
                        offer: offer.toJSON()
                    }));
                });
        });
};

const handleAnswer = messageObj => {
    console.log('handleAnswer');

    peerConnection.setRemoteDescription(
        new RTCSessionDescription(messageObj.answer)
    );
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
    case 'headlessPageLoaded':
        $startButton.disabled = false;
        break;
    case 'answer':
        handleAnswer(messageObj);
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
    alert('ヘッドレスブラウザがシグナリングサーバーとの接続を切断しました。');
    location.href = './';
};

let checkStartButtonStateCnt = 5;
const checkStartButtonState = () => {
    if (!$startButton.disabled) {
        return;
    }
    checkStartButtonStateCnt++;
    if (10 < checkStartButtonStateCnt) {
        location.href = './';
    }
    setTimeout(checkStartButtonState, 1000);
};
checkStartButtonState();

/* 画面操作 */
$pingButton.addEventListener('click', () => {
    if (!dataChannel) {
        return;
    }
    if (dataChannel.readyState !== 'open') {
        alert(`Data channel is not opened. (status: ${dataChannel.readyState})`);
        return;
    }
    dataChannel.send(JSON.stringify({
        type: 'ping'
    }));
});

$startButton.addEventListener('click', () => {
    $startButton.disabled = true;
    $pingButton.disabled = false;
    createOffer();
});

const startFileTransfer = () => {
    dataChannel.send(JSON.stringify({
        type :'fileUploadStart',
        fileSize: file.size,
    }));
    $animationButton.disabled = false;
};

$animationButton.addEventListener('click', () => {

    dataChannel.send(JSON.stringify({
        type :'animate'
    }));

});

window.addEventListener('dragover', event => {
    event.preventDefault();
});

window.addEventListener('drop', event => {
    event.preventDefault();

    if (!dataChannel || dataChannel.readyState !== 'open' || file) {
        return;
    }

    const files = event.dataTransfer.files;
    if (!files || !files[0]) {
        return;
    }

    file = files[0];
    startFileTransfer();
});

const onResize = () => {
    const width = window.innerWidth;
    const height = width * (1 / aspectRatio);

    $video.width = width;
    $video.height = height;
};
window.addEventListener('resize', onResize);
onResize();

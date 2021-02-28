const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

const $canvas = document.querySelector('#myCanvas');
$canvas.width = CANVAS_WIDTH;
$canvas.height = CANVAS_HEIGHT;


// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: $canvas
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);

// Camera
const camera = new THREE.PerspectiveCamera(45, CANVAS_WIDTH / CANVAS_HEIGHT);
AudioListenerDebug.debugObject(camera);
let controls;

// Scene
const scene = new THREE.Scene();

// Light
const addLight = (x, y ,z, intensity = 1) => {
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(x, y, z);
    directionalLight.intensity = intensity;
    scene.add(directionalLight);
    return directionalLight;
};
addLight(1, 1, -1);
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

const gridHelper = new THREE.GridHelper(100, 100);
const axes = new THREE.AxisHelper(100);
scene.add(gridHelper);
scene.add(axes);


const onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
};

window.addEventListener('resize', onResize);
onResize();


// speaker object
const createPerson = (color, name, defaultPosition) => {

    const createNameText = name => {

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'white';
        ctx.font = '48px san-serif';
        ctx.fillText(name, 0, 48, 270);

        const spriteMaterial = new THREE.SpriteMaterial({
            map: new THREE.CanvasTexture(canvas)
        });
        const nameSprite = new THREE.Sprite(spriteMaterial);
        nameSprite.position.set(0, 2.2, 0);

        return nameSprite;
    };

    const material = new THREE.MeshLambertMaterial({ color });

    const headGeometry = new THREE.SphereGeometry(1, 15, 15);
    const headMesh = new THREE.Mesh(headGeometry, material);
    headMesh.position.set(0, 1.2, 0);

    const noseGeometry = new THREE.ConeGeometry(0.5, 1, 30);
    const noseMesh = new THREE.Mesh(noseGeometry, material);
    noseMesh.position.set(0, 1.2, -1);
    noseMesh.rotation.x -= Math.PI / 2;

    const bodyGeometry = new THREE.ConeGeometry(0.8, 2, 30);
    const bodyMesh = new THREE.Mesh(bodyGeometry, material);
      

    const group = new THREE.Group();
    group.add(headMesh);
    group.add(noseMesh);
    group.add(bodyMesh);
    group.add(createNameText(name));

    if (defaultPosition) {
        const { x, y, z } = defaultPosition;
        group.position.set(x, y, z);
    }

    return group;
}
const speakerMesh = createPerson(0x0000ff, 'Speaker', { x: 0, y: 1, z: -3 });
scene.add(speakerMesh);


/* inspectors */
const pannerNodeInspector = new PannerNodeInspector({
    styles: {
        _container: {
            top: '360px'
        }
    }
});

const transformInspector = new TransfromInspector({
    parent: document.body,
    title: `Speaker's position & rotation`
});
transformInspector.setObject(speakerMesh);



let audioContext;
let pannerNode;

/* set event handlers */
document.querySelector('#play').addEventListener('click', async () => {
    document.querySelector('#playSound').style.display = 'none';

    if (document.querySelector('input[name="cameraControlType"]:checked').value === '0') {
        camera.position.set(0.0, 5.0, -10.0);
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        document.querySelector('#explanation-orbit').style.display = 'block';
    } else {
        camera.position.set(0.0, 2, -8);
        camera.lookAt(1, 2, -8);
        constrols = new SimpleRotationControls(camera);
        document.querySelector('#explanation-rotate').style.display = 'block';
    }

    if (!audioContext) {
        audioContext = new AudioContext();
    }
    
    const soundUrl = 'sound/sample_voice.mp3';
    const responseBuffer = await fetch(soundUrl).then(res => res.arrayBuffer());

    audioContext.decodeAudioData(responseBuffer, buffer => {

        const source = audioContext.createBufferSource();
        pannerNode = audioContext.createPanner();

        source.buffer = buffer;
        source.connect(pannerNode);
        pannerNode.connect(audioContext.destination);

        source.loop = true;
        source.start(0);

        pannerNodeInspector.setPannerNode(pannerNode);     

    });
});

const setAudioListenerProperties = obj => {
    if (audioContext && pannerNode) {
        
        obj.updateMatrixWorld();
        const forward = new THREE.Vector3(0, 0, -1);
        const up = new THREE.Vector3(0, 1, 0);
        forward.applyQuaternion(obj.quaternion);
        up.applyQuaternion(obj.quaternion);

        const listener = audioContext.listener;
        const { x, y, z } = obj.position;

        if (listener.positionX) {
            listener.positionX.setValueAtTime(x, audioContext.currentTime);
            listener.positionY.setValueAtTime(y, audioContext.currentTime);
            listener.positionZ.setValueAtTime(z, audioContext.currentTime);
        } else {
            listener.setPosition(x, y, z);
        }

        if (listener.forwardX) {
            listener.forwardX.setValueAtTime(forward.x, audioContext.currentTime);
            listener.forwardY.setValueAtTime(forward.y, audioContext.currentTime);
            listener.forwardZ.setValueAtTime(forward.z, audioContext.currentTime);
            listener.upX.setValueAtTime(up.x, audioContext.currentTime);
            listener.upY.setValueAtTime(up.y, audioContext.currentTime);
            listener.upZ.setValueAtTime(up.z, audioContext.currentTime);
        } else {
            listener.setOrientation(
                forward.x, forward.y, forward.z, 
                up.x, up.y, up.z);
        }
    }
};

const setAudioSourceProperties = obj => {
    if (audioContext && pannerNode) {
        
        obj.updateMatrixWorld();
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(obj.quaternion);

        const { x, y, z } = obj.position;

        if (pannerNode.positionX) {
            pannerNode.positionX.setValueAtTime(x, audioContext.currentTime);
            pannerNode.positionY.setValueAtTime(y, audioContext.currentTime);
            pannerNode.positionZ.setValueAtTime(z, audioContext.currentTime);
        } else {
            pannerNode.setPosition(x, y, z);
        }

        if (pannerNode.orientationX) {
            pannerNode.orientationX.setValueAtTime(forward.x, audioContext.currentTime);
            pannerNode.orientationY.setValueAtTime(forward.y, audioContext.currentTime);
            pannerNode.orientationZ.setValueAtTime(forward.z, audioContext.currentTime);
        } else {
            pannerNode.setOrientation(forward.x, forward.y, forward.z);
        }
    }
};

document.querySelector('#dump').addEventListener('click', () => {
    AudioListenerDebug.debug(audioContext);
});

const clock = new THREE.Clock();
const updateFrame = () => {
    const delta = clock.getDelta();
    if (controls) {
        controls.update(delta);
    }
    renderer.render(scene, camera);

    setAudioListenerProperties(camera);
    setAudioSourceProperties(speakerMesh);

    transformInspector.update(delta);

    requestAnimationFrame(updateFrame);
};
updateFrame();
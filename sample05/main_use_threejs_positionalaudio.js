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



// speacker object
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
    noseMesh.position.set(0, 1.2, 1);
    noseMesh.rotation.x += Math.PI / 2;

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



class RotatableUpVectorAudioListener extends THREE.AudioListener {
 
    _forward;
    _up;
    _quaternion;

    _position;
    _scale;

    constructor() {
        super();
        this._forward = new THREE.Vector3();
        this._up = new THREE.Vector3();
        this._quaternion = new THREE.Quaternion();

        this._position = new THREE.Vector3();
        this._scale = new THREE.Vector3();
    }

    updateMatrixWorld(force) {
        super.updateMatrixWorld(force);

        const listener = this.context.listener;
        this.matrixWorld.decompose(this._position, this._quaternion, this._scale);
        this._forward.set(0, 0, -1).applyQuaternion(this._quaternion);
        this._up.set(0, 1, 0).applyQuaternion(this._quaternion);

       if (listener.forwardX) {

            const endTime = this.context.currentTime + this.timeDelta;

            listener.upX.cancelScheduledValues(this.context.currentTime);
            listener.upY.cancelScheduledValues(this.context.currentTime);
            listener.upZ.cancelScheduledValues(this.context.currentTime);
            
            listener.upX.linearRampToValueAtTime(this._up.x, endTime);
            listener.upY.linearRampToValueAtTime(this._up.y, endTime);
            listener.upZ.linearRampToValueAtTime(this._up.z, endTime);

        } else {
            listener.setOrientation(
                this._forward.x, this._forward.y, this._forward.z, 
                this._up.x, this._up.y, this._up.z);
        }
    }
}

/* set event handlers */
document.querySelector('#play').addEventListener('click', () => {

    document.querySelector('#playSound').style.display = 'none';
    if (document.querySelector('input[name="cameraControlType"]:checked').value === '0') {
        camera.position.set(0.0, 3.0, 10.0);
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
    } else {
        camera.position.set(0.0, 2, 8);
        camera.lookAt(1, 2, 8);
        constrols = new SimpleRotationControls(camera);
    }

    // const listener = new THREE.AudioListener();
    const listener = new RotatableUpVectorAudioListener();
    camera.add(listener);

    const sound = new THREE.PositionalAudio(listener);
    pannerNodeInspector.setPannerNode(sound.getOutput());

    const soundUrl = 'sound/sample_voice.mp3';
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(soundUrl, buffer => {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.play();
    });

    speakerMesh.add(sound);
});

document.querySelector('#dump').addEventListener('click', () => {
    AudioListenerDebug.debug(THREE.AudioContext.getContext());
});

const clock = new THREE.Clock();
const updateFrame = () => {
    const delta = clock.getDelta();
    if (controls) {
        controls.update(delta);
    }

    renderer.render(scene, camera);   

    transformInspector.update(delta);

    requestAnimationFrame(updateFrame);
};
updateFrame();
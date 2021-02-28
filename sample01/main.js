const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

const $canvas = document.querySelector('#myCanvas');
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

/*
 * three-vrm
 *
 */
let blob;
const vrmModules = [];

const mouthBlendShapeNameMap = {
    'mouth_A': THREE.VRMSchema.BlendShapePresetName.A,
    'mouth_I': THREE.VRMSchema.BlendShapePresetName.I,
    'mouth_U': THREE.VRMSchema.BlendShapePresetName.U,
    'mouth_E': THREE.VRMSchema.BlendShapePresetName.E,
    'mouth_O': THREE.VRMSchema.BlendShapePresetName.O,
};

class BoneRotation {

    defaultAngleHasAlreadyBeenSet;

    boneName;

    rotationAngleMax;
    rotationAngleStep;
    rotationAxis;

    currentAngle = 0;
    defaultAngle;

    constructor(
        boneName,
        rotationAngleMax,
        rotationAngleStep,
        defaultAngle,
        rotationAxis) {

        this.boneName = boneName;
        this.rotationAngleMax = rotationAngleMax;
        this.rotationAngleStep = rotationAngleStep;
        this.defaultAngle = defaultAngle;
        this.rotationAxis = rotationAxis.normalize();
    }

    animate(vrmModel) {

        if (!vrmModel) {
            return;
        }

        if (!this.defaultAngleHasAlreadyBeenSet) {
            this.defaultAngleHasAlreadyBeenSet = true;
            this._rotate(this.defaultAngle, vrmModel);
        }

        this.currentAngle = this.currentAngle + this.rotationAngleStep;

        this._rotate(this.rotationAngleStep, vrmModel);

        if (this.rotationAngleMax <= this.currentAngle
                || this.currentAngle <= -this.rotationAngleMax) {
            this.rotationAngleStep = -this.rotationAngleStep;
        }
    }

    _rotate(angleToAdd, vrmModel) {

        let mesh = vrmModel.humanoid.getBoneNode(this.boneName);

        if (!mesh) {
            return;
        }

        const angleRadian = angleToAdd / 360 * 2 * Math.PI;
        const _q = new THREE.Quaternion();
        _q.setFromAxisAngle(this.rotationAxis, angleRadian);
        mesh.quaternion.multiply(_q);
    }
}

class VrmModule {

    vrmModel;
    position;

    defaultQuaternions;

    walkControl;

    constructor(position = { x:0, y: 0, z: 0}) {
        this.defaultQuaternions = new Map();
        this.position = position;
        this.walkControl = {};
        this.waitControl = {};
        this.blinkControl = {};
    }

    load(blob) {
        const _load = objectURL => {

            const loader = new THREE.GLTFLoader();
            loader.load(objectURL, (gltf) => {
                THREE.VRMUtils.removeUnnecessaryJoints(gltf.scene);
                THREE.VRM.from(gltf).then(vrm => {

                    scene.add(vrm.scene);
                    vrm.scene.position.x = this.position.x;
                    vrm.scene.position.y = this.position.y;
                    vrm.scene.position.z = this.position.z;

                    this.vrmModel = vrm;

                    for (const [name, value] of Object.entries(THREE.VRMSchema.HumanoidBoneName)) {
                        const mesh = this.vrmModel.humanoid.getBoneNode(value);
                        if (!mesh) {
                            continue;
                        }
                        this.defaultQuaternions.set(name, mesh.quaternion.clone());
                    }
                });
            });
        };

        const loadVrm = blob => {
            const objectURL = URL.createObjectURL(blob);
            _load(objectURL);
        };

        loadVrm(blob);

        /* アニメーション定義 */
        this._setWalkAnimation();
        this._setWaitAnimation();
        this._setBlinkAnimation();
    }

    _setWalkAnimation() {
        let animationJsonArray = {};
        const ANIM_COUNT = 34;
        const ANIM_START_COUNT = 2;
        let currentJsonIndex = ANIM_START_COUNT;

        const loadJson = () => {
            if (currentJsonIndex === (ANIM_COUNT + 1)) {
                currentJsonIndex = ANIM_START_COUNT;
            }
            const ret = animationJsonArray[currentJsonIndex - 1];
            if (!ret) {
                return undefined;
            }
            currentJsonIndex++;
            return ret;
        }

        let jsonFetchCounter = ANIM_START_COUNT;
        const fetchAllJson = () => {

            fetch('.vrm/walk.json')
                .then(response => response.json())
                .then(json => {
                    animationJsonArray = json
                    animationJsonArray.forEach(animationJson => {
                        animationJson.forEach(animation => {
                            animation.name = -(-animation.name);
                        });
                    })
                });

        };
        fetchAllJson();

        let needsUpdateframe = false;
        let animationFrameCounter = 0;
        const updateFrame = () => {

            if (!this.walkControl.needsUpdateframe || animationFrameCounter % (10 - this.walkControl.walkSpeed) !== 0) {
                animationFrameCounter++
                requestAnimationFrame(updateFrame);
                return;
            }
            animationFrameCounter = 1;

            const animation = loadJson();

            if (!animation) {
                requestAnimationFrame(updateFrame);
                return;
            }

            for (const ani of animation) {
                const humanoidBoneName = THREE.VRMSchema.HumanoidBoneName[ani.humanoidBoneName];
                if (ani.rot.length != 4 || !humanoidBoneName) {
                    // console.log(`${humanoidBoneName} not exist.`);
                    continue;
                }
                const mesh = this.vrmModel.humanoid.getBoneNode(humanoidBoneName);
                if (!mesh) {
                    continue;
                }
                // mesh.quaternion.set(-ani.rot[0], -ani.rot[1], ani.rot[2], ani.rot[3]); or
                mesh.quaternion.set(ani.rot[0], ani.rot[1], -ani.rot[2], -ani.rot[3]);
            }


            requestAnimationFrame(updateFrame);
        }
        updateFrame();

        this.walkControl.walkSpeed = 8;
        this.walkControl.needsUpdateframe = false;
    }

    _setWaitAnimation() {
        const boneRotations = [];

        /* Unityとの相違確認用
        boneRotations.push(
            new BoneRotation(
                THREE.VRMSchema.HumanoidBoneName.Neck,
                // 20, 0.1, 60, new THREE.Vector3(0, 1, 0)
                20, -0.1, -60, new THREE.Vector3(0, 1, 0)
            )
        );

        boneRotations.push(
            new BoneRotation(
                THREE.VRMSchema.HumanoidBoneName.LeftUpperArm,
                20, 0.1, 30, new THREE.Vector3(0, 0, 1)
            )
        );
        boneRotations.push(
            new BoneRotation(
                THREE.VRMSchema.HumanoidBoneName.RightUpperArm,
                20, 0.1, 30, new THREE.Vector3(0, 0, 1)
            )
        );
        boneRotations.push(
            new BoneRotation(
                THREE.VRMSchema.HumanoidBoneName.LeftUpperLeg,
                // 20, 0.1, 20, new THREE.Vector3(1, 0, 0)
                20, -0.1, -20, new THREE.Vector3(1, 0, 0)
            )
        );
        boneRotations.push(
            new BoneRotation(
                THREE.VRMSchema.HumanoidBoneName.RightUpperLeg,
                // 20, 0.1, -20, new THREE.Vector3(1, 0, 0)
                -20, -0.1, 20, new THREE.Vector3(1, 0, 0)
            )
        );
        */

        /* 胴体 */
        boneRotations.push(
            new BoneRotation(
                THREE.VRMSchema.HumanoidBoneName.Spine,
                8, 0.02, 0, new THREE.Vector3(0, 1, 0)
            )
        );
        boneRotations.push(
            new BoneRotation(
                THREE.VRMSchema.HumanoidBoneName.Neck,
                3, 0.01, 0, new THREE.Vector3(0, 1, -1)
            )
        );

        /* 腕 */
        boneRotations.push(
            new BoneRotation(
                THREE.VRMSchema.HumanoidBoneName.LeftUpperArm,
                3, 0.01, 50, new THREE.Vector3(0, 0, 1)
            )
        );
        boneRotations.push(
            new BoneRotation(
                THREE.VRMSchema.HumanoidBoneName.LeftLowerArm,
                2, 0.05, 10, new THREE.Vector3(0, 1, 1)
            )
        );
        boneRotations.push(
            new BoneRotation(
                THREE.VRMSchema.HumanoidBoneName.RightUpperArm,
                3, -0.01, -50, new THREE.Vector3(0, 0, 1)
            )
        );
        boneRotations.push(
            new BoneRotation(
                THREE.VRMSchema.HumanoidBoneName.RightLowerArm,
                2, -0.05, -10, new THREE.Vector3(0, 1, 1)
            )
        );

        /* 脚 */
        boneRotations.push(
            new BoneRotation(
                THREE.VRMSchema.HumanoidBoneName.LeftUpperLeg,
                2.5, 0.01, 0, new THREE.Vector3(1, -0.1, 0)
            )
        );
        boneRotations.push(
            new BoneRotation(
                THREE.VRMSchema.HumanoidBoneName.LeftLowerLeg,
                2, -0.01, -10, new THREE.Vector3(1, 0.1, 0)
            )
        );
        boneRotations.push(
            new BoneRotation(
                THREE.VRMSchema.HumanoidBoneName.RightUpperLeg,
                2.5, -0.01, 0, new THREE.Vector3(-0.1, 1, 0)
            )
        );
        boneRotations.push(
            new BoneRotation(
                THREE.VRMSchema.HumanoidBoneName.RightLowerLeg,
                2, 0.01, 0, new THREE.Vector3(-0.1, -1, 0)
            )
        );

        const updateFrame = () => {
            if (!this.waitControl.needsUpdateframe) {
                requestAnimationFrame(updateFrame);
                return;
            }
            boneRotations.forEach(br => br.animate(this.vrmModel));

            requestAnimationFrame(updateFrame);
        };
        updateFrame();

        this.waitControl.needsUpdateframe = false;
        this.waitControl.boneRotations = boneRotations;
    }

    _setBlinkAnimation() {
        let currentBlinkRatio = 0;
        let blinkRatioStep = 2;
        let isAnimationCompleted = true;

        const updateFrame = () => {

            if (!this.blinkControl.needsUpdateframe && isAnimationCompleted) {
                return;
            }

            if (currentBlinkRatio <= 0) {
                if (isAnimationCompleted) {
                    blinkRatioStep = 2;
                    isAnimationCompleted = false;
                } else {
                    isAnimationCompleted = true;
                }
            }

            this.vrmModel.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.BlinkL, currentBlinkRatio / 10);
            this.vrmModel.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.BlinkR, currentBlinkRatio / 10);



            if (isAnimationCompleted) {
                return;
            }

            if (10 <= currentBlinkRatio && 0 < blinkRatioStep) {
                blinkRatioStep = -blinkRatioStep;
            }
            currentBlinkRatio += blinkRatioStep;

            requestAnimationFrame(updateFrame);
        };

        const setUpdateFrame = () => {

            if (this.vrmModel) {
                updateFrame();
            }

            setTimeout(setUpdateFrame, 3000 + Math.random() * 3000);
        };
        setUpdateFrame();
    }

    mouth(name) {
        let setter = (name, value) => this.vrmModel.blendShapeProxy.setValue(name, value);

        Object.values(mouthBlendShapeNameMap).forEach(_name => {
            setter(_name, 0);
        });
        setter(name, 1);
    }

    blink(value) {
        this.vrmModel.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.BlinkL, value);
        this.vrmModel.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.BlinkR, value);
    }

    stopAnimation(stopOnly) {
        const revertVrmBoneQuaternions = () => {

            for (const [name, value] of Object.entries(THREE.VRMSchema.HumanoidBoneName)) {
                const mesh = this.vrmModel.humanoid.getBoneNode(value);
                if (!mesh) {
                    continue;
                }
                const q = this.defaultQuaternions.get(name);
                mesh.quaternion.set(q.x, q.y, q.z, q.w);
                mesh.updateMatrix();
            }

        };

        const stopAnimation = stopOnly => {
            this.walkControl.needsUpdateframe = false;
            this.waitControl.needsUpdateframe = false;
            if (!stopOnly) {
                revertVrmBoneQuaternions();
            }
        };

        stopAnimation(stopOnly)
    }

    update(clockDelta) {
        if (!this.vrmModel) {
            return;
        }
        this.vrmModel.update(clockDelta);
    }
}


const calcModePosition = () => {
    const vrmCounter = vrmModules.length;
    let xPos = 0;
    if (vrmCounter % 3 === 1) {
        xPos = -1;
    }
    if (vrmCounter % 3 === 2) {
        xPos = 1;
    }
    const x = xPos * -2;
    const z = Math.floor(vrmCounter / 3) * -1.5;
    return { x: x, y: 0, z: z };
};
window.addEventListener('dragover', event => event.preventDefault());
window.addEventListener('drop', event => {
    event.preventDefault();

    if (!event.dataTransfer.files || event.dataTransfer.files[0]) {
        const file = event.dataTransfer.files[0];
        blob = new Blob([ file ], { type: 'application/octet-stream' });

        const module = new VrmModule(calcModePosition());
        module.load(blob);
        vrmModules.push(module);
    }
});


const _$click = (id, handler) => {
    document.querySelector('#' + id).addEventListener('click', handler);
};

/* 口　*/

const _$mouth = (id, name) => {
    _$click(id, () => {
        vrmModules.forEach(m => m.mouth(name));
    });
};
_$mouth('mouth_A', THREE.VRMSchema.BlendShapePresetName.A);
_$mouth('mouth_I', THREE.VRMSchema.BlendShapePresetName.I);
_$mouth('mouth_U', THREE.VRMSchema.BlendShapePresetName.U);
_$mouth('mouth_E', THREE.VRMSchema.BlendShapePresetName.E);
_$mouth('mouth_O', THREE.VRMSchema.BlendShapePresetName.O);




/* 目 */
const _$blink = (id, value) => {
    _$click(id, () => {
        vrmModules.forEach(m => m.blink(value));
    });
};
_$blink('eye_open', 0);
_$blink('eye_close', 1);

/* 歩行 */
_$click('walk', () => {
    vrmModules.forEach(m => {
        m.stopAnimation();
        m.walkControl.needsUpdateframe = true;
    });
});

/* 待機 */
_$click('wait', () => {
    vrmModules.forEach(m => {
        m.stopAnimation();
        m.waitControl.boneRotations.forEach(br => br.defaultAngleHasAlreadyBeenSet = false);
        m.waitControl.needsUpdateframe = true;
    });
});

/* まばたき */
_$click('blink', () => {
    vrmModules.forEach(m => {
        m.blinkControl.needsUpdateframe = true;
    });
});

_$click('stop', () => {
    vrmModules.forEach(m => {
        m.stopAnimation(true);
        m.blinkControl.needsUpdateframe = false;
    });
});

document.querySelector('#animationSpeed').addEventListener('change', event => {
    const currentValue = event.target.value;
    vrmModules.forEach(m => {
        m.walkControl.walkSpeed = parseInt(currentValue, 10);
    });
});

const clock = new THREE.Clock();
const updateFrame = () => {
    controls.update();
    if (0 < vrmModules.length) {
        vrmModules.forEach(m => m.update(clock.getDelta()));
    }
    renderer.render(scene, camera);
    requestAnimationFrame(updateFrame);
};
updateFrame();


const onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight - 270;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}
window.addEventListener('resize', onResize);
onResize();

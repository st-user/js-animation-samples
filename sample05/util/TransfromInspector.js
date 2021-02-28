const TransfromInspector = (() => {

    const defaultStyles = {
        _container: {
            position: 'absolute',
            top: '16px',
            right: '16px',
            color: 'black',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '8px',
            'border-radius': '2px',
            'font-size': '12px',
            width: '180px',
        },
        _title: {
            'font-size': '16px',
            'font-weight': 'bold',
            'margin-bottom': '8px',
        },
        _transform: {
            'margin-bottom': '4px',
        },
        _transformTitle: {
            'margin-bottom': '4px',
        },
        _inputList: {
            float: 'right',
        },
        _inputTitle: {
            display: 'inline-block',
            width: '16px',
        },
        _positionInput: {
            'text-align': 'right',
            width: '48px',
        },
        _rotationInput: {
            'text-align': 'right',
            width: '48px',
        },
        _clear: {
            clear: 'both',
        },
    };

    const template = data => {
        return `
            <div class="${data.classNamePrefix}_container">
                <div class="${data.classNamePrefix}_title">
                    ${data.title}
                </div>
                <ul class="${data.classNamePrefix}_contents">
                    <li class="${data.classNamePrefix}_transform">
                        <div class="${data.classNamePrefix}_transformTitle">
                            Position:
                        </div>
                        <div class="${data.classNamePrefix}_inputListWrapper">
                            <ul class="${data.classNamePrefix}_inputList">
                                <li class="${data.classNamePrefix}_eachInput">
                                    <span class="${data.classNamePrefix}_inputTitle">x:</span>
                                    <input type="text" name="${data.inputNamePrefix}_position_x" class="${data.classNamePrefix}_positionInput"/>
                                </li>
                                <li class="${data.classNamePrefix}_eachInput">
                                    <span class="${data.classNamePrefix}_inputTitle">y:</span>
                                    <input type="text" name="${data.inputNamePrefix}_position_y" class="${data.classNamePrefix}_positionInput"/>
                                </li>
                                <li class="${data.classNamePrefix}_eachInput">
                                    <span class="${data.classNamePrefix}_inputTitle">z:</span>
                                    <input type="text" name="${data.inputNamePrefix}_position_z" class="${data.classNamePrefix}_positionInput"/>
                                </li>
                            </ul>
                            <div class="${data.classNamePrefix}_clear"></div>
                        </div>
                    </li>
                    <li class="${data.classNamePrefix}_transform">
                        <div class="${data.classNamePrefix}_transformTitle">
                            Rotation:
                        </div>
                        <div class="${data.classNamePrefix}_inputListWrapper">
                            <ul class="${data.classNamePrefix}_inputList">
                                <li class="${data.classNamePrefix}_eachInput">
                                    <span class="${data.classNamePrefix}_inputTitle">x:</span>
                                    <input type="text" name="${data.inputNamePrefix}_rotation_x" class="${data.classNamePrefix}_rotationInput"/>
                                </li>
                                <li class="${data.classNamePrefix}_eachInput">
                                    <span class="${data.classNamePrefix}_inputTitle">y:</span>
                                    <input type="text" name="${data.inputNamePrefix}_rotation_y" class="${data.classNamePrefix}_rotationInput"/>
                                </li>
                                <li class="${data.classNamePrefix}_eachInput">
                                    <span class="${data.classNamePrefix}_inputTitle">z:</span>
                                    <input type="text" name="${data.inputNamePrefix}_rotation_z" class="${data.classNamePrefix}_rotationInput"/>
                                </li>
                            </ul>
                            <div class="${data.classNamePrefix}_clear"></div>
                        </div>
                    </li>
                    <li class="${data.classNamePrefix}_transform">
                        <div class="${data.classNamePrefix}_transformTitle">
                            Transform duration:
                        </div>
                        <div class="${data.classNamePrefix}_inputListWrapper">
                            <ul class="${data.classNamePrefix}_inputList">
                                <li class="${data.classNamePrefix}_eachInput">
                                    <input type="range" name="${data.inputNamePrefix}_transform_duration" min="1" max="5" value="1" class="${data.classNamePrefix}_tranformDuration"/>
                                </li>
                            </ul>
                        </div>
                    </li>
                </ul>
            </div>
        `;


    };

    class _Class {

        _obj;
        
        _mixer;
        _positionClip;
        _rotationClip;

        _position;
        _rotation;

        _transformDuration;

        constructor(params){
            const _params = Object.assign({}, params);

            /* set default params. */
            _params.parent = _params.parent || document.body;
            _params.title = _params.title || 'Inspector';
            _params.inputNamePrefix = _params.inputNamePrefix || 'transformInspector';
            _params.classNamePrefix = _params.classNamePrefix || 'transformInspector';
            _params.styles = _params.styles || {};

            const $parent = _params.parent;
            $parent.insertAdjacentHTML('beforeend', template(_params));


            /* apply user css styles. */
            const $container = $parent.querySelector(`.${_params.classNamePrefix}_container`);
            const $uls = $container.querySelectorAll('ul');
            $uls.forEach($ul => {
                $ul.style.margin = '0';
                $ul.style.padding = '0';
                $ul.style.listStyle = 'none';
            });
            const $lis = $container.querySelectorAll('li');
            $uls.forEach($li => {
                $li.style.margin = '0';
                $li.style.padding = '0'
            });

            for (const [classKey, styleValue] of Object.entries(defaultStyles)) {
                const classSelector = `.${_params.classNamePrefix}${classKey}`;
                const $elems = $parent.querySelectorAll(classSelector);
                const userStyle = _params.styles[classKey] || {};

                $elems.forEach($elem => {
                    for (const [userKey, userValue] of Object.entries(userStyle)) {
                        $elem.style[userKey] = userValue;
                    }
                    for (const [propKey, propValue] of Object.entries(styleValue)) {
                        if (!userStyle[propKey]) {
                            $elem.style[propKey] = propValue;
                        }
                    }
                });
            }

            /* set event listeners. */
            const getInputElement = name => {
                return $parent.querySelector(`input[name="${name}"]`);
            };

            const $positionX = getInputElement(`${_params.inputNamePrefix}_position_x`);
            const $positionY = getInputElement(`${_params.inputNamePrefix}_position_y`);
            const $positionZ = getInputElement(`${_params.inputNamePrefix}_position_z`);

            const $rotationX = getInputElement(`${_params.inputNamePrefix}_rotation_x`);
            const $rotationY = getInputElement(`${_params.inputNamePrefix}_rotation_y`);
            const $rotationZ = getInputElement(`${_params.inputNamePrefix}_rotation_z`);

            const toDegree = radian => 180 * radian / Math.PI;
            const toRadian = degree => Math.PI * degree / 180;

            const setPositionValueToText = () => {
                if (!this._obj) {
                    return;
                }
                const { x, y, z } = this._obj.position;
                this._position = this._obj.position.clone();

                $positionX.value = x;
                $positionY.value = y;
                $positionZ.value = z;
            };
            this._setPositionValueToText = setPositionValueToText;

            const setRotationValueToText = () => {
                if (!this._obj) {
                    return;
                }
                const { x, y, z } = this._obj.rotation;
                this._rotation = this._obj.rotation.clone();

                $rotationX.value = toDegree(x);
                $rotationY.value = toDegree(y);
                $rotationZ.value = toDegree(z);
            };
            this._setRotationValueToText = setRotationValueToText;

            const checkIfDecimalValue = value => {
                if (value.length === 0) {
                    return false;
                }
                return /^[\-|\+]?\d*\.?\d*$/.test(value);
            };         

            const setTransformAnimation = (tracks, name, oldClip) => {
                const clip = new THREE.AnimationClip(name, -1, tracks);
                
                const action = this._mixer.clipAction(clip);
                action.clampWhenFinished = true;
                action.setLoop(THREE.LoopOnce);

                if (oldClip) {
                    const oldAction = this._mixer.existingAction(oldClip);
                    oldAction.crossFadeTo(action, 0);
                }
                action.play();
                
                return { clip };
            };

            const setTextValueToPosition = () => {
                if (!this._obj) {
                    return;
                }
                const x = $positionX.value;
                const y = $positionY.value;
                const z = $positionZ.value;
                if (!checkIfDecimalValue(x) || !checkIfDecimalValue(y) || !checkIfDecimalValue(z)) {
                    $positionX.value = this._position.x;
                    $positionY.value = this._position.y;
                    $positionZ.value = this._position.z;
                    return;
                }
                this._position.set(parseFloat(x), parseFloat(y), parseFloat(z));

                const p = this._obj.position;
                const track = new THREE.VectorKeyframeTrack(
                    '.position', [ 0, this._transformDuration ], [ ...p.toArray(), ...this._position.toArray(), ]
                );

                const { clip } = setTransformAnimation(
                    [ track ], `positionAnimation_${this._position.toArray().join('_')}}`, this._positionClip
                );
                this._positionClip = clip;
            };

            const setTextValueToRotation = () => {
                if (!this._obj) {
                    return;
                }
                const x = $rotationX.value;
                const y = $rotationY.value;
                const z = $rotationZ.value;
                if (!checkIfDecimalValue(x) || !checkIfDecimalValue(y) || !checkIfDecimalValue(z)) {
                    $rotationX.value = toDegree(this._rotation.x);
                    $rotationY.value = toDegree(this._rotation.y);
                    $rotationZ.value = toDegree(this._rotation.z);
                    return;
                }
                const newRotation = new THREE.Euler(toRadian(parseFloat(x)), toRadian(parseFloat(y)), toRadian(parseFloat(z)));
                this._rotation.set(newRotation.x, newRotation.y, newRotation.z);

                const q = this._obj.quaternion;
                const dest = new THREE.Quaternion();
                dest.setFromEuler(newRotation);
                const track = new THREE.QuaternionKeyframeTrack(
                    '.quaternion', [ 0, this._transformDuration ], [ ...q.toArray(), ...dest.toArray(), ]
                );

                const { clip } = setTransformAnimation(
                    [ track ], `rotationAnimation_${dest.toArray().join('_')}`, this._rotationClip
                );
                this._rotationClip = clip;
            };
            
            const $transformDuration = getInputElement(`${_params.inputNamePrefix}_transform_duration`);
            const setTransformDuration = () => {
                this._transformDuration = parseInt($transformDuration.value, 10);
            };
            
            $positionX.addEventListener('change', setTextValueToPosition);
            $positionY.addEventListener('change', setTextValueToPosition);
            $positionZ.addEventListener('change', setTextValueToPosition);

            $rotationX.addEventListener('change', setTextValueToRotation);
            $rotationY.addEventListener('change', setTextValueToRotation);
            $rotationZ.addEventListener('change', setTextValueToRotation);

            setTransformDuration();
            $transformDuration.addEventListener('change', setTransformDuration);
        }

        setObject(obj) {
            this._obj = obj;
            this._mixer = new THREE.AnimationMixer(obj);
            this._setPositionValueToText();
            this._setRotationValueToText();
        }

        update(delta) {
            if (this._mixer) {
                this._mixer.update(delta);
            }
        }
    }

    return _Class;

})();


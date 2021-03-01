const PannerNodeInspector = (() => { // eslint-disable-line no-unused-vars

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
            width: '230px',
        },
        _title: {
            'font-size': '16px',
            'font-weight': 'bold',
            'margin-bottom': '8px',
        },
        _eachProperty: {
            'margin-bottom': '4px'
        },
        _textPropertyName: {
            display: 'inline-block',
            width: '120px'
        },
        _textPropertyValue: {
            width: '48px',
            'text-align': 'right'
        },
        _selectPropertyName: {
            display: 'inline-block',
            width: '120px'
        },
    };

    const template = data => {

        const _for = (items, templ) => {
            let ret = '';
            items.forEach((item, key) => {
                ret += templ(item, key);
            });
            return ret;
        };

        return `
            <div class="${data.classNamePrefix}_container">
                <div class="${data.classNamePrefix}_title">
                    ${data.title}
                </div>
                <ul class="${data.classNamePrefix}_contents">

                    ${_for(data.properties, (prop, propName) => {

        if (prop.type === 'text') {

            return `
                                <li class="${data.classNamePrefix}_eachProperty">
                                    <span class="${data.classNamePrefix}_textPropertyName">${propName}:</span>
                                    <input type="text" name="${data.inputNamePrefix}_${propName}" class="${data.classNamePrefix}_textPropertyValue"/>
                                </li>
                            `;
        }
            
        if (prop.type === 'select') {

            return `
                                <li class="${data.classNamePrefix}_eachProperty">
                                    <span class="${data.classNamePrefix}_selectPropertyName">${propName}:</span>
                                    <select name="${data.inputNamePrefix}_${propName}" class="${data.classNamePrefix}_selectPropertyValue">
                                        ${_for(prop.options, option => `
                                            <option value="${option.value}">${option.name}</option>
                                        `)}
                                    </select>
                                </li>
                            `;
        }

    })}

                </ul>
            </div>
        `;
    };

    const toDouble = value => {
        if (/^[-|+]?\d*\.?\d*$/.test(value)) {
            return parseFloat(value);
        }
        return undefined;
    };

    const _properties = {
        coneInnerAngle: { 
            type: 'text',
            checker: toDouble,
            range: [ 0, 360 ]
        },
        coneOuterAngle: { 
            type: 'text',
            checker: toDouble,
            range: [ 0, 360 ]
        },
        coneOuterGain: {
            type: 'text',
            checker: toDouble,
            range: [ 0, 1 ]
        },
        distanceModel: { 
            type: 'select',
            options: [
                { name: 'linear', value: 'linear' },
                { name: 'inverse', value: 'inverse' },
                { name: 'exponential', value: 'exponential' },
            ]
        },
        maxDistance: {
            type: 'text',
            checker: toDouble,
            range: [ 0 + Number.EPSILON, Infinity ]
        },
        panningModel: { 
            type: 'select',
            options: [
                { name: 'equalpower', value: 'equalpower' },
                { name: 'HRTF', value: 'HRTF' },
            ]
        },
        refDistance: {
            type: 'text',
            checker: toDouble,
            range: [ 0, Infinity ]
        },
        rolloffFactor: {
            type: 'text',
            checker: toDouble,
            range: [ 0, Infinity ]
        },
    };

    const properties = new Map();
    for (const [key, value] of Object.entries(_properties)) {
        properties.set(key, value);
    }

    class _Class {

        _params;
        _pannerNode;

        constructor(params) {
            const _params = Object.assign({}, params);

            /* set default params. */
            _params.parent = _params.parent || document.body;
            _params.title = _params.title || 'PannerNode\'s properties';
            _params.inputNamePrefix = _params.inputNamePrefix || 'pannerNodeInspector';
            _params.classNamePrefix = _params.classNamePrefix || 'pannerNodeInspector';
            _params.styles = _params.styles || {};
            _params.properties = properties;
         
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
            $lis.forEach($li => {
                $li.style.margin = '0';
                $li.style.padding = '0';
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
            // set event handler;
            for (const [propName, prop] of properties.entries()) {
                if (prop.type === 'text') {
                    const $inputNode = $parent.querySelector(`input[name="${_params.inputNamePrefix}_${propName}"]`);
                    $inputNode.addEventListener('change', () => {
                        if (!this._pannerNode) {
                            return;
                        }
                        const pannerNode = this._pannerNode;

                        let inputValue = prop.checker($inputNode.value);

                        if (inputValue === undefined) {
                            $inputNode.value = pannerNode[propName];
                            return;
                        }

                        if (prop.range && (inputValue < prop.range[0] || prop.range[1] < inputValue)) {
                            $inputNode.value = pannerNode[propName];
                            return;
                        }

                        pannerNode[propName] = inputValue;
                    });
                }

                if (prop.type === 'select') {
                    const $selectNode = $parent.querySelector(`select[name="${_params.inputNamePrefix}_${propName}"]`);

                    $selectNode.addEventListener('change', () => {
                        if (!this._pannerNode) {
                            return;
                        }
                        const pannerNode = this._pannerNode;

                        const selectedIndex = $selectNode.selectedIndex;
                        const $options = $selectNode.querySelectorAll('option');
                        const $selectedOption = $options[selectedIndex];

                        pannerNode[propName] = $selectedOption.value;
                    });
                }
            }

            this._params = _params;      
        }


        setPannerNode(pannerNode) {
            const _params = this._params;
            

            for (const [propName, prop] of properties.entries()) {
                if (prop.type === 'text') {
                    const $inputNode = _params.parent.querySelector(`input[name="${_params.inputNamePrefix}_${propName}"]`);
                    $inputNode.value = pannerNode[propName];
                }

                if (prop.type === 'select') {
                    const $selectNode = _params.parent.querySelector(`select[name="${_params.inputNamePrefix}_${propName}"]`);
                    $selectNode.value = pannerNode[propName];
                }
            }

            this._pannerNode = pannerNode;
        }
    }


    return _Class;


})();
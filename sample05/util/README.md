## PannerNodeInspector.js

[WebAudio PannerNode](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode)のプロパティを表示、編集するためのウィンドウを表示するモジュール

使い方
```
const pannerNodeInspector = new PannerNodeInspector({
    title: 'My Inspector'
});

const pannerNode = audioContext.createPanner();
pannerNodeInspector.setPannerNode(pannerNode);
```

## TransfromInspector.js
[Three.js](https://threejs.org/)のオブジェクトのposition,rotationを表示、編集するためのウィンドウを表示するモジュール

使い方
```
const mesh = new THREE.Mesh(......)
...
const transformInspector = new TransfromInspector({
    title: `Speaker's position & rotation`
});

transformInspector.setObject(mesh);

const clock = new THREE.Clock();
const updateFrame = () => {
    const delta = clock.getDelta();
    ....
    ....
    transformInspector.update(delta);

    requestAnimationFrame(updateFrame);
};
updateFrame();

```
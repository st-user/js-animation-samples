let objectCounter = 0;
class UnityInstanceWrapper {

    static invoke(methodName, argument) {
        if (!window.unityInstance) {
            return;
        }
        unityInstance.SendMessage('JavaScriptProxy', methodName, argument);
    }
}

window.addEventListener('dragover', event => {
    event.preventDefault();
});

window.addEventListener('drop', event => {
    event.preventDefault();

    const files = event.dataTransfer.files;
    if (!files || !files[0]) {
        return;
    }
    objectCounter++;
    const file = files[0];
    const objectName = `vrm_object_${objectCounter}`;
    const objectURL = URL.createObjectURL(file);

    UnityInstanceWrapper.invoke('LoadVrm', JSON.stringify({
        objectName: objectName,
        objectURL: objectURL
    }));
});

const setUpChangeAnimationEvent = (id, flag) => {
    const $button = document.querySelector('#' + id);
    $button.addEventListener('click', () => {
        UnityInstanceWrapper.invoke("ChangeAnimation", flag);
    });
};

setUpChangeAnimationEvent('stop', 'isBreathing');
setUpChangeAnimationEvent('walk', 'isWalking');
setUpChangeAnimationEvent('swing', 'isSwinging');
setUpChangeAnimationEvent('turn', 'isTurning');

const $unityContainer = document.querySelector('#unityContainer');
const aspectRatio = 960 / 540;
const onResize = () => {
    const width = window.innerWidth;
    const height = width * (1 / aspectRatio);

    $unityContainer.width = width;
    $unityContainer.height = height;
}
window.addEventListener('resize', onResize);
onResize();

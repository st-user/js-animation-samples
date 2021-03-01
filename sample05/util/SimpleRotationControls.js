const SimpleRotationControls = (() => { // eslint-disable-line no-unused-vars


    class _Class {

        constructor(camera) {

            window.addEventListener('keydown', event => {

                switch(event.key) {
                case 'ArrowUp':
                    camera.rotation.x += 0.1;
                    break;
                case 'ArrowDown':
                    camera.rotation.x -= 0.1;
                    break;
                case 'ArrowLeft':
                    camera.rotation.y += 0.1;
                    break;
                case 'ArrowRight':
                    camera.rotation.y -= 0.1;
                    break;
                default:
                    return;
                }
            });

        }


        update() {

        }
    }


    return _Class;
})();
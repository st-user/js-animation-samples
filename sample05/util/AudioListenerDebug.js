const AudioListenerDebug = (() => {

    return {

        debugObject: obj => {
            console.log(`position: ${obj.position.toArray()}`);
            console.log(`rotation: ${obj.rotation.toArray()}`);
            console.log(`quaternion: ${obj.quaternion.toArray()}`);
        },

        debug: audioContext => {
            if (!audioContext) {
                return;
            }
            const listener = audioContext.listener;
            const positionX = listener.positionX.value;
            const positionY = listener.positionY.value;
            const positionZ = listener.positionZ.value;

            const forwardX = listener.forwardX.value;
            const forwardY = listener.forwardY.value;
            const forwardZ = listener.forwardZ.value;

            const upX = listener.upX.value;
            const upY = listener.upY.value;
            const upZ = listener.upZ.value;

            console.log(`position: (${positionX}, ${positionY}, ${positionZ})`);
            console.log(`forward: (${forwardX}, ${forwardY}, ${forwardZ})`);
            console.log(`up: (${upX}, ${upY}, ${upZ})`);
            console.log(`forward [dot] up = ${forwardX * upX + forwardY * upY + forwardZ * upZ}`);
            console.log(`forward [cross] up = (${forwardY * upZ - forwardZ * upY}, ${forwardZ * upX - forwardX * upZ}, ${forwardX * upY - forwardY * upX})`);

            const cross = new THREE.Vector3();
            cross.set(forwardY * upZ - forwardZ * upY, forwardZ * upX - forwardX * upZ, forwardX * upY - forwardY * upX);
            cross.normalize();
            console.log(`forward [cross] up (normalized)= ${cross.toArray()}`);

        }
    };

})();
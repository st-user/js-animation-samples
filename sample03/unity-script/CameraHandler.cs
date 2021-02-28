using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraHandler : MonoBehaviour {

    // Yの高さは1.5くらいがいい感じ

    private Transform cameraTransform;

    public float moveSensitivity = 0.05f;
    public float rotateSensitivity = 0.1f;

    void Start() {
        this.cameraTransform = GameObject.Find("MainCamera").transform;
    }

    void Update() {

        if (Input.GetKey(KeyCode.UpArrow)) {
            Move(1f);
        }

        if (Input.GetKey(KeyCode.DownArrow)) {
            Move(-1f);
        }

        if (Input.GetKey(KeyCode.RightArrow)) {
            Rotate(1f);
        }

        if (Input.GetKey(KeyCode.LeftArrow)) {
            Rotate(-1f);
        }
    }

    private void Move(float direction) {

        Vector3 currentForward = cameraTransform.forward;

        Vector3 currentPosition = cameraTransform.position;

        Vector3 newPosition = new Vector3(
            currentPosition.x + currentForward.x * direction * moveSensitivity,
            currentPosition.y,
            currentPosition.z + currentForward.z * direction * moveSensitivity
        );

        cameraTransform.position = newPosition;
    }

    private void Rotate(float direction) {

        Quaternion currentQuaternion = cameraTransform.rotation;

        Quaternion rotate = Quaternion.AngleAxis(
            direction * rotateSensitivity,
            new Vector3(0f, 1f, 0f)
        );

        cameraTransform.rotation = currentQuaternion * rotate;
    }

}

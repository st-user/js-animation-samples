using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TestHandler : MonoBehaviour {

    public int vrmCount = 6;
    public string vrmFileURL = "http://localhost:8080/.vrm/sample.vrm";

    private LoadVrm loadVrm;
    private ChangeAnimation changeAnimation;
    private int vrmCounter = 0;

    void Start() {
        loadVrm = new LoadVrm(transform);
        changeAnimation = new ChangeAnimation();
        for (int i = 0; i < vrmCount; i++) {
            executeRequestCoroutine();
        }
    }

    void executeRequestCoroutine() {

        string objectName = "vrm_object_" + (vrmCounter + 1);
        vrmCounter++;

        StartCoroutine(loadVrm.Delegate(objectName, vrmFileURL));
        changeAnimation.AddObjectName(objectName);
    }

    void Update() {

        if (Input.GetKey(KeyCode.A)) {
            changeAnimation.Delegate(changeAnimation.animationFlags[0]);
        }

        if (Input.GetKey(KeyCode.B)) {
            changeAnimation.Delegate(changeAnimation.animationFlags[1]);
        }

        if (Input.GetKey(KeyCode.C)) {
            changeAnimation.Delegate(changeAnimation.animationFlags[2]);
        }

        if (Input.GetKey(KeyCode.D)) {
            changeAnimation.Delegate(changeAnimation.animationFlags[3]);
        }
    }
}

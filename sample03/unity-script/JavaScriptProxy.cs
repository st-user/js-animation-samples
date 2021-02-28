using System;
﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using VRM;

public class JavaScriptProxy : MonoBehaviour {

    private LoadVrm loadVrm;
    private ChangeAnimation changeAnimation;

    void Start() {
        GameObject g = GameObject.Find("RuntimeAttachment");
        this.loadVrm = new LoadVrm(g.transform);
        this.changeAnimation = new ChangeAnimation();
    }

    public void LoadVrm(string paramJson) {
        LoadVrm.LoadVrmParam param = JsonUtility.FromJson<LoadVrm.LoadVrmParam>(paramJson);
        StartCoroutine(loadVrm.Delegate(param.objectName, param.objectURL));
        changeAnimation.AddObjectName(param.objectName);
    }

    public void ChangeAnimation(string animationFlag) {
        changeAnimation.Delegate(animationFlag);
    }


}

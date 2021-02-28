using System;
﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ChangeAnimation {

    // TODO WebGLにビルドすることを想定する場合でも、thread safeにする何らか措置は必要か
    private List<string> objectNames = new List<string>();
    // Visible for testing
    public string[] animationFlags = {
        "isBreathing",
        "isWalking",
        "isSwinging",
        "isTurning"
    };

    public void AddObjectName(string objectName) {
        objectNames.Add(objectName);
    }

    public void Delegate(string animationFlag) {
        foreach (string objectName in objectNames) {
            GameObject go = GameObject.Find(objectName);
            Animator animator = go.GetComponent<Animator>();

            if (animator == null) {
                continue;
            }

            foreach (string _animationFlag in animationFlags) {
                if (_animationFlag == animationFlag) {
                    animator.SetBool(_animationFlag, true);
                } else {
                    animator.SetBool(_animationFlag, false);
                }
            }
        }
    }
}

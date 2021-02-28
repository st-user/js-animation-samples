using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class AnimationTransitionHandler : MonoBehaviour {

    void Start() {
        Animator animator = GetComponent<Animator>();
        RuntimeAnimatorController controller = GameObject.Find("RuntimeAttachment")
            .GetComponent<Animator>().runtimeAnimatorController;
        animator.runtimeAnimatorController = controller;
    }

}

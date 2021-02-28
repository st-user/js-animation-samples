using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SimpleTestPose : MonoBehaviour {

    private Animator animator;
    private List<BoneRotation> boneRotations;

    void Start() {

        this.animator = GetComponent<Animator>();
        this.boneRotations = new List<BoneRotation>();

        /* 胴体 */
        this.boneRotations.Add(
            new BoneRotation(
                this.ForName(HumanBodyBones.Neck),
                20f, 0.1f, 60f, new Vector3(0f, 1f, 0f)
            )
        );

        /* 腕*/
        this.boneRotations.Add(
            new BoneRotation(
                this.ForName(HumanBodyBones.LeftUpperArm),
                20f, 0.1f, 30f, new Vector3(0f, 0f, 1f)
            )
        );
        this.boneRotations.Add(
            new BoneRotation(
                this.ForName(HumanBodyBones.RightUpperArm),
                20f, 0.1f, 30f, new Vector3(0f, 0f, 1f)
            )
        );

        /* 脚 */
        this.boneRotations.Add(
            new BoneRotation(
                this.ForName(HumanBodyBones.LeftUpperLeg),
                20f, 0.1f, 20f, new Vector3(1f, 0f, 0f)
            )
        );
        this.boneRotations.Add(
            new BoneRotation(
                this.ForName(HumanBodyBones.RightUpperLeg),
                20f, 0.1f, -20f, new Vector3(1f, 0f, 0f)
            )
        );


        foreach(BoneRotation br in this.boneRotations) {
            br.SetDefault();
        }
    }


    void Update() {
        foreach(BoneRotation br in this.boneRotations) {
            br.Animate();
        }
    }

    private Transform ForName(HumanBodyBones name) {
        return this.animator.GetBoneTransform(name);
    }
}

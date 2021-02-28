using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SimpleWaitPose : MonoBehaviour {

    private Animator animator;
    private List<BoneRotation> boneRotations;

    void Start() {

        this.animator = GetComponent<Animator>();
        this.boneRotations = new List<BoneRotation>();

        /* 胴体 */
        this.boneRotations.Add(
            new BoneRotation(
                this.ForName(HumanBodyBones.Spine),
                8f, 0.02f, 0, new Vector3(0f, 1f, 0f)
            )
        );
        this.boneRotations.Add(
            new BoneRotation(
                this.ForName(HumanBodyBones.Neck),
                3f, 0.01f, 0, new Vector3(0f, 1f, -1f)
            )
        );

        /* 腕 */
        this.boneRotations.Add(
            new BoneRotation(
                this.ForName(HumanBodyBones.LeftUpperArm),
                3f, 0.01f, 50f, new Vector3(0f, 0f, 1f)
            )
        );
        this.boneRotations.Add(
            new BoneRotation(
                this.ForName(HumanBodyBones.LeftLowerArm),
                2f, 0.05f, 10f, new Vector3(0f, 1f, 1f)
            )
        );
        this.boneRotations.Add(
            new BoneRotation(
                this.ForName(HumanBodyBones.RightUpperArm),
                3f, -0.01f, -50f, new Vector3(0f, 0f, 1f)
            )
        );
        this.boneRotations.Add(
            new BoneRotation(
                this.ForName(HumanBodyBones.RightLowerArm),
                2f, -0.05f, -10f, new Vector3(0f, 1f, 1f)
            )
        );

        /* 脚 */
        this.boneRotations.Add(
            new BoneRotation(
                this.ForName(HumanBodyBones.LeftUpperLeg),
                2.5f, 0.01f, 0f, new Vector3(1f, -0.1f, 0f)
            )
        );
        this.boneRotations.Add(
            new BoneRotation(
                this.ForName(HumanBodyBones.LeftLowerLeg),
                2f, -0.01f, 10f, new Vector3(1f, 0.1f, 0f)
            )
        );
        this.boneRotations.Add(
            new BoneRotation(
                this.ForName(HumanBodyBones.RightUpperLeg),
                2.5f, -0.01f, 0f, new Vector3(-0.1f, 1f, 0f)
            )
        );
        this.boneRotations.Add(
            new BoneRotation(
                this.ForName(HumanBodyBones.RightLowerLeg),
                2f, 0.01f, 0f, new Vector3(-0.1f, -1f, 0f)
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

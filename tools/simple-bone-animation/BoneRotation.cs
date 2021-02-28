using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BoneRotation {

    private Transform boneTransform;

    private float rotationAngleMax;
    private float rotationAngleStep;
    private Vector3 rotationAxis;

    private float currentAngle = 0;
    private float defaultAngle;

    public BoneRotation(
            Transform boneTransform,
            float rotationAngleMax,
            float rotationAngleStep,
            float defaultAngle,
            Vector3 rotationAxis) {
        this.boneTransform = boneTransform;
        this.rotationAngleMax = rotationAngleMax;
        this.rotationAngleStep = rotationAngleStep;
        this.defaultAngle = defaultAngle;
        this.rotationAxis = rotationAxis;
    }

    public void SetDefault() {
        this.Rotate(this.defaultAngle);
    }

    public void Animate() {

        this.currentAngle = this.currentAngle + this.rotationAngleStep;

        this.Rotate(this.rotationAngleStep);

        if (this.rotationAngleMax <= this.currentAngle
                || this.currentAngle <= -this.rotationAngleMax) {
            this.rotationAngleStep = -this.rotationAngleStep;
        }
    }

    private void Rotate(float angleToAdd) {

        Quaternion _q = this.boneTransform.localRotation;
        Quaternion q = Quaternion.AngleAxis(angleToAdd, this.rotationAxis);

        this.boneTransform.localRotation = _q * q;
    }
}

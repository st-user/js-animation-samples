using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using static VrmAnimationJson;
using System.IO;
using System;


public class BoneTransformJsonDumper {

    private GameObject gameObject;
    private Animator animator;
    private string destinationDirectory;
    private string fileNamePrefix;

    public BoneTransformJsonDumper(GameObject gameObject, string destinationDirectory, string fileNamePrefix) {
        this.gameObject = gameObject;
        this.animator = gameObject.GetComponent<Animator>();
        this.destinationDirectory = destinationDirectory;
        this.fileNamePrefix = fileNamePrefix;
    }

    public void DumpJson(int fileNumber) {
        string jsonText = JsonUtility.ToJson (this.ToJsonObject(fileNumber));
        string filePath = this.destinationDirectory + Path.DirectorySeparatorChar + this.fileNamePrefix + fileNumber + ".json";
        File.WriteAllText(filePath, jsonText);
    }

    private VrmAnimationJson LoadBone() {
        VrmAnimationJson anime = new VrmAnimationJson();
        for (int i = 0; i <= 54; i++) {
            anime.vrmAnimation.Add (new VrmAnimation ());
            anime.vrmAnimation[i].keys.Add (new Key ());
        }
        return anime;
    }

    private VrmAnimationJson ToJsonObject(int fileNumber) {
        VrmAnimationJson anime = this.LoadBone();

        for (int i = 0; i <= 54; i++) {
            HumanBodyBones currentBone = (HumanBodyBones)i;
            Transform bone = gameObject.GetComponent<Animator> ().GetBoneTransform (currentBone);
            if (bone == null) continue;
            float[] pos = new float[3] { bone.localPosition.x, bone.localPosition.y, bone.localPosition.z };
            float[] rot = new float[4] { bone.localRotation.x, bone.localRotation.y, bone.localRotation.z, bone.localRotation.w };
            float[] scl = new float[3] { bone.localScale.x, bone.localScale.y, bone.localScale.z };
            anime.vrmAnimation[i].name = "" + i;
            anime.vrmAnimation[i].bone = bone.name;
            anime.vrmAnimation[i].humanoidBoneName = Enum.GetName(typeof(HumanBodyBones), currentBone);;
            anime.vrmAnimation[i].keys[0] = new Key (pos, rot, scl, fileNumber);
        }

        return anime;
    }
}

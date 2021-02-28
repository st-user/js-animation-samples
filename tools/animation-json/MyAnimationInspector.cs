using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using VRM;

// アニメーションをコマ送り風に再生して確認する
// Humanoidのアニメーション時のボーン情報をJSON出力する
// ために使用
public class MyAnimationInspector : MonoBehaviour {

    public int maxFrameIndexStartsWithZero = 34;
    public string clip = "Base Layer.Walk";
    public float fps = 30f;
    public int secondsForEachFrame = 1;
    public bool dumpJson = false;
    public string destinationDirectory;
    public string fileNamePrefix = "anim_";
    public string gameObjectName;

    private Animator animator;
    private Avatar avatar;
    private BoneTransformJsonDumper jsonDumper;

    private bool isFrameAdvance = false;
    private int currentAnimationFrameIndex = 0;
    public const string key_moveToRec = "moveToRec";
    private int frameCounter = 0;
    private int dumpedAnimationFrameLastIndex = -1;

    void Start() {
        this.animator = GetComponent<Animator>();
        this.jsonDumper = new BoneTransformJsonDumper(
            GameObject.Find(this.gameObjectName),
            this.destinationDirectory,
            this.fileNamePrefix);
    }

    void Update() {

        if (Input.GetKey(KeyCode.R)) {
            this.currentAnimationFrameIndex = 0;
            this.frameCounter = 0;
            this.animator.SetBool(key_moveToRec, true);
            this.isFrameAdvance = true;
        }

        if (Input.GetKey(KeyCode.Escape)) {
            this.animator.SetBool(key_moveToRec, false);
            this.isFrameAdvance = false;
        }

        if (this.isFrameAdvance) {

            int animationFrameIndex = this.currentAnimationFrameIndex % (this.maxFrameIndexStartsWithZero + 1);
            float time = ((float)animationFrameIndex) / this.fps;
            this.animator.PlayInFixedTime(this.clip, 0, time);

            if (this.dumpJson && this.dumpedAnimationFrameLastIndex < animationFrameIndex) {
                this.dumpedAnimationFrameLastIndex++;
                Debug.Log("do recode : " + this.dumpedAnimationFrameLastIndex + " - " + time);
                jsonDumper.DumpJson(this.dumpedAnimationFrameLastIndex + 1);
            }

            if (this.frameCounter % (this.secondsForEachFrame * 60) == 0) {
                this.frameCounter = 0;
                this.currentAnimationFrameIndex++;
            }

            this.frameCounter++;
        }
    }

}

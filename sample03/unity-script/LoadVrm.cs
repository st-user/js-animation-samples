using System;
﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using VRM;

public class LoadVrm {

    [Serializable]
    public class LoadVrmParam {
        public string objectName;
        public string objectURL;
    }

    private Transform transform;
    // TODO WebGLにビルドすることを想定する場合でも、thread safeにする何らか措置は必要か
    private int vrmCounter = 0;

    public LoadVrm(Transform transform) {
        this.transform = transform;
    }

    public IEnumerator Delegate(string name, string url) {
        VRMImporterContext context = new VRMImporterContext();

        UnityWebRequest request = UnityWebRequest.Get(url);
        Debug.Log("Request start");

        yield return request.SendWebRequest();
        Debug.Log("Request end");

        if (request.isHttpError || request.isNetworkError) {
            Debug.Log(request.error);
        } else {
            Debug.Log(request.downloadedBytes);

            context.ParseGlb(request.downloadHandler.data);
            context.Load();

            GameObject root = context.Root;
            root.name = name;

            root.transform.SetParent(transform, false);

            root.transform.position = calcPosition();
            Quaternion _q = root.transform.rotation;
            Quaternion q = Quaternion.AngleAxis(180, new Vector3(0f, 1f, 0f));
            root.transform.rotation = _q * q;

            context.ShowMeshes();

            GameObject go = root.transform.gameObject;
            SetUpGameObject(go);

            vrmCounter++;
        }
    }

    private Vector3 calcPosition() {
        float xPos = 0f;
        if (vrmCounter % 3 == 1) {
            xPos = -1f;
        }
        if (vrmCounter % 3 == 2) {
            xPos = 1f;
        }
        float x = xPos * -2f;
        float z = (float)(vrmCounter / 3) * -1.5f;
        return new Vector3(x, 0.3f, z);
    }

    public virtual void SetUpGameObject(GameObject go) {
        go.AddComponent<AnimationTransitionHandler>();
    }
}

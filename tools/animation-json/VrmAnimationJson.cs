using System;
using System.Collections;
using System.Collections.Generic;

[Serializable]
public class VrmAnimationJson {

    public List<VrmAnimation> vrmAnimation = new List<VrmAnimation> ();

    [Serializable]
    public class VrmAnimation {
        public string name = "";
        public string bone = "";
        public string humanoidBoneName = "";
        public List<Key> keys = new List<Key> ();
    }

    [Serializable]
    public class Key {
        public float[] pos;
        public float[] rot;
        public float[] scl;
        public long time;

        public Key (float[] pos, float[] rot, float[] scl, long time) {
            this.pos = pos;
            this.rot = rot;
            this.scl = scl;
            this.time = time;
        }

        public Key () { }
    }
}

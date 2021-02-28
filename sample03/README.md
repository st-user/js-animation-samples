# Unity WebGLビルドを利用しVRMモデルをアニメーションさせるサンプル

### Unityにおけるビルド方法
概ね以下のようにしてscriptなどを配置したのち、ビルドします。

 - [UniVRM](https://github.com/vrm-c/UniVRM)パッケージが必要です。
 - unity-scriptのscriptをアセットに追加
 - [『VRMお人形遊び』用アニメーションデータ詰め合わせ](https://booth.pm/ja/items/1655686)のアニメーションデータをアセットに追加
 - Animator Controllerを作成し、StateやTransition,Conditionを作成(現状では、Walk, Turn, Swing, Stopの4つのStateに対して、それぞれisWalking, isTurning, isSwinging, isBreathingのconditionで遷移させている)
 - MainCamera(name="MainCamera")にCameraHandler.csを追加
 - JavaScriptProxyという名前のGameObjectを作成し、JavaScriptProxy.csを追加
 - RuntimeAttachmentという名前のGameObjectを作成し、上記で作成したAnimator Controllerを割り当てる
 - Unity上で動作確認する場合、TestHandler.csをJavaScriptProxyなどのGameObjectに追加する(ただし、VRMファイルをserveするweb serverが必要)。

### Unityでのビルド後のjavascriptなどの配置
 - 「Build」をdist(main.jsなどがあるディレクトリ)に配置

# js-animation-samples
Javascriptのアニメーションなどのサンプル集

## 使用方法

インストール
```
git clone https://github.com/st-user/js-animation-samples.git
cd js-animation-samples
npm install
```

サーバー起動
```
node server.js
```
VRMファイルそのものは同梱していないため、ご自身で用意してください。基本的にはどのサンプルもブラウザウィンドウにDrag&Dropすることにより、シーンにモデルが追加されるようになっています。

*動作確認したブラウザ：Google Chrome時点最新バージョン

## sample01
three.jsを使用したVRMファイルのアニメーションのサンプル
```
http://localhost:8080/sample01
```

## sample02
WebAudioを使用した、VRMモデルの口を動かすアニメーションのサンプル。
現状は、音の大きさに合わせて口を開閉するだけの簡易なものである。sample01と同様、VRMファイルを使用する

```
http://localhost:8080/sample02
```

## sample03
Unity WebGLビルドを利用しVRMモデルをアニメーションさせるサンプル。ビルド方法などの詳細については、[本サンプルのディレクトリ](https://github.com/st-user/js-animation-samples/tree/master/sample03)に記載。
```
http://localhost:8080/sample03
```


## sample04
Headlessブラウザを利用したレンダリングの実験。Headlessブラウザをサーバーサイドに配置し、サーバーサイドで3Dのレンダリングをさせるような状況をイメージしている。

 - Headlessブラウザ上でWebGL(three.js)を動作させ、3Dグラフィックをレンダリングする。
 - クライアント(通常のhtmlページ)では、そのレンダリング結果を動画として表示する
 - クライアントの側で、Drag&Dropを行ってVRMモデルを反映させたり、画面操作によりモデルをアニメーションさせたりする。
 - クライアント-Headlessブラウザ間はWebRTCで接続。(現状localhostでのみ動作。)
 - Headlessブラウザは、Chrome([Puppeteer](https://pptr.dev/))を使用。

サーバー起動後、Headlessブラウザを起動
```
node ./sample04/headless.js
```

htmlページにアクセス
```
http://localhost:8080/sample04

```

## sample05

[WebAudio PannerNode](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode)を用いた、立体的なサウンドを体感するサンプル。ステレオ再生ができるヘッドフォン、イヤホンなどを使用して確認する。視点（＝カメラ＝[Listener](https://developer.mozilla.org/en-US/docs/Web/API/AudioListener)）の移動や、音源（＝Speaker）の移動により音量やLRの聞こえ方が変わる。Inspectorウィンドウを使用してパラメータの変化による聞こえ方の変化も体感できる。

```
http://localhost:8080/sample05

```

なお、ブラウザネイティブのAPIをそのまま使用したバージョンと、Three.jsの[PositionalAudio](https://threejs.org/docs/index.html#api/en/audio/PositionalAudio)を使用したバージョンの2つがある。Three.jsの方を使用する場合、index.htmlを以下の通り書き換える。
```
        <script src="main.js"></script>
        <!--<script src="main_use_threejs_positionalaudio.js"></script>-->
```
↓↓↓↓↓↓
```
        <!--<script src="main.js"></script>-->
        <script src="main_use_threejs_positionalaudio.js"></script>
```


## 参考サイトなど

 - [three.js](https://threejs.org/)
 - [three-vrm](https://github.com/pixiv/three-vrm)
 - 歩行のアニメーション: [『VRMお人形遊び』用アニメーションデータ詰め合わせ](https://booth.pm/ja/items/1655686)
 - 歩行のアニメーションのUnity→three.jsへの落とし込み: [VRMのモデルをthree.jsで動かしてみた](https://qiita.com/TakenokoTech/items/b3395d8fb26cf3237f15)
 - WebAudioにおける解析のためのAPIについて: [Visualizations with Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)

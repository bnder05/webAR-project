import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const start = async () => {
  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "./targets.mind",
  });

  const { renderer, scene, camera } = mindarThree;
  const anchor = mindarThree.addAnchor(0);

  let mixer;
  let model;
  let idleAction, openAction;

  // تحميل الموديل
  const loader = new GLTFLoader();
  loader.load("./model.glb", (gltf) => {
    model = gltf.scene;
    anchor.group.add(model);

    mixer = new THREE.AnimationMixer(model);
    idleAction = mixer.clipAction(gltf.animations.find(a => a.name.toLowerCase().includes("idle")));
    openAction = mixer.clipAction(gltf.animations.find(a => a.name.toLowerCase().includes("open")));

    idleAction.play();
    openAction.loop = THREE.LoopOnce;
    openAction.clampWhenFinished = true;
  });

  // إعداد الفيديو كنسيج داخل Plane
  const video = document.createElement("video");
  video.src = "./video.mp4";
  video.crossOrigin = "anonymous";
  video.loop = false;
  video.muted = true; // مهم لجعله يعمل على المتصفح بدون تدخل
  video.setAttribute("playsinline", "true");

  const texture = new THREE.VideoTexture(video);
  const videoPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 0.9),
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
  );
  videoPlane.position.set(0, 1.2, 0); // فوق الموديل
  anchor.group.add(videoPlane);
  videoPlane.visible = false;

  // التفاعل عند الضغط
  renderer.domElement.addEventListener("click", () => {
    if (openAction && idleAction) {
      idleAction.stop();
      openAction.reset().play();
      video.currentTime = 0;
      video.play();
      videoPlane.visible = true;
    }
  });

  anchor.onTargetLost = () => {
    video.pause();
    videoPlane.visible = false;
  };

  renderer.setAnimationLoop(() => {
    if (mixer) mixer.update(1 / 60);
    renderer.render(scene, camera);
  });

  await mindarThree.start();
};

start();

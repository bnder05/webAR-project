import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const videoElement = document.getElementById("video-box");

const start = async () => {
  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "targets.mind",
  });

  const { renderer, scene, camera } = mindarThree;

  // إنشاء مجموعة مرتبطة بالصورة
  const anchor = mindarThree.addAnchor(0);

  let mixer;
  const loader = new GLTFLoader();
  let model;
  let idleAction, openAction;

  loader.load("model.glb", (gltf) => {
    model = gltf.scene;
    anchor.group.add(model);

    mixer = new THREE.AnimationMixer(model);

    const animations = gltf.animations;
    idleAction = mixer.clipAction(animations.find(a => a.name.toLowerCase().includes("idle")));
    openAction = mixer.clipAction(animations.find(a => a.name.toLowerCase().includes("open")));

    idleAction.play();
    openAction.clampWhenFinished = true;
    openAction.loop = THREE.LoopOnce;
  });

  // عند الضغط على الموديل
  renderer.domElement.addEventListener('pointerdown', () => {
    if (openAction && idleAction) {
      idleAction.stop();
      openAction.reset().play();
      openAction.onFinished = () => {
        idleAction.play(); // يرجع للوضع الطبيعي بعد الانتهاء إذا رغبت
      };
      // تشغيل الفيديو
      videoElement.style.display = "block";
      videoElement.currentTime = 0;
      videoElement.play();
    }
  });

  // إظهار الفيديو فقط عندما يتم كشف الهدف
  anchor.onTargetFound = () => {
    if (videoElement) videoElement.style.display = "none";
  };
  anchor.onTargetLost = () => {
    if (videoElement) {
      videoElement.pause();
      videoElement.style.display = "none";
    }
  };

  // حلقة التحديث
  renderer.setAnimationLoop(() => {
    if (mixer) mixer.update(1 / 60);
    renderer.render(scene, camera);
  });

  await mindarThree.start();
};

start();

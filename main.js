import 'mind-ar/dist/mindar-image-three.prod.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let mixer, idleAction, openAction, model;
const video = document.getElementById('ar-video');
const yt = document.getElementById('yt-video');
let videoVisible = false;
let useYoutube = false;
let youtubeURL = 'https://www.youtube.com/embed/mwNY_vx1R2M?autoplay=1&controls=1'; // رابط يوتيوب المطلوب

const start = async () => {
  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: 'targets.mind', // المسار الصحيح من public
  });
  const { renderer, scene, camera } = mindarThree;

  // تحميل الموديل
  const loader = new GLTFLoader();
  loader.load('model.glb', (gltf) => {
    model = gltf.scene;
    scene.add(model);
    mixer = new THREE.AnimationMixer(model);
    idleAction = mixer.clipAction(gltf.animations.find(a => a.name.toLowerCase().includes('idle')));
    openAction = mixer.clipAction(gltf.animations.find(a => a.name.toLowerCase().includes('open')));
    idleAction.loop = THREE.LoopRepeat;
    openAction.loop = THREE.LoopOnce;
    openAction.clampWhenFinished = true;
    idleAction.play();
    // إظهار الفيديو مع Idle (حسب المصدر)
    // لا تظهر الفيديو إلا عند اكتشاف التتبع
  });

  // زر التفاعل
  document.getElementById('ar-button').onclick = () => {
    if (openAction && idleAction) {
      idleAction.stop();
      openAction.reset().play();
      openAction.onFinished = () => {
        idleAction.play();
      };
      playVideo();
    }
  };

  // تفاعل مع الموديل
  renderer.domElement.addEventListener('pointerdown', (event) => {
    if (openAction && idleAction) {
      idleAction.stop();
      openAction.reset().play();
      openAction.onFinished = () => {
        idleAction.play();
      };
      playVideo();
    }
  });

  // أزرار اختيار المصدر
  document.getElementById('use-local').onclick = () => {
    useYoutube = false;
  };
  document.getElementById('use-yt').onclick = () => {
    useYoutube = true;
  };

  // إظهار الفيديو فقط عند اكتشاف التتبع
  mindarThree.addEventListener('targetFound', () => {
    if (useYoutube) {
      yt.src = youtubeURL;
      yt.style.display = 'block';
      video.style.display = 'none';
    } else {
      yt.style.display = 'none';
      video.style.display = 'block';
    }
    videoVisible = true;
  });
  mindarThree.addEventListener('targetLost', () => {
    yt.style.display = 'none';
    video.style.display = 'none';
    videoVisible = false;
  });

  function playVideo() {
    if (useYoutube) {
      yt.src = youtubeURL; // إعادة التحميل
    } else {
      video.currentTime = 0;
      video.play();
    }
  }

  // حلقة التحديث
  renderer.setAnimationLoop(() => {
    if (mixer) mixer.update(1/60);
    renderer.render(scene, camera);
  });

  await mindarThree.start();
};

start();

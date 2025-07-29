import 'mind-ar/dist/mindar-image-three.prod.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let mixer, idleAction, openAction, model;
const video = document.getElementById('ar-video');
const yt = document.getElementById('yt-video');
let videoVisible = false;
let useYoutube = false;
let youtubeURL = 'https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1&controls=1'; // عدل الرابط عند الحاجة

const start = async () => {
  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: './public/target.mind', // ضع ملف target المناسب هنا
  });
  const { renderer, scene, camera } = mindarThree;

  // تحميل الموديل
  const loader = new GLTFLoader();
  loader.load('./public/model.glb', (gltf) => {
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
    showVideo();
  });

  // زر التفاعل
  document.getElementById('ar-button').onclick = () => {
    if (openAction && idleAction) {
      idleAction.stop();
      openAction.reset().play();
      openAction.onFinished = () => {
        idleAction.play();
      };
      // تشغيل الفيديو عند الضغط
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
      // تشغيل الفيديو عند الضغط
      playVideo();
    }
  });

  // أزرار اختيار المصدر
  document.getElementById('use-local').onclick = () => {
    useYoutube = false;
    showVideo();
  };
  document.getElementById('use-yt').onclick = () => {
    useYoutube = true;
    showVideo();
  };

  function showVideo() {
    if (useYoutube) {
      yt.src = youtubeURL;
      yt.style.display = 'block';
      video.style.display = 'none';
    } else {
      yt.style.display = 'none';
      video.style.display = 'block';
    }
    videoVisible = true;
  }

  function playVideo() {
    if (useYoutube) {
      yt.contentWindow?.postMessage('play', '*'); // بعض المتصفحات تدعم ذلك
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

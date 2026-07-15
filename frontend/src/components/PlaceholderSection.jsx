import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// ---------------------------------------------------------------
// Zaman çizelgesi — bölüm ekrana girince BİR KEZ oynar, geri sarmaz:
//  0.0 - 1.0   : kapak arkaya doğru açılır (bir daha kapanmaz)
//  1.2 - 7.5   : yiyecekler sırayla kutudan süzülüp gökkuşağına dizilir
//  sonrası     : oldukları yerde hafifçe salınırlar (hover ile dönerler)
// ---------------------------------------------------------------
const EMERGE_START = 1.2;
const EMERGE_GAP = 0.65;
const FLIGHT = 1.7;

// 8 yemek için üst dizilim: gökkuşağı yayı — soldan sağa yükselip alçalır,
// her yemek yayın eğimine uyacak şekilde hafifçe yatar (yelpaze gibi)
const SLOTS = [
  { x: -5.8, y: -0.2, tilt: 0.42 },
  { x: -4.3, y: 1.29, tilt: 0.35 },
  { x: -2.7, y: 2.39, tilt: 0.24 },
  { x: -1.1, y: 2.98, tilt: 0.11 },
  { x: 1.1, y: 2.98, tilt: -0.11 },
  { x: 2.7, y: 2.39, tilt: -0.24 },
  { x: 4.3, y: 1.29, tilt: -0.35 },
  { x: 5.8, y: -0.2, tilt: -0.42 },
];

// Yığın halindeki modeller (meyve tabağı gibi) diğerlerinden geniş
// kapladığı için ayrı ölçek alır — dizideki sıra FOOD_MODELS ile aynı
const BASE_SCALES = [1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.15, 1.5];

// Kutunun içinde bekledikleri yerler (4x2 ızgara) ve içerideki boyutları
const INSIDE_POS = [
  new THREE.Vector3(-0.95, -2.1, 0.35),
  new THREE.Vector3(-0.32, -2.14, -0.3),
  new THREE.Vector3(0.32, -2.08, 0.35),
  new THREE.Vector3(0.95, -2.14, -0.3),
  new THREE.Vector3(-0.95, -2.12, -0.32),
  new THREE.Vector3(-0.32, -2.09, 0.32),
  new THREE.Vector3(0.32, -2.13, -0.33),
  new THREE.Vector3(0.95, -2.1, 0.33),
];
// baseScale 1.5 ile çarpıldığında kutu içi boyut öncekiyle aynı kalır
const INSIDE_SCALE = 0.35;

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// Gerçekçi 3D yemek modelleri: frontend/public/models/ içine atılacak .glb dosyaları.
// Fotogerçekçi sonuç için fotogrametri (3D tarama) modelleri kullanın —
// indirme kaynakları için public/models/OKUBENI.md dosyasına bakın.
const FOOD_MODELS = [
  '/models/donut.glb',
  '/models/ekmek.glb',
  '/models/kruvasan.glb',
  '/models/ekler.glb',
  '/models/sushi.glb',
  '/models/cupcake.glb',
  '/models/fruit.glb',
  '/models/pizza.glb',
];

export default function PlaceholderSection() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    // Hafif yukarıdan bakış: kutunun içindeki yemekler görünsün
    camera.position.set(0, 2.5, 9);
    camera.lookAt(0, 0.25, 0);

    const setSize = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    setSize();
    window.addEventListener('resize', setSize);

    // --- Stüdyo aydınlatması ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const sun = new THREE.DirectionalLight(0xfff4e0, 2.2);
    sun.position.set(4, 8, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -6;
    sun.shadow.camera.right = 6;
    sun.shadow.camera.top = 6;
    sun.shadow.camera.bottom = -6;
    scene.add(sun);

    const fill = new THREE.PointLight(0xd9f8e5, 12, 30);
    fill.position.set(-4, 2.5, 4);
    scene.add(fill);

    // Şeffaf zeminde sadece gölgeyi yakalayan düzlem
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.ShadowMaterial({ opacity: 0.22 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.75;
    ground.receiveShadow = true;
    scene.add(ground);

    // --- Sahne grubu: kutu + yiyecekler imlece birlikte eğilir ---
    const stage = new THREE.Group();
    scene.add(stage);

    // Kutunun altındaki koyu yeşil sunum platformu
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(2.7, 2.9, 0.12, 64),
      new THREE.MeshStandardMaterial({ color: 0x1e4634, roughness: 0.85, metalness: 0.05 })
    );
    pedestal.position.y = -2.66;
    pedestal.receiveShadow = true;
    stage.add(pedestal);

    // --- Pastane kutusu: alçak kraft karton, marka yeşili kurdeleli ---
    const boxGroup = new THREE.Group();
    boxGroup.position.set(0, -2.58, 0);
    stage.add(boxGroup);

    const cardMat = new THREE.MeshStandardMaterial({ color: 0xf3ecdc, roughness: 0.75, metalness: 0.02 });
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.35, metalness: 0.05 });
    const W = 2.8, H = 0.95, D = 2.0, T = 0.06;

    const addPanel = (w, h, d, x, y, z) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), cardMat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      boxGroup.add(mesh);
      return mesh;
    };
    addPanel(W, T, D, 0, 0, 0);                       // taban
    addPanel(W, H, T, 0, H / 2, D / 2 - T / 2);       // ön
    addPanel(W, H, T, 0, H / 2, -D / 2 + T / 2);      // arka
    addPanel(T, H, D, -W / 2 + T / 2, H / 2, 0);      // sol
    addPanel(T, H, D, W / 2 - T / 2, H / 2, 0);       // sağ

    // Kurdele: ön ve arka duvarın üzerinden dikey geçen bant
    const ribbonFront = new THREE.Mesh(new THREE.BoxGeometry(0.26, H, 0.03), ribbonMat);
    ribbonFront.position.set(0, H / 2, D / 2 + 0.02);
    ribbonFront.castShadow = true;
    boxGroup.add(ribbonFront);
    const ribbonBack = ribbonFront.clone();
    ribbonBack.position.z = -D / 2 - 0.02;
    boxGroup.add(ribbonBack);

    // Kapak: üst-arka kenardaki menteşe grubuna bağlı
    const hinge = new THREE.Group();
    hinge.position.set(0, H, -D / 2);
    boxGroup.add(hinge);

    const lid = new THREE.Mesh(new THREE.BoxGeometry(W + 0.08, T, D + 0.08), cardMat);
    lid.position.set(0, T / 2, D / 2);
    lid.castShadow = true;
    hinge.add(lid);

    // Kurdelenin kapak üzerinden geçen parçası (kapakla birlikte açılır)
    const lidRibbon = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.03, D + 0.1), ribbonMat);
    lidRibbon.position.set(0, T + 0.01, D / 2);
    hinge.add(lidRibbon);

    // --- Yiyecekler: gerçek 3D modeller (.glb) ---
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    // Her yemek için önce boş bir tutucu grup oluşturuyoruz; animasyon döngüsü
    // bunları hemen kullanabilir, model yüklenince içine oturur.
    const foods = FOOD_MODELS.map((src, i) => {
      const holder = new THREE.Group();
      holder.userData = {
        mats: [],
        slot: SLOTS[i],
        inside: INSIDE_POS[i],
        idleRot: (i - 3.5) * 0.15, // dik duruşta hafif yön çeşitliliği, hepsi öne bakar

        baseScale: BASE_SCALES[i],
        spin: 0,
        hoverScale: 1,
        hovered: false,
      };
      stage.add(holder);

      gltfLoader.load(
        src,
        (gltf) => {
          const model = gltf.scene;

          // Modeli normalize et: en uzun kenarı ~1.2 birim olacak şekilde
          // ölçekle ve merkezini tutucunun merkezine getir
          const bounds = new THREE.Box3().setFromObject(model);
          const size = bounds.getSize(new THREE.Vector3());
          const center = bounds.getCenter(new THREE.Vector3());
          const s = 1.2 / Math.max(size.x, size.y, size.z);
          model.scale.setScalar(s);
          model.position.sub(center.multiplyScalar(s));

          model.traverse((o) => {
            if (o.isMesh) {
              o.castShadow = true;
              const ms = Array.isArray(o.material) ? o.material : [o.material];
              ms.forEach((m) => {
                m.transparent = true; // 8.5-9.5 sn arasındaki fade için
                holder.userData.mats.push(m);
              });
            }
          });

          // Taramalar masada yatar halde gelir; üst yüzünü kameraya çevirip
          // dik duruşa getiriyoruz (dönüşler yine dikey eksende döner)
          const tilt = new THREE.Group();
          tilt.rotation.x = Math.PI * 0.42;
          tilt.add(model);
          holder.add(tilt);

          // Dokuları ve shader'ları hemen GPU'ya yükle — yoksa model ilk kez
          // ekrana girdiği karede yüklenir ve animasyonu dondurur (kasma)
          holder.userData.mats.forEach((m) => {
            ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap', 'specularColorMap', 'specularIntensityMap'].forEach((k) => {
              if (m[k]) renderer.initTexture(m[k]);
            });
          });
          if (renderer.compileAsync) {
            renderer.compileAsync(holder, camera, scene);
          } else {
            renderer.compile(scene, camera);
          }
        },
        undefined,
        () => console.warn(`3D model bulunamadı: ${src} — dosyayı frontend/public${src} konumuna ekleyin (bkz. public/models/OKUBENI.md)`)
      );
      return holder;
    });

    // --- Fare paralaksı + raycast hover ---
    const mouse = { x: 0, y: 0 };
    const ndc = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    const onPointerMove = (e) => {
      const rect = wrap.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      ndc.set(mouse.x, -mouse.y);
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(foods, true);

      let hoveredRoot = null;
      if (hits.length > 0) {
        let obj = hits[0].object;
        while (obj && !foods.includes(obj)) obj = obj.parent;
        hoveredRoot = obj;
      }
      foods.forEach((f) => { f.userData.hovered = f === hoveredRoot; });
      canvas.style.cursor = hoveredRoot ? 'pointer' : 'default';
    };
    wrap.addEventListener('pointermove', onPointerMove);

    // --- Animasyon döngüsü ---
    const clock = new THREE.Clock();
    let lastT = 0;
    let raf;

    // Bölüm ekrana girene kadar sahne kapalı kutuyla bekler;
    // görünür olduğu anda zaman akmaya başlar ve animasyon bir kez oynar
    let startTime = null;
    const observer = new IntersectionObserver(
      (entries) => {
        if (startTime === null && entries.some((e) => e.isIntersecting)) {
          startTime = clock.getElapsedTime();
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(wrap);

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const dt = elapsed - lastT;
      lastT = elapsed;
      const t = startTime === null ? 0 : elapsed - startTime;

      // Kapak: bölüm görününce bir kez açılır, sayfa yenilenene dek açık kalır
      hinge.rotation.x = t < 1 ? -2.15 * easeInOutQuad(t) : -2.15;

      foods.forEach((f, i) => {
        const start = EMERGE_START + i * EMERGE_GAP;
        const lt = t - start;
        const ud = f.userData;
        f.visible = true;

        let px, py, pz, scale;
        let opacity = 1;

        if (lt <= 0) {
          // Kutunun içinde bekleyiş: yerinde hafif salınım
          const ip = ud.inside;
          px = ip.x;
          py = ip.y + Math.sin(elapsed * 1.8 + i * 2.1) * 0.035;
          pz = ip.z;
          ud.spin = 0;
          f.rotation.y = ud.idleRot;
          f.rotation.z = 0;
          scale = INSIDE_SCALE;
        } else if (lt < FLIGHT) {
          // Kutudan çıkış: içerideki yerinden yükselerek + takla atarak
          // + büyüyerek üst sıradaki yerine kayar
          const k = lt / FLIGHT;
          const rise = easeOutCubic(Math.min(k * 1.5, 1));
          const slide = easeInOutQuad(Math.max(0, (k - 0.35) / 0.65));
          const ip = ud.inside;
          px = ip.x + (ud.slot.x - ip.x) * slide;
          py = ip.y + (ud.slot.y - ip.y) * rise;
          pz = ip.z * (1 - slide);
          ud.spin = k * Math.PI * 4;
          f.rotation.y = ud.idleRot + ud.spin;
          f.rotation.z = Math.sin(k * Math.PI * 2) * 0.4;
          scale = INSIDE_SCALE + (1 - INSIDE_SCALE) * easeOutCubic(Math.min(k * 1.8, 1));
        } else {
          // Gökkuşağında kalıcı salınım; hover'da hızla döner, bırakınca yüzünü döner
          px = ud.slot.x;
          py = ud.slot.y + Math.sin(elapsed * 1.6 + i * 1.3) * 0.08;
          pz = 0;
          if (ud.hovered) {
            ud.spin += dt * 3.4;
          } else {
            const nearestFace = Math.round(ud.spin / (Math.PI * 2)) * Math.PI * 2;
            ud.spin = THREE.MathUtils.lerp(ud.spin, nearestFace, 0.1);
          }
          f.rotation.y = ud.idleRot + ud.spin;
          f.rotation.z = THREE.MathUtils.lerp(f.rotation.z, ud.slot.tilt, 0.08);
          scale = 1;
        }

        // Hover büyümesi sadece gökkuşağına oturduktan sonra
        const settled = lt >= FLIGHT;
        ud.hoverScale = THREE.MathUtils.lerp(ud.hoverScale, settled && ud.hovered ? 1.18 : 1, 0.12);

        f.scale.setScalar(Math.max(scale * ud.hoverScale * ud.baseScale, 0.001));
        f.position.set(px, py, pz);
        ud.mats.forEach((m) => { m.opacity = opacity; });
      });

      // Sahnenin imlece doğru yumuşak eğilmesi (kutu + yiyecekler birlikte)
      stage.rotation.y = THREE.MathUtils.lerp(stage.rotation.y, mouse.x * 0.22, 0.06);
      stage.rotation.x = THREE.MathUtils.lerp(stage.rotation.x, -mouse.y * 0.08, 0.06);

      renderer.render(scene, camera);
    };
    animate();

    // --- Temizlik ---
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', setSize);
      wrap.removeEventListener('pointermove', onPointerMove);
      scene.traverse((o) => {
        if (o.isMesh) {
          o.geometry.dispose();
          const materials = Array.isArray(o.material) ? o.material : [o.material];
          materials.forEach((m) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        }
      });
      dracoLoader.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-brand overflow-hidden flex flex-col border-t border-brand-dark/20">
      {/* Hero ile aynı zemin: gradyan + ışık lekeleri */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand to-brand-dark"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-300/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -left-16 w-96 h-96 bg-green-400/10 rounded-full blur-3xl"></div>

      {/* Başlık */}
      <div className="relative text-center px-4 pt-12 md:pt-16 z-10 pointer-events-none">
        <h2 className="text-xs sm:text-sm text-green-300 font-bold tracking-widest uppercase">Sürprizlerin İçeriği</h2>
        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
          Kutudan Ne Çıkacak?
        </p>
        <p className="mt-3 max-w-xl text-sm sm:text-base text-brand-light/90 mx-auto font-light leading-relaxed">
          Taze fırın ürünlerinden leziz atıştırmalıklara kadar gün sonunda israfı önlenen her sürpriz kutu yepyeni lezzetlerle dolu!
        </p>
      </div>

      {/* 3D sahne */}
      <div ref={wrapRef} className="relative flex-1 z-0">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>

      {/* Alt bilgi */}
      <div className="relative text-center text-xs font-medium text-brand-light/60 pb-6 z-10 pointer-events-none">
        📦 Kutudan süzülen lezzetlerin üzerine gel — sana dönerek cevap verirler
      </div>
    </div>
  );
}

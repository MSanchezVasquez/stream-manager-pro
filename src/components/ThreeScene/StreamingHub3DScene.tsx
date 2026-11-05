import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  createContactShadowTexture,
  createCyberGridTexture,
  createPlatformBadgeTexture,
  createDialTexture,
} from './proceduralTextures';

export type LightingPreset = 'cyber' | 'studio' | 'warm';
export type CameraViewPreset = 'perspective' | 'front' | 'top' | 'isometric';

export interface StreamingNodeData {
  id: string;
  name: string;
  color: string;
  category: string;
  status: string;
  activeAccounts: number;
}

export const PLATFORMS_3D_DATA: StreamingNodeData[] = [
  { id: 'netflix', name: 'Netflix', color: '#E50914', category: 'Premium 4K', status: 'Online', activeAccounts: 18 },
  { id: 'disney', name: 'Disney+', color: '#113CCF', category: 'Family Pack', status: 'Online', activeAccounts: 12 },
  { id: 'prime', name: 'Prime Video', color: '#00A8E1', category: 'Fast Delivery', status: 'Online', activeAccounts: 15 },
  { id: 'max', name: 'HBO Max', color: '#9900FF', category: 'Platinum Tier', status: 'Online', activeAccounts: 9 },
  { id: 'spotify', name: 'Spotify', color: '#1DB954', category: 'Family Plan', status: 'Online', activeAccounts: 14 },
];

interface StreamingHub3DSceneProps {
  lightingPreset: LightingPreset;
  explodedAmount: number; // 0 to 1
  autoRotate: boolean;
  cameraView: CameraViewPreset;
  onSelectNode: (node: StreamingNodeData | null) => void;
  selectedNodeId: string | null;
}

// Pre-allocated math objects to avoid garbage collection in the 60fps loop
const _vec3 = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();

export const StreamingHub3DScene: React.FC<StreamingHub3DSceneProps> = ({
  lightingPreset,
  explodedAmount,
  autoRotate,
  cameraView,
  onSelectNode,
  selectedNodeId,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({
    lightingPreset,
    explodedAmount,
    autoRotate,
    cameraView,
    selectedNodeId,
  });

  // Keep props in sync for render loop
  useEffect(() => {
    propsRef.current = {
      lightingPreset,
      explodedAmount,
      autoRotate,
      cameraView,
      selectedNodeId,
    };
  }, [lightingPreset, explodedAmount, autoRotate, cameraView, selectedNodeId]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let frameId = 0;
    let isDisposed = false;

    // 1. Software WebGL Guard (read from renderer string, not user agent)
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Renderer Setup with PBR standards
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Scene and Horizon Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b0c10');
    scene.fog = new THREE.FogExp2('#0b0c10', 0.038);

    // 4. Camera & OrbitControls
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(7, 6, 9);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent going beneath ground
    controls.minDistance = 3;
    controls.maxDistance = 22;
    controls.target.set(0, 1.8, 0);

    // 5. Mandatory Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 6. Studio 3-Point Lighting Rig (Warm key + Cool hemisphere fill)
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.8);
    keyLight.position.set(6, 10, 6);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x181824, 1.2);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 1.6);
    rimLight.position.set(-6, 5, -6);
    scene.add(rimLight);

    // Core point light for central reactor glow
    const reactorLight = new THREE.PointLight(0x6366f1, 3.5, 8, 1.2);
    reactorLight.position.set(0, 2.2, 0);
    scene.add(reactorLight);

    // 7. Ground Grid & Radial Contact Shadow
    const gridTexture = createCyberGridTexture();
    gridTexture.repeat.set(4, 4);
    const groundGeo = new THREE.PlaneGeometry(32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      map: gridTexture,
      roughness: 0.85,
      metalness: 0.15,
      color: 0x12121a,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = !isSoftwareGl;
    scene.add(groundMesh);

    // Contact shadow plane directly beneath pedestal (y = 0.01 to prevent Z-fighting)
    const contactShadowTexture = createContactShadowTexture();
    const shadowGeo = new THREE.PlaneGeometry(7, 7);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: contactShadowTexture,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.015;
    scene.add(shadowMesh);

    // =========================================================================
    // 8. COMPOSITE 3D HERO MODEL: "Streaming Core Command Hub" (3–12 parts)
    // =========================================================================
    const hubRoot = new THREE.Group();
    hubRoot.position.set(0, 0, 0); // Bottom-center pivot flush with ground
    scene.add(hubRoot);

    // Part 1: Octagonal Beveled Pedestal Base (Bottom layer)
    const baseGroup = new THREE.Group();
    hubRoot.add(baseGroup);

    const baseGeo = new THREE.CylinderGeometry(2.4, 2.7, 0.45, 16);
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a24,
      metalness: 0.85,
      roughness: 0.28,
    });
    const baseMesh = new THREE.Mesh(baseGeo, darkMetalMat);
    baseMesh.position.y = 0.225;
    baseMesh.receiveShadow = !isSoftwareGl;
    baseMesh.castShadow = !isSoftwareGl;
    baseGroup.add(baseMesh);

    // Part 2: Metallic Power Collar with Dial markings
    const dialTexture = createDialTexture();
    const dialGeo = new THREE.CylinderGeometry(2.1, 2.1, 0.18, 32);
    const dialMat = new THREE.MeshStandardMaterial({
      map: dialTexture,
      metalness: 0.9,
      roughness: 0.18,
      color: 0x222230,
    });
    const dialMesh = new THREE.Mesh(dialGeo, dialMat);
    dialMesh.position.y = 0.54;
    dialMesh.castShadow = !isSoftwareGl;
    baseGroup.add(dialMesh);

    // Part 3: Reactor Power Core Housing & Glowing Ring
    const coreHousingGroup = new THREE.Group();
    hubRoot.add(coreHousingGroup);

    const housingGeo = new THREE.CylinderGeometry(1.4, 1.8, 0.7, 16);
    const housingMat = new THREE.MeshStandardMaterial({
      color: 0x14141c,
      metalness: 0.95,
      roughness: 0.12,
    });
    const housingMesh = new THREE.Mesh(housingGeo, housingMat);
    housingMesh.position.y = 1.05;
    housingMesh.castShadow = !isSoftwareGl;
    coreHousingGroup.add(housingMesh);

    // Glowing energy torus ring
    const energyRingGeo = new THREE.TorusGeometry(1.5, 0.08, 16, 48);
    const energyRingMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      emissive: 0x6366f1,
      emissiveIntensity: 2.2,
      roughness: 0.2,
      metalness: 0.8,
    });
    const energyRingMesh = new THREE.Mesh(energyRingGeo, energyRingMat);
    energyRingMesh.rotation.x = Math.PI / 2;
    energyRingMesh.position.y = 1.45;
    coreHousingGroup.add(energyRingMesh);

    // Part 4: Central Floating Quantum Hologram Monolith
    const monolithGroup = new THREE.Group();
    hubRoot.add(monolithGroup);

    const monolithGeo = new THREE.OctahedronGeometry(0.85, 0);
    const monolithMat = new THREE.MeshPhysicalMaterial({
      color: 0x818cf8,
      emissive: 0x4f46e5,
      emissiveIntensity: 1.2,
      metalness: 0.3,
      roughness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.65,
      transparent: true,
      opacity: 0.9,
      ior: 1.7,
      thickness: 1.2,
    });
    const monolithMesh = new THREE.Mesh(monolithGeo, monolithMat);
    monolithMesh.position.y = 2.4;
    monolithMesh.castShadow = !isSoftwareGl;
    monolithGroup.add(monolithMesh);

    // Internal floating energy core
    const innerCoreGeo = new THREE.IcosahedronGeometry(0.42, 1);
    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x38bdf8,
      emissiveIntensity: 3.5,
      roughness: 0.1,
    });
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    innerCoreMesh.position.y = 2.4;
    monolithGroup.add(innerCoreMesh);

    // Part 5: Top Emitter Crown with 4 Quantum Beacons
    const crownGroup = new THREE.Group();
    hubRoot.add(crownGroup);

    const crownCapGeo = new THREE.CylinderGeometry(1.1, 0.4, 0.35, 16);
    const crownCapMat = new THREE.MeshStandardMaterial({
      color: 0x242434,
      metalness: 0.9,
      roughness: 0.22,
    });
    const crownCapMesh = new THREE.Mesh(crownCapGeo, crownCapMat);
    crownCapMesh.position.y = 3.3;
    crownCapMesh.castShadow = !isSoftwareGl;
    crownGroup.add(crownCapMesh);

    // 4 Emitter fins
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const finGeo = new THREE.BoxGeometry(0.12, 0.5, 0.6);
      const finMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        metalness: 0.8,
        roughness: 0.25,
      });
      const finMesh = new THREE.Mesh(finGeo, finMat);
      finMesh.position.set(Math.cos(angle) * 0.9, 3.4, Math.sin(angle) * 0.9);
      finMesh.rotation.y = -angle;
      crownGroup.add(finMesh);
    }

    // Part 6 & 7: Dual Gyroscope Orbiting Rings
    const gimbalOuterGeo = new THREE.TorusGeometry(2.35, 0.05, 12, 64);
    const gimbalOuterMat = new THREE.MeshStandardMaterial({
      color: 0xc9c918, // Coherent with provider / accent gold
      metalness: 0.95,
      roughness: 0.2,
      emissive: 0x7a7a08,
      emissiveIntensity: 0.3,
    });
    const gimbalOuter = new THREE.Mesh(gimbalOuterGeo, gimbalOuterMat);
    gimbalOuter.position.y = 2.4;
    hubRoot.add(gimbalOuter);

    const gimbalInnerGeo = new THREE.TorusGeometry(1.85, 0.04, 12, 64);
    const gimbalInnerMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      metalness: 0.9,
      roughness: 0.25,
    });
    const gimbalInner = new THREE.Mesh(gimbalInnerGeo, gimbalInnerMat);
    gimbalInner.position.y = 2.4;
    hubRoot.add(gimbalInner);

    // =========================================================================
    // Part 8-12: Interactive Satellite Platform Nodes (Orbiting Cards)
    // =========================================================================
    const nodesGroup = new THREE.Group();
    hubRoot.add(nodesGroup);

    const interactiveNodeMeshes: {
      mesh: THREE.Mesh;
      data: StreamingNodeData;
      baseAngle: number;
      orbitRadius: number;
      orbitSpeed: number;
      beamMesh: THREE.Line;
    }[] = [];

    const orbitRadius = 4.3;
    const beamMat = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.35,
    });

    PLATFORMS_3D_DATA.forEach((platform, index) => {
      const angle = (index * Math.PI * 2) / PLATFORMS_3D_DATA.length;
      const texture = createPlatformBadgeTexture(platform.name, platform.color, platform.category);

      const nodeCardGeo = new THREE.BoxGeometry(1.4, 0.7, 0.08);
      const materials = [
        new THREE.MeshStandardMaterial({ color: 0x14141e, metalness: 0.9, roughness: 0.2 }),
        new THREE.MeshStandardMaterial({ color: 0x14141e, metalness: 0.9, roughness: 0.2 }),
        new THREE.MeshStandardMaterial({ color: 0x14141e, metalness: 0.9, roughness: 0.2 }),
        new THREE.MeshStandardMaterial({ color: 0x14141e, metalness: 0.9, roughness: 0.2 }),
        new THREE.MeshStandardMaterial({ map: texture, roughness: 0.25, metalness: 0.35 }), // Front face
        new THREE.MeshStandardMaterial({ color: 0x14141e, metalness: 0.9, roughness: 0.2 }),
      ];

      const nodeMesh = new THREE.Mesh(nodeCardGeo, materials);
      nodeMesh.castShadow = !isSoftwareGl;
      nodeMesh.userData = { isInteractiveNode: true, platformData: platform };

      // Laser conduit beam from center core to node
      const beamGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 2.4, 0),
        new THREE.Vector3(0, 2.4, 0),
      ]);
      const beamLine = new THREE.Line(beamGeo, beamMat.clone());
      scene.add(beamLine);

      nodesGroup.add(nodeMesh);

      interactiveNodeMeshes.push({
        mesh: nodeMesh,
        data: platform,
        baseAngle: angle,
        orbitRadius,
        orbitSpeed: 0.25,
        beamMesh: beamLine,
      });
    });

    // 9. Interactive Raycasting setup
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    let hoveredMesh: THREE.Mesh | null = null;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const targets = interactiveNodeMeshes.map((n) => n.mesh);
      const intersects = raycaster.intersectObjects(targets, false);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const data = clickedMesh.userData.platformData as StreamingNodeData;
        onSelectNode(data);
      } else {
        onSelectNode(null);
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    // 10. Responsive Canvas Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    // 11. Animation Loop with Exponential Damping & Zero GC
    const clock = new THREE.Clock();
    let currentExploded = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (isDisposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function animate() {
      if (isDisposed) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const {
        lightingPreset: activePreset,
        explodedAmount: targetExploded,
        autoRotate: isAutoRotate,
        cameraView: activeCamView,
        selectedNodeId: activeSelectedId,
      } = propsRef.current;

      // Update Lighting Rig based on preset
      if (activePreset === 'cyber') {
        scene.background = new THREE.Color('#08090f');
        if (scene.fog) scene.fog.color.set('#08090f');
        keyLight.color.set(0x38bdf8);
        keyLight.intensity = 2.4;
        hemiLight.color.set(0x818cf8);
        hemiLight.groundColor.set(0x0f172a);
        reactorLight.color.set(0x6366f1);
      } else if (activePreset === 'warm') {
        scene.background = new THREE.Color('#141010');
        if (scene.fog) scene.fog.color.set('#141010');
        keyLight.color.set(0xfbbf24);
        keyLight.intensity = 3.2;
        hemiLight.color.set(0xf59e0b);
        hemiLight.groundColor.set(0x271919);
        reactorLight.color.set(0xef4444);
      } else {
        // 'studio'
        scene.background = new THREE.Color('#0c0d12');
        if (scene.fog) scene.fog.color.set('#0c0d12');
        keyLight.color.set(0xfff5e6);
        keyLight.intensity = 2.8;
        hemiLight.color.set(0xe2e8f0);
        hemiLight.groundColor.set(0x181824);
        reactorLight.color.set(0x6366f1);
      }

      // Smooth Exponential Damping for Exploded View separation
      currentExploded += (targetExploded - currentExploded) * (1 - Math.exp(-8 * delta));

      // Exploded layer separations along Y and radius
      baseGroup.position.y = -currentExploded * 0.45;
      coreHousingGroup.position.y = currentExploded * 0.4;
      monolithGroup.position.y = currentExploded * 1.1;
      crownGroup.position.y = currentExploded * 1.8;

      // Rotate central Monolith & Gyroscopes
      monolithMesh.rotation.y = elapsed * 0.7;
      monolithMesh.rotation.x = Math.sin(elapsed * 0.9) * 0.25;
      innerCoreMesh.rotation.y = -elapsed * 1.4;

      gimbalOuter.rotation.x = elapsed * 0.45;
      gimbalOuter.rotation.y = elapsed * 0.35;
      gimbalInner.rotation.y = -elapsed * 0.6;
      gimbalInner.rotation.z = elapsed * 0.5;

      // Orbiting streaming nodes & laser beams
      interactiveNodeMeshes.forEach((item) => {
        const speed = item.orbitSpeed;
        const currentAngle = item.baseAngle + (isAutoRotate ? elapsed * speed : 0);
        const radius = item.orbitRadius + currentExploded * 2.2;
        const nodeY = 2.4 + Math.sin(elapsed * 1.5 + item.baseAngle) * 0.25;

        item.mesh.position.set(
          Math.cos(currentAngle) * radius,
          nodeY,
          Math.sin(currentAngle) * radius,
        );

        // Make card always face the camera
        item.mesh.lookAt(camera.position);

        // Highlight if selected or hovered
        const isSelected = activeSelectedId === item.data.id;
        const scaleTarget = isSelected ? 1.25 : 1.0;
        item.mesh.scale.lerp(_vec3.set(scaleTarget, scaleTarget, scaleTarget), 0.15);

        // Update beam line positions from core center (0, 2.4, 0) to node
        const beamPositions = item.beamMesh.geometry.attributes.position as THREE.BufferAttribute;
        beamPositions.setXYZ(0, 0, 2.4 + currentExploded * 1.1, 0);
        beamPositions.setXYZ(1, item.mesh.position.x, item.mesh.position.y, item.mesh.position.z);
        beamPositions.needsUpdate = true;
      });

      // Camera preset transitions using exponential damping
      if (activeCamView === 'front') {
        _targetCamPos.set(0, 3.2, 10.5);
        _targetLookAt.set(0, 2.2, 0);
      } else if (activeCamView === 'top') {
        _targetCamPos.set(0, 13, 0.1);
        _targetLookAt.set(0, 1.8, 0);
      } else if (activeCamView === 'isometric') {
        _targetCamPos.set(8.5, 7.5, 8.5);
        _targetLookAt.set(0, 2.0, 0);
      } else {
        // 'perspective'
        _targetCamPos.set(7, 5.5, 8.5);
        _targetLookAt.set(0, 2.0, 0);
      }

      // Smooth damp controls target and camera position if preset view is selected
      if (activeCamView !== 'perspective') {
        camera.position.lerp(_targetCamPos, 0.05);
        controls.target.lerp(_targetLookAt, 0.05);
      }

      // Raycasting hover check
      raycaster.setFromCamera(mouse, camera);
      const targets = interactiveNodeMeshes.map((n) => n.mesh);
      const intersects = raycaster.intersectObjects(targets, false);

      if (intersects.length > 0) {
        const topHit = intersects[0].object as THREE.Mesh;
        if (hoveredMesh !== topHit) {
          hoveredMesh = topHit;
          renderer.domElement.style.cursor = 'pointer';
        }
      } else if (hoveredMesh) {
        hoveredMesh = null;
        renderer.domElement.style.cursor = 'default';
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(animate);
      } else {
        frameId = requestAnimationFrame(animate);
      }
    }

    animate();

    // Cleanup resources strictly
    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);

      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);

      controls.dispose();

      // Dispose geometries & materials
      groundGeo.dispose();
      groundMat.dispose();
      gridTexture.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      contactShadowTexture.dispose();
      baseGeo.dispose();
      darkMetalMat.dispose();
      dialGeo.dispose();
      dialMat.dispose();
      dialTexture.dispose();
      housingGeo.dispose();
      housingMat.dispose();
      energyRingGeo.dispose();
      energyRingMat.dispose();
      monolithGeo.dispose();
      monolithMat.dispose();
      innerCoreGeo.dispose();
      innerCoreMat.dispose();
      crownCapGeo.dispose();
      crownCapMat.dispose();
      gimbalOuterGeo.dispose();
      gimbalOuterMat.dispose();
      gimbalInnerGeo.dispose();
      gimbalInnerMat.dispose();

      interactiveNodeMeshes.forEach((item) => {
        item.mesh.geometry.dispose();
        if (Array.isArray(item.mesh.material)) {
          item.mesh.material.forEach((m) => m.dispose());
        }
        item.beamMesh.geometry.dispose();
        (item.beamMesh.material as THREE.Material).dispose();
      });

      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [onSelectNode]);

  return <div ref={mountRef} className="w-full h-full relative select-none" />;
};

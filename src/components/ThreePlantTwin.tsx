import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlantProfile } from '../types';
import { Eye, RotateCcw, Scan, Play, Pause } from 'lucide-react';

interface ThreePlantTwinProps {
  plant: PlantProfile;
  isWateringAnim?: boolean;
  onRotationChange?: (angleDeg: number) => void;
}

export const ThreePlantTwin: React.FC<ThreePlantTwinProps> = ({
  plant,
  isWateringAnim = false,
  onRotationChange,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHologram, setIsHologram] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // References for three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const plantGroupRef = useRef<THREE.Group | null>(null);
  const soilMeshRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const leavesRef = useRef<THREE.Mesh[]>([]);
  const particlesRef = useRef<THREE.Points | null>(null);
  const reqIdRef = useRef<number>(0);

  const prevMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationVelocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 7.5);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Empty container before appending
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    dirLight.position.set(5, 10, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const rimLight = new THREE.PointLight(0x06b6d4, 1.2, 15);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    const hudUnderlight = new THREE.PointLight(0x10b981, 0.8, 10);
    hudUnderlight.position.set(0, -0.5, 3);
    scene.add(hudUnderlight);

    // 5. Build Plant Hierarchy
    const plantGroup = new THREE.Group();
    plantGroupRef.current = plantGroup;
    scene.add(plantGroup);

    buildPlantModel(plantGroup, plant, isHologram);

    // 6. Water Drop Particles (for watering animation)
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 1] = 2.5 + Math.random() * 2.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.08,
      transparent: true,
      opacity: 0,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    particlesRef.current = particles;
    scene.add(particles);

    // 7. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Auto rotation
      if (plantGroupRef.current) {
        if (autoRotate && !isDragging) {
          plantGroupRef.current.rotation.y += 0.005;
        } else {
          // Inertia damping
          plantGroupRef.current.rotation.y += rotationVelocityRef.current.y;
          plantGroupRef.current.rotation.x += rotationVelocityRef.current.x;
          // Clamp vertical tilt
          plantGroupRef.current.rotation.x = Math.max(-0.4, Math.min(0.4, plantGroupRef.current.rotation.x));
          rotationVelocityRef.current.x *= 0.92;
          rotationVelocityRef.current.y *= 0.92;
        }

        // Slight breathing/sway motion
        leavesRef.current.forEach((leaf, idx) => {
          const sway = Math.sin(elapsedTime * 1.5 + idx * 0.7) * 0.015;
          leaf.rotation.z += sway * 0.1;
        });
      }

      // Water drops animation
      if (particlesRef.current) {
        if (isWateringAnim) {
          particleMat.opacity = Math.min(1, particleMat.opacity + 0.1);
          const pos = particleGeo.attributes.position.array as Float32Array;
          for (let i = 0; i < particleCount; i++) {
            pos[i * 3 + 1] -= 0.08;
            if (pos[i * 3 + 1] < 0.8) {
              pos[i * 3 + 1] = 3.0 + Math.random();
              pos[i * 3] = (Math.random() - 0.5) * 1.4;
              pos[i * 3 + 2] = (Math.random() - 0.5) * 1.4;
            }
          }
          particleGeo.attributes.position.needsUpdate = true;
        } else {
          particleMat.opacity = Math.max(0, particleMat.opacity - 0.05);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(reqIdRef.current);
      resizeObserver.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [plant.speciesType, isHologram]);

  // Update moisture & health dynamic colors and postures when plant data updates
  useEffect(() => {
    if (!plantGroupRef.current) return;
    
    // Soil color based on moisture
    if (soilMeshRef.current && !isHologram) {
      const mat = soilMeshRef.current.material as THREE.MeshStandardMaterial;
      const drySoil = new THREE.Color(0x6e5a44);
      const wetSoil = new THREE.Color(0x20150d);
      const moistureFactor = Math.min(1, Math.max(0, plant.moisturePercent / 100));
      mat.color.copy(drySoil).lerp(wetSoil, moistureFactor);
    }

    // Leaf droop & health tone
    if (leavesRef.current.length > 0 && !isHologram) {
      const healthFactor = plant.healthScore / 100;
      const moistureFactor = plant.moisturePercent / 100;

      const vibrantGreen = new THREE.Color(0x15803d);
      const dehydratedYellow = new THREE.Color(0xca8a04);
      const wiltingBrown = new THREE.Color(0x78350f);

      leavesRef.current.forEach((leaf) => {
        const mat = leaf.material as THREE.MeshStandardMaterial;
        let targetColor = vibrantGreen.clone();

        if (moistureFactor < 0.25) {
          targetColor.lerp(wiltingBrown, 0.45);
        } else if (moistureFactor < 0.45) {
          targetColor.lerp(dehydratedYellow, 0.35);
        }

        if (healthFactor < 0.7) {
          targetColor.lerp(wiltingBrown, (0.7 - healthFactor) * 0.8);
        }

        mat.color.copy(targetColor);
      });
    }
  }, [plant.moisturePercent, plant.healthScore, isHologram]);

  // Helper to construct procedural plant geometry
  function buildPlantModel(group: THREE.Group, p: PlantProfile, holo: boolean) {
    // Clear old children
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
    leavesRef.current = [];

    // --- 1. POT & SAUCER ---
    const potColor = holo ? 0x06b6d4 : 0xe0e7ff; // Matte modern ceramic
    const potMat = new THREE.MeshStandardMaterial({
      color: potColor,
      roughness: holo ? 0.2 : 0.4,
      metalness: holo ? 0.8 : 0.1,
      wireframe: holo,
    });

    // Saucer
    const saucerGeo = new THREE.CylinderGeometry(1.2, 1.1, 0.18, 32);
    const saucerMesh = new THREE.Mesh(saucerGeo, potMat);
    saucerMesh.position.y = 0.09;
    saucerMesh.castShadow = true;
    saucerMesh.receiveShadow = true;
    group.add(saucerMesh);

    // Pot Body
    const potGeo = new THREE.CylinderGeometry(1.1, 0.8, 1.4, 32);
    const potMesh = new THREE.Mesh(potGeo, potMat);
    potMesh.position.y = 0.88;
    potMesh.castShadow = true;
    potMesh.receiveShadow = true;
    group.add(potMesh);

    // Pot Rim
    const rimGeo = new THREE.TorusGeometry(1.12, 0.08, 16, 40);
    const rimMesh = new THREE.Mesh(rimGeo, potMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 1.58;
    group.add(rimMesh);

    // Soil Top
    const soilMat = new THREE.MeshStandardMaterial({
      color: holo ? 0x0891b2 : 0x2b1d12,
      roughness: 0.95,
      metalness: 0.05,
      wireframe: holo,
    });
    const soilGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.1, 32);
    const soilMesh = new THREE.Mesh(soilGeo, soilMat);
    soilMesh.position.y = 1.52;
    soilMesh.receiveShadow = true;
    soilMeshRef.current = soilMesh;
    group.add(soilMesh);

    // Base Hologram Ring (JARVIS HUD Platform)
    if (holo) {
      const ringGeo = new THREE.RingGeometry(1.3, 1.5, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0.02;
      group.add(ringMesh);

      // Outer dashed telemetry circle
      const outerRingGeo = new THREE.RingGeometry(1.7, 1.75, 64);
      const outerRingMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
      });
      const outerRingMesh = new THREE.Mesh(outerRingGeo, outerRingMat);
      outerRingMesh.rotation.x = Math.PI / 2;
      outerRingMesh.position.y = 0.01;
      group.add(outerRingMesh);
    }

    // --- 2. FOLIAGE BY SPECIES ---
    const foliageMat = new THREE.MeshStandardMaterial({
      color: holo ? 0x10b981 : 0x16a34a,
      roughness: holo ? 0.1 : 0.5,
      metalness: holo ? 0.8 : 0.1,
      wireframe: holo,
      side: THREE.DoubleSide,
    });

    const stemMat = new THREE.MeshStandardMaterial({
      color: holo ? 0x059669 : 0x15803d,
      roughness: 0.6,
      wireframe: holo,
    });

    const droopFactor = Math.max(0, (40 - p.moisturePercent) / 60);

    if (p.speciesType === 'fern') {
      // Boston Fern: layered arched fronds
      const frondCount = 18;
      for (let i = 0; i < frondCount; i++) {
        const angle = (i / frondCount) * Math.PI * 2 + Math.random() * 0.2;
        const radius = 0.2 + (i % 3) * 0.15;
        const length = 1.6 + Math.random() * 0.5;
        const arch = 0.6 + (i % 2) * 0.3 + droopFactor * 0.6;

        const frondGroup = new THREE.Group();
        frondGroup.position.set(Math.cos(angle) * radius, 1.55, Math.sin(angle) * radius);
        frondGroup.rotation.y = angle;

        // Arched spine
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0.6 - droopFactor * 0.3, length * 0.45),
          new THREE.Vector3(0, 0.2 - arch * 0.8, length)
        );
        const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.03, 8, false);
        const tubeMesh = new THREE.Mesh(tubeGeo, stemMat);
        frondGroup.add(tubeMesh);

        // Frond leaflets
        const leaflets = 10;
        for (let j = 1; j < leaflets; j++) {
          const t = j / leaflets;
          const pos = curve.getPoint(t);
          const leafWidth = 0.35 * (1 - t * 0.5);

          const leafGeo = new THREE.PlaneGeometry(leafWidth, 0.12);
          const leafL = new THREE.Mesh(leafGeo, foliageMat.clone());
          leafL.position.set(pos.x - leafWidth * 0.45, pos.y, pos.z);
          leafL.rotation.y = Math.PI / 4;
          leafL.rotation.z = 0.2;
          frondGroup.add(leafL);
          leavesRef.current.push(leafL);

          const leafR = new THREE.Mesh(leafGeo, foliageMat.clone());
          leafR.position.set(pos.x + leafWidth * 0.45, pos.y, pos.z);
          leafR.rotation.y = -Math.PI / 4;
          leafR.rotation.z = -0.2;
          frondGroup.add(leafR);
          leavesRef.current.push(leafR);
        }

        group.add(frondGroup);
      }
    } else if (p.speciesType === 'monstera') {
      // Monstera Deliciosa: tall stems with large heart-shaped split leaves
      const stemCount = 7;
      for (let i = 0; i < stemCount; i++) {
        const angle = (i / stemCount) * Math.PI * 2;
        const stemGroup = new THREE.Group();
        stemGroup.position.set(0, 1.55, 0);

        const height = 1.4 + (i % 3) * 0.4;
        const spread = 0.8 + (i % 2) * 0.4;

        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(Math.cos(angle) * (spread * 0.4), height * 0.6, Math.sin(angle) * (spread * 0.4)),
          new THREE.Vector3(Math.cos(angle) * spread, height - droopFactor * 0.4, Math.sin(angle) * spread)
        );

        const stemTube = new THREE.TubeGeometry(curve, 16, 0.045, 8, false);
        const stemMesh = new THREE.Mesh(stemTube, stemMat);
        stemGroup.add(stemMesh);

        // Heart leaf with cutouts
        const endPoint = curve.getPoint(1);
        const leafShape = new THREE.Shape();
        leafShape.moveTo(0, 0);
        leafShape.bezierCurveTo(0.5, 0.4, 0.9, 0.9, 0.4, 1.4);
        leafShape.bezierCurveTo(0.1, 1.7, 0, 1.8, 0, 1.8);
        leafShape.bezierCurveTo(0, 1.8, -0.1, 1.7, -0.4, 1.4);
        leafShape.bezierCurveTo(-0.9, 0.9, -0.5, 0.4, 0, 0);

        const leafGeo = new THREE.ShapeGeometry(leafShape);
        const leafMesh = new THREE.Mesh(leafGeo, foliageMat.clone());
        leafMesh.position.copy(endPoint);
        leafMesh.rotation.x = -Math.PI / 3 + droopFactor * 0.4;
        leafMesh.rotation.y = angle;
        leafMesh.scale.set(0.65, 0.65, 0.65);
        stemGroup.add(leafMesh);
        leavesRef.current.push(leafMesh);

        group.add(stemGroup);
      }
    } else if (p.speciesType === 'snake_plant') {
      // Snake Plant: tall upright sword leaves
      const leafCount = 9;
      for (let i = 0; i < leafCount; i++) {
        const angle = (i / leafCount) * Math.PI * 2;
        const dist = 0.15 + (i % 3) * 0.12;
        const height = 1.8 + Math.random() * 0.8;

        const swordGeo = new THREE.ConeGeometry(0.2, height, 4);
        swordGeo.scale(0.3, 1, 1); // Flatten into leaf blade
        const swordMat = foliageMat.clone();
        swordMat.color = new THREE.Color(holo ? 0x10b981 : 0x14532d);

        const swordMesh = new THREE.Mesh(swordGeo, swordMat);
        swordMesh.position.set(
          Math.cos(angle) * dist,
          1.55 + height / 2,
          Math.sin(angle) * dist
        );
        swordMesh.rotation.y = angle;
        swordMesh.rotation.x = (Math.random() - 0.5) * 0.15 + droopFactor * 0.1;
        swordMesh.rotation.z = (Math.random() - 0.5) * 0.15;
        group.add(swordMesh);
        leavesRef.current.push(swordMesh);
      }
    } else if (p.speciesType === 'peace_lily') {
      // Peace Lily: dense dark green foliage + white flower spadix
      const leafCount = 14;
      for (let i = 0; i < leafCount; i++) {
        const angle = (i / leafCount) * Math.PI * 2;
        const stemGroup = new THREE.Group();
        stemGroup.position.set(0, 1.55, 0);

        const length = 1.3 + Math.random() * 0.4;
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(Math.cos(angle) * 0.4, 0.7, Math.sin(angle) * 0.4),
          new THREE.Vector3(Math.cos(angle) * 0.9, 0.4 - droopFactor * 0.5, Math.sin(angle) * 0.9)
        );

        const stemTube = new THREE.TubeGeometry(curve, 12, 0.03, 8);
        const stemMesh = new THREE.Mesh(stemTube, stemMat);
        stemGroup.add(stemMesh);

        const endPoint = curve.getPoint(1);
        const leafGeo = new THREE.SphereGeometry(0.3, 12, 12);
        leafGeo.scale(0.5, 0.05, 1.2);
        const leafMesh = new THREE.Mesh(leafGeo, foliageMat.clone());
        leafMesh.position.copy(endPoint);
        leafMesh.lookAt(new THREE.Vector3(0, 1.5, 0));
        stemGroup.add(leafMesh);
        leavesRef.current.push(leafMesh);

        group.add(stemGroup);
      }

      // White Flower Spadix
      const flowerStem = new THREE.Group();
      flowerStem.position.set(0, 1.55, 0);
      const flowerCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.1, 1.1, 0.1),
        new THREE.Vector3(0.05, 2.1, 0.05)
      );
      const fStemMesh = new THREE.Mesh(new THREE.TubeGeometry(flowerCurve, 12, 0.03, 8), stemMat);
      flowerStem.add(fStemMesh);

      // White petal hood
      const spatheGeo = new THREE.SphereGeometry(0.35, 16, 16, 0, Math.PI);
      spatheGeo.scale(0.4, 1.1, 0.6);
      const spatheMat = new THREE.MeshStandardMaterial({
        color: holo ? 0x38bdf8 : 0xf8fafc,
        roughness: 0.2,
        side: THREE.DoubleSide,
        wireframe: holo,
      });
      const spatheMesh = new THREE.Mesh(spatheGeo, spatheMat);
      spatheMesh.position.set(0.05, 2.15, 0.05);
      spatheMesh.rotation.y = -Math.PI / 4;
      flowerStem.add(spatheMesh);

      group.add(flowerStem);
    } else {
      // General Succulent / Ficus / Custom: spiral rosette
      const leafCount = 20;
      for (let i = 0; i < leafCount; i++) {
        const phi = i * 137.5 * (Math.PI / 180); // golden angle
        const radius = 0.15 + Math.sqrt(i) * 0.18;
        const yPos = 1.55 + (leafCount - i) * 0.04;

        const leafGeo = new THREE.ConeGeometry(0.25, 0.8, 8);
        leafGeo.scale(0.8, 0.4, 1);
        const leafMesh = new THREE.Mesh(leafGeo, foliageMat.clone());
        leafMesh.position.set(Math.cos(phi) * radius, yPos, Math.sin(phi) * radius);
        leafMesh.rotation.y = phi + Math.PI / 2;
        leafMesh.rotation.x = Math.PI / 3 - droopFactor * 0.3;
        group.add(leafMesh);
        leavesRef.current.push(leafMesh);
      }
    }
  }

  // Pointer drag controls for intuitive 3D rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
    rotationVelocityRef.current = { x: 0, y: 0 };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !plantGroupRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;

    plantGroupRef.current.rotation.y += deltaX * 0.008;
    plantGroupRef.current.rotation.x += deltaY * 0.005;

    rotationVelocityRef.current = {
      x: deltaY * 0.005,
      y: deltaX * 0.008,
    };

    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    if (onRotationChange && plantGroupRef.current) {
      const deg = Math.round((plantGroupRef.current.rotation.y * 180) / Math.PI) % 360;
      onRotationChange(deg < 0 ? deg + 360 : deg);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const resetCamera = () => {
    if (plantGroupRef.current) {
      plantGroupRef.current.rotation.set(0, 0, 0);
      rotationVelocityRef.current = { x: 0, y: 0 };
    }
  };

  return (
    <div className="relative w-full h-[400px] md:h-[480px] rounded-2xl overflow-hidden bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-2xl flex flex-col justify-between">
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      />

      {/* Floating HUD Telemetry Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-1.5">
        <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 px-3 py-1.5 rounded-full text-xs font-mono text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>TWIN ID: #{plant.id.slice(-6).toUpperCase()}</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400 font-semibold">{plant.healthScore}% VITALITY</span>
        </div>

        <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-800/80 w-fit">
          SPECIES: <span className="text-slate-200">{plant.species}</span>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
        {/* Left: Drag rotation instruction */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-950/70 border border-slate-800/70 px-3 py-1.5 rounded-lg">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>DRAG TO ROTATE 360°</span>
        </div>

        {/* Right: Quick toggles */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Hologram Scanner Mode */}
          <button
            onClick={() => setIsHologram(!isHologram)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
              isHologram
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 glow-cyan'
                : 'bg-slate-950/80 text-slate-300 border-slate-700/80 hover:bg-slate-800'
            }`}
            title="Toggle Holographic Scanner Mode"
          >
            <Scan className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">HOLOGRAM</span>
          </button>

          {/* Auto-rotate toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-lg text-xs transition-all border ${
              autoRotate
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-950/80 text-slate-400 border-slate-700/80 hover:bg-slate-800'
            }`}
            title={autoRotate ? 'Pause Orbit' : 'Resume Orbit'}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Reset angle */}
          <button
            onClick={resetCamera}
            className="p-2 rounded-lg text-xs bg-slate-950/80 text-slate-300 border border-slate-700/80 hover:bg-slate-800 transition-all"
            title="Reset Perspective"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

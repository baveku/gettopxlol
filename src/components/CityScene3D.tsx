'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { LeaderboardItemData } from './LeaderboardItem';

interface CityScene3DProps {
  items: LeaderboardItemData[];
  selectedItem: LeaderboardItemData | null;
  onSelectItem: (item: LeaderboardItemData | null) => void;
  cameraMode: 'overview' | 'focusTop1' | 'cinematic';
}

export function CityScene3D({
  items,
  selectedItem,
  onSelectItem,
  cameraMode,
}: CityScene3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const buildingMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const targetCameraPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 40, 130));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 14, 0));
  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 14, 0));
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const orbitAngleRef = useRef({ theta: 0, phi: 0.32 });
  const zoomDistRef = useRef(130);

  // Helper to create glowing billboard with Real Brand Logo Favicon, Rank & Domain Name
  const createRooftopBillboard = (item: LeaderboardItemData, rank: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const isTop1 = rank === 1;
    const isTop2 = rank === 2;
    const isTop3 = rank === 3;

    // Glowing Billboard background
    ctx.fillStyle = isTop1
      ? 'rgba(245, 158, 11, 0.95)'
      : isTop2
      ? 'rgba(241, 245, 249, 0.95)'
      : isTop3
      ? 'rgba(217, 119, 6, 0.95)'
      : 'rgba(15, 23, 42, 0.95)';
    
    // Rounded rect
    const r = 20;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(512 - r, 0);
    ctx.quadraticCurveTo(512, 0, 512, r);
    ctx.lineTo(512, 140 - r);
    ctx.quadraticCurveTo(512, 140, 512 - r, 140);
    ctx.lineTo(r, 140);
    ctx.quadraticCurveTo(0, 140, 0, 140 - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fill();

    // Border
    ctx.lineWidth = 5;
    ctx.strokeStyle = isTop1 ? '#ffffff' : 'rgba(255, 255, 255, 0.5)';
    ctx.stroke();

    // Rank Badge
    ctx.fillStyle = isTop1 ? '#000000' : isTop2 || isTop3 ? '#0f172a' : '#fbbf24';
    ctx.font = '900 34px sans-serif';
    ctx.fillText(`#${rank}`, 22, 85);

    // Icon Box placeholder
    ctx.fillStyle = isTop1 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.arc(115, 70, 36, 0, Math.PI * 2);
    ctx.fill();

    // Initial letter fallback in icon box
    ctx.fillStyle = isTop1 ? '#000000' : '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(item.domain[0].toUpperCase(), 103, 82);

    // Domain text
    ctx.fillStyle = isTop1 ? '#000000' : isTop2 || isTop3 ? '#0f172a' : '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    const cleanName = item.domain.length > 13 ? item.domain.slice(0, 12) + '…' : item.domain;
    ctx.fillText(cleanName, 170, 85);

    const texture = new THREE.CanvasTexture(canvas);

    // Asynchronously load real brand logo favicon
    const faviconSrc = item.faviconUrl || `https://www.google.com/s2/favicons?domain=${item.domain}&sz=128`;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Clear icon circle and draw loaded favicon
      ctx.save();
      ctx.beginPath();
      ctx.arc(115, 70, 34, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(81, 36, 68, 68);
      ctx.drawImage(img, 83, 38, 64, 64);
      ctx.restore();
      texture.needsUpdate = true;
    };
    img.src = faviconSrc;

    return texture;
  };

  // Helper to generate skyscraper facade texture with live click lights
  const createSkyscraperTexture = (rank: number, clickCount: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const isTop1 = rank === 1;
    const isTop2 = rank === 2;
    const isTop3 = rank === 3;

    ctx.fillStyle = isTop1 ? '#181105' : isTop2 ? '#0f172a' : isTop3 ? '#1c1308' : '#080d16';
    ctx.fillRect(0, 0, 256, 512);

    const rows = 36;
    const cols = 8;
    const padX = 5;
    const padY = 3;
    const w = (256 - padX * (cols + 1)) / cols;
    const h = (512 - padY * (rows + 1)) / rows;

    const litChance = Math.min(0.85, 0.4 + (clickCount / 10000) * 0.4);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isLit = Math.random() < litChance;
        if (isLit) {
          if (isTop1) {
            ctx.fillStyle = Math.random() > 0.3 ? '#fbbf24' : '#fffbeb';
          } else if (isTop2) {
            ctx.fillStyle = Math.random() > 0.3 ? '#e2e8f0' : '#38bdf8';
          } else if (isTop3) {
            ctx.fillStyle = Math.random() > 0.3 ? '#f59e0b' : '#fde68a';
          } else {
            ctx.fillStyle = Math.random() > 0.35 ? '#38bdf8' : '#818cf8';
          }
        } else {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        }
        const x = padX + c * (w + padX);
        const y = padY + r * (h + padY);
        ctx.fillRect(x, y, w, h);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  };

  // Adjust camera target
  useEffect(() => {
    if (selectedItem) {
      const group = buildingMeshesRef.current.get(selectedItem.id);
      if (group) {
        const pos = group.position;
        targetCameraPosRef.current.set(pos.x, 32, pos.z + 45);
        targetLookAtRef.current.set(pos.x, 20, pos.z);
        return;
      }
    }

    if (cameraMode === 'focusTop1') {
      const top1 = items[0];
      if (top1) {
        targetCameraPosRef.current.set(0, 38, 55);
        targetLookAtRef.current.set(0, 22, 0);
        return;
      }
    }

    // Default Overview: Grand Panoramic view of all 10 towers
    targetCameraPosRef.current.set(
      Math.sin(orbitAngleRef.current.theta) * zoomDistRef.current,
      Math.sin(orbitAngleRef.current.phi) * zoomDistRef.current + 20,
      Math.cos(orbitAngleRef.current.theta) * zoomDistRef.current
    );
    targetLookAtRef.current.set(0, 14, 0);
  }, [selectedItem, cameraMode, items]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x080c14);
    scene.fog = new THREE.FogExp2(0x080c14, 0.004);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 40, 130);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Bright Vibrant City Lighting
    const ambientLight = new THREE.AmbientLight(0x475569, 3.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffedd5, 3.8);
    dirLight1.position.set(80, 140, 80);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 2.2);
    dirLight2.position.set(-80, 100, -60);
    scene.add(dirLight2);

    const top1Spotlight = new THREE.SpotLight(0xf59e0b, 12, 160, Math.PI / 4, 0.3);
    top1Spotlight.position.set(0, 110, 20);
    top1Spotlight.target.position.set(0, 20, 0);
    scene.add(top1Spotlight);
    scene.add(top1Spotlight.target);

    // Ground Plaza & Grid
    const groundGeo = new THREE.PlaneGeometry(600, 600);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0c1322,
      roughness: 0.35,
      metalness: 0.6,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(600, 120, 0xf59e0b, 0x1e293b);
    gridHelper.position.y = 0.08;
    scene.add(gridHelper);

    // Floating Golden Sparks
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 500;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 300;
      posArray[i + 1] = Math.random() * 90;
      posArray[i + 2] = (Math.random() - 0.5) * 300;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 1.5,
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.65,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isDraggingRef.current) {
        const deltaX = e.clientX - prevMousePosRef.current.x;
        const deltaY = e.clientY - prevMousePosRef.current.y;

        orbitAngleRef.current.theta -= deltaX * 0.004;
        orbitAngleRef.current.phi = Math.max(
          0.1,
          Math.min(1.0, orbitAngleRef.current.phi + deltaY * 0.004)
        );

        prevMousePosRef.current = { x: e.clientX, y: e.clientY };

        targetCameraPosRef.current.set(
          Math.sin(orbitAngleRef.current.theta) * zoomDistRef.current,
          Math.sin(orbitAngleRef.current.phi) * zoomDistRef.current + 20,
          Math.cos(orbitAngleRef.current.theta) * zoomDistRef.current
        );
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      const moveDist = Math.hypot(
        e.clientX - prevMousePosRef.current.x,
        e.clientY - prevMousePosRef.current.y
      );
      if (moveDist < 6) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        for (const hit of intersects) {
          let cur: THREE.Object3D | null = hit.object;
          while (cur && !cur.userData?.itemId && cur.parent) {
            cur = cur.parent;
          }
          if (cur && cur.userData?.itemId) {
            const found = items.find((i) => i.id === cur?.userData.itemId);
            if (found) {
              onSelectItem(found);
              return;
            }
          }
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomDistRef.current = Math.max(50, Math.min(190, zoomDistRef.current + e.deltaY * 0.08));
      targetCameraPosRef.current.set(
        Math.sin(orbitAngleRef.current.theta) * zoomDistRef.current,
        Math.sin(orbitAngleRef.current.phi) * zoomDistRef.current + 20,
        Math.cos(orbitAngleRef.current.theta) * zoomDistRef.current
      );
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      camera.position.lerp(targetCameraPosRef.current, 0.05);
      currentLookAtRef.current.lerp(targetLookAtRef.current, 0.05);
      camera.lookAt(currentLookAtRef.current);

      if (cameraMode === 'cinematic' && !isDraggingRef.current) {
        orbitAngleRef.current.theta += 0.002;
        targetCameraPosRef.current.x = Math.sin(orbitAngleRef.current.theta) * zoomDistRef.current;
        targetCameraPosRef.current.z = Math.cos(orbitAngleRef.current.theta) * zoomDistRef.current;
      }

      particles.rotation.y += 0.0006;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Construct Architectural Financial Plaza
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    buildingMeshesRef.current.forEach((group) => {
      scene.remove(group);
    });
    buildingMeshesRef.current.clear();

    const topBid = items.length > 0 ? items[0].totalBidAmount : 10000;

    const layoutPositions = [
      { x: 0, z: 0 },       // #1 Center Apex
      { x: 20, z: 10 },     // #2 Right Flank
      { x: -20, z: 10 },    // #3 Left Flank
      { x: 38, z: 24 },     // #4
      { x: -38, z: 24 },    // #5
      { x: 54, z: 42 },     // #6
      { x: -54, z: 42 },    // #7
      { x: 68, z: 62 },     // #8
      { x: -68, z: 62 },    // #9
      { x: 80, z: 82 },     // #10
      { x: -80, z: 82 },    // #11
    ];

    items.forEach((item, index) => {
      const rank = index + 1;
      const isTop1 = rank === 1;
      const isTop2 = rank === 2;
      const isTop3 = rank === 3;

      const pos = layoutPositions[index] || { x: (index % 2 === 0 ? 1 : -1) * (40 + index * 6), z: index * 8 };

      const ratio = item.totalBidAmount / Math.max(1, topBid);
      const mainHeight = isTop1 ? 46 : Math.max(10, ratio * 36);
      const width = isTop1 ? 11 : isTop2 || isTop3 ? 9 : 7;

      const group = new THREE.Group();
      group.position.set(pos.x, 0, pos.z);
      group.userData = { itemId: item.id, rank };

      const tex = createSkyscraperTexture(rank, item.clickCount);

      // 1. Base Podium
      const baseHeight = 3.5;
      const baseWidth = width * 1.25;
      const baseGeo = new THREE.BoxGeometry(baseWidth, baseHeight, baseWidth);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.4,
        metalness: 0.8,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = baseHeight / 2;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      // 2. Main Tower Shaft
      const shaftGeo = new THREE.BoxGeometry(width, mainHeight, width);
      const shaftMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.25,
        metalness: 0.75,
        emissive: isTop1 ? 0xf59e0b : isTop2 ? 0x94a3b8 : isTop3 ? 0xd97706 : 0x0284c7,
        emissiveIntensity: isTop1 ? 0.45 : isTop2 || isTop3 ? 0.35 : 0.25,
      });
      const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
      shaftMesh.position.y = baseHeight + mainHeight / 2;
      shaftMesh.castShadow = true;
      shaftMesh.receiveShadow = true;
      group.add(shaftMesh);

      // 3. Edges Neon Highlights
      const edges = new THREE.EdgesGeometry(shaftGeo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: isTop1 ? 0xfbbf24 : isTop2 ? 0xffffff : isTop3 ? 0xf59e0b : 0x38bdf8,
      });
      const edgeLine = new THREE.LineSegments(edges, edgeMat);
      edgeLine.position.y = baseHeight + mainHeight / 2;
      group.add(edgeLine);

      // 4. Rooftop Crown & Spire
      const crownHeight = isTop1 ? 6 : 3.5;
      const crownWidth = width * 0.75;
      const crownGeo = new THREE.BoxGeometry(crownWidth, crownHeight, crownWidth);
      const crownMat = new THREE.MeshStandardMaterial({
        color: isTop1 ? 0xfbbf24 : 0x38bdf8,
        emissive: isTop1 ? 0xf59e0b : 0x0284c7,
        emissiveIntensity: 0.6,
      });
      const crownMesh = new THREE.Mesh(crownGeo, crownMat);
      crownMesh.position.y = baseHeight + mainHeight + crownHeight / 2;
      group.add(crownMesh);

      // Rooftop Spire
      const spireHeight = isTop1 ? 10 : 5;
      const spireGeo = new THREE.CylinderGeometry(0.15, 0.4, spireHeight, 8);
      const spireMat = new THREE.MeshBasicMaterial({
        color: isTop1 ? 0xfffbeb : 0x38bdf8,
      });
      const spireMesh = new THREE.Mesh(spireGeo, spireMat);
      spireMesh.position.y = baseHeight + mainHeight + crownHeight + spireHeight / 2;
      group.add(spireMesh);

      // 5. Rooftop Holographic Billboard (Brand Logo + Rank + Domain)
      const billboardTex = createRooftopBillboard(item, rank);
      if (billboardTex) {
        const billboardMat = new THREE.SpriteMaterial({
          map: billboardTex,
          transparent: true,
          opacity: 0.96,
        });
        const billboard = new THREE.Sprite(billboardMat);
        billboard.scale.set(isTop1 ? 22 : 16, isTop1 ? 6.2 : 4.6, 1);
        billboard.position.y = baseHeight + mainHeight + crownHeight + spireHeight + (isTop1 ? 4 : 3);
        group.add(billboard);
      }

      // 6. Top 1 Golden Laser Beam
      if (isTop1) {
        const beamGeo = new THREE.CylinderGeometry(0.4, 1.2, 140, 16);
        const beamMat = new THREE.MeshBasicMaterial({
          color: 0xfbbf24,
          transparent: true,
          opacity: 0.7,
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.y = baseHeight + mainHeight + crownHeight + 70;
        group.add(beam);

        const ringGeo = new THREE.TorusGeometry(width * 0.85, 0.4, 16, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = baseHeight + mainHeight + crownHeight + 1;
        group.add(ring);
      }

      scene.add(group);
      buildingMeshesRef.current.set(item.id, group);
    });
  }, [items]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none"
    />
  );
}

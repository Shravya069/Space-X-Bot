import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BotAttire, CameraPreset, MissionState } from '../types';

interface SpaceSceneProps {
  missionState: MissionState;
  isPaused: boolean;
  robotImage: string | null;
  botAttire?: BotAttire;
  isCrazyBotMode?: boolean;
  isBotSpotlightOn?: boolean;
  cameraPreset: CameraPreset;
  onSelectComponent?: (name: string, description: string) => void;
}

export const SpaceScene: React.FC<SpaceSceneProps> = ({
  missionState,
  isPaused,
  robotImage,
  botAttire = 'spacex-official',
  isCrazyBotMode = false,
  isBotSpotlightOn = true,
  cameraPreset,
  onSelectComponent,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Object references for animation
  const spacecraftGroupRef = useRef<THREE.Group | null>(null);
  const robotGroupRef = useRef<THREE.Group | null>(null);
  const robotTrackingLightRef = useRef<THREE.PointLight | null>(null);
  const botSpotlightRef = useRef<THREE.PointLight | null>(null);
  const botRimLightRef = useRef<THREE.PointLight | null>(null);
  const crazyHaloGroupRef = useRef<THREE.Group | null>(null);
  const connectorMeshRef = useRef<THREE.Mesh | null>(null);
  const connectorLightRef = useRef<THREE.PointLight | null>(null);
  const scanConeRef = useRef<THREE.Mesh | null>(null);
  const rightArmRef = useRef<THREE.Group | null>(null);
  const rightArmElbowRef = useRef<THREE.Group | null>(null);
  const rightToolRef = useRef<THREE.Mesh | null>(null);
  const leftArmRef = useRef<THREE.Group | null>(null);
  const thrusterParticlesRef = useRef<THREE.Points | null>(null);
  const sparkParticlesRef = useRef<THREE.Points | null>(null);
  const robotTextureRef = useRef<THREE.CanvasTexture | THREE.Texture | null>(null);
  const robotScreenMeshRef = useRef<THREE.Mesh | null>(null);

  // Attire specific mesh refs
  const robotChassisMeshRef = useRef<THREE.Mesh | null>(null);
  const robotTopTrimRef = useRef<THREE.Mesh | null>(null);
  const robotLeftEyeRef = useRef<THREE.Mesh | null>(null);
  const robotRightEyeRef = useRef<THREE.Mesh | null>(null);
  const robotLidarDomeRef = useRef<THREE.Mesh | null>(null);
  const robotBowtieGroupRef = useRef<THREE.Group | null>(null);
  const robotGoldFoilMeshRef = useRef<THREE.Mesh | null>(null);

  // Camera control state
  const isDraggingRef = useRef(false);
  const isRightDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const cameraSphericalRef = useRef({ radius: 14, theta: 0.8, phi: 1.2 });
  const targetSphericalRef = useRef({ radius: 14, theta: 0.8, phi: 1.2 });
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Animation values
  const animationFrameId = useRef<number | null>(null);
  const stateTimerRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // Target coordinates for robot depending on state
  const robotTargetPos = useRef<THREE.Vector3>(new THREE.Vector3(8.5, 3.8, 7.5));
  const robotTargetRot = useRef<THREE.Euler>(new THREE.Euler(0, -Math.PI / 4, 0));

  const [hoveredObject, setHoveredObject] = useState<string | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // SCENE
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x020617, 0.003);

    // CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(10, 5, 12);
    camera.lookAt(0, 0, 0);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // -------------------------------------------------------------------------
    // 1. LIGHTING (BRIGHT & HIGH-VISIBILITY FOR CRYSTAL-CLEAR SPACE VISION)
    // -------------------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
    scene.add(ambientLight);

    // Sun directional light
    const sunLight = new THREE.DirectionalLight(0xffffff, 4.0);
    sunLight.position.set(40, 25, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -15;
    sunLight.shadow.camera.right = 15;
    sunLight.shadow.camera.top = 15;
    sunLight.shadow.camera.bottom = -15;
    scene.add(sunLight);

    // Earth fill light (cool cyan/blue bounce from below)
    const earthBounceLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    earthBounceLight.position.set(-20, -30, -20);
    scene.add(earthBounceLight);

    // Front Camera Fill Light - ensures robot's front is bright and gleaming
    const cameraFillLight = new THREE.DirectionalLight(0xe0f2fe, 2.0);
    cameraFillLight.position.set(12, 10, 16);
    scene.add(cameraFillLight);

    // Dedicated Robot Tracking Spotlight (Follows robot position)
    const robotTrackingLight = new THREE.PointLight(0xffffff, 3.5, 25);
    scene.add(robotTrackingLight);
    robotTrackingLightRef.current = robotTrackingLight;

    // -------------------------------------------------------------------------
    // 2. ENVIRONMENT (STARS & EARTH)
    // -------------------------------------------------------------------------
    const starCount = 3500;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const colorPalette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0x93c5fd),
      new THREE.Color(0xbae6fd),
      new THREE.Color(0xfef08a),
      new THREE.Color(0xe0f2fe),
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 250 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      starColors[i * 3] = color.r;
      starColors[i * 3 + 1] = color.g;
      starColors[i * 3 + 2] = color.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: false,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // Distant Earth in Background
    const earthGroup = new THREE.Group();
    earthGroup.position.set(-65, -45, -70);
    scene.add(earthGroup);

    // Procedural canvas Earth Texture
    const earthCanvas = document.createElement('canvas');
    earthCanvas.width = 1024;
    earthCanvas.height = 512;
    const ctx = earthCanvas.getContext('2d');
    if (ctx) {
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
      oceanGrad.addColorStop(0, '#021526');
      oceanGrad.addColorStop(0.5, '#042d54');
      oceanGrad.addColorStop(1, '#021526');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 1024, 512);

      ctx.fillStyle = '#1e3a24';
      ctx.beginPath();
      ctx.ellipse(280, 180, 80, 50, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(320, 320, 60, 90, 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2d4a2a';
      ctx.beginPath();
      ctx.ellipse(600, 170, 120, 60, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(580, 280, 70, 80, 0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(820, 340, 50, 40, -0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let j = 0; j < 30; j++) {
        const cx = Math.random() * 1024;
        const cy = 80 + Math.random() * 350;
        const rw = 40 + Math.random() * 90;
        const rh = 10 + Math.random() * 25;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rw, rh, Math.random() * 0.5 - 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const earthTexture = new THREE.CanvasTexture(earthCanvas);
    const earthGeo = new THREE.SphereGeometry(35, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.7,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.rotation.y = 1.2;
    earthGroup.add(earthMesh);

    // Earth atmosphere atmospheric halo
    const atmosGeo = new THREE.SphereGeometry(35.8, 64, 64);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    earthGroup.add(atmosMesh);

    // -------------------------------------------------------------------------
    // 3. DETAILED SPACECRAFT
    // -------------------------------------------------------------------------
    const spacecraft = new THREE.Group();
    spacecraftGroupRef.current = spacecraft;
    scene.add(spacecraft);

    // Main Bus Body
    const busGeo = new THREE.BoxGeometry(2.4, 3.4, 2.4);
    const busMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.85,
      roughness: 0.25,
    });
    const busMesh = new THREE.Mesh(busGeo, busMat);
    busMesh.castShadow = true;
    busMesh.receiveShadow = true;
    (busMesh as any).userData = { name: 'Main Satellite Bus', desc: 'Core avionics, flight computer, and telemetry subsystems.' };
    spacecraft.add(busMesh);

    // Gold Multi-Layer Insulation (MLI) Thermal Foil Panels
    const mliMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.95,
      roughness: 0.35,
    });
    const mliPanel1 = new THREE.Mesh(new THREE.BoxGeometry(2.42, 1.2, 0.05), mliMat);
    mliPanel1.position.set(0, 0.4, 1.21);
    spacecraft.add(mliPanel1);

    const mliPanel2 = new THREE.Mesh(new THREE.BoxGeometry(2.42, 1.2, 0.05), mliMat);
    mliPanel2.position.set(0, 0.4, -1.21);
    spacecraft.add(mliPanel2);

    // Equipment Bays & Structural Trusses
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.4 });
    const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.5, 8), trussMat);
    topCap.position.y = 1.95;
    spacecraft.add(topCap);

    const bottomNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.35, 0.8, 16), trussMat);
    bottomNozzle.position.y = -2.1;
    spacecraft.add(bottomNozzle);

    // High-Gain Parabolic Dish Antenna
    const dishGroup = new THREE.Group();
    dishGroup.position.set(0, 2.3, 0);
    const dishGeo = new THREE.SphereGeometry(1.1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.45);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide,
    });
    const dishMesh = new THREE.Mesh(dishGeo, dishMat);
    dishMesh.rotation.x = Math.PI * 0.7;
    dishGroup.add(dishMesh);

    // Antenna feed horn
    const feedPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9), trussMat);
    feedPole.position.set(0, 0.4, -0.4);
    feedPole.rotation.x = -Math.PI * 0.3;
    dishGroup.add(feedPole);
    (dishMesh as any).userData = { name: 'High-Gain Dish Antenna', desc: 'X/Ka-band deep space telecommunications array.' };
    spacecraft.add(dishGroup);

    // Solar Wings
    const solarWingGroup = new THREE.Group();
    const panelFrameGeo = new THREE.BoxGeometry(4.8, 1.6, 0.08);
    const solarCellCanvas = document.createElement('canvas');
    solarCellCanvas.width = 256;
    solarCellCanvas.height = 128;
    const sCtx = solarCellCanvas.getContext('2d');
    if (sCtx) {
      sCtx.fillStyle = '#0f172a';
      sCtx.fillRect(0, 0, 256, 128);
      sCtx.strokeStyle = '#0284c7';
      sCtx.lineWidth = 1.5;
      for (let x = 0; x < 256; x += 16) {
        sCtx.beginPath();
        sCtx.moveTo(x, 0);
        sCtx.lineTo(x, 128);
        sCtx.stroke();
      }
      for (let y = 0; y < 128; y += 16) {
        sCtx.beginPath();
        sCtx.moveTo(0, y);
        sCtx.lineTo(256, y);
        sCtx.stroke();
      }
    }
    const solarCellTex = new THREE.CanvasTexture(solarCellCanvas);
    const solarMat = new THREE.MeshStandardMaterial({
      map: solarCellTex,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x0369a1,
      emissiveIntensity: 0.2,
    });

    const rightWing = new THREE.Mesh(panelFrameGeo, solarMat);
    rightWing.position.set(3.8, 0, 0);
    rightWing.castShadow = true;
    (rightWing as any).userData = { name: 'Starboard Solar Array', desc: 'Gallium Arsenide triple-junction photovoltaic cells (98% baseline capacity).' };
    solarWingGroup.add(rightWing);

    const leftWing = new THREE.Mesh(panelFrameGeo, solarMat);
    leftWing.position.set(-3.8, 0, 0);
    leftWing.castShadow = true;
    (leftWing as any).userData = { name: 'Port Solar Array', desc: 'Gallium Arsenide triple-junction photovoltaic cells.' };
    solarWingGroup.add(leftWing);

    const boomGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.6);
    const rightBoom = new THREE.Mesh(boomGeo, trussMat);
    rightBoom.rotation.z = Math.PI / 2;
    rightBoom.position.set(1.4, 0, 0);
    solarWingGroup.add(rightBoom);

    const leftBoom = new THREE.Mesh(boomGeo, trussMat);
    leftBoom.rotation.z = Math.PI / 2;
    leftBoom.position.set(-1.4, 0, 0);
    solarWingGroup.add(leftBoom);

    spacecraft.add(solarWingGroup);

    // -------------------------------------------------------------------------
    // 4. POWER CONNECTOR JUNCTION (PRIMARY SIMULATION FOCUS)
    // -------------------------------------------------------------------------
    const connectorJunction = new THREE.Group();
    connectorJunction.position.set(1.22, -0.3, 0.7);
    spacecraft.add(connectorJunction);

    const bracketGeo = new THREE.BoxGeometry(0.12, 0.8, 0.8);
    const bracketMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.3 });
    const bracket = new THREE.Mesh(bracketGeo, bracketMat);
    connectorJunction.add(bracket);

    const socketGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.35, 16);
    const socketMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    const socket = new THREE.Mesh(socketGeo, socketMat);
    socket.rotation.z = Math.PI / 2;
    socket.position.set(0.18, 0, 0);
    connectorJunction.add(socket);

    const collarGeo = new THREE.TorusGeometry(0.25, 0.06, 12, 24);
    const collarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.1 });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.rotation.y = Math.PI / 2;
    collar.position.set(0.3, 0, 0);
    connectorJunction.add(collar);

    const connectorIndicatorGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.1, 16);
    const connectorIndicatorMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x22c55e,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    });
    const connectorIndicator = new THREE.Mesh(connectorIndicatorGeo, connectorIndicatorMat);
    connectorIndicator.rotation.z = Math.PI / 2;
    connectorIndicator.position.set(0.35, 0, 0);
    (connectorIndicator as any).userData = {
      name: 'High-Voltage Power Connector',
      desc: 'Main orbital bus power transfer interface. Vulnerable to thermal vibration looseness.',
    };
    connectorMeshRef.current = connectorIndicator;
    connectorJunction.add(connectorIndicator);

    const connectorLight = new THREE.PointLight(0x22c55e, 2, 4);
    connectorLight.position.set(0.6, 0, 0);
    connectorLightRef.current = connectorLight;
    connectorJunction.add(connectorLight);

    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // 5. ROBOT ("SPACE-X BOT") - OFFICIAL ARCHITECTURE (SpaceXB1 & SpaceXB2)
    // -------------------------------------------------------------------------
    const robot = new THREE.Group();
    robotGroupRef.current = robot;
    robot.position.copy(robotTargetPos.current);
    robot.rotation.copy(robotTargetRot.current);
    scene.add(robot);

    // Main Chassis - Brilliant High-Albedo Aerospace Pure White Armor
    const chassisGeo = new THREE.BoxGeometry(1.25, 0.9, 1.35);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.25,
      roughness: 0.15,
    });
    const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
    chassisMesh.castShadow = true;
    chassisMesh.receiveShadow = true;
    (chassisMesh as any).userData = {
      name: 'SPACE-X BOT Main Hull',
      desc: 'High-albedo ceramic white aerospace chassis with AI processing unit & radiation shielding.',
    };
    robotChassisMeshRef.current = chassisMesh;
    robot.add(chassisMesh);

    // Structural Skeletal Frame & Bevel Trim (Dark aerospace titanium hardware)
    const darkFrameMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.8,
    });
    const topTrim = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.05, 1.15), darkFrameMat);
    topTrim.position.set(0, 0.46, 0);
    robotTopTrimRef.current = topTrim;
    robot.add(topTrim);

    // Front Chest Plate Bevel Rim
    const chestPlateRim = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.55, 0.08),
      darkFrameMat
    );
    chestPlateRim.position.set(0, 0.0, 0.68);
    robot.add(chestPlateRim);

    // Front Chest Plate ("SPACE-X BOT" Screen/Badge)
    const screenGeo = new THREE.PlaneGeometry(0.78, 0.48);
    const defaultCanvas = document.createElement('canvas');
    defaultCanvas.width = 512;
    defaultCanvas.height = 320;
    const dCtx = defaultCanvas.getContext('2d');
    if (dCtx) {
      dCtx.fillStyle = '#f8fafc';
      dCtx.fillRect(0, 0, 512, 320);

      // Cyan-blue border line
      dCtx.strokeStyle = '#0284c7';
      dCtx.lineWidth = 6;
      dCtx.strokeRect(10, 10, 492, 300);

      // Bold aerospace SPACE-X BOT typography
      dCtx.fillStyle = '#0f172a';
      dCtx.font = '900 38px -apple-system, BlinkMacSystemFont, sans-serif';
      dCtx.textAlign = 'center';
      dCtx.fillText('SPACE-X BOT', 256, 110);

      // Glowing blue horizontal accent bar
      dCtx.fillStyle = '#00e5ff';
      dCtx.fillRect(96, 140, 320, 10);

      // Subtitle
      dCtx.fillStyle = '#475569';
      dCtx.font = 'bold 18px monospace';
      dCtx.fillText('AI-POWERED AUTONOMOUS SERVICER', 256, 195);

      dCtx.fillStyle = '#0284c7';
      dCtx.font = 'bold 16px monospace';
      dCtx.fillText('SELF-POWERED · SELF-SUSTAINED', 256, 240);
    }
    const defaultTex = new THREE.CanvasTexture(defaultCanvas);
    defaultTex.colorSpace = THREE.SRGBColorSpace;
    robotTextureRef.current = defaultTex;
    const screenMat = new THREE.MeshBasicMaterial({ map: defaultTex });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 0.0, 0.73);
    robotScreenMeshRef.current = screenMesh;
    robot.add(screenMesh);

    // Glowing electric blue accent light slot beneath the chest text
    const chestSlotLightGeo = new THREE.BoxGeometry(0.5, 0.03, 0.04);
    const electricBlueMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 2.5,
    });
    const chestSlotLight = new THREE.Mesh(chestSlotLightGeo, electricBlueMat);
    chestSlotLight.position.set(0, -0.06, 0.74);
    robot.add(chestSlotLight);

    // Classic 3D Polished Gold Bowtie (for Classic White-Tie Gala Tuxedo Attire)
    const bowtieGroup = new THREE.Group();
    bowtieGroup.position.set(0, 0.28, 0.73);
    const goldBowMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
    });
    const bowLeft = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.16, 16), goldBowMat);
    bowLeft.rotation.z = Math.PI / 2;
    bowLeft.position.set(-0.08, 0, 0);
    bowtieGroup.add(bowLeft);

    const bowRight = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.16, 16), goldBowMat);
    bowRight.rotation.z = -Math.PI / 2;
    bowRight.position.set(0.08, 0, 0);
    bowtieGroup.add(bowRight);

    const bowKnot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), goldBowMat);
    bowtieGroup.add(bowKnot);
    bowtieGroup.visible = false;
    robotBowtieGroupRef.current = bowtieGroup;
    robot.add(bowtieGroup);

    // Classic Apollo Thermal MLI Gold Foil side panels
    const goldFoilGroup = new THREE.Group();
    const goldFoilMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.9,
      roughness: 0.3,
      emissive: 0xb45309,
      emissiveIntensity: 0.45,
    });
    const leftFoil = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.82, 1.25), goldFoilMat);
    leftFoil.position.set(-0.63, 0, 0);
    goldFoilGroup.add(leftFoil);
    const rightFoil = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.82, 1.25), goldFoilMat);
    rightFoil.position.set(0.63, 0, 0);
    goldFoilGroup.add(rightFoil);
    goldFoilGroup.visible = false;
    robotGoldFoilMeshRef.current = goldFoilGroup as any;
    robot.add(goldFoilGroup);

    // High-Visibility Dedicated Robot Illumination Spotlights
    // Front illumination spotlight that moves directly with the robot
    const botFrontSpotlight = new THREE.PointLight(0xffffff, 5.0, 15);
    botFrontSpotlight.position.set(0, 1.8, 3.2);
    robot.add(botFrontSpotlight);
    botSpotlightRef.current = botFrontSpotlight;

    // Top & Rim Aura light attached directly to robot
    const botTopRimLight = new THREE.PointLight(0xbae6fd, 3.5, 12);
    botTopRimLight.position.set(0, 2.4, -0.8);
    robot.add(botTopRimLight);
    botRimLightRef.current = botTopRimLight;

    // -------------------------------------------------------------------------
    // REAR BACK VIEW: BATTERY MODULE & SOLAR PANEL WINGS (SpaceXB2)
    // -------------------------------------------------------------------------
    const rearPack = new THREE.Group();
    rearPack.position.set(0, 0, -0.68);
    robot.add(rearPack);

    // Battery Module Housing
    const batteryBoxGeo = new THREE.BoxGeometry(0.75, 0.65, 0.12);
    const batteryBox = new THREE.Mesh(batteryBoxGeo, darkFrameMat);
    rearPack.add(batteryBox);

    // Battery Door Screen with glowing blue lightning bolt and "BATTERY"
    const batteryCanvas = document.createElement('canvas');
    batteryCanvas.width = 256;
    batteryCanvas.height = 256;
    const bCtx = batteryCanvas.getContext('2d');
    if (bCtx) {
      bCtx.fillStyle = '#020617';
      bCtx.fillRect(0, 0, 256, 256);
      bCtx.strokeStyle = '#0284c7';
      bCtx.lineWidth = 6;
      bCtx.strokeRect(10, 10, 236, 236);

      bCtx.fillStyle = '#00e5ff';
      bCtx.beginPath();
      bCtx.moveTo(140, 40);
      bCtx.lineTo(90, 130);
      bCtx.lineTo(130, 130);
      bCtx.lineTo(115, 210);
      bCtx.lineTo(170, 115);
      bCtx.lineTo(130, 115);
      bCtx.closePath();
      bCtx.fill();

      bCtx.fillStyle = '#ffffff';
      bCtx.font = 'bold 24px sans-serif';
      bCtx.textAlign = 'center';
      bCtx.fillText('BATTERY', 128, 235);
    }
    const batteryTex = new THREE.CanvasTexture(batteryCanvas);
    const batteryMat = new THREE.MeshStandardMaterial({
      map: batteryTex,
      emissive: 0x0284c7,
      emissiveIntensity: 1.5,
    });
    const batteryDoor = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), batteryMat);
    batteryDoor.rotation.y = Math.PI;
    batteryDoor.position.set(0, 0, -0.07);
    rearPack.add(batteryDoor);

    // Dual Foldable Solar Panel Wings (Left & Right rear shoulders)
    const solarWingMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
    });
    const solarPanelGeo = new THREE.BoxGeometry(0.85, 0.45, 0.04);

    // Starboard Solar Wing
    const rSolarWing = new THREE.Group();
    rSolarWing.position.set(0.9, 0.3, -0.4);
    const rSolarBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3), darkFrameMat);
    rSolarBoom.rotation.z = Math.PI / 2;
    rSolarBoom.position.set(0.15, 0, 0);
    rSolarWing.add(rSolarBoom);
    const rSolarMesh = new THREE.Mesh(solarPanelGeo, solarWingMat);
    rSolarMesh.position.set(0.65, 0, 0);
    rSolarWing.add(rSolarMesh);
    robot.add(rSolarWing);

    // Port Solar Wing
    const lSolarWing = new THREE.Group();
    lSolarWing.position.set(-0.9, 0.3, -0.4);
    const lSolarBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3), darkFrameMat);
    lSolarBoom.rotation.z = -Math.PI / 2;
    lSolarBoom.position.set(-0.15, 0, 0);
    lSolarWing.add(lSolarBoom);
    const lSolarMesh = new THREE.Mesh(solarPanelGeo, solarWingMat);
    lSolarMesh.position.set(-0.65, 0, 0);
    lSolarWing.add(lSolarMesh);
    robot.add(lSolarWing);

    // -------------------------------------------------------------------------
    // HEAD TURRET: VISION SYSTEM & COMMUNICATION ANTENNA (SpaceXB1)
    // -------------------------------------------------------------------------
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.48, 0.35);
    robot.add(headGroup);

    // Aerodynamic white casing over dark optical bezel
    const headTurretGeo = new THREE.BoxGeometry(0.95, 0.36, 0.55);
    const headTurret = new THREE.Mesh(headTurretGeo, chassisMat);
    headGroup.add(headTurret);

    const headFaceGeo = new THREE.BoxGeometry(0.85, 0.28, 0.05);
    const headFace = new THREE.Mesh(headFaceGeo, darkFrameMat);
    headFace.position.set(0, 0, 0.28);
    headGroup.add(headFace);

    // Triple Camera Lenses: Left Stereo, Center Telephoto, Right Stereo
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x00e5ff,
      emissiveIntensity: 1.5,
      roughness: 0.1,
      metalness: 0.9,
    });
    const sideLensGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.08, 16);
    const centerLensGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.09, 16);

    // Left Stereo Lens
    const leftEye = new THREE.Mesh(sideLensGeo, lensMat);
    leftEye.rotation.x = Math.PI / 2;
    leftEye.position.set(-0.16, 0, 0.31);
    robotLeftEyeRef.current = leftEye;
    headGroup.add(leftEye);

    // Center Telephoto Lens
    const centerEye = new THREE.Mesh(centerLensGeo, lensMat);
    centerEye.rotation.x = Math.PI / 2;
    centerEye.position.set(0, 0, 0.31);
    headGroup.add(centerEye);

    // Right Stereo Lens
    const rightEye = new THREE.Mesh(sideLensGeo, lensMat);
    rightEye.rotation.x = Math.PI / 2;
    rightEye.position.set(0.16, 0, 0.31);
    robotRightEyeRef.current = rightEye;
    headGroup.add(rightEye);

    // Dual horizontal blue LED indicator light strips flanking cameras
    const ledStripGeo = new THREE.BoxGeometry(0.14, 0.035, 0.02);
    const leftLed = new THREE.Mesh(ledStripGeo, electricBlueMat);
    leftLed.position.set(-0.32, 0, 0.31);
    headGroup.add(leftLed);

    const rightLed = new THREE.Mesh(ledStripGeo, electricBlueMat);
    rightLed.position.set(0.32, 0, 0.31);
    headGroup.add(rightLed);

    // Sensor Module (Cylinder on top-right of head from SpaceXB1)
    const sensorCanisterGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.16, 16);
    const sensorCanister = new THREE.Mesh(sensorCanisterGeo, darkFrameMat);
    sensorCanister.position.set(0.32, 0.24, 0.08);
    headGroup.add(sensorCanister);

    const sensorRing = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.015, 8, 16), electricBlueMat);
    sensorRing.rotation.x = Math.PI / 2;
    sensorRing.position.set(0.32, 0.3, 0.08);
    headGroup.add(sensorRing);

    // Communication Antenna (Central Mast + Parabolic Dish + Feed Horn Spike from SpaceXB1 & SpaceXB2)
    const antennaGroup = new THREE.Group();
    antennaGroup.position.set(0, 0.18, -0.05);

    // Mast
    const antMast = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35, 12), darkFrameMat);
    antMast.position.set(0, 0.18, 0);
    antennaGroup.add(antMast);

    // Parabolic Dish
    const antDishGeo = new THREE.SphereGeometry(0.38, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.42);
    const antDishMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.6,
      roughness: 0.2,
      side: THREE.DoubleSide,
    });
    const antDish = new THREE.Mesh(antDishGeo, antDishMat);
    antDish.rotation.x = -Math.PI * 0.75;
    antDish.position.set(0, 0.32, 0);
    antennaGroup.add(antDish);

    // Feed spike
    const feedSpike = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.25, 8), darkFrameMat);
    feedSpike.position.set(0, 0.42, 0.08);
    antennaGroup.add(feedSpike);

    headGroup.add(antennaGroup);

    // -------------------------------------------------------------------------
    // LOWER PROPULSION & MOBILITY POD (SpaceXB1 & SpaceXB2)
    // -------------------------------------------------------------------------
    const thrusterPod = new THREE.Group();
    thrusterPod.position.set(0, -0.45, 0.1);

    const podConeGeo = new THREE.CylinderGeometry(0.32, 0.16, 0.55, 16);
    const podCone = new THREE.Mesh(podConeGeo, darkFrameMat);
    thrusterPod.add(podCone);

    // 5 Glowing Blue RCS Nozzles
    const nozzleMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x00e5ff,
      emissiveIntensity: 2.2,
      metalness: 0.9,
      roughness: 0.1,
    });
    const mainNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.05, 0.18, 12), nozzleMat);
    mainNozzle.position.set(0, -0.32, 0);
    thrusterPod.add(mainNozzle);

    for (let n = 0; n < 4; n++) {
      const ang = (n * Math.PI) / 2;
      const subNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.03, 0.12, 12), nozzleMat);
      subNozzle.position.set(0.18 * Math.cos(ang), -0.22, 0.18 * Math.sin(ang));
      subNozzle.rotation.z = Math.cos(ang) * 0.3;
      subNozzle.rotation.x = -Math.sin(ang) * 0.3;
      thrusterPod.add(subNozzle);
    }
    robot.add(thrusterPod);

    // -------------------------------------------------------------------------
    // 7-DOF ARTICULATED ROBOTIC ARMS & MULTI-TOOL DEXTEROUS GRIPPERS
    // -------------------------------------------------------------------------
    // Inspection Scanner Fan / Cone (Active during DIAGNOSIS)
    const coneGeo = new THREE.ConeGeometry(0.7, 1.8, 16, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const scanCone = new THREE.Mesh(coneGeo, coneMat);
    scanCone.rotation.x = -Math.PI / 2;
    scanCone.position.set(0, 0.1, 1.6);
    scanConeRef.current = scanCone;
    robot.add(scanCone);

    // Left Arm (Segmented White Armor with Dexterous 3-Finger Mechanical Hand)
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.7, 0, 0.3);
    const lShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), darkFrameMat);
    leftArm.add(lShoulder);

    const lUpperArmor = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.65), chassisMat);
    lUpperArmor.position.set(0, -0.32, 0);
    leftArm.add(lUpperArmor);

    // Dexterous Multi-Finger Hand
    const handBase = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.12), darkFrameMat);
    handBase.position.set(0, -0.7, 0);
    leftArm.add(handBase);

    // 3 Articulated Gripper Fingers with blue force-sensor pads
    for (let f = 0; f < 3; f++) {
      const finger = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 0.04), chassisMat);
      finger.position.set((f - 1) * 0.05, -0.12, 0.03);
      finger.rotation.x = 0.2;
      handBase.add(finger);
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.04, 0.015), electricBlueMat);
      pad.position.set((f - 1) * 0.05, -0.19, 0.045);
      handBase.add(pad);
    }
    leftArmRef.current = leftArm;
    robot.add(leftArm);

    // Right Arm (Intervention Arm with Rotating Multi-Tool Socket End-Effector)
    const rightArm = new THREE.Group();
    rightArm.position.set(0.7, 0, 0.3);
    const rShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), darkFrameMat);
    rightArm.add(rShoulder);

    const rUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.075, 0.65), chassisMat);
    rUpper.position.set(0, 0.1, 0.3);
    rUpper.rotation.x = Math.PI / 3;
    rightArm.add(rUpper);

    // Elbow Joint & Forearm
    const rElbow = new THREE.Group();
    rElbow.position.set(0, 0.35, 0.6);
    const rElbowMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), darkFrameMat);
    rElbow.add(rElbowMesh);

    const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.7), chassisMat);
    rForearm.position.set(0, -0.1, 0.35);
    rForearm.rotation.x = -Math.PI / 4;
    rElbow.add(rForearm);

    // End-Effector Tool Head with high-speed rotary socket & blue force ring
    const toolHead = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.1, 0.28, 16),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.2 })
    );
    toolHead.position.set(0, -0.3, 0.65);
    toolHead.rotation.x = Math.PI / 2;
    rightToolRef.current = toolHead;
    rElbow.add(toolHead);

    const toolGripRing = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 16), electricBlueMat);
    toolGripRing.position.set(0, -0.3, 0.65);
    rElbow.add(toolGripRing);

    rightArm.add(rElbow);
    rightArmElbowRef.current = rElbow;
    rightArmRef.current = rightArm;
    robot.add(rightArm);

    // Cold Gas RCS Thruster Plumes
    const thrusterCount = 120;
    const thrusterGeo = new THREE.BufferGeometry();
    const thrusterPos = new Float32Array(thrusterCount * 3);
    for (let i = 0; i < thrusterCount; i++) {
      thrusterPos[i * 3] = (Math.random() - 0.5) * 0.4;
      thrusterPos[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      thrusterPos[i * 3 + 2] = -0.7 - Math.random() * 0.9;
    }
    thrusterGeo.setAttribute('position', new THREE.BufferAttribute(thrusterPos, 3));
    const thrusterMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.14,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    const thrusters = new THREE.Points(thrusterGeo, thrusterMat);
    thrusters.position.set(0, 0, 0);
    thrusterParticlesRef.current = thrusters;
    robot.add(thrusters);

    // Repair Sparks Particles
    const sparkCount = 150;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      sparkPos[i * 3] = (Math.random() - 0.5) * 0.5;
      sparkPos[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      sparkPos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.12,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    sparks.position.set(1.55, -0.3, 0.7);
    sparkParticlesRef.current = sparks;
    spacecraft.add(sparks);

    // -------------------------------------------------------------------------
    // 6. EVENT LISTENERS (RESIZE, POINTERS)
    // -------------------------------------------------------------------------
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDraggingRef.current = true;
      } else if (e.button === 2) {
        isRightDraggingRef.current = true;
      }
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      if (isDraggingRef.current) {
        targetSphericalRef.current.theta -= deltaX * 0.006;
        targetSphericalRef.current.phi = Math.max(
          0.1,
          Math.min(Math.PI - 0.1, targetSphericalRef.current.phi - deltaY * 0.006)
        );
      } else if (isRightDraggingRef.current) {
        const panSpeed = 0.015;
        targetLookAtRef.current.y += deltaY * panSpeed;
        targetLookAtRef.current.x -= deltaX * panSpeed * Math.cos(targetSphericalRef.current.theta);
        targetLookAtRef.current.z += deltaX * panSpeed * Math.sin(targetSphericalRef.current.theta);
      }

      previousMousePosition.current = { x: e.clientX, y: e.clientY };

      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([busMesh, rightWing, leftWing, connectorIndicator, chassisMesh], true);
      if (intersects.length > 0) {
        const topObj = intersects[0].object as any;
        if (topObj.userData && topObj.userData.name) {
          setHoveredObject(topObj.userData.name);
          renderer.domElement.style.cursor = 'pointer';
        }
      } else {
        setHoveredObject(null);
        renderer.domElement.style.cursor = 'grab';
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      isRightDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetSphericalRef.current.radius = Math.max(
        4.0,
        Math.min(30.0, targetSphericalRef.current.radius + e.deltaY * 0.015)
      );
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([busMesh, rightWing, leftWing, connectorIndicator, chassisMesh], true);
      if (intersects.length > 0 && onSelectComponent) {
        const topObj = intersects[0].object as any;
        if (topObj.userData && topObj.userData.name) {
          onSelectComponent(topObj.userData.name, topObj.userData.desc || '');
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('contextmenu', onContextMenu);
    dom.addEventListener('click', onClick);

    // -------------------------------------------------------------------------
    // 7. ANIMATION TICK LOOP
    // -------------------------------------------------------------------------
    const animate = (time: number) => {
      animationFrameId.current = requestAnimationFrame(animate);

      const delta = (time - lastTimeRef.current) * 0.001;
      lastTimeRef.current = time;

      if (!isPaused) {
        stateTimerRef.current += delta;
      }

      const t = stateTimerRef.current;

      // Gentle orbital drift
      if (spacecraftGroupRef.current) {
        spacecraftGroupRef.current.rotation.y = Math.sin(t * 0.15) * 0.08;
        spacecraftGroupRef.current.rotation.x = Math.cos(t * 0.1) * 0.04;
      }

      // Earth slow rotation
      earthMesh.rotation.y += 0.0006;

      // Camera smooth interpolation
      cameraSphericalRef.current.radius +=
        (targetSphericalRef.current.radius - cameraSphericalRef.current.radius) * 0.08;
      cameraSphericalRef.current.theta +=
        (targetSphericalRef.current.theta - cameraSphericalRef.current.theta) * 0.08;
      cameraSphericalRef.current.phi +=
        (targetSphericalRef.current.phi - cameraSphericalRef.current.phi) * 0.08;

      cameraTargetRef.current.lerp(targetLookAtRef.current, 0.08);

      const r = cameraSphericalRef.current.radius;
      const th = cameraSphericalRef.current.theta;
      const ph = cameraSphericalRef.current.phi;

      camera.position.x = cameraTargetRef.current.x + r * Math.sin(ph) * Math.sin(th);
      camera.position.y = cameraTargetRef.current.y + r * Math.cos(ph);
      camera.position.z = cameraTargetRef.current.z + r * Math.sin(ph) * Math.cos(th);
      camera.lookAt(cameraTargetRef.current);

      // Robot movement smooth lerp
      if (robotGroupRef.current) {
        robotGroupRef.current.position.lerp(robotTargetPos.current, isPaused ? 0 : 0.035);
        robotGroupRef.current.quaternion.slerp(
          new THREE.Quaternion().setFromEuler(robotTargetRot.current),
          isPaused ? 0 : 0.04
        );

        // Dedicated Spotlight tracks robot position for high-albedo visibility
        if (robotTrackingLightRef.current) {
          robotTrackingLightRef.current.position.set(
            robotGroupRef.current.position.x + 2.0,
            robotGroupRef.current.position.y + 2.5,
            robotGroupRef.current.position.z + 3.0
          );
        }
      }

      // Crazy Bot Magnetic Halo Animation
      if (crazyHaloGroupRef.current) {
        crazyHaloGroupRef.current.visible = isCrazyBotMode;
        if (isCrazyBotMode) {
          crazyHaloGroupRef.current.rotation.y += 0.05;
          crazyHaloGroupRef.current.rotation.z = Math.sin(t * 3) * 0.15;
        }
      }

      // Thruster particle animation
      if (thrusterParticlesRef.current) {
        const mat = thrusterParticlesRef.current.material as THREE.PointsMaterial;
        let thrusterColor = 0x06b6d4;
        if (isCrazyBotMode) {
          thrusterColor = 0xd946ef;
        } else if (botAttire === 'classic-tuxedo') {
          thrusterColor = 0xfbbf24; // champagne gold
        } else if (botAttire === 'classic-apollo') {
          thrusterColor = 0xf97316; // vintage hydrazine orange
        } else if (botAttire === 'classic-steampunk') {
          thrusterColor = 0xea580c; // copper
        } else if (botAttire === 'classic-dragon') {
          thrusterColor = 0x38bdf8; // vacuum blue
        }
        mat.color.setHex(thrusterColor);

        const distToTarget = robotGroupRef.current
          ? robotGroupRef.current.position.distanceTo(robotTargetPos.current)
          : 0;

        if (distToTarget > 0.15 && !isPaused) {
          mat.opacity = 0.75 + Math.sin(t * 25) * 0.2;
          thrusterParticlesRef.current.scale.set(1 + Math.sin(t * 30) * 0.2, 1, 1 + Math.cos(t * 30) * 0.3);
        } else {
          mat.opacity = Math.max(0, mat.opacity - 0.05);
        }
      }

      // Sparks animation during repair intervention
      if (sparkParticlesRef.current) {
        const sMat = sparkParticlesRef.current.material as THREE.PointsMaterial;
        sMat.color.setHex(isCrazyBotMode ? 0xf0abfc : botAttire === 'classic-tuxedo' ? 0xfef08a : 0xf59e0b);
        if (missionState === 'INTERVENTION' && !isPaused) {
          sMat.opacity = 0.85 + Math.sin(t * 40) * 0.15;
          sparkParticlesRef.current.rotation.y += 0.2;
          sparkParticlesRef.current.rotation.z += 0.15;
        } else {
          sMat.opacity = 0.0;
        }
      }

      // Connector color and pulse animation
      if (connectorMeshRef.current && connectorLightRef.current) {
        const mat = connectorMeshRef.current.material as THREE.MeshStandardMaterial;

        if (missionState === 'IDLE' || missionState === 'MONITORING') {
          mat.color.setHex(0x22c55e);
          mat.emissive.setHex(0x22c55e);
          mat.emissiveIntensity = 1.0;
          connectorLightRef.current.color.setHex(0x22c55e);
          connectorLightRef.current.intensity = 1.5;
        } else if (
          missionState === 'ANOMALY DETECTED' ||
          missionState === 'INSPECTION' ||
          missionState === 'DIAGNOSIS' ||
          missionState === 'MAINTENANCE PLAN' ||
          missionState === 'ARM POSITIONING'
        ) {
          const pulse = (Math.sin(t * 8) + 1) * 0.5;
          mat.color.setHex(0xef4444);
          mat.emissive.setHex(0xef4444);
          mat.emissiveIntensity = 1.5 + pulse * 2.0;
          connectorLightRef.current.color.setHex(0xef4444);
          connectorLightRef.current.intensity = 2.0 + pulse * 3.0;
        } else if (missionState === 'INTERVENTION') {
          const flash = Math.sin(t * 20) > 0 ? 1 : 0.3;
          mat.color.setHex(0xf59e0b);
          mat.emissive.setHex(0xf59e0b);
          mat.emissiveIntensity = 2.0 * flash;
          connectorLightRef.current.color.setHex(0xf59e0b);
          connectorLightRef.current.intensity = 3.5 * flash;
        } else if (missionState === 'VERIFICATION' || missionState === 'SUCCESS') {
          mat.color.setHex(0x10b981);
          mat.emissive.setHex(0x10b981);
          mat.emissiveIntensity = 1.8;
          connectorLightRef.current.color.setHex(0x10b981);
          connectorLightRef.current.intensity = 2.2;
        }
      }

      // Scanner Cone animation
      if (scanConeRef.current) {
        const scMat = scanConeRef.current.material as THREE.MeshBasicMaterial;
        scMat.color.setHex(isCrazyBotMode ? 0xd946ef : 0x06b6d4);
        if (missionState === 'DIAGNOSIS' && !isPaused) {
          scMat.opacity = 0.35 + Math.sin(t * 12) * 0.15;
          scanConeRef.current.scale.set(1 + Math.sin(t * 8) * 0.1, 1, 1 + Math.cos(t * 8) * 0.1);
        } else {
          scMat.opacity = 0.0;
        }
      }

      // Arm kinematics based on state
      if (rightArmRef.current && rightArmElbowRef.current && rightToolRef.current) {
        if (missionState === 'ARM POSITIONING') {
          rightArmRef.current.rotation.y = THREE.MathUtils.lerp(rightArmRef.current.rotation.y, -0.6, 0.05);
          rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0.4, 0.05);
          rightArmElbowRef.current.rotation.x = THREE.MathUtils.lerp(rightArmElbowRef.current.rotation.x, 0.8, 0.05);
        } else if (missionState === 'INTERVENTION') {
          rightArmRef.current.rotation.y = THREE.MathUtils.lerp(rightArmRef.current.rotation.y, -0.85, 0.05);
          rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0.55, 0.05);
          rightArmElbowRef.current.rotation.x = THREE.MathUtils.lerp(rightArmElbowRef.current.rotation.x, 1.15, 0.05);
          if (!isPaused) {
            rightToolRef.current.rotation.z += 0.25;
          }
        } else if (missionState === 'VERIFICATION') {
          rightArmRef.current.rotation.y = THREE.MathUtils.lerp(rightArmRef.current.rotation.y, -0.7, 0.05);
          rightArmElbowRef.current.rotation.x = THREE.MathUtils.lerp(rightArmElbowRef.current.rotation.x, 0.9, 0.05);
        } else if (missionState === 'SUCCESS') {
          rightArmRef.current.rotation.y = THREE.MathUtils.lerp(rightArmRef.current.rotation.y, -0.2, 0.05);
          rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0.0, 0.05);
          rightArmElbowRef.current.rotation.x = THREE.MathUtils.lerp(rightArmElbowRef.current.rotation.x, 0.0, 0.05);
        } else {
          rightArmRef.current.rotation.y = THREE.MathUtils.lerp(rightArmRef.current.rotation.y, 0, 0.05);
          rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.05);
          rightArmElbowRef.current.rotation.x = THREE.MathUtils.lerp(rightArmElbowRef.current.rotation.x, 0, 0.05);
        }
      }

      renderer.render(scene, camera);
    };

    lastTimeRef.current = performance.now();
    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('contextmenu', onContextMenu);
      dom.removeEventListener('click', onClick);
      renderer.dispose();
    };
  }, []);

  // Helper to generate dynamic attire badges for the robot screen
  const getAttireCanvasTexture = (attire: BotAttire): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    if (attire === 'spacex-official') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 256, 160);

      // Cyan-blue border line
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 5;
      ctx.strokeRect(6, 6, 244, 148);

      // Bold aerospace SPACE-X BOT typography
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 24px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SPACE-X BOT', 128, 55);

      // Glowing blue horizontal accent bar
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(48, 70, 160, 6);

      // Subtitle
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('AI AUTONOMOUS SERVICER', 128, 105);

      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('HIGH-VISIBILITY · ACTIVE', 128, 130);
    } else if (attire === 'classic-tuxedo') {
      // Classic White-Tie Gala Dinner Suit: Crisp pearl-white silk background with double gold filigree
      ctx.fillStyle = '#fefce8';
      ctx.fillRect(0, 0, 256, 160);

      // Gold filigree double border
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.strokeRect(6, 6, 244, 148);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(12, 12, 232, 136);

      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 9px serif';
      ctx.textAlign = 'center';
      ctx.fillText('✦  WHITE-TIE CLASSIC GALA  ✦', 128, 28);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px Georgia, serif';
      ctx.fillText('SPACE X BOT', 128, 62);

      ctx.fillStyle = '#475569';
      ctx.font = 'italic 12px Georgia, serif';
      ctx.fillText('Classic Dapper Servicing Unit', 128, 88);

      ctx.fillStyle = '#d97706';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('▶ ❖ ◀', 128, 114);

      ctx.fillStyle = '#16a34a';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('STATUS: DAPPER & ULTRA-BRIGHT', 128, 138);
    } else if (attire === 'classic-apollo') {
      // Classic Apollo Heritage: Crisp white background with NASA Apollo red & blue stripes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 256, 160);

      // Header red ribbon
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(6, 6, 244, 22);

      // Blue border
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 5;
      ctx.strokeRect(6, 6, 244, 148);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('★ APOLLO HERITAGE ORBITAL MECH ★', 128, 21);

      ctx.fillStyle = '#0f172a';
      ctx.font = '900 23px monospace';
      ctx.fillText('SPACE X BOT', 128, 68);

      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('FLIGHT UNIT : SV-1969', 128, 98);

      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('SYS: ALL GO FOR SERVICING', 128, 132);
    } else if (attire === 'classic-dragon') {
      // Classic Dragon: Clean titanium white background with bold SpaceX blue accents
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 256, 160);

      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 4;
      ctx.strokeRect(6, 6, 244, 148);

      ctx.fillStyle = '#0f172a';
      ctx.font = '900 23px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SPACEX BOT', 128, 60);

      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('// DRAGON CREW ATTIRE //', 128, 92);

      ctx.fillStyle = '#16a34a';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('AUTONOMOUS PROTOCOL: OK', 128, 130);
    } else if (attire === 'classic-steampunk') {
      // Classic Victorian: Bright warm golden parchment with rich copper border
      ctx.fillStyle = '#fef9c3';
      ctx.fillRect(0, 0, 256, 160);

      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 5;
      ctx.strokeRect(6, 6, 244, 148);

      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 20px serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚙ SPACE X BOT ⚙', 128, 60);

      ctx.fillStyle = '#9a3412';
      ctx.font = 'italic 12px serif';
      ctx.fillText('Victorian Chronometer Spec', 128, 92);

      ctx.fillStyle = '#c2410c';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('PRESSURE & VACUUM: 100%', 128, 130);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 256, 160);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 4;
      ctx.strokeRect(6, 6, 244, 148);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SPACE X BOT', 128, 65);
      ctx.fillStyle = '#475569';
      ctx.font = '14px monospace';
      ctx.fillText('AUTONOMOUS UNIT', 128, 100);
      ctx.fillStyle = '#16a34a';
      ctx.fillText('SYS: OK', 128, 130);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  // Dedicated Bot Illumination Spotlight toggle
  useEffect(() => {
    if (botSpotlightRef.current) {
      botSpotlightRef.current.intensity = isBotSpotlightOn ? 5.0 : 0.8;
    }
    if (botRimLightRef.current) {
      botRimLightRef.current.intensity = isBotSpotlightOn ? 3.5 : 0.5;
    }
  }, [isBotSpotlightOn]);

  // Dynamic Bot Attire & Livery Update (Guaranteed High-Albedo & High Visibility against black space)
  useEffect(() => {
    if (!robotChassisMeshRef.current) return;

    const chassisMat = robotChassisMeshRef.current.material as THREE.MeshStandardMaterial;
    const trimMat = robotTopTrimRef.current ? (robotTopTrimRef.current.material as THREE.MeshStandardMaterial) : null;
    const leftEyeMat = robotLeftEyeRef.current ? (robotLeftEyeRef.current.material as THREE.MeshStandardMaterial) : null;
    const rightEyeMat = robotRightEyeRef.current ? (robotRightEyeRef.current.material as THREE.MeshStandardMaterial) : null;
    const lidarMat = robotLidarDomeRef.current ? (robotLidarDomeRef.current.material as THREE.MeshStandardMaterial) : null;

    if (botAttire === 'spacex-official') {
      // SpaceX Official: Brilliant high-albedo aerospace white with luminous cyan optics
      chassisMat.color.setHex(0xffffff);
      chassisMat.metalness = 0.15;
      chassisMat.roughness = 0.12;
      if (trimMat) {
        trimMat.color.setHex(0x1e293b);
        trimMat.metalness = 0.6;
      }
      if (leftEyeMat && rightEyeMat) {
        leftEyeMat.color.setHex(0x0284c7);
        leftEyeMat.emissive.setHex(0x00e5ff);
        leftEyeMat.emissiveIntensity = 2.5;
        rightEyeMat.color.setHex(0x0284c7);
        rightEyeMat.emissive.setHex(0x00e5ff);
        rightEyeMat.emissiveIntensity = 2.5;
      }
      if (lidarMat) {
        lidarMat.color.setHex(0x10b981);
        lidarMat.emissive.setHex(0x10b981);
        lidarMat.emissiveIntensity = 2.0;
      }
      if (robotBowtieGroupRef.current) robotBowtieGroupRef.current.visible = false;
      if (robotGoldFoilMeshRef.current) robotGoldFoilMeshRef.current.visible = false;
    } else if (botAttire === 'classic-tuxedo') {
      // Classic White-Tie Gala Tuxedo: Brilliant high-society white dinner jacket with satin lapels and 3D gold bowtie!
      chassisMat.color.setHex(0xffffff);
      chassisMat.metalness = 0.15;
      chassisMat.roughness = 0.12;
      if (trimMat) {
        trimMat.color.setHex(0x1e293b);
        trimMat.metalness = 0.5;
      }
      if (leftEyeMat && rightEyeMat) {
        leftEyeMat.color.setHex(0xf59e0b);
        leftEyeMat.emissive.setHex(0xfbbf24);
        leftEyeMat.emissiveIntensity = 2.5;
        rightEyeMat.color.setHex(0xf59e0b);
        rightEyeMat.emissive.setHex(0xfbbf24);
        rightEyeMat.emissiveIntensity = 2.5;
      }
      if (lidarMat) {
        lidarMat.color.setHex(0xfbbf24);
        lidarMat.emissive.setHex(0xfbbf24);
        lidarMat.emissiveIntensity = 2.0;
      }
      if (robotBowtieGroupRef.current) robotBowtieGroupRef.current.visible = true;
      if (robotGoldFoilMeshRef.current) robotGoldFoilMeshRef.current.visible = false;
    } else if (botAttire === 'classic-apollo') {
      // Classic Apollo Heritage: Lunar white ceramic hull with radiant gold thermal MLI blankets
      chassisMat.color.setHex(0xffffff);
      chassisMat.metalness = 0.1;
      chassisMat.roughness = 0.25;
      if (trimMat) {
        trimMat.color.setHex(0x1d4ed8);
        trimMat.metalness = 0.5;
      }
      if (leftEyeMat && rightEyeMat) {
        leftEyeMat.color.setHex(0xf59e0b);
        leftEyeMat.emissive.setHex(0xfbbf24);
        leftEyeMat.emissiveIntensity = 2.5;
        rightEyeMat.color.setHex(0xf59e0b);
        rightEyeMat.emissive.setHex(0xfbbf24);
        rightEyeMat.emissiveIntensity = 2.5;
      }
      if (lidarMat) {
        lidarMat.color.setHex(0x22c55e);
        lidarMat.emissive.setHex(0x22c55e);
        lidarMat.emissiveIntensity = 2.0;
      }
      if (robotBowtieGroupRef.current) robotBowtieGroupRef.current.visible = false;
      if (robotGoldFoilMeshRef.current) robotGoldFoilMeshRef.current.visible = true;
    } else if (botAttire === 'classic-dragon') {
      // Classic SpaceX Dragon Suit: Clean titanium white hull with electric blue optics
      chassisMat.color.setHex(0xffffff);
      chassisMat.metalness = 0.15;
      chassisMat.roughness = 0.15;
      if (trimMat) {
        trimMat.color.setHex(0x0f172a);
        trimMat.metalness = 0.6;
      }
      if (leftEyeMat && rightEyeMat) {
        leftEyeMat.color.setHex(0x0284c7);
        leftEyeMat.emissive.setHex(0x00e5ff);
        leftEyeMat.emissiveIntensity = 2.5;
        rightEyeMat.color.setHex(0x0284c7);
        rightEyeMat.emissive.setHex(0x00e5ff);
        rightEyeMat.emissiveIntensity = 2.5;
      }
      if (lidarMat) {
        lidarMat.color.setHex(0x06b6d4);
        lidarMat.emissive.setHex(0x06b6d4);
        lidarMat.emissiveIntensity = 2.0;
      }
      if (robotBowtieGroupRef.current) robotBowtieGroupRef.current.visible = false;
      if (robotGoldFoilMeshRef.current) robotGoldFoilMeshRef.current.visible = false;
    } else if (botAttire === 'classic-steampunk') {
      // Classic Victorian: Radiant polished golden mirror-brass (high visibility gold, not dark brown!)
      chassisMat.color.setHex(0xfde047);
      chassisMat.metalness = 0.55;
      chassisMat.roughness = 0.2;
      if (trimMat) {
        trimMat.color.setHex(0xea580c);
        trimMat.metalness = 0.7;
      }
      if (leftEyeMat && rightEyeMat) {
        leftEyeMat.color.setHex(0xf97316);
        leftEyeMat.emissive.setHex(0xf97316);
        leftEyeMat.emissiveIntensity = 2.8;
        rightEyeMat.color.setHex(0xf97316);
        rightEyeMat.emissive.setHex(0xf97316);
        rightEyeMat.emissiveIntensity = 2.8;
      }
      if (lidarMat) {
        lidarMat.color.setHex(0xf59e0b);
        lidarMat.emissive.setHex(0xf59e0b);
        lidarMat.emissiveIntensity = 2.2;
      }
      if (robotBowtieGroupRef.current) robotBowtieGroupRef.current.visible = false;
      if (robotGoldFoilMeshRef.current) robotGoldFoilMeshRef.current.visible = false;
    } else {
      chassisMat.color.setHex(0xffffff);
      chassisMat.metalness = 0.2;
      chassisMat.roughness = 0.15;
      if (trimMat) {
        trimMat.color.setHex(0x1e293b);
        trimMat.metalness = 0.5;
      }
      if (leftEyeMat && rightEyeMat) {
        leftEyeMat.color.setHex(0x06b6d4);
        leftEyeMat.emissive.setHex(0x06b6d4);
        leftEyeMat.emissiveIntensity = 2.0;
        rightEyeMat.color.setHex(0x06b6d4);
        rightEyeMat.emissive.setHex(0x06b6d4);
        rightEyeMat.emissiveIntensity = 2.0;
      }
      if (lidarMat) {
        lidarMat.color.setHex(0x10b981);
        lidarMat.emissive.setHex(0x10b981);
      }
      if (robotBowtieGroupRef.current) robotBowtieGroupRef.current.visible = false;
      if (robotGoldFoilMeshRef.current) robotGoldFoilMeshRef.current.visible = false;
    }

    // Apply attire badge if user hasn't uploaded a custom photo
    if (!robotImage && robotScreenMeshRef.current) {
      const tex = getAttireCanvasTexture(botAttire);
      (robotScreenMeshRef.current.material as THREE.MeshBasicMaterial).map = tex;
      (robotScreenMeshRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true;
    }
  }, [botAttire, robotImage]);

  // Update Robot Upload Texture if custom image is uploaded
  useEffect(() => {
    if (!robotScreenMeshRef.current) return;
    if (robotImage) {
      const loader = new THREE.TextureLoader();
      loader.load(
        robotImage,
        (loadedTexture) => {
          loadedTexture.colorSpace = THREE.SRGBColorSpace;
          (robotScreenMeshRef.current!.material as THREE.MeshBasicMaterial).map = loadedTexture;
          (robotScreenMeshRef.current!.material as THREE.MeshBasicMaterial).needsUpdate = true;
        },
        undefined,
        () => {
          if (robotTextureRef.current) {
            (robotScreenMeshRef.current!.material as THREE.MeshBasicMaterial).map = robotTextureRef.current;
            (robotScreenMeshRef.current!.material as THREE.MeshBasicMaterial).needsUpdate = true;
          }
        }
      );
    } else if (robotTextureRef.current) {
      (robotScreenMeshRef.current.material as THREE.MeshBasicMaterial).map = robotTextureRef.current;
      (robotScreenMeshRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true;
    }
  }, [robotImage]);

  // Update target robot position & orientation based on mission state
  useEffect(() => {
    switch (missionState) {
      case 'IDLE':
      case 'MONITORING':
        robotTargetPos.current.set(8.5, 3.8, 7.5);
        robotTargetRot.current.set(0, -Math.PI / 4, 0);
        break;

      case 'ANOMALY DETECTED':
        robotTargetPos.current.set(7.5, 3.0, 6.0);
        robotTargetRot.current.set(0, -Math.PI / 3, 0);
        break;

      case 'INSPECTION':
        robotTargetPos.current.set(3.5, 1.2, 3.8);
        robotTargetRot.current.set(-0.1, -0.6, 0);
        break;

      case 'DIAGNOSIS':
        robotTargetPos.current.set(1.9, -0.2, 1.9);
        robotTargetRot.current.set(0.05, -0.85, 0);
        break;

      case 'MAINTENANCE PLAN':
        robotTargetPos.current.set(1.85, -0.22, 1.85);
        robotTargetRot.current.set(0.05, -0.88, 0);
        break;

      case 'ARM POSITIONING':
        robotTargetPos.current.set(1.75, -0.25, 1.7);
        robotTargetRot.current.set(0.08, -0.92, 0);
        break;

      case 'INTERVENTION':
        robotTargetPos.current.set(1.7, -0.25, 1.62);
        robotTargetRot.current.set(0.08, -0.95, 0);
        break;

      case 'VERIFICATION':
        robotTargetPos.current.set(1.85, -0.2, 1.8);
        robotTargetRot.current.set(0.05, -0.85, 0);
        break;

      case 'SUCCESS':
        robotTargetPos.current.set(2.4, 0.4, 2.2);
        robotTargetRot.current.set(0, -0.6, 0);
        break;
    }
  }, [missionState]);

  // Handle Camera Presets
  useEffect(() => {
    switch (cameraPreset) {
      case 'default':
        targetSphericalRef.current = { radius: 13.5, theta: 0.85, phi: 1.25 };
        targetLookAtRef.current.set(0, 0, 0);
        break;
      case 'robot':
        targetSphericalRef.current = { radius: 5.5, theta: 1.2, phi: 1.3 };
        if (robotGroupRef.current) {
          targetLookAtRef.current.copy(robotGroupRef.current.position);
        } else {
          targetLookAtRef.current.set(3, 1, 3);
        }
        break;
      case 'connector':
        targetSphericalRef.current = { radius: 4.2, theta: 0.65, phi: 1.35 };
        targetLookAtRef.current.set(1.3, -0.3, 0.7);
        break;
      case 'earth':
        targetSphericalRef.current = { radius: 22.0, theta: 2.3, phi: 1.1 };
        targetLookAtRef.current.set(-2, -1, -2);
        break;
    }
  }, [cameraPreset]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Interactive Hover Tooltip */}
      {hoveredObject && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none px-3.5 py-1.5 rounded-md bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md text-xs font-mono text-cyan-300 shadow-xl shadow-cyan-950/40 flex items-center gap-2 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>OBJECT: {hoveredObject}</span>
          <span className="text-slate-400">· Click to inspect</span>
        </div>
      )}

      {/* Orbit Controls Help Pill */}
      <div className="absolute bottom-4 right-4 pointer-events-none flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 backdrop-blur-sm text-[11px] font-mono text-slate-400">
        <span>Rotate: Left Click + Drag</span>
        <span className="text-slate-600">|</span>
        <span>Zoom: Scroll</span>
        <span className="text-slate-600">|</span>
        <span>Pan: Right Click + Drag</span>
      </div>
    </div>
  );
};

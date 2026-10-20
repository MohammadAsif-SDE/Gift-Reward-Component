import React, { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
interface RewardSceneProps {
  onClaim: () => void;
  disabled?: boolean;
}
export function RewardScene({ onClaim, disabled }: RewardSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);
  const tweensRef = useRef<gsap.core.Tween[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const openedRef = useRef(false);
  const giftGroupRef = useRef<THREE.Group | null>(null);
  const lidGroupRef = useRef<THREE.Group | null>(null);
  const cardMeshRef = useRef<THREE.Mesh | null>(null);
  const innerLightRef = useRef<THREE.PointLight | null>(null);
  const goldMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const handleClick = useCallback(() => {
    if (disabled || openedRef.current) return;
    if (
    !giftGroupRef.current ||
    !lidGroupRef.current ||
    !cardMeshRef.current ||
    !innerLightRef.current)

    return;
    openedRef.current = true;
    const giftGroup = giftGroupRef.current;
    const lidGroup = lidGroupRef.current;
    const card = cardMeshRef.current;
    const innerLight = innerLightRef.current;
    // Kill idle animations
    tweensRef.current.forEach((t) => t.kill());
    tweensRef.current = [];
    timelineRef.current?.kill();
    // Snap rotation to current and stop
    gsap.to(giftGroup.rotation, {
      x: 0,
      duration: 0.3,
      ease: 'power2.out'
    });
    // Build the opening timeline
    const tl = gsap.timeline();
    // 1. Slight anticipation - gift squishes down
    tl.to(giftGroup.scale, {
      x: 1.05,
      y: 0.92,
      z: 1.05,
      duration: 0.2,
      ease: 'power2.in'
    });
    // 2. Gift bounces up, lid flies off
    tl.to(giftGroup.scale, {
      x: 1,
      y: 1.08,
      z: 1,
      duration: 0.15,
      ease: 'power2.out'
    });
    tl.to(
      lidGroup.position,
      {
        y: 3.5,
        duration: 0.8,
        ease: 'power2.out'
      },
      '-=0.1'
    );
    tl.to(
      lidGroup.rotation,
      {
        x: -0.8,
        z: 0.4,
        duration: 0.8,
        ease: 'power2.out'
      },
      '<'
    );
    tl.to(
      lidGroup.scale,
      {
        x: 0.6,
        y: 0.6,
        z: 0.6,
        duration: 0.8,
        ease: 'power2.out'
      },
      '<'
    );
    // Fade lid out
    tl.to(
      lidGroup,
      {
        visible: false,
        duration: 0
      },
      '-=0.1'
    );
    // 3. Inner light burst
    tl.to(
      innerLight,
      {
        intensity: 120,
        duration: 0.3,
        ease: 'power2.out'
      },
      '-=0.6'
    );
    tl.to(innerLight, {
      intensity: 40,
      duration: 0.5,
      ease: 'power2.inOut'
    });
    // 4. Reset gift scale
    tl.to(
      giftGroup.scale,
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.3,
        ease: 'power2.out'
      },
      '-=0.7'
    );
    // 5. Card rises from inside the box
    tl.set(
      card,
      {
        visible: true
      },
      '-=0.5'
    );
    tl.fromTo(
      card.position,
      {
        y: -0.1
      },
      {
        y: 2.2,
        duration: 1.0,
        ease: 'power2.out'
      },
      '-=0.5'
    );
    tl.fromTo(
      card.scale,
      {
        x: 0.01,
        y: 0.01,
        z: 0.01
      },
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.8,
        ease: 'back.out(1.5)'
      },
      '<'
    );
    tl.fromTo(
      card.rotation,
      {
        y: 0
      },
      {
        y: Math.PI * 2,
        duration: 1.0,
        ease: 'power2.out'
      },
      '<'
    );
    // 6. Card glows and pulses
    const cardMat = card.material as THREE.MeshStandardMaterial;
    tl.to(
      cardMat,
      {
        emissiveIntensity: 1.5,
        duration: 0.3,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1
      },
      '-=0.3'
    );
    // 7. Whole scene fades down, trigger callback
    tl.to(
      giftGroup.position,
      {
        y: -0.5,
        duration: 0.4,
        ease: 'power2.in'
      },
      '+=0.2'
    );
    tl.to(
      card.scale,
      {
        x: 1.3,
        y: 1.3,
        z: 1.3,
        duration: 0.3,
        ease: 'power2.in'
      },
      '<'
    );
    tl.to(
      card.position,
      {
        y: 2.5,
        duration: 0.3,
        ease: 'power2.in'
      },
      '<'
    );
    tl.call(() => {
      onClaim();
    });
  }, [onClaim, disabled]);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Scene
    const scene = new THREE.Scene();
    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.3, 5);
    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffd700, 0.3);
    scene.add(ambientLight);
    const mainLight = new THREE.PointLight(0xffd700, 80, 20);
    mainLight.position.set(3, 4, 5);
    scene.add(mainLight);
    const fillLight = new THREE.PointLight(0xff8c00, 40, 15);
    fillLight.position.set(-3, -2, 3);
    scene.add(fillLight);
    const rimLight = new THREE.PointLight(0xffffff, 30, 15);
    rimLight.position.set(0, 0, -4);
    scene.add(rimLight);
    const topLight = new THREE.PointLight(0xfffacd, 20, 12);
    topLight.position.set(0, 5, 2);
    scene.add(topLight);
    // Inner glow light (starts dim, bursts on open)
    const innerLight = new THREE.PointLight(0xffd700, 5, 8);
    innerLight.position.set(0, 0.3, 0);
    scene.add(innerLight);
    innerLightRef.current = innerLight;
    // ===== GIFT BOX =====
    const giftGroup = new THREE.Group();
    giftGroupRef.current = giftGroup;
    // -- Materials --
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0392b,
      metalness: 0.3,
      roughness: 0.4,
      emissive: 0x8b0000,
      emissiveIntensity: 0.15
    });
    const lidMaterial = new THREE.MeshStandardMaterial({
      color: 0xe74c3c,
      metalness: 0.35,
      roughness: 0.35,
      emissive: 0x8b0000,
      emissiveIntensity: 0.15
    });
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0xffa500,
      emissiveIntensity: 0.4
    });
    goldMatRef.current = goldMaterial;
    const bowMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0xffaa00,
      emissiveIntensity: 0.5
    });
    // -- Box body (stays in place) --
    const boxGeo = new THREE.BoxGeometry(1.4, 1.1, 1.4);
    const boxMesh = new THREE.Mesh(boxGeo, boxMaterial);
    boxMesh.position.y = -0.15;
    giftGroup.add(boxMesh);
    // Body ribbons (stay with box)
    const ribbonVGeo = new THREE.BoxGeometry(0.16, 1.13, 1.44);
    const ribbonV = new THREE.Mesh(ribbonVGeo, goldMaterial);
    ribbonV.position.y = -0.15;
    giftGroup.add(ribbonV);
    const ribbonHGeo = new THREE.BoxGeometry(1.44, 1.13, 0.16);
    const ribbonH = new THREE.Mesh(ribbonHGeo, goldMaterial);
    ribbonH.position.y = -0.15;
    giftGroup.add(ribbonH);
    // -- Lid group (flies off on open) --
    const lidGroup = new THREE.Group();
    lidGroupRef.current = lidGroup;
    const lidGeo = new THREE.BoxGeometry(1.52, 0.22, 1.52);
    const lidMesh = new THREE.Mesh(lidGeo, lidMaterial);
    lidMesh.position.y = 0.51;
    lidGroup.add(lidMesh);
    // Lid ribbons
    const lidRibbonVGeo = new THREE.BoxGeometry(0.16, 0.24, 1.56);
    const lidRibbonV = new THREE.Mesh(lidRibbonVGeo, goldMaterial);
    lidRibbonV.position.y = 0.51;
    lidGroup.add(lidRibbonV);
    const lidRibbonHGeo = new THREE.BoxGeometry(1.56, 0.24, 0.16);
    const lidRibbonH = new THREE.Mesh(lidRibbonHGeo, goldMaterial);
    lidRibbonH.position.y = 0.51;
    lidGroup.add(lidRibbonH);
    // Bow loops
    const bowLoopGeo = new THREE.TorusGeometry(0.22, 0.06, 8, 24, Math.PI);
    const bowLoop1 = new THREE.Mesh(bowLoopGeo, bowMaterial);
    bowLoop1.position.set(-0.15, 0.72, 0);
    bowLoop1.rotation.z = Math.PI * 0.15;
    bowLoop1.rotation.x = Math.PI * 0.5;
    lidGroup.add(bowLoop1);
    const bowLoop2 = new THREE.Mesh(bowLoopGeo, bowMaterial);
    bowLoop2.position.set(0.15, 0.72, 0);
    bowLoop2.rotation.z = -Math.PI * 0.15;
    bowLoop2.rotation.x = Math.PI * 0.5;
    bowLoop2.scale.x = -1;
    lidGroup.add(bowLoop2);
    const bowLoop3 = new THREE.Mesh(bowLoopGeo, bowMaterial);
    bowLoop3.position.set(0, 0.72, -0.15);
    bowLoop3.rotation.y = Math.PI * 0.5;
    bowLoop3.rotation.x = Math.PI * 0.5;
    bowLoop3.rotation.z = Math.PI * 0.15;
    lidGroup.add(bowLoop3);
    const bowLoop4 = new THREE.Mesh(bowLoopGeo, bowMaterial);
    bowLoop4.position.set(0, 0.72, 0.15);
    bowLoop4.rotation.y = Math.PI * 0.5;
    bowLoop4.rotation.x = Math.PI * 0.5;
    bowLoop4.rotation.z = -Math.PI * 0.15;
    bowLoop4.scale.x = -1;
    lidGroup.add(bowLoop4);
    // Bow center knot
    const knotGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const knot = new THREE.Mesh(knotGeo, bowMaterial);
    knot.position.y = 0.72;
    knot.scale.y = 0.7;
    lidGroup.add(knot);
    giftGroup.add(lidGroup);
    // -- Reward card (hidden inside box, rises on open) --
    const cardGeo = new THREE.BoxGeometry(0.9, 1.2, 0.05, 1, 1, 1);
    const cardFrontMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0xffa500,
      emissiveIntensity: 0.5
    });
    const cardMesh = new THREE.Mesh(cardGeo, cardFrontMat);
    cardMesh.position.y = -0.1;
    cardMesh.visible = false;
    giftGroup.add(cardMesh);
    cardMeshRef.current = cardMesh;
    // Small star decorations on the card (embedded)
    const starDeco1Geo = new THREE.OctahedronGeometry(0.08, 0);
    const starDecoMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.8,
      roughness: 0.1,
      emissive: 0xffffff,
      emissiveIntensity: 0.8
    });
    const starDeco1 = new THREE.Mesh(starDeco1Geo, starDecoMat);
    starDeco1.position.set(0, 0.35, 0.04);
    cardMesh.add(starDeco1);
    const starDeco2 = new THREE.Mesh(starDeco1Geo, starDecoMat);
    starDeco2.position.set(-0.25, -0.1, 0.04);
    starDeco2.scale.setScalar(0.7);
    cardMesh.add(starDeco2);
    const starDeco3 = new THREE.Mesh(starDeco1Geo, starDecoMat);
    starDeco3.position.set(0.25, 0.05, 0.04);
    starDeco3.scale.setScalar(0.5);
    cardMesh.add(starDeco3);
    // Gem in center of card
    const gemGeo = new THREE.IcosahedronGeometry(0.15, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0xff6b6b,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xff4444,
      emissiveIntensity: 0.6
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.set(0, 0, 0.06);
    cardMesh.add(gem);
    scene.add(giftGroup);
    // ===== IDLE ANIMATIONS =====
    const tl = gsap.timeline({
      repeat: -1
    });
    tl.to(giftGroup.rotation, {
      y: Math.PI * 2,
      duration: 10,
      ease: 'none'
    });
    timelineRef.current = tl;
    const bobTween = gsap.to(giftGroup.position, {
      y: 0.2,
      duration: 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });
    tweensRef.current.push(bobTween);
    const tiltTween = gsap.to(giftGroup.rotation, {
      x: 0.1,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });
    tweensRef.current.push(tiltTween);
    // ===== RENDER LOOP =====
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      // Spin gem and stars on card if visible
      if (cardMesh.visible) {
        gem.rotation.y += 0.03;
        gem.rotation.x += 0.01;
        starDeco1.rotation.y += 0.02;
        starDeco2.rotation.y -= 0.03;
        starDeco3.rotation.y += 0.025;
      }
      renderer.render(scene, camera);
    };
    animate();
    // Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    // Hover
    const handleMouseEnter = () => {
      if (disabled || openedRef.current) return;
      gsap.to(giftGroup.scale, {
        x: 1.12,
        y: 1.12,
        z: 1.12,
        duration: 0.3,
        ease: 'power2.out'
      });
      gsap.to(goldMaterial, {
        emissiveIntensity: 0.8,
        duration: 0.3
      });
    };
    const handleMouseLeave = () => {
      if (openedRef.current) return;
      gsap.to(giftGroup.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
      gsap.to(goldMaterial, {
        emissiveIntensity: 0.4,
        duration: 0.3
      });
    };
    renderer.domElement.addEventListener('mouseenter', handleMouseEnter);
    renderer.domElement.addEventListener('mouseleave', handleMouseLeave);
    renderer.domElement.style.cursor = disabled ? 'default' : 'pointer';
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mouseenter', handleMouseEnter);
      renderer.domElement.removeEventListener('mouseleave', handleMouseLeave);
      tweensRef.current.forEach((t) => t.kill());
      timelineRef.current?.kill();
      gsap.killTweensOf([
      giftGroup.rotation,
      giftGroup.scale,
      giftGroup.position]
      );
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [disabled]);
  // Reset opened state when re-enabled
  useEffect(() => {
    if (!disabled) {
      openedRef.current = false;
    }
  }, [disabled]);
  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Click to open your gift"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="relative w-full h-full"
      style={{
        minHeight: 300
      }} />);


}
import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Billboard, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function createCardTexture(title, description) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, 'rgba(255,255,255,0.16)');
  gradient.addColorStop(0.46, 'rgba(255,255,255,0.055)');
  gradient.addColorStop(1, 'rgba(99,102,241,0.18)');
  ctx.fillStyle = gradient;
  roundRect(ctx, 0, 0, canvas.width, canvas.height, 48);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 3;
  roundRect(ctx, 6, 6, canvas.width - 12, canvas.height - 12, 44);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = '700 54px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif';
  ctx.fillText(title, 56, 145);

  ctx.fillStyle = 'rgba(235,235,245,0.72)';
  ctx.font = '500 32px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif';
  wrapText(ctx, description, 56, 210, 620, 44);

  ctx.fillStyle = 'rgba(99,102,241,0.92)';
  ctx.beginPath();
  ctx.arc(665, 92, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.font = '700 34px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AI', 665, 92);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';

  words.forEach((word, index) => {
    const testLine = `${line}${word} `;
    if (ctx.measureText(testLine).width > maxWidth && index > 0) {
      ctx.fillText(line, x, y);
      line = `${word} `;
      y += lineHeight;
    } else {
      line = testLine;
    }
  });

  ctx.fillText(line, x, y);
}

function ParticleSphere({ items, reducedMotion = false }) {
  const PARTICLE_COUNT = 950;
  const SPHERE_RADIUS = 4.35;
  const groupRef = useRef(null);

  const particles = useMemo(() => (
    Array.from({ length: PARTICLE_COUNT }, (_, index) => {
      const phi = Math.acos(-1 + (2 * index) / PARTICLE_COUNT);
      const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
      const radius = SPHERE_RADIUS + (Math.random() - 0.5) * 1.65;

      return {
        position: [
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.cos(phi),
          radius * Math.sin(theta) * Math.sin(phi),
        ],
        scale: 0.014 + Math.random() * 0.018,
        opacity: 0.42 + Math.random() * 0.52,
      };
    })
  ), []);

  const cardTextures = useMemo(() => items.map((item) => createCardTexture(item.title, item.description)), [items]);

  useEffect(() => () => {
    cardTextures.forEach((texture) => texture.dispose());
  }, [cardTextures]);

  const orbitingCards = useMemo(() => (
    items.map((item, index) => {
      const angle = (index / items.length) * Math.PI * 2;
      const radius = SPHERE_RADIUS * 1.08;
      return {
        ...item,
        texture: cardTextures[index],
        position: [
          radius * Math.cos(angle),
          Math.sin(index * 1.7) * 0.58,
          radius * Math.sin(angle),
        ],
      };
    })
  ), [items, cardTextures]);

  useFrame(() => {
    if (!groupRef.current || reducedMotion) return;
    groupRef.current.rotation.y += 0.0012;
  });

  return (
    <group ref={groupRef}>
      {particles.map((particle, index) => (
        <mesh key={index} position={particle.position} scale={particle.scale}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial color="#f5f5f7" transparent opacity={particle.opacity} />
        </mesh>
      ))}

      {orbitingCards.map((card, index) => (
        <Billboard key={card.title} position={card.position} follow lockX={false} lockY={false} lockZ={false}>
          <mesh renderOrder={index + 1}>
            <planeGeometry args={[3.45, 1.72]} />
            <meshBasicMaterial map={card.texture} transparent side={THREE.DoubleSide} />
          </mesh>
        </Billboard>
      ))}
    </group>
  );
}

export function OrbitGallery({ items, reducedMotion = false }) {
  return (
    <Canvas
      camera={{ position: [-6.35, 1.35, 6.35], fov: 44 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.95} />
      <pointLight position={[8, 8, 8]} intensity={1.25} />
      <ParticleSphere items={items} reducedMotion={reducedMotion} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={!reducedMotion}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.28}
      />
    </Canvas>
  );
}

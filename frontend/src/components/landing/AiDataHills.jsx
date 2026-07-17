import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uMotion;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.52;

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p *= 2.02;
      amplitude *= 0.48;
    }

    return value;
  }

  float waveLine(vec2 uv, float offset, float speed, float height, float thickness) {
    float t = uTime * speed * uMotion;
    float n = fbm(vec2(uv.x * 2.15 + offset, t + offset));
    float line = height + sin((uv.x + offset) * 5.8 + t) * 0.035 + (n - 0.5) * 0.18;
    return smoothstep(thickness, 0.0, abs(uv.y - line));
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 centered = uv - 0.5;
    centered.x *= uResolution.x / uResolution.y;

    vec3 bg = vec3(0.043, 0.059, 0.098);
    vec3 panel = vec3(0.118, 0.161, 0.235);
    vec3 indigo = vec3(0.388, 0.400, 0.945);
    vec3 cyan = vec3(0.220, 0.741, 0.969);
    vec3 text = vec3(0.886, 0.910, 0.941);

    float horizon = smoothstep(1.04, 0.18, uv.y);
    float depthGlow = exp(-dot(centered * vec2(0.86, 1.2), centered * vec2(0.86, 1.2)) * 2.25);
    float scan = sin((uv.x + uv.y * 0.65 + uTime * 0.018 * uMotion) * 95.0) * 0.5 + 0.5;

    vec3 color = mix(bg, panel * 0.7, horizon * 0.18);
    color += indigo * depthGlow * 0.26;
    color += cyan * exp(-length(centered - vec2(0.36, -0.02)) * 4.2) * 0.11;

    float lines = 0.0;
    lines += waveLine(uv, 0.12, 0.105, 0.27, 0.012) * 0.52;
    lines += waveLine(uv, 0.84, 0.085, 0.34, 0.010) * 0.42;
    lines += waveLine(uv, 1.58, 0.070, 0.43, 0.009) * 0.32;
    lines += waveLine(uv, 2.26, 0.055, 0.53, 0.008) * 0.24;

    float mesh = smoothstep(0.985, 1.0, sin((uv.x * 58.0) + fbm(vec2(uv.y * 4.0, uTime * 0.025 * uMotion)) * 2.0));
    mesh *= smoothstep(0.06, 0.68, uv.y) * smoothstep(0.94, 0.22, uv.y);

    color += mix(indigo, cyan, uv.x) * lines * 0.72;
    color += text * lines * 0.08;
    color += indigo * mesh * scan * 0.055;

    float vignette = smoothstep(0.92, 0.18, length(centered));
    color *= 0.55 + vignette * 0.62;
    color *= smoothstep(0.0, 0.18, uv.y);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function AiDataHills({ className = '' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uMotion: { value: prefersReducedMotion.matches ? 0 : 1 },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      depthWrite: false,
      depthTest: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let frameId = 0;
    let resizeId = 0;
    let isVisible = document.visibilityState === 'visible';
    const clock = new THREE.Clock();

    const resize = () => {
      resizeId = 0;
      const { width, height } = mount.getBoundingClientRect();
      const safeWidth = Math.max(1, Math.floor(width));
      const safeHeight = Math.max(1, Math.floor(height));
      renderer.setSize(safeWidth, safeHeight, false);
      uniforms.uResolution.value.set(safeWidth, safeHeight);
    };

    const scheduleResize = () => {
      if (resizeId) return;
      resizeId = window.setTimeout(resize, 120);
    };

    const render = () => {
      if (!isVisible) return;
      uniforms.uTime.value += clock.getDelta();
      uniforms.uMotion.value = prefersReducedMotion.matches ? 0 : 1;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };

    const handleVisibility = () => {
      isVisible = document.visibilityState === 'visible';
      if (isVisible) {
        clock.getDelta();
        frameId = window.requestAnimationFrame(render);
      } else if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    resize();
    frameId = window.requestAnimationFrame(render);
    window.addEventListener('resize', scheduleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('resize', scheduleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (resizeId) window.clearTimeout(resizeId);
      if (frameId) window.cancelAnimationFrame(frameId);
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}

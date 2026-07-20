import { useEffect, useId, useRef } from 'react';
import { animate, useMotionValue } from 'framer-motion';

function mapRange(value, fromLow, fromHigh, toLow, toHigh) {
  if (fromLow === fromHigh) {
    return toLow;
  }

  const percentage = (value - fromLow) / (fromHigh - fromLow);
  return toLow + percentage * (toHigh - toLow);
}

function useInstanceId() {
  return `shadowoverlay-${useId().replace(/:/g, '')}`;
}

export function ShadowOverlayBackground({
  sizing = 'fill',
  color = 'rgba(0, 0, 0, 0.72)',
  animation = { scale: 56, speed: 36 },
  noise = { opacity: 0.18, scale: 0.82 },
  className = '',
}) {
  const id = useInstanceId();
  const feColorMatrixRef = useRef(null);
  const hueRotateMotionValue = useMotionValue(180);
  const hueRotateAnimation = useRef(null);
  const animationEnabled = animation && animation.scale > 0;

  const displacementScale = animation ? mapRange(animation.scale, 1, 100, 20, 100) : 0;
  const animationDuration = animation ? mapRange(animation.speed, 1, 100, 1000, 50) : 1;

  useEffect(() => {
    if (!feColorMatrixRef.current || !animationEnabled) {
      return undefined;
    }

    hueRotateAnimation.current?.stop();
    hueRotateMotionValue.set(0);
    hueRotateAnimation.current = animate(hueRotateMotionValue, 360, {
      duration: animationDuration / 25,
      repeat: Infinity,
      repeatType: 'loop',
      repeatDelay: 0,
      ease: 'linear',
      delay: 0,
      onUpdate: (value) => {
        feColorMatrixRef.current?.setAttribute('values', String(value));
      },
    });

    return () => {
      hueRotateAnimation.current?.stop();
    };
  }, [animationDuration, animationEnabled, hueRotateMotionValue]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}
    >
      <div
        className="absolute inset-0"
        style={{
          filter: animationEnabled ? `url(#${id}) blur(4px)` : 'none',
          inset: -displacementScale,
        }}
      >
        {animationEnabled ? (
          <svg className="absolute h-0 w-0">
            <defs>
              <filter id={id}>
                <feTurbulence
                  result="undulation"
                  numOctaves="2"
                  baseFrequency={`${mapRange(animation.scale, 0, 100, 0.001, 0.0005)},${mapRange(
                    animation.scale,
                    0,
                    100,
                    0.004,
                    0.002,
                  )}`}
                  seed="0"
                  type="turbulence"
                />
                <feColorMatrix
                  ref={feColorMatrixRef}
                  in="undulation"
                  type="hueRotate"
                  values="180"
                />
                <feColorMatrix
                  in="dist"
                  result="circulation"
                  type="matrix"
                  values="4 0 0 0 1  4 0 0 0 1  4 0 0 0 1  1 0 0 0 0"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="circulation"
                  scale={displacementScale}
                  result="dist"
                />
                <feDisplacementMap
                  in="dist"
                  in2="undulation"
                  scale={displacementScale}
                  result="output"
                />
              </filter>
            </defs>
          </svg>
        ) : null}

        <div
          className="h-full w-full"
          style={{
            backgroundColor: color,
            WebkitMaskImage: "url('https://framerusercontent.com/images/ceBGguIpUU8luwByxuQz79t7To.png')",
            maskImage: "url('https://framerusercontent.com/images/ceBGguIpUU8luwByxuQz79t7To.png')",
            WebkitMaskSize: sizing === 'stretch' ? '100% 100%' : 'cover',
            maskSize: sizing === 'stretch' ? '100% 100%' : 'cover',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
      </div>

      {noise && noise.opacity > 0 ? (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url("https://framerusercontent.com/images/g0QcWrxr87K0ufOxIUFBakwYA8.png")',
            backgroundSize: noise.scale * 200,
            backgroundRepeat: 'repeat',
            opacity: noise.opacity / 2,
          }}
        />
      ) : null}
    </div>
  );
}

"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type Uniforms = {
  [key: string]: {
    value: number[] | number[][] | number;
    type: string;
  };
};

interface ShaderProps {
  source: string;
  uniforms: Uniforms;
}

export function CanvasRevealEffect({
  animationSpeed = 10,
  opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
  colors = [[0, 255, 255]],
  dotSize,
  reverse = false,
}: {
  animationSpeed?: number;
  opacities?: number[];
  colors?: number[][];
  dotSize?: number;
  reverse?: boolean;
}) {
  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <div style={{ height: "100%", width: "100%" }}>
        <DotMatrix
          colors={colors}
          dotSize={dotSize ?? 3}
          opacities={opacities}
          reverse={reverse}
          animationSpeed={animationSpeed}
          center={["x", "y"]}
        />
      </div>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, #090909, transparent)",
      }} />
    </div>
  );
}

interface DotMatrixProps {
  colors?: number[][];
  opacities?: number[];
  totalSize?: number;
  dotSize?: number;
  reverse?: boolean;
  animationSpeed?: number;
  center?: ("x" | "y")[];
}

const DotMatrix: React.FC<DotMatrixProps> = ({
  colors = [[0, 0, 0]],
  opacities = [0.04, 0.04, 0.04, 0.04, 0.04, 0.08, 0.08, 0.08, 0.08, 0.14],
  totalSize = 20,
  dotSize = 2,
  reverse = false,
  animationSpeed = 10,
  center = ["x", "y"],
}) => {
  const uniforms = useMemo(() => {
    let colorsArray = [colors[0], colors[0], colors[0], colors[0], colors[0], colors[0]];
    if (colors.length === 2) {
      colorsArray = [colors[0], colors[0], colors[0], colors[1], colors[1], colors[1]];
    } else if (colors.length === 3) {
      colorsArray = [colors[0], colors[0], colors[1], colors[1], colors[2], colors[2]];
    }
    return {
      u_colors: {
        value: colorsArray.map((c) => [c[0] / 255, c[1] / 255, c[2] / 255]),
        type: "uniform3fv",
      },
      u_opacities: { value: opacities, type: "uniform1fv" },
      u_total_size: { value: totalSize, type: "uniform1f" },
      u_dot_size: { value: dotSize, type: "uniform1f" },
      u_reverse: { value: reverse ? 1 : 0, type: "uniform1i" },
    };
  }, [colors, opacities, totalSize, dotSize, reverse]);

  return (
    <Shader
      source={`
        precision mediump float;
        in vec2 fragCoord;
        uniform float u_time;
        uniform float u_opacities[10];
        uniform vec3 u_colors[6];
        uniform float u_total_size;
        uniform float u_dot_size;
        uniform vec2 u_resolution;
        uniform int u_reverse;
        out vec4 fragColor;

        float PHI = 1.61803398874989484820459;
        float random(vec2 xy) {
          return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
        }

        void main() {
          vec2 st = fragCoord.xy;
          ${center.includes("x") ? "st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));" : ""}
          ${center.includes("y") ? "st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));" : ""}

          float opacity = step(0.0, st.x);
          opacity *= step(0.0, st.y);

          vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

          float frequency = 5.0;
          float show_offset = random(st2);
          float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
          opacity *= u_opacities[int(rand * 10.0)];
          opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
          opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

          vec3 color = u_colors[int(show_offset * 6.0)];

          float animation_speed_factor = ${(animationSpeed * 0.05).toFixed(2)};
          vec2 center_grid = u_resolution / 2.0 / u_total_size;
          float dist_from_center = distance(center_grid, st2);

          float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);
          float max_grid_dist = distance(center_grid, vec2(0.0, 0.0));
          float timing_offset_outro = (max_grid_dist - dist_from_center) * 0.02 + (random(st2 + 42.0) * 0.2);

          if (u_reverse == 1) {
            float t = timing_offset_outro;
            opacity *= 1.0 - step(t, u_time * animation_speed_factor);
            opacity *= clamp((step(t + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
          } else {
            float t = timing_offset_intro;
            opacity *= step(t, u_time * animation_speed_factor);
            opacity *= clamp((1.0 - step(t + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
          }

          fragColor = vec4(color, opacity);
          fragColor.rgb *= fragColor.a;
        }`}
      uniforms={uniforms}
    />
  );
};

function ShaderMaterial({ source, uniforms }: ShaderProps) {
  const { size } = useThree();
  const ref = useRef<THREE.Mesh>(null);
  const startTime = useRef(performance.now());

  useFrame(() => {
    if (!ref.current) return;
    const material = ref.current.material as THREE.ShaderMaterial;
    material.uniforms.u_time.value = (performance.now() - startTime.current) / 1000;
  });

  const getUniforms = () => {
    const prepared: Record<string, { value: unknown }> = {};
    for (const name in uniforms) {
      const u = uniforms[name];
      switch (u.type) {
        case "uniform1f":
          prepared[name] = { value: u.value };
          break;
        case "uniform1i":
          prepared[name] = { value: u.value };
          break;
        case "uniform3f":
          prepared[name] = { value: new THREE.Vector3().fromArray(u.value as number[]) };
          break;
        case "uniform1fv":
          prepared[name] = { value: u.value };
          break;
        case "uniform3fv":
          prepared[name] = { value: (u.value as number[][]).map((v) => new THREE.Vector3().fromArray(v)) };
          break;
        case "uniform2f":
          prepared[name] = { value: new THREE.Vector2().fromArray(u.value as number[]) };
          break;
      }
    }
    prepared["u_time"] = { value: 0 };
    prepared["u_resolution"] = { value: new THREE.Vector2(size.width * 2, size.height * 2) };
    return prepared;
  };

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        precision mediump float;
        in vec2 coordinates;
        uniform vec2 u_resolution;
        out vec2 fragCoord;
        void main(){
          float x = position.x;
          float y = position.y;
          gl_Position = vec4(x, y, 0.0, 1.0);
          fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
          fragCoord.y = u_resolution.y - fragCoord.y;
        }
      `,
      fragmentShader: source,
      uniforms: getUniforms(),
      glslVersion: THREE.GLSL3,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height, source]);

  return (
    <mesh ref={ref}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

const Shader: React.FC<ShaderProps> = ({ source, uniforms }) => {
  return (
    <Canvas style={{ position: "absolute", inset: 0, height: "100%", width: "100%" }}>
      <ShaderMaterial source={source} uniforms={uniforms} />
    </Canvas>
  );
};

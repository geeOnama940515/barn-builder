import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Text, Line } from '@react-three/drei';
import { useBuildingStore } from '../store/buildingStore';
import Building from './3d/Building';
import FloorPlan from './FloorPlan';
import type { ViewMode } from '../types';

const DimensionLine: React.FC<{
  start: [number, number, number];
  end: [number, number, number];
  text: string;
  offset?: number;
  vertical?: boolean;
}> = ({ start, end, text, offset = 2, vertical = false }) => {
  const points = [start, end];
  
  const textPosition: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2 + (vertical ? 0 : 0.5),
    (start[2] + end[2]) / 2,
  ];

  return (
    <group>
      <Line
        points={points}
        color="black"
        lineWidth={2}
        dashed={true}
        dashSize={0.5}
        dashScale={2}
      />
      <Text
        position={textPosition}
        fontSize={1.2}
        color="black"
        anchorX="center"
        anchorY="middle"
        rotation={vertical ? [0, 0, 0] : [-Math.PI / 2, 0, 0]}
      >
        {text}
      </Text>
    </group>
  );
};

const WallLabel: React.FC<{
  position: [number, number, number];
  text: string;
  rotation?: [number, number, number];
}> = ({ position, text, rotation = [0, 0, 0] }) => {
  return (
    <Text
      position={position}
      rotation={rotation}
      fontSize={1.5}
      color="black"
      anchorX="center"
      anchorY="middle"
      renderOrder={1}
    >
      {text}
    </Text>
  );
};

const Dimensions: React.FC = () => {
  const dimensions = useBuildingStore((state) => state.currentProject.building.dimensions);
  const halfWidth = dimensions.width / 2;
  const halfLength = dimensions.length / 2;
  const offset = 2;
  const heightOffset = 0.2;
  
  const roofHeight = (dimensions.width / 2) * (dimensions.roofPitch / 12);
  const totalHeight = dimensions.height + roofHeight;

  return (
    <group position={[0, heightOffset, 0]}>
      <DimensionLine
        start={[-halfWidth, 0, halfLength + offset]}
        end={[halfWidth, 0, halfLength + offset]}
        text={`${dimensions.width} ft`}
      />
      
      <DimensionLine
        start={[halfWidth + offset, 0, -halfLength]}
        end={[halfWidth + offset, 0, halfLength]}
        text={`${dimensions.length} ft`}
      />
      
      <DimensionLine
        start={[-halfWidth - offset, 0, halfLength]}
        end={[-halfWidth - offset, dimensions.height, halfLength]}
        text={`${dimensions.height} ft`}
        vertical={true}
      />
      
      <DimensionLine
        start={[halfWidth + offset, 0, halfLength]}
        end={[halfWidth + offset, totalHeight, halfLength]}
        text={`${totalHeight.toFixed(1)} ft`}
        vertical={true}
      />
      
      <WallLabel
        position={[0, 0, halfLength + offset + 4]}
        text="FRONT"
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <WallLabel
        position={[0, 0, -halfLength - offset - 2]}
        text="BACK"
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <WallLabel
        position={[-halfWidth - offset - 2, 0, 0]}
        text="LEFT"
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
      />
      <WallLabel
        position={[halfWidth + offset + 2, 0, 0]}
        text="RIGHT"
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
      />
      
      <Line
        points={[
          [-halfWidth - 0.5, 0, halfLength + 0.5],
          [-halfWidth - 0.5, 0, halfLength - 0.5],
          [-halfWidth + 0.5, 0, halfLength - 0.5]
        ]}
        color="black"
        lineWidth={2}
      />
      <Line
        points={[
          [halfWidth + 0.5, 0, halfLength + 0.5],
          [halfWidth + 0.5, 0, halfLength - 0.5],
          [halfWidth - 0.5, 0, halfLength - 0.5]
        ]}
        color="black"
        lineWidth={2}
      />
      <Line
        points={[
          [-halfWidth - 0.5, 0, -halfLength + 0.5],
          [-halfWidth - 0.5, 0, -halfLength - 0.5],
          [-halfWidth + 0.5, 0, -halfLength - 0.5]
        ]}
        color="black"
        lineWidth={2}
      />
      <Line
        points={[
          [halfWidth + 0.5, 0, -halfLength + 0.5],
          [halfWidth + 0.5, 0, -halfLength - 0.5],
          [halfWidth - 0.5, 0, -halfLength - 0.5]
        ]}
        color="black"
        lineWidth={2}
      />
    </group>
  );
};

const CameraController: React.FC<{ view: ViewMode }> = ({ view }) => {
  const { camera } = useThree();
  const controls = useRef(null);
  
  useEffect(() => {
    switch (view) {
      case '3d':
        camera.position.set(60, 45, 60);
        camera.lookAt(0, 0, 0);
        break;
      case 'plan':
        camera.position.set(0, 50, 0);
        camera.lookAt(0, 0, 0);
        break;
      case 'floor':
        camera.position.set(0, 15, 45);
        camera.lookAt(0, 0, 0);
        break;
    }
  }, [view, camera]);

  return (
    <OrbitControls 
      ref={controls} 
      maxPolarAngle={Math.PI / 2} 
      minDistance={10}
      maxDistance={200}
    />
  );
};

interface Canvas3DProps {
  view: ViewMode;
}

const Canvas3D: React.FC<Canvas3DProps> = ({ view }) => {
  if (view === 'plan') {
    return <FloorPlan />;
  }

  return (
    <Canvas 
      shadows 
      className="w-full h-full"
      camera={{ position: [60, 45, 60], fov: 50 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <PerspectiveCamera makeDefault position={[60, 45, 60]} fov={50} />
      <CameraController view={view} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          color="#E2E8F0"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      <Grid 
        args={[200, 200]} 
        cellSize={1}
        cellThickness={0.5}
        cellColor="#94A3B8" 
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#64748B"
        fadeDistance={100}
        fadeStrength={1}
        infiniteGrid
        position={[0, 0.01, 0]}
      />
      
      <Building />
      <Dimensions />
    </Canvas>
  );
};

export default Canvas3D;
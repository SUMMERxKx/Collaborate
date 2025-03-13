'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { Suspense, useState, Component, ReactNode } from 'react';

function Model() {
  const { scene } = useGLTF('/models/harry.glb', true);
  return <primitive object={scene} scale={0.5} position={[0, 0, 0]} />;
}

function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="text-white text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg">Loading 3D Model...</p>
      </div>
    </div>
  );
}

function ErrorScreen() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="text-white text-center">
        <p className="text-lg text-red-500">Failed to load 3D Model</p>
        <p className="text-sm mt-2">Please try refreshing the page</p>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error loading 3D model:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function Scene3D() {
  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
      <Model />
      <OrbitControls 
        enableZoom={false} 
        minPolarAngle={Math.PI / 3} 
        maxPolarAngle={Math.PI / 2}
      />
      <Environment preset="sunset" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </Canvas>
  );
}

export default function Scene() {
  const [error, setError] = useState(false);

  return (
    <div className="w-full h-screen relative">
      <Suspense fallback={<LoadingScreen />}>
        <ErrorBoundary fallback={<ErrorScreen />}>
          <Scene3D />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
} 
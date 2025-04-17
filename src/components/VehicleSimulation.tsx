
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useToast } from "@/hooks/use-toast";
import { Check, MapPin, Activity, Settings, ChevronDown, ChevronUp, RotateCcw, Route, Target } from "lucide-react";

interface MotorData {
  maxVoltage: number;
  maxRPM: number;
  resistance: number;
  torqueConstant: number;
}

// Real DC motor data (approximation of Tesla Model 3 drive unit motors)
const motorData: MotorData = {
  maxVoltage: 400, // Volts
  maxRPM: 18000, // RPM
  resistance: 0.1, // Ohms
  torqueConstant: 0.5, // Nm/A
};

// Vehicle dimensions
const WHEEL_RADIUS = 0.15; // meters
const WHEEL_WIDTH = 0.08; // meters
const VEHICLE_LENGTH = 0.6; // meters
const VEHICLE_WIDTH = 0.4; // meters
const VEHICLE_HEIGHT = 0.1; // meters

// Tesla brand colors
const TESLA_RED = "#E82127";
const TESLA_SILVER = "#E8E8E8";
const TESLA_DARK = "#222222";
const TESLA_LIGHT_GRAY = "#F4F4F4";

// The Vehicle component with improved animation and design
const Vehicle: React.FC<{
  leftVoltage: number;
  rightVoltage: number;
  axleOffset: number;
  position: [number, number, number];
  rotation: [number, number, number];
}> = ({ leftVoltage, rightVoltage, axleOffset, position, rotation }) => {
  // Calculate motor speeds from voltages (simplified model)
  const leftMotorSpeed = (leftVoltage / motorData.maxVoltage) * motorData.maxRPM;
  const rightMotorSpeed = (rightVoltage / motorData.maxVoltage) * motorData.maxRPM;
  
  // Convert RPM to rad/s for visualization
  const leftWheelSpeed = leftMotorSpeed * (Math.PI / 30); // RPM to rad/s
  const rightWheelSpeed = rightMotorSpeed * (Math.PI / 30); // RPM to rad/s

  // Refs for animation
  const leftWheelRef = useRef<THREE.Mesh>(null);
  const rightWheelRef = useRef<THREE.Mesh>(null);
  const chassisRef = useRef<THREE.Mesh>(null);
  
  // Use Three.js animation system via useFrame instead of setInterval
  useFrame(() => {
    if (leftWheelRef.current) {
      leftWheelRef.current.rotation.x += leftWheelSpeed / 60;
    }
    if (rightWheelRef.current) {
      rightWheelRef.current.rotation.x += rightWheelSpeed / 60;
    }
    
    // Small floating animation for the vehicle body
    if (chassisRef.current) {
      chassisRef.current.position.y = VEHICLE_HEIGHT / 2 + Math.sin(Date.now() * 0.002) * 0.005;
    }
  });

  return (
    <group position={new THREE.Vector3(...position)} rotation={new THREE.Euler(...rotation)}>
      {/* Vehicle body - Tesla-inspired design */}
      <mesh ref={chassisRef} position={[0, VEHICLE_HEIGHT / 2, 0]}>
        <boxGeometry args={[VEHICLE_LENGTH, VEHICLE_HEIGHT, VEHICLE_WIDTH]} />
        <meshStandardMaterial color={TESLA_RED} metalness={0.6} roughness={0.2} />
      </mesh>
      
      {/* Vehicle roof */}
      <mesh position={[0, VEHICLE_HEIGHT + 0.05, 0]} scale={[0.8, 0.05, 0.7]}>
        <boxGeometry args={[VEHICLE_LENGTH, VEHICLE_HEIGHT, VEHICLE_WIDTH]} />
        <meshStandardMaterial color={TESLA_DARK} metalness={0.7} roughness={0.2} />
      </mesh>
      
      {/* Windshield */}
      <mesh position={[VEHICLE_LENGTH * 0.15, VEHICLE_HEIGHT, 0]} rotation={[0, 0, Math.PI * 0.1]}>
        <planeGeometry args={[VEHICLE_LENGTH * 0.3, VEHICLE_HEIGHT * 0.8]} />
        <meshStandardMaterial color={TESLA_LIGHT_GRAY} transparent opacity={0.7} metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Tesla logo */}
      <mesh position={[VEHICLE_LENGTH * 0.3, VEHICLE_HEIGHT + 0.06, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.01, 32]} />
        <meshStandardMaterial color={TESLA_SILVER} metalness={0.8} roughness={0.1} />
      </mesh>
      
      {/* Left wheel with improved appearance */}
      <mesh 
        ref={leftWheelRef}
        position={[-VEHICLE_LENGTH / 4, WHEEL_RADIUS, -VEHICLE_WIDTH / 2 - WHEEL_WIDTH / 2 - axleOffset]} 
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_WIDTH, 32]} />
        <meshStandardMaterial color={TESLA_DARK} roughness={0.8} />
      </mesh>
      
      {/* Left wheel rim */}
      <mesh 
        position={[-VEHICLE_LENGTH / 4, WHEEL_RADIUS, -VEHICLE_WIDTH / 2 - WHEEL_WIDTH / 2 - axleOffset]} 
        rotation={[0, 0, Math.PI / 2]}
      >
        <torusGeometry args={[WHEEL_RADIUS * 0.7, WHEEL_RADIUS * 0.05, 16, 32]} />
        <meshStandardMaterial color={TESLA_SILVER} metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Right wheel with improved appearance */}
      <mesh 
        ref={rightWheelRef}
        position={[-VEHICLE_LENGTH / 4, WHEEL_RADIUS, VEHICLE_WIDTH / 2 + WHEEL_WIDTH / 2 + axleOffset]} 
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_WIDTH, 32]} />
        <meshStandardMaterial color={TESLA_DARK} roughness={0.8} />
      </mesh>
      
      {/* Right wheel rim */}
      <mesh 
        position={[-VEHICLE_LENGTH / 4, WHEEL_RADIUS, VEHICLE_WIDTH / 2 + WHEEL_WIDTH / 2 + axleOffset]} 
        rotation={[0, 0, Math.PI / 2]}
      >
        <torusGeometry args={[WHEEL_RADIUS * 0.7, WHEEL_RADIUS * 0.05, 16, 32]} />
        <meshStandardMaterial color={TESLA_SILVER} metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Headlights */}
      <mesh position={[VEHICLE_LENGTH / 2.2, VEHICLE_HEIGHT / 2, VEHICLE_WIDTH / 4]}>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFF99" emissiveIntensity={0.5} />
      </mesh>
      
      <mesh position={[VEHICLE_LENGTH / 2.2, VEHICLE_HEIGHT / 2, -VEHICLE_WIDTH / 4]}>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFF99" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Direction indicator */}
      <mesh position={[VEHICLE_LENGTH / 3, VEHICLE_HEIGHT, 0]}>
        <coneGeometry args={[0.05, 0.1, 16]} />
        <meshStandardMaterial color={TESLA_RED} />
      </mesh>
      
      {/* Sensors (decorative) */}
      <mesh position={[VEHICLE_LENGTH / 2 - 0.02, VEHICLE_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.02, 0.02, VEHICLE_WIDTH * 0.5]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  );
};

// Improved Floor grid with Tesla branding
const Floor: React.FC = () => {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#E0E0E0" />
        <gridHelper args={[20, 20, "#000000", "#CCCCCC"]} rotation={[Math.PI / 2, 0, 0]} />
      </mesh>
      
      {/* Tesla logo on the floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshStandardMaterial color={TESLA_RED} />
      </mesh>
    </group>
  );
};

// Control panel for user inputs with improved UI
const ControlPanel: React.FC<{
  leftVoltage: number;
  rightVoltage: number;
  setLeftVoltage: (voltage: number) => void;
  setRightVoltage: (voltage: number) => void;
  axleOffset: number;
  setAxleOffset: (offset: number) => void;
  programPath: () => void;
  goToPosition: () => void;
}> = ({ 
  leftVoltage, 
  rightVoltage, 
  setLeftVoltage, 
  setRightVoltage,
  axleOffset,
  setAxleOffset,
  programPath,
  goToPosition
}) => {
  return (
    <div className="absolute top-0 right-0 bg-white/90 p-4 m-4 rounded-lg shadow-lg w-64 z-10 border border-red-500 text-black">
      <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center">
        <Settings className="mr-2 h-5 w-5" /> Tesla Cord Rider
      </h2>
      
      <div className="mb-4">
        <label className="text-sm font-medium flex items-center justify-between">
          <span>Left Motor: {leftVoltage.toFixed(1)}V</span>
          <span className="text-xs text-gray-500">{(leftVoltage / motorData.maxVoltage * 100).toFixed(0)}%</span>
        </label>
        <input
          type="range"
          min="-400"
          max="400"
          step="10"
          value={leftVoltage}
          onChange={(e) => setLeftVoltage(parseFloat(e.target.value))}
          className="w-full accent-red-500"
        />
      </div>
      
      <div className="mb-4">
        <label className="text-sm font-medium flex items-center justify-between">
          <span>Right Motor: {rightVoltage.toFixed(1)}V</span>
          <span className="text-xs text-gray-500">{(rightVoltage / motorData.maxVoltage * 100).toFixed(0)}%</span>
        </label>
        <input
          type="range"
          min="-400"
          max="400"
          step="10"
          value={rightVoltage}
          onChange={(e) => setRightVoltage(parseFloat(e.target.value))}
          className="w-full accent-red-500"
        />
      </div>
      
      <div className="mb-4">
        <label className="text-sm font-medium flex items-center justify-between">
          <span>Axle Offset: {axleOffset.toFixed(2)}m</span>
          <span className="text-xs text-gray-500">{(axleOffset / 0.1 * 100).toFixed(0)}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="0.1"
          step="0.01"
          value={axleOffset}
          onChange={(e) => setAxleOffset(parseFloat(e.target.value))}
          className="w-full accent-red-500"
        />
      </div>
      
      <div className="flex space-x-2">
        <button 
          onClick={programPath}
          className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition text-sm flex items-center"
        >
          <Route className="mr-1 h-4 w-4" /> Program Path
        </button>
        <button 
          onClick={goToPosition}
          className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition text-sm flex items-center"
        >
          <Target className="mr-1 h-4 w-4" /> Go to Position
        </button>
      </div>
    </div>
  );
};

// Improved metrics display
const MetricsDisplay: React.FC<{
  position: [number, number, number];
  rotation: [number, number, number];
  leftSpeed: number;
  rightSpeed: number;
}> = ({ position, rotation, leftSpeed, rightSpeed }) => {
  // Calculate vehicle speed and angular velocity based on wheel speeds
  // Linear velocity = (leftSpeed + rightSpeed) * radius / 2
  // Angular velocity = (rightSpeed - leftSpeed) * radius / wheelBase
  const linearVelocity = ((leftSpeed + rightSpeed) / 2) * WHEEL_RADIUS;
  const angularVelocity = ((rightSpeed - leftSpeed) * WHEEL_RADIUS) / VEHICLE_WIDTH;
  
  return (
    <div className="absolute bottom-0 left-0 bg-white/90 p-4 m-4 rounded-lg shadow-lg w-80 z-10 border border-red-500 text-black">
      <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center">
        <Activity className="mr-2 h-5 w-5" /> Vehicle Metrics
      </h3>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="font-medium">Position X:</span> {position[0].toFixed(2)}m
        </div>
        <div>
          <span className="font-medium">Position Y:</span> {position[2].toFixed(2)}m
        </div>
        <div>
          <span className="font-medium">Heading:</span> {(rotation[1] * (180/Math.PI)).toFixed(1)}°
        </div>
        <div>
          <span className="font-medium">Linear Velocity:</span> {linearVelocity.toFixed(2)}m/s
        </div>
        <div>
          <span className="font-medium">Angular Velocity:</span> {angularVelocity.toFixed(2)}rad/s
        </div>
        <div>
          <span className="font-medium">Left Wheel RPM:</span> {(leftSpeed * (30/Math.PI)).toFixed(0)}
        </div>
        <div>
          <span className="font-medium">Right Wheel RPM:</span> {(rightSpeed * (30/Math.PI)).toFixed(0)}
        </div>
      </div>
      
      <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200 text-xs">
        <p className="font-medium text-blue-800">Kinematics Model:</p>
        <p>v = (v_r + v_l) / 2</p>
        <p>ω = (v_r - v_l) / L</p>
        <p>where L = vehicle width</p>
      </div>
    </div>
  );
};

// PathLine component to fix the line rendering
const PathLine: React.FC<{
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
}> = ({ start, end, color = "#2196F3" }) => {
  return (
    <primitive object={new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...start),
        new THREE.Vector3(...end)
      ]),
      new THREE.LineBasicMaterial({ color })
    )} />
  );
};

// Visualization component for the vehicle's trajectory
const Trajectory: React.FC<{
  points: [number, number, number][];
}> = ({ points }) => {
  if (points.length < 2) return null;
  
  return (
    <>
      {points.map((point, index) => {
        if (index === points.length - 1) return null;
        return (
          <PathLine
            key={index}
            start={point}
            end={points[index + 1]}
            color="#4CAF50"
          />
        );
      })}
    </>
  );
};

// Main simulation component
const VehicleSimulation: React.FC = () => {
  const { toast } = useToast();
  
  // Motor voltages
  const [leftVoltage, setLeftVoltage] = useState(0);
  const [rightVoltage, setRightVoltage] = useState(0);
  
  // Vehicle state
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [trajectoryPoints, setTrajectoryPoints] = useState<[number, number, number][]>([[0, 0.05, 0]]);
  
  // Axle configuration
  const [axleOffset, setAxleOffset] = useState(0);
  
  // Path programming state
  const [pathDialogOpen, setPathDialogOpen] = useState(false);
  const [programmedPath, setProgrammedPath] = useState<{x: number, y: number, theta: number}[]>([]);
  const [followingPath, setFollowingPath] = useState(false);
  const [currentWaypoint, setCurrentWaypoint] = useState(0);
  
  // Position control state
  const [positionDialogOpen, setPositionDialogOpen] = useState(false);
  const [targetPosition, setTargetPosition] = useState<{x: number, y: number, theta: number} | null>(null);
  
  // Mathematical model dialog
  const [mathModelOpen, setMathModelOpen] = useState(false);
  
  // Calculate wheel speeds from voltages
  const leftWheelSpeed = (leftVoltage / motorData.maxVoltage) * motorData.maxRPM * (Math.PI / 30); // rad/s
  const rightWheelSpeed = (rightVoltage / motorData.maxVoltage) * motorData.maxRPM * (Math.PI / 30); // rad/s
  
  // Improved calibration constants
  const TURN_GAIN = 2.0;  // More responsive turning
  const DISTANCE_GAIN = 1.0; // Faster approach to target
  const ARRIVAL_THRESHOLD = 0.05; // Distance threshold for arrival
  const HEADING_THRESHOLD = 0.05; // Heading threshold for arrival
  const MAX_TURN_RATE = 2.0; // Maximum turn rate
  const MAX_SPEED = 1.0; // Maximum speed

  // Update vehicle position based on manual controls
  useEffect(() => {
    if (followingPath || targetPosition) {
      // Don't apply manual controls when in autonomous mode
      return;
    }
    
    const updateInterval = 16; // ms (approximately 60fps)
    const frameTime = updateInterval / 1000; // seconds
    
    const timer = setInterval(() => {
      // Calculate linear and angular velocities from wheel speeds
      const linearVelocity = ((leftWheelSpeed + rightWheelSpeed) / 2) * WHEEL_RADIUS;
      const angularVelocity = ((rightWheelSpeed - leftWheelSpeed) * WHEEL_RADIUS) / VEHICLE_WIDTH;
      
      // Update rotation first (important for correct movement direction)
      const newRotation: [number, number, number] = [
        rotation[0],
        rotation[1] + angularVelocity * frameTime,
        rotation[2]
      ];
      
      // Then update position based on the new rotation
      const newPosition: [number, number, number] = [
        position[0] + linearVelocity * Math.cos(newRotation[1]) * frameTime,
        position[1],
        position[2] + linearVelocity * Math.sin(newRotation[1]) * frameTime
      ];
      
      setRotation(newRotation);
      setPosition(newPosition);
      
      // Record trajectory point (not too frequently to avoid performance issues)
      if (Math.abs(linearVelocity) > 0.01 || Math.abs(angularVelocity) > 0.01) {
        setTrajectoryPoints(prev => {
          if (prev.length > 500) {
            // Limit number of points to avoid performance issues
            return [...prev.slice(-499), [newPosition[0], 0.05, newPosition[2]]];
          }
          return [...prev, [newPosition[0], 0.05, newPosition[2]]];
        });
      }
    }, updateInterval);
    
    return () => clearInterval(timer);
  }, [leftWheelSpeed, rightWheelSpeed, position, rotation, followingPath, targetPosition]);
  
  // Improved path following controller with better calibration
  useEffect(() => {
    if (!followingPath || programmedPath.length === 0) return;
    
    const updateInterval = 16; // ms
    const frameTime = updateInterval / 1000; // seconds
    
    const timer = setInterval(() => {
      const waypoint = programmedPath[currentWaypoint];
      const dx = waypoint.x - position[0];
      const dy = waypoint.y - position[2];
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate target heading (angle to the waypoint)
      const targetHeading = Math.atan2(dy, dx);
      
      // Calculate heading error (normalized to [-PI, PI])
      let headingError = targetHeading - rotation[1];
      while (headingError > Math.PI) headingError -= 2 * Math.PI;
      while (headingError < -Math.PI) headingError += 2 * Math.PI;
      
      // Improved proportional controllers with better calibration
      const turnGain = TURN_GAIN; // gain for angular control
      const distanceGain = DISTANCE_GAIN; // gain for speed control
      
      const turnRate = Math.min(Math.max(headingError * turnGain, -MAX_TURN_RATE), MAX_TURN_RATE);
      const speed = Math.min(distance * distanceGain, MAX_SPEED);
      
      // Calculate wheel speeds from desired speed and turn rate
      const leftSpeed = (speed - turnRate * VEHICLE_WIDTH / 2) / WHEEL_RADIUS;
      const rightSpeed = (speed + turnRate * VEHICLE_WIDTH / 2) / WHEEL_RADIUS;
      
      // Update position and rotation
      const newRotation: [number, number, number] = [
        rotation[0],
        rotation[1] + turnRate * frameTime,
        rotation[2]
      ];
      
      const newPosition: [number, number, number] = [
        position[0] + speed * Math.cos(newRotation[1]) * frameTime,
        position[1],
        position[2] + speed * Math.sin(newRotation[1]) * frameTime
      ];
      
      setRotation(newRotation);
      setPosition(newPosition);
      
      // Record trajectory
      setTrajectoryPoints(prev => {
        if (prev.length > 500) {
          return [...prev.slice(-499), [newPosition[0], 0.05, newPosition[2]]];
        }
        return [...prev, [newPosition[0], 0.05, newPosition[2]]];
      });
      
      // Check if we've reached the current waypoint
      if (distance < ARRIVAL_THRESHOLD) {
        // Show arrival toast
        toast({
          title: `Waypoint ${currentWaypoint + 1} Reached!`,
          description: `Successfully arrived at waypoint ${currentWaypoint + 1} of ${programmedPath.length}`,
          duration: 3000,
        });
        
        // If final waypoint, we're done
        if (currentWaypoint === programmedPath.length - 1) {
          setFollowingPath(false);
          setCurrentWaypoint(0);
          
          // Show completion toast
          toast({
            title: "Path Complete",
            description: "Successfully completed the programmed path",
            duration: 5000,
          });
        } else {
          // Otherwise, move to next waypoint
          setCurrentWaypoint(prev => prev + 1);
        }
      }
    }, updateInterval);
    
    return () => clearInterval(timer);
  }, [followingPath, programmedPath, currentWaypoint, position, rotation, toast]);
  
  // Improved go to position controller with better calibration
  useEffect(() => {
    if (!targetPosition) return;
    
    const updateInterval = 16; // ms
    const frameTime = updateInterval / 1000; // seconds
    
    const timer = setInterval(() => {
      const dx = targetPosition.x - position[0];
      const dy = targetPosition.y - position[2];
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Are we close enough to start prioritizing final heading?
      const closeToTarget = distance < 0.3;
      
      // Target heading - path heading when far, final heading when close
      const targetHeading = closeToTarget ? targetPosition.theta : Math.atan2(dy, dx);
      
      // Heading error (normalized to [-PI, PI])
      let headingError = targetHeading - rotation[1];
      while (headingError > Math.PI) headingError -= 2 * Math.PI;
      while (headingError < -Math.PI) headingError += 2 * Math.PI;
      
      // Controller parameters with improved calibration
      const turnGain = closeToTarget ? 2.5 : 2.0;
      const speedGain = closeToTarget ? 0.5 : 1.0;
      
      // Control outputs
      const turnRate = Math.min(Math.max(headingError * turnGain, -MAX_TURN_RATE), MAX_TURN_RATE);
      const speed = Math.min(distance * speedGain, closeToTarget ? 0.3 : MAX_SPEED);
      
      // If very close to target and heading is good, stop
      if (distance < ARRIVAL_THRESHOLD && Math.abs(headingError) < HEADING_THRESHOLD) {
        setTargetPosition(null);
        
        // Show arrival toast
        toast({
          title: "Destination Reached!",
          description: `Successfully arrived at position (${targetPosition.x.toFixed(2)}, ${targetPosition.y.toFixed(2)}) with heading ${(targetPosition.theta * (180/Math.PI)).toFixed(1)}°`,
          duration: 5000,
        });
        return;
      }
      
      // Update position and rotation
      const newRotation: [number, number, number] = [
        rotation[0],
        rotation[1] + turnRate * frameTime,
        rotation[2]
      ];
      
      const newPosition: [number, number, number] = [
        position[0] + speed * Math.cos(newRotation[1]) * frameTime,
        position[1],
        position[2] + speed * Math.sin(newRotation[1]) * frameTime
      ];
      
      setRotation(newRotation);
      setPosition(newPosition);
      
      // Record trajectory
      setTrajectoryPoints(prev => {
        if (prev.length > 500) {
          return [...prev.slice(-499), [newPosition[0], 0.05, newPosition[2]]];
        }
        return [...prev, [newPosition[0], 0.05, newPosition[2]]];
      });
    }, updateInterval);
    
    return () => clearInterval(timer);
  }, [targetPosition, position, rotation, toast]);
  
  return (
    <div className="relative w-full h-screen">
      <div className="absolute top-4 left-4 z-10">
        <h1 className="text-2xl font-bold text-white bg-red-600 px-4 py-2 rounded-lg shadow flex items-center">
          <Settings className="mr-2 h-6 w-6" /> Tesla Cord Rider Simulation
        </h1>
      </div>
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
        <button 
          onClick={() => setMathModelOpen(true)}
          className="bg-white text-red-600 px-4 py-2 rounded-md shadow hover:bg-red-50 transition flex items-center"
        >
          <Activity className="mr-2 h-5 w-5" /> View Mathematical Model
        </button>
        {followingPath && (
          <button 
            onClick={() => setFollowingPath(false)}
            className="bg-red-600 text-white px-4 py-2 rounded-md shadow hover:bg-red-700 transition flex items-center"
          >
            <RotateCcw className="mr-2 h-5 w-5" /> Stop Path Following
          </button>
        )}
        {targetPosition && (
          <button 
            onClick={() => setTargetPosition(null)}
            className="bg-red-600 text-white px-4 py-2 rounded-md shadow hover:bg-red-700 transition flex items-center"
          >
            <RotateCcw className="mr-2 h-5 w-5" /> Cancel Go To Position
          </button>
        )}
      </div>
      
      {/* 3D Simulation Canvas */}
      <Canvas camera={{ position: [0, 5, 5], fov: 50 }}>
        <color attach="background" args={["#f0f0f0"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <hemisphereLight args={["#ffffff", "#bbdefb", 0.6]} />
        <spotLight position={[5, 10, 5]} angle={0.3} penumbra={0.8} intensity={1} castShadow />
        
        {/* Vehicle */}
        <Vehicle 
          leftVoltage={leftVoltage} 
          rightVoltage={rightVoltage} 
          axleOffset={axleOffset}
          position={position}
          rotation={rotation}
        />
        
        {/* Environment */}
        <Floor />
        
        {/* Trajectory visualization */}
        <Trajectory points={trajectoryPoints} />
        
        {/* Path visualization */}
        {programmedPath.length > 0 && (
          <group>
            {programmedPath.map((wp, index) => (
              <React.Fragment key={index}>
                <mesh position={[wp.x, 0.05, wp.y]}>
                  <sphereGeometry args={[0.1, 16, 16]} />
                  <meshStandardMaterial 
                    color={index === currentWaypoint && followingPath ? "#FF9800" : "#2196F3"} 
                    transparent
                    opacity={0.7}
                  />
                </mesh>
                <Text
                  position={[wp.x, 0.3, wp.y]}
                  fontSize={0.2}
                  color="#000000"
                  anchorX="center"
                  anchorY="middle"
                >
                  {index + 1}
                </Text>
                
                {/* Path line */}
                {index < programmedPath.length - 1 && (
                  <PathLine 
                    start={[wp.x, 0.05, wp.y]} 
                    end={[programmedPath[index + 1].x, 0.05, programmedPath[index + 1].y]} 
                    color="#2196F3"
                  />
                )}
              </React.Fragment>
            ))}
          </group>
        )}
        
        {/* Target position visualization */}
        {targetPosition && (
          <group>
            <mesh position={[targetPosition.x, 0.05, targetPosition.y]}>
              <ringGeometry args={[0.15, 0.2, 32]} />
              <meshStandardMaterial color="#F44336" />
            </mesh>
            {/* Direction indicator */}
            <mesh 
              position={[
                targetPosition.x + 0.3 * Math.cos(targetPosition.theta),
                0.05,
                targetPosition.y + 0.3 * Math.sin(targetPosition.theta)
              ]}
              rotation={[0, targetPosition.theta + Math.PI / 2, 0]}
            >
              <coneGeometry args={[0.08, 0.2, 32]} />
              <meshStandardMaterial color="#F44336" />
            </mesh>
          </group>
        )}
        
        <OrbitControls target={[position[0], 0, position[2]]} />
      </Canvas>
      
      {/* UI Overlays */}
      <ControlPanel 
        leftVoltage={leftVoltage}
        rightVoltage={rightVoltage}
        setLeftVoltage={setLeftVoltage}
        setRightVoltage={setRightVoltage}
        axleOffset={axleOffset}
        setAxleOffset={setAxleOffset}
        programPath={() => setPathDialogOpen(true)}
        goToPosition={() => setPositionDialogOpen(true)}
      />
      
      <MetricsDisplay 
        position={position}
        rotation={rotation}
        leftSpeed={leftWheelSpeed}
        rightSpeed={rightWheelSpeed}
      />
      
      {/* Dialogs */}
      <PathProgramDialog 
        isOpen={pathDialogOpen}
        onClose={() => setPathDialogOpen(false)}
        onSave={(path) => {
          setProgrammedPath(path);
          setCurrentWaypoint(0);
          setFollowingPath(true);
          
          toast({
            title: "Path Programmed",
            description: `${path.length} waypoints added to path`,
            duration: 3000,
          });
        }}
      />
      
      <PositionDialog 
        isOpen={positionDialogOpen}
        onClose={() => setPositionDialogOpen(false)}
        onGo={(x, y, theta) => {
          setTargetPosition({x, y, theta});
          
          toast({
            title: "Navigation Started",
            description: `Navigating to position (${x.toFixed(2)}, ${y.toFixed(2)}, ${(theta * (180/Math.PI)).toFixed(1)}°)`,
            duration: 3000,
          });
        }}
      />
      
      <MathematicalModel 
        isOpen={mathModelOpen}
        onClose={() => setMathModelOpen(false)}
      />
    </div>
  );
};

// Improved PathProgramDialog component
const PathProgramDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (path: {x: number, y: number, theta: number}[]) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [waypoints, setWaypoints] = useState<{x: number, y: number, theta: number}[]>([
    {x: 1, y: 1, theta: 0},
    {x: 1, y: -1, theta: 90 * (Math.PI/180)},
    {x: -1, y: -1, theta: 180 * (Math.PI/180)},
    {x: -1, y: 1, theta: 270 * (Math.PI/180)}
  ]);
  
  const addWaypoint = () => {
    setWaypoints([...waypoints, {x: 0, y: 0, theta: 0}]);
  };
  
  const updateWaypoint = (index: number, key: 'x' | 'y' | 'theta', value: number) => {
    const newWaypoints = [...waypoints];
    
    if (key === 'theta' && value !== undefined) {
      // Convert degrees to radians for internal storage
      newWaypoints[index][key] = value * (Math.PI/180);
    } else {
      newWaypoints[index][key] = value;
    }
    
    setWaypoints(newWaypoints);
  };
  
  const removeWaypoint = (index: number) => {
    const newWaypoints = [...waypoints];
    newWaypoints.splice(index, 1);
    setWaypoints(newWaypoints);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center">
          <Route className="mr-2 h-5 w-5" /> Program Path
        </h2>
        
        <div className="mb-4">
          {waypoints.map((wp, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2 p-2 bg-gray-50 rounded">
              <div className="flex-1 grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-medium">X (m)</label>
                  <input
                    type="number"
                    value={wp.x}
                    onChange={(e) => updateWaypoint(index, 'x', parseFloat(e.target.value))}
                    className="w-full border rounded p-1 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Y (m)</label>
                  <input
                    type="number"
                    value={wp.y}
                    onChange={(e) => updateWaypoint(index, 'y', parseFloat(e.target.value))}
                    className="w-full border rounded p-1 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">θ (deg)</label>
                  <input
                    type="number"
                    value={(wp.theta * (180/Math.PI)).toFixed(0)}
                    onChange={(e) => updateWaypoint(index, 'theta', parseFloat(e.target.value))}
                    className="w-full border rounded p-1 text-sm"
                  />
                </div>
              </div>
              <button 
                onClick={() => removeWaypoint(index)}
                className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        
        <button 
          onClick={addWaypoint}
          className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition mr-2 flex items-center"
        >
          <ChevronUp className="mr-1 h-4 w-4" /> Add Waypoint
        </button>
        
        <div className="flex justify-end mt-4 space-x-2">
          <button 
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onSave(waypoints);
              onClose();
            }}
            className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition flex items-center"
          >
            <Check className="mr-1 h-4 w-4" /> Save Path
          </button>
        </div>
      </div>
    </div>
  );
};

// Improved go to position dialog
const PositionDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onGo: (x: number, y: number, theta: number) => void;
}> = ({ isOpen, onClose, onGo }) => {
  const [position, setPosition] = useState({x: 2, y: 2, theta: 45});
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center">
          <MapPin className="mr-2 h-5 w-5" /> Go to Position
        </h2>
        
        <div className="mb-4 space-y-3">
          <div>
            <label className="text-sm font-medium">X Position (m)</label>
            <input
              type="number"
              value={position.x}
              onChange={(e) => setPosition({...position, x: parseFloat(e.target.value)})}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Y Position (m)</label>
            <input
              type="number"
              value={position.y}
              onChange={(e) => setPosition({...position, y: parseFloat(e.target.value)})}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Heading θ (degrees)</label>
            <input
              type="number"
              value={position.theta}
              onChange={(e) => setPosition({...position, theta: parseFloat(e.target.value)})}
              className="w-full border rounded p-2"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button 
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onGo(position.x, position.y, position.theta * (Math.PI/180));
              onClose();
            }}
            className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition flex items-center"
          >
            <Check className="mr-1 h-4 w-4" /> Go
          </button>
        </div>
      </div>
    </div>
  );
};

// Mathematical model component for displaying equations
const MathematicalModel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[700px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
          <Activity className="mr-2 h-6 w-6" /> Mathematical Model
        </h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-bold text-red-600 mb-2">Kinematics Model</h3>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="mb-2">For a differential drive vehicle:</p>
            <p className="font-mono">Linear velocity (v) = (right_wheel_velocity + left_wheel_velocity) / 2</p>
            <p className="font-mono">Angular velocity (ω) = (right_wheel_velocity - left_wheel_velocity) / L</p>
            <p>where L is the distance between the wheels</p>
            
            <div className="mt-4">
              <p className="mb-2">Position update equations:</p>
              <p className="font-mono">x(t+1) = x(t) + v·cos(θ)·dt</p>
              <p className="font-mono">y(t+1) = y(t) + v·sin(θ)·dt</p>
              <p className="font-mono">θ(t+1) = θ(t) + ω·dt</p>
            </div>
            
            <div className="mt-4">
              <p className="mb-2">Wheel velocities from motor input:</p>
              <p className="font-mono">wheel_velocity = motor_rpm · 2π / 60 · wheel_radius</p>
              <p className="font-mono">motor_rpm = (voltage / max_voltage) · max_rpm</p>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-bold text-red-600 mb-2">Dynamics Model</h3>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="mb-2">DC Motor Model:</p>
            <p className="font-mono">Torque = kT · (V - kE · ω) / R</p>
            <p className="font-mono">where:</p>
            <p className="font-mono ml-4">kT = motor torque constant</p>
            <p className="font-mono ml-4">kE = back-EMF constant</p>
            <p className="font-mono ml-4">R = motor resistance</p>
            <p className="font-mono ml-4">V = applied voltage</p>
            <p className="font-mono ml-4">ω = motor angular velocity</p>
            
            <div className="mt-4">
              <p className="mb-2">Vehicle acceleration:</p>
              <p className="font-mono">a = (Torque_right + Torque_left) / (wheel_radius · vehicle_mass)</p>
              <p className="font-mono">α = (Torque_right - Torque_left) · wheel_radius / (vehicle_moment_of_inertia · wheelbase)</p>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-bold text-red-600 mb-2">Control Algorithm</h3>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="mb-2">Position control using a simple PID controller:</p>
            <p className="font-mono">position_error = √((target_x - current_x)² + (target_y - current_y)²)</p>
            <p className="font-mono">heading_error = target_θ - current_θ</p>
            <p className="font-mono">v_cmd = Kp_pos · position_error</p>
            <p className="font-mono">ω_cmd = Kp_heading · heading_error</p>
            
            <div className="mt-4">
              <p className="mb-2">Converting to wheel velocities:</p>
              <p className="font-mono">v_right = v_cmd + (ω_cmd · L) / 2</p>
              <p className="font-mono">v_left = v_cmd - (ω_cmd · L) / 2</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            onClick={onClose}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition flex items-center"
          >
            <Check className="mr-1 h-5 w-5" /> Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleSimulation;

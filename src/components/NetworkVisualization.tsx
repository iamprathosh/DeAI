import { useEffect, useRef, useState, useCallback } from 'react';

interface Node {
  id: number;
  x: number;
  y: number;
  size: number;
  type: 'standard' | 'llm' | 'ipfs';
  pulseRate?: number;
  color: string;
}

interface Connection {
  source: number;
  target: number;
  active: boolean;
  direction: 'in' | 'out' | 'bidirectional';
}

const NetworkVisualization = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationRef = useRef<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lowPerformanceMode, setLowPerformanceMode] = useState(false);
  
  // Generate network data
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [dataFlowProgress, setDataFlowProgress] = useState(0);
  
  // Check if device is low-powered
  useEffect(() => {
    // Simple check for mobile or low-powered devices
    const isMobile = window.innerWidth < 768;
    const isMobileOrSlow = isMobile || 
      (window.navigator.hardwareConcurrency && window.navigator.hardwareConcurrency < 4);
    
    setLowPerformanceMode(isMobileOrSlow);
  }, []);
  
  // Initialize network
  useEffect(() => {
    if (!isInitialized) {
      // Create nodes
      const newNodes: Node[] = [];
      
      // Central LLM node
      newNodes.push({
        id: 0,
        x: 0.5,
        y: 0.5,
        size: 25,
        type: 'llm',
        color: 'hsl(var(--accent-blue))'
      });
      
      // IPFS nodes
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        newNodes.push({
          id: i + 1,
          x: 0.5 + Math.cos(angle) * 0.25,
          y: 0.5 + Math.sin(angle) * 0.25,
          size: 15,
          type: 'ipfs',
          pulseRate: 3 + Math.random() * 2,
          color: 'hsl(var(--purple))'
        });
      }
      
      // Standard nodes - reduce count for mobile/low-powered devices
      const nodeCount = lowPerformanceMode ? 10 : 20;
      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2;
        const distance = 0.35 + Math.random() * 0.15;
        newNodes.push({
          id: i + 6,
          x: 0.5 + Math.cos(angle) * distance,
          y: 0.5 + Math.sin(angle) * distance,
          size: 4 + Math.random() * 6,
          type: 'standard',
          pulseRate: 3 + Math.random() * 4,
          color: 'hsl(var(--teal))'
        });
      }
      
      // Create connections with fewer connections on mobile
      const newConnections: Connection[] = [];
      
      // Connect LLM to all IPFS nodes
      for (let i = 1; i <= 5; i++) {
        newConnections.push({
          source: 0,
          target: i,
          active: true,
          direction: 'bidirectional'
        });
      }
      
      // Connect some standard nodes to LLM
      for (let i = 6; i < 15 && i < newNodes.length; i++) {
        if (lowPerformanceMode && i % 2 === 0) continue; // Skip some connections in low performance mode
        
        newConnections.push({
          source: 0,
          target: i,
          active: i % 2 === 0,
          direction: i % 3 === 0 ? 'in' : i % 3 === 1 ? 'out' : 'bidirectional'
        });
      }
      
      // Connect standard nodes to each other - fewer for mobile
      const connectionsPerNode = lowPerformanceMode ? 1 : 3;
      for (let i = 6; i < newNodes.length; i++) {
        const numConnections = 1 + Math.floor(Math.random() * connectionsPerNode);
        for (let j = 0; j < numConnections; j++) {
          const target = 6 + Math.floor(Math.random() * (newNodes.length - 6));
          if (target !== i) {
            newConnections.push({
              source: i,
              target,
              active: Math.random() > 0.7,
              direction: Math.random() > 0.5 ? 'bidirectional' : (Math.random() > 0.5 ? 'in' : 'out')
            });
          }
        }
      }
      
      // Connect IPFS nodes to each other
      for (let i = 1; i <= 5; i++) {
        for (let j = i + 1; j <= 5; j++) {
          if (Math.random() > (lowPerformanceMode ? 0.5 : 0.3)) {
            newConnections.push({
              source: i,
              target: j,
              active: true,
              direction: 'bidirectional'
            });
          }
        }
      }
      
      setNodes(newNodes);
      setConnections(newConnections);
      setIsInitialized(true);
    }
  }, [isInitialized, lowPerformanceMode]);

  // Handle canvas resize
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const { width, height } = canvasRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width, height });
        canvasRef.current.width = width * window.devicePixelRatio;
        canvasRef.current.height = height * window.devicePixelRatio;
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Throttle animation for better performance on Netlify and mobile
  const useThrottledAnimation = useCallback(() => {
    if (lowPerformanceMode) {
      return canvasRef.current && window.requestAnimationFrame && Math.random() > 0.5;
    }
    return canvasRef.current && window.requestAnimationFrame;
  }, [lowPerformanceMode]);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || !isInitialized) return;

    let animationTimestamp = 0;
    const ctx = canvasRef.current.getContext('2d')!;
    let dataFlowOffset = 0;
    
    const animate = (timestamp: number) => {
      if (!canvasRef.current) return;
      
      const delta = timestamp - animationTimestamp;
      animationTimestamp = timestamp;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      // Data flow animation
      dataFlowOffset = (dataFlowOffset + (delta / 2000)) % 1;
      
      // Draw connections
      connections.forEach(conn => {
        const source = nodes.find(n => n.id === conn.source)!;
        const target = nodes.find(n => n.id === conn.target)!;
        
        const sourceX = source.x * dimensions.width;
        const sourceY = source.y * dimensions.height;
        const targetX = target.x * dimensions.width;
        const targetY = target.y * dimensions.height;
        
        const gradient = ctx.createLinearGradient(sourceX, sourceY, targetX, targetY);
        
        if (!conn.active) {
          gradient.addColorStop(0, 'rgba(100, 100, 120, 0.1)');
          gradient.addColorStop(1, 'rgba(100, 100, 120, 0.1)');
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 0.5;
        } else {
          const sourceColor = source.type === 'llm' 
            ? 'rgba(30, 144, 255, 0.7)' 
            : source.type === 'ipfs' 
              ? 'rgba(140, 82, 255, 0.7)' 
              : 'rgba(64, 224, 208, 0.7)';
          
          const targetColor = target.type === 'llm' 
            ? 'rgba(30, 144, 255, 0.7)' 
            : target.type === 'ipfs' 
              ? 'rgba(140, 82, 255, 0.7)' 
              : 'rgba(64, 224, 208, 0.7)';
          
          gradient.addColorStop(0, sourceColor);
          gradient.addColorStop(1, targetColor);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = source.type === 'llm' || target.type === 'llm' ? 2 : 1;
        }
        
        // Draw connection line
        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
        
        // Data flow particles
        if (conn.active) {
          const numParticles = Math.ceil((source.type === 'llm' || target.type === 'llm') ? 3 : 2);
          
          for (let i = 0; i < numParticles; i++) {
            const offset = (dataFlowOffset + i / numParticles) % 1;
            const x = sourceX + (targetX - sourceX) * offset;
            const y = sourceY + (targetY - sourceY) * offset;
            
            if ((conn.direction === 'out' || conn.direction === 'bidirectional') && offset < 0.95) {
              ctx.fillStyle = source.type === 'llm' ? 'rgba(30, 144, 255, 0.9)' : 
                                source.type === 'ipfs' ? 'rgba(140, 82, 255, 0.9)' : 
                                'rgba(64, 224, 208, 0.9)';
              ctx.beginPath();
              ctx.arc(x, y, 2, 0, Math.PI * 2);
              ctx.fill();
            }
            
            if ((conn.direction === 'in' || conn.direction === 'bidirectional') && offset > 0.05) {
              const reverseOffset = 1 - offset;
              const rx = targetX + (sourceX - targetX) * reverseOffset;
              const ry = targetY + (sourceY - targetY) * reverseOffset;
              
              ctx.fillStyle = target.type === 'llm' ? 'rgba(30, 144, 255, 0.9)' : 
                               target.type === 'ipfs' ? 'rgba(140, 82, 255, 0.9)' : 
                               'rgba(64, 224, 208, 0.9)';
              ctx.beginPath();
              ctx.arc(rx, ry, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      });
      
      // Draw nodes
      nodes.forEach(node => {
        const x = node.x * dimensions.width;
        const y = node.y * dimensions.height;
        
        ctx.save();
        
        // Glow effect
        const glowSize = node.size * (1 + Math.sin(timestamp / (node.pulseRate || 3000) * 0.005) * 0.2);
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize * 2);
        
        if (node.type === 'llm') {
          gradient.addColorStop(0, 'rgba(30, 144, 255, 0.8)');
          gradient.addColorStop(0.7, 'rgba(30, 144, 255, 0.3)');
          gradient.addColorStop(1, 'rgba(30, 144, 255, 0)');
        } else if (node.type === 'ipfs') {
          gradient.addColorStop(0, 'rgba(140, 82, 255, 0.7)');
          gradient.addColorStop(0.7, 'rgba(140, 82, 255, 0.2)');
          gradient.addColorStop(1, 'rgba(140, 82, 255, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(64, 224, 208, 0.6)');
          gradient.addColorStop(0.7, 'rgba(64, 224, 208, 0.2)');
          gradient.addColorStop(1, 'rgba(64, 224, 208, 0)');
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, glowSize * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Core node
        if (node.type === 'llm') {
          ctx.fillStyle = 'rgba(30, 144, 255, 0.9)';
          // Complex LLM node
          ctx.beginPath();
          ctx.arc(x, y, node.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Internal structure
          for (let i = 0; i < 3; i++) {
            const angle = timestamp * 0.0002 + i * Math.PI * 2 / 3;
            const orbitX = x + Math.cos(angle) * node.size * 0.5;
            const orbitY = y + Math.sin(angle) * node.size * 0.5;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(orbitX, orbitY, node.size * 0.15, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (node.type === 'ipfs') {
          // IPFS node - hexagon shape
          const size = node.size * 0.8;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 3 * i + Math.PI / 6;
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fillStyle = 'rgba(140, 82, 255, 0.9)';
          ctx.fill();
          
          // Inner hexagon
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 3 * i + Math.PI / 6;
            const px = x + size * 0.6 * Math.cos(angle);
            const py = y + size * 0.6 * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fillStyle = 'rgba(180, 122, 255, 1)';
          ctx.fill();
        } else {
          // Standard node
          ctx.fillStyle = 'rgba(64, 224, 208, 0.9)';
          ctx.beginPath();
          ctx.arc(x, y, node.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Inner core
          ctx.fillStyle = 'rgba(90, 230, 220, 1)';
          ctx.beginPath();
          ctx.arc(x, y, node.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      });
      
      // Reset for next frame
      ctx.scale(1 / window.devicePixelRatio, 1 / window.devicePixelRatio);
      
      // Continue animation
      if (useThrottledAnimation()) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [dimensions, nodes, connections, isInitialized, useThrottledAnimation]);
  
  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default NetworkVisualization;


import { useEffect, useRef } from 'react';

interface IPFSVisualizerProps {
  className?: string;
}

const IPFSVisualizer = ({ className = '' }: IPFSVisualizerProps) => {
  const hexagonsRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    // Animation variables
    const animations: { el: SVGElement; speed: number; angle: number; }[] = [];
    
    // Function to create and animate hexagons
    const createHexagons = () => {
      if (!hexagonsRef.current) return;
      
      // Clear previous hexagons
      while (hexagonsRef.current.firstChild) {
        hexagonsRef.current.removeChild(hexagonsRef.current.firstChild);
      }
      
      const svgWidth = hexagonsRef.current.clientWidth;
      const svgHeight = hexagonsRef.current.clientHeight;
      
      // Add hexagons
      for (let i = 0; i < 8; i++) {
        const hexSize = 10 + Math.random() * 25;
        const x = Math.random() * svgWidth;
        const y = Math.random() * svgHeight;
        
        // Create hexagonal path
        const hexagon = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Generate hexagonal path
        const points = [];
        for (let j = 0; j < 6; j++) {
          const angle = (j * 60) * Math.PI / 180;
          const pointX = x + hexSize * Math.cos(angle);
          const pointY = y + hexSize * Math.sin(angle);
          points.push(`${pointX},${pointY}`);
        }
        
        hexagon.setAttribute('d', `M${points.join(' L')}Z`);
        hexagon.setAttribute('fill', 'none');
        hexagon.setAttribute('stroke', `rgba(140, 82, 255, ${0.3 + Math.random() * 0.4})`);
        hexagon.setAttribute('stroke-width', '1.5');
        
        // Add connecting lines between some hexagons
        if (i > 0 && Math.random() > 0.3) {
          const prevHex = hexagonsRef.current.children[Math.floor(Math.random() * i)] as SVGElement;
          const connection = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          
          // Get centers of hexagons
          const prevBBox = prevHex.getBBox();
          const prevX = prevBBox.x + prevBBox.width / 2;
          const prevY = prevBBox.y + prevBBox.height / 2;
          
          connection.setAttribute('x1', String(prevX));
          connection.setAttribute('y1', String(prevY));
          connection.setAttribute('x2', String(x));
          connection.setAttribute('y2', String(y));
          connection.setAttribute('stroke', 'rgba(140, 82, 255, 0.2)');
          connection.setAttribute('stroke-width', '1');
          connection.setAttribute('stroke-dasharray', '4,4');
          
          hexagonsRef.current.appendChild(connection);
        }
        
        // Create inner hexagon
        const innerHexagon = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const innerPoints = [];
        for (let j = 0; j < 6; j++) {
          const angle = (j * 60) * Math.PI / 180;
          const pointX = x + (hexSize * 0.6) * Math.cos(angle);
          const pointY = y + (hexSize * 0.6) * Math.sin(angle);
          innerPoints.push(`${pointX},${pointY}`);
        }
        
        innerHexagon.setAttribute('d', `M${innerPoints.join(' L')}Z`);
        innerHexagon.setAttribute('fill', 'rgba(140, 82, 255, 0.05)');
        innerHexagon.setAttribute('stroke', 'rgba(140, 82, 255, 0.6)');
        innerHexagon.setAttribute('stroke-width', '1');
        
        hexagonsRef.current.appendChild(hexagon);
        hexagonsRef.current.appendChild(innerHexagon);
        
        // Add to animation array
        animations.push({ 
          el: hexagon,
          speed: 0.1 + Math.random() * 0.2,
          angle: Math.random() * 360 * Math.PI / 180
        });
        
        animations.push({ 
          el: innerHexagon,
          speed: 0.1 + Math.random() * 0.2,
          angle: Math.random() * 360 * Math.PI / 180
        });
      }
    };
    
    // Create hexagons on initial render
    createHexagons();
    
    // Update on window resize
    const handleResize = () => {
      if (hexagonsRef.current) {
        createHexagons();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    let lastTime = 0;
    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      
      animations.forEach(anim => {
        const currentTransform = anim.el.getAttribute('transform') || '';
        const translateMatch = currentTransform.match(/translate\(([^,]+),([^)]+)\)/);
        
        let x = 0, y = 0;
        if (translateMatch) {
          x = parseFloat(translateMatch[1]);
          y = parseFloat(translateMatch[2]);
        }
        
        // Update position
        const distance = anim.speed * delta / 20;
        x += Math.cos(anim.angle) * distance;
        y += Math.sin(anim.angle) * distance;
        
        // Check bounds and bounce
        const bbox = anim.el.getBBox();
        const parentWidth = hexagonsRef.current?.clientWidth || 300;
        const parentHeight = hexagonsRef.current?.clientHeight || 300;
        
        if (bbox.x + x < 0 || bbox.x + bbox.width + x > parentWidth) {
          anim.angle = Math.PI - anim.angle;
        }
        
        if (bbox.y + y < 0 || bbox.y + bbox.height + y > parentHeight) {
          anim.angle = 2 * Math.PI - anim.angle;
        }
        
        anim.el.setAttribute('transform', `translate(${x},${y})`);
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    let animationId = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <svg 
      ref={hexagonsRef} 
      className={`overflow-hidden ${className}`} 
      viewBox="0 0 300 200"
      preserveAspectRatio="xMidYMid meet"
    />
  );
};

export default IPFSVisualizer;

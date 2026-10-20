import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
interface CelebrationOverlayProps {
  visible: boolean;
  onDismiss: () => void;
}
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  opacity: number;
  shape: 'rect' | 'circle' | 'star';
}
const CONFETTI_COLORS = [
'#FFD700',
'#FFC107',
'#FF6B6B',
'#FFFFFF',
'#7B2FBE',
'#FF8C00',
'#FFE066',
'#E8D5B7'];

function drawStar(ctx: CanvasRenderingContext2D, size: number) {
  const spikes = 5;
  const outerRadius = size / 2;
  const innerRadius = size / 4;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * Math.PI / spikes - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);else
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}
export function CelebrationOverlay({
  visible,
  onDismiss
}: CelebrationOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<HTMLSpanElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const [showCard, setShowCard] = useState(false);
  // Confetti particle system
  useEffect(() => {
    if (!visible || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.45;
    const particles: Particle[] = [];
    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 14;
      const shapes: Array<'rect' | 'circle' | 'star'> = [
      'rect',
      'circle',
      'star'];

      particles.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        size: 4 + Math.random() * 10,
        color:
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        gravity: 0.1 + Math.random() * 0.08,
        opacity: 1,
        shape: shapes[Math.floor(Math.random() * shapes.length)]
      });
    }
    particles.forEach((p) => {
      gsap.to(p, {
        vx: p.vx * 0.2,
        vy: p.vy * 0.2,
        duration: 1.8,
        ease: 'power3.out'
      });
    });
    const startTime = performance.now();
    const animate = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let aliveCount = 0;
      particles.forEach((p) => {
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        if (elapsed > 2.5) {
          p.opacity = Math.max(0, p.opacity - 0.012);
        }
        if (p.opacity <= 0 || p.y > canvas.height + 50) return;
        aliveCount++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          drawStar(ctx, p.size);
        }
        ctx.restore();
      });
      if (aliveCount > 0) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };
    animFrameRef.current = requestAnimationFrame(animate);
    // Show card after the 3D card animation finishes
    const cardTimer = setTimeout(() => {
      setShowCard(true);
    }, 300);
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearTimeout(cardTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [visible]);
  // Card entrance - scales up from center like it flew out of the gift
  useEffect(() => {
    if (!showCard || !cardRef.current) return;
    const tl = gsap.timeline();
    // Card scales up from tiny (as if emerging from the 3D card)
    tl.fromTo(
      cardRef.current,
      {
        scale: 0.1,
        opacity: 0,
        rotateY: 180,
        y: 40
      },
      {
        scale: 1,
        opacity: 1,
        rotateY: 0,
        y: 0,
        duration: 0.8,
        ease: 'back.out(1.4)'
      }
    );
    // Shimmer sweep across the card
    if (shimmerRef.current) {
      tl.fromTo(
        shimmerRef.current,
        {
          x: '-100%'
        },
        {
          x: '200%',
          duration: 0.8,
          ease: 'power2.inOut'
        },
        '-=0.3'
      );
    }
    // Points counter
    if (pointsRef.current) {
      const counter = {
        value: 0
      };
      tl.to(
        counter,
        {
          value: 500,
          duration: 1.4,
          ease: 'power2.out',
          snap: {
            value: 1
          },
          onUpdate: () => {
            if (pointsRef.current) {
              pointsRef.current.textContent = `+${Math.round(counter.value)}`;
            }
          }
        },
        '-=0.5'
      );
    }
  }, [showCard]);
  // Overlay fade in
  useEffect(() => {
    if (!visible || !overlayRef.current) return;
    gsap.fromTo(
      overlayRef.current,
      {
        opacity: 0
      },
      {
        opacity: 1,
        duration: 0.4
      }
    );
  }, [visible]);
  const handleDismiss = () => {
    if (!overlayRef.current) {
      onDismiss();
      return;
    }
    const tl = gsap.timeline({
      onComplete: () => {
        setShowCard(false);
        onDismiss();
      }
    });
    if (cardRef.current) {
      tl.to(cardRef.current, {
        scale: 0.8,
        opacity: 0,
        y: 30,
        rotateY: -20,
        duration: 0.35,
        ease: 'power2.in'
      });
    }
    tl.to(
      overlayRef.current,
      {
        opacity: 0,
        duration: 0.3
      },
      '-=0.1'
    );
  };
  if (!visible) return null;
  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        perspective: '1200px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Reward celebration">
      
      {/* Confetti canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true" />
      

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      {/* Reward Card */}
      {showCard &&
      <div
        ref={cardRef}
        className="relative z-10 mx-4 w-full max-w-xs overflow-hidden"
        style={{
          transformStyle: 'preserve-3d',
          borderRadius: 20,
          background:
          'linear-gradient(165deg, #1a1028 0%, #0f0a1a 50%, #1a0f28 100%)',
          border: '1.5px solid rgba(255, 215, 0, 0.35)',
          boxShadow:
          '0 0 80px rgba(255, 215, 0, 0.2), 0 0 40px rgba(255, 165, 0, 0.15), 0 30px 60px rgba(0, 0, 0, 0.6)'
        }}>
        
          {/* Shimmer sweep */}
          <div
          ref={shimmerRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
            'linear-gradient(105deg, transparent 30%, rgba(255, 215, 0, 0.12) 45%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 215, 0, 0.12) 55%, transparent 70%)',
            zIndex: 10
          }}
          aria-hidden="true" />
        

          {/* Top gold accent line */}
          <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background:
            'linear-gradient(90deg, transparent, #FFD700, #FFA500, #FFD700, transparent)'
          }}
          aria-hidden="true" />
        

          {/* Inner glow */}
          <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background:
            'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
            filter: 'blur(20px)',
            top: -20
          }}
          aria-hidden="true" />
        

          <div className="relative p-8 pt-10 text-center">
            {/* Trophy/gift icon */}
            <div
            className="mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background:
              'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 165, 0, 0.08))',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.1)'
            }}>
            
              <span className="text-3xl">🎁</span>
            </div>

            <h2
            className="text-xl font-bold mb-1 tracking-tight"
            style={{
              color: '#FFD700'
            }}>
            
              Reward Unlocked!
            </h2>

            <p className="text-white/40 text-xs mb-7 tracking-wide">
              You opened a mystery gift
            </p>

            {/* Points display */}
            <div
            className="mb-7 py-5 rounded-xl"
            style={{
              background:
              'linear-gradient(135deg, rgba(255, 215, 0, 0.08), rgba(255, 165, 0, 0.04))',
              border: '1px solid rgba(255, 215, 0, 0.12)'
            }}>
            
              <span
              ref={pointsRef}
              className="text-5xl font-black tracking-tight block"
              style={{
                background:
                'linear-gradient(135deg, #FFD700, #FF8C00, #FFD700)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
              
                +0
              </span>
              <p
              className="text-[10px] font-semibold mt-2 uppercase tracking-[0.25em]"
              style={{
                color: 'rgba(255, 215, 0, 0.45)'
              }}>
              
                Bonus Points
              </p>
            </div>

            {/* Claim button */}
            <button
            onClick={handleDismiss}
            className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-black active:scale-[0.97] transition-transform"
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              boxShadow:
              '0 4px 24px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}>
            
              Claim Reward
            </button>

            <button
            onClick={handleDismiss}
            className="mt-4 text-[11px] text-white/25 hover:text-white/40 transition-colors">
            
              Dismiss
            </button>
          </div>

          {/* Bottom accent */}
          <div
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{
            background:
            'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.2), transparent)'
          }}
          aria-hidden="true" />
        
        </div>
      }
    </div>);

}
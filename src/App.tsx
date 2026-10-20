import React, { useCallback, useState } from 'react';
import { RewardScene } from './components/RewardScene';
import { CelebrationOverlay } from './components/CelebrationOverlay';
export function App() {
  const [celebrating, setCelebrating] = useState(false);
  const handleClaim = useCallback(() => {
    if (celebrating) return;
    setCelebrating(true);
  }, [celebrating]);
  const handleDismiss = useCallback(() => {
    setCelebrating(false);
  }, []);
  return (
    <div
      className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
        'radial-gradient(ellipse at 50% 40%, #1a1a2e 0%, #0a0a0f 60%, #050508 100%)'
      }}>
      
      {/* Ambient floating particles (CSS) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true">
        
        {Array.from({
          length: 20
        }).map((_, i) =>
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2 + Math.random() * 3,
            height: 2 + Math.random() * 3,
            background: `rgba(255, 215, 0, ${0.08 + Math.random() * 0.12})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float-particle ${6 + Math.random() * 8}s ease-in-out ${Math.random() * 5}s infinite alternate`
          }} />

        )}
      </div>

      {/* Glow behind the 3D scene */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 400,
          height: 400,
          background:
          'radial-gradient(circle, rgba(255, 215, 0, 0.08) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -55%)',
          filter: 'blur(40px)'
        }}
        aria-hidden="true" />
      

      {/* Header text */}
      <div className="relative z-10 text-center mb-4 px-4">
        <p
          className="text-xs font-medium uppercase tracking-[0.3em] mb-3"
          style={{
            color: 'rgba(255, 215, 0, 0.5)'
          }}>
          
          Daily Reward
        </p>
        <h1
          className="text-3xl sm:text-4xl font-bold text-white"
          style={{
            letterSpacing: '-0.02em'
          }}>
          
          Your Reward Awaits
        </h1>
      </div>

      {/* 3D Scene */}
      <div className="relative z-10 w-full max-w-md aspect-square px-4">
        <RewardScene onClaim={handleClaim} disabled={celebrating} />
      </div>

      {/* Hint text */}
      <p
        className="relative z-10 text-sm mt-2"
        style={{
          color: 'rgba(255, 255, 255, 0.25)',
          animation: celebrating ?
          'none' :
          'pulse-subtle 2s ease-in-out infinite'
        }}>
        
        {celebrating ? '' : 'Tap to open'}
      </p>

      {/* Celebration overlay */}
      <CelebrationOverlay visible={celebrating} onDismiss={handleDismiss} />
    </div>);

}
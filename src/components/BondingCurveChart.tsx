import React, { useMemo } from 'react';
import { TrendingUp, Award, Activity } from 'lucide-react';
import type { TokenData } from '../services/bondingCurve';

interface Props {
  token: TokenData;
}

export const BondingCurveChart: React.FC<Props> = ({ token }) => {
  const percentToGraduation = Math.min(100, (token.solRaised / token.targetSol) * 100);

  // Stepped pixelated path for Roblox / Minecraft aesthetic
  const svgPath = useMemo(() => {
    if (!token.priceHistory || token.priceHistory.length === 0) return '';
    const points = token.priceHistory;
    const minPrice = Math.min(...points.map((p) => p.price)) * 0.95;
    const maxPrice = Math.max(...points.map((p) => p.price)) * 1.05;
    const range = maxPrice - minPrice || 1;

    const width = 380;
    const height = 100;

    // Stepped staircase path for true pixel style
    let path = '';
    points.forEach((p, idx) => {
      const x = (idx / (points.length - 1 || 1)) * width;
      const normalizedY = (p.price - minPrice) / range;
      const y = Math.round((height - normalizedY * height) / 4) * 4; // Snap to 4px pixel grid

      if (idx === 0) {
        path += `M ${x.toFixed(0)} ${y}`;
      } else {
        const prevPoint = points[idx - 1];
        const prevNormalizedY = (prevPoint.price - minPrice) / range;
        const prevY = Math.round((height - prevNormalizedY * height) / 4) * 4;
        // Step horizontally then vertically (blocky stairs)
        path += ` L ${x.toFixed(0)} ${prevY} L ${x.toFixed(0)} ${y}`;
      }
    });

    return path;
  }, [token.priceHistory]);

  return (
    <div className="pixel-box" style={{
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      background: '#0e131d',
    }}>
      {/* Top metrics bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="font-pixel" style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>
            CURVE PRICE
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
            <span className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--pixel-green)' }}>
              {token.tokenPriceSol.toFixed(7)}
            </span>
            <span className="font-pixel" style={{ fontSize: '0.55rem', color: 'var(--pixel-gold)' }}>SOL</span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span className="font-pixel" style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>
            MARKET CAP
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' }}>
            <span className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--pixel-cyan)' }}>
              {token.marketCapSol.toFixed(1)}
            </span>
            <span className="font-pixel" style={{ fontSize: '0.55rem', color: 'var(--pixel-gold)' }}>SOL</span>
          </div>
        </div>
      </div>

      {/* Stepped Pixel Grid Chart */}
      <div style={{
        height: '90px',
        width: '100%',
        position: 'relative',
        background: '#07090f',
        border: '2px solid #000',
        boxShadow: 'inset 2px 2px 0px rgba(0,0,0,0.8)',
        backgroundImage: `
          linear-gradient(rgba(56, 223, 123, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(56, 223, 123, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '12px 12px',
      }}>
        <svg viewBox="0 0 380 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="pixelFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38df7b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#38df7b" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {svgPath && (
            <>
              <path
                d={`${svgPath} L 380 100 L 0 100 Z`}
                fill="url(#pixelFill)"
              />
              <path
                d={svgPath}
                fill="none"
                stroke="var(--pixel-green)"
                strokeWidth="3"
                strokeLinecap="square"
              />
            </>
          )}
        </svg>

        <div style={{
          position: 'absolute',
          top: 4,
          right: 6,
          background: 'var(--pixel-green)',
          color: '#000',
          fontSize: '0.5rem',
          fontFamily: 'var(--font-pixel)',
          padding: '2px 6px',
          border: '1px solid #000',
          boxShadow: '1px 1px 0px #000',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <Activity size={10} /> LIVE TICK
        </div>
      </div>

      {/* Minecraft-Style Progress Bar (Hearts / XP Bar style) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', marginBottom: '6px' }}>
          <span className="font-pixel" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Award size={12} color="var(--pixel-gold)" />
            RAYDIUM XP:
          </span>
          <span className="font-mono" style={{ color: '#fff', fontWeight: 700 }}>
            {token.solRaised.toFixed(1)} / {token.targetSol} SOL ({percentToGraduation.toFixed(0)}%)
          </span>
        </div>
        
        {/* Pixel block bar */}
        <div style={{
          width: '100%',
          height: '12px',
          background: '#06080d',
          border: '2px solid #000',
          boxShadow: 'inset 1px 1px 0px rgba(0,0,0,0.9)',
          position: 'relative',
        }}>
          <div style={{
            height: '100%',
            width: `${percentToGraduation}%`,
            background: 'repeating-linear-gradient(90deg, var(--pixel-green) 0px, var(--pixel-green) 8px, var(--pixel-green-shadow) 8px, var(--pixel-green-shadow) 10px)',
            transition: 'width 0.3s steps(10)',
          }} />
        </div>
        <p style={{ fontSize: '0.62rem', color: 'var(--text-dim)', marginTop: '4px' }}>
          Collect 85 SOL to graduate liquidity into Raydium DEX.
        </p>
      </div>
    </div>
  );
};

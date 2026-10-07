import React from 'react';
import { Terminal, Shield, Zap, Layers, Globe, Code2 } from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  return (
    <div style={{
      maxWidth: '850px',
      margin: '0 auto',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #14f195 0%, #00f2fe 50%, #9945ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px',
        }}>
          DeploX Architecture Engine
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          How Real-Money Token Launching Works Inside Restricted X Player Card Frames
        </p>
      </div>

      {/* Grid of the 3 execution models */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        {/* Model 1 */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px' }}>
          <div style={{
            background: 'rgba(20, 241, 149, 0.15)',
            color: '#14f195',
            padding: '8px 12px',
            borderRadius: '10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '12px',
          }}>
            <Shield size={16} /> MODEL 1
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
            In-Iframe Keypair & Passkeys
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: 1.5 }}>
            Provision an ephemeral Solana Keypair or Privy MPC wallet immediately when the card opens. Session keys sign transactions in-memory without invoking browser extensions.
          </p>
        </div>

        {/* Model 2 */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px' }}>
          <div style={{
            background: 'rgba(0, 242, 254, 0.15)',
            color: '#00f2fe',
            padding: '8px 12px',
            borderRadius: '10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '12px',
          }}>
            <Zap size={16} /> MODEL 2
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
            Telegram-Bot Style Relayer
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: 1.5 }}>
            Display an ephemeral deposit QR code. User sends 0.1 SOL from Phantom or mobile app; WebSocket RPC credits balance instantly. User taps 1-tap buy/sell; backend relayer submits on-chain.
          </p>
        </div>

        {/* Model 3 */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px' }}>
          <div style={{
            background: 'rgba(153, 69, 255, 0.15)',
            color: '#9945ff',
            padding: '8px 12px',
            borderRadius: '10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '12px',
          }}>
            <Layers size={16} /> MODEL 3
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
            Solana Blink / Action Hybrid
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: 1.5 }}>
            Combine the live ticking bonding curve inside the Player Card with an `actions.json` Solana Action endpoint attached to the tweet URL for native wallet signing extensions.
          </p>
        </div>
      </div>

      {/* Technical Spec & Player Card Meta Configuration */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code2 size={20} color="#14f195" />
          Production Twitter Player Card Meta Setup
        </h3>
        
        <div style={{
          background: '#04060a',
          padding: '16px',
          borderRadius: '12px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          lineHeight: 1.6,
          color: '#cbd5e1',
          overflowX: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div>&lt;!-- Include in your public HTML header before tweet sharing --&gt;</div>
          <div>&lt;<span style={{ color: '#00f2fe' }}>meta</span> <span style={{ color: '#14f195' }}>name</span>=<span style={{ color: '#f59e0b' }}>"twitter:card"</span> <span style={{ color: '#14f195' }}>content</span>=<span style={{ color: '#f59e0b' }}>"player"</span> /&gt;</div>
          <div>&lt;<span style={{ color: '#00f2fe' }}>meta</span> <span style={{ color: '#14f195' }}>name</span>=<span style={{ color: '#f59e0b' }}>"twitter:site"</span> <span style={{ color: '#14f195' }}>content</span>=<span style={{ color: '#f59e0b' }}>"@DeploX_App"</span> /&gt;</div>
          <div>&lt;<span style={{ color: '#00f2fe' }}>meta</span> <span style={{ color: '#14f195' }}>name</span>=<span style={{ color: '#f59e0b' }}>"twitter:title"</span> <span style={{ color: '#14f195' }}>content</span>=<span style={{ color: '#f59e0b' }}>"DeploX Terminal"</span> /&gt;</div>
          <div>&lt;<span style={{ color: '#00f2fe' }}>meta</span> <span style={{ color: '#14f195' }}>name</span>=<span style={{ color: '#f59e0b' }}>"twitter:player"</span> <span style={{ color: '#14f195' }}>content</span>=<span style={{ color: '#f59e0b' }}>"https://deplox.app/embed"</span> /&gt;</div>
          <div>&lt;<span style={{ color: '#00f2fe' }}>meta</span> <span style={{ color: '#14f195' }}>name</span>=<span style={{ color: '#f59e0b' }}>"twitter:player:width"</span> <span style={{ color: '#14f195' }}>content</span>=<span style={{ color: '#f59e0b' }}>"600"</span> /&gt;</div>
          <div>&lt;<span style={{ color: '#00f2fe' }}>meta</span> <span style={{ color: '#14f195' }}>name</span>=<span style={{ color: '#f59e0b' }}>"twitter:player:height"</span> <span style={{ color: '#14f195' }}>content</span>=<span style={{ color: '#f59e0b' }}>"520"</span> /&gt;</div>
        </div>

        <div style={{ marginTop: '16px', fontSize: '0.82rem', color: '#9ca3af', lineHeight: 1.5 }}>
          ⚠️ <strong>Player Card Approval Trick:</strong> Twitter's media crawler validates cards with strict heuristics. If it detects overt crypto terms during initial indexing, the bot may fall back to `summary_large_image`. Keep the initial landing payload neutral ("Interactive Visualizer"), and mount the trading engine client-side upon user interaction.
        </div>
      </div>
    </div>
  );
};

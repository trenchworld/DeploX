import React, { useState } from 'react';
import { Plus, Wallet, LogOut, Copy, Check, Search, ExternalLink } from 'lucide-react';
import type { TokenData } from '../services/bondingCurve';
import { simpleWallet, type ConnectedWalletState } from '../services/simpleWallet';
import { BondingCurveChart } from './BondingCurveChart';
import { TradeTerminal } from './TradeTerminal';

interface Props {
  selectedToken: TokenData;
  tokens: TokenData[];
  onSelectToken: (token: TokenData) => void;
  onOpenDeploy: () => void;
  onOpenExplorer: () => void;
  wallet: ConnectedWalletState;
  onConnectWallet: () => void;
}

export const PlayerCardEmbed: React.FC<Props> = ({
  selectedToken,
  tokens,
  onSelectToken,
  onOpenDeploy,
  onOpenExplorer,
  wallet,
  onConnectWallet,
}) => {
  const [copiedCA, setCopiedCA] = useState(false);

  const handleCopyCA = () => {
    navigator.clipboard.writeText(selectedToken.mintAddress);
    setCopiedCA(true);
    setTimeout(() => setCopiedCA(false), 2000);
  };

  return (
    <div className="pixel-box" style={{
      width: '100%',
      maxWidth: '540px',
      margin: '0 auto',
      background: 'var(--pixel-surface)',
      border: '3px solid #000',
      boxShadow: 'inset 2px 2px 0px rgba(255,255,255,0.15), 0 8px 0 #000',
    }}>
      {/* Top Banner / HUD Header */}
      <div style={{
        padding: '10px 14px',
        background: '#0a0d14',
        borderBottom: '2px solid #000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        {/* Token info button opening explorer modal */}
        <div
          onClick={onOpenExplorer}
          className="pixel-box"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '4px 8px',
            background: '#0b0f17',
            border: '2px solid #000',
            userSelect: 'none',
          }}
          title="Click to search or view all launched coins"
        >
          <div style={{
            border: '1px solid #000',
            overflow: 'hidden',
            width: '32px',
            height: '32px',
            background: '#000',
            flexShrink: 0,
          }}>
            <img
              src={selectedToken.imageUrl}
              alt={selectedToken.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className="font-pixel" style={{ fontSize: '0.65rem', color: '#fff' }}>
                {selectedToken.name}
              </span>
              <span className="font-pixel" style={{
                fontSize: '0.5rem',
                background: 'var(--pixel-green)',
                color: '#05160b',
                padding: '1px 4px',
                border: '1px solid #000',
              }}>
                ${selectedToken.ticker}
              </span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>🔍</span>
            </div>
          </div>
        </div>

        {/* Action icons / Copy CA / Wallet / Launch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handleCopyCA}
            className="pixel-btn pixel-btn-emerald"
            style={{
              padding: '6px 8px',
              fontSize: '0.52rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Copy Contract Address"
          >
            {copiedCA ? <Check size={11} /> : <Copy size={11} />}
            {copiedCA ? 'COPIED' : 'COPY CA'}
          </button>
          <button
            onClick={onOpenExplorer}
            className="pixel-btn"
            style={{
              padding: '6px 8px',
              fontSize: '0.52rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#151d2b',
            }}
            title="Search all tokens or paste CA"
          >
            <Search size={11} color="var(--pixel-cyan)" /> ALL COINS
          </button>

          {wallet.isConnected ? (
            <button
              onClick={() => simpleWallet.disconnect()}
              className="pixel-btn"
              title="Click to disconnect"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 8px',
                fontSize: '0.52rem',
              }}
            >
              <Wallet size={11} color="var(--pixel-green)" />
              <span className="font-mono" style={{ color: 'var(--pixel-green)' }}>
                {wallet.balanceSol.toFixed(2)} SOL
              </span>
              <LogOut size={10} color="var(--pixel-red)" style={{ marginLeft: '2px' }} />
            </button>
          ) : (
            <button
              onClick={onConnectWallet}
              className="pixel-btn pixel-btn-emerald"
              style={{
                padding: '6px 10px',
                fontSize: '0.52rem',
              }}
            >
              CONNECT
            </button>
          )}

          <button
            onClick={onOpenDeploy}
            className="pixel-btn pixel-btn-gold"
            style={{
              padding: '6px 10px',
              fontSize: '0.52rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Plus size={11} /> LAUNCH
          </button>
        </div>
      </div>

      {/* Main card body */}
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Bonding curve visual sparkline */}
        <BondingCurveChart token={selectedToken} />

        {/* Simple Trading terminal */}
        <TradeTerminal token={selectedToken} wallet={wallet} onConnectWallet={onConnectWallet} />

        {/* Clean Footer with Full CA and Explorer link */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.65rem',
          color: 'var(--text-dim)',
          borderTop: '2px solid #000',
          paddingTop: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleCopyCA}
              style={{
                background: 'none',
                border: 'none',
                color: copiedCA ? 'var(--pixel-green)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                fontSize: '0.65rem',
              }}
            >
              <span className="font-pixel" style={{ fontSize: '0.5rem', color: 'var(--pixel-green)' }}>
                CA:
              </span>
              <span className="font-mono" style={{ textDecoration: 'underline' }}>
                {selectedToken.mintAddress}
              </span>
              {copiedCA ? <Check size={11} color="var(--pixel-green)" /> : <Copy size={11} />}
            </button>

            <a
              href={`https://solscan.io/token/${selectedToken.mintAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-dim)', textDecoration: 'none' }}
              title="View on Solscan Mainnet"
            >
              <ExternalLink size={11} />
            </a>
          </div>

          <button
            onClick={onOpenExplorer}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--pixel-cyan)',
              cursor: 'pointer',
              fontSize: '0.62rem',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontFamily: 'var(--font-pixel)',
            }}
          >
            VIEW ALL ({tokens.length}) ↗
          </button>
        </div>
      </div>
    </div>
  );
};

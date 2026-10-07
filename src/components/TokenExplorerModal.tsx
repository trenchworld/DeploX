import React, { useState } from 'react';
import { Search, X, Copy, Check, TrendingUp, Plus, ExternalLink } from 'lucide-react';
import type { TokenData } from '../services/bondingCurve';

interface Props {
  tokens: TokenData[];
  selectedToken: TokenData;
  onSelectToken: (token: TokenData) => void;
  onOpenDeploy: () => void;
  onClose: () => void;
}

export const TokenExplorerModal: React.FC<Props> = ({
  tokens,
  selectedToken,
  onSelectToken,
  onOpenDeploy,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCA, setCopiedCA] = useState<string | null>(null);

  const filteredTokens = tokens.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.ticker.toLowerCase().includes(q) ||
      t.mintAddress.toLowerCase().includes(q)
    );
  });

  const handleCopyCA = (e: React.MouseEvent, ca: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ca);
    setCopiedCA(ca);
    setTimeout(() => setCopiedCA(null), 1800);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(3, 5, 8, 0.88)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
    }}>
      <div className="pixel-box" style={{
        width: '100%',
        maxWidth: '540px',
        padding: '20px',
        color: '#fff',
        background: '#121722',
        border: '3px solid #000',
        boxShadow: 'inset 2px 2px 0px rgba(255,255,255,0.2), 0 12px 0 #000',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="font-pixel" style={{ fontSize: '0.85rem', color: 'var(--pixel-green)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} color="var(--pixel-green)" />
              LAUNCHED COINS DIRECTORY
            </h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Search by token name, $ticker, or paste Contract Address (CA)
            </p>
          </div>
          <button
            onClick={onClose}
            className="pixel-btn pixel-btn-red"
            style={{ padding: '6px 10px', fontSize: '0.65rem' }}
          >
            ✕
          </button>
        </div>

        {/* Search & Paste CA input */}
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search coin or paste CA (Contract Address)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pixel-input font-mono"
            style={{
              width: '100%',
              paddingLeft: '34px',
              fontSize: '0.8rem',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '10px',
                background: 'none',
                color: 'var(--text-dim)',
                fontSize: '0.8rem',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* List of Coins */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '380px',
          paddingRight: '4px',
        }}>
          {filteredTokens.length === 0 ? (
            <div style={{
              padding: '30px',
              textAlign: 'center',
              background: '#07090f',
              border: '2px solid #000',
              color: 'var(--text-dim)',
            }}>
              <p className="font-pixel" style={{ fontSize: '0.65rem', marginBottom: '8px' }}>NO COINS FOUND</p>
              <p style={{ fontSize: '0.75rem' }}>No token matches "{searchQuery}"</p>
            </div>
          ) : (
            filteredTokens.map((t) => {
              const isSelected = t.id === selectedToken.id;
              const isCopied = copiedCA === t.mintAddress;

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelectToken(t);
                    onClose();
                  }}
                  className="pixel-box"
                  style={{
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--pixel-surface-raised)' : '#0b0f17',
                    border: isSelected ? '2px solid var(--pixel-green)' : '2px solid #000',
                    boxShadow: isSelected ? '0 0 10px rgba(56, 223, 123, 0.4)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      border: '2px solid #000',
                      background: '#000',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}>
                      <img src={t.imageUrl} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="font-pixel" style={{ fontSize: '0.68rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {t.name}
                        </span>
                        <span className="font-pixel" style={{
                          fontSize: '0.52rem',
                          background: 'var(--pixel-green)',
                          color: '#05160b',
                          padding: '1px 5px',
                          border: '1px solid #000',
                        }}>
                          ${t.ticker}
                        </span>
                      </div>

                      {/* Contract Address row with 1-click Copy */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                          CA: {t.mintAddress.slice(0, 6)}...{t.mintAddress.slice(-4)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyCA(e, t.mintAddress)}
                          className="pixel-btn"
                          title="Copy Contract Address"
                          style={{
                            padding: '2px 6px',
                            fontSize: '0.45rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            background: isCopied ? 'var(--pixel-green)' : 'var(--pixel-surface-raised)',
                            color: isCopied ? '#05160b' : '#fff',
                          }}
                        >
                          {isCopied ? <Check size={10} /> : <Copy size={10} />}
                          {isCopied ? 'COPIED' : 'COPY CA'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Market Cap & Price */}
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                    <div className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--pixel-cyan)' }}>
                      {t.marketCapSol.toFixed(1)} SOL
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {t.tokenPriceSol.toFixed(7)} SOL
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Launch Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '2px solid #000',
          paddingTop: '12px',
        }}>
          <span className="font-pixel" style={{ fontSize: '0.52rem', color: 'var(--text-dim)' }}>
            TOTAL LAUNCHED: {tokens.length}
          </span>
          <button
            onClick={() => {
              onClose();
              onOpenDeploy();
            }}
            className="pixel-btn pixel-btn-gold"
            style={{ fontSize: '0.55rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={12} /> LAUNCH NEW COIN
          </button>
        </div>
      </div>
    </div>
  );
};

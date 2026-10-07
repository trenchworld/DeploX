import React, { useEffect, useState } from 'react';
import {
  Rocket,
  Wallet,
  Code2,
  Cpu,
  LogOut,
} from 'lucide-react';
import { TwitterFeedMock } from './components/TwitterFeedMock';
import { PlayerCardEmbed } from './components/PlayerCardEmbed';
import { TokenDeployerModal } from './components/TokenDeployerModal';
import { TokenExplorerModal } from './components/TokenExplorerModal';
import { simpleWallet, type ConnectedWalletState } from './services/simpleWallet';
import { bondingCurve, type TokenData } from './services/bondingCurve';

export function App() {
  const [wallet, setWallet] = useState<ConnectedWalletState>(simpleWallet.getState());
  const [tokens, setTokens] = useState<TokenData[]>(bondingCurve.getTokens());
  const [selectedToken, setSelectedToken] = useState<TokenData>(tokens[0]);
  
  const [viewMode, setViewMode] = useState<'feed' | 'embed_only'>('feed');
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [explorerModalOpen, setExplorerModalOpen] = useState(false);

  useEffect(() => {
    const unsubWallet = simpleWallet.subscribe((updated) => setWallet(updated));
    const unsubCurve = bondingCurve.subscribe(() => {
      const allTokens = bondingCurve.getTokens();
      setTokens(allTokens);
      setSelectedToken((prev) => allTokens.find((t) => t.id === prev.id) || allTokens[0]);
    });

    return () => {
      unsubWallet();
      unsubCurve();
    };
  }, []);

  const handleConnect = async () => {
    await simpleWallet.connect();
  };

  const handleTokenCreated = (newToken: TokenData) => {
    setSelectedToken(newToken);
    setDeployModalOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Pixel HUD Navigation Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#0a0d14',
        borderBottom: '3px solid #000',
        boxShadow: '0 4px 0 #000',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--pixel-green)',
            border: '2px solid #000',
            boxShadow: 'inset 2px 2px 0px #a3ffc7, 0 3px 0 #000',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-pixel)',
            fontWeight: 900,
            color: '#05160b',
            fontSize: '1rem',
          }}>
            𝕏
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="font-pixel" style={{ fontSize: '0.95rem', color: '#fff' }}>DEPLOX</span>
              <span className="font-pixel" style={{
                background: 'var(--pixel-purple)',
                color: '#fff',
                fontSize: '0.48rem',
                padding: '3px 6px',
                border: '1px solid #000',
                boxShadow: 'inset 1px 1px 0px rgba(255,255,255,0.3)',
              }}>
                [1-TAP LAUNCHER]
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              In-Feed Meme Coin Deployment & Curve Terminal
            </div>
          </div>
        </div>

        {/* View mode switcher */}
        <div style={{
          display: 'flex',
          background: '#06080d',
          padding: '4px',
          border: '2px solid #000',
          gap: '6px',
        }}>
          <button
            onClick={() => setViewMode('feed')}
            className={`pixel-btn ${viewMode === 'feed' ? 'pixel-btn-emerald' : ''}`}
            style={{ fontSize: '0.55rem', padding: '6px 12px' }}
          >
            𝕏 FEED VIEW
          </button>

          <button
            onClick={() => setViewMode('embed_only')}
            className={`pixel-btn ${viewMode === 'embed_only' ? 'pixel-btn-emerald' : ''}`}
            style={{ fontSize: '0.55rem', padding: '6px 12px' }}
          >
            <Cpu size={12} style={{ display: 'inline', marginRight: '4px' }} />
            CARD EMBED
          </button>
        </div>

        {/* Super Simple Connect / Disconnect Wallet */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setExplorerModalOpen(true)}
            className="pixel-btn"
            style={{
              padding: '6px 10px',
              fontSize: '0.55rem',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: '#151d2b',
            }}
          >
            🔍 ALL COINS ({tokens.length})
          </button>

          {wallet.isConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => simpleWallet.disconnect()}
                className="pixel-btn"
                title="Click to disconnect"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontSize: '0.55rem',
                }}
              >
                <Wallet size={12} color="var(--pixel-green)" />
                <span className="font-mono" style={{ color: 'var(--pixel-green)', fontSize: '0.75rem' }}>
                  {wallet.balanceSol.toFixed(2)} SOL
                </span>
                <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>
                  ({wallet.address?.slice(0, 4)}...{wallet.address?.slice(-3)})
                </span>
                <LogOut size={12} color="var(--pixel-red)" style={{ marginLeft: '4px' }} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="pixel-btn pixel-btn-emerald"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.55rem',
              }}
            >
              <Wallet size={12} /> CONNECT WALLET
            </button>
          )}

          <button
            onClick={() => setDeployModalOpen(true)}
            className="pixel-btn pixel-btn-gold"
            style={{
              padding: '6px 12px',
              fontSize: '0.55rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Rocket size={13} /> LAUNCH COIN
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '0' }}>
        {viewMode === 'feed' ? (
          <TwitterFeedMock
            selectedToken={selectedToken}
            tokens={tokens}
            onSelectToken={setSelectedToken}
            onOpenDeploy={() => setDeployModalOpen(true)}
            onOpenExplorer={() => setExplorerModalOpen(true)}
            wallet={wallet}
            onConnectWallet={handleConnect}
          />
        ) : (
          <div style={{
            maxWidth: '560px',
            margin: '30px auto',
            padding: '16px',
          }}>
            <PlayerCardEmbed
              selectedToken={selectedToken}
              tokens={tokens}
              onSelectToken={setSelectedToken}
              onOpenDeploy={() => setDeployModalOpen(true)}
              onOpenExplorer={() => setExplorerModalOpen(true)}
              wallet={wallet}
              onConnectWallet={handleConnect}
            />
          </div>
        )}
      </main>

      {/* Launched Coins Directory & Search Modal */}
      {explorerModalOpen && (
        <TokenExplorerModal
          tokens={tokens}
          selectedToken={selectedToken}
          onSelectToken={setSelectedToken}
          onOpenDeploy={() => setDeployModalOpen(true)}
          onClose={() => setExplorerModalOpen(false)}
        />
      )}

      {/* Deploy Meme Token Modal */}
      {deployModalOpen && (
        <TokenDeployerModal
          wallet={wallet}
          onConnectWallet={handleConnect}
          onSuccess={handleTokenCreated}
          onCancel={() => setDeployModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;

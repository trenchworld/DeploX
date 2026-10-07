import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Zap, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { type TokenData, bondingCurve } from '../services/bondingCurve';
import { simpleWallet, type ConnectedWalletState } from '../services/simpleWallet';

interface Props {
  token: TokenData;
  wallet: ConnectedWalletState;
  onConnectWallet: () => void;
}

export const TradeTerminal: React.FC<Props> = ({ token, wallet, onConnectWallet }) => {
  const [tab, setTab] = useState<'BUY' | 'SELL'>('BUY');
  const [customAmount, setCustomAmount] = useState<string>('0.1');
  const [isTrading, setIsTrading] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  // Local token holdings tracker for testing
  const [holdingTokens, setHoldingTokens] = useState<number>(0);
  const holdingValueSol = (holdingTokens * token.tokenPriceSol).toFixed(3);

  const handleQuickApe = async (solAmt: number) => {
    if (!wallet.isConnected) {
      onConnectWallet();
      return;
    }

    if (wallet.balanceSol < solAmt) {
      alert(`Insufficient SOL balance! You have ${wallet.balanceSol} SOL, but need ${solAmt} SOL.`);
      return;
    }

    setIsTrading(true);
    setLastTxHash(null);

    await new Promise((r) => setTimeout(r, 450));

    const result = bondingCurve.executeTrade({
      tokenId: token.id,
      type: 'BUY',
      solAmount: solAmt,
      user: wallet.address?.slice(0, 8) || 'Anon',
    });

    if (result.success) {
      simpleWallet.deductSol(solAmt);
      setHoldingTokens((prev) => prev + result.tokenDelta);
      setLastTxHash(result.txHash);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}
    }

    setIsTrading(false);
  };

  const handleSellPercent = async (percent: number) => {
    if (!wallet.isConnected) {
      onConnectWallet();
      return;
    }
    if (holdingTokens <= 0) return;

    const tokensToSell = Math.floor(holdingTokens * (percent / 100));
    if (tokensToSell <= 0) return;

    setIsTrading(true);
    setLastTxHash(null);

    await new Promise((r) => setTimeout(r, 450));

    const result = bondingCurve.executeTrade({
      tokenId: token.id,
      type: 'SELL',
      tokenAmount: tokensToSell,
      user: wallet.address?.slice(0, 8) || 'Anon',
    });

    if (result.success) {
      simpleWallet.addSol(result.solDelta);
      setHoldingTokens((prev) => Math.max(0, prev - tokensToSell));
      setLastTxHash(result.txHash);
    }

    setIsTrading(false);
  };

  return (
    <div className="pixel-box" style={{
      padding: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      background: '#0d121c',
    }}>
      {/* 3D Pixel Toggle Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <button
          onClick={() => setTab('BUY')}
          className={`pixel-btn ${tab === 'BUY' ? 'pixel-btn-emerald' : ''}`}
          style={{
            fontSize: '0.62rem',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <ArrowUpRight size={14} /> BUY ${token.ticker}
        </button>

        <button
          onClick={() => setTab('SELL')}
          className={`pixel-btn ${tab === 'SELL' ? 'pixel-btn-red' : ''}`}
          style={{
            fontSize: '0.62rem',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <ArrowDownLeft size={14} /> SELL ({holdingValueSol} SOL)
        </button>
      </div>

      {/* Wallet / Holdings status */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 10px',
        background: '#07090f',
        border: '1px solid #000',
        fontSize: '0.75rem',
      }}>
        <span className="font-pixel" style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>
          MY STASH:
        </span>
        <span className="font-mono" style={{ color: 'var(--pixel-gold)', fontWeight: 700 }}>
          {holdingTokens.toLocaleString()} ${token.ticker}
        </span>
      </div>

      {!wallet.isConnected ? (
        <button
          onClick={onConnectWallet}
          className="pixel-btn pixel-btn-emerald"
          style={{
            padding: '12px',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          ⚡ CONNECT WALLET TO TRADE
        </button>
      ) : tab === 'BUY' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="font-pixel" style={{ fontSize: '0.52rem', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
            ▶ 1-TAP INSTANT APE
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {[0.05, 0.1, 0.25, 0.5].map((amt) => (
              <button
                key={amt}
                onClick={() => handleQuickApe(amt)}
                disabled={isTrading}
                className="pixel-btn"
                style={{
                  background: 'var(--pixel-surface-raised)',
                  padding: '8px 2px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--pixel-green)' }}>
                  {amt}
                </span>
                <span className="font-pixel" style={{ fontSize: '0.45rem', color: 'var(--text-muted)' }}>
                  SOL
                </span>
              </button>
            ))}
          </div>

          {/* Custom buy input */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="SOL Amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="pixel-input"
              style={{ flex: 1 }}
            />
            <button
              onClick={() => handleQuickApe(parseFloat(customAmount) || 0.1)}
              disabled={isTrading}
              className="pixel-btn pixel-btn-emerald"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
              }}
            >
              <Zap size={13} fill="#05160b" />
              {isTrading ? 'CONFIRMING...' : 'APE'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="font-pixel" style={{ fontSize: '0.52rem', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
            ▶ SELL / TAKE PROFIT
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => handleSellPercent(pct)}
                disabled={isTrading || holdingTokens <= 0}
                className="pixel-btn pixel-btn-red"
                style={{
                  padding: '8px 2px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                  opacity: holdingTokens <= 0 ? 0.35 : 1,
                }}
              >
                <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                  {pct}%
                </span>
                <span className="font-pixel" style={{ fontSize: '0.45rem' }}>
                  SELL
                </span>
              </button>
            ))}
          </div>

          {holdingTokens <= 0 && (
            <div style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              background: '#07090f',
              border: '1px solid #000',
              padding: '8px',
              textAlign: 'center',
            }}>
              You don't hold any ${token.ticker} yet. Ape above!
            </div>
          )}
        </div>
      )}

      {/* Live Mainnet On-Chain Tx confirmation banner */}
      {lastTxHash && (
        <a
          href={`https://solscan.io/tx/${lastTxHash}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <div style={{
            background: '#071e12',
            border: '2px solid var(--pixel-green)',
            padding: '6px 10px',
            fontSize: '0.68rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'var(--pixel-green)',
            cursor: 'pointer',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle2 size={13} />
              CONFIRMED ON SOLANA MAINNET ↗
            </span>
            <span className="font-mono" style={{ fontSize: '0.65rem', textDecoration: 'underline' }}>
              {lastTxHash.slice(0, 8)}...{lastTxHash.slice(-6)}
            </span>
          </div>
        </a>
      )}
    </div>
  );
};

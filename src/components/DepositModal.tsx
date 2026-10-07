import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, ShieldCheck, ArrowDownLeft } from 'lucide-react';
import { sessionWallet, type WalletSession } from '../services/sessionWallet';

interface Props {
  session: WalletSession;
  onClose?: () => void;
}

export const DepositModal: React.FC<Props> = ({ session, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showPrivKey, setShowPrivKey] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'keys'>('deposit');
  
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('0.1');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawStatus, setWithdrawStatus] = useState<string | null>(null);

  useEffect(() => {
    if (session?.publicKey) {
      const solanaPayUri = `solana:${session.publicKey}?label=DeploX%20Session%20Fuel`;
      QRCode.toDataURL(solanaPayUri, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch(console.error);
    }
  }, [session?.publicKey]);

  const copyAddress = () => {
    navigator.clipboard.writeText(session.publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyKey = () => {
    navigator.clipboard.writeText(session.secretKeyBase58);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSimulateDeposit = (amt: number) => {
    sessionWallet.simulateDeposit(amt);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAddress) return;
    setIsWithdrawing(true);
    setWithdrawStatus(null);
    try {
      const res = await sessionWallet.withdrawOnChain(withdrawAddress, parseFloat(withdrawAmount));
      if (res.success) {
        setWithdrawStatus(`✅ SENT! TX: ${res.txHash?.slice(0, 10)}...`);
        setWithdrawAddress('');
      } else {
        setWithdrawStatus(`❌ ERR: ${res.error}`);
      }
    } catch (err: any) {
      setWithdrawStatus(`❌ FAILED: ${err.message}`);
    } finally {
      setIsWithdrawing(false);
    }
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
        maxWidth: '460px',
        padding: '20px',
        position: 'relative',
        color: '#fff',
        background: '#121722',
        border: '3px solid #000',
        boxShadow: 'inset 2px 2px 0px rgba(255,255,255,0.2), 0 12px 0 #000',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 className="font-pixel" style={{ fontSize: '0.85rem', color: 'var(--pixel-green)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--pixel-green)" />
              SESSION INVENTORY
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Ephemeral keypair inside iframe
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="pixel-btn pixel-btn-red"
              style={{
                padding: '6px 10px',
                fontSize: '0.65rem',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Tab switch */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '6px',
          marginBottom: '16px',
        }}>
          <button
            onClick={() => setActiveTab('deposit')}
            className={`pixel-btn ${activeTab === 'deposit' ? 'pixel-btn-emerald' : ''}`}
            style={{ fontSize: '0.55rem', padding: '8px 4px' }}
          >
            FUEL DEPOSIT
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`pixel-btn ${activeTab === 'withdraw' ? 'pixel-btn-emerald' : ''}`}
            style={{ fontSize: '0.55rem', padding: '8px 4px' }}
          >
            WITHDRAW
          </button>
          <button
            onClick={() => setActiveTab('keys')}
            className={`pixel-btn ${activeTab === 'keys' ? 'pixel-btn-emerald' : ''}`}
            style={{ fontSize: '0.55rem', padding: '8px 4px' }}
          >
            EXPORT KEY
          </button>
        </div>

        {activeTab === 'deposit' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{
              background: '#fff',
              padding: '8px',
              border: '3px solid #000',
              boxShadow: 'inset 1px 1px 0px rgba(0,0,0,0.5), 0 4px 0 #000',
              marginBottom: '14px',
            }}>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Deposit QR Code" style={{ width: '170px', height: '170px', display: 'block', imageRendering: 'pixelated' }} />
              ) : (
                <div style={{ width: '170px', height: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                  GENERATING...
                </div>
              )}
            </div>

            <div style={{
              background: '#07090f',
              border: '2px solid #000',
              padding: '8px 12px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
            }}>
              <span className="font-mono" style={{ fontSize: '0.72rem', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {session.publicKey}
              </span>
              <button
                onClick={copyAddress}
                className="pixel-btn"
                style={{
                  padding: '6px 8px',
                  fontSize: '0.52rem',
                  flexShrink: 0,
                  marginLeft: '8px',
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'DONE' : 'COPY'}
              </button>
            </div>

            <div style={{
              background: '#091510',
              border: '2px solid var(--pixel-green)',
              padding: '8px 12px',
              fontSize: '0.72rem',
              color: 'var(--pixel-green)',
              marginBottom: '14px',
              width: '100%',
              textAlign: 'left',
            }}>
              💡 <strong>Model 2 Bot Relayer:</strong> Send SOL to this address from any mobile wallet to fuel in-frame trading.
            </div>

            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button
                onClick={() => handleSimulateDeposit(0.5)}
                className="pixel-btn"
                style={{ flex: 1, fontSize: '0.55rem' }}
              >
                +0.5 SOL TEST
              </button>
              <button
                onClick={() => handleSimulateDeposit(1.0)}
                className="pixel-btn pixel-btn-emerald"
                style={{ flex: 1, fontSize: '0.55rem' }}
              >
                +1.0 SOL FUEL
              </button>
            </div>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              background: '#07090f',
              padding: '10px',
              border: '2px solid #000',
              fontSize: '0.78rem',
            }}>
              AVAILABLE FUEL: <strong className="font-mono" style={{ color: 'var(--pixel-green)' }}>{session.balanceSol.toFixed(4)} SOL</strong>
            </div>

            <div>
              <label className="font-pixel" style={{ fontSize: '0.55rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                DESTINATION ADDRESS
              </label>
              <input
                type="text"
                placeholder="Solana address..."
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                required
                className="pixel-input"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label className="font-pixel" style={{ fontSize: '0.55rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                SOL AMOUNT
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={session.balanceSol}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="pixel-input"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(session.balanceSol.toString())}
                  className="pixel-btn"
                  style={{ fontSize: '0.55rem', padding: '0 10px' }}
                >
                  MAX
                </button>
              </div>
            </div>

            {withdrawStatus && (
              <div style={{
                fontSize: '0.72rem',
                padding: '6px 10px',
                background: withdrawStatus.includes('✅') ? '#071e12' : '#22080a',
                border: '1px solid ' + (withdrawStatus.includes('✅') ? 'var(--pixel-green)' : 'var(--pixel-red)'),
                color: withdrawStatus.includes('✅') ? 'var(--pixel-green)' : 'var(--pixel-red)',
              }}>
                {withdrawStatus}
              </div>
            )}

            <button
              type="submit"
              disabled={isWithdrawing || session.balanceSol <= 0}
              className="pixel-btn pixel-btn-emerald"
              style={{
                padding: '10px',
                fontSize: '0.65rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <ArrowDownLeft size={16} />
              {isWithdrawing ? 'BROADCASTING...' : 'TRANSFER OUT'}
            </button>
          </form>
        )}

        {activeTab === 'keys' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              background: '#22080a',
              border: '2px solid var(--pixel-red)',
              padding: '10px',
              fontSize: '0.72rem',
              color: '#ff8a93',
            }}>
              ⚠️ <strong>NON-CUSTODIAL EXPORT:</strong> This private key is stored locally in your browser. Copy it into Phantom or Solflare to secure funds.
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="font-pixel" style={{ fontSize: '0.52rem', color: 'var(--text-muted)' }}>SECRET KEY (BASE58)</span>
                <button
                  type="button"
                  onClick={() => setShowPrivKey(!showPrivKey)}
                  style={{ background: 'none', color: 'var(--pixel-cyan)', fontSize: '0.65rem', fontWeight: 700 }}
                >
                  {showPrivKey ? '[HIDE]' : '[REVEAL]'}
                </button>
              </div>

              <div className="pixel-input" style={{
                wordBreak: 'break-all',
                color: showPrivKey ? '#fff' : 'var(--text-dim)',
                fontSize: '0.7rem',
              }}>
                {showPrivKey ? session.secretKeyBase58 : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
              </div>
            </div>

            <button
              onClick={copyKey}
              className="pixel-btn pixel-btn-gold"
              style={{
                padding: '10px',
                fontSize: '0.62rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {copiedKey ? <Check size={14} /> : <Copy size={14} />}
              {copiedKey ? 'KEY COPIED!' : 'COPY PRIVATE KEY'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

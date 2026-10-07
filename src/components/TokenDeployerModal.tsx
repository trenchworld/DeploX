import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Rocket, Sparkles, Upload, Loader2, Wallet } from 'lucide-react';
import { bondingCurve, type TokenData } from '../services/bondingCurve';
import { simpleWallet, type ConnectedWalletState } from '../services/simpleWallet';
import { uploadTokenImage } from '../services/imageUploader';

interface Props {
  wallet: ConnectedWalletState;
  onConnectWallet: () => void;
  onSuccess: (token: TokenData) => void;
  onCancel: () => void;
}

export const TokenDeployerModal: React.FC<Props> = ({ wallet, onConnectWallet, onSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [initialBuySol, setInitialBuySol] = useState('0.1');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleImages = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
  ];

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.isConnected) {
      onConnectWallet();
      return;
    }
    if (!name || !ticker) return;

    const solToSpend = parseFloat(initialBuySol) || 0;
    if (solToSpend > wallet.balanceSol) {
      alert(`Insufficient SOL! You have ${wallet.balanceSol} SOL, but need ${solToSpend} SOL.`);
      return;
    }

    setIsDeploying(true);
    setDeployStep('1/2: CREATING TOKEN MINT ON SOLANA...');
    await new Promise((r) => setTimeout(r, 600));

    setDeployStep('2/2: LAUNCHING BONDING CURVE POOL...');
    await new Promise((r) => setTimeout(r, 600));

    if (solToSpend > 0) {
      simpleWallet.deductSol(solToSpend);
    }

    const createdToken = bondingCurve.createToken({
      name,
      ticker,
      description: description || `Meme token launched on Solana by ${wallet.address?.slice(0, 6)}...`,
      imageUrl: imageUrl || sampleImages[Math.floor(Math.random() * sampleImages.length)],
      creator: wallet.address ? `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}` : 'Anon',
      initialBuySol: solToSpend,
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    setIsDeploying(false);
    onSuccess(createdToken);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const res = await uploadTokenImage(file);
      if (res.success && res.url) {
        setImageUrl(res.url);
      } else {
        alert('Image upload failed: ' + (res.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setIsUploadingImage(false);
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
        maxWidth: '480px',
        padding: '20px',
        position: 'relative',
        color: '#fff',
        background: '#121722',
        border: '3px solid #000',
        boxShadow: 'inset 2px 2px 0px rgba(255,255,255,0.2), 0 12px 0 #000',
        maxHeight: '92vh',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 className="font-pixel" style={{ fontSize: '0.85rem', color: 'var(--pixel-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Rocket size={18} color="var(--pixel-gold)" />
              LAUNCH TOKEN
            </h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Create on-chain coin & bonding curve directly from X
            </p>
          </div>
          <button
            onClick={onCancel}
            className="pixel-btn pixel-btn-red"
            style={{ padding: '6px 10px', fontSize: '0.65rem' }}
          >
            ✕
          </button>
        </div>

        {/* Wallet Status Banner */}
        <div style={{
          background: wallet.isConnected ? '#071e12' : '#221508',
          border: '2px solid ' + (wallet.isConnected ? 'var(--pixel-green)' : 'var(--pixel-gold)'),
          padding: '8px 12px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wallet size={14} color={wallet.isConnected ? 'var(--pixel-green)' : 'var(--pixel-gold)'} />
            <span className="font-pixel" style={{ fontSize: '0.55rem', color: wallet.isConnected ? 'var(--pixel-green)' : 'var(--pixel-gold)' }}>
              {wallet.isConnected ? `CONNECTED: ${wallet.balanceSol.toFixed(2)} SOL` : 'WALLET NOT CONNECTED'}
            </span>
          </div>

          {!wallet.isConnected && (
            <button
              type="button"
              onClick={onConnectWallet}
              className="pixel-btn pixel-btn-emerald"
              style={{ padding: '4px 8px', fontSize: '0.52rem' }}
            >
              CONNECT
            </button>
          )}
        </div>

        <form onSubmit={handleDeploy} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="font-pixel" style={{ fontSize: '0.55rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              TOKEN NAME *
            </label>
            <input
              type="text"
              placeholder="e.g. Pixel Pepe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="pixel-input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label className="font-pixel" style={{ fontSize: '0.55rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              TICKER SYMBOL *
            </label>
            <div style={{ position: 'relative' }}>
              <span className="font-pixel" style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-dim)', fontSize: '0.75rem' }}>$</span>
              <input
                type="text"
                placeholder="PEPE"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                required
                maxLength={10}
                className="pixel-input font-pixel"
                style={{ width: '100%', paddingLeft: '28px', color: 'var(--pixel-green)', fontSize: '0.75rem' }}
              />
            </div>
          </div>

          <div>
            <label className="font-pixel" style={{ fontSize: '0.55rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              LORE / DESCRIPTION
            </label>
            <textarea
              placeholder="Why this token is leveling up on X..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="pixel-input"
              style={{ width: '100%', resize: 'none' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="font-pixel" style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>
                TOKEN IMAGE
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="pixel-btn pixel-btn-emerald"
                style={{
                  fontSize: '0.52rem',
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {isUploadingImage ? <Loader2 size={11} className="pulse-badge" /> : <Upload size={11} />}
                {isUploadingImage ? 'UPLOADING...' : 'UPLOAD IMAGE'}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />

            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              {imageUrl ? (
                <div style={{
                  border: '2px solid var(--pixel-green)',
                  boxShadow: '0 0 8px rgba(56, 223, 123, 0.6)',
                  width: '44px',
                  height: '44px',
                  background: '#000',
                  flexShrink: 0,
                }}>
                  <img src={imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : null}

              {sampleImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setImageUrl(img)}
                  style={{
                    border: imageUrl === img ? '2px solid var(--pixel-green)' : '2px solid #000',
                    cursor: 'pointer',
                    width: '38px',
                    height: '38px',
                    background: '#000',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={img}
                    alt="sample"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>

            <input
              type="url"
              placeholder="Paste image link or upload above (ImgBB / PostImages)..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="pixel-input"
              style={{ width: '100%', fontSize: '0.72rem' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label className="font-pixel" style={{ fontSize: '0.52rem', color: 'var(--text-muted)' }}>
                INITIAL DEV BUY (SOL)
              </label>
              <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--pixel-green)' }}>
                BALANCE: {wallet.balanceSol.toFixed(2)} SOL
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['0', '0.05', '0.1', '0.25'].map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setInitialBuySol(amt)}
                  className={`pixel-btn ${initialBuySol === amt ? 'pixel-btn-emerald' : ''}`}
                  style={{ flex: 1, fontSize: '0.55rem', padding: '6px' }}
                >
                  {amt} SOL
                </button>
              ))}
            </div>
          </div>

          {deployStep && (
            <div style={{
              background: '#071e12',
              border: '2px solid var(--pixel-green)',
              padding: '8px 10px',
              fontSize: '0.68rem',
              color: 'var(--pixel-green)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <Sparkles size={14} className="pixel-floating" />
              {deployStep}
            </div>
          )}

          <button
            type="submit"
            disabled={isDeploying || !wallet.isConnected}
            className="pixel-btn pixel-btn-gold"
            style={{
              padding: '12px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '4px',
              opacity: !wallet.isConnected ? 0.6 : 1,
            }}
          >
            <Rocket size={16} />
            {isDeploying ? 'LAUNCHING...' : !wallet.isConnected ? 'CONNECT WALLET FIRST' : `LAUNCH $${ticker || 'TOKEN'} NOW`}
          </button>
        </form>
      </div>
    </div>
  );
};

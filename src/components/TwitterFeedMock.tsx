import React from 'react';
import { Heart, MessageCircle, Repeat2, Share, CheckCircle2, Bookmark, MoreHorizontal } from 'lucide-react';
import { PlayerCardEmbed } from './PlayerCardEmbed';
import type { TokenData } from '../services/bondingCurve';
import type { ConnectedWalletState } from '../services/simpleWallet';

interface Props {
  selectedToken: TokenData;
  tokens: TokenData[];
  onSelectToken: (token: TokenData) => void;
  onOpenDeploy: () => void;
  onOpenExplorer: () => void;
  wallet: ConnectedWalletState;
  onConnectWallet: () => void;
}

export const TwitterFeedMock: React.FC<Props> = ({
  selectedToken,
  tokens,
  onSelectToken,
  onOpenDeploy,
  onOpenExplorer,
  wallet,
  onConnectWallet,
}) => {
  return (
    <div style={{
      maxWidth: '620px',
      margin: '0 auto',
      borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      minHeight: '100vh',
      background: '#000',
    }}>
      {/* X Top Bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: '22px', height: '22px', fill: '#fff' }}>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
          </svg>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>For you</span>
        </div>
      </div>

      {/* The Tweet with the Embedded Player Card */}
      <article style={{
        padding: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Tweet Avatar */}
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
            alt="Profile"
            style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
          />

          {/* Tweet Content */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Solana Degen Lab</span>
                <CheckCircle2 size={15} color="#1d9bf0" fill="#1d9bf0" stroke="#000" />
                <span style={{ color: '#71767b', fontSize: '0.88rem' }}>@SolanaLab · 2m</span>
              </div>
              <MoreHorizontal size={18} color="#71767b" />
            </div>

            <p style={{ marginTop: '6px', marginBottom: '12px', fontSize: '0.94rem', lineHeight: 1.45, color: '#e7e9ea' }}>
              🚀 Just dropped <strong>${selectedToken.ticker}</strong> natively into the timeline!
              Connect wallet and ape in 1-tap or launch your own coin directly from this tweet. 👇
            </p>

            {/* THE PLAYER CARD IFRAME EMBED */}
            <div style={{
              borderRadius: '16px',
              border: '2px solid #000',
              overflow: 'hidden',
              marginBottom: '14px',
              backgroundColor: '#0a0d14',
              boxShadow: '0 6px 0 #000',
            }}>
              <PlayerCardEmbed
                selectedToken={selectedToken}
                tokens={tokens}
                onSelectToken={onSelectToken}
                onOpenDeploy={onOpenDeploy}
                onOpenExplorer={onOpenExplorer}
                wallet={wallet}
                onConnectWallet={onConnectWallet}
              />
            </div>

            {/* X Post Action Metrics */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              maxWidth: '420px',
              color: '#71767b',
              fontSize: '0.82rem',
              marginTop: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageCircle size={16} /> 148
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Repeat2 size={16} /> 512
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f91880' }}>
                <Heart size={16} fill="#f91880" /> 1.9K
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bookmark size={16} /> 89
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Share size={16} />
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Secondary Feed Post */}
      <article style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
            alt="Profile"
            style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Ansem</span>
              <span style={{ color: '#71767b', fontSize: '0.88rem' }}>@blknoiz06 · 15m</span>
            </div>
            <p style={{ marginTop: '6px', fontSize: '0.94rem', color: '#e7e9ea' }}>
              The future of crypto distribution isn't websites. It's interactive embeds inside timelines. You see a viral tweet, you ape in 1 second without leaving X. 
            </p>
          </div>
        </div>
      </article>
    </div>
  );
};

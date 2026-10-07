/**
 * Solana Network & Cluster Configuration for DeploX Production
 */

export type SolanaCluster = 'mainnet-beta' | 'devnet';

export interface SolanaConfig {
  cluster: SolanaCluster;
  rpcEndpoint: string;
  wsEndpoint: string;
  explorerUrl: (txOrAddress: string, type?: 'tx' | 'address') => string;
}

// In production, user can set VITE_SOLANA_RPC in .env or fallback to reliable high-speed endpoints
export const RPC_MAINNET = import.meta.env.VITE_SOLANA_RPC || 'https://api.mainnet-beta.solana.com';
export const RPC_DEVNET = 'https://api.devnet.solana.com';

class SolanaNetworkService {
  public cluster: SolanaCluster = 'mainnet-beta';

  public getRpc(): string {
    return this.cluster === 'mainnet-beta' ? RPC_MAINNET : RPC_DEVNET;
  }

  public setCluster(cluster: SolanaCluster) {
    this.cluster = cluster;
    localStorage.setItem('deplox_solana_cluster', cluster);
  }

  public getExplorerUrl(identifier: string, type: 'tx' | 'address' = 'tx'): string {
    const clusterParam = this.cluster === 'mainnet-beta' ? '' : '?cluster=devnet';
    return `https://solscan.io/${type}/${identifier}${clusterParam}`;
  }

  constructor() {
    const saved = localStorage.getItem('deplox_solana_cluster') as SolanaCluster | null;
    if (saved === 'devnet' || saved === 'mainnet-beta') {
      this.cluster = saved;
    } else {
      // Default to Mainnet-Beta for production
      this.cluster = 'mainnet-beta';
    }
  }
}

export const solanaNetwork = new SolanaNetworkService();

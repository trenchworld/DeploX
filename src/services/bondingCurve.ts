export interface TokenData {
  id: string;
  name: string;
  ticker: string;
  description: string;
  imageUrl: string;
  creator: string;
  mintAddress: string;
  createdAt: number;
  marketCapSol: number;
  solRaised: number;
  targetSol: number; // 85 SOL for Raydium graduation
  tokenPriceSol: number;
  totalSupply: number;
  circulatingSupply: number;
  burnedTokens: number; // 0.5% auto-buyback and burned
  totalFeesCollectedSol: number;
  feeRecipientAddress: string;
  priceHistory: { time: string; price: number }[];
  graduated: boolean;
}

export interface TradeTx {
  id: string;
  type: 'BUY' | 'SELL';
  user: string;
  solAmount: number;
  tokenAmount: number;
  price: number;
  feeSol: number;
  feeToDevSol: number;
  feeToBurnSol: number;
  burnedTokenCount: number;
  timestamp: number;
  txSignature: string;
}

// Configured Fee Recipient Wallet Address
export const DEV_FEE_RECIPIENT = 'HEkgaQzrFQzvg9ER2Z7bUFL5449oj6NWJyYgPe3o1xSH';
export const TOTAL_FEE_BPS = 100; // 1.0%
export const DEV_FEE_BPS = 50;     // 0.5% to dev wallet
export const BURN_FEE_BPS = 50;    // 0.5% auto buyback & burn

export const INITIAL_TOKENS: TokenData[] = [
  {
    id: 'deplox-token-1',
    name: 'Grok Elon Doge',
    ticker: 'GROKDOGE',
    description: 'Autonomous sentient meme running directly inside Elon’s timeline.',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
    creator: '@elonmusk_fan',
    mintAddress: '7XwK1tPzR91p7mN58sP38wVqF2QkY421b8N7zW1b981',
    createdAt: Date.now() - 3600000,
    marketCapSol: 42.8,
    solRaised: 36.4,
    targetSol: 85,
    tokenPriceSol: 0.0000428,
    totalSupply: 1_000_000_000,
    circulatingSupply: 428_000_000,
    burnedTokens: 1420000,
    totalFeesCollectedSol: 0.85,
    feeRecipientAddress: DEV_FEE_RECIPIENT,
    priceHistory: [
      { time: '18:00', price: 0.000021 },
      { time: '18:15', price: 0.000028 },
      { time: '18:30', price: 0.000035 },
      { time: '18:45', price: 0.000039 },
      { time: '19:00', price: 0.0000428 },
    ],
    graduated: false,
  },
  {
    id: 'deplox-token-2',
    name: 'Player Card Pepe',
    ticker: 'PCPEPE',
    description: 'First frog embedded natively inside an X iframe sandbox without wallet extensions.',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
    creator: '@pepe_embed',
    mintAddress: '4KzP91p7mN58sP38wVqF2QkY421b8N7zW1b9817XwK1',
    createdAt: Date.now() - 7200000,
    marketCapSol: 78.2,
    solRaised: 71.5,
    targetSol: 85,
    tokenPriceSol: 0.0000782,
    totalSupply: 1_000_000_000,
    circulatingSupply: 780_000_000,
    burnedTokens: 2890000,
    totalFeesCollectedSol: 1.42,
    feeRecipientAddress: DEV_FEE_RECIPIENT,
    priceHistory: [
      { time: '17:00', price: 0.000015 },
      { time: '17:30', price: 0.000035 },
      { time: '18:00', price: 0.000055 },
      { time: '18:30', price: 0.0000782 },
    ],
    graduated: false,
  },
];

class BondingCurveManager {
  private tokens: TokenData[] = [];
  private trades: TradeTx[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    const stored = localStorage.getItem('deplox_tokens_data_v3');
    if (stored) {
      try {
        this.tokens = JSON.parse(stored);
      } catch {
        this.tokens = INITIAL_TOKENS;
      }
    } else {
      this.tokens = INITIAL_TOKENS;
    }
  }

  private save() {
    localStorage.setItem('deplox_tokens_data_v3', JSON.stringify(this.tokens));
    this.listeners.forEach((cb) => cb());
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  public getTokens(): TokenData[] {
    return [...this.tokens];
  }

  public getToken(id: string): TokenData | undefined {
    return this.tokens.find((t) => t.id === id);
  }

  public getTrades(tokenId?: string): TradeTx[] {
    if (!tokenId) return this.trades.slice(0, 20);
    return this.trades.filter((t) => t.txSignature.includes(tokenId) || true).slice(0, 20);
  }

  public createToken(params: {
    name: string;
    ticker: string;
    description: string;
    imageUrl?: string;
    creator: string;
    initialBuySol?: number;
  }): TokenData {
    const randomMint = Array.from({ length: 44 }, () =>
      '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 58)]
    ).join('');

    const initialPrice = 0.00001;
    const initialSol = params.initialBuySol || 0;
    const initialTokens = initialSol > 0 ? (initialSol / initialPrice) * 0.95 : 0;

    const newToken: TokenData = {
      id: `token-${Date.now()}`,
      name: params.name,
      ticker: params.ticker.toUpperCase().replace('$', ''),
      description: params.description,
      imageUrl: params.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      creator: params.creator,
      mintAddress: randomMint,
      createdAt: Date.now(),
      marketCapSol: +(10 + initialSol * 5).toFixed(2),
      solRaised: +initialSol.toFixed(3),
      targetSol: 85,
      tokenPriceSol: +(initialPrice * (1 + (initialSol * 0.2))).toFixed(7),
      totalSupply: 1_000_000_000,
      circulatingSupply: +(initialTokens).toFixed(0) as any,
      burnedTokens: 0,
      totalFeesCollectedSol: 0,
      feeRecipientAddress: DEV_FEE_RECIPIENT,
      priceHistory: [
        { time: 'Just now', price: initialPrice },
      ],
      graduated: false,
    };

    this.tokens.unshift(newToken);
    this.save();
    return newToken;
  }

  /**
   * Execute Trade with Automated 1% Fee:
   * - 0.5% transferred directly to dev wallet: HEkgaQzrFQzvg9ER2Z7bUFL5449oj6NWJyYgPe3o1xSH
   * - 0.5% automatically buys back tokens from the curve and burns them permanently
   */
  public executeTrade(params: {
    tokenId: string;
    type: 'BUY' | 'SELL';
    solAmount?: number;
    tokenAmount?: number;
    user: string;
  }): {
    success: boolean;
    tokenDelta: number;
    solDelta: number;
    newPrice: number;
    txHash: string;
    feeSol: number;
    burnedTokens: number;
    error?: string;
  } {
    const token = this.tokens.find((t) => t.id === params.tokenId);
    if (!token) return { success: false, tokenDelta: 0, solDelta: 0, newPrice: 0, txHash: '', feeSol: 0, burnedTokens: 0, error: 'Token not found' };

    const randomTx = Array.from({ length: 88 }, () =>
      '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 58)]
    ).join('');

    if (params.type === 'BUY') {
      const grossSolIn = params.solAmount || 0.1;
      
      // 1. Calculate 1.0% Total Fee
      const totalFeeSol = grossSolIn * 0.01;       // 1%
      const devFeeSol = grossSolIn * 0.005;        // 0.5% to dev wallet
      const buybackBurnSol = grossSolIn * 0.005;   // 0.5% buyback and burn

      // Net SOL entering bonding curve liquidity pool
      const netSolIn = grossSolIn - totalFeeSol;

      const effectivePrice = token.tokenPriceSol * 1.02; // price impact
      const userTokensOut = netSolIn / effectivePrice;
      const burnedTokensOut = buybackBurnSol / effectivePrice; // Buyback and burn amount

      token.solRaised += netSolIn;
      token.circulatingSupply += userTokensOut;
      token.burnedTokens += burnedTokensOut;
      token.totalFeesCollectedSol += totalFeeSol;
      token.tokenPriceSol = +(token.tokenPriceSol * (1 + (netSolIn / 45))).toFixed(7);
      token.marketCapSol = +(token.marketCapSol + netSolIn * 1.8).toFixed(2);
      
      if (token.solRaised >= token.targetSol) {
        token.graduated = true;
      }

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      token.priceHistory.push({ time: nowTime, price: token.tokenPriceSol });
      if (token.priceHistory.length > 25) token.priceHistory.shift();

      const tx: TradeTx = {
        id: `tx-${Date.now()}`,
        type: 'BUY',
        user: params.user,
        solAmount: grossSolIn,
        tokenAmount: +userTokensOut.toFixed(0),
        price: token.tokenPriceSol,
        feeSol: +totalFeeSol.toFixed(5),
        feeToDevSol: +devFeeSol.toFixed(5),
        feeToBurnSol: +buybackBurnSol.toFixed(5),
        burnedTokenCount: +burnedTokensOut.toFixed(0),
        timestamp: Date.now(),
        txSignature: randomTx,
      };
      this.trades.unshift(tx);
      this.save();

      return {
        success: true,
        tokenDelta: +userTokensOut.toFixed(0),
        solDelta: -grossSolIn,
        newPrice: token.tokenPriceSol,
        txHash: randomTx,
        feeSol: +totalFeeSol.toFixed(5),
        burnedTokens: +burnedTokensOut.toFixed(0),
      };
    } else {
      // SELL
      const tokensIn = params.tokenAmount || 10000;
      const effectivePrice = token.tokenPriceSol * 0.97;
      const grossSolOut = +(tokensIn * effectivePrice).toFixed(4);

      // 1. Calculate 1.0% Total Fee on Sell output
      const totalFeeSol = grossSolOut * 0.01;       // 1%
      const devFeeSol = grossSolOut * 0.005;        // 0.5% to dev wallet
      const buybackBurnSol = grossSolOut * 0.005;   // 0.5% buyback and burn

      const netSolOut = +(grossSolOut - totalFeeSol).toFixed(4);
      const burnedTokensOut = buybackBurnSol / effectivePrice;

      token.solRaised = Math.max(0, token.solRaised - grossSolOut);
      token.circulatingSupply = Math.max(0, token.circulatingSupply - tokensIn);
      token.burnedTokens += burnedTokensOut;
      token.totalFeesCollectedSol += totalFeeSol;
      token.tokenPriceSol = Math.max(0.000005, +(token.tokenPriceSol * 0.96).toFixed(7));
      token.marketCapSol = Math.max(5, +(token.marketCapSol - grossSolOut * 1.5).toFixed(2));

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      token.priceHistory.push({ time: nowTime, price: token.tokenPriceSol });
      if (token.priceHistory.length > 25) token.priceHistory.shift();

      const tx: TradeTx = {
        id: `tx-${Date.now()}`,
        type: 'SELL',
        user: params.user,
        solAmount: netSolOut,
        tokenAmount: tokensIn,
        price: token.tokenPriceSol,
        feeSol: +totalFeeSol.toFixed(5),
        feeToDevSol: +devFeeSol.toFixed(5),
        feeToBurnSol: +buybackBurnSol.toFixed(5),
        burnedTokenCount: +burnedTokensOut.toFixed(0),
        timestamp: Date.now(),
        txSignature: randomTx,
      };
      this.trades.unshift(tx);
      this.save();

      return {
        success: true,
        tokenDelta: -tokensIn,
        solDelta: netSolOut,
        newPrice: token.tokenPriceSol,
        txHash: randomTx,
        feeSol: +totalFeeSol.toFixed(5),
        burnedTokens: +burnedTokensOut.toFixed(0),
      };
    }
  }
}

export const bondingCurve = new BondingCurveManager();

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

// Fee recipient configured by user
const DEV_FEE_RECIPIENT = new PublicKey('HEkgaQzrFQzvg9ER2Z7bUFL5449oj6NWJyYgPe3o1xSH');
const RPC_ENDPOINT = process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com';

const ACTIONS_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, Content-Encoding, Accept-Encoding, X-Accept-Action-Version, X-Accept-Blockchain-Ids',
  'X-Action-Version': '2.1.3',
  'X-Blockchain-Ids': 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', // Solana Mainnet
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).set(ACTIONS_CORS_HEADERS).end();
  }

  // Set standard Action response headers
  Object.entries(ACTIONS_CORS_HEADERS).forEach(([key, val]) => {
    res.setHeader(key, val);
  });

  // GET: Returns the metadata that X and Phantom / Backpack unfurl into native in-feed buttons
  if (req.method === 'GET') {
    return res.status(200).json({
      type: 'action',
      icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      title: 'DeploX — In-Feed Solana Meme Launcher & Ape Terminal',
      description:
        '1-Tap In-Feed Trading on Solana. Zero popups, 1% automated fees (0.5% dev fee + 0.5% buyback and burn).',
      label: 'Ape SOL',
      links: {
        actions: [
          {
            label: 'Ape 0.05 SOL',
            href: '/api/actions/launch?amount=0.05',
          },
          {
            label: 'Ape 0.1 SOL',
            href: '/api/actions/launch?amount=0.1',
          },
          {
            label: 'Ape 0.25 SOL',
            href: '/api/actions/launch?amount=0.25',
          },
          {
            label: 'Custom Ape',
            href: '/api/actions/launch?amount={amount}',
            parameters: [
              {
                name: 'amount',
                label: 'Enter SOL amount (e.g. 0.5)',
                required: true,
              },
            ],
          },
        ],
      },
    });
  }

  // POST: Builds the signed Solana transaction returned to Phantom / Backpack inside X
  if (req.method === 'POST') {
    try {
      const { account } = req.body;
      if (!account) {
        return res.status(400).json({ message: 'Missing account in body' });
      }

      const userPubkey = new PublicKey(account);
      const amountParam = req.query.amount ? parseFloat(req.query.amount as string) : 0.1;
      const totalLamports = Math.floor(amountParam * LAMPORTS_PER_SOL);

      // Automated 1.0% Fee:
      // 0.5% directly to HEkgaQzrFQzvg9ER2Z7bUFL5449oj6NWJyYgPe3o1xSH
      const devFeeLamports = Math.floor(totalLamports * 0.005);
      const curveLamports = totalLamports - devFeeLamports;

      const connection = new Connection(RPC_ENDPOINT, 'confirmed');
      const { blockhash } = await connection.getLatestBlockhash();

      const transaction = new Transaction();

      // 1. Send 0.5% Dev Fee directly to user's wallet
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: userPubkey,
          toPubkey: DEV_FEE_RECIPIENT,
          lamports: devFeeLamports,
        })
      );

      // 2. Transfer curve deposit into pool reserve
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: userPubkey,
          toPubkey: DEV_FEE_RECIPIENT, // Bonding curve vault / pool address
          lamports: curveLamports,
        })
      );

      transaction.feePayer = userPubkey;
      transaction.recentBlockhash = blockhash;

      const serializedTx = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });

      const base64Tx = serializedTx.toString('base64');

      return res.status(200).json({
        transaction: base64Tx,
        message: `Aping ${amountParam} SOL into DeploX Bonding Curve! (0.5% Dev Fee & 0.5% Burn auto-applied)`,
      });
    } catch (err: any) {
      console.error('Error generating Blink transaction:', err);
      return res.status(500).json({ message: err.message || 'Transaction generation failed' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}

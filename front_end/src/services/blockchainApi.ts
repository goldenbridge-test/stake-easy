// ─── Golden Earn — Blockchain API Service ────────────────────────────────────
// Consomme l'API Django /api/blockchain/*
// Les transactions on-chain restent via MetaMask (ethers.js)

import { getAccessToken, getRefreshToken, setTokens } from './api';

const API_BASE = import.meta.env.VITE_API_URL || 'https://golden-backend-pcc1.onrender.com';

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };
    const token = getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 401) {
        const refresh = getRefreshToken();
        if (refresh) {
            const refreshRes = await fetch(`${API_BASE}/api/accounts/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh }),
            });
            if (refreshRes.ok) {
                const data = await refreshRes.json();
                setTokens(data.access, refresh);
                headers['Authorization'] = `Bearer ${data.access}`;
                res = await fetch(`${API_BASE}${path}`, { ...options, headers });
            }
        }
    }
    return res;
}

// ─── Token Farms (produits Earn) ──────────────────────────────────────────────
export const tokenFarmsApi = {
    // GET /api/blockchain/token-farms/ — liste tous les farms (GLD Staking + futurs)
    async list() {
        const res = await apiFetch('/api/blockchain/token-farms/');
        if (!res.ok) throw new Error('Failed to fetch token farms');
        return res.json();
    },
    // GET /api/blockchain/token-farms/{id}/
    async get(id: string) {
        const res = await apiFetch(`/api/blockchain/token-farms/${id}/`);
        if (!res.ok) throw new Error('Failed to fetch token farm');
        return res.json();
    },
};

// ─── Staking Positions ────────────────────────────────────────────────────────
export const stakingApi = {
    // GET /api/blockchain/stake-tokens/ — mes positions stakées
    async myPositions() {
        const res = await apiFetch('/api/blockchain/stake-tokens/');
        if (!res.ok) throw new Error('Failed to fetch staking positions');
        return res.json();
    },
    // POST /api/blockchain/stake-tokens/stake/ — enregistrer un stake
    // token_id = ID du FundTokenAsset (pas GoldenToken)
    async recordStake(data: { token_id: number; amount: string; tx_hash: string }) {
        const res = await apiFetch('/api/blockchain/stake-tokens/stake/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to record stake');
        return res.json();
    },
    // POST /api/blockchain/unstake/
    async recordUnstake(data: { tx_hash: string; amount: string }) {
        const res = await apiFetch('/api/blockchain/unstake/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to record unstake');
        return res.json();
    },
};

// ─── Portfolio & Valuation ────────────────────────────────────────────────────
export const portfolioApi = {
    // GET /api/blockchain/user-total-value/ — valeur totale du portfolio
    async totalValue() {
        const res = await apiFetch('/api/blockchain/user-total-value/');
        if (!res.ok) throw new Error('Failed to fetch portfolio value');
        return res.json();
    },
    // GET /api/blockchain/staking-eth-value/ — valeur ETH du staking
    async stakingEthValue() {
        const res = await apiFetch('/api/blockchain/staking-eth-value/');
        if (!res.ok) throw new Error('Failed to fetch staking ETH value');
        return res.json();
    },
    // GET /api/blockchain/unique-token-staked-portfolio/ — portfolio unique par token
    async uniqueTokenPortfolio() {
        const res = await apiFetch('/api/blockchain/unique-token-staked-portfolio/');
        if (!res.ok) throw new Error('Failed to fetch token portfolio');
        return res.json();
    },
};

// ─── Rewards ──────────────────────────────────────────────────────────────────
export const rewardsApi = {
    // GET /api/blockchain/my-rewards/ — mes rewards
    async myRewards() {
        const res = await apiFetch('/api/blockchain/my-rewards/');
        if (!res.ok) throw new Error('Failed to fetch rewards');
        return res.json();
    },
    // GET /api/blockchain/my-reward-distributions/ — mes distributions
    async myDistributions() {
        const res = await apiFetch('/api/blockchain/my-reward-distributions/');
        if (!res.ok) throw new Error('Failed to fetch reward distributions');
        return res.json();
    },
};

// ─── Wallet ───────────────────────────────────────────────────────────────────
export const walletApi = {
    // GET /api/blockchain/wallets/ — mes wallets enregistrés
    async list() {
        const res = await apiFetch('/api/blockchain/wallets/');
        if (!res.ok) throw new Error('Failed to fetch wallets');
        return res.json();
    },
    // POST /api/blockchain/wallets/ — lier un wallet
    async register(data: { address: string; chain_id: string; network: string; asset: string }) {
        const res = await apiFetch('/api/blockchain/wallets/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to register wallet');
        return res.json();
    },
    // GET /api/blockchain/wallets/{id}/history/ — historique du wallet
    async history(walletId: string) {
        const res = await apiFetch(`/api/blockchain/wallets/${walletId}/history/`);
        if (!res.ok) throw new Error('Failed to fetch wallet history');
        return res.json();
    },
};

// ─── Transactions ─────────────────────────────────────────────────────────────
export const transactionsApi = {
    // GET /api/blockchain/transactions/
    async list() {
        const res = await apiFetch('/api/blockchain/transactions/');
        if (!res.ok) throw new Error('Failed to fetch transactions');
        return res.json();
    },
};

// ─── Events (Staking Events) ──────────────────────────────────────────────────
export const eventsApi = {
    // GET /api/blockchain/events/
    async list() {
        const res = await apiFetch('/api/blockchain/events/');
        if (!res.ok) throw new Error('Failed to fetch staking events');
        return res.json();
    },
};

// ─── Networks ─────────────────────────────────────────────────────────────────
export const networksApi = {
    // GET /api/blockchain/networks/
    async list() {
        const res = await apiFetch('/api/blockchain/networks/');
        if (!res.ok) throw new Error('Failed to fetch networks');
        return res.json();
    },
};

// ─── Fund Assets (futurs fonds d'investissement) ──────────────────────────────
export const fundAssetsApi = {
    // GET /api/blockchain/fund-assets/ — liste des assets de fonds
    async list() {
        const res = await apiFetch('/api/blockchain/fund-assets/');
        if (!res.ok) throw new Error('Failed to fetch fund assets');
        return res.json();
    },
    // GET /api/blockchain/fund-assets/{id}/
    async get(id: string) {
        const res = await apiFetch(`/api/blockchain/fund-assets/${id}/`);
        if (!res.ok) throw new Error('Failed to fetch fund asset');
        return res.json();
    },
};

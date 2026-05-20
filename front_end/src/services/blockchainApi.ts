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
    async recordStake(data: { token_address: string; token_symbol: string; chain_id: number; amount: string; tx_hash: string; duration_years: number }) {
        const res = await apiFetch('/api/blockchain/stake-tokens/stake/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            console.error('❌ recordStake 400 detail:', JSON.stringify(errBody));
            throw new Error(JSON.stringify(errBody));
        }
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
// ─── Token Prices ─────────────────────────────────────────────────────────────
export const tokenPricesApi = {
    async list() {
        const res = await apiFetch('/api/blockchain/token-prices/');
        if (!res.ok) throw new Error('Failed to fetch token prices');
        return res.json();
    },
};

// ─── Golden Tokens ────────────────────────────────────────────────────────────
export const goldenTokensApi = {
    async list() {
        const res = await apiFetch('/api/blockchain/golden-tokens/');
        if (!res.ok) throw new Error('Failed to fetch golden tokens');
        return res.json();
    },
};

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

// ─── Service Subscriptions ────────────────────────────────────────────────────
export type ServiceType = "advisory" | "copytrading" | "otc";
export type SubscriptionStatus = "active" | "paused" | "ended";

export interface ServiceSubscription {
    id: number;
    user: { id: number; username: string; email: string };
    service: ServiceType;
    investment_amount: string;
    contract_start: string;
    contract_duration_months: number;
    contract_end: string;
    expected_return_rate: string;
    status: SubscriptionStatus;
    notes: string;
    created_at: string;
}

export const serviceSubscriptionsApi = {
    async list(): Promise<ServiceSubscription[]> {
        const res = await apiFetch('/api/services/subscriptions/');
        if (!res.ok) throw new Error('Failed to fetch subscriptions');
        const data = await res.json();
        return Array.isArray(data) ? data : (data.results || []);
    },
    async mine(): Promise<ServiceSubscription[]> {
        const res = await apiFetch('/api/services/subscriptions/?mine=true');
        if (!res.ok) throw new Error('Failed to fetch subscriptions');
        const data = await res.json();
        return Array.isArray(data) ? data : (data.results || []);
    },
    async create(data: Omit<ServiceSubscription, 'id' | 'user' | 'contract_end' | 'created_at'> & { user_id: number }) {
        const res = await apiFetch('/api/services/subscriptions/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(JSON.stringify(err)); }
        return res.json();
    },
    async update(id: number, data: Partial<ServiceSubscription>) {
        const res = await apiFetch(`/api/services/subscriptions/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(JSON.stringify(err)); }
        return res.json();
    },
    async remove(id: number) {
        const res = await apiFetch(`/api/services/subscriptions/${id}/`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete subscription');
    },
};

// ─── Service Inquiries ────────────────────────────────────────────────────────
export type InquiryStatus = "new" | "contacted" | "demo_done" | "converted";

export interface ServiceInquiry {
    id: number;
    service: ServiceType;
    full_name: string;
    email: string;
    phone: string;
    profile_type?: string;
    message: string;
    extra_data?: Record<string, string>;
    status: InquiryStatus;
    admin_notes: string;
    created_at: string;
}

export const serviceInquiriesApi = {
    async create(data: Pick<ServiceInquiry, "service" | "full_name" | "email" | "phone" | "message"> & { profile_type?: string; extra_data?: Record<string, string> }) {
        const res = await fetch(`${API_BASE}/api/services/inquiries/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(JSON.stringify(err)); }
        return res.json();
    },
    async list(): Promise<ServiceInquiry[]> {
        const res = await apiFetch("/api/services/inquiries/");
        if (!res.ok) throw new Error("Failed to fetch inquiries");
        const data = await res.json();
        return Array.isArray(data) ? data : (data.results || []);
    },
    async update(id: number, data: Partial<Pick<ServiceInquiry, "status" | "admin_notes">>) {
        const res = await apiFetch(`/api/services/inquiries/${id}/`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update inquiry");
        return res.json();
    },
    async remove(id: number) {
        const res = await apiFetch(`/api/services/inquiries/${id}/`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete inquiry");
    },
};

// ─── Portfolio Monthly Reports ────────────────────────────────────────────────
export interface PortfolioReport {
    id: number;
    subscription: number;
    period_month: number;  // 1-12
    period_year: number;
    portfolio_value: string;
    return_pct: string;         // rendement du mois en %
    cumulative_return_pct?: string;
    notes: string;
    created_at: string;
}

export const portfolioReportsApi = {
    async list(subscriptionId: number): Promise<PortfolioReport[]> {
        const res = await apiFetch(`/api/services/subscriptions/${subscriptionId}/reports/`);
        if (!res.ok) throw new Error('Failed to fetch reports');
        const data = await res.json();
        return Array.isArray(data) ? data : (data.results || []);
    },
    async create(subscriptionId: number, data: Omit<PortfolioReport, 'id' | 'subscription' | 'created_at'>): Promise<PortfolioReport> {
        const res = await apiFetch(`/api/services/subscriptions/${subscriptionId}/reports/`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(JSON.stringify(err)); }
        return res.json();
    },
    async update(subscriptionId: number, reportId: number, data: Partial<PortfolioReport>): Promise<PortfolioReport> {
        const res = await apiFetch(`/api/services/subscriptions/${subscriptionId}/reports/${reportId}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update report');
        return res.json();
    },
    async remove(subscriptionId: number, reportId: number): Promise<void> {
        const res = await apiFetch(`/api/services/subscriptions/${subscriptionId}/reports/${reportId}/`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete report');
    },
};

// ─── Earn Access Requests ─────────────────────────────────────────────────────
export const earnAccessApi = {
    // POST /api/earn/access-request/ — soumettre une demande d'accès
    async request(data: {
        full_name: string;
        email: string;
        phone: string;
        country: string;
        reason: string;
        preferred_time: string;
    }) {
        const res = await apiFetch('/api/earn/access-request/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(JSON.stringify(err));
        }
        return res.json();
    },
    // GET /api/earn/access-request/ — liste des demandes (admin)
    async list() {
        const res = await apiFetch('/api/earn/access-request/');
        if (!res.ok) throw new Error('Failed to fetch access requests');
        return res.json();
    },
    // PATCH /api/earn/access-request/{id}/approve/ — approuver une demande (admin)
    async approve(id: number) {
        const res = await apiFetch(`/api/earn/access-request/${id}/approve/`, {
            method: 'PATCH',
        });
        if (!res.ok) throw new Error('Failed to approve request');
        return res.json();
    },
    // PATCH /api/earn/access-request/{id}/reject/ — rejeter une demande (admin)
    async reject(id: number) {
        const res = await apiFetch(`/api/earn/access-request/${id}/reject/`, {
            method: 'PATCH',
        });
        if (!res.ok) throw new Error('Failed to reject request');
        return res.json();
    },
};

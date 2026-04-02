import { useState } from "react";
import { tokenFarmsApi } from "../../services/blockchainApi";
import { getAccessToken } from "../../services/api";

const API_BASE = import.meta.env.VITE_API_URL || 'https://golden-backend-pcc1.onrender.com';

async function apiFetch(path: string) {
  const token = getAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { headers });
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text) }; }
  catch { return { status: res.status, data: text }; }
}

async function apiPost(path: string, body: any) {
  const token = getAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text) }; }
  catch { return { status: res.status, data: text }; }
}

const ApiDebug = () => {
  const [farmResult, setFarmResult] = useState<any>(null);
  const [tokensResult, setTokensResult] = useState<any>(null);
  const [stakeTestResult, setStakeTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runFarmTest = async () => {
    setLoading(true);
    try {
      const data = await tokenFarmsApi.list();
      const farms = data.results || data || [];
      const farm = farms[0];
      setFarmResult({
        farm_id: farm?.id,
        farm_name: farm?.name,
        token_raw: farm?.token,
        token_id: typeof farm?.token === "object" ? farm?.token?.id : farm?.token,
        token_type: typeof farm?.token,
        full_farm: farm,
      });
    } catch (e: any) {
      setFarmResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const runTokensTest = async () => {
    setLoading(true);
    // Essai plusieurs endpoints possibles pour lister les tokens
    const endpoints = [
      '/api/blockchain/tokens/',
      '/api/blockchain/golden-tokens/',
      '/api/blockchain/token-list/',
    ];
    const results: any = {};
    for (const ep of endpoints) {
      const r = await apiFetch(ep);
      results[ep] = r;
    }
    setTokensResult(results);
    setLoading(false);
  };

  const runStakeTest = async () => {
    if (!farmResult?.farm_id) {
      alert("Lance d'abord le test Farm");
      return;
    }
    setLoading(true);
    // Fetch allowed-tokens pour voir les IDs disponibles
    const allowedRes = await apiFetch('/api/blockchain/allowed-tokens/');
    const allowedTokens = (allowedRes.data as any)?.results || (allowedRes.data as any) || [];
    const firstAllowedId = allowedTokens?.[0]?.id;

    // Test 1 : token_id = PK du GoldenToken (integer 1)
    const r1 = await apiPost('/api/blockchain/stake-tokens/stake/', {
      token_farm: farmResult.farm_id,
      token_id: farmResult.token_id, // integer 1
      amount: "1",
      tx_hash: "0xTEST_HASH_INT_1",
    });
    // Test 2 : token_id = premier allowed-token ID (si existe)
    const r2 = firstAllowedId !== undefined
      ? await apiPost('/api/blockchain/stake-tokens/stake/', {
          token_farm: farmResult.farm_id,
          token_id: firstAllowedId,
          amount: "1",
          tx_hash: "0xTEST_HASH_ALLOWED",
        })
      : { status: 0, data: "no allowed token found" };

    setStakeTestResult({
      "allowed_tokens_endpoint": { status: allowedRes.status, data: allowedTokens },
      "with_golden_token_pk (1)": r1,
      "with_allowed_token_id": r2,
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-10 font-mono text-sm">
      <h1 className="text-2xl font-bold text-primary mb-6">API Debug</h1>

      <div className="flex flex-wrap gap-4 mb-8">
        <button onClick={runFarmTest} disabled={loading}
          className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-blue-900 transition disabled:opacity-50">
          1. Test Token Farm
        </button>
        <button onClick={runTokensTest} disabled={loading}
          className="bg-purple-700 text-white px-6 py-3 rounded-xl hover:bg-purple-900 transition disabled:opacity-50">
          2. Chercher endpoints Tokens
        </button>
        <button onClick={runStakeTest} disabled={loading || !farmResult}
          className="bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-800 transition disabled:opacity-50">
          3. Test recordStake (fake tx)
        </button>
      </div>

      {/* FARM RESULT */}
      {farmResult && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3 mb-6">
          <h2 className="font-bold text-lg text-primary mb-3">Token Farm</h2>
          {[
            { label: "farm_id", value: String(farmResult.farm_id ?? "null"), color: "text-primary" },
            { label: "farm_name", value: String(farmResult.farm_name ?? "null"), color: "text-primary" },
            { label: "token_raw", value: JSON.stringify(farmResult.token_raw), color: "text-orange-600" },
            { label: "token_id", value: String(farmResult.token_id ?? "null"), color: "text-green-600" },
            { label: "token_type", value: farmResult.token_type, color: "text-blue-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex gap-4">
              <span className="text-gray-400 w-32">{label}</span>
              <span className={`font-bold ${color}`}>{value}</span>
            </div>
          ))}
          {farmResult.error && <div className="text-red-500 font-bold">Erreur : {farmResult.error}</div>}
          <details className="mt-4">
            <summary className="cursor-pointer text-gray-400 hover:text-primary">Farm complet (JSON)</summary>
            <pre className="mt-2 bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs">
              {JSON.stringify(farmResult.full_farm, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* TOKENS RESULT */}
      {tokensResult && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-lg text-purple-700 mb-3">Recherche endpoints Tokens</h2>
          {Object.entries(tokensResult).map(([ep, res]: any) => (
            <div key={ep} className="mb-4">
              <div className="font-bold text-gray-700">{ep} → <span className={res.status < 400 ? "text-green-600" : "text-red-500"}>{res.status}</span></div>
              <pre className="mt-1 bg-gray-50 p-3 rounded-lg overflow-x-auto text-xs">
                {JSON.stringify(res.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* STAKE TEST RESULT */}
      {stakeTestResult && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-lg text-orange-600 mb-3">Test recordStake</h2>
          <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs">
            {JSON.stringify(stakeTestResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiDebug;

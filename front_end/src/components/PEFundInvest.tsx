import { useState, useEffect } from 'react';
import { Wallet, ArrowDown, ArrowUp, RefreshCw, Info, AlertCircle } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { usePEFund } from '../hooks/usePEFund';

type Tab = 'deposit' | 'withdraw';

const PEFundInvest = () => {
  const {
    account,
    loading,
    connectWallet,
    getShareBalance,
    getTotalAssets,
    depositToFund,
    withdrawFromFund,
    redeemShares,
    getPreviewDeposit,
    getPreviewRedeem,
  } = usePEFund();

  const [activeTab, setActiveTab] = useState<Tab>('deposit');
  const [amount, setAmount] = useState('');
  const [shareBalance, setShareBalance] = useState('0');
  const [totalAssets, setTotalAssets] = useState('0');
  const [preview, setPreview] = useState('0');
  const [refreshing, setRefreshing] = useState(false);

  // Load balances when wallet connects
  const loadData = async () => {
    if (!account) return;
    setRefreshing(true);
    try {
      const shares = await getShareBalance(account);
      const total = await getTotalAssets();
      setShareBalance(shares);
      setTotalAssets(total);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (account) loadData();
  }, [account]);

  // Live preview when amount changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!amount || parseFloat(amount) <= 0) {
        setPreview('0');
        return;
      }
      if (activeTab === 'deposit') {
        const result = await getPreviewDeposit(amount);
        setPreview(result);
      } else {
        const result = await getPreviewRedeem(amount);
        setPreview(result);
      }
    }, 500); // debounce 500ms

    return () => clearTimeout(timer);
  }, [amount, activeTab]);

  // Reset amount when switching tabs
  useEffect(() => {
    setAmount('');
    setPreview('0');
  }, [activeTab]);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    await depositToFund(amount);
    setAmount('');
    await loadData();
  };

  const handleRedeem = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    await redeemShares(amount);
    setAmount('');
    await loadData();
  };

  const formatNumber = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  };

  return (
    <div className="bg-white min-h-screen font-body text-dark">
      <Navbar />

      <main className="pt-28 pb-16 px-6">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-3">
              Golden PE Fund
            </h1>
            <p className="text-gray-500 text-lg">
              Investissez dans un fonds de private equity tokenisé
            </p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-5 text-center">
              <p className="text-sm text-gray-500 mb-1">Valeur totale du fonds</p>
              <p className="text-2xl font-heading font-bold text-primary">
                {formatNumber(totalAssets)} <span className="text-sm font-normal">USDC</span>
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-5 text-center">
              <p className="text-sm text-gray-500 mb-1">Mes parts (GPEF)</p>
              <p className="text-2xl font-heading font-bold text-primary">
                {formatNumber(shareBalance)}
              </p>
            </div>
          </div>

          {/* Refresh button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={loadData}
              disabled={refreshing || !account}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {/* Main card */}
          {!account ? (
            // Not connected
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
              <Wallet className="w-12 h-12 text-gold mx-auto mb-4" />
              <h2 className="text-xl font-heading font-bold text-primary mb-2">
                Connectez votre wallet
              </h2>
              <p className="text-gray-500 mb-6">
                Connectez MetaMask pour accéder au fonds d'investissement
              </p>
              <button
                onClick={connectWallet}
                className="bg-primary hover:bg-blue-900 text-white px-8 py-3 rounded-lg font-heading font-bold transition shadow-lg"
              >
                Connecter MetaMask
              </button>
            </div>
          ) : (
            // Connected — deposit/withdraw interface
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab('deposit')}
                  className={`flex-1 py-4 text-center font-heading font-bold transition flex items-center justify-center gap-2
                    ${activeTab === 'deposit'
                      ? 'text-primary border-b-2 border-primary bg-blue-50/50'
                      : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  <ArrowDown className="w-4 h-4" />
                  Déposer
                </button>
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className={`flex-1 py-4 text-center font-heading font-bold transition flex items-center justify-center gap-2
                    ${activeTab === 'withdraw'
                      ? 'text-primary border-b-2 border-primary bg-blue-50/50'
                      : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  <ArrowUp className="w-4 h-4" />
                  Retirer
                </button>
              </div>

              {/* Form body */}
              <div className="p-6 space-y-6">

                {/* Amount input */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    {activeTab === 'deposit' ? 'Montant à déposer (USDC)' : 'Nombre de parts à retirer (GPEF)'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="any"
                      className="w-full border border-gray-200 rounded-xl px-4 py-4 text-lg font-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                      {activeTab === 'deposit' ? 'USDC' : 'GPEF'}
                    </span>
                  </div>
                </div>

                {/* Preview */}
                {amount && parseFloat(amount) > 0 && (
                  <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">
                        {activeTab === 'deposit'
                          ? `Vous recevrez environ ${formatNumber(preview)} parts GPEF`
                          : `Vous récupérerez environ ${formatNumber(preview)} USDC`
                        }
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Estimation avant frais — le montant exact peut varier légèrement
                      </p>
                    </div>
                  </div>
                )}

                {/* Info notice */}
                {activeTab === 'deposit' && (
                  <div className="flex items-start gap-3 text-sm text-gray-400">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Le dépôt nécessite deux confirmations MetaMask : 
                      une autorisation puis le dépôt lui-même.
                    </p>
                  </div>
                )}

                {/* Action button */}
                <button
                  onClick={activeTab === 'deposit' ? handleDeposit : handleRedeem}
                  disabled={loading || !amount || parseFloat(amount) <= 0}
                  className="w-full bg-primary hover:bg-blue-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-heading font-bold text-lg transition shadow-lg"
                >
                  {loading
                    ? 'Transaction en cours...'
                    : activeTab === 'deposit'
                      ? 'Déposer'
                      : 'Retirer mes parts'
                  }
                </button>

                {/* Connected address */}
                <p className="text-center text-xs text-gray-400">
                  Connecté : {account.slice(0, 6)}...{account.slice(-4)}
                </p>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PEFundInvest;

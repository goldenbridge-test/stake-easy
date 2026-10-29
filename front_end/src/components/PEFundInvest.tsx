import { AlertCircle, ArrowDown, ArrowUp, Info, RefreshCw, Wallet } from 'lucide-react';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { PEFUND_ADDRESS } from '../constants/pefund';
import { UserLimits, grossWithExitFee, liquidityErrorMessage, usePEFund, validateAmount } from '../hooks/usePEFund';
import Footer from './Footer';
import Navbar from './Navbar';

type Tab = 'deposit' | 'withdraw';
type WithdrawMode = 'amount' | 'shares';

const PEFundInvest = () => {
  const {
    account,
    loading,
    connectWallet,
    getShareBalance,
    getShareValue,
    getTotalAssets,
    getAssetBalance,
    getFundInfo,
    getAssetSymbol,
    depositToFund,
    withdrawFromFund,
    redeemShares,
    getPreviewDeposit,
    getPreviewWithdraw,
    getPreviewRedeem,
    getMaxWithdrawable,
    getTokenDecimals,
    getUserLimits,
  } = usePEFund();

  const [activeTab, setActiveTab] = useState<Tab>('deposit');
  const [withdrawMode, setWithdrawMode] = useState<WithdrawMode>('amount');
  const [amount, setAmount] = useState('');
  const [shareBalance, setShareBalance] = useState('0');
  // null = not loaded yet or failed read, so no fake "0,00 USDC" is shown
  const [shareValue, setShareValue] = useState<{ value: string; pricePerShare: string } | null>(null);
  const [totalAssets, setTotalAssets] = useState('0');
  const [assetBalance, setAssetBalance] = useState('0');
  // null = nothing to preview (empty/invalid input or failed read)
  const [preview, setPreview] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [fundInfo, setFundInfo] = useState<any>(null);
  const [assetSymbol, setAssetSymbol] = useState('');
  const [tokenDecimals, setTokenDecimals] = useState<{ asset: number; shares: number } | null>(null);
  const [limits, setLimits] = useState<UserLimits | null>(null);

  // Load balances when wallet connects
  const loadData = async () => {
    if (!account) return;
    setRefreshing(true);
    try {
      const shares = await getShareBalance(account);
      const value = await getShareValue(account);
      const total = await getTotalAssets();
      const balance = await getAssetBalance(account);
      const info = await getFundInfo();
      const symbol = await getAssetSymbol();
      const decimals = await getTokenDecimals();
      const userLimits = await getUserLimits(account);
      setShareBalance(shares);
      setShareValue(value);
      setTotalAssets(total);
      setAssetBalance(balance);
      setFundInfo(info);
      setAssetSymbol(symbol);
      setTokenDecimals(decimals);
      setLimits(userLimits);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  useEffect(() => {
    if (account) loadData();
  }, [account]);

  // Input is stablecoin in deposit and withdraw-by-amount, GPEF shares in withdraw-by-shares
  const inputDecimals = tokenDecimals
    ? (activeTab === 'deposit' || withdrawMode === 'amount' ? tokenDecimals.asset : tokenDecimals.shares)
    : null;
  // Inline error for the current input (skipped until the real decimals are loaded)
  const validation = amount && inputDecimals !== null ? validateAmount(amount, inputDecimals) : null;
  const validationError = validation && !validation.ok ? validation.error : null;

  // Inline limit check, in base units (BigNumber) against limits loaded in loadData.
  // The hook re-checks at click time with fresh on-chain values as a second line of defence.
  const getLimitError = (): string | null => {
    if (!validation || !validation.ok || !limits) return null;
    const value = validation.value;
    const formatAsset = (raw: ethers.BigNumber) =>
      `${ethers.utils.formatUnits(raw, limits.assetDecimals)} ${limits.symbol}`;

    if (activeTab === 'deposit') {
      if (limits.isPaused) return 'Le fonds est actuellement en pause : les dépôts sont temporairement suspendus.';
      if (value.gt(limits.assetBalance)) return `Solde ${limits.symbol} insuffisant : ${formatAsset(limits.assetBalance)}`;
      if (value.gt(limits.maxDeposit)) return `Limite de dépôt dépassée : ${formatAsset(limits.maxDeposit)}`;
      return null;
    }
    if (withdrawMode === 'amount') {
      if (value.gt(limits.maxWithdrawAssets)) {
        return `Montant supérieur à votre maximum retirable (${formatAsset(limits.maxWithdrawAssets)})`;
      }
      const gross = grossWithExitFee(value, limits.exitFeeBp);
      if (gross.gt(limits.vaultLiquidity)) {
        return liquidityErrorMessage(limits.vaultLiquidity, gross, limits.assetDecimals, limits.symbol);
      }
      return null;
    }
    // Shares mode: the liquidity need depends on previewRedeem(shares), a contract call,
    // so it is only checked at click time by the hook
    if (value.gt(limits.shareBalance)) {
      return `Vous ne possédez que ${ethers.utils.formatUnits(limits.shareBalance, limits.shareDecimals)} parts GPEF`;
    }
    return null;
  };
  const inputError = validationError ?? getLimitError();

  // Display only: the hook re-reads the allowance at click time before deciding to skip approve
  const allowanceCoversDeposit =
    activeTab === 'deposit' && !!validation && validation.ok && !!limits?.allowance && limits.allowance.gte(validation.value);

  // Live preview when amount changes
  useEffect(() => {
    // Ignore results from a previous input that arrive after the user typed something else
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (!amount || parseFloat(amount) <= 0 || inputError) {
        setPreview(null);
        return;
      }
      let result: string | null;
      if (activeTab === 'deposit') {
        result = await getPreviewDeposit(amount);
      } else if (withdrawMode === 'amount') {
        result = await getPreviewWithdraw(amount);
      } else {
        result = await getPreviewRedeem(amount);
      }
      if (!cancelled) setPreview(result);
    }, 500); // debounce 500ms

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [amount, activeTab, withdrawMode, inputError]);

  // Reset amount when switching tabs or withdraw mode (the input unit changes)
  useEffect(() => {
    setAmount('');
    setPreview(null);
  }, [activeTab, withdrawMode]);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    const success = await depositToFund(amount);
    // Refresh even on failure: the click-time guard may have seen newer on-chain values
    if (success) setAmount('');
    await loadData();
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    const success = withdrawMode === 'amount'
      ? await withdrawFromFund(amount)
      : await redeemShares(amount);
    if (success) setAmount('');
    await loadData();
  };

  // Fill the input with the real maximum: net of exit fee in amount mode, full share balance in shares mode
  const handleMax = async () => {
    if (!account) return;
    const max = await getMaxWithdrawable(account);
    if (!max) {
      alert('Impossible de calculer le montant maximum (voir la console).');
      return;
    }
    setAmount(withdrawMode === 'amount' ? max.assets : max.shares);
  };

  const inputUnit = activeTab === 'deposit' || withdrawMode === 'amount' ? assetSymbol : 'GPEF';

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
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-5 text-center">
              <p className="text-sm text-gray-500 mb-1">Valeur totale du fonds</p>
              <p className="text-2xl font-heading font-bold text-primary">
                {formatNumber(totalAssets)} <span className="text-sm font-normal">{assetSymbol}</span>
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-5 text-center">
              <p className="text-sm text-gray-500 mb-1">Mes parts (GPEF)</p>
              <p className="text-2xl font-heading font-bold text-primary">
                {formatNumber(shareBalance)}
              </p>
              {shareValue && (
                <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                  <p>Valeur : {formatNumber(shareValue.value)} {assetSymbol}</p>
                  <p>Prix d'une part : {formatNumber(shareValue.pricePerShare)} {assetSymbol}</p>
                  <p className="text-gray-400">avant frais de sortie</p>
                </div>
              )}
            </div>
            <div className="bg-blue-50 rounded-xl p-5 text-center">
              <p className="text-sm text-gray-500 mb-1">Mon solde disponible</p>
              <p className="text-2xl font-heading font-bold text-primary">
                {formatNumber(assetBalance)} <span className="text-sm font-normal">{assetSymbol}</span>
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

          {/* Fund info */}
          {fundInfo && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
              <h3 className="font-heading font-bold text-primary mb-4">Informations du fonds</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Nom du token</p>
                  <p className="font-medium text-dark">{fundInfo.name} ({fundInfo.symbol})</p>
                </div>
                <div>
                  <p className="text-gray-400">Frais d'entrée</p>
                  <p className="font-medium text-dark">{fundInfo.entryFee}%</p>
                </div>
                <div>
                  <p className="text-gray-400">Frais de sortie</p>
                  <p className="font-medium text-dark">{fundInfo.exitFee}%</p>
                </div>
                <div>
                  <p className="text-gray-400">Frais de performance</p>
                  <p className="font-medium text-dark">{fundInfo.performanceFee}%</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Adresse du contrat</p>
                  
                  <a
                    href={`https://sepolia.etherscan.io/address/${PEFUND_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-primary hover:underline"
                  >
                    {PEFUND_ADDRESS}
                  </a>
                </div>
                <div>
                  <p className="text-gray-400">Limite de dépôt max</p>
                  <p className="font-medium text-dark">{parseFloat(fundInfo.maxDeposit).toLocaleString('fr-FR')} {assetSymbol}</p>
                </div>
              </div>
              {/* Address read from fundManager() in getFundInfo, never hardcoded */}
              {fundInfo.fundManager && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-sm">
                  <p className="text-gray-400">Gestionnaire du fonds</p>
                  <a
                    href={`https://sepolia.etherscan.io/address/${fundInfo.fundManager}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={fundInfo.fundManager}
                    className="font-mono text-xs text-primary hover:underline"
                  >
                    {fundInfo.fundManager.slice(0, 6)}...{fundInfo.fundManager.slice(-4)}
                  </a>
                  <p className="text-xs text-gray-500 mt-1">
                    Les frais d'entrée et de sortie sont versés au gestionnaire du fonds.
                  </p>
                </div>
              )}
            </div>
          )}

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

                {/* Withdraw mode selector */}
                {activeTab === 'withdraw' && (
                  <div className="flex bg-gray-100 rounded-xl p-1">
                    {([
                      ['amount', `Par montant (${assetSymbol})`],
                      ['shares', 'Par parts (GPEF)'],
                    ] as [WithdrawMode, string][]).map(([mode, label]) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setWithdrawMode(mode)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition
                          ${withdrawMode === mode ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Amount input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-600">
                      {activeTab === 'deposit'
                        ? `Montant à déposer (${assetSymbol})`
                        : withdrawMode === 'amount'
                          ? `Montant à récupérer (${assetSymbol})`
                          : 'Nombre de parts à retirer (GPEF)'}
                    </label>
                    {activeTab === 'withdraw' && (
                      <button
                        type="button"
                        onClick={handleMax}
                        disabled={loading}
                        className="text-xs font-bold text-primary hover:underline disabled:opacity-50"
                      >
                        Max
                      </button>
                    )}
                  </div>
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
                      {inputUnit}
                    </span>
                  </div>
                </div>

                {/* Invalid input: clear message instead of a preview */}
                {inputError && (
                  <div className="bg-red-50 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-600">{inputError}</p>
                  </div>
                )}

                {/* Preview */}
                {!inputError && preview !== null && amount && parseFloat(amount) > 0 && (
                  <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">
                        {activeTab === 'deposit'
                          ? `Vous recevrez environ ${formatNumber(preview)} parts GPEF`
                          : withdrawMode === 'amount'
                            ? `Environ ${formatNumber(preview)} parts GPEF seront brûlées (frais de sortie inclus)`
                            : `Vous récupérerez environ ${formatNumber(preview)} ${assetSymbol}`
                        }
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Estimation nette des frais d'entrée/sortie — le montant exact peut varier légèrement
                      </p>
                    </div>
                  </div>
                )}

                {/* Info notice */}
                {activeTab === 'deposit' && (
                  <div className="flex items-start gap-3 text-sm text-gray-400">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>
                      {allowanceCoversDeposit
                        ? 'Votre autorisation couvre déjà ce montant : une seule confirmation MetaMask (le dépôt).'
                        : 'Le dépôt nécessite deux confirmations MetaMask : une autorisation puis le dépôt lui-même.'}
                    </p>
                  </div>
                )}

                {/* Action button */}
                <button
                  onClick={activeTab === 'deposit' ? handleDeposit : handleWithdraw}
                  disabled={loading || !amount || parseFloat(amount) <= 0 || !!inputError}
                  className="w-full bg-primary hover:bg-blue-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-heading font-bold text-lg transition shadow-lg"
                >
                  {loading
                    ? 'Transaction en cours...'
                    : activeTab === 'deposit'
                      ? 'Déposer'
                      : withdrawMode === 'amount'
                        ? 'Retirer ce montant'
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

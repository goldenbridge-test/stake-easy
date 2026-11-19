import 'package:flutter_test/flutter_test.dart';
import 'package:goldenapp/core/models/json_utils.dart';
import 'package:goldenapp/core/models/models.dart';

void main() {
  test('User depuis /accounts/me/ et UserSerializer', () {
    final me = User.fromJson({
      'id': 3,
      'username': 'alice',
      'email': 'a@b.fr',
      'is_staff': true,
    });
    expect(me.id, 3);
    expect(me.isStaff, isTrue);
    expect(me.displayName, 'alice');

    final full = User.fromJson({
      'id': 3,
      'username': 'alice',
      'email': 'a@b.fr',
      'first_name': 'Alice',
      'last_name': 'Martin',
    });
    expect(full.displayName, 'Alice Martin');
    expect(full.initials, 'AM');
  });

  test('Position : décimaux en chaîne et champs calculés numériques', () {
    final p = Position.fromJson({
      'id': 12,
      'strategy_config': 4,
      'symbol': 'BTC/USDT',
      'exchange': 'binance',
      'mode': 'test',
      'entry_zone': 87,
      'entry_price': '61250.5000000000',
      'total_amount_base': '0.0163000000',
      'total_quote_spent': '998.3800000000',
      'buy_count': 2,
      'high_water_mark': '64000.0000000000',
      'is_sealed': false,
      'is_fully_closed': false,
      'first_buy_at': '2024-03-10T08:00:00Z',
      'created_at': '2024-03-10T08:00:01.123456Z',
      'updated_at': '2024-04-01T12:00:00Z',
      'entry_zone_range': {
        'low': '60800.0000000000',
        'high': '61700.0000000000',
      },
      'remaining_base': '0.0163000000',
      'current_price': 67000.0,
      'market_value': 1092.1,
      'realized_pnl': 0,
      'unrealized_pnl': 93.72,
      'total_pnl': 93.72,
      'pnl_pct': 9.387,
      'status': 'open',
    });
    expect(p.entryPrice, 61250.5);
    expect(p.totalQuoteSpent, closeTo(998.38, 1e-9));
    expect(p.entryZoneRange!.low, 60800);
    expect(p.entryZoneRange!.high, 61700);
    expect(p.currentPrice, 67000);
    expect(p.realizedPnl, 0);
    expect(p.status, PositionStatus.open);
    expect(p.baseAsset, 'BTC');
    expect(p.quoteAsset, 'USDT');
    expect(p.openedAt!.toUtc(), DateTime.utc(2024, 3, 10, 8));
    expect(p.isProfitable, isTrue);
  });

  test('Position fermée sans zone', () {
    final p = Position.fromJson({
      'id': 1,
      'strategy_config': 1,
      'symbol': 'ETH/USDT',
      'entry_price': '2000',
      'entry_zone_range': null,
      'first_buy_at': null,
      'status': 'closed',
    });
    expect(p.entryZoneRange, isNull);
    expect(p.status, PositionStatus.closed);
    expect(p.isOpen, isFalse);
  });

  test('Trade', () {
    final t = Trade.fromJson({
      'id': 99,
      'strategy_config': 4,
      'position': 12,
      'zone': null,
      'mode': 'live',
      'side': 'sell',
      'executed_at': '2024-04-02T10:15:00Z',
      'price': '66000.0000000000',
      'amount_quote': '330.0000000000',
      'amount_base': '0.0050000000',
      'exchange_order_id': null,
      'zone_range': null,
    });
    expect(t.isSell, isTrue);
    expect(t.sideLabel, 'Vente');
    expect(t.zone, isNull);
    expect(t.amountBase, 0.005);
  });

  test('Performance', () {
    final perf = Performance.fromJson({
      'strategy_config': null,
      'total_invested': 5000.0,
      'total_recovered_from_sells': 1200.5,
      'realized_pnl': 150.25,
      'realized_pnl_pct': 3.005,
      'total_buys': 14,
      'total_sells': 3,
      'open_positions': 4,
      'closed_positions': 2,
      'sealed_positions': 1,
      'win_rate_pct': 100.0,
      'max_drawdown_pct': 12.4,
      'sharpe_ratio': 1.37,
      'risk_free_rate': 0.04,
    });
    expect(perf.strategyConfig, isNull);
    expect(perf.totalTrades, 17);
    expect(perf.sharpeRatio, 1.37);
    expect(perf.riskFreeRate, 0.04);
  });

  test('ChartData : bougies et zones', () {
    final chart = ChartData.fromJson({
      'symbol': 'BTC/USDT',
      'candles': [
        {
          'date': '2024-01-01',
          'open': 42000.0,
          'high': 42800.0,
          'low': 41500.0,
          'close': 42500.0,
        },
        {
          'date': '2024-01-02',
          'open': 42500.0,
          'high': 45900.0,
          'low': 42400.0,
          'close': 45500.0,
        },
      ],
      'zones': [
        {
          'id': 5,
          'price_low': 40100.0,
          'price_high': 40900.0,
          'first_seen': '2023-10-01',
          'last_touched': null,
          'touch_count': 3,
          'is_active': true,
          'is_validated': false,
          'zone_type': 'support',
        },
      ],
      'candles_count': 2,
      'zones_count': 1,
    });
    expect(chart.candles, hasLength(2));
    expect(chart.candles.first.date, DateTime(2024, 1, 1));
    expect(chart.lastCandle!.close, 45500);
    expect(chart.changePct, closeTo(7.0588, 1e-3));
    expect(chart.zones.single.lastTouched, isNull);
    expect(chart.activeZones, hasLength(1));
  });

  test('Backtest en attente puis terminé', () {
    final pending = Backtest.fromJson({
      'id': 8,
      'exchange': 'binance',
      'symbol': 'SOL/USDT',
      'capital': '1000.0000000000',
      'start_date': '2021-01-01',
      'discount_pct': '75.00',
      'status': 'pending',
      'results': null,
      'error': '',
      'created_at': '2024-05-01T09:00:00Z',
      'completed_at': null,
    });
    expect(pending.isPending, isTrue);
    expect(pending.results, isNull);
    expect(pending.capital, 1000);
    expect(pending.discountPct, 75);

    final done = Backtest.fromJson({
      'id': 8,
      'symbol': 'SOL/USDT',
      'capital': '1000.0000000000',
      'status': 'completed',
      'results': {
        'symbol': 'SOL/USDT',
        'capital': 1000.0,
        'candles_analyzed': 1200,
        'total_buys': 20,
        'total_sells': 6,
        'realized_pnl': 120.5,
        'total_pnl': 340.2,
        'total_pnl_pct': 34.02,
        'win_rate_pct': 83.3,
        'win_rate_sample_size': 6,
        'max_drawdown_pct': 18.2,
        'sharpe_ratio': 1.1,
        'equity_curve': [1000.0, 1010.5, 1340.2],
        'equity_dates': ['2021-01-01', '2021-01-02', '2024-05-01'],
        'cagr': {
          'performance_totale_pct': 34.02,
          'moyenne_annualisee_pct': 10.6,
          'cagr_pct': 9.6,
        },
        'nb_years': 3.33,
        'final_capital': 1340.2,
      },
    });
    expect(done.isCompleted, isTrue);
    expect(done.statusLabel, 'Terminé');
    expect(done.results!.equityCurve, [1000.0, 1010.5, 1340.2]);
    expect(done.results!.cagr.cagrPct, 9.6);
    expect(done.results!.finalCapital, 1340.2);
  });

  test('Backtest.createJson respecte le serializer', () {
    expect(
      Backtest.createJson(
        symbol: 'BTC/USDT',
        capital: 1500,
        startDate: DateTime(2022, 3, 7),
      ),
      {
        'exchange': 'binance',
        'symbol': 'BTC/USDT',
        'capital': '1500.0',
        'start_date': '2022-03-07',
      },
    );
  });

  test('PortfolioSimulation GET et POST', () {
    final sim = PortfolioSimulation.fromJson({
      'status': 'running',
      'progress': '1/2',
      'portfolio_summary': {
        'total_assets': 1,
        'total_capital': 2000.0,
        'final_capital': 2150.0,
        'nb_years': 2.5,
        'total_pnl': 150.0,
        'total_pnl_pct': 7.5,
        'total_realized_pnl': 100.0,
        'total_realized_pct': 5.0,
        'total_unrealized_pnl': 50.0,
        'total_unrealized_pct': 2.5,
        'sharpe_ratio': 0.9,
        'max_drawdown_pct': 11.0,
        'cagr': {
          'performance_totale_pct': 7.5,
          'moyenne_annualisee_pct': 3.0,
          'cagr_pct': 2.9,
        },
        'risk_free_rate': 0.04,
        'best_performer': 'BTC/USDT',
        'worst_performer': 'BTC/USDT',
      },
      'rankings': [
        {
          'id': 21,
          'symbol': 'BTC/USDT',
          'status': 'completed',
          'capital_allocated': 1000.0,
          'total_pnl': 150.0,
          'cagr': {},
        },
        {
          'id': 22,
          'symbol': 'ETH/USDT',
          'status': 'running',
          'capital_allocated': 1000.0,
          'total_pnl': 0,
          'cagr': {},
        },
      ],
    });
    expect(sim.isCompleted, isFalse);
    expect(sim.progressRatio, 0.5);
    expect(sim.summary.bestPerformer, 'BTC/USDT');
    expect(sim.summary.cagr.cagrPct, 2.9);
    expect(sim.rankings, hasLength(2));
    expect(sim.rankings.last.isCompleted, isFalse);

    final launch = PortfolioSimulationLaunch.fromJson({
      'batch_ids': [21, 22],
      'symbols': ['BTC/USDT', 'ETH/USDT'],
      'capital_per_asset': 1000.0,
      'total_capital': 2000.0,
      'status': 'running',
    });
    expect(launch.batchIds, [21, 22]);
    expect(launch.capitalPerAsset, 1000);
  });

  test('ExchangeConnection : secrets jamais lus, input complet', () {
    final c = ExchangeConnection.fromJson({
      'id': 2,
      'exchange': 'okx',
      'label': 'Principal',
      'api_key_masked': 'abcd...wxyz',
    });
    expect(c.displayName, 'OKX (Principal)');
    expect(c.apiKeyMasked, 'abcd...wxyz');

    const input = ExchangeConnectionInput(
      exchange: 'okx',
      apiKey: 'k',
      apiSecret: 's',
      apiPassphrase: 'p',
    );
    expect(input.requiresPassphrase, isTrue);
    expect(input.toJson(), {
      'exchange': 'okx',
      'label': '',
      'api_key': 'k',
      'api_secret': 's',
      'api_passphrase': 'p',
    });

    final test = ConnectionTestResult.fromJson({
      'status': 'ok',
      'balances': {'USDT': 125.5, 'BTC': '0.01'},
    });
    expect(test.isOk, isTrue);
    expect(test.balances['BTC'], 0.01);
  });

  test('Asset', () {
    final a = Asset.fromJson({
      'symbol': 'ETH/USDT',
      'base': 'ETH',
      'quote': 'USDT',
      'timeframe': '1d',
      'first_candle': '2019-01-01',
      'last_candle': '2024-05-01',
      'candle_count': 1948,
      'history_days': 1947,
      'has_sufficient_history': true,
    });
    expect(a.base, 'ETH');
    expect(a.hasSufficientHistory, isTrue);
    expect(a.firstCandle, DateTime(2019, 1, 1));
  });

  test('StrategyConfig', () {
    final s = StrategyConfig.fromJson({
      'id': 4,
      'exchange': 'binance',
      'symbol': 'BTC/USDT',
      'mode': 'live',
      'balance_quote': '5000.0000000000',
      'discount_pct': '75.00',
      'is_active': true,
      'exchange_connection': 2,
      'symbol_base': 'BTC',
      'is_running': true,
      'position_count': 3,
    });
    expect(s.balanceQuote, 5000);
    expect(s.modeLabel, 'Réel');
    expect(s.toJson(), {
      'exchange': 'binance',
      'symbol': 'BTC/USDT',
      'mode': 'live',
      'balance_quote': '5000.0',
      'discount_pct': '75.0',
      'is_active': true,
      'exchange_connection': 2,
    });
  });

  test('Course', () {
    final c = Course.fromJson({
      'id': 1,
      'title': 'Les bases du staking',
      'description': 'Comprendre le staking.',
      'instructor': 2,
      'price': '0.00',
      'created_at': '2024-01-01T00:00:00Z',
      'updated_at': '2024-01-02T00:00:00Z',
    });
    expect(c.isFree, isTrue);
    expect(c.instructor, 2);
  });

  test('Listes paginées ou non', () {
    expect(
      toList([
        {'id': 1},
      ], Course.fromJson),
      hasLength(1),
    );
    expect(
      toList({
        'count': 1,
        'results': [
          {'id': 1},
        ],
      }, Course.fromJson),
      hasLength(1),
    );
    expect(toList(null, Course.fromJson), isEmpty);
  });
}

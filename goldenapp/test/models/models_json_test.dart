import 'package:flutter_test/flutter_test.dart';
import 'package:goldenapp/features/backtest/models/backtest.dart';
import 'package:goldenapp/features/dashboard/models/performance.dart';
import 'package:goldenapp/features/exchanges/models/exchange_connection.dart';
import 'package:goldenapp/features/portfolio/models/position.dart';
import 'package:goldenapp/features/profile/models/user_profile.dart';

void main() {
  test('Position.fromJson lit les champs de PositionSerializer', () {
    final p = Position.fromJson({
      'id': 12,
      'strategy_config': 3,
      'symbol': 'BTC/USDT',
      'exchange': 'binance',
      'mode': 'test',
      'entry_zone': 41,
      'entry_price': '61250.0000000000',
      'total_amount_base': '0.0326000000',
      'total_quote_spent': '1996.7500000000',
      'buy_count': 3,
      'high_water_mark': '68420.0000000000',
      'is_sealed': false,
      'is_fully_closed': false,
      'first_buy_at': '2026-09-14T09:30:00Z',
      'created_at': '2026-09-14T09:30:00Z',
      'updated_at': '2026-11-18T09:30:00Z',
      'entry_zone_range': {'low': '60400', 'high': '62100'},
      'remaining_base': '0.0326',
      'current_price': '67180',
      'market_value': '2190.07',
      'realized_pnl': '0',
      'unrealized_pnl': '193.32',
      'total_pnl': '193.32',
      'pnl_pct': 9.68,
      'status': 'sealed',
    });
    expect(p.entryPrice, 61250);
    expect(p.entryZoneRange!.high, 62100);
    expect(p.status, PositionStatus.sealed);
    expect(p.baseAsset, 'BTC');
  });

  test('Performance.fromJson lit la réponse de PerformanceView', () {
    final perf = Performance.fromJson({
      'strategy_config': null,
      'total_invested': 5338.55,
      'total_recovered_from_sells': 2103.9,
      'realized_pnl': 263.9,
      'realized_pnl_pct': 4.94,
      'total_buys': 8,
      'total_sells': 2,
      'open_positions': 3,
      'closed_positions': 1,
      'sealed_positions': 1,
      'win_rate_pct': 100.0,
      'max_drawdown_pct': 12.37,
      'sharpe_ratio': 1.42,
      'risk_free_rate': 0.04,
    });
    expect(perf.strategyConfig, isNull);
    expect(perf.sharpeRatio, 1.42);
  });

  test('BacktestRequest.fromJson lit results et cagr', () {
    final bt = BacktestRequest.fromJson({
      'id': 31,
      'exchange': 'binance',
      'symbol': 'ETH/USDT',
      'capital': '5000.0000000000',
      'start_date': '2022-01-01',
      'discount_pct': '75.00',
      'status': 'completed',
      'results': {
        'total_pnl': 4250.0,
        'equity_curve': [5000, 5200.5, 9250],
        'equity_dates': ['2022-01-01', '2023-01-01', '2026-11-01'],
        'cagr': {'performance_totale_pct': 85, 'moyenne_annualisee_pct': 17.6, 'cagr_pct': 13.6},
        'final_capital': 9250,
      },
      'error': '',
      'created_at': '2026-11-12T10:04:00Z',
      'completed_at': null,
    });
    expect(bt.status, BacktestStatus.completed);
    expect(bt.capital, 5000);
    expect(bt.results!.equityCurve, [5000, 5200.5, 9250]);
    expect(bt.results!.cagr.cagrPct, 13.6);
  });

  test('BacktestDraft.toJson suit BacktestRequestSerializer', () {
    final json = BacktestDraft(
      symbol: 'BTC/USDT',
      capital: 1000,
      startDate: DateTime(2020, 1, 5),
    ).toJson();
    expect(json, {
      'exchange': 'binance',
      'symbol': 'BTC/USDT',
      'capital': '1000.00',
      'start_date': '2020-01-05',
      'discount_pct': '75.00',
    });
  });

  test('ExchangeConnection : clé masquée et passphrase OKX', () {
    final c = ExchangeConnection.fromJson({
      'id': 4,
      'exchange': 'okx',
      'label': '',
      'api_key_masked': 'vX9k...3fQa',
    });
    expect(c.exchange.requiresPassphrase, isTrue);
    expect(c.displayName, 'OKX');
    const draft = ExchangeConnectionDraft(
      exchange: ExchangeType.bybit,
      apiKey: 'k',
      apiSecret: 's',
    );
    expect(draft.toJson()['exchange'], 'bybit');
  });

  test('UserProfile.fromJson accepte la réponse de /me/', () {
    final u = UserProfile.fromJson({
      'id': 7,
      'username': 'mouhsine',
      'email': 'm@example.com',
      'is_staff': true,
    });
    expect(u.fullName, 'mouhsine');
    expect(u.initials, 'M');
    expect(u.isStaff, isTrue);
  });
}

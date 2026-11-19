/// Exchanges proposés dans le formulaire (ExchangeConnection.EXCHANGE_CHOICES).
enum ExchangeType {
  binance('binance', 'Binance'),
  bybit('bybit', 'Bybit'),
  okx('okx', 'OKX');

  const ExchangeType(this.apiValue, this.label);

  final String apiValue;
  final String label;

  /// OKX exige un passphrase (ExchangeConnectionSerializer.validate).
  bool get requiresPassphrase => this == ExchangeType.okx;

  static ExchangeType fromApi(Object? value) => ExchangeType.values.firstWhere(
        (e) => e.apiValue == value,
        orElse: () => ExchangeType.binance,
      );
}

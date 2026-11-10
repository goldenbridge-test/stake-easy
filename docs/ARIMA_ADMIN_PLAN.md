# Chantier « Paramètres ARIMA par actif » — plan complet

> Document de reprise : il permet de continuer seul, à n'importe quel moment, avec ou sans Claude.
> Mis à jour à la fin de la **Phase 4** (2026-11-06). À rafraîchir après chaque phase.

## 1. Objectif et règles

**Objectif** : rendre **10 paramètres de la stratégie ARIMA modifiables par actif** (chaque crypto a les siens),
**uniquement depuis `AdminDashboard.tsx`** (pas depuis l'admin Django), **réservé aux admins**, en conservant
les valeurs actuelles du code comme défauts, sans casser le backend existant.

**Règles de travail validées**
- On peut modifier les fichiers existants, mais **on ne supprime aucune fonctionnalité existante**.
- Une **confirmation avant tout changement majeur** (d'où le découpage en phases).
- Après chaque phase : un zip + ce plan à jour.

## 2. Décisions validées

| # | Décision |
|---|---|
| D1 | `capital_weight` = **coefficient multiplicateur** du montant d'achat (défaut 1.0), pas une répartition d'un capital global. |
| D2 | `max_position_per_asset` = **plafond absolu en devise de cotation** (USDT) du total investi dans les positions ouvertes de la config. Au-delà : achat ignoré + notification. `null` = pas de plafond (comportement actuel). |
| D3 | Les surcharges ne s'appliquent qu'aux modes **test** et **live** (les backtests clients / walkforward gardent leurs valeurs). |
| D4 | Stockage : nouveau modèle `AssetStrategyParams` (clé `exchange` + `symbol`), tous champs **nullables** (`null` = pas de surcharge). |
| D5 | Les 4 paramètres de zones sont résolus **quel que soit le mode** (zones partagées) — exception à D3, **confirmée** le 2026-11-05. |

### Exception à D3 découverte en Phase 1 (confirmée, voir D5)
Les **4 paramètres de détection de zones** (`tolerance_pct`, `swing_left`, `swing_right`, `min_band_pct`) sont
résolus **quel que soit le mode**. Raison : les zones sont **partagées** (clé exchange + symbole + timeframe, pas de
config). Si un walkforward re-détectait les zones avec d'autres valeurs que le test/live, deux jeux de zones se
mélangeraient dans la même table. **Conséquence** : changer ces 4 valeurs change aussi les zones vues par les backtests
clients. Pour revenir à la règle D3 stricte, il faudrait des zones par config (refonte, non recommandé).
Pour inverser ce choix : dans `asset_params.get_effective_params`, remplacer
`row = asset_row if spec.affects_zones else mode_row` par `row = mode_row`.

## 3. Les 10 paramètres

| # | Paramètre (champ) | Défaut actuel | Bornes validées | Où il vit aujourd'hui | Où il est appliqué (Phase 2, fait) |
|---|---|---|---|---|---|
| 1 | `discount_pct` | 75 | 0 – 100 (2 déc.) | `StrategyConfig` | `engine._buy_filters_ok` → `_discount_ok` |
| 2 | `buy_streak_schedule` | [2, 2, 1] | 1–10 achats, chacun ∈ ]0,100], somme ≤ 100 | `StrategyConfig` (vide = défaut moteur) | `engine._buy_into_position` |
| 3 | `min_touch_count` | 2 | 1 – 20 | **en dur** (`touch_count >= 2`) | `engine._buy_allowed` |
| 4 | `leave_atr_multiplier` | 2.00 | 0.1 – 20 | `StrategyConfig` | `engine._update_sealing` |
| 5 | `fast_break_candles` | 3 | 1 – 30 | `StrategyConfig` | `engine._check_fast_breaks` |
| 6 | `tolerance_pct` | 0.6 | 0.05 – 5 | **en dur** (`TIMEFRAME_PARAMS["1d"]`) | `engine._refresh_zones` |
| 7 | `swing_left` / `swing_right` | 8 / 8 | 2 – 30 chacun | **en dur** (`TIMEFRAME_PARAMS["1d"]`) | `engine._refresh_zones` |
| 8 | `min_band_pct` | 0.3 | 0.05 – 5 | **en dur** (`TIMEFRAME_PARAMS["1d"]`) | `engine._refresh_zones` |
| 9 | `capital_weight` | 1.0 | 0.01 – 10 (3 déc.) | n'existe pas | `engine._buy_into_position` |
| 10 | `max_position_per_asset` | aucun plafond | > 0 | n'existe pas | `engine._buy_into_position` |

Précédence : **surcharge de l'actif** (si non nulle) > **valeur de la `StrategyConfig`** (params 1, 2, 4, 5) > **défaut du code**.
La source unique (défauts, bornes, libellés pour l'UI, validation) est `apps/strategy/asset_params.py`.

## 4. État d'avancement

| Phase | Contenu | État |
|---|---|---|
| 1 | Modèles, migration, résolveur, validation, audit, tests, golden | ✅ **Livrée** |
| 2 | Brancher le moteur sur les paramètres effectifs | ✅ **Livrée** |
| 3 | API admin (endpoints, permissions, régénération des zones) | ✅ **Livrée** |
| 4 | Frontend (`AdminDashboard.tsx`, route `/admin`, composant Arima) | ✅ **Livrée** |
| 5 | Déploiement et retour arrière | ⏳ À faire |

## 5. Phase 1 — livrée

### Fichiers
| Fichier | Statut | Contenu |
|---|---|---|
| `apps/strategy/asset_params.py` | **nouveau** | `PARAM_SPECS` (défauts/bornes/libellés), validation, `get_effective_params`, `params_for` (mémoïsé), `get_zone_params`, `update_asset_params`, `reset_asset_params`, `describe_params` |
| `apps/strategy/models.py` | modifié (**ajout en fin de fichier uniquement**) | `AssetStrategyParams`, `AssetParamsChange` |
| `apps/strategy/migrations/0006_asset_strategy_params.py` | **nouveau** | migration additive (2 tables, aucune colonne existante touchée) |
| `apps/strategy/test_asset_params.py` | **nouveau** | 38 tests (dérive des défauts, validation, résolveur, service d'écriture, migration) |
| `apps/execution/test_golden_walkforward.py` + `apps/execution/golden/walkforward_btc_usdt.json` | **nouveaux** | test de non-régression du moteur (voir §7) |
| `docs/ARIMA_ADMIN_PLAN.md`, `phase1.patch` | **nouveaux** | ce plan, et un patch unifié (`patch -p1 < phase1.patch`) |

**`apps/execution/engine.py` n'est pas modifié.** Le comportement du bot est strictement inchangé après la Phase 1.

### Appliquer
```bash
unzip -o arima_admin_phase1.zip -d /chemin/de/ton/projet/backend   # écrase seulement les fichiers listés
python manage.py migrate                                           # applique 0006 (additive)
python manage.py test apps.strategy.test_asset_params apps.execution.test_golden_walkforward
```
Si ton `models.py` local a divergé du dump, ne remplace pas le fichier : ajoute en fin de fichier le bloc
`AssetStrategyParams` + `AssetParamsChange` visible dans `phase1.patch`.
**Versionne bien `0006_asset_strategy_params.py`** : `build.sh` lance `makemigrations` au déploiement, ce qui générerait
sinon une migration non versionnée.

### Vérifié en Phase 1
- 42 tests verts ; `manage.py check` OK ; `makemigrations --check` sans dérive.
- Migration appliquée, annulée (retour à 0005) puis réappliquée sur une base vierge.
- Mutations : changer un défaut dans `asset_params.py` fait échouer les tests de dérive.
- `engine.py` identique à l'original (comparaison fichier à fichier).

### Retour arrière Phase 1
`python manage.py migrate strategy 0005` puis supprimer les fichiers ajoutés et le bloc ajouté à `models.py`.
Rien d'autre n'en dépend.

## 6. Phase 2 — Brancher le moteur (✅ livrée)

**But** : `engine.py` lit les paramètres via `params_for(config)`. Sans ligne de surcharge, **le résultat est strictement
identique** (le golden, inchangé, le prouve).

### Livré
| Fichier | Statut |
|---|---|
| `apps/execution/engine.py` | modifié : **+42 / −9 lignes** (les 9 lignes retirées sont des lignes remplacées, aucune fonctionnalité supprimée) |
| `apps/execution/test_engine_params.py` | **nouveau** : 36 tests de câblage |
| `phase2_engine.patch` | patch limité à `engine.py` (`git apply phase2_engine.patch`) |

### Appliquer
Dézipper à la racine du backend (écrase `engine.py`, ajoute le test et met à jour ce plan). **Si tu as modifié `engine.py`
depuis la Phase 1**, ne copie pas ce fichier : fais `git apply phase2_engine.patch`. Aucune migration, aucune nouvelle dépendance.
```bash
python manage.py test        # 78 tests attendus, tous OK (le golden ne doit PAS avoir été regénéré)
```

### Vérifié en Phase 2
- 78 tests verts (42 de la Phase 1 + 36 nouveaux) ; golden **inchangé** (JSON non touché) ; `manage.py check` OK ; aucune migration nouvelle.
- **11 mutations** du moteur (un câblage cassé à la fois : discount, touch, ATR, cassure rapide, schedule, poids, plafond ≤/<, zones, mémo, notification) :
  chacune est détectée par au moins un test.
- Équivalence sur le moteur complet (1000 bougies) : une surcharge de l'actif donne **exactement** le même résultat que la même valeur sur la `StrategyConfig`
  (discount, schedule, cassure rapide, ATR) et le résultat change bien ; `capital_weight = 2` double chaque achat ; une ligne avec les valeurs actuelles = golden.
- Compatibilité scripts : `_buy_allowed(zone, recent, approach)` à 3 arguments et `_discount_ok` / `_buy_filters_ok` gardent leurs signatures.

### Écarts par rapport au plan initial
- `_exceeds_position_cap(config, amount_quote, cap, notify_user=True)` respecte `notify_user` (le walkforward et les scripts qui passent `notify_user=False` ne notifient pas).
- La notification de plafond est limitée à **1 par jour et par config** via `cache.add` (cache Django). Avec le cache par défaut `locmem`, ce compteur est **par processus** :
  plusieurs workers peuvent chacun notifier une fois par jour. Pour un vrai « 1 par jour », configurer un cache partagé (Redis).
- La mémoïsation est réinitialisée au début de `run_test_or_live` et `run_walkforward` ; ailleurs (scripts), `params_for` garde la valeur pour la durée de vie de l'instance.

### Retour arrière Phase 2
`git apply -R phase2_engine.patch` (ou restaurer `engine.py` de la Phase 1) : le moteur redevient exactement celui de la Phase 1 ; supprimer
`test_engine_params.py`. Les lignes de surcharge restent en base mais sont alors ignorées.

### Détail des modifications (déjà appliquées — conservé comme référence)
Importer : `from apps.strategy.asset_params import params_for` ; `from django.db.models import Sum` ; `import logging` ;
`from django.core.cache import cache`. **Conserver** `TIMEFRAME_PARAMS` et `DEFAULT_BUY_STREAK` (les tests de dérive
les comparent à `asset_params`) et **conserver les signatures existantes** : des scripts (`scripts/diag_*.py`)
importent `_discount_ok`, `_buy_allowed`, `_buy_filters_ok`, `_running_ranges`, `_bearish_strong`.

1. **Réinitialiser la mémoïsation** au début de `run_test_or_live(config)` et `run_walkforward(config, ...)` :
   `config.__dict__.pop("_effective_params", None)`.
2. **`_refresh_zones`** (params 6, 7, 8) :
   ```python
   def _refresh_zones(config):
       zone_params = params_for(config).zone_params
       for tf, params in TIMEFRAME_PARAMS.items():
           update_candles(config.exchange, config.symbol, tf)
           detect_and_save_zones(config.exchange, config.symbol, tf, **{**params, **zone_params})
   ```
3. **`_buy_allowed`** (param 3) : ajouter un argument optionnel, défaut inchangé :
   `def _buy_allowed(zone, recent_candles, approach_candles, min_touch_count=2):` puis `if zone.touch_count >= min_touch_count:`.
4. **`_buy_filters_ok`** (params 1 et 3) :
   ```python
   p = params_for(config)
   if not _discount_ok(zone, swing_low, swing_high, p.discount_pct):
       return False
   return _buy_allowed(zone, recent_candles, approach_candles, p.min_touch_count)
   ```
5. **`_update_sealing`** (param 4) : avant la boucle, `leave_mult = params_for(config).leave_atr_multiplier` ;
   remplacer `atr * config.leave_atr_multiplier` par `atr * leave_mult`.
6. **`_check_fast_breaks`** (param 5) : avant la boucle, `fast_break = params_for(config).fast_break_candles` ;
   remplacer `config.fast_break_candles` par `fast_break`.
7. **`_buy_into_position`** (params 2, 9, 10) :
   - `p = params_for(config)` ; `schedule = p.buy_streak_schedule` (équivaut à `config.buy_streak_schedule or DEFAULT_BUY_STREAK`).
     Garder ensuite la logique `percent_per_buy_override` de la zone telle quelle.
   - Après `amount_quote = config.balance_quote * (percent / Decimal("100"))` :
     ```python
     if p.capital_weight != 1:
         amount_quote = amount_quote * p.capital_weight
     if p.max_position_per_asset is not None and _exceeds_position_cap(config, amount_quote, p.max_position_per_asset):
         return        # AVANT place_spot_buy en live
     ```
   - Nouveau helper :
     ```python
     def _exceeds_position_cap(config, amount_quote, cap):
         invested = (Position.objects.filter(strategy_config=config, is_fully_closed=False)
                     .aggregate(total=Sum("total_quote_spent"))["total"] or Decimal("0"))
         if invested + amount_quote <= cap:
             return False
         logging.getLogger(__name__).info("Plafond %s atteint (%s + %s > %s)", config.symbol, invested, amount_quote, cap)
         if cache.add(f"maxpos:{config.id}:{timezone.now():%Y%m%d}", 1, 86400):   # 1 notification/jour max
             notify(config.user, f"[{config.mode.upper()}] {config.symbol} : achat ignoré, plafond {cap} atteint")
         return True
     ```
     `total_quote_spent` cumule l'investi historique des positions non clôturées (conservateur : une vente partielle ne le réduit pas).

### Tests (fichier `apps/execution/test_engine_params.py`, **faits**)
1. **Golden inchangé** : `test_golden_walkforward` vert **sans toucher au JSON**.
2. **Équivalence** : une ligne `AssetStrategyParams` avec les valeurs actuelles explicites donne le même instantané
   (patcher `asset_params.APPLY_MODES` pour inclure `"walkforward"` : `mock.patch.object(asset_params, "APPLY_MODES", ("test","live","walkforward"))`).
3. **Câblage, un test par paramètre** (le golden est insensible à plusieurs, voir §7) :
   - 1 : `_discount_ok` reçoit la valeur de la surcharge (mock + `assert_called_with`).
   - 2 : montants d'achat successifs suivent `[1, 1]` vs défaut `[2, 2, 1]` (mode `test`, pas d'ordre réel).
   - 3 : `_buy_allowed` avec `touch_count` 1 / 2 / 3 et seuils 1 / 2 / 3 ; `_buy_filters_ok` transmet `p.min_touch_count`.
   - 4 : seuil de scellement calculé avec la surcharge (bougies et position construites à la main).
   - 5 : cassure à N et N+1 bougies.
   - 6, 7, 8 : `_refresh_zones` appelle `detect_and_save_zones` avec les valeurs fusionnées (mock de `update_candles` et `detect_and_save_zones`).
   - 9 : `amount_quote` × poids ; en live, `place_spot_buy` reçoit le montant pondéré (mock).
   - 10 : achat ignoré quand `investi + montant > plafond` ; autorisé en dessous ; `null` = illimité ; positions clôturées ignorées ; 1 seule notification/jour.
4. **Compatibilité scripts** : `from apps.execution.engine import _discount_ok, _buy_allowed, _buy_filters_ok, _running_ranges, _bearish_strong` fonctionne et `_buy_allowed(zone, recent, approach)` (3 arguments) reste valide.

### Critères de sortie (atteints)
Tous les tests verts (dont le golden **inchangé**) ; `git diff` d'`engine.py` limité aux points ci-dessus ; aucun
changement hors `engine.py` (+ le nouveau fichier de tests).

### Point à connaître
En walkforward, `params_for(config).zone_params` renvoie les valeurs de l'actif (cf. D5) alors que les 7 autres
paramètres restent aux défauts : c'est voulu. Les surcharges ne sont **pas visibles** dans un walkforward lancé aujourd'hui (D3) : pour les
tester sur l'historique, les tests patchent `asset_params.APPLY_MODES`.

## 7. Ce que le golden prouve (et ne prouve pas)

`test_golden_walkforward` rejoue 1000 bougies synthétiques déterministes (146 trades : 27 achats, 119 ventes, 13 positions)
et compare à un JSON généré **avec le moteur d'origine**. Il prouve « le comportement par défaut n'a pas changé ».

Mesuré en Phase 1 : il **détecte** un changement de `discount_pct`, `buy_streak_schedule`, `fast_break_candles` (grandes
valeurs), `leave_atr_multiplier` (petites valeurs) et `min_touch_count` abaissé à 1. Il ne détecte **pas** :
`min_touch_count ≥ 3`, `leave_atr_multiplier` élevé, `fast_break_candles = 1`, ni les paramètres de zones (`swing`,
`min_band_pct`) — les seuils de swing du BTC (`SYMBOL_OVERRIDES`) dominent. **D'où les tests de câblage dédiés de la Phase 2.**
Ne régénère jamais le JSON (`REGEN_GOLDEN=1`) pour « faire passer » un test : un écart signifie que le comportement a changé.

## 8. Phase 3 — API admin (✅ livrée)

### Livré
| Fichier | Statut |
|---|---|
| `apps/strategy/zone_regen.py` | **nouveau** : régénération non destructive, ensemble des zones protégées, calcul de `zones_need_regen` |
| `apps/strategy/admin_views.py` | **nouveau** : 7 vues (`IsAdminUser`) |
| `apps/strategy/admin_urls.py` | **nouveau** : routes montées sous `/api/strategy/admin/` |
| `apps/strategy/urls.py` | modifié : +1 `path("admin/", include(...))` (le router existant est inchangé) |
| `apps/accounts/views.py`, `apps/accounts/urls.py` | modifiés : ajout de `MeView` et de la route `me/` (`UserViewSet` / `UserSerializer` **non touchés**) |
| `apps/strategy/test_admin_api.py`, `apps/accounts/test_me.py` | **nouveaux** : 35 tests |
| `phase3_modified_files.patch` | patch limité aux 3 fichiers existants modifiés (`git apply phase3_modified_files.patch`) |

### Appliquer
Dézipper à la racine du backend. **Si tu as modifié `apps/strategy/urls.py`, `apps/accounts/urls.py` ou `apps/accounts/views.py`**, ne copie pas ces trois
fichiers : fais `git apply phase3_modified_files.patch` (les fichiers nouveaux se copient sans risque). Aucune migration.
```bash
python manage.py test        # 113 tests attendus, tous OK
```

### Vérifié en Phase 3
- 113 tests verts (78 + 35) ; `engine.py` et le golden **inchangés** ; `manage.py check` OK ; aucune migration nouvelle.
- Permissions : anonyme → 401, non-staff → 403 sur **chaque** endpoint (et rien n'est écrit), staff → 200.
- **12 mutations** (permission ouverte, confirmation retirée, actif inconnu accepté, chaque type de protection de zone retiré, zones manuelles supprimables, zones non désactivées, `zones_need_regen` figé) :
  toutes détectées.
- Régénération : zones d'entrée, paliers de TP des positions ouvertes, zones de trades et `target_zone` sont conservés ; positions, trades et liens intacts ;
  zones manuelles, autres actifs et autres timeframes non touchés ; rollback complet si la détection échoue.

### Endpoints (tous `IsAdminUser`, préfixe `/api/strategy/admin/`)
Le symbole est passé en **deux segments** (`BTC/USDT` → `.../BTC/USDT/`), ce qui évite tout conflit avec les sous-routes (écart avec `<path:symbol>` prévu au départ).

| Méthode et URL | Rôle |
|---|---|
| `GET asset-params/meta/` | libellés, défauts, bornes, `affects_zones` de chaque paramètre ; `zone_affecting`, `apply_modes` |
| `GET asset-params/` | actifs connus (configs ∪ zones ∪ surcharges) : `exchange, symbol, has_overrides, live_active, test_active, zones_need_regen` |
| `GET asset-params/<exchange>/<base>/<quote>/` | détail (voir contrat ci-dessous). 404 si l'actif est inconnu, 400 si exchange/symbole invalide |
| `PATCH` idem | corps `{"changes": {champ: valeur \| null}}` ; `null` retire la surcharge ; renvoie le détail |
| `POST .../reset/` | corps `{"fields": [...]}` ou `{}` (= tous) ; renvoie le détail |
| `GET .../history/?limit=50` | journal (max 200), plus récent d'abord |
| `POST .../regenerate-zones/` | corps `{"confirm": true}` **obligatoire** (400 sinon) ; renvoie `{summary, detail}` |
| `GET /api/accounts/me/` | `{id, username, email, is_staff}` de l'utilisateur courant (`IsAuthenticated`) |

### Contrat d'API (réponses réelles)
`GET asset-params/` :
```json
[{"exchange": "binance", "symbol": "BTC/USDT", "has_overrides": false, "live_active": 1, "test_active": 0, "zones_need_regen": false}]
```
`GET` / `PATCH` détail (`params` tronqué à 3 des 11 entrées) :
```json
{"exchange": "binance", "symbol": "BTC/USDT", "has_overrides": true,
 "configs": {"live_active": 1, "test_active": 0, "live_total": 1, "test_total": 0},
 "zones_need_regen": true,
 "zone_params": {"tolerance_pct": 0.6, "left": 10, "right": 8, "min_band_pct": 0.3},
 "updated_at": "2026-11-06T08:34:07.880545+00:00", "updated_by": "boss",
 "params": [
  {"name": "discount_pct", "override": "60.00", "default": "75.00", "config_values": ["75.00"],
   "source": "asset", "effective": "60.00", "varies": false, "affects_zones": false},
  {"name": "buy_streak_schedule", "override": null, "default": [2.0, 2.0, 1.0], "config_values": [],
   "source": "default", "effective": [2.0, 2.0, 1.0], "varies": false, "affects_zones": false},
  {"name": "swing_left", "override": 10, "default": 8, "config_values": [],
   "source": "asset", "effective": 10, "varies": false, "affects_zones": true}]}
```
- `source` ∈ `asset | config | default`. Si plusieurs configs de l'actif ont des valeurs différentes : `varies: true`, `effective: null`, toutes les valeurs dans `config_values`.
- Les décimaux sont des **chaînes** (`"60.00"`) : toujours comparer **numériquement** (l'historique peut afficher `"60"` pour la même valeur).

Erreur de validation (400) : `{"detail": "Donnees invalides.", "errors": {"discount_pct": ["Doit etre <= 100."], "swing_left": ["Doit etre >= 2."]}}`.
Non-staff (403) : `{"detail": "..."}`. Historique : `[{"id", "changed_at", "changed_by", "kind": "update" | "regenerate_zones", "changes": {champ: {"old", "new"}}}]`.
Régénération : `{"summary": {"deleted", "kept_referenced", "deactivated", "active_after", "params"}, "detail": {...}}`.

### Régénération non destructive — règles
Supprimées : zones **auto** (`is_manual=False`) du timeframe `1d` **non référencées**. Conservées (et désactivées) si référencées par :
une position (`entry_zone`, CASCADE), un palier de TP d'une position **ouverte** (`resistance_ladder[*].zone_id` — sinon le moteur saute ce palier en silence),
un trade (`Trade.zone`), ou une `target_zone` de config. Zones manuelles, autres actifs et autres timeframes : jamais touchés.
Tout est dans une transaction. Elle utilise les bougies déjà en base (le scan toutes les 4h les tient à jour) et tourne **de façon synchrone**
(pas de Celery : `render.yaml` ne déclare qu'un service web).

### Non fait (volontairement)
Pas de limitation de débit ; pas de déclencheurs de scan ni de walkforward depuis l'admin (hors périmètre des 10 paramètres) ;
la fuite de `GET /accounts/profile/` (§10) n'est pas corrigée.

### Retour arrière Phase 3
`git apply -R phase3_modified_files.patch` et supprimer les fichiers nouveaux : l'API disparaît, rien d'autre n'en dépend.
Les surcharges déjà posées restent en base et continuent de s'appliquer au moteur (`reset` avant retrait si besoin).

## 9. Phase 4 — Frontend (✅ livrée)

> Cette phase concerne le **dépôt frontend** (celui qui contient le dossier `front_end/`), pas le backend.

### Livré
| Fichier (sous `front_end/`) | Statut |
|---|---|
| `src/components/admin/ArimaParams.tsx` | **nouveau** : liste des actifs, formulaire des paramètres, modales de confirmation, historique |
| `src/components/admin/ParamRow.tsx`, `ConfirmModal.tsx`, `HistoryPanel.tsx` | **nouveaux** : ligne de paramètre, modale (case obligatoire si stratégie live), historique |
| `src/components/admin/arimaParamsLogic.ts`, `arimaTypes.ts` | **nouveaux** : parsing / validation / diff (logique pure) et types du contrat d'API |
| `src/services/adminArima.ts` | **nouveau** : client HTTP typé de l'API admin |
| `src/hooks/useAuth.ts` | modifié (ajout seul) : expose `isStaff` via `/accounts/me/` ; `user` inchangé |
| `src/components/AdminDashboard.tsx` | modifié : `isAdmin` ← `isStaff` ; onglets **Staking** (contenu d'origine conservé) et **Arima** ; bouton `[DEV]` limité au build de dev |
| `src/App.tsx` | modifié : +1 import, +1 route `/admin` dans `ProtectedRoute` |
| `tests/*`, `vitest.config.ts` | **nouveaux, optionnels** (hors `src/`, donc hors `tsc` et hors build) |
| `phase4_modified_files.patch` | patch des 3 fichiers modifiés (`git apply phase4_modified_files.patch`, depuis le dossier qui contient `front_end/`) |

Aucune dépendance ajoutée, `package.json` inchangé. Le backend doit avoir la Phase 3 (sinon l'onglet Arima affiche une erreur et `isStaff` reste faux ; personne n'est déconnecté).

### Appliquer
Dézipper dans le dossier qui contient `front_end/`. **Si tu as modifié `useAuth.ts`, `AdminDashboard.tsx` ou `App.tsx` depuis le dump**, ne copie pas ces trois
fichiers : `git apply phase4_modified_files.patch`. (Dans `AdminDashboard.tsx`, le bloc Staking est ré-indenté de 4 espaces ; `git diff -w` montre le vrai changement : 2 lignes remplacées.)
La page est à l'adresse **`/admin`** (aucun lien ajouté dans la barre de navigation).

### Comportement
- Accès : token présent (sinon `/signin`) **et** `is_staff` renvoyé par `/accounts/me/` ; sinon « Access Denied ». Pendant la vérification : « Vérification des droits… » (pas de flash).
- Onglet Arima : liste des actifs (badges *surchargé*, *live ×N*, *test ×N*, *zones à régénérer*, filtre), puis 11 paramètres en 3 groupes avec valeur effective, défaut, origine (*Surcharge / Config / Défaut*), bornes issues de l'API, bouton de retrait de la surcharge.
- Saisie : champ vide = pas de surcharge ; virgule décimale acceptée ; schedule « 2, 2, 1 ». Validation locale avec les bornes de l'API ; l'enregistrement reste bloqué tant qu'un champ est invalide (aucun envoi partiel).
- **Enregistrer → modale avec le diff** (ancienne → nouvelle valeur) ; si l'actif a des stratégies **live** : encadré rouge et **case à cocher obligatoire**. Seuls les champs modifiés sont envoyés. Les erreurs 400 s'affichent sous les champs, 403/401/réseau en bandeau.
- Changer d'actif avec des modifications non enregistrées demande confirmation ; une réponse tardive d'un actif déjà quitté est ignorée.
- « Régénérer les zones » : modale explicative, bloquée tant que des modifications ne sont pas enregistrées ; bandeau orange quand `zones_need_regen`.
- « Tout remettre par défaut » (modale) et « Historique » (qui / quand / ancien → nouveau).

### Vérifié en Phase 4
- `tsc` (config **stricte** du projet) : **0 erreur nouvelle** sur tout le code livré.
- **99 tests** (Vitest + Testing Library) : logique pure (36), composant Arima (26), `AdminDashboard` (9), `useAuth` (9), routage de l'`App` réelle (12), client HTTP (7). Les fixtures `meta` / `détail` viennent du **vrai backend**.
- **Contrat avec le backend** : chaque URL produite par le client a été résolue par le routeur Django réel (7 routes admin + `/accounts/me/`).
- **17 mutations** (droits ignorés, bouton DEV en prod, confirmations retirées, case live non exigée, envoi partiel, réponse tardive, route sans `ProtectedRoute`, etc.) : toutes détectées. L'une a d'abord échappé
  (un champ valide + un champ invalide) : cas ajouté au test, puis détectée.
- Aucun test n'a été exécuté dans un vrai navigateur ni sur ton projet complet (dépendances web3 non installées dans mon environnement) : voir la checklist manuelle.

### Tests optionnels chez toi
```bash
cd front_end
npm i -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
npx vitest run            # 99 tests attendus
```
(Les tests vivent dans `front_end/tests/`, hors `src/` : sans ces dépendances, `tsc` et `vite build` ne les voient pas.)

### ⚠️ Erreurs `tsc` déjà présentes dans ton code (non corrigées)
`npm run build` = `tsc && vite build`, et `noUnusedLocals` est activé : **5 erreurs préexistantes** (mesurées sur le dump d'origine, identiques avant/après mes changements) font échouer `tsc` :
`AdminDashboard.tsx` (imports `ExternalLink`, `AlertTriangle` et variable `logs` inutilisés) et `Navbar.tsx` (imports `React` et `Globe` inutilisés).
Correctif trivial (supprimer ces imports/variable) ; je ne l'ai pas fait car `Navbar.tsx` est hors périmètre. Si tu déploies avec `vite build` seul, rien ne change.

### Checklist manuelle (à faire une fois, en vrai)
1. Non connecté → `/admin` redirige vers `/signin`. Connecté non staff → « Access Denied » (et aucun appel `asset-params` n'aboutit : 403).
2. Compte staff → `/admin` s'affiche ; l'onglet Staking est identique à avant (Manage Tokens, Reward Distribution).
3. Onglet Arima : la liste des actifs se charge ; choisir un actif en mode **test** ; modifier `min_touch_count`, annuler dans la modale (rien n'est enregistré), puis enregistrer.
4. Valeur hors bornes refusée avec message ; retirer une surcharge ; « Tout remettre par défaut » ; l'historique reflète les actions.
5. Modifier `swing_left` → bandeau « zones à régénérer » → régénérer → le bandeau disparaît ; vérifier que les positions existantes sont intactes.
6. Sur un actif avec une stratégie live : la case de confirmation est exigée.
7. Les pages existantes (`/staking`, `/arima`, `/arima/backtest`, `/arima/portfolio`) se comportent comme avant ; `SignIn` fonctionne.

### Retour arrière Phase 4
`git apply -R phase4_modified_files.patch`, puis supprimer `src/components/admin/`, `src/services/adminArima.ts`, `tests/`, `vitest.config.ts`. Le backend n'en dépend pas.

### Non fait (volontairement)
Lien « Admin » dans la barre de navigation ; internationalisation ; rafraîchissement automatique des données ; tests de bout en bout dans un navigateur.

## 10. Constats sur le code existant (hors périmètre, à décider)

1. **`GET /accounts/profile/` liste tous les utilisateurs** (`UserViewSet.queryset = User.objects.all()` avec `list` actif) pour tout utilisateur connecté, et
   `useAuth` stocke cette réponse dans `user`. Fuite de noms d'utilisateur et d'emails. Correctif possible (à valider, car il change la forme de `user`) :
   `get_queryset` → `User.objects.filter(pk=self.request.user.pk)`.
2. **`scripts/regen_zones.py` supprime les zones auto** → par `CASCADE`, supprime aussi positions et trades liés. À ne pas lancer sur une base avec des positions.
3. **`build.sh` exécute `makemigrations` au déploiement** : toute dérive de modèle génère une migration non versionnée en production.
4. `render.yaml` ne décrit qu'un service web : vérifier qu'un worker + beat Celery tournent bien ailleurs, sinon le scan toutes les 4h ne s'exécute pas.
5. `codebase.txt` et `temp-7888.rdb` sont dans le dépôt (dump de code et dump Redis) : à sortir du dépôt si possible.

## 11. Phase 5 — Déploiement et mise en service (⏳)

Rien à coder : c'est la mise en production, dans cet ordre. **Chaque étape est réversible** ; ne passe à la suivante qu'après avoir vérifié la précédente.

**Étape 1 — Backend, migration (inerte).** Versionner `apps/strategy/migrations/0006_asset_strategy_params.py`, déployer. `build.sh` lance `makemigrations` puis `migrate` :
`makemigrations` ne doit rien générer (modèles et migration synchronisés — vérifie dans les logs de build : « No changes detected »). Vérif : `GET /api/strategy/strategies/` répond comme avant.

**Étape 2 — Backend, moteur (Phase 2).** Déployer `engine.py` + tests. Sans aucune ligne de surcharge, le bot se comporte comme avant (golden). Vérif : laisser tourner un scan (toutes les 4 h, ou à la main :
`python manage.py shell -c "from apps.strategy.tasks import scan_all_active_zones; scan_all_active_zones()"`) et contrôler les logs : aucune erreur, mêmes zones qu'avant.

**Étape 3 — Backend, API (Phase 3).** Déployer. Vérifs : `GET /api/accounts/me/` avec ton token → `is_staff`. `GET .../asset-params/meta/` : 403 avec un compte non staff, 200 avec un staff.
**Compte admin** : `build.sh` crée déjà un superuser (donc `is_staff`) si `DJANGO_SUPERUSER_PASSWORD` est défini (nom : `DJANGO_SUPERUSER_USERNAME`, `admin` par défaut) : il peut utiliser la page `/admin`. Vérifie que son mot de passe est fort (le nom `admin` par défaut est le premier deviné par un attaquant). Pour donner le droit à ton compte habituel : `python manage.py shell -c "from django.contrib.auth import get_user_model as g; g().objects.filter(username='TON_USER').update(is_staff=True)"`.

**Étape 4 — Frontend (Phase 4).** Déployer le front (`VITE_API_URL` doit se terminer par `/api`, comme aujourd'hui). Contrôle CORS : `production.py` du dump ne définit pas `CORS_ALLOWED_ORIGINS`
(seulement `development.py`) ; si tes pages Arima fonctionnent déjà en production, la config est bonne (le nouveau code utilise le même client `api`, et `PATCH` est autorisé par défaut par `django-cors-headers`). Sinon, ajouter l'origine du front.
Puis la checklist manuelle du §9.

**Étape 5 — Première mise en service réelle.** Toujours sur un actif en mode **test** d'abord : poser UNE surcharge (ex. `min_touch_count`), attendre le prochain scan, comparer avec le comportement attendu, regarder l'historique.
Ensuite seulement un actif live, en changeant un paramètre à la fois et en notant la valeur d'origine (visible dans l'historique). Les paramètres de zones demandent une régénération explicite.

**Règles d'exploitation**
- Seuls les comptes `is_staff` modifient le bot : en créer le moins possible, mots de passe forts, HTTPS partout.
- Une surcharge s'applique au **prochain scan** (toutes les 4 h) : pas d'effet instantané.
- Pour tout annuler d'un coup : bouton « Tout remettre par défaut » (ou `reset_asset_params` en shell) → le bot reprend exactement ses valeurs d'avant.
- Ne jamais lancer `scripts/regen_zones.py` en production (cf. §10).

**Retour arrière global** : `reset` des surcharges (immédiat, sans redéploiement) ; sinon revenir aux commits précédents dans l'ordre inverse (front, API, moteur) ; `migrate strategy 0005` retire les deux tables en dernier.

## 12. Commandes utiles

```bash
python manage.py test                                              # suite complète (113 tests)
python manage.py test apps.strategy.test_admin_api apps.accounts.test_me -v 2   # API admin (Phase 3)
# Frontend (dans front_end/, après npm i -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom) :
npx vitest run                                                     # 99 tests (Phase 4)
python manage.py test apps.strategy.test_asset_params -v 2         # Phase 1
python manage.py test apps.execution.test_golden_walkforward       # non-régression moteur
python manage.py test apps.execution.test_engine_params -v 2       # câblage des 10 paramètres (Phase 2)
python manage.py makemigrations --check --dry-run                  # aucune dérive
python manage.py migrate strategy 0005                             # retour arrière Phase 1
```

# DB設計書 - AI人材マッチングプラットフォーム

## ER図（テキスト）

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│  engineers  │       │ job_postings │       │  companies  │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)      │       │ id (PK)     │
│ name        │       │ company_id(FK)│──────▶│ name        │
│ email       │       │ title        │       │ contact_*   │
│ exp_level   │       │ description  │       │ stripe_*    │
│ ai_special  │       │ ai_domain    │       │ discord_ch  │
│ salary_*    │       │ tech_stack   │       └─────────────┘
│ discord_uid │       │ salary_*     │              │
└──────┬──────┘       └──────┬───────┘              │
       │                     │                      │
       │   ┌─────────────┐   │               ┌─────┴──────┐
       └──▶│   matches   │◀──┘               │  payments  │
           ├─────────────┤                    ├────────────┤
           │ id (PK)     │                    │ id (PK)    │
           │ engineer_id │                    │ company_id │
           │ posting_id  │                    │ match_id   │
           │ ai_score    │──────────────────▶ │ stripe_*   │
           │ status      │                    │ amount     │
           │ pitch_*     │                    └────────────┘
           └──────┬──────┘
                  │
           ┌──────┴───────┐
           │ match_events │
           ├──────────────┤
           │ id (PK)      │
           │ match_id(FK) │
           │ event_type   │
           │ old/new_val  │
           └──────────────┘

┌─────────────┐     ┌──────────────────┐     ┌────────────────┐
│ skill_tags  │◀───▶│ engineer_skills  │     │ posting_skills │
├─────────────┤     ├──────────────────┤     ├────────────────┤
│ id (PK)     │     │ engineer_id (FK) │     │ posting_id(FK) │
│ name        │     │ skill_id (FK)    │     │ skill_id (FK)  │
│ category    │     │ years            │     │ required       │
│ aliases     │     │ proficiency      │     └────────────────┘
└─────────────┘     └──────────────────┘

┌─────────────┐
│ diagnoses   │
├─────────────┤
│ id (PK)     │
│ engineer_id │
│ questionnaire│
│ report (JSON)│
│ market_score │
└─────────────┘
```

## テーブル一覧

| テーブル | 行数想定 | 説明 |
|---------|---------|------|
| engineers | ~1,000 | AIエンジニア（求職者） |
| companies | ~200 | 求人企業 |
| job_postings | ~500 | 求人案件 |
| skill_tags | ~300 | スキルマスタ（PyTorch, LangChain等） |
| engineer_skills | ~5,000 | エンジニア×スキル |
| posting_skills | ~2,000 | 求人×スキル |
| matches | ~10,000 | AIマッチング結果 |
| match_events | ~50,000 | ステータス変更ログ |
| diagnoses | ~2,000 | 無料診断 |
| payments | ~500 | 決済記録 |

## インデックス戦略

| インデックス | 対象 | 用途 |
|------------|------|------|
| ix_engineers_open | engineers(open_to_offers, experience_level) | 転職可能なエンジニア検索 |
| ix_postings_active | job_postings(is_active, ai_domain) | アクティブ求人のドメイン検索 |
| ix_matches_status | matches(status, ai_score) | ステータス別マッチ一覧 |

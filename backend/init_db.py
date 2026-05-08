"""
DB初期化 + シードデータ投入スクリプト
SQLiteで即起動するためのスクリプト。
"""
from app.models.database import engine, Base, SessionLocal
from app.models.models import (
    Engineer, Company, JobPosting, SkillTag,
    ExperienceLevel,
)

def main():
    # テーブル作成
    Base.metadata.create_all(bind=engine)
    print("✅ テーブル作成完了")

    db = SessionLocal()

    # 既にデータがあればスキップ
    if db.query(Engineer).first():
        print("⏭️  シードデータ済み、スキップ")
        db.close()
        return

    # スキルタグ
    skills = []
    for name, cat in [
        ("Python", "language"), ("TypeScript", "language"), ("Go", "language"),
        ("PyTorch", "framework"), ("TensorFlow", "framework"), ("LangChain", "framework"),
        ("Hugging Face", "framework"), ("scikit-learn", "framework"), ("OpenCV", "framework"),
        ("NLP", "domain"), ("Computer Vision", "domain"), ("LLM", "domain"),
        ("MLOps", "domain"), ("Recommendation", "domain"), ("Speech", "domain"),
        ("AWS", "infra"), ("GCP", "infra"), ("Azure", "infra"),
        ("Docker", "infra"), ("Kubernetes", "infra"),
    ]:
        s = SkillTag(name=name, category=cat, aliases=[name.lower()])
        db.add(s)
        skills.append(s)
    db.flush()

    # エンジニア（サンプル5名）
    engineers_data = [
        {
            "name": "田中 太郎",
            "email": "tanaka@example.com",
            "experience_level": ExperienceLevel.senior,
            "years_of_experience": 7,
            "ai_specialties": ["NLP", "LLM"],
            "preferred_frameworks": ["PyTorch", "LangChain", "Hugging Face"],
            "desired_salary_min": 800,
            "desired_salary_max": 1200,
            "desired_work_style": "remote",
            "bio": "大規模言語モデルのファインチューニングとRAG構築が専門。",
            "current_company": "AIスタートアップ株式会社",
            "current_role": "シニアMLエンジニア",
        },
        {
            "name": "佐藤 花子",
            "email": "sato@example.com",
            "experience_level": ExperienceLevel.mid,
            "years_of_experience": 4,
            "ai_specialties": ["Computer Vision", "MLOps"],
            "preferred_frameworks": ["PyTorch", "OpenCV", "Docker"],
            "desired_salary_min": 600,
            "desired_salary_max": 900,
            "desired_work_style": "hybrid",
            "bio": "製造業向け画像認識システムの開発・運用経験。MLOpsパイプライン構築も。",
        },
        {
            "name": "鈴木 一郎",
            "email": "suzuki@example.com",
            "experience_level": ExperienceLevel.lead,
            "years_of_experience": 12,
            "ai_specialties": ["NLP", "LLM", "MLOps"],
            "preferred_frameworks": ["PyTorch", "TensorFlow", "LangChain"],
            "desired_salary_min": 1200,
            "desired_salary_max": 1800,
            "desired_work_style": "hybrid",
            "bio": "元Google、AI部門テックリード。検索エンジンのML基盤を設計。",
            "current_company": "テック大手",
            "current_role": "Principal Engineer",
        },
        {
            "name": "山田 美咲",
            "email": "yamada@example.com",
            "experience_level": ExperienceLevel.junior,
            "years_of_experience": 1,
            "ai_specialties": ["LLM"],
            "preferred_frameworks": ["LangChain", "Hugging Face"],
            "desired_salary_min": 400,
            "desired_salary_max": 600,
            "desired_work_style": "remote",
            "bio": "大学院でNLP研究。LLMアプリケーション開発に興味。",
        },
        {
            "name": "高橋 健太",
            "email": "takahashi@example.com",
            "experience_level": ExperienceLevel.senior,
            "years_of_experience": 8,
            "ai_specialties": ["Recommendation", "NLP"],
            "preferred_frameworks": ["TensorFlow", "scikit-learn", "Python"],
            "desired_salary_min": 900,
            "desired_salary_max": 1300,
            "desired_work_style": "onsite",
            "bio": "ECサイトの推薦エンジン開発。A/Bテスト設計からデプロイまで。",
            "current_company": "大手EC",
            "current_role": "MLエンジニアリングマネージャー",
        },
    ]
    for ed in engineers_data:
        eng = Engineer(**ed)
        db.add(eng)
    db.flush()

    # 企業（サンプル3社）
    companies_data = [
        {
            "name": "株式会社AIファースト",
            "contact_name": "伊藤 誠",
            "contact_email": "ito@aifirst.example.com",
            "industry": "AI/SaaS",
            "employee_count": 50,
            "description": "LLMを活用したBtoB SaaSプロダクトを開発",
        },
        {
            "name": "メガバンクDX推進部",
            "contact_name": "渡辺 直樹",
            "contact_email": "watanabe@megabank.example.com",
            "industry": "金融",
            "employee_count": 30000,
            "description": "金融業界のDX推進。AI審査モデル・不正検知を内製化中",
        },
        {
            "name": "ロボティクスラボ株式会社",
            "contact_name": "小林 恵",
            "contact_email": "kobayashi@robotics.example.com",
            "industry": "製造/ロボティクス",
            "employee_count": 120,
            "description": "産業用ロボットのAI制御システムを開発",
        },
    ]
    companies = []
    for cd in companies_data:
        comp = Company(**cd)
        db.add(comp)
        companies.append(comp)
    db.flush()

    # 求人案件
    postings_data = [
        {
            "company": companies[0],
            "title": "LLMアプリケーションエンジニア",
            "description": "RAGベースのBtoB SaaSプロダクト開発。LangChain/LlamaIndexを使った検索拡張生成の設計・実装。",
            "experience_level_min": ExperienceLevel.mid,
            "salary_min": 700, "salary_max": 1200,
            "work_style": "remote",
            "ai_domain": ["LLM", "NLP"],
            "tech_stack": ["Python", "LangChain", "PyTorch", "AWS"],
        },
        {
            "company": companies[1],
            "title": "AI審査モデル開発エンジニア",
            "description": "与信審査AIモデルの開発・改善。説明可能AIの導入。大規模データパイプラインの構築。",
            "experience_level_min": ExperienceLevel.senior,
            "salary_min": 900, "salary_max": 1500,
            "work_style": "hybrid",
            "ai_domain": ["NLP", "MLOps"],
            "tech_stack": ["Python", "TensorFlow", "scikit-learn", "GCP"],
        },
        {
            "company": companies[2],
            "title": "画像認識エンジニア（ロボット制御）",
            "description": "産業用ロボットのリアルタイム画像認識。物体検出・セグメンテーションの高速推論。",
            "experience_level_min": ExperienceLevel.mid,
            "salary_min": 600, "salary_max": 1000,
            "work_style": "onsite",
            "ai_domain": ["Computer Vision"],
            "tech_stack": ["Python", "PyTorch", "OpenCV", "Docker"],
        },
    ]
    for pd in postings_data:
        comp = pd.pop("company")
        posting = JobPosting(company_id=comp.id, **pd)
        db.add(posting)

    db.commit()
    db.close()
    print("✅ シードデータ投入完了（エンジニア5名、企業3社、求人3件）")


if __name__ == "__main__":
    main()

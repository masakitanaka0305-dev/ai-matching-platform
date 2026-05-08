"""Railway用起動スクリプト"""
import os
import subprocess
import sys

# テーブル作成
subprocess.run([sys.executable, "init_db.py"])

# uvicorn起動（Railway の PORT 環境変数を使用）
port = os.environ.get("PORT", "8000")
os.execvp("uvicorn", ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", port])

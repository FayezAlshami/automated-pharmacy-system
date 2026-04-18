import sqlite3
import os

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# مسار قاعدة البيانات: LOL.db موجودة في المجلد الأب (خارج backend/)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'LOL.db')


def get_db() -> sqlite3.Connection:
    """
    إنشاء اتصال بقاعدة البيانات SQLite.
    - row_factory = sqlite3.Row يجعل النتائج قابلة للوصول كـ dict
    - PRAGMA foreign_keys = ON لتفعيل قيود العلاقات الخارجية
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

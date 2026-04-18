"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
migrate.py — ترحيل قاعدة البيانات
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
يُشغَّل مرة واحدة فقط قبل تشغيل الباك اند.
يضيف الأعمدة المفقودة ويعيد بناء جدول orders
لدعم حالة 'review' وربط العمليات بالمرضى.

التشغيل:
    cd backend
    python migrate.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import sqlite3
import os

# مسار قاعدة البيانات
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'LOL.db')


def column_exists(cursor: sqlite3.Cursor, table: str, column: str) -> bool:
    """التحقق من وجود عمود معين في جدول معين"""
    cursor.execute(f"PRAGMA table_info({table})")
    columns = [row[1] for row in cursor.fetchall()]
    return column in columns


def add_column_if_missing(cursor: sqlite3.Cursor, table: str, column: str, definition: str) -> None:
    """إضافة عمود للجدول إذا لم يكن موجوداً"""
    if not column_exists(cursor, table, column):
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")
        print(f"  ✅ أُضيف العمود '{column}' إلى جدول '{table}'")
    else:
        print(f"  ⏭️  العمود '{column}' موجود مسبقاً في '{table}'")


def migrate_doctors(cursor: sqlite3.Cursor) -> None:
    """إضافة الأعمدة المفقودة لجدول doctors"""
    print("\n[1/6] ترحيل جدول doctors ...")
    add_column_if_missing(cursor, "doctors", "specialty",       "TEXT DEFAULT ''")
    add_column_if_missing(cursor, "doctors", "clinic_name",     "TEXT DEFAULT ''")
    add_column_if_missing(cursor, "doctors", "license_number",  "TEXT DEFAULT ''")
    # حالة الحساب: pending → active → rejected
    add_column_if_missing(cursor, "doctors", "status",          "TEXT DEFAULT 'active'")


def migrate_drug_category(cursor: sqlite3.Cursor) -> None:
    """إضافة الأعمدة المفقودة لجدول drug_category"""
    print("\n[2/6] ترحيل جدول drug_category ...")
    add_column_if_missing(cursor, "drug_category", "slug",           "TEXT DEFAULT ''")
    add_column_if_missing(cursor, "drug_category", "description_ar", "TEXT DEFAULT ''")
    add_column_if_missing(cursor, "drug_category", "description_en", "TEXT DEFAULT ''")
    add_column_if_missing(cursor, "drug_category", "icon",           "TEXT DEFAULT 'pill'")
    add_column_if_missing(cursor, "drug_category", "accent",         "TEXT DEFAULT '#009EDB'")


def migrate_drugs(cursor: sqlite3.Cursor) -> None:
    """إضافة الأعمدة المفقودة لجدول drugs"""
    print("\n[3/6] ترحيل جدول drugs ...")
    add_column_if_missing(cursor, "drugs", "scientific_name", "TEXT DEFAULT ''")
    add_column_if_missing(cursor, "drugs", "dosage",          "TEXT DEFAULT ''")
    add_column_if_missing(cursor, "drugs", "description",     "TEXT DEFAULT ''")
    # warnings: JSON array مخزّن كنص
    add_column_if_missing(cursor, "drugs", "warnings",        "TEXT DEFAULT '[]'")
    add_column_if_missing(cursor, "drugs", "is_popular",      "INTEGER DEFAULT 0")
    add_column_if_missing(cursor, "drugs", "is_featured",     "INTEGER DEFAULT 0")


def migrate_company_drug(cursor: sqlite3.Cursor) -> None:
    """إضافة عمود البلد لجدول company_drug"""
    print("\n[4/6] ترحيل جدول company_drug ...")
    add_column_if_missing(cursor, "company_drug", "country", "TEXT DEFAULT ''")


def migrate_orders(conn: sqlite3.Connection, cursor: sqlite3.Cursor) -> None:
    """
    إعادة بناء جدول orders لدعم:
    - حالة 'review' ضمن CHECK constraint
    - عمود operation_id لربط الطلبات بعمليات المرضى
    """
    print("\n[5/6] ترحيل جدول orders ...")

    # التحقق من وجود العمود operation_id أولاً
    op_id_exists = column_exists(cursor, "orders", "operation_id")

    # قراءة البيانات الحالية من orders قبل حذفه
    cursor.execute("SELECT * FROM orders")
    old_rows = cursor.fetchall()
    old_cols = [d[0] for d in cursor.description] if cursor.description else []
    print(f"  📦 تم حفظ {len(old_rows)} صف من orders قبل الترحيل")

    # إيقاف تفعيل المفاتيح الخارجية مؤقتاً لتجنب أخطاء الحذف
    conn.execute("PRAGMA foreign_keys = OFF")

    # إنشاء الجدول الجديد بالـ CHECK المحدّث
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders_new (
            order_id    INTEGER PRIMARY KEY AUTOINCREMENT,
            doctor_id   INTEGER REFERENCES doctors(doctor_id),
            patient_id  INTEGER REFERENCES company_patients(patient_id),
            operation_id TEXT UNIQUE,
            status      TEXT NOT NULL DEFAULT 'pending'
                        CHECK(status IN ('pending','success','rejected','review')),
            total_price REAL DEFAULT 0,
            is_pay      INTEGER DEFAULT 0,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # نسخ البيانات القديمة مع معالجة الأعمدة المفقودة
    for row in old_rows:
        row_dict = dict(zip(old_cols, row))
        # تصحيح قيمة status إذا كانت غير مدعومة
        status = row_dict.get("status", "pending")
        if status not in ("pending", "success", "rejected", "review"):
            status = "pending"

        cursor.execute("""
            INSERT OR IGNORE INTO orders_new
                (order_id, doctor_id, patient_id, operation_id,
                 status, total_price, is_pay, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            row_dict.get("order_id"),
            row_dict.get("doctor_id"),
            row_dict.get("patient_id"),
            row_dict.get("operation_id") if op_id_exists else None,
            status,
            row_dict.get("total_price", 0),
            row_dict.get("is_pay", 0),
            row_dict.get("created_at"),
            row_dict.get("updated_at"),
        ))

    # حذف الجدول القديم واستبداله بالجديد
    cursor.execute("DROP TABLE orders")
    cursor.execute("ALTER TABLE orders_new RENAME TO orders")

    # إعادة تفعيل المفاتيح الخارجية
    conn.execute("PRAGMA foreign_keys = ON")
    print("  ✅ تم إعادة بناء جدول orders بنجاح")


def migrate_company_patients(cursor: sqlite3.Cursor) -> None:
    """التأكد من وجود عمود created_at في company_patients"""
    print("\n[6/6] ترحيل جدول company_patients ...")
    add_column_if_missing(cursor, "company_patients", "created_at",
                          "DATETIME DEFAULT CURRENT_TIMESTAMP")


def run():
    """تشغيل جميع خطوات الترحيل"""
    print("=" * 52)
    print("  بدء ترحيل قاعدة البيانات LOL.db")
    print("=" * 52)

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        migrate_doctors(cursor)
        migrate_drug_category(cursor)
        migrate_drugs(cursor)
        migrate_company_drug(cursor)
        migrate_orders(conn, cursor)
        migrate_company_patients(cursor)

        conn.commit()
        print("\n" + "=" * 52)
        print("  ✅ تم الترحيل بنجاح — يمكنك الآن تشغيل seed_data.py")
        print("=" * 52)
    except Exception as e:
        conn.rollback()
        print(f"\n❌ خطأ أثناء الترحيل: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    run()

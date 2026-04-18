"""
تهيئة قاعدة البيانات وإنشاء الجداول لمشروع الصيدلية المؤتمتة
SQLite Schema Setup
"""

import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

DBNAME = "LOL.db"


def setup_database(db_name=DBNAME):
    conn = None
    try:
        conn = sqlite3.connect(db_name)
        cursor = conn.cursor()

        # تفعيل العلاقات الخارجية بـ SQLite
        cursor.execute("PRAGMA foreign_keys = ON;")

        # =====================================================================
        # 1) جدول الأطباء
        # =====================================================================
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS doctors (
            doctor_id INTEGER PRIMARY KEY AUTOINCREMENT,
            fname TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'doctor' CHECK(role IN ('doctor', 'admin', 'assistant')),
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP

            -- doctor_id: رقم الطبيب داخل النظام - مثال: 1
            -- fname: اسم الطبيب - مثال: "د. أحمد علي"
            -- email: ايميل الطبيب - مثال: "ahmad@hospital.com"
            -- phone: رقم موبايل الطبيب - مثال: "0999123456"
            -- password: كلمة المرور المشفرة أو النصية مؤقتاً - مثال: "hashed_password_123"
            -- role: صلاحية المستخدم - مثال: "doctor"
            -- updated_at: آخر وقت صار فيه تعديل - مثال: "2026-03-13 10:22:00"
            -- created_at: وقت إنشاء الحساب - مثال: "2026-03-13 09:00:00"
        )
        ''')
        print("✅ doctors table created.")

        # =====================================================================
        # 2) جدول تصنيفات الأدوية
        # =====================================================================
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS drug_category (
            category_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name_category TEXT NOT NULL UNIQUE

            -- category_id: رقم التصنيف - مثال: 1
            -- name_category: اسم التصنيف - مثال: "ضغط وقلب" أو "أطفال" أو "نسائية"
        )
        ''')
        print("✅ drug_category table created.")

        # =====================================================================
        # 3) جدول الشركات المصنعة للأدوية
        # =====================================================================
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS company_drug (
            company_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name_company TEXT NOT NULL,
            category_id INTEGER NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(name_company, category_id),
            FOREIGN KEY (category_id) REFERENCES drug_category(category_id)
                ON UPDATE CASCADE
                ON DELETE RESTRICT

            -- company_id: رقم الشركة - مثال: 1
            -- name_company: اسم الشركة المصنعة - مثال: "Asia" أو "BPI"
            -- category_id: التصنيف المرتبط فيها الشركة - مثال: 2
            -- created_at: وقت إضافة الشركة - مثال: "2026-03-13 11:00:00"
        )
        ''')
        print("✅ company_drug table created.")

        # =====================================================================
        # 4) جدول الأدوية
        # =====================================================================
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS drugs (
            drug_id INTEGER PRIMARY KEY AUTOINCREMENT,
            dname TEXT NOT NULL,
            category_id INTEGER NOT NULL,
            company_id INTEGER NOT NULL,
            price REAL NOT NULL CHECK(price >= 0),
            amount INTEGER NOT NULL CHECK(amount >= 0),
            pin INTEGER NOT NULL CHECK(pin > 0),
            machine_column INTEGER NOT NULL CHECK(machine_column > 0),
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(pin, machine_column),
            FOREIGN KEY (category_id) REFERENCES drug_category(category_id)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,
            FOREIGN KEY (company_id) REFERENCES company_drug(company_id)
                ON UPDATE CASCADE
                ON DELETE RESTRICT

            -- drug_id: رقم الدواء - مثال: 1
            -- dname: الاسم التجاري للدواء - مثال: "Panadol"
            -- category_id: رقم تصنيف الدواء - مثال: 3
            -- company_id: رقم الشركة المصنعة - مثال: 2
            -- price: سعر حبة/علبة الدواء حسب اعتمادك - مثال: 2500.50
            -- amount: الكمية المتوفرة بالمخزن أو بالماكينة - مثال: 40
            -- pin: رقم الرف أو الخانة الرئيسية - مثال: 5
            -- machine_column: رقم العمود داخل الماكينة - مثال: 2
            -- created_at: وقت إضافة الدواء - مثال: "2026-03-13 12:15:00"
        )
        ''')
        print("✅ drugs table created.")

        # =====================================================================
        # 5) جدول الطلبات
        # =====================================================================
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            order_id INTEGER PRIMARY KEY AUTOINCREMENT,
            doctor_id INTEGER,
            status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'rejected', 'success')),
            total_price REAL NOT NULL DEFAULT 0 CHECK(total_price >= 0),
            is_pay INTEGER NOT NULL DEFAULT 0 CHECK(is_pay IN (0, 1)),
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
                ON UPDATE CASCADE
                ON DELETE SET NULL

            -- order_id: رقم الطلب - مثال: 1001
            -- doctor_id: رقم الطبيب يلي أنشأ الطلب - مثال: 4
            -- status: حالة الطلب - مثال: "pending" أو "success" أو "rejected"
            -- total_price: السعر الإجمالي للطلب - مثال: 12500
            -- is_pay: هل اندفع الطلب أو لا - مثال: 1 يعني اندفع / 0 يعني لا
            -- created_at: وقت إنشاء الطلب - مثال: "2026-03-13 13:00:00"
            -- updated_at: آخر تحديث للطلب - مثال: "2026-03-13 13:10:00"
        )
        ''')
        print("✅ orders table created.")

        # =====================================================================
        # 6) جدول تفاصيل الطلب
        # =====================================================================
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS details_order (
            order_detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            drug_id INTEGER NOT NULL,
            number_of_drug INTEGER NOT NULL CHECK(number_of_drug > 0),
            price_of_one_drug REAL NOT NULL CHECK(price_of_one_drug >= 0),
            FOREIGN KEY (order_id) REFERENCES orders(order_id)
                ON UPDATE CASCADE
                ON DELETE CASCADE,
            FOREIGN KEY (drug_id) REFERENCES drugs(drug_id)
                ON UPDATE CASCADE
                ON DELETE RESTRICT

            -- order_detail_id: رقم سطر التفاصيل - مثال: 1
            -- order_id: رقم الطلب الأساسي - مثال: 1001
            -- drug_id: رقم الدواء المطلوب - مثال: 7
            -- number_of_drug: عدد الوحدات المطلوبة من هاد الدواء - مثال: 2
            -- price_of_one_drug: سعر القطعة الواحدة وقت الطلب - مثال: 3000
        )
        ''')
        print("✅ details_order table created.")

        # =====================================================================
        # 7) جدول مرضى الشركة / المستفيدين
        # =====================================================================
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS company_patients (
            patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name_of_patients TEXT NOT NULL,
            nid TEXT NOT NULL UNIQUE,
            company_patients TEXT NOT NULL,
            hash_password TEXT NOT NULL,
            operation_id TEXT UNIQUE,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP

            -- patient_id: رقم المريض داخل النظام - مثال: 1
            -- name_of_patients: اسم المريض - مثال: "محمد خالد"
            -- nid: الرقم الوطني أو رقم الهوية - مثال: "12345678901"
            -- company_patients: اسم الشركة أو الجهة التابعة إلها المريض - مثال: "شركة الاتصالات"
            -- hash_password: كلمة مرور أو رمز مشفر للمريض - مثال: "a8f9c1b2..."
            -- operation_id: رقم العملية أو الكود المرتبط بطلبه - مثال: "OP-2026-00015"
            -- created_at: وقت إضافة المريض - مثال: "2026-03-13 14:00:00"
        )
        ''')
        print("✅ company_patients table created.")

        conn.commit()
        print("🎉 Database setup completed successfully!")

    except sqlite3.Error as e:
        print(f"❌ Error during database setup: {e}")

    finally:
        if conn:
            conn.close()
            print("🔒 Connection closed.")


# ============================================================================
# Main Execution
# ============================================================================
if __name__ == "__main__":
    setup_database()
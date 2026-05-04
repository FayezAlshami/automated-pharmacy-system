"""
تهيئة قاعدة البيانات لوضع اختبار الإلكترون فقط.

ينظّف بيانات الأدوية/الطلبات/المرضى، ثم يبني 4 أدوية فقط
مربوطة صراحةً بالكبائن الأربع الحالية في ESP32.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

from utils.auth import hash_password


ROOT_DIR = Path(__file__).resolve().parent.parent
DB_PATH = ROOT_DIR / "LOL.db"


DEMO_CATEGORY = {
    "category_id": 1,
    "name_category": "أدوية اختبار الإلكترون",
    "slug": "electronics-demo",
    "description_ar": "أصناف اختبار مخصصة لتجربة ربط الموقع مع ESP32.",
    "description_en": "Electronics demo drugs for the ESP32 workflow.",
    "icon": "pill",
    "accent": "#009EDB",
}

DEMO_COMPANY = {
    "company_id": 1,
    "name_company": "مختبر الصرف التجريبي",
    "category_id": 1,
    "country": "Syria",
}

DEMO_DRUGS = [
    {
        "drug_id": 1,
        "dname": "باراسيتامول 500mg",
        "scientific_name": "Paracetamol",
        "dosage": "500mg",
        "price": 0,
        "amount": 20,
        "pin": 27,
        "machine_column": "A1",
        "cabinet_id": 1,
        "motor_pin": 27,
        "ir_pin": 34,
    },
    {
        "drug_id": 2,
        "dname": "إيبوبروفين 400mg",
        "scientific_name": "Ibuprofen",
        "dosage": "400mg",
        "price": 0,
        "amount": 20,
        "pin": 12,
        "machine_column": "A2",
        "cabinet_id": 2,
        "motor_pin": 12,
        "ir_pin": 35,
    },
    {
        "drug_id": 3,
        "dname": "أموكسيسيلين 500mg",
        "scientific_name": "Amoxicillin",
        "dosage": "500mg",
        "price": 0,
        "amount": 20,
        "pin": 21,
        "machine_column": "A3",
        "cabinet_id": 3,
        "motor_pin": 21,
        "ir_pin": 36,
    },
    {
        "drug_id": 4,
        "dname": "فيتامين C 1000mg",
        "scientific_name": "Vitamin C",
        "dosage": "1000mg",
        "price": 0,
        "amount": 20,
        "pin": 22,
        "machine_column": "A4",
        "cabinet_id": 4,
        "motor_pin": 22,
        "ir_pin": 39,
    },
]

DEMO_PATIENTS = [
    {
        "patient_id": 1,
        "name_of_patients": "اختبار الكبينة 1",
        "nid": "ELEC-PAT-001",
        "company_patients": "اختبار الإلكترون",
        "hash_password": "demo-patient-001",
        "operation_id": "OP-CAB-1",
    },
    {
        "patient_id": 2,
        "name_of_patients": "اختبار الكبينة 2",
        "nid": "ELEC-PAT-002",
        "company_patients": "اختبار الإلكترون",
        "hash_password": "demo-patient-002",
        "operation_id": "OP-CAB-2",
    },
    {
        "patient_id": 3,
        "name_of_patients": "اختبار الكبينة 3",
        "nid": "ELEC-PAT-003",
        "company_patients": "اختبار الإلكترون",
        "hash_password": "demo-patient-003",
        "operation_id": "OP-CAB-3",
    },
    {
        "patient_id": 4,
        "name_of_patients": "اختبار الكبينة 4",
        "nid": "ELEC-PAT-004",
        "company_patients": "اختبار الإلكترون",
        "hash_password": "demo-patient-004",
        "operation_id": "OP-CAB-4",
    },
]

DEMO_ORDERS = [
    {"order_id": 101, "doctor_id": 1, "patient_id": 1, "operation_id": "OP-CAB-1"},
    {"order_id": 102, "doctor_id": 1, "patient_id": 2, "operation_id": "OP-CAB-2"},
    {"order_id": 103, "doctor_id": 1, "patient_id": 3, "operation_id": "OP-CAB-3"},
    {"order_id": 104, "doctor_id": 1, "patient_id": 4, "operation_id": "OP-CAB-4"},
]

DEMO_ORDER_DETAILS = [
    {"order_detail_id": 1001, "order_id": 101, "drug_id": 1},
    {"order_detail_id": 1002, "order_id": 102, "drug_id": 2},
    {"order_detail_id": 1003, "order_id": 103, "drug_id": 3},
    {"order_detail_id": 1004, "order_id": 104, "drug_id": 4},
]


def _reset_sequences(conn: sqlite3.Connection) -> None:
    conn.execute("DELETE FROM sqlite_sequence WHERE name IN ('drug_category', 'company_drug', 'drugs', 'company_patients', 'orders', 'details_order')")
    conn.execute("INSERT INTO sqlite_sequence(name, seq) VALUES ('drug_category', 1)")
    conn.execute("INSERT INTO sqlite_sequence(name, seq) VALUES ('company_drug', 1)")
    conn.execute("INSERT INTO sqlite_sequence(name, seq) VALUES ('drugs', 4)")
    conn.execute("INSERT INTO sqlite_sequence(name, seq) VALUES ('company_patients', 4)")
    conn.execute("INSERT INTO sqlite_sequence(name, seq) VALUES ('orders', 104)")
    conn.execute("INSERT INTO sqlite_sequence(name, seq) VALUES ('details_order', 1004)")


def reset_database() -> None:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")

    try:
        with conn:
            conn.execute("DELETE FROM details_order")
            conn.execute("DELETE FROM orders")
            conn.execute("DELETE FROM company_patients")
            conn.execute("DELETE FROM drugs")
            conn.execute("DELETE FROM company_drug")
            conn.execute("DELETE FROM drug_category")

            conn.execute(
                """
                INSERT INTO drug_category(category_id, name_category, slug, description_ar, description_en, icon, accent)
                VALUES (:category_id, :name_category, :slug, :description_ar, :description_en, :icon, :accent)
                """,
                DEMO_CATEGORY,
            )
            conn.execute(
                """
                INSERT INTO company_drug(company_id, name_company, category_id, country)
                VALUES (:company_id, :name_company, :category_id, :country)
                """,
                DEMO_COMPANY,
            )

            for drug in DEMO_DRUGS:
                conn.execute(
                    """
                    INSERT INTO drugs(
                        drug_id, dname, category_id, company_id, price, amount, pin, machine_column,
                        scientific_name, dosage, description, warnings, is_popular, is_featured
                    )
                    VALUES(
                        :drug_id, :dname, 1, 1, :price, :amount, :pin, :machine_column,
                        :scientific_name, :dosage, '', '[]', 0, 0
                    )
                    """,
                    drug,
                )

            for patient in DEMO_PATIENTS:
                conn.execute(
                    """
                    INSERT INTO company_patients(
                        patient_id, name_of_patients, nid, company_patients, hash_password, operation_id
                    )
                    VALUES(
                        :patient_id, :name_of_patients, :nid, :company_patients, :hash_password, :operation_id
                    )
                    """,
                    patient,
                )

            for order in DEMO_ORDERS:
                conn.execute(
                    """
                    INSERT INTO orders(
                        order_id, doctor_id, patient_id, operation_id, status, total_price, is_pay
                    )
                    VALUES(
                        :order_id, :doctor_id, :patient_id, :operation_id, 'pending', 0, 1
                    )
                    """,
                    order,
                )

            for detail in DEMO_ORDER_DETAILS:
                conn.execute(
                    """
                    INSERT INTO details_order(
                        order_detail_id, order_id, drug_id, number_of_drug, price_of_one_drug
                    )
                    VALUES(
                        :order_detail_id, :order_id, :drug_id, 1, 0
                    )
                    """,
                    detail,
                )

            conn.execute(
                """
                UPDATE doctors
                SET fname = ?, email = ?, phone = ?, role = ?, password = ?, updated_at = CURRENT_TIMESTAMP
                WHERE doctor_id = 5
                """,
                (
                    "مدير النظام",
                    "admin@pharmacy.test",
                    "+963-11-9910005",
                    "admin",
                    hash_password("admin123"),
                ),
            )
            conn.execute(
                """
                UPDATE doctors
                SET fname = ?, email = ?, phone = ?, role = ?, password = ?, updated_at = CURRENT_TIMESTAMP
                WHERE doctor_id = 8
                """,
                (
                    "مدير الصيدلية",
                    "admin@admin.com",
                    "+963-11-9910008",
                    "admin",
                    hash_password("admin123"),
                ),
            )
            conn.execute(
                """
                UPDATE doctors
                SET fname = ?, email = ?, phone = ?, role = ?, password = ?, updated_at = CURRENT_TIMESTAMP
                WHERE doctor_id = 10
                """,
                (
                    "صيدلي الاختبار",
                    "pharmacist@admin.com",
                    "+963-11-9910010",
                    "assistant",
                    hash_password("pharm123"),
                ),
            )
            conn.execute(
                """
                UPDATE doctors
                SET password = ?, updated_at = CURRENT_TIMESTAMP
                WHERE doctor_id = 1
                """,
                (hash_password("doctor123"),),
            )

            _reset_sequences(conn)
    finally:
        conn.close()


if __name__ == "__main__":
    reset_database()
    print("Electronics demo database reset completed.")

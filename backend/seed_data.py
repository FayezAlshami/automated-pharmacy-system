"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
seed_data.py — ملء قاعدة البيانات ببيانات واقعية
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
يملأ الداتابيس بـ:
  - 12 تصنيف دوائي
  - 12 شركة أدوية
  - 96 دواء (8 لكل تصنيف)
  - 4 أطباء + 1 مدير
  - 7 مرضى مع عمليات حقيقية
  - 7 طلبات مرتبطة بالمرضى
  - 6 طلبات للأطباء

يُشغَّل بعد migrate.py:
    cd backend
    python seed_data.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import sqlite3
import json
import os
import sys

# استيراد دالة التشفير
sys.path.insert(0, os.path.dirname(__file__))
from utils.auth import hash_password

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'LOL.db')


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# بيانات التصنيفات الدوائية (12 تصنيف)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORIES = [
    {
        "name_category": "مسكنات الألم",
        "slug": "analgesics",
        "description_ar": "أدوية تُستخدم لتخفيف الألم الخفيف إلى الشديد",
        "description_en": "Medications used to relieve mild to severe pain",
        "icon": "activity",
        "accent": "#F44336",
    },
    {
        "name_category": "أدوية السكري",
        "slug": "diabetes",
        "description_ar": "أدوية التحكم في مستوى السكر في الدم",
        "description_en": "Medications for blood sugar control",
        "icon": "droplet",
        "accent": "#009EDB",
    },
    {
        "name_category": "أدوية القلب",
        "slug": "cardio",
        "description_ar": "أدوية لأمراض القلب والأوعية الدموية",
        "description_en": "Cardiovascular medications",
        "icon": "heart",
        "accent": "#F44336",
    },
    {
        "name_category": "مضادات حيوية",
        "slug": "antibiotics",
        "description_ar": "أدوية لعلاج الالتهابات البكتيرية",
        "description_en": "Antibacterial treatment medications",
        "icon": "shield",
        "accent": "#4CAF50",
    },
    {
        "name_category": "أدوية الأطفال",
        "slug": "pediatrics",
        "description_ar": "أدوية مخصصة للأطفال والرضع",
        "description_en": "Medications for children and infants",
        "icon": "baby",
        "accent": "#4FC3F7",
    },
    {
        "name_category": "فيتامينات ومكملات",
        "slug": "vitamins",
        "description_ar": "فيتامينات ومكملات غذائية لدعم الصحة العامة",
        "description_en": "Vitamins and dietary supplements",
        "icon": "sun",
        "accent": "#FFC107",
    },
    {
        "name_category": "الجهاز الهضمي",
        "slug": "digestive",
        "description_ar": "أدوية علاج اضطرابات الجهاز الهضمي",
        "description_en": "Digestive system medications",
        "icon": "zap",
        "accent": "#00BFA6",
    },
    {
        "name_category": "صحة المرأة",
        "slug": "womens-health",
        "description_ar": "أدوية خاصة بصحة المرأة والأمومة",
        "description_en": "Women's health medications",
        "icon": "user",
        "accent": "#E91E63",
    },
    {
        "name_category": "الأمراض الجلدية",
        "slug": "dermatology",
        "description_ar": "أدوية علاج الأمراض والاضطرابات الجلدية",
        "description_en": "Dermatological medications",
        "icon": "layers",
        "accent": "#FF9800",
    },
    {
        "name_category": "الجهاز التنفسي",
        "slug": "respiratory",
        "description_ar": "أدوية علاج أمراض الجهاز التنفسي",
        "description_en": "Respiratory medications",
        "icon": "wind",
        "accent": "#009EDB",
    },
    {
        "name_category": "الجهاز العصبي",
        "slug": "neurology",
        "description_ar": "أدوية علاج أمراض الجهاز العصبي",
        "description_en": "Neurological medications",
        "icon": "cpu",
        "accent": "#7C4DFF",
    },
    {
        "name_category": "الحساسية",
        "slug": "allergy",
        "description_ar": "أدوية علاج الحساسية والأعراض المصاحبة",
        "description_en": "Allergy medications",
        "icon": "alert-circle",
        "accent": "#FF6F00",
    },
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# بيانات الشركات (12 شركة — واحدة لكل تصنيف)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPANIES = [
    {"name_company": "Nova Health",    "country": "Germany"},        # analgesics
    {"name_company": "EndoCare",       "country": "Switzerland"},    # diabetes
    {"name_company": "CardioLab",      "country": "France"},         # cardio
    {"name_company": "Pure Pharma",    "country": "Jordan"},         # antibiotics
    {"name_company": "BabyCare Plus",  "country": "Netherlands"},    # pediatrics
    {"name_company": "Sun Care",       "country": "Netherlands"},    # vitamins
    {"name_company": "DigestWell",     "country": "UAE"},            # digestive
    {"name_company": "FeminaRx",       "country": "Spain"},          # womens-health
    {"name_company": "DermaCore",      "country": "Italy"},          # dermatology
    {"name_company": "Respira",        "country": "UK"},             # respiratory
    {"name_company": "NeuroLine",      "country": "Belgium"},        # neurology
    {"name_company": "Allergy Plus",   "country": "Turkey"},         # allergy
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# بيانات الأدوية (8 لكل تصنيف = 96 دواء)
# الترتيب يطابق CATEGORIES أعلاه (category_index 0..11)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DRUGS_BY_CATEGORY = [
    # [0] مسكنات الألم — Nova Health
    [
        {"dname": "باراسيتامول", "scientific_name": "Paracetamol", "dosage": "500mg",
         "price": 12400, "amount": 120, "pin": "1234", "machine_column": "A1",
         "description": "مسكن للألم وخافض للحرارة. يُستخدم لعلاج الصداع وآلام العضلات.",
         "warnings": ["يراعى تناوله بعد الطعام عند الحاجة.", "لا تتجاوز الجرعة اليومية الموصى بها."],
         "is_popular": 1, "is_featured": 1},
        {"dname": "إيبوبروفين", "scientific_name": "Ibuprofen", "dosage": "400mg",
         "price": 15600, "amount": 85, "pin": "2345", "machine_column": "A2",
         "description": "مضاد للالتهاب ومسكن للألم.",
         "warnings": ["يُؤخذ مع الطعام لتجنب تهيج المعدة.", "تحقق من التداخل مع مضادات التخثر."],
         "is_popular": 1, "is_featured": 0},
        {"dname": "ديكلوفيناك", "scientific_name": "Diclofenac", "dosage": "50mg",
         "price": 18900, "amount": 60, "pin": "3456", "machine_column": "A3",
         "description": "مضاد للالتهاب غير ستيرويدي.",
         "warnings": ["يُستخدم لفترات قصيرة فقط.", "قد يرفع ضغط الدم عند الاستخدام المطوّل."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "ترامادول", "scientific_name": "Tramadol", "dosage": "50mg",
         "price": 24500, "amount": 40, "pin": "4567", "machine_column": "A4",
         "description": "مسكن ألم أفيوني خفيف للألم الشديد.",
         "warnings": ["قد يسبب النعاس والدوخة.", "لا يُعطى للأطفال دون 12 سنة."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "كيتوبروفين", "scientific_name": "Ketoprofen", "dosage": "100mg",
         "price": 21200, "amount": 50, "pin": "5678", "machine_column": "A5",
         "description": "مضاد للالتهاب قوي لآلام المفاصل.",
         "warnings": ["يُؤخذ مع وجبة كاملة."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "نابروكسين", "scientific_name": "Naproxen", "dosage": "250mg",
         "price": 16800, "amount": 70, "pin": "6789", "machine_column": "A6",
         "description": "مسكن ألم مضاد للالتهاب طويل الأمد.",
         "warnings": ["تجنب الاستخدام مع الأسبرين."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "أسبرين", "scientific_name": "Aspirin", "dosage": "100mg",
         "price": 8500, "amount": 150, "pin": "7890", "machine_column": "A7",
         "description": "مضاد للتخثر وخافض للحرارة.",
         "warnings": ["لا يُعطى للأطفال دون 16 سنة.", "يمنع استخدامه في القرحة الهضمية."],
         "is_popular": 1, "is_featured": 0},
        {"dname": "بروبوفول", "scientific_name": "Propofol", "dosage": "200mg",
         "price": 45000, "amount": 20, "pin": "8901", "machine_column": "A8",
         "description": "مخدر وريدي يُستخدم للتخدير قصير الأمد.",
         "warnings": ["يُستخدم فقط تحت إشراف طبي متخصص."],
         "is_popular": 0, "is_featured": 0},
    ],
    # [1] أدوية السكري — EndoCare
    [
        {"dname": "ميتفورمين", "scientific_name": "Metformin", "dosage": "850mg",
         "price": 14200, "amount": 100, "pin": "1111", "machine_column": "B1",
         "description": "خافض للسكر من الجيل الأول. الدواء الأول لعلاج سكري النوع الثاني.",
         "warnings": ["يُؤخذ مع الطعام.", "راقب وظائف الكلى بانتظام."],
         "is_popular": 1, "is_featured": 1},
        {"dname": "أنسولين سريع المفعول", "scientific_name": "Insulin Lispro", "dosage": "FlexPen 100IU/ml",
         "price": 68000, "amount": 30, "pin": "2222", "machine_column": "B2",
         "description": "أنسولين سريع المفعول يبدأ بالعمل خلال 15 دقيقة.",
         "warnings": ["يُحفظ في الثلاجة.", "راقب مستوى السكر بعد الحقن."],
         "is_popular": 1, "is_featured": 1},
        {"dname": "غليبنكلاميد", "scientific_name": "Glibenclamide", "dosage": "5mg",
         "price": 11500, "amount": 90, "pin": "3333", "machine_column": "B3",
         "description": "محفز لإفراز الأنسولين من البنكرياس.",
         "warnings": ["قد يسبب نقص السكر عند تأخر الوجبات.", "يُؤخذ قبل الأكل."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "سيتاغليبتين", "scientific_name": "Sitagliptin", "dosage": "100mg",
         "price": 52000, "amount": 45, "pin": "4444", "machine_column": "B4",
         "description": "مثبط DPP-4 لخفض السكر دون تأثير على الوزن.",
         "warnings": ["أبلغ الطبيب عن أي آلام مفاجئة في البطن."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "داباغليفلوزين", "scientific_name": "Dapagliflozin", "dosage": "10mg",
         "price": 78000, "amount": 35, "pin": "5555", "machine_column": "B5",
         "description": "مثبط SGLT2 يُساعد في إفراز السكر عبر البول.",
         "warnings": ["حافظ على الترطيب الكافي.", "قد يزيد خطر عدوى المسالك البولية."],
         "is_popular": 0, "is_featured": 1},
        {"dname": "شرائط فحص السكر", "scientific_name": "Glucose Test Strips", "dosage": "50 strips",
         "price": 32000, "amount": 200, "pin": "6666", "machine_column": "B6",
         "description": "شرائط قياس سكر الدم المنزلي.",
         "warnings": ["استخدم قبل تاريخ الانتهاء."],
         "is_popular": 1, "is_featured": 0},
        {"dname": "إمباغليفلوزين", "scientific_name": "Empagliflozin", "dosage": "10mg",
         "price": 82000, "amount": 28, "pin": "7777", "machine_column": "B7",
         "description": "مثبط SGLT2 بتأثير وقائي على القلب.",
         "warnings": ["يُراقب ضغط الدم أثناء الاستخدام."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "أكاربوز", "scientific_name": "Acarbose", "dosage": "50mg",
         "price": 22000, "amount": 55, "pin": "8888", "machine_column": "B8",
         "description": "مثبط ألفا-غلوكوزيداز يُبطئ امتصاص السكريات.",
         "warnings": ["يُؤخذ مع أول ملعقة من الوجبة."],
         "is_popular": 0, "is_featured": 0},
    ],
    # [2] أدوية القلب — CardioLab
    [
        {"dname": "لوسارتان", "scientific_name": "Losartan", "dosage": "50mg",
         "price": 21500, "amount": 80, "pin": "1122", "machine_column": "C1",
         "description": "حاصر مستقبلات الأنجيوتنسين II لخفض ضغط الدم.",
         "warnings": ["تجنب الحمل أثناء الاستخدام.", "راقب مستوى البوتاسيوم."],
         "is_popular": 1, "is_featured": 0},
        {"dname": "أملوديبين", "scientific_name": "Amlodipine", "dosage": "5mg",
         "price": 18900, "amount": 95, "pin": "2233", "machine_column": "C2",
         "description": "حاصر قنوات الكالسيوم لخفض ضغط الدم وعلاج الذبحة.",
         "warnings": ["قد يسبب تورم القدمين.", "لا تتوقف فجأة عن أخذه."],
         "is_popular": 1, "is_featured": 1},
        {"dname": "أتورفاستاتين", "scientific_name": "Atorvastatin", "dosage": "40mg",
         "price": 31500, "amount": 75, "pin": "3344", "machine_column": "C3",
         "description": "مثبط HMG-CoA للحد من الكوليسترول.",
         "warnings": ["أبلغ الطبيب عن آلام العضلات.", "تجنب الكحول."],
         "is_popular": 1, "is_featured": 0},
        {"dname": "أميودارون", "scientific_name": "Amiodarone", "dosage": "200mg",
         "price": 48000, "amount": 25, "pin": "4455", "machine_column": "C4",
         "description": "مضاد للاضطرابات في ضربات القلب.",
         "warnings": ["يتطلب متابعة دورية لوظائف الغدة الدرقية والرئة."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "ديغوكسين", "scientific_name": "Digoxin", "dosage": "0.25mg",
         "price": 16200, "amount": 60, "pin": "5566", "machine_column": "C5",
         "description": "يُقوي انقباض القلب ويُنظم نبضاته.",
         "warnings": ["نافذة علاجية ضيقة — لا تتجاوز الجرعة المحددة أبداً."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "بيسوبرولول", "scientific_name": "Bisoprolol", "dosage": "5mg",
         "price": 24800, "amount": 65, "pin": "6677", "machine_column": "C6",
         "description": "حاصر بيتا-1 انتقائي لعلاج قصور القلب وارتفاع الضغط.",
         "warnings": ["لا تُوقفه فجأة، قلّله تدريجياً."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "إيناباريل", "scientific_name": "Enalapril", "dosage": "10mg",
         "price": 19600, "amount": 70, "pin": "7788", "machine_column": "C7",
         "description": "مثبط الإنزيم المحوّل للأنجيوتنسين (ACE inhibitor).",
         "warnings": ["قد يسبب سعالاً جافاً مزمناً."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "نيفيديبين", "scientific_name": "Nifedipine", "dosage": "30mg",
         "price": 22100, "amount": 55, "pin": "8899", "machine_column": "C8",
         "description": "حاصر قنوات كالسيوم للذبحة وارتفاع الضغط.",
         "warnings": ["لا تتناول مع عصير الجريب فروت."],
         "is_popular": 0, "is_featured": 0},
    ],
    # [3] مضادات حيوية — Pure Pharma
    [
        {"dname": "أموكسيسيلين", "scientific_name": "Amoxicillin", "dosage": "500mg",
         "price": 16800, "amount": 110, "pin": "1010", "machine_column": "D1",
         "description": "مضاد حيوي واسع الطيف من عائلة البنسيلين.",
         "warnings": ["أكمل الدورة الكاملة.", "أبلغ الطبيب إذا كنت تعاني من حساسية للبنسيلين."],
         "is_popular": 1, "is_featured": 0},
        {"dname": "أزيثرومايسين", "scientific_name": "Azithromycin", "dosage": "500mg",
         "price": 32500, "amount": 65, "pin": "2020", "machine_column": "D2",
         "description": "ماكروليد لعلاج التهابات الجهاز التنفسي والجلد.",
         "warnings": ["يُؤخذ مرة واحدة يومياً لمدة 3 أيام فقط عادةً."],
         "is_popular": 1, "is_featured": 1},
        {"dname": "سيبروفلوكساسين", "scientific_name": "Ciprofloxacin", "dosage": "500mg",
         "price": 28000, "amount": 75, "pin": "3030", "machine_column": "D3",
         "description": "فلوروكينولون لعلاج التهابات المسالك البولية والجهاز الهضمي.",
         "warnings": ["تجنب مع منتجات الألبان.", "يمنع استخدامه للأطفال."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "كلاريثرومايسين", "scientific_name": "Clarithromycin", "dosage": "500mg",
         "price": 38000, "amount": 50, "pin": "4040", "machine_column": "D4",
         "description": "ماكروليد لعلاج التهابات الجيوب والرئة.",
         "warnings": ["يُحفظ بعيداً عن الرطوبة."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "دوكسيسيكلين", "scientific_name": "Doxycycline", "dosage": "100mg",
         "price": 22000, "amount": 80, "pin": "5050", "machine_column": "D5",
         "description": "تتراسيكلين لعلاج التهابات متعددة بما فيها حب الشباب.",
         "warnings": ["تجنب التعرض لأشعة الشمس.", "لا يُعطى لمن هم أقل من 8 سنوات."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "ميترونيدازول", "scientific_name": "Metronidazole", "dosage": "500mg",
         "price": 13500, "amount": 95, "pin": "6060", "machine_column": "D6",
         "description": "مضاد للبكتيريا اللاهوائية والطفيليات.",
         "warnings": ["امتنع عن الكحول تماماً أثناء الاستخدام."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "فانكومايسين", "scientific_name": "Vancomycin", "dosage": "500mg",
         "price": 85000, "amount": 15, "pin": "7070", "machine_column": "D7",
         "description": "مضاد حيوي احتياطي للبكتيريا المقاومة.",
         "warnings": ["يُستخدم فقط في المستشفى تحت إشراف طبي."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "أوميبرازول", "scientific_name": "Omeprazole", "dosage": "20mg",
         "price": 18600, "amount": 120, "pin": "8080", "machine_column": "D8",
         "description": "مثبط مضخة البروتون — يُحمى المعدة أثناء أخذ المضادات الحيوية.",
         "warnings": ["استخدم لأقصر فترة ممكنة."],
         "is_popular": 1, "is_featured": 0},
    ],
    # [4] أدوية الأطفال — BabyCare Plus
    [
        {"dname": "باراسيتامول شراب للأطفال", "scientific_name": "Paracetamol Syrup", "dosage": "120mg/5ml",
         "price": 11000, "amount": 90, "pin": "1001", "machine_column": "E1",
         "description": "خافض حرارة ومسكن ألم للأطفال.",
         "warnings": ["الجرعة حسب وزن الطفل.", "لا تتجاوز 4 جرعات في 24 ساعة."],
         "is_popular": 1, "is_featured": 0},
        {"dname": "إيبوبروفين شراب للأطفال", "scientific_name": "Ibuprofen Suspension", "dosage": "100mg/5ml",
         "price": 14500, "amount": 75, "pin": "2002", "machine_column": "E2",
         "description": "مضاد للالتهاب وخافض حرارة للأطفال.",
         "warnings": ["لا يُعطى للرضع أقل من 3 أشهر."],
         "is_popular": 1, "is_featured": 0},
        {"dname": "أموكسيسيلين معلق للأطفال", "scientific_name": "Amoxicillin Suspension", "dosage": "250mg/5ml",
         "price": 18000, "amount": 60, "pin": "3003", "machine_column": "E3",
         "description": "مضاد حيوي للأطفال بالتهابات الأذن والحلق والجهاز التنفسي.",
         "warnings": ["أكمل الجرعة الكاملة.", "احفظه في الثلاجة بعد التحضير."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "زنك للأطفال", "scientific_name": "Zinc Sulfate", "dosage": "10mg/5ml",
         "price": 9500, "amount": 100, "pin": "4004", "machine_column": "E4",
         "description": "مكمل زنك يُستخدم في علاج الإسهال عند الأطفال.",
         "warnings": ["لا تتجاوز الجرعة الموصى بها."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "سيتريزين شراب", "scientific_name": "Cetirizine Syrup", "dosage": "5mg/5ml",
         "price": 12800, "amount": 80, "pin": "5005", "machine_column": "E5",
         "description": "مضاد للحساسية للأطفال.",
         "warnings": ["قد يسبب النعاس."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "فيتامين D3 قطرات", "scientific_name": "Vitamin D3 Drops", "dosage": "400IU",
         "price": 25000, "amount": 85, "pin": "6006", "machine_column": "E6",
         "description": "مكمل فيتامين D للرضع والأطفال.",
         "warnings": ["الجرعة اليومية فقط حسب التوجيه الطبي."],
         "is_popular": 1, "is_featured": 0},
        {"dname": "بروبيوتيك للأطفال", "scientific_name": "Lactobacillus Reuteri", "dosage": "5 drops",
         "price": 42000, "amount": 55, "pin": "7007", "machine_column": "E7",
         "description": "بكتيريا نافعة لتحسين صحة الجهاز الهضمي.",
         "warnings": ["احفظه في الثلاجة."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "ميلاتونين للأطفال", "scientific_name": "Melatonin", "dosage": "1mg",
         "price": 35000, "amount": 40, "pin": "8008", "machine_column": "E8",
         "description": "لتنظيم النوم عند الأطفال الذين يعانون من اضطرابات النوم.",
         "warnings": ["استشر طبيب الأطفال قبل البدء."],
         "is_popular": 0, "is_featured": 0},
    ],
    # [5] فيتامينات ومكملات — Sun Care
    [
        {"dname": "فيتامين D3", "scientific_name": "Cholecalciferol", "dosage": "1000 IU",
         "price": 25000, "amount": 150, "pin": "1100", "machine_column": "F1",
         "description": "يُعزز امتصاص الكالسيوم وصحة العظام والمناعة.",
         "warnings": ["لا تتجاوز 4000 IU يومياً دون وصف طبي."],
         "is_popular": 1, "is_featured": 1},
        {"dname": "فيتامين C", "scientific_name": "Ascorbic Acid", "dosage": "500mg",
         "price": 12000, "amount": 200, "pin": "2200", "machine_column": "F2",
         "description": "مضاد أكسدة يُعزز المناعة وصحة الجلد.",
         "warnings": ["يمكن أن يسبب اضطرابات هضمية بجرعات عالية."],
         "is_popular": 1, "is_featured": 0},
        {"dname": "فيتامين B12", "scientific_name": "Methylcobalamin", "dosage": "500mcg",
         "price": 28000, "amount": 110, "pin": "3300", "machine_column": "F3",
         "description": "ضروري لصحة الجهاز العصبي وتكوين خلايا الدم.",
         "warnings": ["مناسب للنباتيين الذين قد يعانون من نقصه."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "زنك", "scientific_name": "Zinc Gluconate", "dosage": "15mg",
         "price": 14500, "amount": 130, "pin": "4400", "machine_column": "F4",
         "description": "يُدعم المناعة وشفاء الجروح.",
         "warnings": ["لا يُؤخذ على معدة فارغة."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "أوميغا-3", "scientific_name": "Fish Oil Omega-3", "dosage": "1000mg",
         "price": 45000, "amount": 90, "pin": "5500", "machine_column": "F5",
         "description": "يُحسّن صحة القلب ووظائف الدماغ.",
         "warnings": ["قد يُخفف الدم، أبلغ الطبيب قبل العمليات."],
         "is_popular": 1, "is_featured": 0},
        {"dname": "حمض الفوليك", "scientific_name": "Folic Acid", "dosage": "400mcg",
         "price": 8500, "amount": 180, "pin": "6600", "machine_column": "F6",
         "description": "أساسي للحوامل لتطور الجهاز العصبي للجنين.",
         "warnings": ["يُؤخذ قبل الحمل وطوال الثلث الأول."],
         "is_popular": 1, "is_featured": 0},
        {"dname": "مغنيسيوم", "scientific_name": "Magnesium Citrate", "dosage": "200mg",
         "price": 22000, "amount": 100, "pin": "7700", "machine_column": "F7",
         "description": "يُساعد في الاسترخاء العضلي وجودة النوم.",
         "warnings": ["جرعات عالية قد تسبب إسهالاً."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "حديد + فيتامين C", "scientific_name": "Ferrous Sulfate + Ascorbic Acid", "dosage": "65mg/500mg",
         "price": 19000, "amount": 120, "pin": "8800", "machine_column": "F8",
         "description": "علاج فقر الدم بسبب نقص الحديد.",
         "warnings": ["يُؤخذ على معدة فارغة إن أمكن.", "قد يلوّن البراز."],
         "is_popular": 0, "is_featured": 0},
    ],
    # [6] الجهاز الهضمي — DigestWell
    [
        {"dname": "أوميبرازول 40mg", "scientific_name": "Omeprazole", "dosage": "40mg",
         "price": 22000, "amount": 110, "pin": "1010", "machine_column": "G1",
         "description": "مثبط مضخة البروتون لعلاج الحموضة والقرحة الهضمية.",
         "warnings": ["استخدم لمدة محددة فقط."],
         "is_popular": 1, "is_featured": 1},
        {"dname": "دومبيريدون", "scientific_name": "Domperidone", "dosage": "10mg",
         "price": 15500, "amount": 85, "pin": "2020", "machine_column": "G2",
         "description": "محفز حركية المعدة لعلاج الغثيان.",
         "warnings": ["لا تتجاوز الجرعة اليومية القصوى."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "ميتوكلوبراميد", "scientific_name": "Metoclopramide", "dosage": "10mg",
         "price": 12000, "amount": 90, "pin": "3030", "machine_column": "G3",
         "description": "مضاد غثيان ومحفز حركة المعدة.",
         "warnings": ["الاستخدام المطوّل قد يسبب أعراضاً حركية."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "لاكتولوز", "scientific_name": "Lactulose", "dosage": "10g/15ml",
         "price": 18000, "amount": 70, "pin": "4040", "machine_column": "G4",
         "description": "ملين للقولون لعلاج الإمساك.",
         "warnings": ["يُرافق بشرب كميات كافية من الماء."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "بوسكوبان", "scientific_name": "Hyoscine Butylbromide", "dosage": "10mg",
         "price": 14000, "amount": 95, "pin": "5050", "machine_column": "G5",
         "description": "مضاد للتشنجات الهضمية.",
         "warnings": ["يُجنب في الزرق الضيق الزاوية وتضخم البروستاتا."],
         "is_popular": 1, "is_featured": 0},
        {"dname": "بروبيوتيك للبالغين", "scientific_name": "Lactobacillus acidophilus", "dosage": "Capsule",
         "price": 48000, "amount": 60, "pin": "6060", "machine_column": "G6",
         "description": "يُعيد توازن البكتيريا النافعة في الأمعاء.",
         "warnings": ["احفظه في الثلاجة."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "ميزالازين", "scientific_name": "Mesalazine", "dosage": "500mg",
         "price": 65000, "amount": 35, "pin": "7070", "machine_column": "G7",
         "description": "لعلاج التهاب القولون التقرحي.",
         "warnings": ["تابع التحليلات الدورية."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "هيدروكسيد المغنيسيوم", "scientific_name": "Magnesium Hydroxide", "dosage": "400mg",
         "price": 9500, "amount": 130, "pin": "8080", "machine_column": "G8",
         "description": "مضاد للحموضة وملين خفيف.",
         "warnings": ["لا تُزامنه مع أدوية أخرى — يمنع امتصاصها."],
         "is_popular": 0, "is_featured": 0},
    ],
    # [7] صحة المرأة — FeminaRx
    [
        {"dname": "حبوب منع حمل مركبة", "scientific_name": "Ethinylestradiol + Levonorgestrel", "dosage": "0.03mg/0.15mg",
         "price": 35000, "amount": 80, "pin": "1212", "machine_column": "H1",
         "description": "موانع حمل هرمونية ثنائية.",
         "warnings": ["تُؤخذ في نفس الوقت يومياً.", "تحققي من التداخل مع المضادات الحيوية."],
         "is_popular": 1, "is_featured": 0},
        {"dname": "حمض الفوليك 5mg", "scientific_name": "Folic Acid", "dosage": "5mg",
         "price": 12000, "amount": 120, "pin": "2323", "machine_column": "H2",
         "description": "جرعة علاجية لنقص حمض الفوليك.",
         "warnings": ["يُستخدم تحت إشراف الطبيب."],
         "is_popular": 1, "is_featured": 0},
        {"dname": "إستروجين موضعي", "scientific_name": "Estriol Cream", "dosage": "0.1%",
         "price": 58000, "amount": 40, "pin": "3434", "machine_column": "H3",
         "description": "لعلاج أعراض انقطاع الطمث الموضعية.",
         "warnings": ["للاستخدام الخارجي فقط."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "ميفيبريستون", "scientific_name": "Mifepristone", "dosage": "200mg",
         "price": 120000, "amount": 10, "pin": "4545", "machine_column": "H4",
         "description": "تُستخدم في حالات طبية محددة تحت إشراف مختص.",
         "warnings": ["يُستخدم فقط في المستشفى."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "ديدروجيستيرون", "scientific_name": "Dydrogesterone", "dosage": "10mg",
         "price": 42000, "amount": 55, "pin": "5656", "machine_column": "H5",
         "description": "بروجسترون اصطناعي لدعم الحمل.",
         "warnings": ["استمري في تناوله حسب توجيه الطبيب."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "كبريتات الحديد للحوامل", "scientific_name": "Ferrous Sulfate", "dosage": "300mg",
         "price": 15000, "amount": 100, "pin": "6767", "machine_column": "H6",
         "description": "لعلاج فقر الدم أثناء الحمل.",
         "warnings": ["يُؤخذ على معدة فارغة.", "تجنب مع منتجات الألبان."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "فيتامينات ما قبل الولادة", "scientific_name": "Prenatal Vitamins", "dosage": "Daily Tablet",
         "price": 55000, "amount": 75, "pin": "7878", "machine_column": "H7",
         "description": "مجمع فيتامينات ومعادن للحامل والمرضعة.",
         "warnings": ["خذيها مع وجبة لتقليل الغثيان."],
         "is_popular": 1, "is_featured": 0},
        {"dname": "فلوكونازول", "scientific_name": "Fluconazole", "dosage": "150mg",
         "price": 22000, "amount": 65, "pin": "8989", "machine_column": "H8",
         "description": "مضاد فطري لعلاج عدوى المهبل الفطرية.",
         "warnings": ["جرعة واحدة في الغالب كافية."],
         "is_popular": 0, "is_featured": 0},
    ],
    # [8] الأمراض الجلدية — DermaCore
    [
        {"dname": "بيتاميثازون كريم", "scientific_name": "Betamethasone Cream", "dosage": "0.1%",
         "price": 18500, "amount": 70, "pin": "1313", "machine_column": "I1",
         "description": "كورتيكوستيرويد موضعي لعلاج التهاب الجلد.",
         "warnings": ["للاستخدام الخارجي فقط.", "تجنب الوجه وطيات الجلد."],
         "is_popular": 1, "is_featured": 0},
        {"dname": "كريم كالاسيبوتريول", "scientific_name": "Calcipotriol Cream", "dosage": "50mcg/g",
         "price": 75000, "amount": 30, "pin": "2424", "machine_column": "I2",
         "description": "لعلاج الصدفية.",
         "warnings": ["تجنب الشمس المباشرة بعد التطبيق."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "مرهم موبيروسين", "scientific_name": "Mupirocin Ointment", "dosage": "2%",
         "price": 28000, "amount": 60, "pin": "3535", "machine_column": "I3",
         "description": "مضاد حيوي موضعي لعدوى جلد MRSA.",
         "warnings": ["للاستخدام الخارجي فقط."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "كريم هيدروكورتيزون", "scientific_name": "Hydrocortisone Cream", "dosage": "1%",
         "price": 14000, "amount": 90, "pin": "4646", "machine_column": "I4",
         "description": "كورتيزون خفيف للحكة والتهاب الجلد الخفيف.",
         "warnings": ["لا تستخدمه أكثر من أسبوعين متتاليين."],
         "is_popular": 1, "is_featured": 0},
        {"dname": "كلاريمايسين جل", "scientific_name": "Clindamycin Gel", "dosage": "1%",
         "price": 32000, "amount": 50, "pin": "5757", "machine_column": "I5",
         "description": "مضاد حيوي موضعي لحب الشباب.",
         "warnings": ["لا تُقرّب من العينين."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "تريتينوين كريم", "scientific_name": "Tretinoin Cream", "dosage": "0.025%",
         "price": 48000, "amount": 40, "pin": "6868", "machine_column": "I6",
         "description": "مشتق فيتامين A لعلاج حب الشباب وتجديد الجلد.",
         "warnings": ["تجنب الشمس — استخدم واقي شمس.", "تجنبي الحمل."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "كريم إيفرميكتين", "scientific_name": "Ivermectin Cream", "dosage": "1%",
         "price": 65000, "amount": 25, "pin": "7979", "machine_column": "I7",
         "description": "لعلاج الوردية الجلدية.",
         "warnings": ["يُطبَّق مرة واحدة يومياً."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "كريم ترطيب للأكزيما", "scientific_name": "Emollient Cream", "dosage": "Apply BD",
         "price": 22000, "amount": 110, "pin": "8989", "machine_column": "I8",
         "description": "مرطب علاجي كثيف لعلاج الأكزيما والجلد الجاف.",
         "warnings": ["طبّقه فوراً بعد الاستحمام."],
         "is_popular": 1, "is_featured": 0},
    ],
    # [9] الجهاز التنفسي — Respira
    [
        {"dname": "بخاخ سالبوتامول", "scientific_name": "Salbutamol Inhaler", "dosage": "100mcg/dose",
         "price": 32000, "amount": 75, "pin": "1414", "machine_column": "J1",
         "description": "موسّع شعبي سريع المفعول للربو.",
         "warnings": ["اهز قبل الاستخدام.", "لا تتجاوز 8 جرعات في 24 ساعة."],
         "is_popular": 1, "is_featured": 1},
        {"dname": "بخاخ بوديزونيد", "scientific_name": "Budesonide Inhaler", "dosage": "200mcg",
         "price": 49000, "amount": 55, "pin": "2525", "machine_column": "J2",
         "description": "كورتيكوستيرويد استنشاقي للربو.",
         "warnings": ["اشطف فمك بعد كل استخدام."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "مونتيلوكاست", "scientific_name": "Montelukast", "dosage": "10mg",
         "price": 38000, "amount": 65, "pin": "3636", "machine_column": "J3",
         "description": "مضاد لمستقبلات اللوكوترين لعلاج الربو والحساسية.",
         "warnings": ["أبلغ الطبيب عن أي تغيرات مزاجية."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "أمبروكسول", "scientific_name": "Ambroxol", "dosage": "30mg",
         "price": 14000, "amount": 100, "pin": "4747", "machine_column": "J4",
         "description": "طارد للبلغم.",
         "warnings": ["يُشرب مع كميات وافرة من الماء."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "أسيتيل سيستئين", "scientific_name": "N-Acetylcysteine", "dosage": "600mg",
         "price": 22000, "amount": 80, "pin": "5858", "machine_column": "J5",
         "description": "مذيب للبلغم ومضاد أكسدة.",
         "warnings": ["يُذاب في الماء قبل الشرب."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "ديكستروميثورفان", "scientific_name": "Dextromethorphan", "dosage": "15mg",
         "price": 16500, "amount": 90, "pin": "6969", "machine_column": "J6",
         "description": "مضاد للسعال الجاف.",
         "warnings": ["لا يُعطى للأطفال أقل من 6 سنوات.", "لا يُزامن مع MAOIs."],
         "is_popular": 1, "is_featured": 0},
        {"dname": "تيوفيلين", "scientific_name": "Theophylline", "dosage": "200mg",
         "price": 19000, "amount": 50, "pin": "7070", "machine_column": "J7",
         "description": "موسع شعبي للربو والانسداد الرئوي المزمن.",
         "warnings": ["راقب مستويات الدواء في الدم."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "إيبراتروبيوم بخاخ", "scientific_name": "Ipratropium Bromide", "dosage": "20mcg/dose",
         "price": 45000, "amount": 40, "pin": "8181", "machine_column": "J8",
         "description": "موسع شعبي مضاد للكولين.",
         "warnings": ["تجنب ملامسة العينين."],
         "is_popular": 0, "is_featured": 0},
    ],
    # [10] الجهاز العصبي — NeuroLine
    [
        {"dname": "سيرترالين", "scientific_name": "Sertraline", "dosage": "50mg",
         "price": 38000, "amount": 70, "pin": "1515", "machine_column": "K1",
         "description": "مثبط انتقائي لاسترداد السيروتونين (SSRI).",
         "warnings": ["لا تُوقفه فجأة.", "يظهر أثره بعد 2-4 أسابيع."],
         "is_popular": 1, "is_featured": 0},
        {"dname": "ألبرازولام", "scientific_name": "Alprazolam", "dosage": "0.5mg",
         "price": 22000, "amount": 50, "pin": "2626", "machine_column": "K2",
         "description": "بنزوديازيبين لعلاج القلق الحاد.",
         "warnings": ["إمكانية التعود عالية — استخدم بحذر.", "يُسبب النعاس."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "ليفيتيراسيتام", "scientific_name": "Levetiracetam", "dosage": "500mg",
         "price": 62000, "amount": 45, "pin": "3737", "machine_column": "K3",
         "description": "مضاد للصرع.",
         "warnings": ["لا تتوقف عن أخذه بدون استشارة الطبيب."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "أميتريبتيلين", "scientific_name": "Amitriptyline", "dosage": "25mg",
         "price": 15000, "amount": 80, "pin": "4848", "machine_column": "K4",
         "description": "مضاد اكتئاب ثلاثي الحلقات يُستخدم أيضاً للألم المزمن.",
         "warnings": ["يُسبب النعاس — تناوله ليلاً."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "ريسبيريدون", "scientific_name": "Risperidone", "dosage": "2mg",
         "price": 45000, "amount": 35, "pin": "5959", "machine_column": "K5",
         "description": "مضاد للذهان غير نمطي.",
         "warnings": ["راقب مستويات البروالكتين."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "دونيبيزيل", "scientific_name": "Donepezil", "dosage": "5mg",
         "price": 72000, "amount": 30, "pin": "6060", "machine_column": "K6",
         "description": "مثبط الكولينستراز لعلاج الزهايمر.",
         "warnings": ["يُؤخذ قبل النوم."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "باكلوفين", "scientific_name": "Baclofen", "dosage": "10mg",
         "price": 19000, "amount": 65, "pin": "7171", "machine_column": "K7",
         "description": "مرخٍّ عضلي لعلاج التشنجات.",
         "warnings": ["لا تتوقف عنه فجأة."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "ميمانتين", "scientific_name": "Memantine", "dosage": "10mg",
         "price": 88000, "amount": 25, "pin": "8282", "machine_column": "K8",
         "description": "مضاد مستقبلات NMDA لعلاج الزهايمر المتوسط-الشديد.",
         "warnings": ["يُبدأ بجرعات صغيرة ويُرفع تدريجياً."],
         "is_popular": 0, "is_featured": 0},
    ],
    # [11] الحساسية — Allergy Plus
    [
        {"dname": "سيتريزين", "scientific_name": "Cetirizine", "dosage": "10mg",
         "price": 14000, "amount": 130, "pin": "1616", "machine_column": "L1",
         "description": "مضاد هيستامين من الجيل الثاني.",
         "warnings": ["قد يسبب نعاساً خفيفاً."],
         "is_popular": 1, "is_featured": 1},
        {"dname": "فيكسوفيناتدين", "scientific_name": "Fexofenadine", "dosage": "120mg",
         "price": 22000, "amount": 90, "pin": "2727", "machine_column": "L2",
         "description": "مضاد هيستامين لا يسبب النعاس.",
         "warnings": ["تجنب مع عصير الجريب فروت."],
         "is_popular": 1, "is_featured": 0},
        {"dname": "لوراتادين", "scientific_name": "Loratadine", "dosage": "10mg",
         "price": 12500, "amount": 120, "pin": "3838", "machine_column": "L3",
         "description": "مضاد هيستامين غير مُنوِّم.",
         "warnings": ["يُؤخذ مرة واحدة يومياً."],
         "is_popular": 1, "is_featured": 0},
        {"dname": "ديسلوراتادين", "scientific_name": "Desloratadine", "dosage": "5mg",
         "price": 28000, "amount": 80, "pin": "4949", "machine_column": "L4",
         "description": "مضاد هيستامين قوي وغير مُنوِّم.",
         "warnings": ["لا تتجاوز الجرعة اليومية."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "بيلاستين", "scientific_name": "Bilastine", "dosage": "20mg",
         "price": 38000, "amount": 55, "pin": "5050", "machine_column": "L5",
         "description": "مضاد هيستامين جديد لا يتفاعل مع الطعام.",
         "warnings": ["لا يتأثر بالطعام أو الكحول بشكل ملحوظ."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "بخاخ أنفي كورتيزون", "scientific_name": "Fluticasone Nasal Spray", "dosage": "50mcg/dose",
         "price": 42000, "amount": 60, "pin": "6161", "machine_column": "L6",
         "description": "لعلاج التهاب الأنف التحسسي.",
         "warnings": ["اهز قبل الاستخدام.", "استخدم بانتظام للحصول على أفضل نتيجة."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "مونتيلوكاست للحساسية", "scientific_name": "Montelukast", "dosage": "5mg",
         "price": 35000, "amount": 70, "pin": "7272", "machine_column": "L7",
         "description": "للحساسية الموسمية وانسداد الأنف.",
         "warnings": ["يُؤخذ مساءً."],
         "is_popular": 0, "is_featured": 0},
        {"dname": "حقن إبينفرين", "scientific_name": "Epinephrine Auto-Injector", "dosage": "0.3mg",
         "price": 180000, "amount": 8, "pin": "8383", "machine_column": "L8",
         "description": "للطوارئ في حالات الصدمة التأقية.",
         "warnings": ["للاستخدام الطارئ فقط.", "يُحمل دائماً من قِبل المرضى المعرضين للخطر."],
         "is_popular": 0, "is_featured": 0},
    ],
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# بيانات الأطباء
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCTORS = [
    {
        "fname": "مروان الرفاعي", "email": "marwan@automed.test",
        "password": "Doctor123!", "phone": "+963-11-2345001",
        "role": "doctor", "specialty": "internal-medicine",
        "clinic_name": "عيادة الرفاعي للباطنة", "license_number": "LIC-2018-001",
        "status": "active",
    },
    {
        "fname": "سارة جابر", "email": "sara@automed.test",
        "password": "Doctor123!", "phone": "+963-11-2345002",
        "role": "doctor", "specialty": "pediatrics",
        "clinic_name": "عيادة الأطفال جابر", "license_number": "LIC-2019-002",
        "status": "active",
    },
    {
        "fname": "رامي ناصر", "email": "rami@automed.test",
        "password": "Doctor123!", "phone": "+963-11-2345003",
        "role": "doctor", "specialty": "cardiology",
        "clinic_name": "مركز قلب ناصر", "license_number": "LIC-2020-003",
        "status": "active",
    },
    {
        "fname": "مرح حسين", "email": "marah@automed.test",
        "password": "Doctor123!", "phone": "+963-11-2345004",
        "role": "doctor", "specialty": "dermatology",
        "clinic_name": "عيادة حسين للجلدية", "license_number": "LIC-2021-004",
        "status": "active",
    },
    {
        "fname": "fayez", "email": "admin@admin.com",
        "password": "fayez", "phone": "+963-11-9901001",
        "role": "admin", "specialty": "administration",
        "clinic_name": "الصيدلية المؤتمتة", "license_number": "ADM-2022-001",
        "status": "active",
    },
    {
        "fname": "fayez", "email": "doctor@admin.com",
        "password": "fayez", "phone": "+963-11-9901002",
        "role": "doctor", "specialty": "general",
        "clinic_name": "عيادة fayez", "license_number": "LIC-FAYEZ-001",
        "status": "active",
    },
    {
        "fname": "طبيب جديد - قيد المراجعة", "email": "newdoc@test.test",
        "password": "Doctor123!", "phone": "+963-11-2345099",
        "role": "doctor", "specialty": "general",
        "clinic_name": "عيادة خاصة", "license_number": "LIC-2024-099",
        "status": "pending",
    },
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# بيانات المرضى — تطابق سيناريوهات الـ mock
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PATIENTS = [
    {"name_of_patients": "ليان الخطيب",  "nid": "P-22041", "company_patients": "Care Plus",         "operation_id": "OP-23001"},
    {"name_of_patients": "إياد عثمان",   "nid": "P-22987", "company_patients": "National Coverage",  "operation_id": "OP-23002"},
    {"name_of_patients": "نسرين عيسى",  "nid": "P-23015", "company_patients": "Hospital Network",   "operation_id": "OP-23003"},
    {"name_of_patients": "محمد كنعان",  "nid": "P-23500", "company_patients": "Care Plus",          "operation_id": "OP-23004"},
    {"name_of_patients": "جود العبدالله", "nid": "P-24003", "company_patients": "Family Shield",    "operation_id": "OP-23005"},
    {"name_of_patients": "أحمد الحلبي", "nid": "P-24311", "company_patients": "Work Med",           "operation_id": "OP-23006"},
    {"name_of_patients": "هديل حمود",   "nid": "P-24752", "company_patients": "Family Shield",      "operation_id": "OP-23007"},
    {"name_of_patients": "fayez",       "nid": "P-FAYEZ", "company_patients": "Care Plus",            "operation_id": "OP-FAYEZ-01"},
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# الدالة الرئيسية للبذر
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def seed():
    print("=" * 55)
    print("  بدء ملء قاعدة البيانات ببيانات واقعية")
    print("=" * 55)

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 1. التصنيفات
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("\n[1/6] إدخال التصنيفات الدوائية ...")
    category_ids = []
    for cat in CATEGORIES:
        existing = cur.execute(
            "SELECT category_id FROM drug_category WHERE slug = ?", (cat["slug"],)
        ).fetchone()
        if existing:
            cid = existing["category_id"]
            cur.execute(
                """UPDATE drug_category
                   SET name_category=?, description_ar=?, description_en=?, icon=?, accent=?
                   WHERE category_id=?""",
                (cat["name_category"], cat["description_ar"], cat["description_en"],
                 cat["icon"], cat["accent"], cid)
            )
        else:
            res = cur.execute(
                """INSERT INTO drug_category
                   (name_category, slug, description_ar, description_en, icon, accent)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (cat["name_category"], cat["slug"], cat["description_ar"],
                 cat["description_en"], cat["icon"], cat["accent"])
            )
            cid = res.lastrowid
        category_ids.append(cid)
    print(f"  ✅ {len(category_ids)} تصنيف")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 2. الشركات
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("\n[2/6] إدخال الشركات ...")
    company_ids = []
    for i, comp in enumerate(COMPANIES):
        cid = category_ids[i]
        existing = cur.execute(
            "SELECT company_id FROM company_drug WHERE name_company = ? AND category_id = ?",
            (comp["name_company"], cid)
        ).fetchone()
        if existing:
            comp_id = existing["company_id"]
            cur.execute(
                "UPDATE company_drug SET country=? WHERE company_id=?",
                (comp["country"], comp_id)
            )
        else:
            res = cur.execute(
                """INSERT INTO company_drug (name_company, category_id, country, created_at)
                   VALUES (?, ?, ?, CURRENT_TIMESTAMP)""",
                (comp["name_company"], cid, comp["country"])
            )
            comp_id = res.lastrowid
        company_ids.append(comp_id)
    print(f"  ✅ {len(company_ids)} شركة")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 3. الأدوية (96 دواء)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("\n[3/6] إدخال الأدوية ...")
    drug_count = 0
    drug_ids_by_cat = {}  # category_index → [drug_id, ...]

    for cat_idx, drugs in enumerate(DRUGS_BY_CATEGORY):
        cat_drug_ids = []
        cid = category_ids[cat_idx]
        comp_id = company_ids[cat_idx]

        for drug in drugs:
            existing = cur.execute(
                "SELECT drug_id FROM drugs WHERE dname = ? AND category_id = ?",
                (drug["dname"], cid)
            ).fetchone()

            warnings_json = json.dumps(drug.get("warnings", []), ensure_ascii=False)

            if existing:
                did = existing["drug_id"]
                cur.execute(
                    """UPDATE drugs
                       SET scientific_name=?, dosage=?, description=?, warnings=?,
                           price=?, amount=?, pin=?, machine_column=?,
                           is_popular=?, is_featured=?, company_id=?
                       WHERE drug_id=?""",
                    (
                        drug["scientific_name"], drug["dosage"],
                        drug.get("description", ""), warnings_json,
                        drug["price"], drug["amount"],
                        drug["pin"], drug["machine_column"],
                        drug.get("is_popular", 0), drug.get("is_featured", 0),
                        comp_id, did,
                    )
                )
            else:
                res = cur.execute(
                    """INSERT INTO drugs
                       (dname, scientific_name, dosage, description, warnings,
                        category_id, company_id, price, amount, pin, machine_column,
                        is_popular, is_featured, created_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)""",
                    (
                        drug["dname"], drug["scientific_name"], drug["dosage"],
                        drug.get("description", ""), warnings_json,
                        cid, comp_id,
                        drug["price"], drug["amount"],
                        drug["pin"], drug["machine_column"],
                        drug.get("is_popular", 0), drug.get("is_featured", 0),
                    )
                )
                did = res.lastrowid

            cat_drug_ids.append(did)
            drug_count += 1

        drug_ids_by_cat[cat_idx] = cat_drug_ids

    print(f"  ✅ {drug_count} دواء")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 4. الأطباء والمدير
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("\n[4/6] إدخال الأطباء والمدير ...")
    doctor_ids = []
    for doc in DOCTORS:
        existing = cur.execute(
            "SELECT doctor_id FROM doctors WHERE email = ?", (doc["email"],)
        ).fetchone()
        if existing:
            did = existing["doctor_id"]
            cur.execute(
                """UPDATE doctors
                   SET fname=?, phone=?, specialty=?, clinic_name=?,
                       license_number=?, status=?, updated_at=CURRENT_TIMESTAMP
                   WHERE doctor_id=?""",
                (doc["fname"], doc["phone"], doc["specialty"],
                 doc["clinic_name"], doc["license_number"], doc["status"], did)
            )
        else:
            hashed = hash_password(doc["password"])
            res = cur.execute(
                """INSERT INTO doctors
                   (fname, email, password, phone, role, specialty, clinic_name,
                    license_number, status, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)""",
                (doc["fname"], doc["email"], hashed, doc["phone"],
                 doc["role"], doc["specialty"], doc["clinic_name"],
                 doc["license_number"], doc["status"])
            )
            did = res.lastrowid
        doctor_ids.append(did)
    print(f"  ✅ {len(doctor_ids)} مستخدم (أطباء + مدير)")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 5. المرضى
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("\n[5/6] إدخال المرضى ...")
    patient_ids = []
    default_hash = hash_password("Patient123!")

    for pat in PATIENTS:
        existing = cur.execute(
            "SELECT patient_id FROM company_patients WHERE operation_id = ?",
            (pat["operation_id"],)
        ).fetchone()
        if existing:
            pid = existing["patient_id"]
        else:
            res = cur.execute(
                """INSERT INTO company_patients
                   (name_of_patients, nid, company_patients, hash_password,
                    operation_id, created_at)
                   VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)""",
                (pat["name_of_patients"], pat["nid"], pat["company_patients"],
                 default_hash, pat["operation_id"])
            )
            pid = res.lastrowid
        patient_ids.append(pid)
    print(f"  ✅ {len(patient_ids)} مريض")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 6. الطلبات
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("\n[6/6] إدخال الطلبات ...")

    # طلبات مرتبطة بالمرضى (للجهاز اللوحي)
    # كل طلب يحتوي على أدوية حقيقية من الداتابيس
    patient_orders = [
        # OP-23001: ليان — وصفة مدفوعة قابلة للصرف
        {
            "patient_idx": 0, "doctor_idx": 0,
            "operation_id": "OP-23001", "status": "pending",
            "is_pay": 0, "total_price": 68400,
            "drugs": [(0, 0, 2, 12400), (6, 0, 1, 18600), (5, 0, 1, 25000)],
            # [cat_idx, drug_idx_in_cat, qty, unit_price]
        },
        # OP-23002: إياد — وصفة مجانية (تغطية كاملة)
        {
            "patient_idx": 1, "doctor_idx": 1,
            "operation_id": "OP-23002", "status": "pending",
            "is_pay": 1, "total_price": 0,
            "drugs": [(1, 1, 1, 0), (1, 5, 1, 0)],
        },
        # OP-23003: نسرين — وصفة مدفوعة
        {
            "patient_idx": 2, "doctor_idx": 2,
            "operation_id": "OP-23003", "status": "pending",
            "is_pay": 0, "total_price": 93200,
            "drugs": [(3, 1, 1, 44200), (9, 1, 1, 49000)],
        },
        # OP-23004: محمد — وصفة مدفوعة
        {
            "patient_idx": 3, "doctor_idx": 2,
            "operation_id": "OP-23004", "status": "pending",
            "is_pay": 0, "total_price": 71500,
            "drugs": [(2, 0, 2, 21500), (0, 6, 1, 28500)],
        },
        # OP-23005: جود — وصفة منتهية (status=rejected)
        {
            "patient_idx": 4, "doctor_idx": 3,
            "operation_id": "OP-23005", "status": "rejected",
            "is_pay": 0, "total_price": 32000,
            "drugs": [(11, 0, 1, 32000)],
        },
        # OP-23006: أحمد — وصفة مستخدمة سابقاً (status=success)
        {
            "patient_idx": 5, "doctor_idx": 1,
            "operation_id": "OP-23006", "status": "success",
            "is_pay": 1, "total_price": 14200,
            "drugs": [(1, 0, 1, 14200)],
        },
        # OP-23007: هديل — دواء غير متوفر (stock=0 للدواء الأول)
        {
            "patient_idx": 6, "doctor_idx": 0,
            "operation_id": "OP-23007", "status": "pending",
            "is_pay": 0, "total_price": 56000,
            "drugs": [(3, 0, 1, 29000), (6, 5, 1, 27000)],
        },
        # OP-FAYEZ-01: fayez — حساب تجريبي موحّد
        {
            "patient_idx": 7, "doctor_idx": 0,
            "operation_id": "OP-FAYEZ-01", "status": "pending",
            "is_pay": 0, "total_price": 68400,
            "drugs": [(0, 0, 2, 12400), (6, 0, 1, 18600), (5, 0, 1, 25000)],
        },
    ]

    order_count = 0
    for po in patient_orders:
        existing = cur.execute(
            "SELECT order_id FROM orders WHERE operation_id = ?", (po["operation_id"],)
        ).fetchone()
        if existing:
            continue

        pid = patient_ids[po["patient_idx"]]
        doc_id = doctor_ids[po["doctor_idx"]]

        res = cur.execute(
            """INSERT INTO orders
               (doctor_id, patient_id, operation_id, status, total_price, is_pay,
                created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)""",
            (doc_id, pid, po["operation_id"], po["status"], po["total_price"], po["is_pay"])
        )
        order_id = res.lastrowid

        for cat_idx, drug_idx, qty, unit_price in po["drugs"]:
            if cat_idx < len(drug_ids_by_cat) and drug_idx < len(drug_ids_by_cat[cat_idx]):
                drug_id = drug_ids_by_cat[cat_idx][drug_idx]
                cur.execute(
                    """INSERT INTO details_order (order_id, drug_id, number_of_drug, price_of_one_drug)
                       VALUES (?, ?, ?, ?)""",
                    (order_id, drug_id, qty, unit_price)
                )

        order_count += 1

    # جعل الدواء الأول في OP-23007 بمخزون صفري (لاختبار سيناريو نفاد المخزون)
    if drug_ids_by_cat.get(3) and len(drug_ids_by_cat[3]) > 0:
        cur.execute(
            "UPDATE drugs SET amount = 0 WHERE drug_id = ?",
            (drug_ids_by_cat[3][0],)
        )

    # طلبات الأطباء العادية (سجل الطلبات في doctor portal)
    doctor_portal_orders = [
        {"doc_idx": 0, "status": "success",  "total": 56800, "is_pay": 1,
         "drugs": [(0, 0, 3, 12400), (5, 0, 2, 14200)]},
        {"doc_idx": 0, "status": "pending",  "total": 38000, "is_pay": 0,
         "drugs": [(3, 1, 1, 38000)]},
        {"doc_idx": 1, "status": "review",   "total": 22000, "is_pay": 0,
         "drugs": [(11, 0, 1, 14000), (6, 0, 1, 22000)]},
        {"doc_idx": 2, "status": "success",  "total": 81500, "is_pay": 1,
         "drugs": [(2, 1, 2, 18900), (2, 2, 1, 31500)]},
        {"doc_idx": 3, "status": "success",  "total": 45000, "is_pay": 1,
         "drugs": [(9, 0, 1, 45000)]},
        {"doc_idx": 1, "status": "pending",  "total": 28000, "is_pay": 0,
         "drugs": [(3, 2, 1, 28000)]},
    ]

    for dpo in doctor_portal_orders:
        doc_id = doctor_ids[dpo["doc_idx"]]
        res = cur.execute(
            """INSERT INTO orders
               (doctor_id, status, total_price, is_pay, created_at, updated_at)
               VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)""",
            (doc_id, dpo["status"], dpo["total"], dpo["is_pay"])
        )
        oid = res.lastrowid

        for cat_idx, drug_idx, qty, unit_price in dpo["drugs"]:
            if cat_idx < len(drug_ids_by_cat) and drug_idx < len(drug_ids_by_cat[cat_idx]):
                drug_id = drug_ids_by_cat[cat_idx][drug_idx]
                cur.execute(
                    """INSERT INTO details_order (order_id, drug_id, number_of_drug, price_of_one_drug)
                       VALUES (?, ?, ?, ?)""",
                    (oid, drug_id, qty, unit_price)
                )
        order_count += 1

    print(f"  ✅ {order_count} طلب تم إدخاله")

    conn.commit()
    conn.close()

    print("\n" + "=" * 55)
    print("  ✅ تم ملء قاعدة البيانات بنجاح!")
    print()
    print("  بيانات تسجيل الدخول:")
    print("  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("  [Admin — لوحة الإدارة]")
    print("  admin@admin.com       / fayez")
    print()
    print("  [Doctor Portal — بوابة الطبيب]")
    print("  doctor@admin.com      / fayez")
    print("  (أيضاً: marwan@automed.test / Doctor123! …)")
    print()
    print("  [Patient Tablet — barcodes]")
    for pat in PATIENTS:
        print(f"  {pat['operation_id']}  ← {pat['name_of_patients']}")
    print("=" * 55)


if __name__ == "__main__":
    seed()

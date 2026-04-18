export const specialtyOptions = [
  { id: 'internal-medicine', label: { ar: 'الطب الباطني', en: 'Internal Medicine' } },
  { id: 'pediatrics', label: { ar: 'طب الأطفال', en: 'Pediatrics' } },
  { id: 'cardiology', label: { ar: 'أمراض القلب', en: 'Cardiology' } },
  { id: 'dermatology', label: { ar: 'الأمراض الجلدية', en: 'Dermatology' } },
  { id: 'endocrinology', label: { ar: 'الغدد الصم', en: 'Endocrinology' } },
  { id: 'neurology', label: { ar: 'الأعصاب', en: 'Neurology' } },
  { id: 'pulmonology', label: { ar: 'الأمراض التنفسية', en: 'Pulmonology' } },
  { id: 'gynecology', label: { ar: 'النسائية', en: 'Gynecology' } },
  { id: 'allergy-immunology', label: { ar: 'الحساسية والمناعة', en: 'Allergy & Immunology' } },
  { id: 'family-medicine', label: { ar: 'طب الأسرة', en: 'Family Medicine' } },
] as const

export const categoryMeta = {
  analgesics: {
    name: { ar: 'مسكنات', en: 'Pain Relief' },
    description: {
      ar: 'حلول علاجية يومية للألم الحاد والمزمن مع أصناف سريعة الوصول.',
      en: 'Fast-access analgesics for acute and chronic pain pathways.',
    },
    warnings: {
      ar: ['يراعى تناوله بعد الطعام عند الحاجة.', 'تحقق من التداخل مع مضادات التخثر.'],
      en: ['Prefer use after meals when clinically appropriate.', 'Review anticoagulant interactions before prescribing.'],
    },
    icon: 'PillBottle',
    accent: 'from-rose-400 via-orange-300 to-amber-200',
  },
  diabetes: {
    name: { ar: 'أدوية سكر', en: 'Diabetes Care' },
    description: {
      ar: 'أصناف لتنظيم الغلوكوز والإنسولين ومتابعة التحكم طويل الأمد.',
      en: 'Glucose control therapies for long-term diabetes management.',
    },
    warnings: {
      ar: ['راقب سكر الدم وفق الخطة العلاجية.', 'قد تحتاج الجرعة إلى تعديل حسب الغذاء.'],
      en: ['Track glucose according to the treatment plan.', 'Dose adjustments may be needed around meals.'],
    },
    icon: 'Syringe',
    accent: 'from-sky-500 via-cyan-400 to-teal-300',
  },
  cardio: {
    name: { ar: 'أدوية قلب', en: 'Cardiovascular' },
    description: {
      ar: 'مضادات ضغط وصفائح ودعم علاجي لحالات القلب المزمنة.',
      en: 'Cardiovascular therapies for pressure control and long-term care.',
    },
    warnings: {
      ar: ['تأكد من الضغط والنبض قبل تعديل الجرعة.', 'راجع التداخلات مع العلاجات القلبية الأخرى.'],
      en: ['Check blood pressure and pulse before changing dosage.', 'Review interactions with other cardiac therapies.'],
    },
    icon: 'HeartPulse',
    accent: 'from-rose-500 via-red-400 to-orange-300',
  },
  antibiotics: {
    name: { ar: 'مضادات حيوية', en: 'Antibiotics' },
    description: {
      ar: 'أدوية موصوفة للعدوى الشائعة مع تنبيهات للحساسية والالتزام العلاجي.',
      en: 'Targeted anti-infective options with allergy and adherence cues.',
    },
    warnings: {
      ar: ['أكمل الكورس العلاجي كاملاً.', 'تحقق من الحساسية للمضادات قبل الوصف.'],
      en: ['Complete the full antibiotic course.', 'Check allergy history before prescribing.'],
    },
    icon: 'ShieldPlus',
    accent: 'from-indigo-500 via-blue-500 to-sky-400',
  },
  pediatrics: {
    name: { ar: 'أدوية أطفال', en: 'Pediatrics' },
    description: {
      ar: 'تركيبات وجرعات مناسبة للأعمار الصغيرة والزيارات السريعة.',
      en: 'Child-friendly formulations with age-aware dosing support.',
    },
    warnings: {
      ar: ['حدد الجرعة بناءً على العمر والوزن.', 'اشرح للأهل طريقة الإعطاء بوضوح.'],
      en: ['Dose according to age and weight.', 'Explain administration clearly to caregivers.'],
    },
    icon: 'Baby',
    accent: 'from-amber-400 via-yellow-300 to-lime-200',
  },
  vitamins: {
    name: { ar: 'فيتامينات', en: 'Vitamins' },
    description: {
      ar: 'مكملات لدعم المناعة والطاقة ومعالجة النقص الغذائي.',
      en: 'Daily support supplements for immunity, energy, and deficiency care.',
    },
    warnings: {
      ar: ['لا تتجاوز الجرعة اليومية الموصى بها.', 'يمكن دمجها مع النظام الغذائي الداعم.'],
      en: ['Do not exceed the recommended daily dose.', 'Combine with appropriate nutritional guidance.'],
    },
    icon: 'Sparkles',
    accent: 'from-emerald-400 via-lime-300 to-teal-200',
  },
  digestive: {
    name: { ar: 'جهاز هضمي', en: 'Digestive Health' },
    description: {
      ar: 'أدوية للحموضة والتقلصات والبروبيوتيك والمتابعة الهضمية.',
      en: 'Digestive therapies for acidity, motility, and microbiome balance.',
    },
    warnings: {
      ar: ['راجع الأعراض المستمرة لأكثر من أسبوعين.', 'بعض الأصناف تؤخذ قبل الطعام.'],
      en: ['Review persistent symptoms beyond two weeks.', 'Some therapies are best taken before meals.'],
    },
    icon: 'UtensilsCrossed',
    accent: 'from-orange-500 via-amber-400 to-yellow-200',
  },
  'womens-health': {
    name: { ar: 'نسائية', en: "Women's Health" },
    description: {
      ar: 'أدوية نسائية وهرمونية ودعم الحمل والمتابعة الدورية.',
      en: 'Women-focused hormonal and prenatal support therapies.',
    },
    warnings: {
      ar: ['تحقق من حالة الحمل أو الرضاعة قبل التوصية.', 'تابع أي أعراض هرمونية غير معتادة.'],
      en: ['Confirm pregnancy or lactation status before prescribing.', 'Monitor for unusual hormonal symptoms.'],
    },
    icon: 'Flower2',
    accent: 'from-fuchsia-500 via-pink-400 to-rose-200',
  },
  dermatology: {
    name: { ar: 'جلدية', en: 'Dermatology' },
    description: {
      ar: 'مستحضرات موضعية وعلاجات جلدية لحب الشباب والتصبغات والالتهاب.',
      en: 'Topical and procedural dermatology support for skin conditions.',
    },
    warnings: {
      ar: ['قد تتطلب بعض المنتجات تجنب الشمس المباشرة.', 'ينصح باختبار موضعي عند الحاجة.'],
      en: ['Some treatments require strict sun protection.', 'Patch testing may be appropriate for sensitive skin.'],
    },
    icon: 'ScanFace',
    accent: 'from-violet-500 via-purple-400 to-fuchsia-200',
  },
  respiratory: {
    name: { ar: 'تنفسية', en: 'Respiratory' },
    description: {
      ar: 'بخاخات ومحاليل وعلاجات مساندة للحساسية والربو والسعال.',
      en: 'Respiratory care therapies for asthma, allergy, and cough relief.',
    },
    warnings: {
      ar: ['راجع أسلوب استخدام البخاخ مع المريض.', 'قد يحتاج المريض إلى spacer لبعض الأجهزة.'],
      en: ['Review inhaler technique with the patient.', 'Spacer support may be needed for some devices.'],
    },
    icon: 'Wind',
    accent: 'from-cyan-500 via-teal-400 to-sky-200',
  },
  neurology: {
    name: { ar: 'أعصاب', en: 'Neurology' },
    description: {
      ar: 'دعم علاجي للصداع النصفي والاعتلال العصبي والاستقرار العصبي.',
      en: 'Neurology therapies for migraine, neuropathy, and nervous system stability.',
    },
    warnings: {
      ar: ['ابدأ بجرعات منخفضة عند الأصناف الحساسة.', 'راقب النعاس أو الدوار خلال الأيام الأولى.'],
      en: ['Start conservatively for sensitive therapies.', 'Watch for sedation or dizziness early on.'],
    },
    icon: 'BrainCircuit',
    accent: 'from-slate-600 via-slate-500 to-indigo-300',
  },
  allergy: {
    name: { ar: 'حساسية', en: 'Allergy Care' },
    description: {
      ar: 'مضادات هيستامين وعلاجات داعمة للحساسية الموسمية والشرى.',
      en: 'Allergy support therapies for seasonal symptoms and urticaria.',
    },
    warnings: {
      ar: ['قد تسبب بعض الأصناف نعاساً خفيفاً.', 'تحقق من التداخل مع المهدئات الأخرى.'],
      en: ['Some agents may cause mild drowsiness.', 'Review interactions with sedative medicines.'],
    },
    icon: 'ShieldAlert',
    accent: 'from-sky-500 via-cyan-400 to-emerald-200',
  },
} as const

# automated-pharmacy-frontend

هذا المجلد يحتوي على 3 مشاريع Front-End مستقلة تماماً لمشروع الصيدلية المؤتمتة:

- `patient-tablet-app`: واجهة الكشك/التابليت الخاصة بالمريض.
- `doctor-portal-app`: بوابة الطبيب للبحث عن الأدوية وبناء السلة والاطلاع على التفاصيل.
- `admin-pharmacist-app`: لوحة الأدمن/الصيدلي لإدارة النظام والمخزون والطلبات والمستخدمين.

## لماذا تم الفصل إلى 3 مشاريع؟

تم الفصل عمداً لأن كل واجهة تمثل منتجاً مختلفاً من حيث:

- نوع المستخدم.
- سيناريو الاستخدام.
- شكل الـ UX.
- قابلية النشر المستقل.
- دورة التطوير والربط مع Back-End لاحقاً.

هذا يعني أنه يمكن لاحقاً:

- نشر كل واجهة على دومين أو Subdomain مستقل.
- ربط كل واجهة بـ API مختلف أو Gateway موحد.
- تطوير كل مشروع دون إعادة هيكلة جذرية للمشاريع الأخرى.

## البنية العامة

```text
automated-pharmacy-frontend/
├─ patient-tablet-app/
├─ doctor-portal-app/
└─ admin-pharmacist-app/
```

كل مجلد من المجلدات الثلاثة يحتوي على:

- `package.json`
- `.env.example`
- `README.md`
- تطبيق React/Vite/TypeScript مستقل
- طبقة `services` قابلة للتبديل بين Mock و API

## التقنيات المعتمدة

تم اعتماد نفس الأساس المعماري تقريباً في المشاريع الثلاثة:

- React
- Vite
- TypeScript
- React Router
- Tailwind CSS
- Axios
- Zustand
- ESLint
- Prettier

ومكتبات إضافية عند الحاجة:

- `lucide-react` للأيقونات.
- `react-hook-form` و `zod` في بوابة الطبيب للنماذج والتحقق.

## التشغيل

شغّل كل مشروع بشكل مستقل من داخل مجلده:

```bash
cd patient-tablet-app
npm install
npm run dev
```

```bash
cd doctor-portal-app
npm install
npm run dev
```

```bash
cd admin-pharmacist-app
npm install
npm run dev
```

## بناء نسخة Production

داخل كل مشروع:

```bash
npm run build
```

تم التحقق فعلياً من:

- `npm run lint`
- `npm run build`

في المشاريع الثلاثة.

## آلية الـ Mocking

كل تطبيق يستخدم النمط نفسه:

- `src/config/env.ts`
- `src/config/appConfig.ts`
- `src/config/axios.ts`
- `src/services/*`
- `src/mocks/*`

ومتغير البيئة:

```env
VITE_USE_MOCK=true
```

عند القيمة `true`:

- الخدمات تستخدم بيانات `src/mocks`.

عند القيمة `false`:

- نفس الخدمات تنتقل إلى استدعاءات Axios حقيقية.

الفكرة الأساسية:

- الصفحات لا تعرف هل البيانات Mock أم API.
- الـ components لا تحتوي بيانات كبيرة hardcoded.
- الـ types تبقى ثابتة قدر الإمكان.
- التغيير الحقيقي لاحقاً يتم داخل `services` و `axios` فقط.

## كيف يتم الربط لاحقاً مع Back-End حقيقي؟

الخطوات المتوقعة في كل مشروع:

1. إنشاء endpoints حقيقية في الخادم.
2. تعديل `VITE_API_BASE_URL`.
3. تغيير `VITE_USE_MOCK=false`.
4. تحديث دوال `services` التي ما تزال تشير إلى مسارات وهمية.
5. الحفاظ على نفس `types/interfaces` أو مطابقة الـ DTOs لها.
6. ترك الصفحات والـ components والـ routing والـ stores كما هي أو مع أقل تعديل ممكن.

## ماذا يبقى كما هو عند الانتقال من Mock إلى API؟

في التصميم الحالي، الغالبية التي تبقى كما هي:

- `pages`
- `components`
- `routes`
- أغلب `store`
- أغلب `types`
- تنسيقات Tailwind

الذي يتغير غالباً:

- `src/services/*`
- `src/config/axios.ts`
- أحياناً mapping صغير بين Response الخادم والـ types المحلية

## ملاحظات معمارية مهمة

- لا يوجد دمج بين التطبيقات الثلاثة.
- كل تطبيق يملك `node_modules` و `package.json` و `dist` الخاصة به.
- تم فصل UI عن data access بشكل واضح.
- تم استخدام بيانات Mock كبيرة نسبياً لإعطاء إحساس منتج حقيقي أثناء التجربة.
- الـ READMEs الداخلية مكتوبة بالعربية وبشكل عملي موجّه لمطور يستلم المشروع بعد ذلك.

## أين أبدأ؟

إذا أردت مراجعة سريعة:

- ابدأ من `patient-tablet-app/README.md`
- ثم `doctor-portal-app/README.md`
- ثم `admin-pharmacist-app/README.md`

كل ملف يشرح المشروع بالتفصيل: الصفحات، الخدمات، الـ hooks، الـ store، الـ types، الـ mocking، وخطوات التوسع لاحقاً.

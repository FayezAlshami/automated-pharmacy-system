# patient-tablet-app

واجهة المريض الخاصة بالكشك/التابليت داخل مشروع الصيدلية المؤتمتة.

## 1) الهدف من المشروع

هذا التطبيق يمثل تجربة المريض أمام الكشك:

- بدء الجلسة
- قراءة QR
- التحقق من الوصفة
- مراجعة الدفع
- تتبع حالة الصرف
- الوصول إلى النجاح أو الفشل

المشروع Front-End فقط حالياً، لكنه مبني على افتراض أن الربط لاحقاً سيتم مع:

- قارئ QR أو ESP32 أو وحدة قراءة
- خادم تحقق من الوصفات
- بوابة دفع
- نظام dispensing events

## 2) التقنية المستخدمة

- React
- Vite
- TypeScript
- React Router
- Tailwind CSS
- Axios
- Zustand
- ESLint
- Prettier
- lucide-react
- clsx

سبب استخدام المكتبات الإضافية:

- `zustand`: لإدارة رحلة المريض وحالة الجلسة بشكل مركزي وواضح.
- `axios`: لتوحيد الانتقال لاحقاً من mock إلى API.
- `lucide-react`: أيقونات خفيفة ونظيفة للواجهة.
- `clsx`: تبسيط بناء class names للحالات المختلفة.

## 3) طريقة التشغيل خطوة بخطوة

```bash
npm install
npm run dev
```

لبناء نسخة production:

```bash
npm run build
```

للتحقق من جودة الكود:

```bash
npm run lint
```

## 4) متغيرات البيئة

انسخ من `.env.example`:

```env
VITE_APP_NAME=واجهة المريض - الصيدلية المؤتمتة
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK=true
```

المتغيرات المهمة:

- `VITE_USE_MOCK=true`: تشغيل التطبيق ببيانات وهمية.
- `VITE_USE_MOCK=false`: تفعيل المسار الحقيقي عبر Axios.
- `VITE_API_BASE_URL`: عنوان الـ API الحقيقي لاحقاً.

## 5) بنية المجلدات

```text
src/
├─ components/
│  ├─ common/
│  ├─ features/
│  └─ layout/
├─ config/
├─ constants/
├─ hooks/
├─ mocks/
│  ├─ data/
│  └─ handlers/
├─ pages/
├─ routes/
├─ services/
├─ store/
├─ types/
└─ utils/
```

الشرح العملي:

- `components/common`: مكونات صغيرة قابلة لإعادة الاستخدام مثل الأزرار ورسائل الحالة.
- `components/features`: مكونات مرتبطة بتجربة الصرف نفسها مثل الـ timeline وملخص الوصفة.
- `components/layout`: الغلاف العام للشاشات.
- `config`: بيئة التشغيل وAxios والتبديل بين mock/api.
- `constants`: الثوابت النصية ومخطط مراحل الصرف.
- `hooks`: hook يجهز الحالة المشتقة للتعامل مع الصفحات.
- `mocks/data`: بيانات السيناريوهات الوهمية.
- `mocks/handlers`: منطق تحويل السيناريو إلى استجابة mock.
- `pages`: الشاشات الفعلية.
- `routes`: تعريف المسارات.
- `services`: طبقة الوصول إلى البيانات.
- `store`: حالة الجلسة والرحلة.
- `types`: الأنواع والواجهات الأساسية.
- `utils`: وظائف مساعدة عامة.

## 6) الصفحات بالتسلسل

### `WelcomePage.tsx`

شاشة البداية.

تحتوي على:

- مقدمة واضحة للمريض
- تعليمات أساسية
- زر بدء جلسة جديدة

### `QrScanPage.tsx`

تحاكي شاشة وضع QR داخل الحجرة.

تحتوي على أزرار mock لسيناريوهات:

- QR صالح مع دفع
- QR صالح بدون دفع
- QR صالح مع خطأ ميكانيكي
- QR صالح مع timeout
- وصفة منتهية
- وصفة مستخدمة
- دواء غير متوفر
- QR غير صالح
- QR غير مقروء

### `VerificationPage.tsx`

تعرض حالة التحقق:

- جارٍ التحقق
- تم التحقق
- منتهية
- مستخدمة
- غير متوفرة

### `PaymentPage.tsx`

تعرض:

- ملخص الأدوية
- قيمة الدفع
- طرق الدفع الشكلية
- أزرار محاكاة النجاح أو الفشل أو الإلغاء

### `DispensingPage.tsx`

تعرض:

- timeline للخطوات
- حالة التنفيذ
- النجاح أو الفشل في مرحلة الصرف

### `SuccessPage.tsx`

تعرض:

- نجاح العملية
- رقم العملية
- رقم المعاملة
- كود الاستلام

### `ErrorPage.tsx`

تعرض:

- نوع الفشل
- الوصف
- إعادة المحاولة
- العودة للبداية

## 7) الـ Routing

المسارات معرفة في:

- `src/routes/AppRouter.tsx`

المسارات الحالية:

- `/`
- `/scan`
- `/verification`
- `/payment`
- `/dispensing`
- `/success`
- `/error`

الفكرة المعمارية:

- التوجيه منفصل عن منطق البيانات.
- الصفحات نفسها تسحب الحالة من الـ store.
- إذا لم تتوفر بيانات كافية لمرحلة معيّنة، الصفحة تعيد التوجيه لمرحلة مناسبة.

## 8) المكونات المهمة

### `TabletShell`

الغلاف العام لكل الشاشات.

مسؤوليته:

- توحيد الـ layout
- عرض اسم التطبيق
- عرض وضع التشغيل الحالي Mock/API
- تقسيم الشاشة إلى محتوى رئيسي و aside

### `TouchButton`

زر كبير مناسب للمس مع حالات:

- `primary`
- `secondary`
- `danger`
- `ghost`

### `StatusBanner`

رسالة حالة مرئية للمستخدم.

مناسبة لـ:

- loading
- success
- warning
- danger

### `FlowTimeline`

يعرض تقدم dispensing خطوة بخطوة.

### `PrescriptionSummary`

يعرض:

- بيانات المريض
- الأدوية
- قيمة الطلب
- تغطية التأمين

## 9) الـ Hook المهم

### `useTabletFlowController`

هذا هو hook الرئيسي للواجهة.

وظيفته:

- تحميل بيانات الـ mock الأولية
- إرجاع حالة الـ store
- تجهيز مشتقات جاهزة للعرض مثل:
  - إجمالي العناصر
  - إجمالي المبلغ المنسق
  - وضع التشغيل الحالي

## 10) الـ Store

الملف:

- `src/store/useTabletFlowStore.ts`

يحمل حالة الرحلة كاملة:

- الجلسة الحالية
- السيناريو المختار
- نتيجة القراءة
- نتيجة التحقق
- نتيجة الدفع
- حالة الصرف
- الخطأ الحالي

ويحتوي أيضاً على actions مهمة:

- `initialise`
- `startJourney`
- `scanScenario`
- `verifyActiveScenario`
- `processPayment`
- `runDispensing`
- `prepareRetry`
- `resetFlow`

## 11) الخدمات

### `patientFlowService.ts`

الطبقة الموحدة لكل العمليات المتعلقة بالرحلة.

توفر:

- `getScanPresets`
- `getPaymentMethods`
- `scanScenario`
- `verifyScenario`
- `processPayment`
- `dispenseScenario`

هذا الملف هو أهم نقطة عند التحويل من mock إلى API حقيقي.

## 12) البيانات الوهمية وآلية الـ Mocking

الملفات الأساسية:

- `src/mocks/data/patientFlow.ts`
- `src/mocks/handlers/patientFlowHandlers.ts`

### أين توجد الـ Mock Data؟

في `patientFlow.ts` يوجد:

- طرق الدفع الوهمية
- الوصفات الوهمية
- سيناريوهات القراءة الجاهزة

### ما الموجود داخلها؟

- وصفة صالحة مع دفع
- وصفة صالحة بدون دفع
- خطأ ميكانيكي
- timeout
- وصفة منتهية
- وصفة مستخدمة
- دواء غير متوفر
- QR غير صالح
- QR غير مقروء

### كيف يتم استدعاؤها؟

`patientFlowService` يستدعي `handlers`.

الـ handlers تقوم بتحويل السيناريو إلى:

- `ScanResponse`
- `VerificationResult`
- `PaymentResult`
- `DispensingResult`

### كيف نطفئ الـ Mock؟

1. ضع `VITE_USE_MOCK=false`
2. اترك الصفحات كما هي
3. ابدأ بتعديل دوال `patientFlowService`
4. اجعل Axios يستدعي endpoints حقيقية

## 13) ما الملفات التي يجب تعديلها عند الربط الحقيقي؟

غالباً:

- `src/config/axios.ts`
- `src/services/patientFlowService.ts`
- وربما mapping صغير إذا كانت استجابة الخادم تختلف قليلاً عن الـ types الحالية

## 14) ما الذي يبقى كما هو عند الربط الحقيقي؟

- الصفحات
- الـ components
- الـ routes
- الـ store
- أغلب الـ types
- التنسيقات

## 15) الـ Types / Interfaces المهمة

الملف:

- `src/types/patient-flow.ts`

الأهم داخله:

- `PrescriptionScenario`
- `ScanPreset`
- `ScanResponse`
- `VerificationResult`
- `PaymentResult`
- `DispensingState`
- `DispensingResult`
- `FlowError`

الفائدة المعمارية:

- جعل واجهة العرض مستقلة عن مصدر البيانات.
- تقليل مخاطر التغيير عند الانتقال من mock إلى API.

## 16) تدفق البيانات داخل المشروع

التدفق الحالي:

1. الصفحة تستدعي action من الـ store.
2. الـ store يستدعي `patientFlowService`.
3. الـ service يقرر:
   - mock handler
   - أو Axios API
4. النتيجة تعود إلى الـ store.
5. الصفحة تقرأ الحالة المحدثة من الـ store.

هذا يجعل التبديل بين mock وreal API شفافاً بالنسبة للواجهة.

## 17) كيف نضيف شاشة جديدة؟

مثال عملي:

1. أنشئ ملف الصفحة داخل `src/pages`.
2. إذا احتجت مكونات إضافية، أضفها في `components/common` أو `components/features`.
3. أضف route جديداً في `src/routes/AppRouter.tsx`.
4. إذا كانت الشاشة تحتاج بيانات جديدة، أضف:
   - type جديد
   - mock data
   - handler
   - service method
   - store action عند الحاجة

## 18) كيف نضيف endpoint حقيقي جديد؟

مثال:

إذا أردت إضافة endpoint للتحقق الحقيقي من QR:

1. أضف المسار داخل Back-End.
2. حدّث `patientFlowService.verifyScenario`.
3. أبقِ `VerificationResult` نفسه أو اعمل mapping إليه.
4. لا تغيّر الصفحة إذا لم يتغير العقد البرمجي.

## 19) قرارات معمارية مهمة

- تم إبقاء منطق الرحلة داخل store وليس داخل الصفحات.
- تم منع تناثر البيانات داخل JSX.
- تم الفصل بوضوح بين:
  - `mocks`
  - `services`
  - `store`
  - `pages`
  - `components`
- تم استخدام UI مناسب للمس مع أزرار كبيرة ورسائل واضحة.

## 20) افتراضات ونقاط مؤجلة

- لا يوجد تكامل حقيقي مع قارئ QR أو ESP32 حالياً.
- لا يوجد ربط حقيقي مع بوابة دفع.
- لا توجد أحداث dispensing حقيقية من العتاد.
- بعض الأصول الافتراضية من قالب Vite بقيت داخل `src/assets` لكنها غير مؤثرة وظيفياً.

## 21) ملفات مهمة يجب على المطور التالي قراءتها أولاً

- `src/store/useTabletFlowStore.ts`
- `src/services/patientFlowService.ts`
- `src/mocks/data/patientFlow.ts`
- `src/mocks/handlers/patientFlowHandlers.ts`
- `src/routes/AppRouter.tsx`

هذه الملفات تكفي لفهم البنية الأساسية بسرعة قبل الدخول في التفاصيل البصرية.

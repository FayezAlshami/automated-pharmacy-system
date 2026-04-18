# admin-pharmacist-app

لوحة تحكم الأدمن/الصيدلي ضمن منظومة "الصيدلية المؤتمتة". هذا المشروع مستقل بالكامل عن بقية التطبيقات، ومصمم ليخدم إدارة التشغيل والمخزون والطلبات والمستخدمين على شكل Dashboard احترافي قابل للتوسع لاحقاً.

## 1) الهدف من المشروع

هذه الواجهة تمثل طبقة الإدارة والتشغيل، وتركز حالياً على:

- تسجيل دخول الأدمن أو الصيدلي.
- عرض Dashboard بإحصائيات تشغيلية.
- إدارة الأدوية.
- إدارة التصنيفات.
- إدارة الشركات.
- إدارة الطلبات.
- إدارة طلبات إنشاء حسابات الأطباء القادمة من بوابة الطبيب.
- إدارة المستخدمين.
- إدارة المرضى / المستفيدين.
- عرض صفحة تفاصيل موحدة لأي كيان رئيسي.

كل ما سبق Front-End only حالياً، مع CRUD شكلي محلي على البيانات داخل الواجهة، وتجهيز واضح للانتقال لاحقاً إلى API حقيقي.

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

- `zustand`: لإدارة حالة الجلسة والبيانات المحلية القابلة للتحرير.
- `axios`: لتوحيد طبقة الـ API لاحقاً.
- `lucide-react`: أيقونات حديثة وخفيفة للـ dashboard.
- `clsx`: لتبسيط بعض التركيبات الشرطية في الواجهة.

## 3) طريقة التشغيل خطوة بخطوة

```bash
npm install
npm run dev
```

لفحص lint:

```bash
npm run lint
```

لبناء نسخة production:

```bash
npm run build
```

لمعاينة build محلياً:

```bash
npm run preview
```

## 4) متغيرات البيئة

ملف المثال:

```env
VITE_APP_NAME=لوحة الأدمن والصيدلي - الصيدلية المؤتمتة
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK=true
```

الشرح:

- `VITE_APP_NAME`: اسم اللوحة.
- `VITE_API_BASE_URL`: عنوان الـ API الحقيقي لاحقاً.
- `VITE_USE_MOCK`: تشغيل وضع المحاكاة أو وضع API الحقيقي.

## 5) بنية المجلدات

```text
src/
├─ assets/
├─ components/
│  ├─ common/
│  └─ layout/
├─ config/
├─ constants/
├─ mocks/
│  └─ data/
├─ pages/
├─ routes/
├─ services/
├─ store/
├─ types/
└─ utils/
```

الشرح العملي:

- `components/common`: بطاقات الإحصاءات، الـ modal، شارات الحالة.
- `components/layout`: الإطار الإداري العام `AdminShell`.
- `config`: بيئة المشروع وتهيئة Axios.
- `constants`: عناصر التنقل الجانبي.
- `mocks/data`: البيانات الوهمية التي تمثل الجداول المفهومية.
- `pages`: كل الشاشات الإدارية.
- `routes`: تعريف المسارات العامة والمحمية.
- `services`: طبقة البيانات الموحّدة.
- `store`: الحالة المحلية وعمليات CRUD الشكلية.
- `types`: نماذج TypeScript القريبة من الـ schema المطلوب.
- `utils`: تنسيق القيم، التخزين المحلي، التوليد الشكلي للمعرفات، والتأخير الوهمي.

## 6) شرح الـ Routing

ملف المسارات:

- `src/routes/AppRouter.tsx`

المسارات الحالية:

- `/login`
  تسجيل الدخول.
- `/app/dashboard`
  الصفحة الرئيسية للإحصاءات.
- `/app/drugs`
  إدارة الأدوية.
- `/app/categories`
  إدارة التصنيفات.
- `/app/companies`
  إدارة الشركات.
- `/app/orders`
  إدارة الطلبات.
- `/app/doctor-requests`
  مراجعة طلبات إنشاء حسابات الأطباء.
- `/app/users`
  إدارة المستخدمين.
- `/app/patients`
  إدارة المرضى / المستفيدين.
- `/app/details/:entity/:id`
  صفحة التفاصيل الموحدة.

ملاحظات مهمة:

- `PublicOutlet` يمنع إعادة الدخول إلى صفحة login إذا كانت الجلسة موجودة.
- `ProtectedOutlet` يضمن تهيئة البيانات والجلسة قبل فتح اللوحة.
- كل صفحات الإدارة تعمل داخل `AdminShell`.

## 7) شرح الصفحات

### `LoginPage.tsx`

تسجيل دخول Mock مع حسابين تجريبيين:

- `admin@automed.test`
- `pharmacist@automed.test`

الصفحة تعرض:

- شرح مختصر للغرض من اللوحة.
- أزرار تعبئة سريعة للحسابات التجريبية.
- نموذج دخول بسيط وواضح.

### `DashboardPage.tsx`

تعرض:

- عدد الأدوية.
- عدد الطلبات.
- الطلبات المعلقة.
- المخزون المنخفض.
- العمليات الناجحة.
- العمليات الفاشلة.
- قائمة أدوية منخفضة المخزون.
- آخر الطلبات.

### `DrugsPage.tsx`

صفحة إدارة أدوية احترافية وتحتوي على:

- بحث.
- فلتر مخزون.
- جدول.
- عرض تفاصيل داخل Modal.
- إضافة وتعديل وحذف شكلي.
- رابط إلى صفحة تفاصيل موسعة.

### `CategoriesPage.tsx`

تتيح:

- عرض التصنيفات.
- معرفة عدد الأدوية المرتبط بكل تصنيف.
- إنشاء/تعديل/حذف شكلي عبر Modal.

### `CompaniesPage.tsx`

تتيح:

- عرض الشركات.
- ربط الشركة بتصنيف.
- إضافة/تعديل/حذف شكلي.

### `OrdersPage.tsx`

تتيح:

- فلترة حسب الحالة.
- جدول طلبات.
- تعديل حالة الطلب مباشرة.
- Modal لتفاصيل العناصر داخل الطلب.
- رابط صفحة تفاصيل موسعة.

### `UsersPage.tsx`

تتيح:

- إدارة الأطباء والمساعدين.
- بحث.
- فلترة حسب الدور.
- إضافة/تعديل/حذف شكلي.

### `DoctorRequestsPage.tsx`

تتيح:

- عرض طلبات إنشاء حسابات الأطباء القادمة من بوابة الطبيب.
- بحث بالاسم أو البريد أو التخصص أو العيادة.
- فلترة حسب الحالة.
- فلترة حسب التخصص.
- مراجعة تفاصيل الطلب داخل Modal.
- قبول الطلب أو رفضه أو تحويله إلى "قيد المراجعة".
- نقل الحساب المقبول إلى قائمة المستخدمين بشكل شكلي داخل الواجهة.

### `PatientsPage.tsx`

تتيح:

- البحث في المرضى/المستفيدين.
- عرض العملية المرتبطة.
- إضافة/تعديل/حذف شكلي.
- رابط إلى صفحة التفاصيل الموسعة.

### `DetailsPage.tsx`

صفحة عامة لعرض أي كيان رئيسي:

- دواء.
- طلب.
- مستخدم.
- مريض.

الفكرة هنا هي توفير صفحة تفاصيل مستقلة عن الجداول والـ modals بحيث يسهل توسيعها لاحقاً.

## 8) شرح المكونات المهمة

### `AdminShell`

الغلاف الإداري العام، ومسؤول عن:

- الـ sidebar.
- عرض التنقل الجانبي.
- إظهار اسم المستخدم ودوره.
- top section يوضح طبيعة اللوحة.
- زر تسجيل الخروج.

### `MetricCard`

بطاقة إحصائية قابلة لإعادة الاستخدام داخل dashboard، تعرض:

- العنوان.
- القيمة.
- وصف مساعد.
- أيقونة.

### `StatusPill`

مكوّن صغير لتمييز الحالة بصرياً، ويستخدم في:

- حالات الطلبات.
- حالات المخزون.
- تنبيهات النجاح/الفشل.

### `Modal`

مكوّن موحد لعمليات:

- إنشاء.
- تعديل.
- عرض تفاصيل مختصرة.

وجوده كمكوّن مستقل يمنع تكرار منطق النوافذ المنبثقة بين الصفحات.

## 9) شرح الـ Hooks المهمة

لا يوجد custom hook منفصل حالياً داخل هذا المشروع، وهذا قرار مقصود لأن منطق البيانات الأساسي متمركز داخل Zustand store والخدمات، بينما منطق الصفحات ما يزال واضحاً ومحدوداً.

إذا توسعت اللوحة لاحقاً في البحث أو الفلاتر أو pagination، فمن المناسب إنشاء hooks منفصلة مثل:

- `useTableFilters`
- `useSelectionState`
- `useOptimisticCrud`

## 10) شرح الـ Services

### `authService`

مسؤول عن:

- تسجيل الدخول.
- جلب المستخدم الحالي من التخزين المحلي.

### `inventoryService`

يعيد حزمة المخزون الأساسية:

- التصنيفات.
- الشركات.
- الأدوية.

### `orderService`

يعيد:

- الطلبات.
- تفاصيل الطلبات.

### `userService`

يجلب المستخدمين من نوع الأطباء.

### `doctorSignupRequestService`

يجلب طلبات إنشاء حسابات الأطباء من مصدر البيانات الحالي، سواء كان Mock أو API حقيقي لاحقاً.

### `patientService`

يجلب المرضى/المستفيدين.

### `dashboardService`

في وضع mock يقوم بحساب الإحصاءات من البيانات الموجودة داخل المخزن، وفي وضع API يمكنه لاحقاً الاعتماد على endpoint مخصص للإحصاءات.

## 11) شرح إدارة الحالة

الملف المركزي:

- `src/store/useAdminStore.ts`

يحمل:

- `sessionUser`
- `categories`
- `companies`
- `drugs`
- `doctors`
- `doctorSignupRequests`
- `orders`
- `orderDetails`
- `patients`

ويحتوي على إجراءات أساسية مثل:

- `initialise`
- `login`
- `logout`
- `addCategory`
- `updateCategory`
- `deleteCategory`
- `addCompany`
- `updateCompany`
- `deleteCompany`
- `addDrug`
- `updateDrug`
- `deleteDrug`
- `updateOrderStatus`
- `addDoctor`
- `updateDoctor`
- `deleteDoctor`
- `setDoctorSignupRequestStatus`
- `addPatient`
- `updatePatient`
- `deletePatient`

المخزن هو المصدر المركزي لحالة الـ CRUD الشكلية الحالية.

## 12) شرح الـ Types / Interfaces المهمة

ملف الأنواع:

- `src/types/admin.ts`

أهم الواجهات:

- `AdminSessionUser`
  المستخدم الذي يدخل اللوحة.
- `DoctorRecord`
  تمثيل لسجل الأطباء.
- `DoctorSignupRequestRecord`
  تمثيل لطلب إنشاء حساب طبيب قادم من بوابة الطبيب مع حالة مراجعة داخلية.
- `DrugCategoryRecord`
  تمثيل للتصنيفات.
- `CompanyDrugRecord`
  تمثيل للشركات المرتبطة بالتصنيفات.
- `DrugRecord`
  تمثيل للأدوية داخل المخزون والآلة.
- `OrderRecord`
  تمثيل للطلبات.
- `OrderDetailRecord`
  عناصر كل طلب.
- `CompanyPatientRecord`
  المرضى/المستفيدون.
- `DashboardStats`
  الإحصاءات المحسوبة للوحة الرئيسية.

هذه الواجهات بُنيت بروح الـ schema المطلوب:

- `doctors`
- `drug_category`
- `company_drug`
- `drugs`
- `orders`
- `details_order`
- `company_patients`

## 13) شرح الـ Mock Data / Mocking

الملف الأساسي:

- `src/mocks/data/adminData.ts`

ويحتوي حالياً على:

- 2 مستخدمين إداريين.
- 12 تصنيفاً.
- 10 شركات.
- 48 دواءً.
- 18 طلباً.
- 36 سطراً تقريباً من تفاصيل الطلبات.
- 10 مستخدمين من نوع طبيب/مساعد.
- 9 طلبات إنشاء حسابات أطباء.
- 16 مريضاً/مستفيداً.

أهمية هذا التنظيم:

- البيانات تمثل بنية قريبة من الجداول الفعلية.
- كل صفحة تحصل على بياناتها من طبقة واضحة.
- من السهل لاحقاً استبدال هذا الملف بـ API دون كسر الواجهة.

## 14) أين توجد الـ Mock Data وكيف يتم استدعاؤها؟

المصدر:

- `src/mocks/data/adminData.ts`

الاستهلاك:

- `inventoryService` يقرأ التصنيفات والشركات والأدوية.
- `orderService` يقرأ الطلبات وتفاصيلها.
- `userService` يقرأ الأطباء.
- `doctorSignupRequestService` يقرأ طلبات إنشاء الحسابات القادمة من بوابة الطبيب.
- `patientService` يقرأ المرضى.
- `authService` يقرأ حسابات الدخول.

ثم يقوم `useAdminStore.initialise()` بتجميع هذه الحزم في مكان واحد.

## 15) كيف نلغي الـ Mocking عند الربط مع الباك إند؟

الخطوات العملية:

1. غيّر `.env` إلى:

```env
VITE_USE_MOCK=false
```

2. حدّث:

```env
VITE_API_BASE_URL=https://your-real-api.example.com
```

3. عدّل مسارات Axios داخل:

- `src/services/authService.ts`
- `src/services/inventoryService.ts`
- `src/services/orderService.ts`
- `src/services/userService.ts`
- `src/services/doctorSignupRequestService.ts`
- `src/services/patientService.ts`
- `src/services/dashboardService.ts`

4. أبقِ الصفحات والمخزن كما هي قدر الإمكان.

## 16) ما الملفات التي يجب تعديلها عند الربط الحقيقي؟

غالباً:

- `src/config/axios.ts`
- `src/config/appConfig.ts`
- `src/services/authService.ts`
- `src/services/inventoryService.ts`
- `src/services/orderService.ts`
- `src/services/userService.ts`
- `src/services/doctorSignupRequestService.ts`
- `src/services/patientService.ts`
- `src/services/dashboardService.ts`

وإذا كانت استجابة الخادم تختلف عن الأنواع الحالية، أضف `mapping` داخل الخدمات فقط.

## 17) ما الذي يبقى كما هو عند الانتقال من mock إلى API؟

- `pages`
- `components`
- `routes`
- معظم `store`
- `types`
- جداول الواجهة والـ modals والـ sidebar

هذا هو الهدف المعماري الأساسي للبنية الحالية.

## 18) كيف نحافظ على نفس Interfaces أثناء النقل من mock إلى API؟

التوصية العملية:

- حافظ على `src/types/admin.ts` كعقد داخلي للتطبيق.
- إذا كان الـ API يعيد أسماء حقول مختلفة، قم بتحويلها داخل `services`.
- لا تنقل DTOs خام إلى الصفحات.

مثال مفاهيمي:

- قد يعيد الخادم `createdAt` بينما الواجهة تتوقع `created_at`.
- التحويل يجب أن يحدث في الخدمة، وليس داخل الجدول أو الصفحة.

## 19) شرح تدفق البيانات داخل المشروع

التدفق الحالي:

1. يبدأ التطبيق بقراءة الجلسة المخزنة.
2. `useAdminStore.initialise()` يجلب حزم البيانات من الخدمات بالتوازي.
3. الخدمات تختار بين mock و Axios.
4. المخزن يوزع البيانات على الصفحات.
5. عمليات CRUD الشكلية تحدث داخل المخزن نفسه.
6. الصفحات تعكس النتيجة فوراً دون إعادة تحميل.

هذا يجعل التجربة الحالية سريعة وواضحة، ويعطي قاعدة جيدة لاستبدال العمليات المحلية لاحقاً بطلبات فعلية.

## 20) كيف نضيف صفحة جديدة؟

خطوات عملية:

1. أنشئ الصفحة داخل `src/pages`.
2. إذا احتجت UI قابل لإعادة الاستخدام، أضفه داخل `components/common`.
3. أضف route جديداً في `src/routes/AppRouter.tsx`.
4. أضف عنصر تنقل في `src/constants/navigation.ts` إذا كانت الصفحة تحتاج الظهور في الـ sidebar.
5. إذا احتاجت بيانات جديدة:
   - أضف النوع في `src/types`.
   - أضف mock data مناسباً.
   - أضف خدمة أو وسّع خدمة موجودة.
   - حدث المخزن أو الصفحة بحسب الحاجة.

## 21) كيف نضيف endpoint حقيقي جديد؟

مثال: إضافة صفحة dispensing events مستقبلاً.

1. أضف type جديد في `src/types`.
2. أنشئ service جديداً أو وسّع service قائم.
3. أضف مسار Axios.
4. إن بقي mock mode مفعلاً، أضف نسخة mock موازية.
5. استخدم نفس الواجهة البرمجية في الحالتين.

## 22) شرح أهم ملفات المشروع مفاهيمياً

- `src/routes/AppRouter.tsx`
  يحدد حدود الدخول المحمي والعام.
- `src/components/layout/AdminShell.tsx`
  البنية المرئية الأساسية للوحة.
- `src/store/useAdminStore.ts`
  قلب التطبيق من ناحية البيانات والعمليات الشكلية.
- `src/mocks/data/adminData.ts`
  قاعدة البيانات الوهمية المفهومية.
- `src/services/inventoryService.ts`
  نقطة دخول بيانات المخزون.
- `src/services/orderService.ts`
  نقطة دخول بيانات الطلبات.
- `src/services/doctorSignupRequestService.ts`
  نقطة دخول طلبات إنشاء حسابات الأطباء القادمة من بوابة الطبيب.
- `src/pages/DrugsPage.tsx`
  أفضل مثال على CRUD جدولي محلي داخل اللوحة.

## 23) قرارات معمارية مهمة

- تم فصل dashboard stats في خدمة مستقلة لأن مصدرها قد يصبح endpoint خاصاً لاحقاً.
- تم إبقاء CRUD الحالي داخل المخزن لأن المطلوب Front-End only، ولأن هذا يسهل المحاكاة والتجريب.
- تم تصميم `DetailsPage` كصفحة موحدة قابلة للتوسع بدل إنشاء صفحة منفصلة لكل كيان منذ البداية.
- تم تنظيم الـ mock data بروح الـ schema المطلوب حتى تكون الترجمة إلى قاعدة بيانات حقيقية مباشرة وواضحة.
- تم اعتماد Modal موحد لتقليل تكرار منطق الإنشاء والتعديل.

## 24) افتراضات ونقاط مؤجلة

- لا يوجد حفظ فعلي على الخادم.
- عمليات CRUD الحالية محلية وتزول عند إعادة تحميل كاملة إذا لم تكن الجلسة محفوظة.
- لا يوجد pagination حقيقي لأن البيانات الحالية متوسطة الحجم.
- لا توجد صلاحيات دقيقة role-based access beyond mock login role display.
- لا يوجد audit log فعلي أو history حقيقي للتغييرات.

## 25) ملفات يجب على المطور التالي قراءتها أولاً

- `src/store/useAdminStore.ts`
- `src/mocks/data/adminData.ts`
- `src/services/inventoryService.ts`
- `src/services/orderService.ts`
- `src/services/doctorSignupRequestService.ts`
- `src/pages/DrugsPage.tsx`
- `src/routes/AppRouter.tsx`

هذه الملفات تكفي لفهم الهيكل التشغيلي والبيانات وسلوك الـ CRUD المحلي قبل التوسع أكثر في اللوحة.

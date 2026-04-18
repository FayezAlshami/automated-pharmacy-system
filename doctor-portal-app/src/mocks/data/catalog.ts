import { categoryMeta } from '@/constants/portalMetadata'
import type { Category, Company, Drug } from '@/types/doctor-portal'

const categorySeeds = [
  ['cat-01', 'analgesics'],
  ['cat-02', 'diabetes'],
  ['cat-03', 'cardio'],
  ['cat-04', 'antibiotics'],
  ['cat-05', 'pediatrics'],
  ['cat-06', 'vitamins'],
  ['cat-07', 'digestive'],
  ['cat-08', 'womens-health'],
  ['cat-09', 'dermatology'],
  ['cat-10', 'respiratory'],
  ['cat-11', 'neurology'],
  ['cat-12', 'allergy'],
] as const

const companySeeds = [
  ['cmp-01', 'Nova Health', 'Germany'],
  ['cmp-02', 'Pure Pharma', 'Jordan'],
  ['cmp-03', 'LifeMed', 'Saudi Arabia'],
  ['cmp-04', 'CardioLab', 'France'],
  ['cmp-05', 'EndoCare', 'Switzerland'],
  ['cmp-06', 'Respira', 'UK'],
  ['cmp-07', 'Allergy Plus', 'Turkey'],
  ['cmp-08', 'DigestWell', 'UAE'],
  ['cmp-09', 'Sun Care', 'Netherlands'],
  ['cmp-10', 'DermaCore', 'Italy'],
  ['cmp-11', 'NeuroLine', 'Belgium'],
  ['cmp-12', 'FeminaRx', 'Spain'],
] as const

const drugSeedMap: Record<string, Array<[string, string, string]>> = {
  analgesics: [
    ['بارامول بلس', 'Acetaminophen', '500mg'],
    ['إيبوفين', 'Ibuprofen', '400mg'],
    ['ديكلوماكس', 'Diclofenac', '50mg'],
    ['نابروكسا', 'Naproxen', '250mg'],
    ['سيليكوكسيب', 'Celecoxib', '200mg'],
    ['كيتوبروف', 'Ketoprofen', '100mg'],
    ['بانادين', 'Paracetamol', '650mg'],
    ['ميلوكسا', 'Meloxicam', '15mg'],
  ],
  diabetes: [
    ['جلوكوفاست', 'Metformin', '850mg'],
    ['سيتا كير', 'Sitagliptin', '100mg'],
    ['جليماريل', 'Glimepiride', '2mg'],
    ['إمباجلو', 'Empagliflozin', '10mg'],
    ['ديابازيت', 'Pioglitazone', '15mg'],
    ['لانتوس فليكس', 'Insulin Glargine', 'Pen'],
    ['نوفو رابيد', 'Insulin Aspart', 'Pen'],
    ['فيلدا كير', 'Vildagliptin', '50mg'],
  ],
  cardio: [
    ['كارديولوس', 'Losartan', '50mg'],
    ['بيسوبرول', 'Bisoprolol', '5mg'],
    ['أتورستات', 'Atorvastatin', '20mg'],
    ['أملوديا', 'Amlodipine', '5mg'],
    ['أسبرين كارديو', 'Aspirin', '81mg'],
    ['كلوبيدوغ', 'Clopidogrel', '75mg'],
    ['فالسارتا', 'Valsartan', '80mg'],
    ['سبيرونولا', 'Spironolactone', '25mg'],
  ],
  antibiotics: [
    ['أموكسيكلاف', 'Amoxicillin/Clavulanate', '1g'],
    ['أزيثروكير', 'Azithromycin', '500mg'],
    ['سيفوروك', 'Cefuroxime', '500mg'],
    ['ليفوفلو', 'Levofloxacin', '500mg'],
    ['ميترونيداز', 'Metronidazole', '500mg'],
    ['دوكسيلاين', 'Doxycycline', '100mg'],
    ['كلاريثيرو', 'Clarithromycin', '500mg'],
    ['سيفيكسيم', 'Cefixime', '400mg'],
  ],
  pediatrics: [
    ['باراسيت شراب', 'Paracetamol', '120mg/5ml'],
    ['أزيثرو شراب', 'Azithromycin', '200mg/5ml'],
    ['سيتريزين أطفال', 'Cetirizine', '5mg/5ml'],
    ['فيتامين سي صغار', 'Vitamin C', 'Drops'],
    ['أوميبرازول أطفال', 'Omeprazole', '10mg'],
    ['نيوروفين أطفال', 'Ibuprofen', '100mg/5ml'],
    ['مكمّل زنك', 'Zinc', 'Syrup'],
    ['شراب سعال لطيف', 'Herbal Cough Formula', 'Syrup'],
  ],
  vitamins: [
    ['فيتامين D3', 'Cholecalciferol', '1000 IU'],
    ['حديد بلس', 'Iron Complex', 'Capsules'],
    ['أوميغا بلس', 'Omega 3', '1000mg'],
    ['بي كومبلكس', 'Vitamin B Complex', 'Tablets'],
    ['ماغنسيوم نايت', 'Magnesium', '300mg'],
    ['كالسيوم ماكس', 'Calcium', '600mg'],
    ['زنك فورت', 'Zinc', '25mg'],
    ['مالتي فيتا', 'Multivitamin', 'Capsules'],
  ],
  digestive: [
    ['أوميبرازول', 'Omeprazole', '20mg'],
    ['بانتوبراز', 'Pantoprazole', '40mg'],
    ['لاكتولوز', 'Lactulose', 'Syrup'],
    ['دومبريدون', 'Domperidone', '10mg'],
    ['ميبيفرين', 'Mebeverine', '135mg'],
    ['بروبيوتيك بايو', 'Probiotic Blend', 'Capsules'],
    ['سيميثيكون', 'Simethicone', '80mg'],
    ['أوندانسيترون', 'Ondansetron', '4mg'],
  ],
  'womens-health': [
    ['فيمي فولات', 'Folic Acid', '5mg'],
    ['بروجستيرون كير', 'Progesterone', '200mg'],
    ['كالسيوم حمل', 'Calcium + D', 'Tablets'],
    ['حديد حمل', 'Iron + Folate', 'Capsules'],
    ['مضاد غثيان حمل', 'Doxylamine/Pyridoxine', 'Tablets'],
    ['فيتامينات نسائية', 'Women Multivitamin', 'Capsules'],
    ['كلوتريمازول نسائي', 'Clotrimazole', 'Vaginal Tablets'],
    ['مسكن دورة', 'Mefenamic Acid', '500mg'],
  ],
  dermatology: [
    ['أكرتين', 'Tretinoin', '0.05%'],
    ['كلينداميسين جل', 'Clindamycin', '1%'],
    ['كريم هيدروكورتيزون', 'Hydrocortisone', '1%'],
    ['سيروم نياكيناميد', 'Niacinamide', '10%'],
    ['بانثينول كريم', 'Panthenol', 'Cream'],
    ['واقي شمس ديرما', 'Sunscreen SPF50', 'Lotion'],
    ['أزيليك أسيد', 'Azelaic Acid', '20%'],
    ['مضاد فطريات جلدي', 'Ketoconazole', '2%'],
  ],
  respiratory: [
    ['بخاخ سالبوتامول', 'Salbutamol', '100mcg'],
    ['بوديزونيد', 'Budesonide', '200mcg'],
    ['مونتيلوكاست', 'Montelukast', '10mg'],
    ['لوراتادين تنفسي', 'Loratadine', '10mg'],
    ['شراب مقشع', 'Guaifenesin', 'Syrup'],
    ['محلول ملحي', 'Sodium Chloride', 'Nebules'],
    ['فلوتيكازون', 'Fluticasone', 'Nasal Spray'],
    ['أمبروكسول', 'Ambroxol', '30mg'],
  ],
  neurology: [
    ['غابابنتين', 'Gabapentin', '300mg'],
    ['بريغابالين', 'Pregabalin', '75mg'],
    ['سوماتربتان', 'Sumatriptan', '50mg'],
    ['فيتامين ب12 عصبي', 'Methylcobalamin', '500mcg'],
    ['ليفتي را', 'Levetiracetam', '500mg'],
    ['دولوكستين', 'Duloxetine', '30mg'],
    ['أميتربتيليين', 'Amitriptyline', '25mg'],
    ['توبيراميت', 'Topiramate', '50mg'],
  ],
  allergy: [
    ['سيتريزين', 'Cetirizine', '10mg'],
    ['فيكسوفين', 'Fexofenadine', '120mg'],
    ['لوراتادين', 'Loratadine', '10mg'],
    ['ديسلوراتادين', 'Desloratadine', '5mg'],
    ['كلورفينيرامين', 'Chlorpheniramine', '4mg'],
    ['كريم حساسية', 'Calamine Lotion', 'Lotion'],
    ['بخاخ أنفي للحساسية', 'Mometasone', 'Nasal Spray'],
    ['أقراص شرى', 'Bilastine', '20mg'],
  ],
}

export const mockCategories: Category[] = categorySeeds.map(([id, slug]) => ({
  id,
  slug,
  name: categoryMeta[slug].name.ar,
  description: categoryMeta[slug].description.ar,
  icon: categoryMeta[slug].icon,
  accent: categoryMeta[slug].accent,
  drugCount: drugSeedMap[slug].length,
}))

export const mockCompanies: Company[] = companySeeds.map(([id, name, country], index) => ({
  id,
  name,
  country,
  categoryIds: mockCategories
    .filter((_, categoryIndex) => (categoryIndex + index) % 3 !== 0)
    .map((category) => category.id),
}))

export const mockDrugs: Drug[] = mockCategories.flatMap((category, categoryIndex) =>
  drugSeedMap[category.slug].map(([name, scientificName, dosage], drugIndex) => {
    const categoryKey = category.slug as keyof typeof categoryMeta
    const company = mockCompanies[(categoryIndex + drugIndex) % mockCompanies.length]
    const stock = ((categoryIndex + 3) * (drugIndex + 5) * 3) % 42
    const availability =
      stock === 0 ? 'out_of_stock' : stock < 9 ? 'limited' : 'in_stock'

    return {
      id: `${category.slug}-drug-${drugIndex + 1}`,
      name,
      scientificName,
      categoryId: category.id,
      categoryName: category.name,
      companyId: company.id,
      companyName: company.name,
      dosage,
      description: `${name} ضمن قسم ${category.name}، مع وصف موجز جاهز لكتالوج الطبيب وواجهة التفاصيل.`,
      price: 12000 + categoryIndex * 3500 + drugIndex * 1800,
      stock,
      availability,
      warnings: [...categoryMeta[categoryKey].warnings.ar],
      popular: drugIndex < 3,
      featured: drugIndex === 0 || drugIndex === 4,
      tags: [
        category.name,
        categoryMeta[categoryKey].name.en,
        company.name,
        dosage,
        scientificName,
      ],
    }
  }),
)

export const mockSearchSuggestions = Array.from(
  new Set(mockDrugs.slice(0, 8).flatMap((drug) => [drug.name, drug.scientificName])),
).slice(0, 12)

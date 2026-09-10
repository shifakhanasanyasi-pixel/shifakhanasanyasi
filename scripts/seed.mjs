import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import 'dotenv/config';

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});
const db = getFirestore(app);

const products = [
  {
    slug: "joshina-e-mafasil", name: "Joshina-e-Mafasil", nameUr: "جوشینہ مفاصل",
    category: "Joint Care", categoryUr: "جوڑوں کی دیکھ بھال",
    shortDesc: "Joint & mobility support decoction of shuddha guggul and nirgundi.",
    shortDescUr: "جوڑوں کی حرکت اور سکون کے لیے قدرتی جوشاندہ",
    description: "A classical Unani decoction formulated to ease stiffness and support everyday mobility.",
    descriptionUr: "جوڑوں کی اکڑن کم کرنے کے لیے تیار کردہ کلاسیکی یونانی جوشاندہ۔",
    price: 1450, salePrice: 1250, stock: "in_stock", sku: "SSK-JM-100", weight: "200ml",
    rating: 4.8, reviewCount: 132, featured: true, bestseller: true, published: true,
    tags: ["Herbal", "Classical Recipe"],
    ingredients: [{ en: "Shuddha Guggul", ur: "شدھ گگل" }, { en: "Nirgundi", ur: "نرگنڈی" }],
    benefits: [{ en: "Eases joint stiffness", ur: "جوڑوں کی اکڑن میں کمی" }],
    usage: "Take 30ml twice daily after meals.", usageUr: "کھانے کے بعد دن میں دو بار استعمال کریں۔",
    warnings: "Not recommended during pregnancy without consultation.", warningsUr: "حمل کے دوران مشاورت کے بغیر استعمال نہ کریں۔",
    disclaimer: "This product is a traditional Unani preparation and is not a substitute for professional medical treatment.",
    disclaimerUr: "یہ مصنوعہ روایتی یونانی طریقہ علاج پر مبنی ہے۔",
  },
  {
    slug: "roghan-e-baiza-murgh", name: "Roghan-e-Baiza Murgh", nameUr: "روغن بیضہ مرغ",
    category: "Vitality", categoryUr: "توانائی",
    shortDesc: "Traditional strengthening oil for nerves and vitality.",
    shortDescUr: "اعصاب اور توانائی کے لیے مجرب روغن",
    description: "A time-tested strengthening oil used across generations to support nerve health.",
    descriptionUr: "اعصاب کی مضبوطی کے لیے نسل در نسل استعمال ہونے والا مجرب روغن۔",
    price: 980, salePrice: null, stock: "in_stock", sku: "SSK-RB-050", weight: "100ml",
    rating: 4.7, reviewCount: 88, featured: true, bestseller: false, published: true,
    tags: ["External Use", "Traditional"],
    ingredients: [{ en: "Zafran (saffron)", ur: "زعفران" }, { en: "Sandal", ur: "صندل" }],
    benefits: [{ en: "Strengthens nerves", ur: "اعصاب کی مضبوطی" }],
    usage: "Gently massage onto the scalp and spine before sleep.", usageUr: "سونے سے پہلے مالش کریں۔",
    warnings: "For external use only.", warningsUr: "صرف بیرونی استعمال کے لیے۔",
    disclaimer: "This product is a traditional Unani preparation and is not a substitute for professional medical treatment.",
    disclaimerUr: "یہ مصنوعہ روایتی یونانی طریقہ علاج پر مبنی ہے۔",
  },
  {
    slug: "sharbat-e-dinar", name: "Sharbat-e-Dinar", nameUr: "شربت دینار",
    category: "Digestive Health", categoryUr: "نظام ہاضمہ",
    shortDesc: "Cooling digestive tonic infused with rose and fennel.",
    shortDescUr: "گلاب اور سونف سے تیار ہاضمے کا تونک",
    description: "A refreshing, cooling tonic for the digestive system.",
    descriptionUr: "نظام ہاضمہ کے لیے ٹھنڈک بخش تونک۔",
    price: 720, salePrice: 650, stock: "in_stock", sku: "SSK-SD-750", weight: "750ml",
    rating: 4.9, reviewCount: 210, featured: true, bestseller: true, published: true,
    tags: ["Family Favourite", "Cooling"],
    ingredients: [{ en: "Gulab (rose petals)", ur: "گلاب کی پتیاں" }, { en: "Saunf (fennel)", ur: "سونف" }],
    benefits: [{ en: "Cools the digestive system", ur: "نظام ہاضمہ کو ٹھنڈک" }],
    usage: "Mix 20ml in a glass of water, once or twice daily.", usageUr: "20 ملی لیٹر پانی میں ملا کر استعمال کریں۔",
    warnings: "Diabetics should consult before regular use.", warningsUr: "شوگر کے مریض مشورہ کریں۔",
    disclaimer: "This product is a traditional Unani preparation and is not a substitute for professional medical treatment.",
    disclaimerUr: "یہ مصنوعہ روایتی یونانی طریقہ علاج پر مبنی ہے۔",
  },
  {
    slug: "majoon-e-falasfa", name: "Majoon-e-Falasfa", nameUr: "معجون فلاسفہ",
    category: "Vitality", categoryUr: "توانائی",
    shortDesc: "Classical restorative electuary for stamina and focus.",
    shortDescUr: "قوت اور ارتکاز کے لیے کلاسیکی معجون",
    description: "An electuary prepared from saffron, almonds and a honey base.",
    descriptionUr: "زعفران، بادام اور شہد کی بنیاد سے تیار کردہ معجون۔",
    price: 1650, salePrice: null, stock: "low_stock", sku: "SSK-MF-250", weight: "250g",
    rating: 4.6, reviewCount: 64, featured: false, bestseller: true, published: true,
    tags: ["Classical Recipe", "Limited Batch"],
    ingredients: [{ en: "Zafran (saffron)", ur: "زعفران" }, { en: "Almonds", ur: "بادام" }],
    benefits: [{ en: "Restores stamina", ur: "قوت کی بحالی" }],
    usage: "One teaspoon with warm milk, once daily.", usageUr: "صبح ایک چمچ نیم گرم دودھ کے ساتھ استعمال کریں۔",
    warnings: "Contains honey — not suitable for children under 1 year.", warningsUr: "اس میں شہد شامل ہے۔",
    disclaimer: "This product is a traditional Unani preparation and is not a substitute for professional medical treatment.",
    disclaimerUr: "یہ مصنوعہ روایتی یونانی طریقہ علاج پر مبنی ہے۔",
  },
  {
    slug: "zimad-e-mafasil", name: "Zimad-e-Mafasil", nameUr: "ضماد مفاصل",
    category: "Joint Care", categoryUr: "جوڑوں کی دیکھ بھال",
    shortDesc: "External application for fast joint & muscular pain relief.",
    shortDescUr: "جوڑوں اور پٹھوں کے درد کے لیے بیرونی مرہم",
    description: "A warming external application made from ajwain and mustard oils.",
    descriptionUr: "اجوائن اور سرسوں کے تیل سے تیار کردہ گرم مرہم۔",
    price: 890, salePrice: null, stock: "in_stock", sku: "SSK-ZM-100", weight: "100g",
    rating: 4.5, reviewCount: 41, featured: false, bestseller: false, published: true,
    tags: ["External Use", "Fast Acting"],
    ingredients: [{ en: "Ajwain oil", ur: "اجوائن کا تیل" }, { en: "Sarson (mustard) oil", ur: "سرسوں کا تیل" }],
    benefits: [{ en: "Soothes sore joints", ur: "دردیلے جوڑوں کو سکون" }],
    usage: "Apply and massage gently twice daily.", usageUr: "دن میں دو بار مالش کریں۔",
    warnings: "Avoid contact with eyes.", warningsUr: "آنکھوں سے دور رکھیں۔",
    disclaimer: "This product is a traditional Unani preparation and is not a substitute for professional medical treatment.",
    disclaimerUr: "یہ مصنوعہ روایتی یونانی طریقہ علاج پر مبنی ہے۔",
  },
  {
    slug: "ubtan-e-gulab", name: "Ubtan-e-Gulab", nameUr: "اُبٹن گلاب",
    category: "Skin & Beauty", categoryUr: "جلد کی خوبصورتی",
    shortDesc: "Rose & multani mitti ubtan for a natural, brightened glow.",
    shortDescUr: "قدرتی نکھار کے لیے گلاب اور ملتانی مٹی کا اُبٹن",
    description: "A gentle, traditional ubtan made from rose petals, multani mitti and almonds.",
    descriptionUr: "گلاب کی پتیوں، ملتانی مٹی اور بادام سے تیار روایتی اُبٹن۔",
    price: 650, salePrice: 590, stock: "in_stock", sku: "SSK-UG-150", weight: "150g",
    rating: 4.8, reviewCount: 97, featured: true, bestseller: false, published: true,
    tags: ["Skin Care", "Natural"],
    ingredients: [{ en: "Gulab (rose petals)", ur: "گلاب کی پتیاں" }, { en: "Multani mitti", ur: "ملتانی مٹی" }],
    benefits: [{ en: "Brightens complexion", ur: "رنگت میں نکھار" }],
    usage: "Mix with rose water, apply for 15 minutes, then rinse.", usageUr: "گلاب کے پانی کے ساتھ لگائیں۔",
    warnings: "Patch test recommended before first use.", warningsUr: "پہلے ٹیسٹ کر لیں۔",
    disclaimer: "This product is a traditional Unani preparation and is not a substitute for professional medical treatment.",
    disclaimerUr: "یہ مصنوعہ روایتی یونانی طریقہ علاج پر مبنی ہے۔",
  },
];

async function main() {
  console.log('Seeding Firestore...');
  const batch = db.batch();

  for (const p of products) {
    const ref = db.collection('products').doc(p.slug);
    batch.set(ref, { ...p, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }

  await batch.commit();
  console.log(`Seeded ${products.length} products.`);

  await db.collection('settings').doc('site').set({
    siteName: 'Sanyasi Shifa Khana',
    whatsapp: '923000000000',
    email: 'hello@sanyasishifakhana.com',
    phone: '+92 300 0000000',
    instagram: '',
    facebook: '',
  }, { merge: true });
  console.log('Seeded default site settings.');

  await db.collection('counters').doc('orders').set({ value: 1041 }, { merge: true });
  console.log('Initialized order counter.');

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

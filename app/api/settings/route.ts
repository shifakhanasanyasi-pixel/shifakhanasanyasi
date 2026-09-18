import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/requireAdmin';

const DEFAULTS = {
  siteName: 'Sanyasi Shifa Khana',
  whatsapp: '923000000000',
  email: 'hello@sanyasishifakhana.com',
  phone: '+92 300 0000000',
  instagram: '',
  facebook: '',

  heroEyebrowUr: 'فاضل طب و جراحت — حکیم علی رضا',
  heroEyebrowEn: 'Fazil Tib-o-Jarahat — Hakim Ali Raza',
  heroHeadlineUr: 'قدرت کی حکمت، ہر نسخے میں امانت',
  heroHeadlineEn: "Nature's Hikmat, Prescribed With Trust",
  heroSubheadUr: 'سنیاسی شفا خانہ نسل در نسل چلی آ رہی یونانی حکمت کو جدید معیار اور خالص اجزاء کے ساتھ آپ کے گھر تک پہنچاتا ہے۔',
  heroSubheadEn: 'Sanyasi Shifa Khana brings generations of Unani Hikmat to your door — formulated with pure ingredients and modern quality standards.',

  hakeemNameUr: 'حکیم علی رضا سنیاسی',
  hakeemNameEn: 'Hakeem Ali Raza Sanyasi',
  hakeemTitleUr: 'فاضل طب و جراحت',
  hakeemTitleEn: 'Fazil Tib-o-Jarahat',
  hakeemBio1Ur: 'حکیم علی رضا سنیاسی گزشتہ 28 برسوں سے یونانی طب کی روایت کو عملی طور پر نبھا رہے ہیں۔ انہوں نے اپنی تعلیم مستند اساتذہ سے حاصل کی اور ہزاروں مریضوں کا قدرتی اور محفوظ طریقے سے علاج کیا۔',
  hakeemBio1En: 'Hakeem Ali Raza Sanyasi has practiced Unani medicine for 28 years, trained under respected classical hukama, and has treated thousands of patients using safe, natural methods rooted in centuries-old Hikmat.',
  hakeemBio2Ur: 'ان کا ماننا ہے کہ حقیقی شفا قدرت کے اصولوں سے ہم آہنگ ہو کر ہی ممکن ہے — اسی سوچ کے ساتھ انہوں نے سنیاسی شفا خانہ کی بنیاد رکھی، تاکہ خالص اور مستند حکمت ہر گھر تک پہنچ سکے۔',
  hakeemBio2En: 'He believes true healing comes from working in harmony with nature — a philosophy that led him to found Sanyasi Shifa Khana, bringing pure, authentic Hikmat into every home.',

  statYears: 28,
  statPatients: 50000,
  statFormulations: 60,

  missionTextUr: 'ہر مریض کو خالص، محفوظ اور مؤثر یونانی علاج قابلِ رسائی قیمت پر فراہم کرنا، بغیر کسی مصنوعی مرکبات کے۔',
  missionTextEn: 'To make pure, safe, and effective Unani treatment accessible to every patient — free from synthetic additives.',
  visionTextUr: 'یونانی حکمت کو جدید دور میں ایک قابلِ اعتماد اور مرکزی دھارے کا انتخاب بنانا، نسل در نسل۔',
  visionTextEn: 'To establish Unani Hikmat as a trusted, mainstream choice for modern families, generation after generation.',
  philosophyTextUr: 'حقیقی شفا جسم، ذہن اور قدرت کے توازن سے آتی ہے — ہم علامات نہیں، اصل وجہ کا علاج کرتے ہیں۔',
  philosophyTextEn: 'True healing comes from balancing body, mind, and nature — we treat root causes, not just symptoms.',

  timeline: [
    { year: '1998', titleUr: 'طب کی تعلیم کا آغاز', titleEn: 'Began Studying Tib-o-Jarahat', descUr: 'مستند اساتذہ کی نگرانی میں یونانی طب و جراحت کی باقاعدہ تعلیم شروع کی۔', descEn: 'Began formal training in Unani Tib-o-Jarahat under respected classical hukama.' },
    { year: '2004', titleUr: 'فاضل طب و جراحت کی سند', titleEn: 'Earned Fazil Tib-o-Jarahat', descUr: 'اعلیٰ تعلیمی سند حاصل کی اور مریضوں کا آزادانہ علاج شروع کیا۔', descEn: 'Completed the Fazil Tib-o-Jarahat qualification and began independently treating patients.' },
    { year: '2011', titleUr: 'سنیاسی شفا خانہ کی بنیاد', titleEn: 'Founded Sanyasi Shifa Khana', descUr: 'اپنے کلینک کی بنیاد رکھی تاکہ خالص حکمت کو منظم انداز میں مریضوں تک پہنچایا جا سکے۔', descEn: 'Established the clinic to bring pure Hikmat to patients in a structured, trustworthy setting.' },
    { year: '2026', titleUr: 'آن لائن سفر کا آغاز', titleEn: 'Sanyasi Shifa Khana Goes Online', descUr: 'ہزاروں مریضوں کے اعتماد کے ساتھ، اب یہی حکمت ملک بھر میں آن لائن دستیاب ہے۔', descEn: 'With the trust of thousands of patients, the same Hikmat is now available online, nationwide.' },
  ],

  certifications: [
    { icon: '🎓', titleUr: 'Fazil Tib-o-Jarahat', titleEn: 'Fazil Tib-o-Jarahat', subtitleUr: 'Board of Unani Medicine', subtitleEn: 'Board of Unani Medicine' },
    { icon: '📗', titleUr: 'رجسٹرڈ حکیم', titleEn: 'Registered Hakim', subtitleUr: 'نیشنل کونسل برائے طب', subtitleEn: 'National Council for Tibb' },
    { icon: '🏅', titleUr: '28 سالہ عملی تجربہ', titleEn: '28 Years Clinical Practice', subtitleUr: 'ہزاروں مریضوں کا علاج', subtitleEn: 'Thousands of patients treated' },
  ],

  addressUr: 'لاہور، پاکستان',
  addressEn: 'Lahore, Pakistan',
  hoursWeekday: '10:00 AM – 8:00 PM',
  hoursSaturday: '10:00 AM – 6:00 PM',
  hoursSundayUr: 'بند',
  hoursSundayEn: 'Closed',
};

// GET /api/settings — public
export async function GET() {
  const doc = await db.collection('settings').doc('site').get();
  return NextResponse.json({ ...DEFAULTS, ...(doc.exists ? doc.data() : {}) });
}

// PUT /api/settings — admin only. Accepts the full settings object and
// merges it into the single settings/site document.
export async function PUT(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const update = {
    ...body,
    whatsapp: body.whatsapp ? String(body.whatsapp).replace(/[^0-9]/g, '') : body.whatsapp,
  };

  const ref = db.collection('settings').doc('site');
  await ref.set(update, { merge: true });
  const updated = await ref.get();
  return NextResponse.json({ ...DEFAULTS, ...updated.data() });
}

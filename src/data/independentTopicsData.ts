import { IndependentTopic, PracticalTask } from '../types';

/**
 * RASMIY 15 TA MUSTAQIL TA'LIM MAVZULARI
 * O'qituvchi yuborgan rasmiy tasvir asosida (1 dan 15 gacha)
 */
export const OFFICIAL_INDEPENDENT_TOPICS: IndependentTopic[] = [
  {
    id: 'it-1',
    orderNumber: 1,
    title: "Signallarni membranalar orqali o‘tkazilishi. Membranalar buzilishlarni patologik jarayonni kelib chiqishidagi o‘rni.",
    maxScore: 25,
    description: "Biologik membranalar retseptorlari (G-oqsillar, adenilattsiklaza, fosfolipaza C), ikkilamchi mediatorlar (sAMF, IP3, DAG, Ca2+) va membrana patologiyalari."
  },
  {
    id: 'it-2',
    orderNumber: 2,
    title: "Energiya almashinuvining boshqarilishi.",
    maxScore: 25,
    description: "Hujayra bioenergetikasi, ATF/ADF nisbati, allosterik regulyatsiya va nafas nazorati mexanizmlari."
  },
  {
    id: 'it-3',
    orderNumber: 3,
    title: "Mitoxondrial kasalliklar. Gipoenergetik holatlar.",
    maxScore: 25,
    description: "Nafas zanjiri fermentopatiyalari, mitoxondrial DNK mutatsiyalari, MELAS sindromi va to'qima gipoksiyasi biokimyosi."
  },
  {
    id: 'it-4',
    orderNumber: 4,
    title: "Glikogen kasalliklari.",
    maxScore: 25,
    description: "Glikogenozlar (Girek, Pompa, Kori, Andersen, Mak-Ardl) va aglikogenozlar, ferment defitsitlari hamda ularning klinik ko'rinishlari."
  },
  {
    id: 'it-5',
    orderNumber: 5,
    title: "Glyukoza tashuvchilarining tuzilishi, spetsifikligi, klinik ahamiyati.",
    maxScore: 25,
    description: "GLUT oilasi oqsillari (GLUT1–GLUT5), to'qimalarga xos taqsimoti, insulin ta'sir mexanizmi va metabolik sindromdagi o'rni."
  },
  {
    id: 'it-6',
    orderNumber: 6,
    title: "Surunkali gepatitlar va xoletsistitlarda yog‘lar hazmlanishini buzilishi.",
    maxScore: 25,
    description: "O't kislotalari entero-gepatik sirkulyatsiyasi, emulsiyalanish buzilishi, lipaza yetishmovchiligi va steatoreya patobiokimyosi."
  },
  {
    id: 'it-7',
    orderNumber: 7,
    title: "Yog‘ kislotalarini α-omega oksidlanishi, ahamiyati, buzilishlari.",
    maxScore: 25,
    description: "Tarmoqlangan va uzun zanjirli yog' kislotalarining alfa- va omega-oksidlanishi, Refsum kasalligi va mikrosomal fermentlar."
  },
  {
    id: 'it-8',
    orderNumber: 8,
    title: "Geteropolisaxaridlarni ontogenez va kasalliklarda o‘zgarishi.",
    maxScore: 25,
    description: "Glikozaminoglikanlar (xondroitinsulfat, gialuronat), proteoglikanlar va irsiy mukopolisaxaridozlar (Gyurler, Xanter sindromlari)."
  },
  {
    id: 'it-9',
    orderNumber: 9,
    title: "Lipidlarni peroksidlanishi va hujayra shikastlanishi patogenezidagi ahamiyati.",
    maxScore: 25,
    description: "Erkin radikallar hosil bo'lishi, LPO bosqichlari, malondialdegid (MDA) va antioksidant fermentlar (SOD, katalaza, glutation peroksidaza)."
  },
  {
    id: 'it-10',
    orderNumber: 10,
    title: "Xolesterin tashilishida qatnashuvchi apo oqsillar. Yog‘ bosish, semirish. Sfingolipidozlar.",
    maxScore: 25,
    description: "Apolipoproteinlar (ApoA-I, ApoB-100, ApoE), xolesterin reverstransporti, adipootsitlar disfunksiyasi va irsiy sfingolipidozlar (Goshe, Niman-Pik)."
  },
  {
    id: 'it-11',
    orderNumber: 11,
    title: "Qandli diabet va ochlikda ketonuriya va ketonemiya.",
    maxScore: 25,
    description: "Keton tanachalar sintezi va utilizatsiyasi yo'llari, diabetik ketoatsidoz patogenezi va laborator tekshiruvi."
  },
  {
    id: 'it-12',
    orderNumber: 12,
    title: "Oshqozon suyuqligi tashhisining klinik ahamiyati.",
    maxScore: 25,
    description: "Me'da shirasida HCl sekretsiyasi (proton pompasi H+/K+-ATFaza), erkin va bog'langan HCl, gastrit hamda yara kasalligi differensial tashxisi."
  },
  {
    id: 'it-13',
    orderNumber: 13,
    title: "Parenteral ovqatlanish va uning klinik ahamiyati.",
    maxScore: 25,
    description: "To'liq parenteral oziqlantirish (TPN) eritmalarining biokimyoviy tarkibi (aminokislotalar, glyukoza, yog' emulsiyalari), ko'rsatmalar va metabolik monitoring."
  },
  {
    id: 'it-14',
    orderNumber: 14,
    title: "O‘tkir pankreatit kelib chiqishi va davolashning biokimyoviy asoslari.",
    maxScore: 25,
    description: "Pankreatik zimogenlarning autokatalitik erta faollashuvi (tripsin, elastaza, lipaza), to'qima autolizi va proteaza ingibitorlari bilan davolash."
  },
  {
    id: 'it-15',
    orderNumber: 15,
    title: "Katepsinlar, ularning klinik ahamiyati.",
    maxScore: 25,
    description: "Lizosoma proteazalari (Katepsin B, D, L), autofagiya, to'qima remodellanishi, yallig'lanish hamda o'sma metastazlanishidagi roli."
  }
];

/**
 * 10 TA AMALIY MASHG'ULOT UCHUN BIRIKTIRILGAN VAZIFALAR VA KLINIK TOPSHIRIQLAR
 * O'qituvchi istalgan vaqtda ushbu vazifalarni tahrirlashi, o'chirishi yoki yangi vazifa yuborishi mumkin.
 */
export const INITIAL_PRACTICAL_TASKS: PracticalTask[] = [
  {
    id: 'ptask-a1',
    practicalNumber: 1,
    practicalCode: 'A1',
    topicTitle: "Biokimyo fani, fermentlar va moddalar almashinuviga kirish.",
    taskTitle: "1-amaliyot: Fermentlar kinetikasi va diagnostik enzimologiya masalalari",
    content: `1. Quyidagi fermentlarning faollashuv mexanizmini tushuntiring: zimogenlar qanday qilib faol holatga o'tadi?
2. Bemor qon zardobida ALT va AST miqdori normadan 5 baravar oshgan. Bu holat qaysi a'zo zararlanishiga xos? De Ritis koeffitsiyentini hisoblash formulasini yozing.
3. Raqobatli va raqobatsiz ingibitorlarning Km va Vmax ga ta'sirini grafikda ifodalang.`,
    deadlineDate: '2026-10-15',
    assignedGroupIds: ['all'],
    maxScore: 100,
    status: 'active',
    createdAt: '2026-10-01'
  },
  {
    id: 'ptask-a2',
    practicalNumber: 2,
    practicalCode: 'A2',
    topicTitle: "Biologik oksidlanish.",
    taskTitle: "2-amaliyot: Mitoxondriya nafas zanjiri ingibitorlari va gipoksiya",
    content: `1. Nafas zanjirining IV kompleksi (Sitoxromoksidaza) sianid va uglerod oksidi (CO) bilan ingibirlanganda hujayrada ATF sintezi nega to'xtaydi?
2. Ajratuvchi moddalar (2,4-dinitrofenol, termogenin) oksidlanish va fosforillanish bog'lanishiga qanday ta'sir qiladi?
3. Bemor og'ir gipoksiya holatida shifoxonaga keltirildi. Qonda sut kislotasi (laktat) to'planishining biokimyoviy mexanizmini yozing.`,
    deadlineDate: '2026-10-20',
    assignedGroupIds: ['all'],
    maxScore: 100,
    status: 'active',
    createdAt: '2026-10-02'
  },
  {
    id: 'ptask-a3',
    practicalNumber: 3,
    practicalCode: 'A3',
    topicTitle: "Uglevodlar hazmlanishi va glikoliz.",
    taskTitle: "3-amaliyot: Anaerob va aerob glikoliz energetikasi",
    content: `1. 1 mol glyukoza aerob glikolizda to'liq CO2 va H2O gacha parchalanganda necha mol ATF hosil bo'ladi?
2. Qon eritrotsitlarida mitoxondriya yo'qligi sababli ATF qaysi reaksiyalar orqali sintezlanadi?
3. Fosfofruktokinaza-1 (FFK-1) fermentining allosterik aktivatorlari va ingibitorlarini sanang.`,
    deadlineDate: '2026-10-27',
    assignedGroupIds: ['all'],
    maxScore: 100,
    status: 'active',
    createdAt: '2026-10-03'
  },
  {
    id: 'ptask-a4',
    practicalNumber: 4,
    practicalCode: 'A4',
    topicTitle: "Glikogenoliz va glikogenez. Glyukoneogenez.",
    taskTitle: "4-amaliyot: Glikogen almashinuvi buzilishlari va gipoglikemiya",
    content: `1. 6 oylik bolada qorinda gepatomegaliya va och qolganda kuchli gipoglikemiya aniqlandi. Glyukoza-6-fosfataza yetishmovchiligi (Girek kasalligi) patogenezini tushuntiring.
2. Glyukoneogenezning cheklovchi fermentlari (Piruvatkarboksilaza, FEP-karboksikinaza) va ularning gormonal regulyatsiyasi.
3. Kori sikli (glyukoza-laktat sikli) qaysi a'zolar o'rtasida kechadi va uning fiziologik ahamiyati nima?`,
    deadlineDate: '2026-11-03',
    assignedGroupIds: ['all'],
    maxScore: 100,
    status: 'active',
    createdAt: '2026-10-04'
  },
  {
    id: 'ptask-a5',
    practicalNumber: 5,
    practicalCode: 'A5',
    topicTitle: "Pentozafosfat yo'li. Qandli diabet biokimyosi.",
    taskTitle: "5-amaliyot: Eritrotsitlar antioksidant himoyasi va diabetik asoratlar",
    content: `1. Pentozafosfat yo'lida hosil bo'ladigan NADFH+H+ qaysi biosintez va himoya jarayonlarida sarflanadi?
2. Glyukoza-6-fosfatdegidrogenaza (G6FDG) fermenti yetishmovchiligida sulfanilamidlar qabul qilgandan so'ng nega gemolitik anemiya kelib chiqadi?
3. 1-tur qandli diabetda insulin yetishmovchiligi natijasida to'qimalarda glyukoza o'zlashtirilishi buzilishi va giperglikemiya mexanizmini yozing.`,
    deadlineDate: '2026-11-10',
    assignedGroupIds: ['all'],
    maxScore: 100,
    status: 'active',
    createdAt: '2026-10-05'
  },
  {
    id: 'ptask-a6',
    practicalNumber: 6,
    practicalCode: 'A6',
    topicTitle: "Oddiy lipidlar hazmlanishi va yog' kislotalarining β-oksidlanishi.",
    taskTitle: "6-amaliyot: Yog' kislotalarining mitoxondriyaga o'tishi va beta-oksidlanish",
    content: `1. Palmitin kislotasi (C16) to'liq beta-oksidlanishga uchraganda jami sof necha mol ATF hosil bo'ladi (hisob-kitobni keltiring)?
2. Karnitin-palmitoiltransferaza-1 (KPT-1) fermenti yetishmovchiligida nima uchun mushak holsizligi va kardiomiopatiya rivojlanadi?
3. Oshqozon osti bezi lipazasi ingibitori (Orlistat) semirishni davolashda qanday biokimyoviy mexanizmga asoslanadi?`,
    deadlineDate: '2026-11-17',
    assignedGroupIds: ['all'],
    maxScore: 100,
    status: 'active',
    createdAt: '2026-10-06'
  },
  {
    id: 'ptask-a7',
    practicalNumber: 7,
    practicalCode: 'A7',
    topicTitle: "Keton tanachalar biosintezi va lipidlar peroksidlanishi.",
    taskTitle: "7-amaliyot: Keton tanachalar sintezi va diabetik ketoatsidoz",
    content: `1. Jigarda keton tanachalar (atsetoatsetat, beta-gidroksibutirat, atseton) sintezi qaysi oraliq mahsulot to'planganda kuchayadi?
2. Jigar hujayralari nima uchun o'zi sintezlagan keton tanachalarni energiya manbai sifatida ishlata olmaydi?
3. Bemor nafasidan chirigan olma hidi (atseton) kelmoqda, qonda glyukoza 18 mmol/l. Siydikda ketonuriya aniqlandi. Davolash tamoyillarini biokimyoviy nuqtai nazardan tushuntiring.`,
    deadlineDate: '2026-11-24',
    assignedGroupIds: ['all'],
    maxScore: 100,
    status: 'active',
    createdAt: '2026-10-06'
  },
  {
    id: 'ptask-a8',
    practicalNumber: 8,
    practicalCode: 'A8',
    topicTitle: "Murakkab lipidlar, xolesterin biosintezi va ateroskleroz.",
    taskTitle: "8-amaliyot: Xolesterin biosintezi va statinlar farmakobiokimyosi",
    content: `1. Xolesterin biosintezining asosiy tezlikni cheklovchi fermenti (GMG-KoA reduktaza) qanday ingibirlanadi?
2. Statin guruhiga mansub dori vositalari (atorvastatin, rozuvastatin) qaysi mexanizm orqali qondagi xolesterinni kamaytiradi?
3. Fosfatidilxolin (letsitin) va fosfatidiletanolamin sintezida ATF va KTF ning roli.`,
    deadlineDate: '2026-12-01',
    assignedGroupIds: ['all'],
    maxScore: 100,
    status: 'active',
    createdAt: '2026-10-06'
  },
  {
    id: 'ptask-a9',
    practicalNumber: 9,
    practicalCode: 'A9',
    topicTitle: "Lipoproteinlar va gipolipoproteinemiyalar.",
    taskTitle: "9-amaliyot: Qon plazmasi lipoproteinlari va aterogenlik indeksi",
    content: `1. Xilomikronlar, ZJLP (VLDL), ZBLP (LDL) va ZYuLP (HDL) larning kelib chiqishi va asosiy tashuvchi funksiyalari.
2. Aterogenlik koeffitsiyentini hisoblash: Ak = (Umumiy xolesterin - ZYuLP) / ZYuLP. Bemor tahlilida Ak = 4.8 chiqdi. Bu nimani anglatadi?
3. ApoB-100 retseptorlari mutatsiyasi oqibatida oilaviy giperxolesterinemiya rivojlanish mexanizmi.`,
    deadlineDate: '2026-12-08',
    assignedGroupIds: ['all'],
    maxScore: 100,
    status: 'active',
    createdAt: '2026-10-06'
  },
  {
    id: 'ptask-a10',
    practicalNumber: 10,
    practicalCode: 'A10',
    topicTitle: "Oqsillar hazmlanishi, aminokislotalar almashinuvining umumiy yo'llari va alohida aminokislotalar almashinuvi.",
    taskTitle: "10-amaliyot: Ammiakni zararsizlantirish, mochevina sikli va fenilketonuriya",
    content: `1. Organizmda ammiak qaysi yo'llar orqali hosil bo'ladi va uning neyrotoksiklik mexanizmi nimada?
2. Mochevina (ornetin) siklining jigar mitoxondriyasi va sitoplazmasida kechuvchi reaksiyalari.
3. Fenilalanin-4-monooksigenaza fermenti yetishmovchiligida fenilketonuriya (FKU) rivojlanishi va uning neonatal skriningi.`,
    deadlineDate: '2026-12-15',
    assignedGroupIds: ['all'],
    maxScore: 100,
    status: 'active',
    createdAt: '2026-10-06'
  }
];

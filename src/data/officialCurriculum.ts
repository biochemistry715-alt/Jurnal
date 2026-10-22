import { CurriculumTopic } from '../types';

export const OFFICIAL_CURRICULUM: CurriculumTopic[] = [
  // ==========================================
  // SIZ YUBORGAN 12 TA RASMIY MA'RUZA MAVZUSI (M1 - M12)
  // ==========================================
  {
    id: 'lec-m1',
    code: 'M1',
    order: 1,
    type: 'maruza',
    title: 'Biokimyo moduliga kirish. Moddalar almashinuvi va membranalar biokimyosi.',
    hours: 2,
    weekDefault: 1,
    description: "Biokimyo fanining predmeti, vazifalari va biologik ahamiyati. Modda almashinuvi: ovqatlanish, metabolizm va metabolizm mahsulotlarini chiqarib yuborish yo'llari. Inson ovqati tarkibi: asosiy va minor qismlar. Metabolizm, metabolik yo'llar to'g'risida tushuncha. Biologik membranalar, moddalarning transporti."
  },
  {
    id: 'lec-m2',
    code: 'M2',
    order: 2,
    type: 'maruza',
    title: 'Fermentlarning tuzilishi, xususiyatlari.',
    hours: 2,
    weekDefault: 2,
    description: "Fermentlarning kimyoviy tabiati, tuzilishi va umumiy xossalari. Fermentativ reaksiyalar kinetikasi va fermentlar tasnifi. Fermentlar faolligining boshqarilishi va klinik ahamiyati. Fermentlar bilan bog'liq patologik holatlar."
  },
  {
    id: 'lec-m3',
    code: 'M3',
    order: 3,
    type: 'maruza',
    title: 'Biologik oksidlanish.',
    hours: 2,
    weekDefault: 3,
    description: "Biologik oksidlanish to'g'risida umumiy tushuncha. Biologik oksidlanishda ishtirok etuvchi fermentlar. Elektron tashish zanjiri (ETZ). ADFning fosforillanishi (substratli va oksidlanishli fosforillanish)."
  },
  {
    id: 'lec-m4',
    code: 'M4',
    order: 4,
    type: 'maruza',
    title: 'Katabolizmning umumiy yo\'llari.',
    hours: 2,
    weekDefault: 4,
    description: "Katabolizm umumiy yo'lining sxemasi va uning bosqichlari. Piruvatdegidrogenaza multiferment kompleksi tarkibi. Piruvatning oksidlanib dekarboksillanishi va atsetil-KoAning hosil bo'lishi. Limon kislota xalkasi, uning vazifalari va boshqarilishi. Nafas zanjiri bilan bog'liqligi."
  },
  {
    id: 'lec-m5',
    code: 'M5',
    order: 5,
    type: 'maruza',
    title: 'Karbonsuvlar almashinuvi – I qism. Glyukozaning sarflanish yo\'llari. Glikogen almashinuvi. Glikoliz.',
    hours: 2,
    weekDefault: 5,
    description: "So'rilgan monosaxaridlarning organizmdagi sarflanish yo'llari. Glikogen sintezi, parchalanishi va uning fiziologik axamiyati. Glyukoza katabolizmi. Aerob va anaerob glikoliz, ularning tarqalishi va axamiyati."
  },
  {
    id: 'lec-m6',
    code: 'M6',
    order: 6,
    type: 'maruza',
    title: 'Karbonsuvlar almashinuvi – II qism. Glyukoneogenez. Pentozfosfat yo\'li.',
    hours: 2,
    weekDefault: 6,
    description: "Glyukoneogenez. Sut kislotadan glyukoza hosil bo'lishi yo'li. Kori va glyukoza-alanin xalkasi. Glikoliz va glyukoneogenezning kalit fermentlari va ular orqali boshqarilishi. Glyukoza oksidlanishining pentozfosfat yo'li va uning axamiyati."
  },
  {
    id: 'lec-m7',
    code: 'M7',
    order: 7,
    type: 'maruza',
    title: 'Lipidlar – I qism. Lipidlar transporti. Lipoproteinlar. Triglitseridlar.',
    hours: 2,
    weekDefault: 7,
    description: "Yog'larning ichak devorida resintezlanishi. Xilomikronlarning hosil bo'lishi va yog'larni tashilishi. Lipoproteinlar, lipoproteinlipaza fermentining axamiyati. Yog'larni parchalanishi va oksidlanishi. Triglitseridlipaza faolligi oshishining shalola mexanizmi."
  },
  {
    id: 'lec-m8',
    code: 'M8',
    order: 8,
    type: 'maruza',
    title: 'Lipidlar – II qism. Yog\'kislotalari biosintezi. Fosfolipidlar.',
    hours: 2,
    weekDefault: 8,
    description: "Yog'kislotalari biosintezi va uning boshqarilishi. Asosiy fosfolipidlar, glikolipidlar va ularning vazifalari. Fosfolipidlar biosintezi va katabolizmi to'g'risida tushuncha."
  },
  {
    id: 'lec-m9',
    code: 'M9',
    order: 9,
    type: 'maruza',
    title: 'Oddiy oqsillar – I qism. Oqsillarning hazmlanishi. Ammiak almashinuvi.',
    hours: 2,
    weekDefault: 9,
    description: "Organizmdagi oqsillarning dinamik holati. Katepsinlar. Oqsillarning biologik qiymati. Oqsil zahiralari. Oqsillarning hazmlanishi. Proteinazalarning substrat spetsifikligi. Aminokislotalarning so'rilishi. Oshqozon-ichak yo'llari kasalliklarining bioximik asoslari. Parenteral ovqatlanish. Organizmda ammiakning asosiy manbalari. Azot almashinuvining oxirgi mahsulotlari: ammoniy tuzlari va siydikchil. Siydikchil sintezi va chiqarilishining buzilishi."
  },
  {
    id: 'lec-m10',
    code: 'M10',
    order: 10,
    type: 'maruza',
    title: 'Oddiy oqsillar – II qism. Aminokislotalar almashinuvi yo\'llari. Biogen aminlar.',
    hours: 2,
    weekDefault: 10,
    description: "Aminokislotalar almashinuvining yo'llari: dezaminlanish, transaminlanish. Aminotransferazalar, B6 vitaminining kofermentlik vazifasi. Aminokislotalarning dekarboksillanishi. Biogen aminlar: gistamin, serotonin, aminomoy kislota, katexolaminlar hosil bo'lishi va funksiyalari."
  },
  {
    id: 'lec-m11',
    code: 'M11',
    order: 11,
    type: 'maruza',
    title: 'Murakkab oqsillar almashinuvi. Nukleoproteidlar almashinuvi.',
    hours: 2,
    weekDefault: 11,
    description: "Nukleoproteidlarning hazmlanishi va so'rilishi. Purin nukleotidlari sintezi va purin nukleotidlarining parchalanishi. Pirimidin nukleotidlarining parchalanishi va biosintezi. Uridil kislota biosintezi. Purin va pirimidin nukleotidlari biosintezining boshqarilishi va buzilishlari (giperurikemiya, oratatsiduriya)."
  },
  {
    id: 'lec-m12',
    code: 'M12',
    order: 12,
    type: 'maruza',
    title: 'DNK va irsiyat. Replikatsiya. RNK sintezi (transkripsiya).',
    hours: 2,
    weekDefault: 12,
    description: "DNKning tuzilishi, biologik xossalari va irsiyatdagi ahamiyati. DNK biosintezi va replikatsiyaning molekulyar asoslari. RNK turlari va ularning hujayradagi funktsional ahamiyati. Transkripsiyaning mohiyati va RNK biosintezining biologik ahamiyati."
  },

  // ==========================================
  // SIZ YUBORGAN 10 TA AMALIY MASHG'ULOT MAVZUSI (A1 - A10)
  // ==========================================
  {
    id: 'pra-a1',
    code: 'A1',
    order: 13,
    type: 'amaliy',
    title: 'Biokimyo fani, fermentlar va moddalar almashinuviga kirish.',
    hours: 2,
    weekDefault: 1
  },
  {
    id: 'pra-a2',
    code: 'A2',
    order: 14,
    type: 'amaliy',
    title: 'Biologik oksidlanish.',
    hours: 2,
    weekDefault: 2
  },
  {
    id: 'pra-a3',
    code: 'A3',
    order: 15,
    type: 'amaliy',
    title: 'Katabolizmning umumiy yo\'llari va ahamiyati.',
    hours: 2,
    weekDefault: 3
  },
  {
    id: 'pra-a4',
    code: 'A4',
    order: 16,
    type: 'amaliy',
    title: 'Karbonsuvlarning xazmlanishi, glikogen sintezi va parchalanishi.',
    hours: 2,
    weekDefault: 4
  },
  {
    id: 'pra-a5',
    code: 'A5',
    order: 17,
    type: 'amaliy',
    title: 'Glikoliz, glyukoza biosintezi, glikoliz va glyukoneogenezning boshqarilishi.',
    hours: 2,
    weekDefault: 5
  },
  {
    id: 'pra-a6',
    code: 'A6',
    order: 18,
    type: 'amaliy',
    title: 'Fruktoza va galaktoza almashinuvi. Pentozofosfat yo\'li va gormonlar orqali boshqarilish.',
    hours: 2,
    weekDefault: 6
  },
  {
    id: 'pra-a7',
    code: 'A7',
    order: 19,
    type: 'amaliy',
    title: 'Lipidlarning tuzilishi, funksiyasi va metabolizmi.',
    hours: 2,
    weekDefault: 7
  },
  {
    id: 'pra-a8',
    code: 'A8',
    order: 20,
    type: 'amaliy',
    title: 'Lipidlarning oraliq almashinuvi. Murakkab yog\'lar almashinuvi.',
    hours: 2,
    weekDefault: 8
  },
  {
    id: 'pra-a9',
    code: 'A9',
    order: 21,
    type: 'amaliy',
    title: 'Yog\'lar almashinuvining buzilishi.',
    hours: 2,
    weekDefault: 9
  },
  {
    id: 'pra-a10',
    code: 'A10',
    order: 22,
    type: 'amaliy',
    title: 'Oqsillar hazmlanishi, aminokislotalar almashinuvining umumiy yo\'llari va alohida aminokislotalar almashinuvi.',
    hours: 2,
    weekDefault: 10
  }
];

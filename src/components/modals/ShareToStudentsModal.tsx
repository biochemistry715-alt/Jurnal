import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  MessageSquare,
  Globe,
  Users,
  GraduationCap,
  Calendar,
  Sparkles,
  Phone,
  Shield,
  Lock,
  ExternalLink,
  BookOpen,
  ListOrdered
} from 'lucide-react';
import { StudentGroup, WeeklyScheduleSlot, CurriculumTopic } from '../../types';
import { calculateSlotDate, getWeekDates } from '../../utils/academicCalendar';
import { getPublicStudentLink, getTeacherLink, copyTextFallback } from '../../utils/shareUtils';

interface ShareToStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: StudentGroup[];
  schedule: WeeklyScheduleSlot[];
  curriculum: CurriculumTopic[];
  selectedWeek?: number;
  teacherName: string;
}

export const ShareToStudentsModal: React.FC<ShareToStudentsModalProps> = ({
  isOpen,
  onClose,
  groups,
  schedule,
  curriculum,
  selectedWeek = 4,
  teacherName
}) => {
  const [activeTab, setActiveTab] = useState<'individual_links' | 'telegram_message'>('individual_links');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [week, setWeek] = useState<number>(selectedWeek);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedAllSummary, setCopiedAllSummary] = useState(false);
  const [copiedTeacherLink, setCopiedTeacherLink] = useState(false);
  const [copiedGroupMap, setCopiedGroupMap] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const teacherPhone = '+998 99 839 98 80';
  const teacherPhoneClean = '+998998399880';
  const teacherTelegram = '@Biochemistry715';
  const teacherTelegramUrl = 'https://t.me/Biochemistry715';

  const targetGroup = groups.find((g) => g.id === selectedGroupId);
  const weekDates = getWeekDates(week);

  const studentLink = targetGroup
    ? getPublicStudentLink(targetGroup.name)
    : getPublicStudentLink();

  // Filter schedule slots for this group if selected, otherwise all slots
  const relevantSlots = schedule.filter((s) => {
    if (selectedGroupId === 'all') return true;
    if (s.matchingGroupId === selectedGroupId) return true;
    if (targetGroup?.isLectureFlow && targetGroup.constituentGroupIds) {
      return targetGroup.constituentGroupIds.includes(s.matchingGroupId || '');
    }
    return s.groupCode.replace(/\s+/g, '').toLowerCase().includes(targetGroup?.name.replace(/\s+/g, '').toLowerCase() || '');
  });

  // Generate formatted text message for Telegram
  const generateTelegramText = (grp?: StudentGroup) => {
    const isWeek4 = week === 4;
    const currentTarget = grp || targetGroup;
    const link = currentTarget ? getPublicStudentLink(currentTarget.name) : studentLink;

    let text = `📢 HURMATLI TALABALAR!\n`;
    text += `🗓 ${isWeek4 ? "19-oktyabrdan 4-HAFTA" : `${week}-hafta`} darslari (${weekDates.formattedRange}).\n`;
    text += `🏛 Fan: Biologik kimyo\n`;
    text += `👨‍🏫 O'qituvchi: ${teacherName}\n`;
    if (currentTarget) {
      text += `👥 Guruh: ${currentTarget.name} (${currentTarget.faculty})\n`;
    }

    const slotsForGrp = schedule.filter((s) => {
      if (!currentTarget) return true;
      if (s.matchingGroupId === currentTarget.id) return true;
      if (currentTarget.isLectureFlow && currentTarget.constituentGroupIds) {
        return currentTarget.constituentGroupIds.includes(s.matchingGroupId || '');
      }
      return s.groupCode.replace(/\s+/g, '').toLowerCase().includes(currentTarget.name.replace(/\s+/g, '').toLowerCase());
    });

    if (slotsForGrp.length > 0) {
      text += `\n⏰ DARSLAR JADVALI VA MAVZULARI:\n`;
      slotsForGrp.forEach((slot) => {
        const dateInfo = calculateSlotDate(week, slot.dayOfWeek);
        const isLecture = slot.type === 'maruza';
        const effectiveLesson = dateInfo.effectiveLessonNumber;

        const topic = curriculum.find(
          (c) => c.type === slot.type && c.order === effectiveLesson
        );

        text += `\n🔹 ${dateInfo.dayNameUz} (${dateInfo.formattedDate}), ${slot.pairNumber}-para (${slot.pairTime}):\n`;
        text += `   • Guruh: ${slot.groupCode} | Xona: ${slot.room}-auditoriya\n`;
        text += `   • Dars turi: ${isLecture ? "Ma'ruza (Oqim)" : "Amaliy mashg'ulot"} (${effectiveLesson}-dars)\n`;
        if (topic) {
          text += `   • Mavzu: ${topic.title}\n`;
        }
      });
    }

    text += `\n🔗 TALABALAR PORTAL HAVOLASI (Faqat ${currentTarget ? currentTarget.name : 'sizning'} guruhingiz uchun):\n`;
    text += `👉 ${link}\n\n`;
    text += `Portalda siz:\n`;
    text += `✅ O'z guruhingiz dars jadvali va sanalarini ko'rishingiz;\n`;
    text += `✅ Qaysi mavzularni topshirmaganligingiz (NB va qarzdorliklar) ro'yxatini bilishingiz;\n`;
    text += `✅ Dars topshirganligingiz tasdig'i va konspekt holatini ko'rishingiz;\n`;
    text += `✅ 15 ta Mustaqil ta'lim mavzularidan sizga biriktirilgan mavzuni ko'rishingiz mumkin.\n\n`;
    text += `🔒 Maxfiylik: Har bir talabaning baho raqamlari (ballari) maxfiy saqlanadi, faqat dars topshirilganligi tasdiqlanadi.\n\n`;
    text += `📞 O'QITUVCHI BILAN ALOQA (Otrabotka va savollar uchun):\n`;
    text += `📱 Telefon: ${teacherPhone}\n`;
    text += `💬 Telegram: ${teacherTelegram} (${teacherTelegramUrl})`;

    return text;
  };

  // Generate All Groups Summary Text
  const generateAllGroupsSummary = () => {
    let text = `🏛 BIOLOGIK KIMYO FANI — GURUHLAR PORTALI HAVOLALARI\n`;
    text += `👨‍🏫 O'qituvchi: ${teacherName}\n`;
    text += `📞 Aloqa: ${teacherPhone} | Telegram: ${teacherTelegram}\n\n`;
    text += `Hurmatli talabalar, har bir guruh faqat o'z guruhi havolasi orqali kirishi lozim:\n\n`;

    groups.forEach((g) => {
      const link = getPublicStudentLink(g.name);
      text += `🔹 ${g.name} (${g.faculty}):\n👉 ${link}\n\n`;
    });

    text += `🔒 Eslatma: Portalda baho raqamlari yashirilgan, faqat dars topshirilganligi va topshirmagan mavzular ko'rsatiladi.`;
    return text;
  };

  const handleCopyLink = async () => {
    await copyTextFallback(studentLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyGroupLink = async (grp: StudentGroup) => {
    const link = getPublicStudentLink(grp.name);
    await copyTextFallback(link);
    setCopiedGroupMap((prev) => ({ ...prev, [grp.id]: true }));
    setTimeout(() => {
      setCopiedGroupMap((prev) => ({ ...prev, [grp.id]: false }));
    }, 3000);
  };

  const handleCopyText = async () => {
    const text = generateTelegramText();
    await copyTextFallback(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  const handleCopyAllGroupsSummary = async () => {
    const text = generateAllGroupsSummary();
    await copyTextFallback(text);
    setCopiedAllSummary(true);
    setTimeout(() => setCopiedAllSummary(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-750 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-850/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center space-x-2">
                <span>Har bir guruh uchun talabalar portali havolalari</span>
              </h3>
              <p className="text-xs text-slate-400">
                Talabalar bu havola orqali ochganda <strong>faqat o'z guruhini</strong> ko'radi, boshqa guruhlarni ko'ra olmaydi.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-800 flex items-center justify-between space-x-3 bg-slate-900/60 flex-wrap gap-y-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('individual_links')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 ${
                activeTab === 'individual_links'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Har bir guruh uchun linklar ({groups.length} ta)</span>
            </button>

            <button
              onClick={() => setActiveTab('telegram_message')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 ${
                activeTab === 'telegram_message'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Telegram xabari tuzish</span>
            </button>
          </div>

          {/* Quick copy ALL groups button */}
          <button
            onClick={handleCopyAllGroupsSummary}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition flex items-center space-x-1.5 shrink-0"
            title="Barcha guruhlar ro'yxati va ularning linklarini bitta xabar sifatida nusxalash"
          >
            {copiedAllSummary ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Barcha linklar nusxalandi!</span>
              </>
            ) : (
              <>
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Barcha linklarni umumiy nusxalash</span>
              </>
            )}
          </button>
        </div>

        {/* Teacher Contact Info Banner */}
        <div className="px-6 py-2.5 bg-gradient-to-r from-teal-950/40 via-slate-900 to-indigo-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <span className="font-bold text-teal-400">👨‍🏫 O'qituvchi aloqa ma'lumotlari:</span>
            <span>{teacherName}</span>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href={`tel:${teacherPhoneClean}`}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/30 flex items-center space-x-1.5 transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{teacherPhone}</span>
            </a>

            <a
              href={teacherTelegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 font-bold border border-sky-500/30 flex items-center space-x-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{teacherTelegram}</span>
            </a>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {activeTab === 'individual_links' ? (
            /* TAB 1: INDIVIDUAL GROUP LINKS WITH PRIVACY LOCK */
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-teal-800/40 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-teal-300">
                  <Lock className="w-4 h-4 text-teal-400" />
                  <span>Qanday qilib talabalarga alohida yuborasiz?</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Quyidagi ro'yxatdan o'zingiz dars o'tadigan guruhni toping va <strong>"Havolani nusxalash"</strong> yoki to'g'ridan-to'g'ri <strong>"Telegramga yuborish"</strong> tugmasini bosing. Havolani olgan talabalar uni o'z telefonlarida ochganlarida <strong>faqat o'z guruhining</strong> ma'lumotlarini ko'radilar.
                </p>
              </div>

              {/* Teacher's Personal Journal Link */}
              <div className="p-4 bg-gradient-to-r from-emerald-950/60 via-slate-950 to-teal-950/60 rounded-2xl border-2 border-emerald-500/50 space-y-2.5 shadow-xl">
                <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                  <span className="font-black text-emerald-400 flex items-center space-x-1.5 text-sm">
                    <GraduationCap className="w-4 h-4" />
                    <span>👨‍🏫 Sizning shaxsiy havolangiz (O'qituvchi boshqaruv jurnali):</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                    To'liq huquqli boshqaruv
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ushbu havola faqat siz (o'qituvchi) uchun. Bunda barcha guruhlar, to'liq dars jadvali, baholash, NB qo'yish, atrabotka qabul qilish va hisobotlar to'liq ochiladi.
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={getTeacherLink()}
                    onClick={(e) => e.currentTarget.select()}
                    className="flex-1 bg-slate-900 text-xs font-mono text-emerald-300 px-3 py-2.5 rounded-xl border border-emerald-800/80 select-all focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      await copyTextFallback(getTeacherLink());
                      setCopiedTeacherLink(true);
                      setTimeout(() => setCopiedTeacherLink(false), 3000);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center space-x-1.5 shrink-0 ${
                      copiedTeacherLink
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/25'
                    }`}
                  >
                    {copiedTeacherLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Nusxalandi!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Ustoz havolasini nusxalash</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Group links cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {groups.map((grp) => {
                  const grpLink = getPublicStudentLink(grp.name);
                  const isCopied = Boolean(copiedGroupMap[grp.id]);
                  const grpSlots = schedule.filter((s) => {
                    if (s.matchingGroupId === grp.id) return true;
                    if (grp.isLectureFlow && grp.constituentGroupIds) {
                      return grp.constituentGroupIds.includes(s.matchingGroupId || '');
                    }
                    return s.groupCode.replace(/\s+/g, '').toLowerCase().includes(grp.name.replace(/\s+/g, '').toLowerCase());
                  });

                  const tgText = generateTelegramText(grp);
                  const tgShareUrl = `https://t.me/share/url?url=${encodeURIComponent(grpLink)}&text=${encodeURIComponent(tgText)}`;

                  return (
                    <div
                      key={grp.id}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        grp.name.includes('DI-25-22')
                          ? 'bg-slate-900 border-teal-500/60 shadow-lg shadow-teal-500/10'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-sm text-white">{grp.name}</span>
                            {grp.isLectureFlow && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                🌊 Oqim
                              </span>
                            )}
                            {grp.name.includes('DI-25-22') && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-teal-400 text-slate-950">
                                Dushanba 2-para
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">
                            {grp.faculty}
                          </div>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                          {grpSlots.length} ta dars
                        </span>
                      </div>

                      {/* Direct Link box with selectable input */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 flex items-center justify-between">
                          <span>Talabalar uchun ochiq havola:</span>
                          <span className="text-teal-400">🔒 Faqat {grp.name}</span>
                        </div>
                        <input
                          type="text"
                          readOnly
                          value={grpLink}
                          onClick={(e) => e.currentTarget.select()}
                          className="w-full bg-slate-900 p-2 rounded-xl border border-slate-800 text-[11px] font-mono text-teal-300 select-all focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleCopyGroupLink(grp)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                            isCopied
                              ? 'bg-emerald-500 text-slate-950 font-black shadow'
                              : 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Nusxalandi!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Havolani nusxalash</span>
                            </>
                          )}
                        </button>

                        <a
                          href={tgShareUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 rounded-xl text-xs font-bold bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition flex items-center space-x-1.5 shrink-0"
                          title={`${grp.name} guruhi Telegram chatiga yuborish`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Telegram</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* TAB 2: TELEGRAM MESSAGE CUSTOMIZER */
            <div className="space-y-5">
              {/* Controls: Week & Group selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-teal-400" />
                    <span>O'quv haftasi:</span>
                  </label>
                  <select
                    value={week}
                    onChange={(e) => setWeek(Number(e.target.value))}
                    className="w-full bg-slate-800 text-xs text-white rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                      <option key={w} value={w}>
                        {w}-hafta {w === 4 ? "★ 19-oktyabrdan (Joriy hafta)" : `(${getWeekDates(w).formattedRange})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    <span>Guruhni tanlang:</span>
                  </label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="w-full bg-slate-800 text-xs text-white rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                  >
                    <option value="all">Barcha guruhlar (Umumiy havola)</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} — {g.faculty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Share Link Box */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5 text-teal-400" />
                    <span>Talabalar uchun to'g'ridan-to'g'ri havola:</span>
                  </span>
                  {targetGroup && (
                    <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[10px] font-bold">
                      {targetGroup.name} guruhi filtri bilan (🔒 Cheklangan)
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={studentLink}
                    onClick={(e) => e.currentTarget.select()}
                    className="flex-1 bg-slate-900 text-xs font-mono text-teal-300 px-3 py-2 rounded-xl border border-slate-750 focus:outline-none select-all"
                  />

                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition flex items-center space-x-1.5 shrink-0"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Nusxalandi</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Nusxa olish</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Telegram One-Click Actions */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(studentLink)}&text=${encodeURIComponent(generateTelegramText())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-black bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/25 transition flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Telegram orqali guruhga yuborish</span>
                </a>

                <button
                  onClick={handleCopyText}
                  className="py-3 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition flex items-center justify-center space-x-2 shrink-0"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Xabar matni nusxalandi!</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 text-teal-400" />
                      <span>Xabar matnini nusxalash</span>
                    </>
                  )}
                </button>
              </div>

              {/* Message Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400">Telegram uchun tayyorlangan xabar ko'rinishi:</span>
                  <span className="text-[11px] text-teal-400 font-mono">{weekDates.formattedRange}</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-line max-h-48 overflow-y-auto leading-relaxed border-l-4 border-l-sky-500">
                  {generateTelegramText()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-850/80 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Talabalar havolani ochganda faqat o'z guruhini ko'radi va baho raqamlari maxfiy tutiladi.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-white transition"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};

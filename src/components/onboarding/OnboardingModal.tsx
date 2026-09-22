import React, { useState } from 'react';
import {
  X,
  Check,
  Sparkles,
  ArrowRight,
  Clock,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { Profile, AvailableTime, LearningPreference } from '../../types';
import { StorageService } from '../../lib/storage';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: Profile;
  onProfileUpdated: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onProfileUpdated,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    currentProfile.selectedTopics || ['messiah', 'torah', 'feasts']
  );
  const [learningPref, setLearningPref] = useState<LearningPreference>(
    currentProfile.learningPreference || 'QUICK_DISCOVERIES'
  );
  const [timePref, setTimePref] = useState<AvailableTime>(
    currentProfile.availableTime || '10_MIN'
  );

  if (!isOpen) return null;

  const topicsList = [
    { slug: 'messiah', name: 'Messiah', hebrew: 'מָשִׁיחַ' },
    { slug: 'torah', name: 'Torah', hebrew: 'תּוֹרָה' },
    { slug: 'prophecy', name: 'Prophecy', hebrew: 'נְבוּאָה' },
    { slug: 'covenant', name: 'Covenant', hebrew: 'בְּרִית' },
    { slug: 'kingdom', name: 'Kingdom', hebrew: 'מַלְכוּת' },
    { slug: 'feasts', name: 'Feasts', hebrew: 'מוֹעֲדִים' },
    { slug: 'sabbath', name: 'Sabbath', hebrew: 'שַׁבָּת' },
    { slug: 'prayer', name: 'Prayer', hebrew: 'תְּפִלָּה' },
    { slug: 'jewish-context', name: 'Jewish Context', hebrew: 'הֶקְשֵׁר' },
    { slug: 'hebrew-concepts', name: 'Hebrew Concepts', hebrew: 'לָשׁוֹן' },
  ];

  const toggleTopic = (slug: string) => {
    if (selectedTopics.includes(slug)) {
      if (selectedTopics.length > 1) {
        setSelectedTopics(selectedTopics.filter((t) => t !== slug));
      }
    } else {
      setSelectedTopics([...selectedTopics, slug]);
    }
  };

  const handleFinish = () => {
    StorageService.saveProfile({
      selectedTopics,
      learningPreference: learningPref,
      availableTime: timePref,
      onboardingCompleted: true,
    });
    onProfileUpdated();
    onClose();
  };

  return (
    <div
      id="onboarding-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="onboarding-modal"
        className="w-full max-w-xl bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden"
      >
        {/* Header Indicator */}
        <div className="flex items-center justify-between border-b border-[#E8DDC8]/60 dark:border-[#2E3B33] pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B39452]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#B39452]">
              Personalize Your Walk • Step {step} of 3
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#69716B] hover:text-[#202421] dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Select Topics */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#F8F6F0] dark:bg-[#151D19] border border-[#B39452]/30">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#B39452] mb-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Welcome to HALAKHA (הֲלָכָה)</span>
              </div>
              <p className="text-xs text-[#4E5651] dark:text-[#CAD3CC] leading-relaxed">
                Derived from the Hebrew root for <em>“walking”</em> (halakh), HALAKHA is a Scripture discovery and study platform exploring the biblical world through a Messianic Jewish lens.
              </p>
            </div>

            <div>
              <h3 className="font-scripture text-2xl sm:text-3xl font-bold text-[#202421] dark:text-[#F3F0E8]">
                What are you interested in exploring?
              </h3>
              <p className="text-xs sm:text-sm text-[#69716B] dark:text-[#AEB6AF] mt-1">
                Select the pillars of Scripture and Messianic study that resonate most with your journey.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {topicsList.map((t) => {
                const selected = selectedTopics.includes(t.slug);
                return (
                  <button
                    key={t.slug}
                    onClick={() => toggleTopic(t.slug)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      selected
                        ? 'border-[#B39452] bg-[#B39452]/10 text-[#263A32] dark:text-[#E8DDC8] font-semibold ring-1 ring-[#B39452]'
                        : 'border-[#E8DDC8] dark:border-[#2E3B33] bg-[#F8F6F0] dark:bg-[#151D19] text-[#69716B] dark:text-[#AEB6AF] hover:border-[#B39452]/50'
                    }`}
                  >
                    <div>
                      <span className="font-scripture text-xs block opacity-70">
                        {t.hebrew}
                      </span>
                      <span className="text-xs sm:text-sm">{t.name}</span>
                    </div>
                    {selected && <Check className="w-4 h-4 text-[#B39452]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Learning Preference */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-scripture text-2xl sm:text-3xl font-bold text-[#202421] dark:text-[#F3F0E8]">
                How do you prefer to learn?
              </h3>
              <p className="text-xs sm:text-sm text-[#69716B] dark:text-[#AEB6AF] mt-1">
                This customizes your home layout and discovery pace.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: 'QUICK_DISCOVERIES' as LearningPreference,
                  title: 'Quick Discoveries',
                  desc: 'Bite-sized cards to discover new connections in 2–3 minutes.',
                },
                {
                  id: 'GUIDED_STUDIES' as LearningPreference,
                  title: 'Guided Studies',
                  desc: 'Multi-step study paths with structured lessons and progress tracking.',
                },
                {
                  id: 'SCRIPTURE_READING' as LearningPreference,
                  title: 'Scripture Reading',
                  desc: 'Direct biblical chapters with Jewish linguistic and historical notes.',
                },
                {
                  id: 'EVERYTHING' as LearningPreference,
                  title: 'A Little of Everything',
                  desc: 'A rich balanced mix of cards, guided paths, and chapter study.',
                },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setLearningPref(opt.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    learningPref === opt.id
                      ? 'border-[#B39452] bg-[#B39452]/10 ring-1 ring-[#B39452]'
                      : 'border-[#E8DDC8] dark:border-[#2E3B33] bg-[#F8F6F0] dark:bg-[#151D19] hover:border-[#B39452]/50'
                  }`}
                >
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-[#202421] dark:text-[#F3F0E8]">
                      {opt.title}
                    </h4>
                    <p className="text-xs text-[#69716B] dark:text-[#CAD3CC] mt-0.5">
                      {opt.desc}
                    </p>
                  </div>
                  {learningPref === opt.id && <Check className="w-4 h-4 text-[#B39452]" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Available Time */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-scripture text-2xl sm:text-3xl font-bold text-[#202421] dark:text-[#F3F0E8]">
                Available daily study time?
              </h3>
              <p className="text-xs sm:text-sm text-[#69716B] dark:text-[#AEB6AF] mt-1">
                We'll prioritize discoveries that respect your daily schedule without overwhelm.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: '5_MIN' as AvailableTime, label: '5 minutes', sub: 'Brief reflection' },
                { id: '10_MIN' as AvailableTime, label: '10 minutes', sub: 'Discovery + Verse' },
                { id: '15_MIN' as AvailableTime, label: '15 minutes', sub: 'Deep discovery' },
                { id: '20_PLUS' as AvailableTime, label: '20+ minutes', sub: 'Full study session' },
              ].map((time) => (
                <div
                  key={time.id}
                  onClick={() => setTimePref(time.id)}
                  className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${
                    timePref === time.id
                      ? 'border-[#B39452] bg-[#B39452]/10 ring-1 ring-[#B39452]'
                      : 'border-[#E8DDC8] dark:border-[#2E3B33] bg-[#F8F6F0] dark:bg-[#151D19] hover:border-[#B39452]/50'
                  }`}
                >
                  <span className="font-bold text-sm block text-[#202421] dark:text-[#F3F0E8]">
                    {time.label}
                  </span>
                  <span className="text-[11px] text-[#69716B] dark:text-[#AEB6AF] block mt-0.5">
                    {time.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8DDC8]/60 dark:border-[#2E3B33]">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as 1 | 2 | 3)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#69716B] hover:bg-[#E8DDC8]/40"
            >
              Back
            </button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((step + 1) as 1 | 2 | 3)}
              className="px-5 py-2.5 rounded-xl bg-[#263A32] text-[#F8F6F0] text-xs font-semibold flex items-center gap-1.5"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B39452]" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-[#263A32] hover:bg-[#1F2F29] text-[#F8F6F0] text-xs font-semibold flex items-center gap-2 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-[#B39452]" />
              <span>Enter HALAKHA</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

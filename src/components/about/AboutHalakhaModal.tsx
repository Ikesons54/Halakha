import React from 'react';
import { X, Sparkles, BookOpen, Compass, Footprints, Heart, Shield } from 'lucide-react';

interface AboutHalakhaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutHalakhaModal: React.FC<AboutHalakhaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="about-halakha-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="about-halakha-modal"
        className="w-full max-w-2xl bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#E8DDC8]/60 dark:border-[#2E3B33] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#263A32] text-[#E8DDC8] flex items-center justify-center font-scripture text-2xl font-bold border border-[#B39452]/40 shadow-xs">
              ה
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-scripture text-2xl sm:text-3xl font-bold text-[#202421] dark:text-[#F3F0E8]">
                  About HALAKHA
                </h2>
                <span className="font-scripture text-base text-[#B39452] font-semibold">
                  (הֲלָכָה)
                </span>
              </div>
              <p className="text-xs text-[#69716B] dark:text-[#AEB6AF] mt-0.5">
                V1: HALAKHA — Scripture Discovery & Study
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#69716B] hover:text-[#202421] dark:hover:text-white hover:bg-[#E8DDC8]/40 dark:hover:bg-[#2E3B33] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Identity Anchor */}
        <div className="p-4 rounded-2xl bg-[#F8F6F0] dark:bg-[#151D19] border border-[#B39452]/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B39452]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Product Identity</span>
          </div>
          <p className="font-scripture text-xl text-[#263A32] dark:text-[#E8DDC8] font-semibold leading-snug">
            A Scripture discovery and study platform exploring the biblical world through a Messianic Jewish lens.
          </p>
          <p className="text-xs font-medium text-[#69716B] dark:text-[#AEB6AF] tracking-wide">
            Tagline: <strong className="text-[#202421] dark:text-[#F3F0E8]">Discover Scripture. See the Connections. Go Deeper.</strong>
          </p>
        </div>

        {/* The Meaning of HALAKHA: Linguistic Root & App Distinction */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#263A32] dark:text-[#E8DDC8]">
            <Footprints className="w-4 h-4 text-[#B39452]" />
            <span>Understanding the Name & Its Biblical Origin</span>
          </div>

          <div className="text-xs sm:text-sm text-[#4E5651] dark:text-[#CAD3CC] space-y-3 leading-relaxed">
            <p>
              <strong className="text-[#202421] dark:text-[#F3F0E8]">The Hebrew Root:</strong> The word{' '}
              <em className="font-scripture text-base text-[#263A32] dark:text-[#E8DDC8]">Halakha</em> (הֲלָכָה) is derived directly from the biblical Hebrew root{' '}
              <em className="font-scripture text-base text-[#B39452]">הָלַךְ (halakh)</em>, meaning <strong>“to walk.”</strong>
            </p>
            <p>
              <strong className="text-[#202421] dark:text-[#F3F0E8]">Traditional Usage vs. Our Purpose:</strong> While <em>halakha</em> traditionally refers to Jewish law, legal rulings, and religious practice—how one conducts oneself—our platform uses the term in its broader, foundational sense: <strong>walking through the living word of Scripture</strong>.
            </p>
            <p>
              HALAKHA is much broader than legal codes. It is a guide for walking through the interconnected tapestry of Scripture:
            </p>
          </div>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-xl border border-[#E8DDC8] dark:border-[#2E3B33] bg-[#FAF8F5] dark:bg-[#19221E] flex items-start gap-2.5">
              <Compass className="w-4 h-4 text-[#B39452] mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-[#202421] dark:text-[#F3F0E8]">Messiah in Tanakh</h4>
                <p className="text-[11px] text-[#69716B] dark:text-[#AEB6AF] mt-0.5">
                  Revealing Yeshua as the Promised Seed, Suffering Servant, and Returning King.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-[#E8DDC8] dark:border-[#2E3B33] bg-[#FAF8F5] dark:bg-[#19221E] flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 text-[#B39452] mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-[#202421] dark:text-[#F3F0E8]">Torah & Commandments</h4>
                <p className="text-[11px] text-[#69716B] dark:text-[#AEB6AF] mt-0.5">
                  Understanding God's instruction, righteous walking, and heart transformation.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-[#E8DDC8] dark:border-[#2E3B33] bg-[#FAF8F5] dark:bg-[#19221E] flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-[#B39452] mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-[#202421] dark:text-[#F3F0E8]">Covenant & Prophecy</h4>
                <p className="text-[11px] text-[#69716B] dark:text-[#AEB6AF] mt-0.5">
                  Tracing God's irrevocable promises from Abraham and Moses to the New Covenant.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-[#E8DDC8] dark:border-[#2E3B33] bg-[#FAF8F5] dark:bg-[#19221E] flex items-start gap-2.5">
              <Heart className="w-4 h-4 text-[#B39452] mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-[#202421] dark:text-[#F3F0E8]">The Biblical Feasts</h4>
                <p className="text-[11px] text-[#69716B] dark:text-[#AEB6AF] mt-0.5">
                  The prophetic calendar of the Lord—Pesach, Shavuot, Sukkot, and their fulfillments.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* The 5-Layer Content Promise */}
        <div className="p-4 rounded-xl border border-[#E8DDC8] dark:border-[#2E3B33] bg-[#F8F6F0]/70 dark:bg-[#151D19]/70 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#B39452]">
            Our 5-Layer Content Integrity Promise
          </h4>
          <p className="text-xs text-[#69716B] dark:text-[#AEB6AF] leading-relaxed">
            Every discovery card strictly separates Scripture from human commentary: starting with the Anchor Hook, Core Idea, unaltered biblical text with context, ancient Second Temple historical & linguistic background, and distinct Messianic Jewish reflection.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E8DDC8]/60 dark:border-[#2E3B33]">
          <span className="text-[11px] text-[#69716B] dark:text-[#AEB6AF]">
            “Walk in the ancient paths, where the good way is, and find rest for your souls.” — Jeremiah 6:16
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#263A32] text-[#F8F6F0] text-xs font-semibold hover:bg-[#1F2F29] transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

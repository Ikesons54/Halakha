import React, { useState } from 'react';
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  Circle,
  ArrowRight,
  BookOpen,
  Sparkles,
  BarChart,
} from 'lucide-react';
import { StudyPath, StudyLesson } from '../../types';
import { LessonModal } from './LessonModal';
import { StorageService } from '../../lib/storage';

interface StudyPathsViewProps {
  studyPaths: StudyPath[];
  selectedPathId?: string;
  onOpenKnowledgeGraph: (nodeId?: string) => void;
  onProgressUpdated: () => void;
}

export const StudyPathsView: React.FC<StudyPathsViewProps> = ({
  studyPaths,
  selectedPathId,
  onOpenKnowledgeGraph,
  onProgressUpdated,
}) => {
  const [activePathId, setActivePathId] = useState<string>(
    selectedPathId || studyPaths[0]?.id || 'sp-1'
  );
  const [activeLesson, setActiveLesson] = useState<StudyLesson | null>(null);

  const currentPath =
    studyPaths.find((sp) => sp.id === activePathId) || studyPaths[0];

  const userProgress = StorageService.getUserProgress();
  const completedLessonIds = new Set(
    userProgress
      .filter((p) => p.studyPathId === currentPath?.id && p.status === 'COMPLETED')
      .map((p) => p.lessonId)
  );

  const progress = currentPath
    ? StorageService.getStudyPathProgress(currentPath.id)
    : { completed: 0, total: 0, percentage: 0 };

  const handleCompleteLesson = (lessonId: string) => {
    if (currentPath) {
      StorageService.markLessonComplete(currentPath.id, lessonId);
      onProgressUpdated();
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header Banner */}
      <section className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#B39452] flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5" />
          Guided Biblical Journeys
        </span>
        <h1 className="font-scripture text-3xl sm:text-4xl font-semibold text-[#202421] dark:text-[#F3F0E8]">
          Study Paths
        </h1>
        <p className="text-sm text-[#69716B] dark:text-[#AEB6AF]">
          Structured, step-by-step journeys designed to move from foundational principles into deep scriptural comprehension.
        </p>
      </section>

      {/* Path Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {studyPaths.map((path) => {
          const pathProg = StorageService.getStudyPathProgress(path.id);
          const isSelected = path.id === currentPath?.id;
          return (
            <div
              key={path.id}
              onClick={() => setActivePathId(path.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-white dark:bg-[#1C2420] border-[#B39452] shadow-sm ring-1 ring-[#B39452]'
                  : 'bg-[#FAF8F5] dark:bg-[#151D19] border-[#E8DDC8] dark:border-[#2E3B33] hover:border-[#B39452]/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#B39452]/10 text-[#B39452]">
                    {path.difficulty}
                  </span>
                  <span className="text-xs text-[#69716B] dark:text-[#AEB6AF] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {path.estimatedMinutes} min total
                  </span>
                </div>
                <h3 className="font-scripture text-xl font-bold text-[#202421] dark:text-[#F3F0E8] mb-1.5">
                  {path.title}
                </h3>
                <p className="text-xs text-[#69716B] dark:text-[#CAD3CC] leading-relaxed line-clamp-2">
                  {path.description}
                </p>
              </div>

              {/* Progress mini indicator */}
              <div className="mt-4 pt-3 border-t border-[#E8DDC8]/60 dark:border-[#2E3B33] flex items-center justify-between text-xs text-[#263A32] dark:text-[#E8DDC8] font-semibold">
                <span>{pathProg.completed} of {pathProg.total} Lessons</span>
                <span>{pathProg.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Study Path Curriculum View */}
      {currentPath && (
        <section className="bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Path Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DDC8]/60 dark:border-[#2E3B33]">
            <div>
              <span className="text-xs font-bold text-[#B39452] uppercase tracking-wider">
                Current Curriculum
              </span>
              <h2 className="font-scripture text-2xl sm:text-3xl font-bold text-[#202421] dark:text-[#F3F0E8] mt-0.5">
                {currentPath.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#69716B] dark:text-[#AEB6AF] mt-1 max-w-xl">
                {currentPath.description}
              </p>
            </div>

            {/* Quick Resume Button */}
            {currentPath.lessons.length > 0 && (
              <button
                onClick={() => {
                  const firstIncomplete =
                    currentPath.lessons.find((l) => !completedLessonIds.has(l.id)) ||
                    currentPath.lessons[0];
                  setActiveLesson(firstIncomplete);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#263A32] hover:bg-[#1F2F29] text-[#F8F6F0] text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 shadow-xs"
              >
                <span>
                  {progress.completed === progress.total ? 'Review Path' : 'Resume Lesson'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B39452]" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#263A32] dark:text-[#E8DDC8]">
              <span>Overall Progress</span>
              <span>{progress.completed} / {progress.total} lessons ({progress.percentage}%)</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#FAF8F5] dark:bg-[#151D19] border border-[#E8DDC8]/60 dark:border-[#2E3B33] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#263A32] to-[#B39452] rounded-full transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          {/* Lessons List */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#69716B] dark:text-[#AEB6AF]">
              Course Lessons ({currentPath.lessons.length})
            </h3>

            <div className="divide-y divide-[#E8DDC8]/60 dark:divide-[#2E3B33]">
              {currentPath.lessons.map((lesson) => {
                const isCompleted = completedLessonIds.has(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className="py-3.5 px-3 rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-[#151D19] transition-all cursor-pointer flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="pt-0.5">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-[#E8DDC8] dark:border-[#69716B] flex items-center justify-center text-[10px] font-bold text-[#69716B] dark:text-[#AEB6AF]">
                            {lesson.lessonOrder}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            className={`font-semibold text-sm ${
                              isCompleted
                                ? 'text-[#69716B] dark:text-[#AEB6AF] line-through'
                                : 'text-[#202421] dark:text-[#F3F0E8] group-hover:text-[#B39452]'
                            } transition-colors`}
                          >
                            {lesson.lessonOrder}. {lesson.title}
                          </h4>
                          <span className="text-[11px] text-[#B39452] font-mono">
                            {lesson.scriptureReference}
                          </span>
                        </div>
                        <p className="text-xs text-[#69716B] dark:text-[#CAD3CC] mt-0.5 line-clamp-1">
                          {lesson.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-[#69716B] dark:text-[#AEB6AF] hidden sm:inline">
                        {lesson.estimatedMinutes}m
                      </span>
                      <button className="text-xs font-semibold text-[#B39452] px-2.5 py-1 rounded-lg border border-[#B39452]/30 hover:bg-[#B39452]/10 transition-colors">
                        {isCompleted ? 'Review' : 'Start'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Lesson Modal */}
      <LessonModal
        lesson={activeLesson}
        path={currentPath}
        isOpen={Boolean(activeLesson)}
        onClose={() => setActiveLesson(null)}
        onCompleteLesson={handleCompleteLesson}
        onOpenKnowledgeGraph={onOpenKnowledgeGraph}
      />
    </div>
  );
};

import React from "react";
import { useRoutines } from "../context/RoutineContext";
import TabBar from "../components/TabBar";
import { Badge } from "@/components/ui/badge";
import { Flame, CheckCircle, Calendar, Plus, MoreVertical, ChevronRight, Check, Circle } from "lucide-react";
import StackScheduler from "../components/StackScheduler";
import { useScheduling } from "../hooks/useScheduling";

const RoutinesPage = () => {
  const { routines, isStackCompleted, getStackProgress, isRoutineCompleted, isStackScheduledForToday } = useRoutines();
  const { shouldTrackStreak } = useScheduling();

  const handleQuickStackClick = () => {
    // Empty function as a placeholder for the required prop
  };

  // Get today's day name
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">My Routines</h1>
          <button className="p-2 rounded-full bg-stacks-purple/10 text-stacks-purple hover:bg-stacks-purple/20 transition-colors">
            <Calendar size={20} />
          </button>
        </div>
        <p className="text-gray-500">Organize your stacks into daily routines</p>
      </div>

      {/* Routines List */}
      <div className="space-y-6">
        {routines.map((routine) => {
          const routineIsCompleted = isRoutineCompleted(routine);
          const showRoutineStreak = routine.streak > 0;

          return (
            <div key={routine.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md ${routineIsCompleted ? "opacity-80" : ""}`}>
              {/* Routine Header */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  {routineIsCompleted ? (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle size={18} className="text-green-600" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-stacks-purple/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stacks-purple">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                      </svg>
                    </div>
                  )}

                  <div>
                    <h2 className={`font-semibold text-lg ${routineIsCompleted ? "text-gray-500 line-through" : "text-gray-800"}`}>{routine.title}</h2>
                    {routine.description && <p className={`text-sm ${routineIsCompleted ? "text-gray-400" : "text-gray-500"}`}>{routine.description}</p>}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Days of Week */}
                  <div className="hidden sm:flex items-center space-x-1">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <div key={day} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${routine.days.includes(day) ? (today.startsWith(day) ? "bg-stacks-purple text-white" : "bg-stacks-purple/10 text-stacks-purple") : "bg-gray-100 text-gray-400"}`}>
                        {day.charAt(0)}
                      </div>
                    ))}
                  </div>

                  {/* Streak */}
                  {showRoutineStreak && (
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 px-2 py-1">
                      <Flame size={14} className="mr-1 text-orange-500" />
                      {routine.streak}
                    </Badge>
                  )}

                  <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              {/* Stacks List */}
              <div className="divide-y divide-gray-100">
                {routine.stacks.map((stack) => {
                  const stackIsCompleted = isStackCompleted(stack);
                  const isScheduledToday = isStackScheduledForToday(stack);
                  const showStackStreak = stack.streak > 0 && shouldTrackStreak(stack);
                  const progress = getStackProgress(stack);

                  return (
                    <div key={stack.id} className={`p-4 transition-colors ${stackIsCompleted ? "bg-gray-50" : "hover:bg-gray-50"}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {/* Completion Indicator */}
                          {stackIsCompleted ? (
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <Check size={16} className="text-green-600" />
                            </div>
                          ) : (
                            <div className="relative w-8 h-8 flex-shrink-0">
                              <svg className="w-full h-full" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                                <circle cx="18" cy="18" r="16" fill="none" stroke="#7E69AB" strokeWidth="3" strokeDasharray="100" strokeDashoffset={100 - progress} strokeLinecap="round" transform="rotate(-90 18 18)" />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-stacks-purple">
                                {stack.actions.filter((a) => a.completed).length}/{stack.actions.length}
                              </span>
                            </div>
                          )}

                          <div>
                            <h3 className={`font-medium ${stackIsCompleted ? "text-gray-500 line-through" : "text-gray-800"}`}>{stack.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {stack.actions.length} action{stack.actions.length !== 1 ? "s" : ""}
                              </span>
                              {isScheduledToday && (
                                <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30">
                                  Today
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {showStackStreak && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                              <Flame size={12} className="mr-1" />
                              {stack.streak}
                            </Badge>
                          )}

                          <StackScheduler routineId={routine.id} stack={stack} />

                          <ChevronRight size={18} className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add Stack Button */}
                <button className="w-full p-4 text-stacks-purple hover:bg-gray-50 flex items-center justify-center space-x-2 transition-colors">
                  <Plus size={16} />
                  <span className="font-medium">Add Stack</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {routines.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-200">
          <div className="mx-auto w-16 h-16 bg-stacks-purple/10 rounded-full flex items-center justify-center mb-4">
            <Calendar size={24} className="text-stacks-purple" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No routines yet</h3>
          <p className="text-gray-500 mb-4">Create your first routine to organize your stacks</p>
          <button className="bg-stacks-purple text-white px-4 py-2 rounded-lg font-medium hover:bg-stacks-purple/90 transition-colors">Create Routine</button>
        </div>
      )}

      {/* Floating Action Button */}
      <button className="fixed bottom-24 right-6 bg-stacks-purple text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-stacks-purple/90 hover:shadow-xl transition-all">
        <Plus size={24} />
      </button>

      <TabBar onQuickStackClick={handleQuickStackClick} activeTab="routines" />
    </div>
  );
};

export default RoutinesPage;

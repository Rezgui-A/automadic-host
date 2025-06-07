import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Plus, CalendarDays, BookOpen, Settings } from "lucide-react";

interface TabBarProps {
  onQuickStackClick?: () => void;
  activeTab?: "today" | "library" | "settings" | "routines";
}

const TabBar: React.FC<TabBarProps> = ({ onQuickStackClick = () => {}, activeTab }) => {
  const location = useLocation();

  const currentTab = activeTab || (location.pathname === "/" ? "today" : location.pathname === "/library" ? "library" : location.pathname === "/settings" ? "settings" : location.pathname === "/routines" ? "routines" : "today");

  return (
    <div className="tab-bar fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-16 px-2 z-50">
      <Link to="/" className={`tab-item flex flex-col items-center justify-center w-1/4 ${currentTab === "today" ? "text-stacks-purple" : "text-gray-400"}`}>
        <CalendarDays className="w-6 h-6" />
        <span className="text-xs mt-1">Today</span>
      </Link>

      <button onClick={onQuickStackClick} className="tab-item flex flex-col items-center justify-center w-1/4 text-gray-400">
        <Plus className="w-6 h-6" />
        <span className="text-xs mt-1">Quick</span>
      </button>

      <Link to="/library" className={`tab-item flex flex-col items-center justify-center w-1/4 ${currentTab === "library" ? "text-stacks-purple" : "text-gray-400"}`}>
        <BookOpen className="w-6 h-6" />
        <span className="text-xs mt-1">Library</span>
      </Link>

      <Link to="/settings" className={`tab-item flex flex-col items-center justify-center w-1/4 ${currentTab === "settings" ? "text-stacks-purple" : "text-gray-400"}`}>
        <Settings className="w-6 h-6" />
        <span className="text-xs mt-1">Settings</span>
      </Link>
    </div>
  );
};

export default TabBar;

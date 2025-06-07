
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder="Search routines and actions..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9 bg-white"
      />
      {searchQuery && (
        <button 
          className="absolute right-3 top-3"
          onClick={() => setSearchQuery('')}
          aria-label="Clear search"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;

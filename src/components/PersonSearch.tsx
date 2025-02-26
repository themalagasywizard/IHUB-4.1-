import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';

interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
}

interface PersonSearchProps {
  onPersonSelect: (person: Person) => void;
  onPersonRemove: (personId: number) => void;
  selectedPeople: Person[];
}

const PersonSearch = ({ onPersonSelect, onPersonRemove, selectedPeople }: PersonSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchPeople = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/person?api_key=650ff50a48a7379fd245c173ad422ff8&query=${encodeURIComponent(query)}&include_adult=false`
      );
      const data = await response.json();
      
      // Filter out people without profile images and sort by popularity
      const filteredResults = data.results
        .filter((person: Person) => person.profile_path)
        .sort((a: any, b: any) => b.popularity - a.popularity)
        .slice(0, 5); // Limit to top 5 results
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching people:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        searchPeople(searchQuery);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSelect = (person: Person) => {
    if (!selectedPeople.some(p => p.id === person.id)) {
      onPersonSelect(person);
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedPeople.map((person) => (
          <div
            key={person.id}
            className="flex items-center gap-2 bg-[#2a2a2a] text-white px-3 py-1 rounded-full text-sm"
          >
            {person.profile_path && (
              <img
                src={`https://image.tmdb.org/t/p/w45${person.profile_path}`}
                alt={person.name}
                className="w-5 h-5 rounded-full object-cover"
              />
            )}
            <span>{person.name}</span>
            <span className="text-xs text-gray-400">
              ({person.known_for_department})
            </span>
            <button
              onClick={() => onPersonRemove(person.id)}
              className="hover:text-[#ea384c] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="relative">
        <Input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search for actors or directors..."
          className="w-full bg-[#1a1a1a] text-white placeholder:text-gray-400"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {showResults && (searchResults.length > 0 || isLoading) && (
        <div className="absolute z-50 w-full mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-lg">
          <ScrollArea className="max-h-[300px]">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">Loading...</div>
            ) : (
              searchResults.map((person) => (
                <button
                  key={person.id}
                  onClick={() => handleSelect(person)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-[#2a2a2a] transition-colors text-left"
                >
                  {person.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w45${person.profile_path}`}
                      alt={person.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                      <span className="text-gray-400">{person.name[0]}</span>
                    </div>
                  )}
                  <div>
                    <div className="text-white font-medium">{person.name}</div>
                    <div className="text-sm text-gray-400">
                      {person.known_for_department}
                    </div>
                  </div>
                </button>
              ))
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default PersonSearch;
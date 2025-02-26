import React from 'react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";

interface MediaNavigationProps {
  categories: Record<string, string>;
  seriesCategories: Record<string, string>;
  onShowAll: () => void;
  onFilterCategory: (id: string) => void;
  onFetchTVSeries: () => void;
  onFetchTVSeriesByCategory: (id: string) => void;
}

const MediaNavigation = ({
  categories,
  seriesCategories,
  onShowAll,
  onFilterCategory,
  onFetchTVSeries,
  onFetchTVSeriesByCategory
}: MediaNavigationProps) => {
  return (
    <Menubar className="bg-transparent border-none">
      <MenubarMenu>
        <MenubarTrigger className="text-white hover:text-[#ea384c] transition-all duration-300">
          Movies
        </MenubarTrigger>
        <MenubarContent className="bg-[#1a1a1a] border-[#2a2a2a]">
          <MenubarItem
            className="text-white hover:text-[#ea384c] hover:bg-[#2a2a2a] cursor-pointer"
            onClick={onShowAll}
          >
            All Movies
          </MenubarItem>
          {Object.entries(categories).map(([id, name]) => (
            <MenubarItem
              key={id}
              className="text-white hover:text-[#ea384c] hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() => onFilterCategory(id)}
            >
              {name}
            </MenubarItem>
          ))}
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="text-white hover:text-[#ea384c] transition-all duration-300 ml-4">
          Series
        </MenubarTrigger>
        <MenubarContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[70vh] overflow-y-auto">
          <MenubarItem
            className="text-white hover:text-[#ea384c] hover:bg-[#2a2a2a] cursor-pointer"
            onClick={onFetchTVSeries}
          >
            All Series
          </MenubarItem>
          {Object.entries(seriesCategories).map(([id, name]) => (
            <MenubarItem
              key={id}
              className="text-white hover:text-[#ea384c] hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() => onFetchTVSeriesByCategory(id)}
            >
              {name}
            </MenubarItem>
          ))}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};

export default MediaNavigation;
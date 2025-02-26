import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings as SettingsIcon } from 'lucide-react';
import { supportedLanguages } from '../utils/translate';
import { useToast } from "@/components/ui/use-toast";

interface SettingsProps {
  currentLanguage: string;
  isDyslexicFont: boolean;
  onLanguageChange: (lang: string) => void;
  onToggleDyslexicFont: () => void;
}

const Settings = ({ 
  currentLanguage, 
  isDyslexicFont, 
  onLanguageChange, 
  onToggleDyslexicFont 
}: SettingsProps) => {
  const { toast } = useToast();

  const handleLanguageChange = (lang: string) => {
    onLanguageChange(lang);
    toast({
      title: "Language Changed",
      description: `Language has been changed to ${supportedLanguages[lang]}`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-[rgba(234,56,76,0.1)]">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#1a1a1a] border border-[#2a2a2a]">
        <DropdownMenuLabel className="text-white">Settings</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#2a2a2a]" />
        <DropdownMenuLabel className="text-white">Languages</DropdownMenuLabel>
        {Object.entries(supportedLanguages).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            className={`text-white hover:bg-[rgba(234,56,76,0.1)] cursor-pointer
              ${currentLanguage === code ? 'bg-[rgba(234,56,76,0.1)]' : ''}`}
            onClick={() => handleLanguageChange(code)}
          >
            {name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-[#2a2a2a]" />
        <DropdownMenuItem
          className="text-white hover:bg-[rgba(234,56,76,0.1)] cursor-pointer"
          onClick={onToggleDyslexicFont}
        >
          {isDyslexicFont ? 'Disable' : 'Enable'} Dyslexic Font
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Settings;
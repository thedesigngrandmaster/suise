import { useState, useEffect, useRef } from "react";
import { Search, X, User, Image } from "lucide-react";
import { Input } from "./ui/input";
import { useSearch } from "@/hooks/useSearch";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const { results, loading, search, clearResults } = useSearch();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setQuery("");
      clearResults();
    }
  }, [isOpen]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      search(query);
    }, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (url: string) => {
    navigate(url);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="w-full max-w-lg mx-4 bg-card rounded-2xl shadow-lg overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, albums, or pages (@username, /settings)"
            className="border-0 focus-visible:ring-0 p-0 text-base"
          />
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Searching...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((result) => (
                <li key={`${result.type}-${result.id}`}>
                  <button
                    onClick={() => handleSelect(result.url)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-muted transition-colors text-left"
                  >
                    {result.image ? (
                      <img
                        src={result.image}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                        {result.type === "user" ? (
                          <User className="w-5 h-5 text-secondary" />
                        ) : (
                          <Image className="w-5 h-5 text-secondary" />
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                      )}
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      result.type === "user" ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-foreground"
                    )}>
                      {result.type}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : query ? (
            <div className="p-4 text-center text-muted-foreground">
              No results found for "{query}"
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <p className="mb-2">Try searching for:</p>
              <p className="text-sm">@username • album name • /settings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

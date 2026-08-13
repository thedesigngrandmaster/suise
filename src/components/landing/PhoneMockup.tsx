import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Compass,
  Home,
  Archive,
  MessageCircle,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

import coverTrending from "@/assets/images/06. first-screen.png";
import coverNew from "@/assets/images/07. second-screen.png";
import coverTop from "@/assets/images/08. thrid-screen.png";
import coverAll from "@/assets/images/09. last-screen.png";
import avatarMascot from "@/assets/images/02. Suise's Mascot.png";
import yoomaWave from "@/assets/yooma-wave.png";

type FilterId = "All" | "New" | "Top" | "Trending";
type NavId = "home" | "vault" | "explore" | "chat" | "profile";

interface DemoAlbum {
  id: FilterId;
  title: string;
  username: string;
  displayName: string;
  likes: number;
  cover: string;
  avatar: string;
  caption: string;
}

const FILTERS: FilterId[] = ["All", "New", "Top", "Trending"];

const ALBUMS: Record<FilterId, DemoAlbum> = {
  Trending: {
    id: "Trending",
    title: "Sunset Roll",
    username: "yooma",
    displayName: "Yooma",
    likes: 128,
    cover: coverTrending,
    avatar: avatarMascot,
    caption: "Golden hour on the coast",
  },
  New: {
    id: "New",
    title: "Weekend Frames",
    username: "maya",
    displayName: "Maya Chen",
    likes: 24,
    cover: coverNew,
    avatar: yoomaWave,
    caption: "Just uploaded from the trip",
  },
  Top: {
    id: "Top",
    title: "City Lights Vol. 2",
    username: "jordan",
    displayName: "Jordan Lee",
    likes: 342,
    cover: coverTop,
    avatar: avatarMascot,
    caption: "Most loved this month",
  },
  All: {
    id: "All",
    title: "Shared Vault",
    username: "alex",
    displayName: "Alex Rivera",
    likes: 56,
    cover: coverAll,
    avatar: yoomaWave,
    caption: "Everything in one place",
  },
};

export function PhoneMockup() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterId>("Trending");
  const [activeNav, setActiveNav] = useState<NavId>("home");
  const [liked, setLiked] = useState(false);

  const album = ALBUMS[filter];
  const likeCount = album.likes + (liked ? 1 : 0);

  const goAuth = () => navigate("/auth");

  const handleNav = (id: NavId) => {
    setActiveNav(id);
    // Home stays in the demo; everything else invites the visitor to sign up
    if (id !== "home") {
      goAuth();
    }
  };

  return (
    <div className="relative mx-auto w-[280px] sm:w-[320px]">
      <div
        className="rounded-[2.75rem] border border-border/70 bg-card p-3"
        style={{ boxShadow: "var(--shadow-float)" }}
      >
        <div className="soft-surface rounded-[2.25rem] p-4">
          {/* Status / brand strip */}
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-[10px] font-semibold tracking-wide text-muted-foreground">
              Explore
            </span>
            <span className="text-[10px] text-muted-foreground">9:41</span>
          </div>

          {/* Filter chips — clickable */}
          <div
            className="mb-4 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Album filters"
          >
            {FILTERS.map((chip) => {
              const active = filter === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setFilter(chip);
                    setLiked(false);
                    setActiveNav("home");
                  }}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
                    active
                      ? "bg-secondary text-secondary-foreground"
                      : "border border-border/70 bg-card text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          {/* Album card with real cover */}
          <div className="soft-card overflow-hidden p-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.25rem] bg-muted">
              <img
                key={album.id}
                src={album.cover}
                alt={`${album.title} cover`}
                className="h-full w-full object-cover transition-opacity duration-300"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-3 pb-2.5 pt-8">
                <p className="text-[10px] font-medium text-white/90">{album.caption}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-2 py-3">
              <img
                src={album.avatar}
                alt=""
                className="h-8 w-8 rounded-full object-cover ring-1 ring-border/60"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold leading-tight">{album.title}</p>
                <p className="truncate text-[10px] text-muted-foreground">
                  shared by @{album.username}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLiked((v) => !v)}
                className="flex items-center gap-1 rounded-full px-1.5 py-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                aria-label={liked ? "Unlike" : "Like"}
                aria-pressed={liked}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-colors",
                    liked ? "fill-secondary text-secondary" : "text-secondary"
                  )}
                />
                <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
                  {likeCount}
                </span>
              </button>
            </div>
          </div>

          {/* Bottom nav — clickable */}
          <nav
            className="mt-4 flex items-center justify-between rounded-full border border-border/70 bg-card px-3 py-2.5 shadow-neubrutalist-sm"
            aria-label="App navigation preview"
          >
            <NavButton
              label="Home"
              active={activeNav === "home"}
              onClick={() => handleNav("home")}
            >
              <Home className="h-4 w-4" strokeWidth={activeNav === "home" ? 2.5 : 1.75} />
            </NavButton>
            <NavButton
              label="Vault"
              active={activeNav === "vault"}
              onClick={() => handleNav("vault")}
            >
              <Archive className="h-4 w-4" strokeWidth={activeNav === "vault" ? 2.5 : 1.75} />
            </NavButton>
            <NavButton
              label="Explore"
              active={activeNav === "explore"}
              onClick={() => handleNav("explore")}
            >
              <Compass className="h-4 w-4" strokeWidth={activeNav === "explore" ? 2.5 : 1.75} />
            </NavButton>
            <NavButton
              label="Chat"
              active={activeNav === "chat"}
              onClick={() => handleNav("chat")}
            >
              <MessageCircle className="h-4 w-4" strokeWidth={activeNav === "chat" ? 2.5 : 1.75} />
            </NavButton>
            <NavButton
              label="Profile"
              active={activeNav === "profile"}
              onClick={() => handleNav("profile")}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full transition-colors",
                  activeNav === "profile"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <User className="h-3.5 w-3.5" />
              </span>
            </NavButton>
          </nav>
        </div>
      </div>
    </div>
  );
}

function NavButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
        active ? "text-secondary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

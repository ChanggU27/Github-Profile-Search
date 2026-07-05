import { useState, useEffect, useRef } from "react";

import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import logo from "./assets/favicon.png";
import darkLogo from "./assets/darkFavicon.png";

function UserProfile({ userData }) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start border rounded-lg p-6 mt-6">
      <img
        src={userData.avatar_url}
        alt={userData.login}
        className="h-24 w-24 sm:h-32 sm:w-32 rounded-full shrink-0"
      />

      <div className="space-y-2 text-center sm:text-left">
        <a
          href={userData.html_url}
          target="_blank"
          rel="noreferrer"
          className="text-2xl sm:text-3xl
        font-bold hover:underline"
        >
          {userData.login}
        </a>
        <p>{userData.bio || "No bio available."}</p>
        <p className="text-sm text-muted-foreground">
          Joined{" "}
          {new Date(userData.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-1">
          <p>Followers: {userData.followers.toLocaleString()}</p>
          <p>Following: {userData.following.toLocaleString()}</p>
          <p>Repos: {userData.public_repos.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, setPage }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let start = Math.max(2, page - 1);
    let end = Math.min(totalPages - 1, page + 1);

    if (page <= 3) end = Math.min(totalPages - 1, 4);
    if (page >= totalPages - 2) start = Math.max(2, totalPages - 3);

    const middle = [];
    if (start > 2) middle.push("...");
    for (let i = start; i <= end; i++) middle.push(i);
    if (end < totalPages - 1) middle.push("...");

    return [1, ...middle, totalPages];
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <Button
        variant="ghost"
        size="sm"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
        <ChevronLeftIcon className="size-5" />
      </Button>

      {getPages().map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "outline" : "ghost"}
            size="sm"
            className="w-8 h-8 p-0 text-sm"
            onClick={() => setPage(p)}
          >
            {p}
          </Button>
        ),
      )}

      <Button
        variant="ghost"
        size="sm"
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
      >
        <ChevronRightIcon className="size-5" />
      </Button>
    </div>
  );
}

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

function RepositoryList({
  repos,
  totalRepos,
  sortBy,
  setSortBy,
  page,
  setPage,
  totalPages,
  repoSearch,
  setRepoSearch,
  userData,
}) {
  const scrollRef = useRef(null);

  //Scroll Reset Effect
  useEffect(() => {
    scrollRef.current
      ?.querySelector("[data-radix-scroll-area-viewport]")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, sortBy]);

  return (
    <div className="mt-8">
      <div className="flex flex-col sm:grid sm:grid-cols-3 sm:items-center gap-3 mb-4">
        <p className="text-sm text-muted-foreground">
          Showing latest {totalRepos} of{" "}
          {userData.public_repos.toLocaleString()} repositories
        </p>

        <div className="flex flex-row gap-2 sm:contents">
          <Input
            value={repoSearch}
            onChange={(e) => setRepoSearch(e.target.value)}
            placeholder="Search repositories..."
            containerClassName="flex-1 sm:w-full"
          />

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 sm:w-50 shrink-0 sm:justify-self-end">
              <SelectValue placeholder="Sort repositories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Recently Updated</SelectItem>
              <SelectItem value="stars">Most Stars</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div ref={scrollRef}>
        <ScrollArea className="h-96 rounded-md border p-4">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors my-2"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold hover:underline break-all"
                >
                  {repo.name}
                </a>

                <div className="flex gap-4 text-sm text-muted-foreground shrink-0">
                  <span>Updated {formatDate(repo.updated_at)}</span>
                  <span>⭐ {repo.stargazers_count.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                {repo.language ?? "Unknown"}
              </p>

              {repo.description && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {repo.description}
                </p>
              )}
            </div>
          ))}

          {repos.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              No repositories matched your search.
            </div>
          )}
        </ScrollArea>
      </div>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}

function UserSkeleton() {
  return (
    <div className="mt-6 space-y-6">
      {/* Profile card */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border rounded-lg p-6">
        <Skeleton className="h-24 w-24 sm:h-32 sm:w-32 rounded-full shrink-0" />
        <div className="flex-1 space-y-3 w-full">
          <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-32 mx-auto sm:mx-0" />
          <div className="flex gap-6 justify-center sm:justify-start">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>

      {/* Repo list header */}
      <div className="flex flex-col sm:grid sm:grid-cols-3 sm:items-center gap-3">
        <Skeleton className="h-4 w-48" />
        <div className="flex flex-row gap-2 sm:contents">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-40 shrink-0 sm:w-50 sm:justify-self-end" />
        </div>
      </div>

      {/* Repo cards */}
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

// Dark & Light mode
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <span className="text-2xl">{theme === "dark" ? "☀️" : "🌙"}</span>
    </Button>
  );
}

function App() {
  const [text, setText] = useState("");
  const [userData, setUserData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("updated");
  const [page, setPage] = useState(1);
  const [repoSearch, setRepoSearch] = useState("");

  const { resolvedTheme } = useTheme();

  const reposPerPage = 20;

  const startIndex = (page - 1) * reposPerPage;
  const endIndex = startIndex + reposPerPage;

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(repoSearch.toLowerCase()),
  );

  const sortedRepos = [...filteredRepos].sort((a, b) => {
    if (sortBy === "stars") {
      return b.stargazers_count - a.stargazers_count;
    }

    return new Date(b.updated_at) - new Date(a.updated_at);
  });

  const currentPageRepos = sortedRepos.slice(startIndex, endIndex);

  const totalPages = Math.max(1, Math.ceil(sortedRepos.length / reposPerPage));

  async function getUserData(user) {
    setError(null);
    setUserData(null);
    setRepos([]);

    const headers = {
      Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
    };

    const response = await fetch(`https://api.github.com/users/${user}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Couldn't find a GitHub user named "${user}".`);
    }

    const data = await response.json();

    setUserData(data);

    const reposResponse = await fetch(
      `${data.repos_url}?sort=updated&per_page=100`,
      { headers },
    );

    const reposData = await reposResponse.json();

    setRepos(reposData);
    setRepoSearch("");
    setPage(1);
  }

  useEffect(() => {
    if (!text.trim()) {
      setUserData(null);
      setRepos([]);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        await getUserData(text);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [text]);

  useEffect(() => {
    setPage(1);
  }, [repoSearch]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-6xl mx-auto p-8">
        <Field>
          <div className="relative mb-6">
            <div className="flex justify-center">
              <div className="flex items-center gap-4">
                <img
                  src={resolvedTheme === "dark" ? darkLogo : logo}
                  alt="GitSleuth logo"
                  className="w-16 h-16 md:w-20 md:h-20 object-contain"
                />

                <div className="flex flex-col">
                  <FieldLabel className="text-2xl md:text-3xl font-bold">
                    GitSleuth
                  </FieldLabel>

                  <p className="text-sm text-muted-foreground">
                    Investigate developers, repositories, and coding activity.
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute top-0 right-0">
              <ThemeToggle />
            </div>
          </div>

          <div className="flex justify-center mt-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter a GitHub username..."
              aria-invalid={!!error}
              containerClassName="w-full max-w-md"
              className="h-11"
            />
          </div>

          <div className="flex justify-center mt-2">
            {error && <FieldError>{error}</FieldError>}
          </div>

          {!loading && !userData && !error && (
            <div className="mt-16 text-center text-muted-foreground">
              <p>Search and investigate any public GitHub profile.</p>
            </div>
          )}
        </Field>

        <div className="mt-6">
          {loading ? (
            <UserSkeleton />
          ) : userData ? (
            <>
              <UserProfile userData={userData} />
              <RepositoryList
                repos={currentPageRepos}
                totalRepos={repos.length}
                sortBy={sortBy}
                setSortBy={setSortBy}
                page={page}
                setPage={setPage}
                totalPages={totalPages}
                repoSearch={repoSearch}
                setRepoSearch={setRepoSearch}
                userData={userData}
              />
            </>
          ) : null}
        </div>
      </main>

      <footer className="border-t pt-5 pb-5 text-center text-sm text-muted-foreground">
        <p>GitSleuth • © 2026 John Jacob Villa</p>

        <div className="flex justify-center gap-6 mt-2">
          <a
            href="https://github.com/ChanggU27"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:underline"
          >
            <FaGithub className="h-4 w-4" />
            GitHub
          </a>

          <a
            href="https://www.linkedin.com/in/john-jacob-villa-334b69382/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:underline"
          >
            <FaLinkedin className="h-4 w-4" />
            LinkedIn
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;

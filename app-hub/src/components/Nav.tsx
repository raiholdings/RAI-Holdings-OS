import { Link, NavLink } from "react-router-dom";

export const WORKSPACE_URL = "https://workspace.raiholdings.vn";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-[#4f8ff7] to-[#7c5cff] font-[family-name:var(--font-display)] text-[0.95rem] font-bold text-white">R</span>
      <span className="text-[1.05rem] font-semibold tracking-tight">RAI OS</span>
    </Link>
  );
}

export function Nav() {
  const link = ({ isActive }: { isActive: boolean }) =>
    `text-[0.9rem] transition-colors ${isActive ? "text-white" : "text-[#9aa3b7] hover:text-white"}`;
  return (
    <header className="sticky top-0 z-40 border-b border-[#232735] bg-[#0a0b10]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-7 sm:flex">
          <NavLink to="/downloads" className={link}>Tải xuống</NavLink>
          <NavLink to="/releases" className={link}>Phiên bản</NavLink>
          <a href="https://raiholdings.vn" className="text-[0.9rem] text-[#9aa3b7] transition-colors hover:text-white">Về RAI</a>
        </nav>
        <a href={WORKSPACE_URL} className="rounded-lg border border-[#2c3146] bg-[#12141c] px-3.5 py-2 text-[0.85rem] font-medium text-white transition-colors hover:border-[#4f8ff7]">
          Dùng trên web →
        </a>
      </div>
    </header>
  );
}

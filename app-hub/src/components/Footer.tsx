import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-[#232735] bg-[#0a0b10]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-[0.84rem] text-[#9aa3b7] sm:flex-row">
        <div>© 2026 RAI Holdings. Hệ điều hành doanh nghiệp AI-Native.</div>
        <div className="flex flex-wrap items-center gap-5">
          <Link to="/downloads" className="hover:text-white">Tải xuống</Link>
          <Link to="/releases" className="hover:text-white">Phiên bản</Link>
          <a href="https://workspace.raiholdings.vn" className="hover:text-white">Dùng trên web</a>
          <a href="https://raiholdings.vn" className="hover:text-white">RAI Holdings</a>
        </div>
      </div>
    </footer>
  );
}

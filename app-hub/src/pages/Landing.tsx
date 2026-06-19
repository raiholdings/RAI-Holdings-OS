import { SmartDownload } from "../components/SmartDownload";

const VALUES = [
  { icon: "✨", title: "Venture Builder", desc: "Gõ một câu mô tả ý tưởng — pipeline 8 engine AI dựng nên doanh nghiệp: tín hiệu thị trường, mô hình kinh doanh, mô phỏng và thử nghiệm." },
  { icon: "🗄️", title: "Big Data", desc: "Tra cứu ~1 triệu doanh nghiệp Việt Nam: mã số thuế, vùng, ngành — dữ liệu thật, lọc nhanh." },
  { icon: "🧠", title: "RAI LLMs", desc: "Cổng AI hợp nhất — một API cho mọi mô hình (Claude, GPT, Gemini…), credit VND minh bạch." },
  { icon: "⚙️", title: "8 Engine tự động", desc: "Observe → Knowledge → Opportunity → Design → Simulation → Experiment → Revenue → Learning. Tự động hoá toàn vòng đời venture." },
];

const PLATFORMS = [
  { icon: "🌐", name: "PWA", note: "Cài thẳng từ trình duyệt" },
  { icon: "🖥️", name: "Desktop", note: "Windows · macOS · Linux" },
  { icon: "📱", name: "Mobile", note: "iOS · Android" },
  { icon: "🧩", name: "Tiện ích", note: "Chrome · Edge · Firefox · Safari" },
];

export function Landing() {
  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-[#4f8ff7]/15 blur-[120px]" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#232735] bg-[#12141c] px-3 py-1 text-[0.78rem] text-[#9aa3b7]">
            <span className="size-1.5 rounded-full bg-[#4f8ff7]" /> RAI OS — nền tảng vận hành AI-Native
          </div>
          <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-[1.08] tracking-tight">
            Hệ điều hành doanh nghiệp AI-Native.<br />
            <span className="bg-gradient-to-r from-[#4f8ff7] to-[#7c5cff] bg-clip-text text-transparent">Gõ một ý tưởng — RAI dựng nên công ty.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-[#9aa3b7]">
            Một câu mô tả biến thành tín hiệu thị trường, mô hình kinh doanh, mô phỏng và thử nghiệm thực tế — vận hành bằng 8 engine AI. Tải RAI OS cho mọi thiết bị, hoặc dùng ngay trên web.
          </p>
          <div className="mt-8"><SmartDownload /></div>
        </div>
      </section>

      {/* value points */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-[#232735] bg-[#12141c] p-5 transition-colors hover:border-[#2c3146]">
              <div className="text-2xl">{v.icon}</div>
              <h3 className="mt-3 text-[1.05rem] font-semibold">{v.title}</h3>
              <p className="mt-1.5 text-[0.88rem] leading-relaxed text-[#9aa3b7]">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* one app, every platform */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="rounded-2xl border border-[#232735] bg-gradient-to-br from-[#12141c] to-[#0a0b10] p-8">
          <h2 className="font-[family-name:var(--font-display)] text-[1.5rem] font-semibold">Một codebase — mọi nền tảng</h2>
          <p className="mt-2 max-w-2xl text-[0.92rem] text-[#9aa3b7]">Cùng một web app RAI OS, bọc thành PWA, desktop, mobile và tiện ích trình duyệt. Cập nhật tức thì, trải nghiệm nhất quán.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PLATFORMS.map((p) => (
              <div key={p.name} className="flex items-center gap-3 rounded-xl border border-[#232735] bg-[#0a0b10] px-4 py-3">
                <span className="text-xl">{p.icon}</span>
                <div><div className="text-[0.92rem] font-medium">{p.name}</div><div className="text-[0.76rem] text-[#9aa3b7]">{p.note}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

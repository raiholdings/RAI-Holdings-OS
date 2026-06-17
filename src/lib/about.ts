/**
 * RAI About ("Company") — brand & organization story, content-as-data.
 *
 * Block-based pages under /about, rendered SSR/SSG. The defining rule (SPEC §1):
 * keep three metric categories strictly separate — `aspiration` (RAI's long-term
 * vision, MIT-inspired), `actual` (real RAI numbers, sourced or placeholder), and
 * `reference` (MIT's own figures, credited). Never present MIT numbers as RAI's.
 *
 * Server-safe + client-importable. CMS + AI editing is optional (SPEC §6, Phase 3)
 * and intentionally not built here — it would reuse the Enterprise/Pricing
 * "AI proposes → human reviews" pattern.
 */
import { t, type T } from "@/lib/i18n-core";
import { systemMetricValue } from "@/lib/enterprise";

/* ============================== sub-nav tabs ============================ */
export type AboutTab = { key: string; route: string; label: T };
export const aboutTabs: AboutTab[] = [
  { key: "about", route: "/about", label: t("About RAI", "Về RAI Holdings") },
  { key: "ecosystem", route: "/about/ecosystem", label: t("Ecosystem", "Hệ sinh thái") },
  { key: "how-we-work", route: "/about/how-we-work", label: t("How we work", "Mô hình hoạt động") },
  { key: "impact", route: "/about/impact", label: t("Impact", "Tác động") },
  { key: "leadership", route: "/about/leadership", label: t("Leadership", "Lãnh đạo") },
  { key: "partners", route: "/about/partners", label: t("Partners", "Đối tác") },
  { key: "story", route: "/about/story", label: t("Story", "Câu chuyện") },
  { key: "contact", route: "/about/contact", label: t("Contact", "Liên hệ") },
];

/* ============================== block schema ============================ */
export type MetricCategory = "aspiration" | "actual" | "reference";
export type MetricItem = { label: T; value?: string; system?: "apps" | "deploys" | "listings"; sub?: T };

export type Block =
  | { type: "hero"; data: { eyebrow?: T; title: T; subhead: T; ctaLabel?: T; ctaHref?: string } }
  | { type: "prose"; data: { label?: T; heading?: T; body: T; accent?: boolean } }
  | { type: "metric_strip"; data: { category: MetricCategory; note?: T; items: MetricItem[] } }
  | { type: "pillar_grid"; data: { items: { icon: string; title: T; body: T }[] } }
  | { type: "entity_grid"; data: { items: { name: string; color: string; body: T; href?: string }[] } }
  | { type: "steps"; data: { steps: { title: T; body: T }[]; note?: T } }
  | { type: "timeline"; data: { items: { date: string; title: T; body: T }[] } }
  | { type: "leaders_grid"; data: { items: { name: string; role: T; bio?: T }[] } }
  | { type: "partners_grid"; data: { groups: { title: T; names: string[] }[] } }
  | { type: "reference"; data: { body: T; source: T; sourceUrl?: string } }
  | { type: "contact"; data: { email: string; phone: string; address: T } }
  | { type: "cta_band"; data: { title: T; body?: T; ctaLabel: T; ctaHref: string } };

/** Resolve a metric item's display value (live for `system`, else inline). */
export function metricItemValue(it: MetricItem): string | undefined {
  if (it.system) return systemMetricValue(it.system === "apps" ? "apps.count" : it.system === "deploys" ? "code.repos.live" : "marketplace.listings");
  return it.value;
}

export type AboutPage = { key: string; route: string; title: T; seoTitle: T; seoDescription: T; blocks: Block[] };

/* ============================== pages =================================== */
const PAGES: AboutPage[] = [
  /* ----------------------------- /about ----------------------------- */
  {
    key: "about", route: "/about",
    title: t("About RAI Holdings", "Về RAI Holdings"),
    seoTitle: t("About RAI Holdings — an AI-native venture builder", "Về RAI Holdings — nhà kiến tạo doanh nghiệp thời đại AI"),
    seoDescription: t("RAI Holdings is an AI-native venture builder creating founders and startups for Vietnam's knowledge economy.", "RAI Holdings là nhà kiến tạo doanh nghiệp AI-native, tạo ra nhà sáng lập và startup cho nền kinh tế tri thức Việt Nam."),
    blocks: [
      { type: "hero", data: {
        eyebrow: t("AI-native venture builder", "Nhà kiến tạo doanh nghiệp AI-native"),
        title: t("RAI Holdings — building companies for the AI era", "RAI Holdings — Nhà kiến tạo doanh nghiệp thời đại AI"),
        subhead: t("An AI-native venture builder. We create founders and startups, helping shape Vietnam's knowledge economy.", "Một nhà kiến tạo doanh nghiệp AI-native. Chúng tôi kiến tạo nhà sáng lập và doanh nghiệp khởi nghiệp, góp phần định hình nền kinh tế tri thức Việt Nam."),
        ctaLabel: t("Explore the ecosystem", "Khám phá hệ sinh thái"), ctaHref: "/about/ecosystem" } },
      { type: "prose", data: { label: t("Positioning", "Định vị"), body: t("RAI Holdings is an AI-native group: AI is not a bolt-on feature, it is the foundation of everything we build. We don't only invest or advise — we build ventures: turning knowledge and technology into real founders and startups capable of growth.", "RAI Holdings là một tập đoàn AI-native: AI không phải tính năng thêm vào, mà là nền tảng của mọi thứ chúng tôi xây dựng. Chúng tôi không chỉ đầu tư hay tư vấn — chúng tôi kiến tạo doanh nghiệp (venture building): biến tri thức và công nghệ thành những nhà sáng lập thực thụ và những công ty khởi nghiệp có khả năng tăng trưởng.") } },
      { type: "prose", data: { label: t("Mission", "Sứ mệnh"), accent: true, body: t("Our mission: to create more founders and more startups that contribute substantially to Vietnam's knowledge economy.", "Sứ mệnh của chúng tôi: tạo ra nhiều nhà sáng lập, nhiều doanh nghiệp khởi nghiệp, đóng góp phần lớn vào nền kinh tế tri thức tại Việt Nam.") } },
      { type: "prose", data: { label: t("Vision (aspiration)", "Tầm nhìn (khát vọng)"), body: t("We're inspired by the MIT model — where a community of alumni founded tens of thousands of companies, created millions of jobs, and generated economic activity rivaling one of the world's largest economies. RAI aims to build a similar ecosystem for Vietnam: where education, research, and innovation combine to produce thousands of entrepreneurs and millions of knowledge-economy jobs.", "Chúng tôi lấy cảm hứng từ mô hình MIT — nơi cộng đồng cựu sinh viên đã sáng lập hàng chục nghìn công ty, tạo hàng triệu việc làm và đóng góp kinh tế tương đương một trong những nền kinh tế lớn nhất thế giới. RAI hướng tới việc kiến tạo một hệ sinh thái tương tự cho Việt Nam: nơi giáo dục, nghiên cứu và đổi mới sáng tạo hợp lực để sinh ra hàng nghìn doanh nhân và hàng triệu việc làm trong nền kinh tế tri thức.") } },
      { type: "metric_strip", data: { category: "aspiration", note: t("These are RAI's vision targets, inspired by the MIT model. RAI's current actuals are shown separately on the Impact tab, with internal sources.", "Đây là mục tiêu tầm nhìn của RAI, lấy cảm hứng từ mô hình MIT. Số liệu thực tế hiện tại của RAI hiển thị riêng ở tab Tác động, với nguồn nội bộ."), items: [
        { label: t("Thousands of founders", "Hàng nghìn nhà sáng lập"), sub: t("long-term target", "mục tiêu dài hạn") },
        { label: t("Millions of knowledge jobs", "Hàng triệu việc làm tri thức"), sub: t("long-term target", "mục tiêu dài hạn") },
        { label: t("Major contribution to VN's knowledge economy", "Đóng góp đáng kể cho kinh tế tri thức VN"), sub: t("direction", "định hướng") },
      ] } },
      { type: "cta_band", data: { title: t("The three pillars: Education – Research – Innovation", "Ba trụ cột: Education – Research – Innovation"), ctaLabel: t("Explore the ecosystem", "Tìm hiểu hệ sinh thái"), ctaHref: "/about/ecosystem" } },
    ],
  },

  /* ----------------------------- /about/ecosystem ----------------------------- */
  {
    key: "ecosystem", route: "/about/ecosystem",
    title: t("RAI ecosystem", "Hệ sinh thái RAI"),
    seoTitle: t("RAI ecosystem — Education, Research, Innovation", "Hệ sinh thái RAI — Giáo dục, Nghiên cứu, Đổi mới"),
    seoDescription: t("Three pillars — Education, Research, Innovation — combine into an engine that produces founders and ventures.", "Ba trụ cột — Giáo dục, Nghiên cứu, Đổi mới — hợp lực thành cỗ máy sinh ra nhà sáng lập và doanh nghiệp."),
    blocks: [
      { type: "hero", data: {
        title: t("The RAI ecosystem — three pillars that build", "Hệ sinh thái RAI — Ba trụ cột kiến tạo"),
        subhead: t("Following the MIT model, the Education, Research, and Innovation pillars combine into an engine that produces founders and companies.", "Theo mô hình MIT, ba trụ cột Education, Research và Innovation hợp lực thành một cỗ máy sinh ra nhà sáng lập và doanh nghiệp.") } },
      { type: "pillar_grid", data: { items: [
        { icon: "school", title: t("Education", "Giáo dục"), body: t("Equip founders with AI-era entrepreneurial thinking — not just knowledge, but systems thinking, business-model frameworks, and the skills to run an AI-assisted one-person company (OPC). The goal: every learner can become a founder.", "Trang bị tư duy và năng lực khởi nghiệp thời đại AI — không chỉ kiến thức, mà tư duy hệ thống, khung mô hình kinh doanh, và kỹ năng vận hành doanh nghiệp một-người (OPC) được AI hỗ trợ. Mục tiêu: mỗi học viên có thể trở thành người sáng lập.") },
        { icon: "cpu", title: t("Research", "Nghiên cứu"), body: t("Create core knowledge and technology. RAI LAB and its research network turn knowledge into AI-native products: agents, platforms, tools. Research doesn't stay on paper — it becomes the foundation for new ventures.", "Tạo tri thức và công nghệ lõi. RAI LAB và mạng lưới nghiên cứu chuyển hóa tri thức thành sản phẩm AI-native: trợ lý ảo, nền tảng, công cụ. Nghiên cứu không nằm trên giấy — nó trở thành nền tảng cho doanh nghiệp mới.") },
        { icon: "bolt", title: t("Innovation", "Đổi mới sáng tạo"), body: t("Turn knowledge into companies. Through the Innovation Lab and a provincial/national innovation network, RAI incubates and accelerates ideas into real startups — connecting capital (RAI FUND), platform (RAI ONE), and markets.", "Biến tri thức thành doanh nghiệp. Thông qua Innovation Lab và mạng lưới đổi mới sáng tạo cấp tỉnh/quốc gia, RAI ươm tạo và tăng tốc ý tưởng thành công ty khởi nghiệp thực thụ, kết nối vốn (RAI FUND), nền tảng (RAI ONE) và thị trường.") },
      ] } },
      { type: "prose", data: { label: t("The flywheel", "Vòng tuần hoàn"), accent: true, body: t("The three pillars form a flywheel: Education produces founders → Research supplies core technology → Innovation turns them into companies → successful companies feed back into education and research. This is the 'twin engine' MIT has proven effective.", "Ba trụ cột tạo thành vòng tuần hoàn: Giáo dục sinh ra nhà sáng lập → Nghiên cứu cấp công nghệ lõi → Đổi mới biến chúng thành doanh nghiệp → Doanh nghiệp thành công lại nuôi dưỡng giáo dục và nghiên cứu. Đây chính là 'động cơ kép' mà MIT đã chứng minh hiệu quả.") } },
      { type: "entity_grid", data: { items: [
        { name: "RAI FUND", color: "var(--color-fund)", body: t("Invests in and funds startups across the ecosystem.", "Đầu tư & cấp vốn cho startup trong hệ sinh thái."), href: "/fund" },
        { name: "RAI LAB", color: "var(--color-lab)", body: t("R&D for core AI technology.", "Nghiên cứu & phát triển công nghệ AI lõi."), href: "/lab" },
        { name: "RAI ONE", color: "var(--color-one)", body: t("Operating platform & products (tied to RAI OS).", "Nền tảng/sản phẩm vận hành (gắn với RAI OS)."), href: "/one" },
      ] } },
      { type: "cta_band", data: { title: t("See how we build ventures", "Xem cách chúng tôi kiến tạo doanh nghiệp"), ctaLabel: t("How we work", "Mô hình hoạt động"), ctaHref: "/about/how-we-work" } },
    ],
  },

  /* ----------------------------- /about/how-we-work ----------------------------- */
  {
    key: "how-we-work", route: "/about/how-we-work",
    title: t("How we work", "Mô hình hoạt động"),
    seoTitle: t("How RAI works — the venture-building engine", "Mô hình hoạt động — Cỗ máy kiến tạo của RAI"),
    seoDescription: t("From idea to founder to company — RAI's AI-native venture-building engine.", "Từ ý tưởng đến nhà sáng lập đến doanh nghiệp — cỗ máy kiến tạo AI-native của RAI."),
    blocks: [
      { type: "hero", data: { title: t("From idea to company — RAI's building engine", "Từ ý tưởng đến doanh nghiệp — Cỗ máy kiến tạo của RAI"), subhead: t("A repeatable, AI-native engine that turns talent and technology into growing companies.", "Một cỗ máy AI-native lặp lại được, biến tài năng và công nghệ thành doanh nghiệp tăng trưởng.") } },
      { type: "steps", data: { note: t("What's different: AI-native throughout — every RAI founder is equipped with a 'team of AI agents' to operate like a large company even when starting as one person.", "Điểm khác biệt: AI-native xuyên suốt — mỗi nhà sáng lập RAI được trang bị 'đội ngũ trợ lý ảo' để vận hành như một doanh nghiệp lớn dù khởi đầu một người."), steps: [
        { title: t("Discover & educate", "Phát hiện & Đào tạo"), body: t("Find talent and equip founder thinking (Education).", "Tìm tài năng, trang bị tư duy sáng lập (Education).") },
        { title: t("Supply technology", "Cấp công nghệ"), body: t("Bring AI-native platforms, agents, and tools from Research.", "Đưa nền tảng AI-native, trợ lý ảo, công cụ từ Research.") },
        { title: t("Incubate & accelerate", "Ươm tạo & Tăng tốc"), body: t("The Innovation Lab turns ideas into products with customers.", "Innovation Lab biến ý tưởng thành sản phẩm có khách hàng.") },
        { title: t("Fund & scale", "Cấp vốn & Mở rộng"), body: t("RAI FUND invests; RAI ONE supplies the operating platform.", "RAI FUND đầu tư, RAI ONE cung nền tảng vận hành.") },
        { title: t("Connect to market", "Kết nối thị trường"), body: t("Take products to market through the ecosystem (marketplace, network).", "Đưa sản phẩm ra qua hệ sinh thái (marketplace, mạng lưới).") },
      ] } },
      { type: "cta_band", data: { title: t("See the impact we aim for", "Xem tác động chúng tôi hướng tới"), ctaLabel: t("Impact", "Tác động"), ctaHref: "/about/impact" } },
    ],
  },

  /* ----------------------------- /about/impact ----------------------------- */
  {
    key: "impact", route: "/about/impact",
    title: t("Impact", "Tác động"),
    seoTitle: t("RAI impact — founders, jobs, and knowledge", "Tác động của RAI — nhà sáng lập, việc làm và tri thức"),
    seoDescription: t("RAI's impact, measured in founders, jobs, and knowledge — aspiration and actuals kept separate, MIT figures credited.", "Tác động của RAI, đo bằng nhà sáng lập, việc làm và tri thức — tách bạch khát vọng và thực tế, ghi nguồn MIT."),
    blocks: [
      { type: "hero", data: { title: t("RAI's impact — measured in founders, jobs, and knowledge", "Tác động của RAI — Đo bằng nhà sáng lập, việc làm và tri thức"), subhead: t("We separate what we aspire to from what we've actually achieved — and we credit the MIT figures that inspire us.", "Chúng tôi tách rõ điều mình khát vọng với điều đã thực sự đạt được — và ghi nguồn các số liệu MIT đã truyền cảm hứng.") } },
      { type: "metric_strip", data: { category: "aspiration", note: t("Long-term targets — the MIT model. Not current achievements.", "Mục tiêu dài hạn — hình mẫu MIT. Không phải thành tích hiện tại."), items: [
        { label: t("Thousands of founders created", "Hàng nghìn nhà sáng lập được kiến tạo"), sub: t("target", "mục tiêu") },
        { label: t("Millions of knowledge jobs", "Hàng triệu việc làm tri thức"), sub: t("target", "mục tiêu") },
        { label: t("Major contribution to VN's knowledge economy", "Đóng góp lớn cho kinh tế tri thức VN"), sub: t("target", "mục tiêu") },
      ] } },
      { type: "metric_strip", data: { category: "actual", note: t("Current actuals — refreshed from RAI systems. No fabricated numbers; placeholders where internal data isn't wired yet.", "Kết quả thực tế — cập nhật từ hệ thống RAI. Không bịa số; để placeholder nơi chưa nối dữ liệu nội bộ."), items: [
        { label: t("AI apps in the ecosystem", "AI apps trong hệ sinh thái"), system: "apps" },
        { label: t("Live deployments", "Bản triển khai chạy thật"), system: "deploys" },
        { label: t("Founders / partners supported", "Nhà sáng lập / đối tác đã hỗ trợ"), value: "—", sub: t("internal placeholder", "placeholder nội bộ") },
        { label: t("Provinces / labs in the network", "Tỉnh / lab trong mạng lưới"), value: "30", sub: t("internal source", "nguồn nội bộ") },
      ] } },
      { type: "reference", data: {
        body: t("Per an MIT report (2015), MIT alumni had founded around 30,200 active companies, creating ~4.6 million jobs and ~$1.9 trillion in annual revenue — comparable to the GDP of the world's 10th-largest economy (2014 data).", "Theo báo cáo của MIT (2015), cựu sinh viên MIT đã sáng lập khoảng 30.200 công ty đang hoạt động, tạo ~4,6 triệu việc làm và ~1,9 nghìn tỷ USD doanh thu/năm — tương đương GDP nền kinh tế lớn thứ 10 thế giới (dữ liệu 2014)."),
        source: t("Source: MIT / Kauffman Foundation. These are MIT's figures, used as a model for RAI's aspiration — not RAI's results.", "Nguồn: MIT / Kauffman Foundation. Đây là số liệu của MIT, làm hình mẫu cho khát vọng của RAI — không phải kết quả của RAI."),
        sourceUrl: "https://www.kauffman.org/" } },
      { type: "cta_band", data: { title: t("Meet the people behind RAI", "Gặp những người đứng sau RAI"), ctaLabel: t("Leadership", "Lãnh đạo"), ctaHref: "/about/leadership" } },
    ],
  },

  /* ----------------------------- /about/leadership ----------------------------- */
  {
    key: "leadership", route: "/about/leadership",
    title: t("Leadership", "Lãnh đạo"),
    seoTitle: t("RAI leadership & team", "Lãnh đạo & đội ngũ RAI"),
    seoDescription: t("The leaders and founders building RAI Holdings.", "Những lãnh đạo và nhà sáng lập đang xây dựng RAI Holdings."),
    blocks: [
      { type: "hero", data: { title: t("Leadership & team", "Lãnh đạo & Đội ngũ"), subhead: t("The people building RAI Holdings and its ecosystem.", "Những người đang xây dựng RAI Holdings và hệ sinh thái.") } },
      { type: "leaders_grid", data: { items: [
        { name: "Phạm Văn Thư", role: t("Chief Architect", "Kiến trúc sư trưởng"), bio: t("Leads the architecture and strategy of RAI OS and the venture-building engine.", "Dẫn dắt kiến trúc và chiến lược của RAI OS và cỗ máy kiến tạo doanh nghiệp.") },
        { name: "Hà Thị Thuý Hường", role: t("Chief Executive Officer", "Tổng giám đốc (CEO)"), bio: t("Leads RAI Holdings' operations and growth.", "Điều hành hoạt động và tăng trưởng của RAI Holdings.") },
      ] } },
      { type: "prose", data: { body: t("We're growing the team across education, research, and innovation. Advisor and founder profiles will be added from internal data.", "Chúng tôi đang mở rộng đội ngũ trên cả ba mảng giáo dục, nghiên cứu và đổi mới. Hồ sơ cố vấn và nhà sáng lập sẽ được bổ sung từ dữ liệu nội bộ.") } },
      { type: "cta_band", data: { title: t("Partner with RAI", "Hợp tác cùng RAI"), ctaLabel: t("Partners & network", "Đối tác & mạng lưới"), ctaHref: "/about/partners" } },
    ],
  },

  /* ----------------------------- /about/partners ----------------------------- */
  {
    key: "partners", route: "/about/partners",
    title: t("Partners & network", "Đối tác & mạng lưới"),
    seoTitle: t("RAI partners & network", "Đối tác & mạng lưới RAI"),
    seoDescription: t("RAI's strategic partners and policy/innovation network.", "Đối tác chiến lược và mạng lưới chính sách/đổi mới của RAI."),
    blocks: [
      { type: "hero", data: { title: t("Partners & network", "Đối tác & Mạng lưới"), subhead: t("We build with strategic partners and a national innovation & policy network.", "Chúng tôi xây dựng cùng đối tác chiến lược và mạng lưới đổi mới & chính sách quốc gia.") } },
      { type: "partners_grid", data: { groups: [
        { title: t("Innovation & policy network", "Mạng lưới đổi mới & chính sách"), names: ["Techfest", "NSSC", "Provincial Innovation Labs"] },
        { title: t("Ecosystem entities", "Thực thể hệ sinh thái"), names: ["RAI FUND", "RAI LAB", "RAI ONE"] },
      ] } },
      { type: "prose", data: { body: t("Partner logos and case studies are added from internal data. Interested in partnering? Reach out via the contact page.", "Logo đối tác và case study được bổ sung từ dữ liệu nội bộ. Quan tâm hợp tác? Liên hệ qua trang Liên hệ.") } },
      { type: "cta_band", data: { title: t("Read our story", "Đọc câu chuyện của chúng tôi"), ctaLabel: t("Story & milestones", "Câu chuyện & mốc son"), ctaHref: "/about/story" } },
    ],
  },

  /* ----------------------------- /about/story ----------------------------- */
  {
    key: "story", route: "/about/story",
    title: t("Story & milestones", "Câu chuyện & mốc son"),
    seoTitle: t("RAI story & milestones", "Câu chuyện & mốc son RAI"),
    seoDescription: t("How RAI Holdings came to be — timeline and milestones.", "RAI Holdings hình thành như thế nào — dòng thời gian và cột mốc."),
    blocks: [
      { type: "hero", data: { title: t("Our story", "Câu chuyện của chúng tôi"), subhead: t("From a thesis about AI-native venture building to a working operating system.", "Từ một luận điểm về kiến tạo doanh nghiệp AI-native tới một hệ điều hành chạy thật.") } },
      { type: "timeline", data: { items: [
        { date: "2026", title: t("RAI OS launches", "Ra mắt RAI OS"), body: t("The venture operating system goes live: ecosystem, platforms, and the venture-building engine.", "Hệ điều hành khởi nghiệp chạy thật: hệ sinh thái, nền tảng và cỗ máy kiến tạo.") },
        { date: "2026", title: t("Proptech AI-native pioneers", "Lứa tiên phong Proptech AI-native"), body: t("The first cohort starts building AI-native ventures, beginning with real estate.", "Lứa tiên phong bắt đầu dựng venture AI-native, khởi đầu từ bất động sản.") },
        { date: "2026–2030", title: t("Scaling the engine", "Mở rộng cỗ máy"), body: t("Expand programs by industry and grow the provincial innovation-lab network.", "Mở rộng chương trình theo ngành và phát triển mạng lưới innovation-lab cấp tỉnh.") },
      ] } },
      { type: "cta_band", data: { title: t("Get in touch", "Liên hệ với chúng tôi"), ctaLabel: t("Contact", "Liên hệ"), ctaHref: "/about/contact" } },
    ],
  },

  /* ----------------------------- /about/contact ----------------------------- */
  {
    key: "contact", route: "/about/contact",
    title: t("Contact", "Liên hệ"),
    seoTitle: t("Contact RAI Holdings", "Liên hệ RAI Holdings"),
    seoDescription: t("Get in touch with RAI Holdings.", "Liên hệ với RAI Holdings."),
    blocks: [
      { type: "hero", data: { title: t("Contact us", "Liên hệ"), subhead: t("Questions, partnerships, or joining a program — we'd love to hear from you.", "Câu hỏi, hợp tác, hay tham gia một chương trình — chúng tôi rất mong được nghe từ bạn.") } },
      { type: "contact", data: { email: "thu@phamvanthu.com", phone: "0967 806 686", address: t("Thanh Hóa, Vietnam", "Thanh Hóa, Việt Nam") } },
      { type: "cta_band", data: { title: t("Talk to the enterprise team", "Trao đổi với đội doanh nghiệp"), ctaLabel: t("Contact enterprise", "Liên hệ doanh nghiệp"), ctaHref: "/enterprise/contribute" } },
    ],
  },
];

/* ============================== queries ================================= */
export const getAboutPage = (key: string): AboutPage | undefined => PAGES.find((p) => p.key === key);
export const allAboutPages = (): AboutPage[] => PAGES;

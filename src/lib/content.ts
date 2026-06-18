/**
 * Homepage content — structured to mirror the fi.co homepage section-by-section,
 * skinned in the RAI brand. All copy is placeholder (bilingual EN/VI) for the
 * client to replace later. Entities / layers / verticals are kept because the
 * /app console imports them.
 */
import { t, type T } from "@/lib/i18n-core";

/* ============================ NAV (fi.co mega groups) ==================== */
/** A nav group is either a dropdown (items) or a standalone direct-link tab (href). */
export type NavGroup = { label: T; href?: string; items: { label: T; href: string }[] };
export const navGroups: NavGroup[] = [
  {
    label: t("Company", "Giới thiệu"),
    items: [
      { label: t("About RAI", "Về RAI Holdings"), href: "/about" },
      { label: t("Ecosystem", "Hệ sinh thái"), href: "/about/ecosystem" },
      { label: t("How we work", "Mô hình hoạt động"), href: "/about/how-we-work" },
      { label: t("Impact", "Tác động"), href: "/about/impact" },
      { label: t("Leadership", "Lãnh đạo"), href: "/about/leadership" },
      { label: t("Partners", "Đối tác"), href: "/about/partners" },
      { label: t("Story", "Câu chuyện"), href: "/about/story" },
      { label: t("Contact", "Liên hệ"), href: "/about/contact" },
    ],
  },
  // Standalone tab (direct link) next to Company.
  { label: t("Portfolio", "Danh mục"), href: "/portfolio", items: [] },
  {
    label: t("Solutions", "Giải pháp"),
    items: [
      { label: t("Marketplace", "Marketplace"), href: "/marketplace" },
      { label: t("Code", "Code"), href: "/code" },
      { label: t("RAI Apps", "RAI Apps"), href: "/apps" },
      { label: t("MCP Registry", "MCP Registry"), href: "/mcp" },
      { label: t("Platform", "Platform"), href: "/platform" },
      { label: t("Big Data", "Big Data"), href: "/bigdata" },
    ],
  },
  {
    label: t("Enterprise", "Doanh nghiệp"),
    items: [
      { label: t("Overview", "Tổng quan"), href: "/enterprise" },
      { label: t("By company size", "Theo quy mô công ty"), href: "/enterprise/size/sme" },
      { label: t("By use case", "Theo tình huống sử dụng"), href: "/enterprise/use-case/automation" },
      { label: t("By industry", "Theo ngành"), href: "/enterprise/industry/real-estate" },
    ],
  },
  {
    label: t("Resources", "Tài nguyên"),
    items: [
      { label: t("Events", "Sự kiện"), href: "#events" },
      { label: t("Insights", "Bài viết"), href: "#insights" },
      { label: t("FAQ", "Hỏi đáp"), href: "#faq" },
    ],
  },
  // Standalone tab (direct link, no dropdown) — sits next to Resources.
  { label: t("Pricing", "Bảng giá"), href: "/pricing", items: [] },
];

/* ============================ HERO ====================================== */
export const hero = {
  eyebrow: t("The AI-native company builder", "Company builder thời AI"),
  title: t("New founders start here", "Nhà sáng lập mới bắt đầu tại đây"),
  subtitle: t(
    "Go from idea to business faster than ever before with RAI Holdings — the venture operating system for the AI-native economy.",
    "Đi từ ý tưởng đến doanh nghiệp nhanh hơn bao giờ hết cùng RAI Holdings — hệ điều hành khởi nghiệp cho nền kinh tế AI-native.",
  ),
  ctaPrimary: t("Start building", "Bắt đầu xây dựng"),
  ctaSecondary: t("Join a free event", "Tham gia sự kiện miễn phí"),
};

export type HeroStat = { value: string; label: T };
export const heroStats: HeroStat[] = [
  { value: "9,000+", label: t("Startups built", "Startup đã dựng") },
  { value: "$2BN+", label: t("Alumni funding", "Vốn cựu thành viên") },
  { value: "100+", label: t("Countries", "Quốc gia") },
  { value: "40,000+", label: t("Mentors & investors", "Cố vấn & nhà đầu tư") },
  { value: "750,000+", label: t("Founders trained", "Nhà sáng lập đào tạo") },
  { value: "200+", label: t("Company exits", "Thương vụ exit") },
  { value: "$20BN+", label: t("Portfolio value", "Giá trị danh mục") },
  { value: "17+", label: t("Years in operation", "Năm hoạt động") },
];

/* ============================ TAGLINE BAND ============================== */
export const tagline = t(
  "The playing field has leveled. If you are ready to work and have the right AI tools, there has never been a better time to launch a startup.",
  "Sân chơi đã bình đẳng. Nếu bạn sẵn sàng và có đúng bộ công cụ AI, chưa bao giờ là thời điểm tốt hơn để khởi nghiệp.",
);

/* ============================ PLATFORM ================================== */
export const platform = {
  eyebrow: t("The platform", "Nền tảng"),
  title: t("Become an AI-native founder", "Trở thành nhà sáng lập AI-native"),
  body: t(
    "RAI gives you the AI tools, agents, and feedback you need to build a fundable business — from first idea to first revenue.",
    "RAI cung cấp công cụ AI, tác nhân và phản hồi để bạn xây một doanh nghiệp gọi được vốn — từ ý tưởng đầu tiên tới doanh thu đầu tiên.",
  ),
  note: t("Launching 2026", "Ra mắt 2026"),
  cta: t("Preview our AI tools", "Xem trước công cụ AI"),
  features: [
    { icon: "world", label: t("Market research", "Nghiên cứu thị trường") },
    { icon: "shopping-bag", label: t("Customer outreach", "Tiếp cận khách hàng") },
    { icon: "cpu", label: t("24/7 startup advisor", "Cố vấn 24/7") },
    { icon: "coins", label: t("Fundraising", "Gọi vốn") },
  ] as { icon: string; label: T }[],
};

/* ============================ FEATURE CARDS ============================= */
export type ValueCard = { icon: string; tag: T; title: T; body: T; cta: T; color: string };
export const valueCards: ValueCard[] = [
  {
    icon: "stack",
    tag: t("Proven methodology", "Phương pháp đã chứng minh"),
    title: t("The rule of one", "Quy tắc một"),
    body: t("Step-by-step building sprints that eliminate analysis paralysis.", "Các sprint xây dựng từng bước, loại bỏ tê liệt vì phân tích."),
    cta: t("See our methodology", "Xem phương pháp"),
    color: "var(--color-holdings)",
  },
  {
    icon: "point",
    tag: t("40,000+ mentors", "40.000+ cố vấn"),
    title: t("Constant mentor feedback", "Phản hồi cố vấn liên tục"),
    body: t("Hundreds of feedback touchpoints from entrepreneurs and investors.", "Hàng trăm điểm phản hồi từ nhà sáng lập và nhà đầu tư."),
    cta: t("Meet the mentors", "Gặp cố vấn"),
    color: "var(--color-lab)",
  },
  {
    icon: "coins",
    tag: t("Funding", "Vốn"),
    title: t("Founder capital", "Founder Capital"),
    body: t("Increase your chances at first funding through our venture network and fund.", "Tăng cơ hội gọi vốn đầu qua mạng lưới và quỹ của chúng tôi."),
    cta: t("Explore funding", "Khám phá vốn"),
    color: "var(--color-fund)",
  },
  {
    icon: "world",
    tag: t("200+ cities", "200+ thành phố"),
    title: t("Global community", "Cộng đồng toàn cầu"),
    body: t("Join the world's largest network of early-stage founders and investors.", "Gia nhập mạng lưới nhà sáng lập giai đoạn sớm lớn nhất thế giới."),
    cta: t("Learn about our mission", "Tìm hiểu sứ mệnh"),
    color: "var(--color-one)",
  },
];

/* ============================ PARTNERS ================================= */
export const partnersTitle = t("Trusted by world-class organizations", "Được tin dùng bởi các tổ chức hàng đầu");
export const partners = ["Microsoft", "NASA", "Accenture", "USAID", "UNDP", "UN Women", "Startup Portugal", "DePaul University"];

/* ============================ TESTIMONIALS ============================= */
export type Testimonial = { quote: T; name: string; role: T; company: string };
export const testimonials: Testimonial[] = [
  { quote: t("RAI gave me the structure I needed to go from idea to a funded company.", "RAI cho tôi cấu trúc cần thiết để đi từ ý tưởng đến công ty gọi được vốn."), name: "Emilie Vanpoperinghe", role: t("Founder", "Nhà sáng lập"), company: "Oddbox" },
  { quote: t("Without RAI, we may have never raised any money.", "Không có RAI, có lẽ chúng tôi đã không gọi được vốn."), name: "Gagan Biyani", role: t("Founder", "Nhà sáng lập"), company: "Udemy" },
  { quote: t("The most incredible learning experience. I wouldn't be the founder I am today.", "Trải nghiệm học tập tuyệt vời nhất. Tôi đã không là nhà sáng lập như hôm nay nếu thiếu nó."), name: "Evan Wong", role: t("Founder", "Nhà sáng lập"), company: "Checkbox" },
];

/* ============================ SUCCESS STORIES ========================== */
export const successTitle = t("Success stories across six continents", "Câu chuyện thành công trên sáu châu lục");
export const successLead = t("Real stories from alumni who turned ideas into global, funded companies.", "Câu chuyện thật từ cựu thành viên biến ý tưởng thành công ty toàn cầu, có vốn.");
export const successLogos = ["Udemy", "Oddbox", "TransTRACK", "SleepUp", "Tespire", "Checkbox", "Endiatx", "Finta"];

/* ============================ MID CTA BAND ============================= */
export const midCta = {
  title: t("There's no better time than the present.", "Không có thời điểm nào tốt hơn hiện tại."),
  subtitle: t("Apply to the Fall 2026 program today.", "Đăng ký chương trình Mùa thu 2026 hôm nay."),
  ctaPrimary: t("Apply now", "Đăng ký ngay"),
  ctaSecondary: t("Join a free event", "Tham gia sự kiện miễn phí"),
};

/* ============================ AI RULES ================================= */
export const aiRules = {
  title: t("AI has rewritten the rules of company building", "AI đã viết lại luật chơi xây dựng doanh nghiệp"),
  subtitle: t("Skills are no longer a barrier to entry. Your domain expertise is your unfair advantage — if you become AI-enabled.", "Kỹ năng không còn là rào cản. Chuyên môn của bạn là lợi thế — nếu bạn được trang bị AI."),
  cta: t("Apply now", "Đăng ký ngay"),
  cols: [
    { tag: t("Recruit a team to start", "Lập đội để bắt đầu"), title: t("No co-founder? No problem.", "Không đồng sáng lập? Không sao."), body: t("AI tools and agents can get you to first traction and funding — solo.", "Công cụ và tác nhân AI đưa bạn đến lực kéo và vốn đầu tiên — một mình.") },
    { tag: t("6 months to an MVP", "6 tháng ra MVP"), title: t("Launch an MVP tomorrow", "Ra mắt MVP ngay ngày mai"), body: t("Building product is no longer a barrier. Speed is the new moat.", "Xây sản phẩm không còn là rào cản. Tốc độ là lợi thế mới."), },
    { tag: t("Raise funding to launch", "Gọi vốn để khởi chạy"), title: t("Bootstrap to prove", "Tự lực để chứng minh"), body: t("Prove your business case with real metrics, then raise from strength.", "Chứng minh bằng số liệu thật, rồi gọi vốn từ thế mạnh.") },
  ] as { tag: T; title: T; body: T }[],
};

/* ============================ NETWORK ================================== */
export const network = {
  title: t("The world's largest network of founders & investors", "Mạng lưới nhà sáng lập & nhà đầu tư lớn nhất thế giới"),
  subtitle: t("Global businesses start local — so we build sustainable startup ecosystems.", "Doanh nghiệp toàn cầu bắt đầu từ địa phương — nên chúng tôi xây hệ sinh thái bền vững."),
  chapterTitle: t("RAI Vietnam", "RAI Việt Nam"),
  chapterBody: t("Apply to build alongside top local investors, advisors, and mentors.", "Đăng ký để xây dựng cùng nhà đầu tư, cố vấn hàng đầu địa phương."),
  ctaPrimary: t("Apply now", "Đăng ký ngay"),
  ctaSecondary: t("Other chapters", "Chi nhánh khác"),
  codes: ["AF","AL","AO","AR","AU","BR","CA","CN","DE","EG","ES","FR","GB","ID","IN","IT","JP","KE","KR","MX","NG","PH","SG","TH","US","VN","ZA","ZW"],
};

/* ============================ MENTORS ================================= */
export type Mentor = { name: string; role: T };
export const mentorsTitle = t("Local leaders & mentors", "Lãnh đạo & cố vấn địa phương");
export const mentors: Mentor[] = [
  { name: "Phạm Văn Thư", role: t("Chief Architect, RAI", "Kiến trúc sư trưởng, RAI") },
  { name: "Hà Thị Thuý Hường", role: t("CEO, RAI Holdings", "CEO, RAI Holdings") },
  { name: "Christina Reddick", role: t("Founder, Racedu", "Nhà sáng lập, Racedu") },
  { name: "Paul O'Brien", role: t("Author, Startup Ecosystems", "Tác giả, Startup Ecosystems") },
  { name: "Anthony Rose", role: t("Founder, SeedLegals", "Nhà sáng lập, SeedLegals") },
  { name: "Kevin Siskar", role: t("CEO, Finta", "CEO, Finta") },
  { name: "Adeo Ressi", role: t("CEO, Decile Group", "CEO, Decile Group") },
  { name: "Torrey Smith", role: t("Co-Founder, Endiatx", "Đồng sáng lập, Endiatx") },
  { name: "Preeti Tikekar", role: t("CEO, Membition", "CEO, Membition") },
];

/* ============================ EVENTS ================================== */
export type EventItem = { title: T; date: string; mode: T };
export const eventsTitle = t("Free startup events", "Sự kiện khởi nghiệp miễn phí");
export const eventsLead = t("Learn from the world's best founders and investors, for free.", "Học từ những nhà sáng lập và nhà đầu tư giỏi nhất, miễn phí.");
export const events: EventItem[] = [
  { title: t("How to build without a team using AI", "Xây dựng không cần đội ngũ nhờ AI"), date: "Jul 14, 2026 · 21:00", mode: t("Online", "Trực tuyến") },
  { title: t("Upcoming info session", "Buổi giới thiệu sắp tới"), date: "Various times", mode: t("Online", "Trực tuyến") },
  { title: t("Get your first 10 customers without a budget", "10 khách hàng đầu tiên không cần ngân sách"), date: "Jun 22, 2026 · 09:30", mode: t("Online", "Trực tuyến") },
  { title: t("How to build entrepreneurial communities", "Cách xây cộng đồng khởi nghiệp"), date: "Jun 23, 2026 · 08:00", mode: t("Online", "Trực tuyến") },
];

/* ============================ BOOTCAMPS =============================== */
export type Bootcamp = { title: T; body: T; start: T };
export const bootcampsTitle = t("Founder bootcamps", "Bootcamp nhà sáng lập");
export const bootcampsLead = t("Ready to build? Join an intensive, virtual program to level up your skills.", "Sẵn sàng xây dựng? Tham gia chương trình online chuyên sâu để nâng kỹ năng.");
export const bootcamps: Bootcamp[] = [
  { title: t("Vietnam Startup Ideation Bootcamp", "Bootcamp Ý tưởng Khởi nghiệp Việt Nam"), body: t("A 2-week intensive to test your startup idea using AI tools and feedback from top founders.", "Khóa 2 tuần chuyên sâu kiểm chứng ý tưởng bằng công cụ AI và phản hồi từ nhà sáng lập."), start: t("Starts June 23", "Khai giảng 23/6") },
  { title: t("Southeast Asia Ideation Bootcamp", "Bootcamp Ý tưởng Đông Nam Á"), body: t("For professionals and career-shifters to test a startup idea with AI tools and feedback.", "Dành cho người đi làm và chuyển ngành để kiểm chứng ý tưởng với công cụ AI."), start: t("Starts June 23", "Khai giảng 23/6") },
];

/* ============================ INSIGHTS =============================== */
export type Insight = { title: T; date: string };
export const insightsTitle = t("Insights", "Bài viết");
export const insightsLead = t("Deep-dive essays, data stories, and tactical playbooks on building and funding startups.", "Bài phân tích chuyên sâu, câu chuyện dữ liệu và cẩm nang thực chiến về khởi nghiệp.");
export const insights: Insight[] = [
  { title: t("The great reinvention: how AI is reshaping professional identity", "Tái định nghĩa lớn: AI định hình lại danh tính nghề nghiệp"), date: "May 21, 2026" },
  { title: t("What do accelerators actually look for? 16 years of data", "Accelerator thực sự tìm gì? 16 năm dữ liệu"), date: "Apr 23, 2026" },
  { title: t("AI isn't eliminating work — it's making more job creators possible", "AI không xóa việc làm — nó tạo thêm người tạo việc"), date: "Feb 26, 2026" },
];

/* ============================ PERSONAS =============================== */
export const personasTitle = t("Great founders start here", "Nhà sáng lập giỏi bắt đầu tại đây");
export const personasLead = t("Our mission is to activate entrepreneurial potential — so we work with founders at the very earliest stages.", "Sứ mệnh của chúng tôi là kích hoạt tiềm năng khởi nghiệp — nên chúng tôi đồng hành từ giai đoạn sớm nhất.");
export type Persona = { tag: T; title: T; body: T };
export const personas: Persona[] = [
  { tag: t("The career changer", "Người chuyển ngành"), title: t("Employee to entrepreneur", "Từ nhân viên thành nhà sáng lập"), body: t("You have experience and a network in your industry — but don't know where to start.", "Bạn có kinh nghiệm và mạng lưới trong ngành — nhưng chưa biết bắt đầu từ đâu.") },
  { tag: t("The first-time founder", "Nhà sáng lập lần đầu"), title: t("Solo founder", "Sáng lập một mình"), body: t("You have the idea, but lack the team, process, or some of the skills to move forward.", "Bạn có ý tưởng, nhưng thiếu đội ngũ, quy trình hoặc một số kỹ năng để tiến lên.") },
  { tag: t("The AI-curious professional", "Người tò mò về AI"), title: t("AI-curious", "Tò mò về AI"), body: t("You see AI reshaping every industry and want to be on the building side, not the sidelines.", "Bạn thấy AI định hình mọi ngành và muốn đứng về phía xây dựng, không đứng ngoài.") },
];

/* ============================ FINAL CTA ============================== */
export const finalCta = {
  title: t("Stop planning. Start building.", "Ngừng lập kế hoạch. Bắt đầu xây dựng."),
  subtitle: t("Join thousands of founders who turned their ideas into funded startups. AI rewrote the rules — you bring the vision, we bring everything else.", "Gia nhập hàng nghìn nhà sáng lập đã biến ý tưởng thành startup có vốn. AI viết lại luật chơi — bạn mang tầm nhìn, phần còn lại để chúng tôi lo."),
  ctaPrimary: t("Apply now", "Đăng ký ngay"),
  ctaSecondary: t("Attend a free event", "Dự sự kiện miễn phí"),
};

/* ============================ FAQ =================================== */
export type Faq = { q: T; a: T };
export const faqs: Faq[] = [
  { q: t("Which program should I apply to?", "Tôi nên đăng ký chương trình nào?"), a: t("Start with the core RAI program. See all options on the apply page.", "Bắt đầu với chương trình RAI cốt lõi. Xem mọi lựa chọn ở trang đăng ký.") },
  { q: t("How much does it cost?", "Chi phí bao nhiêu?"), a: t("There is a one-time entrance fee, fully refundable before your session begins.", "Có một khoản phí ghi danh một lần, hoàn lại 100% trước khi khóa bắt đầu.") },
  { q: t("Is there an equity component?", "Có cấu phần cổ phần không?"), a: t("Yes — an equity collective aligns leaders, mentors, and RAI for the long term.", "Có — cơ chế cổ phần gắn kết lãnh đạo, cố vấn và RAI trong dài hạn.") },
  { q: t("Where can I see the agreements?", "Tôi xem hợp đồng ở đâu?"), a: t("All agreements are public and available on request.", "Mọi hợp đồng đều công khai và có sẵn khi yêu cầu.") },
  { q: t("Can I talk to someone about the program?", "Tôi có thể trao đổi với ai về chương trình?"), a: t("Yes — join a free info session or contact the team directly.", "Có — tham gia buổi giới thiệu miễn phí hoặc liên hệ đội ngũ trực tiếp.") },
];

/* ============================ FOOTER ================================ */
export const footerBlurb = t(
  "RAI Holdings is the venture operating system for the AI-native economy — turning ideas into fundable startups, and startups into global businesses.",
  "RAI Holdings là hệ điều hành khởi nghiệp cho nền kinh tế AI-native — biến ý tưởng thành startup gọi được vốn, và startup thành doanh nghiệp toàn cầu.",
);
export type FooterCol = { title: T; links: { label: T; href: string }[] };
export const footerCols: FooterCol[] = [
  { title: t("About us", "Về chúng tôi"), links: [
    { label: t("Company", "Công ty"), href: "#" }, { label: t("Methodology", "Phương pháp"), href: "#how" }, { label: t("Locations", "Địa điểm"), href: "#network" }, { label: t("Press", "Báo chí"), href: "#" },
  ]},
  { title: t("Support", "Hỗ trợ"), links: [
    { label: t("Apply", "Đăng ký"), href: "#cta-final" }, { label: t("Contact", "Liên hệ"), href: "#" }, { label: t("Agreements", "Hợp đồng"), href: "#" }, { label: t("FAQ", "Hỏi đáp"), href: "#faq" },
  ]},
  { title: t("Resources", "Tài nguyên"), links: [
    { label: t("Marketplace", "Marketplace"), href: "/marketplace" }, { label: t("Code", "Code"), href: "/code" }, { label: t("Apps", "Ứng dụng"), href: "/apps" }, { label: t("MCP Registry", "MCP Registry"), href: "/mcp" }, { label: t("Big Data", "Big Data"), href: "/bigdata" },
  ]},
  { title: t("Innovation", "Đổi mới"), links: [
    { label: t("Launch a chapter", "Mở chi nhánh"), href: "#" }, { label: t("Venture fund", "Quỹ đầu tư"), href: "#" }, { label: t("University partners", "Đối tác đại học"), href: "#" }, { label: t("OS Console", "OS Console"), href: "/app" },
  ]},
];

/* ============================ ECOSYSTEM (kept for /app console) ========= */
export type Entity = { code: string; name: string; tier: T; color: string; icon: string; role: T; desc: T };
export const entities: Entity[] = [
  { code: "00", name: "RAI Holdings", tier: t("Tier 0 · Orchestration", "Tier 0 · Điều phối"), color: "var(--color-holdings)", icon: "stack", role: t("The kernel", "Lõi"), desc: t("Strategy, governance, and the orchestration layer over the ecosystem.", "Chiến lược, quản trị và lớp điều phối trên hệ sinh thái.") },
  { code: "01", name: "RAI FUND", tier: t("Capital", "Vốn"), color: "var(--color-fund)", icon: "coins", role: t("Capital", "Vốn"), desc: t("Capital allocation and venture financing for the AI-native portfolio.", "Phân bổ vốn và tài trợ cho danh mục AI-native.") },
  { code: "02", name: "RAI LAB", tier: t("Technology", "Công nghệ"), color: "var(--color-lab)", icon: "cpu", role: t("The factory", "Nhà máy"), desc: t("The Business-In-A-Box factory. Build once, deploy everywhere.", "Nhà máy Business-In-A-Box. Xây một lần, triển khai mọi nơi.") },
  { code: "03", name: "RAI ONE", tier: t("Commerce", "Thương mại"), color: "var(--color-one)", icon: "shopping-bag", role: t("Distribution", "Phân phối"), desc: t("Distribution and commerce reaching the market.", "Phân phối và thương mại tiếp cận thị trường.") },
];

export type Layer = { code: string; name: T; products: string[] };
export const layers: Layer[] = [
  { code: "L1", name: t("Founder", "Nhà sáng lập"), products: ["RAI Bio", "RAI Chat", "RAI Times", "RAI GPT"] },
  { code: "L2", name: t("Venture", "Khởi nghiệp"), products: ["RAI Agent", "RAI Bot", "RAI Chatbot", "RAI Mail", "RAI Meet", "RAI Social"] },
  { code: "L3", name: t("Business", "Doanh nghiệp"), products: ["RAI ERP", "RAI ERPNext", "RAI Odoo", "RAI POS", "RAI CRM", "RAI Academy", "RAI Property", "RAI Talent", "RAI Travel"] },
  { code: "L4", name: t("AI Workforce", "Lực lượng AI"), products: ["RAI Sales Agent", "RAI Marketing Agent", "RAI Support Agent", "RAI Ops Agent"] },
  { code: "L5", name: t("Commerce", "Thương mại"), products: ["RAI Commerce", "RAI Ads", "RAI Zalo", "RAI Service", "RAI Music", "RAI Play", "RAI VR"] },
  { code: "L6", name: t("Enterprise", "Doanh nghiệp lớn"), products: ["RAI CDP", "RAI Data", "RAI Platform", "RAI GPT Enterprise", "RAI Agent Enterprise"] },
];
export const productCount = layers.reduce((n, l) => n + l.products.length, 0);

/* ============================ RAI ONE — product showcase (/one) ===== */
export const oneHero = {
  eyebrow: t("RAI ONE · Product suite", "RAI ONE · Bộ sản phẩm"),
  title: t("Everything your venture needs, in one place.", "Mọi thứ doanh nghiệp cần, trong một nơi."),
  subtitle: t(
    "35 AI-native products across six layers — from your first founder identity to enterprise-grade data. Built once by RAI LAB, delivered by RAI ONE.",
    "35 sản phẩm AI-native qua sáu lớp — từ danh tính nhà sáng lập đầu tiên đến hạ tầng dữ liệu doanh nghiệp. RAI LAB xây một lần, RAI ONE phân phối.",
  ),
  ctaPrimary: t("Explore products", "Khám phá sản phẩm"),
  ctaSecondary: t("Talk to sales", "Liên hệ tư vấn"),
};

export type OneProduct = { name: string; icon: string; desc: T };
export type OneCategory = { code: string; name: T; tagline: T; color: string; products: OneProduct[] };

export const oneCategories: OneCategory[] = [
  {
    code: "L1", name: t("Founder", "Nhà sáng lập"), color: "var(--color-holdings)",
    tagline: t("Start as a founder", "Khởi đầu của nhà sáng lập"),
    products: [
      { name: "RAI Bio", icon: "id", desc: t("Your AI-native founder identity and profile.", "Danh tính & hồ sơ nhà sáng lập AI-native.") },
      { name: "RAI Chat", icon: "message", desc: t("Real-time messaging for you and your team.", "Nhắn tin thời gian thực cho bạn và đội ngũ.") },
      { name: "RAI Times", icon: "file-text", desc: t("Your personal news and content feed.", "Dòng tin tức & nội dung cá nhân.") },
      { name: "RAI GPT", icon: "sparkles", desc: t("A general AI assistant for everything.", "Trợ lý AI tổng quát cho mọi việc.") },
    ],
  },
  {
    code: "L2", name: t("Venture", "Khởi nghiệp"), color: "var(--color-lab)",
    tagline: t("Run a venture", "Vận hành doanh nghiệp"),
    products: [
      { name: "RAI Agent", icon: "robot", desc: t("Build and run autonomous AI agents.", "Tạo và vận hành tác nhân AI tự động.") },
      { name: "RAI Bot", icon: "bolt", desc: t("Automate tasks with no-code bots.", "Tự động hóa tác vụ với bot không cần code.") },
      { name: "RAI Chatbot", icon: "message", desc: t("Customer-facing conversational AI.", "AI hội thoại cho khách hàng.") },
      { name: "RAI Mail", icon: "mail", desc: t("Smart email built for ventures.", "Email thông minh cho doanh nghiệp.") },
      { name: "RAI Meet", icon: "video", desc: t("Video meetings with AI notes.", "Họp video kèm ghi chú AI.") },
      { name: "RAI Social", icon: "users", desc: t("Manage every social channel in one place.", "Quản lý mọi kênh mạng xã hội ở một nơi.") },
    ],
  },
  {
    code: "L3", name: t("Business", "Doanh nghiệp"), color: "var(--color-fund)",
    tagline: t("Operate a business", "Điều hành doanh nghiệp"),
    products: [
      { name: "RAI ERP", icon: "box", desc: t("Run operations end to end.", "Vận hành toàn diện doanh nghiệp.") },
      { name: "RAI ERPNext", icon: "grid", desc: t("Open ERP, AI-extended.", "ERP mở, mở rộng bằng AI.") },
      { name: "RAI Odoo", icon: "grid", desc: t("Modular business apps suite.", "Bộ ứng dụng doanh nghiệp module.") },
      { name: "RAI POS", icon: "receipt", desc: t("Point of sale for any storefront.", "Bán hàng tại quầy cho mọi cửa hàng.") },
      { name: "RAI CRM", icon: "users", desc: t("Manage customers and deals.", "Quản lý khách hàng và giao dịch.") },
      { name: "RAI Academy", icon: "school", desc: t("Train teams, certify skills.", "Đào tạo đội ngũ, chứng nhận năng lực.") },
      { name: "RAI Property", icon: "home", desc: t("Run an AI-native real-estate desk.", "Vận hành sàn bất động sản AI-native.") },
      { name: "RAI Talent", icon: "search", desc: t("Hire and manage talent.", "Tuyển dụng và quản lý nhân tài.") },
      { name: "RAI Travel", icon: "send", desc: t("Business travel, simplified.", "Công tác & du lịch doanh nghiệp, gọn nhẹ.") },
    ],
  },
  {
    code: "L4", name: t("AI Workforce", "Lực lượng AI"), color: "var(--color-one)",
    tagline: t("Hire an AI workforce", "Thuê lực lượng AI"),
    products: [
      { name: "RAI Sales Agent", icon: "trending-up", desc: t("An AI rep that closes deals.", "Nhân viên AI chốt giao dịch.") },
      { name: "RAI Marketing Agent", icon: "megaphone", desc: t("AI that runs your campaigns.", "AI chạy chiến dịch marketing.") },
      { name: "RAI Support Agent", icon: "lifebuoy", desc: t("24/7 AI customer support.", "Hỗ trợ khách hàng AI 24/7.") },
      { name: "RAI Ops Agent", icon: "settings", desc: t("Automates back-office operations.", "Tự động hóa vận hành nội bộ.") },
    ],
  },
  {
    code: "L5", name: t("Commerce", "Thương mại"), color: "var(--color-warn)",
    tagline: t("Sell everywhere", "Bán hàng mọi nơi"),
    products: [
      { name: "RAI Commerce", icon: "cart", desc: t("Sell online, everywhere.", "Bán hàng trực tuyến, mọi nơi.") },
      { name: "RAI Ads", icon: "target", desc: t("AI ad creation and buying.", "Tạo và mua quảng cáo bằng AI.") },
      { name: "RAI Zalo", icon: "message", desc: t("Zalo commerce and messaging.", "Thương mại & nhắn tin trên Zalo.") },
      { name: "RAI Service", icon: "wrench", desc: t("Field and after-sales service.", "Dịch vụ hiện trường & sau bán.") },
      { name: "RAI Music", icon: "music", desc: t("Licensed audio for your brand.", "Âm thanh bản quyền cho thương hiệu.") },
      { name: "RAI Play", icon: "play", desc: t("Video and streaming for commerce.", "Video & phát trực tuyến cho thương mại.") },
      { name: "RAI VR", icon: "glasses", desc: t("Immersive 3D and VR experiences.", "Trải nghiệm 3D & VR nhập vai.") },
    ],
  },
  {
    code: "L6", name: t("Enterprise", "Doanh nghiệp lớn"), color: "var(--color-holdings)",
    tagline: t("Scale the enterprise", "Mở rộng quy mô lớn"),
    products: [
      { name: "RAI CDP", icon: "users", desc: t("Unify customer data.", "Hợp nhất dữ liệu khách hàng.") },
      { name: "RAI Data", icon: "database", desc: t("Enterprise data warehouse.", "Kho dữ liệu doanh nghiệp.") },
      { name: "RAI Platform", icon: "server", desc: t("The core infrastructure layer.", "Lớp hạ tầng lõi.") },
      { name: "RAI GPT Enterprise", icon: "sparkles", desc: t("Private, governed enterprise AI.", "AI doanh nghiệp riêng tư, có quản trị.") },
      { name: "RAI Agent Enterprise", icon: "shield", desc: t("Agents at enterprise scale.", "Tác nhân ở quy mô doanh nghiệp.") },
    ],
  },
];

export const oneCount = oneCategories.reduce((n, c) => n + c.products.length, 0);

export const oneAi = {
  title: t("RAI AI, built into every product.", "RAI AI, tích hợp trong mọi sản phẩm."),
  body: t(
    "Every RAI ONE product shares one intelligence layer — the same agents, data, and automation across your whole stack. Build once, deploy everywhere.",
    "Mọi sản phẩm RAI ONE dùng chung một lớp trí tuệ — cùng tác nhân, dữ liệu và tự động hóa trên toàn bộ stack. Xây một lần, triển khai mọi nơi.",
  ),
};

export type Vertical = { name: T; code: string };
export const verticals: Vertical[] = [
  { code: "F&B", name: t("F&B", "F&B") }, { code: "RTL", name: t("Retail", "Bán lẻ") }, { code: "RE", name: t("Real Estate", "Bất động sản") }, { code: "AGY", name: t("Agency", "Agency") },
  { code: "EDU", name: t("Education", "Giáo dục") }, { code: "HLT", name: t("Healthcare", "Y tế") }, { code: "LOG", name: t("Logistics", "Logistics") }, { code: "MFG", name: t("Manufacturing", "Sản xuất") },
];

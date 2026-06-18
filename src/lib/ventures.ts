/**
 * RAI Ventures — satellite-domain landing content (bilingual EN/VI).
 *
 * Each venture is a product in the RAI ecosystem with its own domain
 * (e.g. raigpt.vn). A lightweight, on-brand marketing landing is served per
 * hostname (see src/middleware.ts → /v/[slug]). Content reuses the RAI brand
 * system (globals.css) and entity/pillar colors from portfolio.ts.
 *
 * Server-safe (no React / "use client"); imported by SSG landing pages.
 */
import { t, type T } from "@/lib/i18n-core";
import { pillarColor, type Pillar } from "@/lib/portfolio";

export type Metric = { value: string; label: T };
export type Feature = { n: string; title: T; body: T };
export type UseCase = { title: T; body: T };
export type Tier = { name: T; price: T; note?: T; features: T[]; featured?: boolean };

export type Venture = {
  slug: string;
  domain: string;
  name: string;
  pillar: Pillar;
  /** Set when the platform already has a live independent website to link out to. */
  liveUrl?: string;
  eyebrow: T;
  title: T;
  subtitle: T;
  quote?: T;
  ctaPrimary: T;
  metrics: Metric[];
  features: Feature[];
  useCases: UseCase[];
  pricing: Tier[];
  pricingNote: T;
  ctaTitle: T;
  ctaBody: T;
};

const P = (en: string, vi: string): T => t(en, vi);

export const ventures: Venture[] = [
  /* ───────────────────────── RAI GPT — AI Workspace ───────────────────── */
  {
    slug: "rai-gpt",
    domain: "raigpt.vn",
    name: "RAI GPT",
    pillar: "saas_platform",
    eyebrow: P("RAI GPT · AI Workspace", "RAI GPT · Không gian làm việc AI"),
    title: P("The AI workspace built for Vietnamese business.", "Không gian làm việc AI cho doanh nghiệp Việt."),
    subtitle: P(
      "Chat, documents, and context-aware assistants on a Vietnamese-first LLM — one secure workspace for your whole team.",
      "Trò chuyện, tài liệu và trợ lý hiểu ngữ cảnh trên nền LLM tiếng Việt — một không gian làm việc bảo mật cho cả đội ngũ.",
    ),
    quote: P(
      "Not another chatbot — the operating layer where your team works with AI every day.",
      "Không phải thêm một chatbot — đây là lớp vận hành nơi đội ngũ làm việc cùng AI mỗi ngày.",
    ),
    ctaPrimary: P("Try RAI GPT free", "Dùng thử RAI GPT miễn phí"),
    metrics: [
      { value: "128K", label: P("Context window", "Cửa sổ ngữ cảnh") },
      { value: "+30%", label: P("vs GPT-4 on VN tasks", "vượt GPT-4 tác vụ tiếng Việt") },
      { value: "10+", label: P("Built-in integrations", "Tích hợp sẵn") },
      { value: "99.9%", label: P("Uptime SLA", "Uptime SLA") },
    ],
    features: [
      { n: "01", title: P("Vietnamese-first LLM", "LLM ưu tiên tiếng Việt"), body: P("Trained and tuned for Vietnamese — understands tone, context, and industry terms native models miss.", "Huấn luyện và tinh chỉnh cho tiếng Việt — hiểu sắc thái, ngữ cảnh và thuật ngữ ngành mà model ngoại bỏ sót.") },
      { n: "02", title: P("Assistants per department", "Trợ lý theo phòng ban"), body: P("Spin up assistants for sales, HR, legal or support — each with its own knowledge and guardrails.", "Tạo trợ lý cho sales, nhân sự, pháp lý hay CSKH — mỗi trợ lý có tri thức và ràng buộc riêng.") },
      { n: "03", title: P("Connect your own data", "Kết nối dữ liệu nội bộ"), body: P("Point it at your documents, drive, or database and get answers grounded in your own knowledge.", "Trỏ vào tài liệu, ổ lưu trữ hay cơ sở dữ liệu của bạn để nhận câu trả lời dựa trên tri thức nội bộ.") },
      { n: "04", title: P("Enterprise-grade security", "Bảo mật chuẩn doanh nghiệp"), body: P("Data residency in Vietnam (Decree 13/2023), RBAC, and audit logs on every workspace.", "Lưu trú dữ liệu tại Việt Nam (Nghị định 13/2023), phân quyền RBAC và nhật ký kiểm toán cho mọi không gian.") },
    ],
    useCases: [
      { title: P("Content & email", "Nội dung & email"), body: P("Draft posts, proposals and replies in your brand voice, 5–10× faster.", "Soạn bài đăng, đề xuất và phản hồi đúng giọng thương hiệu, nhanh gấp 5–10 lần.") },
      { title: P("Knowledge Q&A", "Hỏi đáp tri thức"), body: P("Ask your internal docs anything — onboarding, policies, product specs.", "Hỏi mọi điều từ tài liệu nội bộ — onboarding, quy định, đặc tả sản phẩm.") },
      { title: P("Analysis & reports", "Phân tích & báo cáo"), body: P("Turn raw data and meeting notes into structured summaries and reports.", "Biến dữ liệu thô và ghi chú họp thành tóm tắt, báo cáo có cấu trúc.") },
    ],
    pricing: [
      { name: P("AI Basic", "AI Basic"), price: P("199.000đ/mo", "199.000đ/tháng"), features: [P("1 workspace · 3 users", "1 không gian · 3 người dùng"), P("Vietnamese LLM, standard", "LLM tiếng Việt, tiêu chuẩn"), P("Document Q&A", "Hỏi đáp tài liệu")] },
      { name: P("AI Pro", "AI Pro"), price: P("999.000đ/mo", "999.000đ/tháng"), featured: true, features: [P("Unlimited users", "Không giới hạn người dùng"), P("Department assistants", "Trợ lý theo phòng ban"), P("Internal data connectors", "Kết nối dữ liệu nội bộ"), P("Priority support · SLA", "Hỗ trợ ưu tiên · SLA")] },
    ],
    pricingNote: P("Estimated pricing — final plans confirmed at sign-up.", "Giá dự kiến — gói cuối xác nhận khi đăng ký."),
    ctaTitle: P("Bring AI into your team's daily work.", "Đưa AI vào công việc hằng ngày của đội ngũ."),
    ctaBody: P("Leave your details — we'll set up a workspace and walk you through it.", "Để lại thông tin — chúng tôi sẽ tạo không gian làm việc và hướng dẫn bạn."),
  },

  /* ─────────────────────── RAI Chatbot — multi-channel ────────────────── */
  {
    slug: "rai-chatbot",
    domain: "raichatbot.vn",
    name: "RAI Chatbot",
    pillar: "saas_platform",
    eyebrow: P("RAI Chatbot · Multi-channel AI", "RAI Chatbot · Chatbot AI đa kênh"),
    title: P("AI customer care that never sleeps.", "Chatbot AI chăm sóc khách hàng 24/7."),
    subtitle: P(
      "One AI chatbot across Zalo, Facebook and your website — understands Vietnamese, answers instantly, and hands off to a human when it matters.",
      "Một chatbot AI cho Zalo, Facebook và website — hiểu tiếng Việt, trả lời tức thì và bàn giao cho nhân viên khi cần.",
    ),
    ctaPrimary: P("Get a demo bot", "Nhận bot demo"),
    metrics: [
      { value: "24/7", label: P("Always on", "Luôn trực") },
      { value: "3+", label: P("Channels in one", "Kênh trong một") },
      { value: "60–80%", label: P("Tickets auto-resolved", "Ticket tự xử lý") },
      { value: "<5s", label: P("Avg response", "Phản hồi trung bình") },
    ],
    features: [
      { n: "01", title: P("Zalo · Facebook · Web", "Zalo · Facebook · Web"), body: P("Deploy once, answer everywhere — every channel shares the same brain and history.", "Triển khai một lần, trả lời khắp nơi — mọi kênh dùng chung bộ não và lịch sử.") },
      { n: "02", title: P("Understands Vietnamese", "Hiểu tiếng Việt"), body: P("Handles slang, typos and regional phrasing — not rigid keyword matching.", "Xử lý tiếng lóng, lỗi gõ và cách nói vùng miền — không phải dò từ khóa cứng nhắc.") },
      { n: "03", title: P("No-code scenarios", "Kịch bản no-code"), body: P("Build flows, FAQs and product answers by drag-and-drop — no developer needed.", "Dựng luồng, FAQ và câu trả lời sản phẩm bằng kéo-thả — không cần lập trình.") },
      { n: "04", title: P("Human handoff", "Bàn giao người thật"), body: P("Escalates complex chats to your team with full context, no repetition for the customer.", "Chuyển hội thoại phức tạp cho nhân viên kèm đầy đủ ngữ cảnh, khách không phải nói lại.") },
    ],
    useCases: [
      { title: P("Customer support", "Chăm sóc khách hàng"), body: P("Resolve common questions instantly and cut support load by 60–80%.", "Giải đáp câu hỏi thường gặp tức thì, giảm 60–80% tải hỗ trợ.") },
      { title: P("Sales consulting", "Tư vấn bán hàng"), body: P("Qualify leads, recommend products and capture contacts around the clock.", "Lọc khách tiềm năng, gợi ý sản phẩm và thu liên hệ suốt ngày đêm.") },
      { title: P("Booking & orders", "Đặt lịch & đơn hàng"), body: P("Take appointments and orders directly inside the chat.", "Nhận lịch hẹn và đơn hàng ngay trong cuộc trò chuyện.") },
    ],
    pricing: [
      { name: P("Basic", "Basic"), price: P("299.000đ/mo", "299.000đ/tháng"), features: [P("1 channel", "1 kênh"), P("No-code flow builder", "Trình dựng luồng no-code"), P("1.000 chats/mo", "1.000 hội thoại/tháng")] },
      { name: P("Business", "Business"), price: P("2.000.000đ/mo", "2.000.000đ/tháng"), featured: true, features: [P("All channels", "Tất cả kênh"), P("AI Vietnamese understanding", "AI hiểu tiếng Việt"), P("Human handoff + CRM", "Bàn giao người thật + CRM"), P("Unlimited chats", "Không giới hạn hội thoại")] },
    ],
    pricingNote: P("Estimated pricing — final plans confirmed at sign-up.", "Giá dự kiến — gói cuối xác nhận khi đăng ký."),
    ctaTitle: P("Let AI handle the first reply.", "Để AI lo câu trả lời đầu tiên."),
    ctaBody: P("Tell us about your channels — we'll spin up a demo bot for your business.", "Cho chúng tôi biết các kênh của bạn — chúng tôi sẽ dựng bot demo cho doanh nghiệp."),
  },

  /* ───────────────────────── RAI Travel — TravelTech ──────────────────── */
  {
    slug: "rai-travel",
    domain: "raitravel.vn",
    name: "RAI Travel",
    pillar: "tech_business",
    eyebrow: P("RAI Travel · TravelTech", "RAI Travel · Công nghệ Du lịch"),
    title: P("Smarter travel, planned by AI.", "Du lịch thông minh, lên lịch bằng AI."),
    subtitle: P(
      "Book tours and stays, get AI-built itineraries, and run a travel business on one platform — for agencies and travellers alike.",
      "Đặt tour và lưu trú, nhận lịch trình do AI dựng và vận hành doanh nghiệp du lịch trên một nền tảng — cho cả đại lý và khách lẻ.",
    ),
    ctaPrimary: P("Become a partner", "Trở thành đối tác"),
    metrics: [
      { value: "AI", label: P("Itinerary planner", "Lên lịch trình") },
      { value: "1", label: P("Platform, end-to-end", "Nền tảng, trọn quy trình") },
      { value: "24/7", label: P("Booking assistant", "Trợ lý đặt chỗ") },
      { value: "0đ", label: P("To get started", "Để bắt đầu") },
    ],
    features: [
      { n: "01", title: P("Tours & stays in one place", "Tour & lưu trú một nơi"), body: P("Search, compare and book tours, hotels and experiences from a single catalog.", "Tìm, so sánh và đặt tour, khách sạn và trải nghiệm từ một danh mục duy nhất.") },
      { n: "02", title: P("AI itinerary builder", "AI dựng lịch trình"), body: P("Describe the trip — RAI Travel drafts a day-by-day plan with timing and budget.", "Mô tả chuyến đi — RAI Travel dựng lịch trình từng ngày kèm thời gian và ngân sách.") },
      { n: "03", title: P("Partner dashboard", "Bảng điều khiển đối tác"), body: P("Agencies manage listings, bookings and payouts with live performance data.", "Đại lý quản lý tin đăng, đặt chỗ và đối soát với số liệu hiệu suất thời gian thực.") },
      { n: "04", title: P("Secure payments", "Thanh toán an toàn"), body: P("Integrated Vietnamese payment methods with clear transaction records.", "Tích hợp các phương thức thanh toán Việt Nam với lịch sử giao dịch rõ ràng.") },
    ],
    useCases: [
      { title: P("Travel agencies", "Đại lý du lịch"), body: P("Put your whole inventory online and reach customers directly.", "Đưa toàn bộ sản phẩm lên mạng và tiếp cận khách trực tiếp.") },
      { title: P("Independent travellers", "Khách lẻ"), body: P("Plan and book a full trip in minutes, not hours.", "Lên kế hoạch và đặt trọn chuyến đi trong vài phút, không phải vài giờ.") },
      { title: P("Corporate & MICE", "Doanh nghiệp & MICE"), body: P("Organize team trips and events with managed logistics.", "Tổ chức chuyến đi và sự kiện cho đội nhóm với hậu cần được quản lý.") },
    ],
    pricing: [
      { name: P("Booking fee", "Phí giao dịch"), price: P("Per transaction", "Theo giao dịch"), features: [P("List for free", "Đăng miễn phí"), P("Pay only on bookings", "Chỉ trả khi có đặt chỗ"), P("Customer support tools", "Công cụ hỗ trợ khách")] },
      { name: P("Partner Package", "Gói Đối tác"), price: P("2–10M đ/mo", "2–10 triệu đ/tháng"), featured: true, features: [P("Priority placement", "Ưu tiên hiển thị"), P("Partner dashboard + API", "Bảng điều khiển + API"), P("AI itinerary for clients", "AI lịch trình cho khách"), P("Dedicated account manager", "Quản lý đối tác riêng")] },
    ],
    pricingNote: P("Estimated pricing — final terms confirmed with our team.", "Giá dự kiến — điều khoản cuối xác nhận cùng đội ngũ."),
    ctaTitle: P("Grow your travel business with RAI.", "Phát triển kinh doanh du lịch cùng RAI."),
    ctaBody: P("Leave your details — our team will reach out about partnership.", "Để lại thông tin — đội ngũ sẽ liên hệ về hợp tác."),
  },

  /* ───────────────────── RAI Agent — AI Agent infra ───────────────────── */
  {
    slug: "rai-agent",
    domain: "raiagent.vn",
    name: "RAI Agent",
    pillar: "saas_platform",
    eyebrow: P("RAI Agent · AI Agent Infrastructure", "RAI Agent · Hạ tầng AI Agent"),
    title: P("Build and ship AI agents that actually work.", "Xây và triển khai AI Agent chạy được việc thật."),
    subtitle: P(
      "A production multi-agent framework — memory, tools, observability and guardrails — so solo founders and startups ship reliable AI, not demos.",
      "Framework multi-agent cho production — bộ nhớ, công cụ, quan trắc và ràng buộc an toàn — để solo founder và startup triển khai AI tin cậy, không chỉ demo.",
    ),
    ctaPrimary: P("Start building", "Bắt đầu xây dựng"),
    metrics: [
      { value: "Multi", label: P("Sequential · parallel · swarm", "Tuần tự · song song · swarm") },
      { value: "100%", label: P("Observable runs", "Theo dõi mọi lượt chạy") },
      { value: "24/7", label: P("Production uptime", "Vận hành liên tục") },
      { value: "0", label: P("Vendor lock-in", "Khóa nhà cung cấp") },
    ],
    features: [
      { n: "01", title: P("Multi-agent framework", "Framework multi-agent"), body: P("Compose sequential, parallel or swarm agents with shared memory and clear control flow.", "Kết hợp agent tuần tự, song song hay swarm với bộ nhớ chung và luồng điều khiển rõ ràng.") },
      { n: "02", title: P("Tools & memory", "Công cụ & bộ nhớ"), body: P("Give agents real tools, long-term memory and access to your data and APIs.", "Trang bị cho agent công cụ thật, bộ nhớ dài hạn và quyền truy cập dữ liệu, API của bạn.") },
      { n: "03", title: P("Full observability", "Quan trắc đầy đủ"), body: P("Trace every step, token and tool call — debug and improve with real data.", "Lần vết từng bước, token và lượt gọi công cụ — gỡ lỗi và cải tiến bằng dữ liệu thật.") },
      { n: "04", title: P("Guardrails & safety", "Ràng buộc & an toàn"), body: P("Set boundaries, approvals and fallbacks so agents stay on task and on policy.", "Đặt giới hạn, phê duyệt và phương án dự phòng để agent luôn đúng việc, đúng chính sách.") },
    ],
    useCases: [
      { title: P("Workflow automation", "Tự động hóa quy trình"), body: P("Hand multi-step back-office processes to agents end to end.", "Giao trọn quy trình hậu cần nhiều bước cho agent xử lý.") },
      { title: P("Internal copilots", "Trợ lý nội bộ"), body: P("Department assistants that act, not just answer.", "Trợ lý phòng ban biết hành động, không chỉ trả lời.") },
      { title: P("Sales & support agents", "Agent bán hàng & hỗ trợ"), body: P("Qualify, respond and follow up around the clock.", "Lọc khách, phản hồi và chăm sóc suốt ngày đêm.") },
    ],
    pricing: [
      { name: P("Solo Founder", "Solo Founder"), price: P("999.000đ/mo", "999.000đ/tháng"), features: [P("1 project · core framework", "1 dự án · framework lõi"), P("Memory + tools", "Bộ nhớ + công cụ"), P("Community support", "Hỗ trợ cộng đồng")] },
      { name: P("Startup", "Startup"), price: P("5.000.000đ/mo", "5.000.000đ/tháng"), featured: true, features: [P("Unlimited projects", "Không giới hạn dự án"), P("Full observability", "Quan trắc đầy đủ"), P("Guardrails + approvals", "Ràng buộc + phê duyệt"), P("Priority support · SLA", "Hỗ trợ ưu tiên · SLA")] },
    ],
    pricingNote: P("Estimated pricing — final plans confirmed at sign-up.", "Giá dự kiến — gói cuối xác nhận khi đăng ký."),
    ctaTitle: P("Put AI agents to work for your business.", "Đưa AI Agent vào làm việc cho doanh nghiệp."),
    ctaBody: P("Tell us what you want to automate — we'll show you what's possible.", "Cho chúng tôi biết bạn muốn tự động hóa gì — chúng tôi sẽ chỉ cho bạn điều khả thi."),
  },

  /* ───────────────────────── RAI Data — Data infra ───────────────────── */
  {
    slug: "rai-data",
    domain: "raidata.vn",
    name: "RAI Data",
    pillar: "saas_platform",
    eyebrow: P("RAI Data · Data Infrastructure", "RAI Data · Hạ tầng Dữ liệu"),
    title: P("Your data, unified and AI-ready.", "Dữ liệu của bạn, hợp nhất và sẵn sàng cho AI."),
    subtitle: P(
      "A petabyte-scale warehouse and AI feature store that turns scattered data into a single source of truth your team and models can trust.",
      "Kho dữ liệu quy mô petabyte và feature store cho AI — biến dữ liệu rời rạc thành một nguồn sự thật duy nhất mà đội ngũ và mô hình đều tin cậy.",
    ),
    ctaPrimary: P("Talk to our team", "Trao đổi với đội ngũ"),
    metrics: [
      { value: "PB", label: P("Warehouse scale", "Quy mô kho dữ liệu") },
      { value: "Real-time", label: P("Pipelines", "Luồng dữ liệu") },
      { value: "AI", label: P("Feature store", "Feature store") },
      { value: "VN", label: P("Data residency", "Lưu trú dữ liệu") },
    ],
    features: [
      { n: "01", title: P("Unified warehouse", "Kho dữ liệu hợp nhất"), body: P("Bring every source into one governed, query-ready warehouse.", "Đưa mọi nguồn vào một kho dữ liệu có quản trị, sẵn sàng truy vấn.") },
      { n: "02", title: P("Real-time pipelines", "Luồng dữ liệu thời gian thực"), body: P("Ingest and transform data continuously — no overnight batch lag.", "Thu nạp và biến đổi dữ liệu liên tục — không còn độ trễ batch qua đêm.") },
      { n: "03", title: P("AI feature store", "Feature store cho AI"), body: P("Reusable, versioned features for analytics and machine learning.", "Tập feature tái dùng, có phiên bản cho phân tích và máy học.") },
      { n: "04", title: P("Governance & security", "Quản trị & bảo mật"), body: P("Lineage, access control and Vietnam data residency built in.", "Truy vết nguồn gốc, kiểm soát truy cập và lưu trú dữ liệu tại Việt Nam.") },
    ],
    useCases: [
      { title: P("Analytics & BI", "Phân tích & BI"), body: P("One trusted dataset behind every dashboard.", "Một tập dữ liệu tin cậy đứng sau mọi dashboard.") },
      { title: P("Machine learning", "Máy học"), body: P("Ship models on clean, versioned features.", "Triển khai mô hình trên feature sạch, có phiên bản.") },
      { title: P("Reporting", "Báo cáo"), body: P("Automate reports straight from the source of truth.", "Tự động hóa báo cáo ngay từ nguồn sự thật.") },
    ],
    pricing: [
      { name: P("SME", "SME"), price: P("1.000.000đ/mo", "1.000.000đ/tháng"), features: [P("Managed warehouse", "Kho dữ liệu được quản lý"), P("Standard pipelines", "Luồng dữ liệu tiêu chuẩn"), P("Email support", "Hỗ trợ qua email")] },
      { name: P("Enterprise", "Enterprise"), price: P("By storage", "Theo dung lượng"), featured: true, features: [P("Petabyte scale", "Quy mô petabyte"), P("Feature store + real-time", "Feature store + thời gian thực"), P("Governance + SSO", "Quản trị + SSO"), P("Dedicated support", "Hỗ trợ riêng")] },
    ],
    pricingNote: P("Estimated pricing — final plans confirmed at sign-up.", "Giá dự kiến — gói cuối xác nhận khi đăng ký."),
    ctaTitle: P("Make your data work for AI.", "Để dữ liệu của bạn phục vụ AI."),
    ctaBody: P("Leave your details — we'll map your data landscape together.", "Để lại thông tin — chúng tôi sẽ cùng vẽ bản đồ dữ liệu của bạn."),
  },

  /* ───────────────────────── RAI CDP — customer data ──────────────────── */
  {
    slug: "rai-cdp",
    domain: "raicdp.vn",
    name: "RAI CDP",
    pillar: "saas_platform",
    eyebrow: P("RAI CDP · Customer Data Platform", "RAI CDP · Nền tảng Dữ liệu Khách hàng"),
    title: P("Every customer, in one living profile.", "Mỗi khách hàng trong một hồ sơ sống."),
    subtitle: P(
      "Unify customer data across every channel with AI identity resolution — then segment and activate in real time, everywhere your customers are.",
      "Hợp nhất dữ liệu khách hàng trên mọi kênh bằng AI nhận diện danh tính — rồi phân khúc và kích hoạt thời gian thực, ở mọi nơi khách hàng hiện diện.",
    ),
    ctaPrimary: P("Request a demo", "Yêu cầu demo"),
    metrics: [
      { value: "1", label: P("Profile per customer", "Hồ sơ mỗi khách") },
      { value: "AI", label: P("Identity resolution", "Hợp nhất danh tính") },
      { value: "Omni", label: P("Channel activation", "Kích hoạt đa kênh") },
      { value: "Real-time", label: P("Segments", "Phân khúc") },
    ],
    features: [
      { n: "01", title: P("AI identity resolution", "Hợp nhất danh tính bằng AI"), body: P("Stitch fragmented touchpoints into one accurate customer profile.", "Khâu nối các điểm chạm rời rạc thành một hồ sơ khách hàng chính xác.") },
      { n: "02", title: P("Real-time segments", "Phân khúc thời gian thực"), body: P("Build audiences that update the moment behaviour changes.", "Dựng tệp đối tượng cập nhật ngay khi hành vi thay đổi.") },
      { n: "03", title: P("Omnichannel activation", "Kích hoạt đa kênh"), body: P("Push segments to Zalo, email, ads and your own apps.", "Đẩy phân khúc tới Zalo, email, quảng cáo và ứng dụng của bạn.") },
      { n: "04", title: P("Privacy by design", "Riêng tư từ thiết kế"), body: P("Consent tracking and Vietnam data residency built in.", "Quản lý đồng thuận và lưu trú dữ liệu tại Việt Nam tích hợp sẵn.") },
    ],
    useCases: [
      { title: P("Personalized marketing", "Marketing cá nhân hóa"), body: P("Right message, right person, right moment.", "Đúng thông điệp, đúng người, đúng thời điểm.") },
      { title: P("Retention & care", "Giữ chân & chăm sóc"), body: P("Spot churn signals and act before customers leave.", "Phát hiện dấu hiệu rời bỏ và hành động trước khi khách đi.") },
      { title: P("Cross-sell", "Bán chéo"), body: P("Recommend the next best product per profile.", "Gợi ý sản phẩm phù hợp tiếp theo cho từng hồ sơ.") },
    ],
    pricing: [
      { name: P("Starter", "Starter"), price: P("2.000.000đ/mo", "2.000.000đ/tháng"), features: [P("Up to 100K profiles", "Tối đa 100K hồ sơ"), P("Identity resolution", "Hợp nhất danh tính"), P("3 activation channels", "3 kênh kích hoạt")] },
      { name: P("Enterprise", "Enterprise"), price: P("By data volume", "Theo lượng dữ liệu"), featured: true, features: [P("Unlimited profiles", "Không giới hạn hồ sơ"), P("Real-time everything", "Thời gian thực toàn diện"), P("All channels + API", "Mọi kênh + API"), P("Dedicated success manager", "Quản lý thành công riêng")] },
    ],
    pricingNote: P("Estimated pricing — final plans confirmed at sign-up.", "Giá dự kiến — gói cuối xác nhận khi đăng ký."),
    ctaTitle: P("Turn customer data into growth.", "Biến dữ liệu khách hàng thành tăng trưởng."),
    ctaBody: P("Leave your details — we'll show RAI CDP on your use case.", "Để lại thông tin — chúng tôi sẽ trình diễn RAI CDP cho tình huống của bạn."),
  },

  /* ───────────────────── RAI n8n — workflow automation ────────────────── */
  {
    slug: "rai-n8n",
    domain: "rain8n.vn",
    name: "RAI n8n",
    pillar: "saas_platform",
    eyebrow: P("RAI n8n · Workflow Automation", "RAI n8n · Tự động hóa Quy trình"),
    title: P("Automate any workflow, with AI built in.", "Tự động hóa mọi quy trình, tích hợp sẵn AI."),
    subtitle: P(
      "Connect your apps and let work run itself — a low-code automation platform with embedded AI nodes, hundreds of integrations, and full data control.",
      "Kết nối các ứng dụng và để công việc tự chạy — nền tảng tự động hóa low-code với AI node tích hợp, hàng trăm kết nối và toàn quyền kiểm soát dữ liệu.",
    ),
    ctaPrimary: P("Automate something", "Tự động hóa ngay"),
    metrics: [
      { value: "Low-code", label: P("Visual builder", "Dựng trực quan") },
      { value: "400+", label: P("Integrations", "Kết nối") },
      { value: "AI", label: P("Nodes built in", "Node AI tích hợp") },
      { value: "Self-host", label: P("Or cloud", "Hoặc cloud") },
    ],
    features: [
      { n: "01", title: P("Visual, low-code flows", "Luồng trực quan, low-code"), body: P("Drag, drop and connect — automate without writing code.", "Kéo, thả và kết nối — tự động hóa mà không cần viết code.") },
      { n: "02", title: P("Hundreds of integrations", "Hàng trăm kết nối"), body: P("Wire together CRMs, sheets, messaging, payments and more.", "Liên kết CRM, bảng tính, nhắn tin, thanh toán và nhiều hơn nữa.") },
      { n: "03", title: P("Embedded AI nodes", "Node AI tích hợp"), body: P("Drop AI into any step — classify, draft, extract, decide.", "Thêm AI vào bất kỳ bước nào — phân loại, soạn, trích xuất, ra quyết định.") },
      { n: "04", title: P("Your data, your control", "Dữ liệu của bạn, bạn kiểm soát"), body: P("Self-host or managed cloud, with data kept in Vietnam.", "Tự vận hành hoặc cloud được quản lý, dữ liệu giữ tại Việt Nam.") },
    ],
    useCases: [
      { title: P("Data sync", "Đồng bộ dữ liệu"), body: P("Keep tools in sync without manual exports.", "Giữ các công cụ đồng bộ mà không cần xuất tay.") },
      { title: P("Approval flows", "Luồng phê duyệt"), body: P("Route requests and notify the right people automatically.", "Định tuyến yêu cầu và thông báo đúng người tự động.") },
      { title: P("Alerts & reports", "Cảnh báo & báo cáo"), body: P("Trigger messages and digests on any event.", "Kích hoạt thông báo và bản tin theo mọi sự kiện.") },
    ],
    pricing: [
      { name: P("Basic", "Basic"), price: P("299.000đ/mo", "299.000đ/tháng"), features: [P("Cloud workspace", "Không gian cloud"), P("Core integrations", "Kết nối cơ bản"), P("5 active workflows", "5 luồng đang chạy")] },
      { name: P("Pro", "Pro"), price: P("2.000.000đ/mo", "2.000.000đ/tháng"), featured: true, features: [P("Unlimited workflows", "Không giới hạn luồng"), P("AI nodes", "Node AI"), P("Self-host option", "Tùy chọn tự vận hành"), P("Priority support", "Hỗ trợ ưu tiên")] },
    ],
    pricingNote: P("Estimated pricing — final plans confirmed at sign-up.", "Giá dự kiến — gói cuối xác nhận khi đăng ký."),
    ctaTitle: P("Stop doing work software can do.", "Ngừng làm tay những việc phần mềm lo được."),
    ctaBody: P("Tell us your repetitive task — we'll help you automate it.", "Cho chúng tôi biết việc lặp đi lặp lại của bạn — chúng tôi sẽ giúp tự động hóa."),
  },

  /* ───────────────────────── RAI Odoo — ERP delivery ─────────────────── */
  {
    slug: "rai-odoo",
    domain: "raiodoo.vn",
    name: "RAI Odoo",
    pillar: "tech_transfer",
    eyebrow: P("RAI Odoo · ERP Implementation", "RAI Odoo · Triển khai ERP Odoo"),
    title: P("Run your whole business on Odoo.", "Vận hành toàn bộ doanh nghiệp trên Odoo."),
    subtitle: P(
      "End-to-end Odoo implementation for Vietnamese SMEs — accounting, inventory, sales, HR and more, configured for how you actually operate.",
      "Triển khai Odoo trọn gói cho doanh nghiệp SME Việt — kế toán, kho, bán hàng, nhân sự và hơn thế, cấu hình theo đúng cách bạn vận hành.",
    ),
    ctaPrimary: P("Get a consultation", "Nhận tư vấn"),
    metrics: [
      { value: "1", label: P("System, whole business", "Hệ thống, toàn doanh nghiệp") },
      { value: "End-to-end", label: P("Implementation", "Triển khai") },
      { value: "VN", label: P("Localized & compliant", "Bản địa hóa & tuân thủ") },
      { value: "24/7", label: P("Support & care", "Hỗ trợ & bảo trì") },
    ],
    features: [
      { n: "01", title: P("Full-suite implementation", "Triển khai trọn bộ"), body: P("Accounting, inventory, sales, purchasing, HR — set up and connected.", "Kế toán, kho, bán hàng, mua hàng, nhân sự — cài đặt và liên thông.") },
      { n: "02", title: P("Configured for your industry", "Cấu hình theo ngành"), body: P("Tailored workflows for manufacturing, retail or services.", "Quy trình may đo cho sản xuất, bán lẻ hoặc dịch vụ.") },
      { n: "03", title: P("Training & adoption", "Đào tạo & tiếp nhận"), body: P("Hands-on training so your team actually uses the system.", "Đào tạo thực hành để đội ngũ thực sự dùng hệ thống.") },
      { n: "04", title: P("Ongoing care", "Bảo trì lâu dài"), body: P("Maintenance, upgrades and support after go-live.", "Bảo trì, nâng cấp và hỗ trợ sau khi vận hành.") },
    ],
    useCases: [
      { title: P("Manufacturing SMEs", "SME sản xuất"), body: P("Plan production, track inventory and cost in one place.", "Lập kế hoạch sản xuất, theo dõi kho và giá thành một nơi.") },
      { title: P("Retail & distribution", "Bán lẻ & phân phối"), body: P("Connect sales, stock and accounting end to end.", "Liên thông bán hàng, tồn kho và kế toán trọn vẹn.") },
      { title: P("Service businesses", "Doanh nghiệp dịch vụ"), body: P("Manage projects, billing and teams together.", "Quản lý dự án, hóa đơn và nhân sự cùng lúc.") },
    ],
    pricing: [
      { name: P("SME Setup", "Gói SME"), price: P("20–100M đ", "20–100 triệu đ"), features: [P("Core modules", "Phân hệ cốt lõi"), P("Industry configuration", "Cấu hình theo ngành"), P("Team training", "Đào tạo đội ngũ")] },
      { name: P("Enterprise", "Enterprise"), price: P("200M đ+", "200 triệu đ+"), featured: true, features: [P("Full custom modules", "Tùy biến phân hệ đầy đủ"), P("System integration", "Tích hợp hệ thống"), P("Data migration", "Chuyển đổi dữ liệu"), P("Dedicated support", "Hỗ trợ riêng")] },
    ],
    pricingNote: P("Estimated pricing — scope confirmed after a discovery session.", "Giá dự kiến — phạm vi xác nhận sau buổi khảo sát."),
    ctaTitle: P("Bring order to your operations.", "Đưa vận hành vào nề nếp."),
    ctaBody: P("Leave your details — we'll scope an Odoo plan for your business.", "Để lại thông tin — chúng tôi sẽ phác thảo kế hoạch Odoo cho doanh nghiệp."),
  },

  /* ──────────────────────── RAI ERPNext — open ERP ───────────────────── */
  {
    slug: "rai-erpnext",
    domain: "raierpnext.vn",
    name: "RAI ERPNext",
    pillar: "tech_transfer",
    eyebrow: P("RAI ERPNext · Open-source ERP", "RAI ERPNext · ERP mã nguồn mở"),
    title: P("Open-source ERP, tailored for Vietnam.", "ERP mã nguồn mở, may đo cho Việt Nam."),
    subtitle: P(
      "Run a full ERP with no license fees — ERPNext localized, configured and supported by RAI, so you own your system without the lock-in.",
      "Vận hành ERP đầy đủ không phí bản quyền — ERPNext được RAI bản địa hóa, cấu hình và hỗ trợ, để bạn làm chủ hệ thống mà không bị khóa.",
    ),
    ctaPrimary: P("Get a consultation", "Nhận tư vấn"),
    metrics: [
      { value: "0đ", label: P("License fees", "Phí bản quyền") },
      { value: "Open", label: P("Source, you own it", "Nguồn mở, bạn sở hữu") },
      { value: "VN", label: P("Localized", "Bản địa hóa") },
      { value: "Full", label: P("ERP coverage", "Phủ toàn ERP") },
    ],
    features: [
      { n: "01", title: P("No license lock-in", "Không khóa bản quyền"), body: P("Pay for delivery and support, not per-seat licenses.", "Trả cho triển khai và hỗ trợ, không trả phí theo người dùng.") },
      { n: "02", title: P("Localized for Vietnam", "Bản địa hóa Việt Nam"), body: P("Vietnamese invoices, tax and reporting out of the box.", "Hóa đơn, thuế và báo cáo theo chuẩn Việt Nam ngay từ đầu.") },
      { n: "03", title: P("Customized to fit", "Tùy biến vừa vặn"), body: P("Adapt modules and workflows to your exact processes.", "Điều chỉnh phân hệ và quy trình đúng cách bạn làm việc.") },
      { n: "04", title: P("Expert support", "Hỗ trợ chuyên môn"), body: P("A team that knows ERPNext deeply, behind your system.", "Đội ngũ am hiểu sâu ERPNext đứng sau hệ thống của bạn.") },
    ],
    useCases: [
      { title: P("Manufacturing", "Sản xuất"), body: P("BOM, production planning and stock in one ERP.", "Định mức, kế hoạch sản xuất và tồn kho trong một ERP.") },
      { title: P("Distribution", "Phân phối"), body: P("Orders, warehouses and accounting connected.", "Đơn hàng, kho và kế toán liên thông.") },
      { title: P("Services", "Dịch vụ"), body: P("Projects, timesheets and billing in one place.", "Dự án, chấm công và hóa đơn một nơi.") },
    ],
    pricing: [
      { name: P("Starter", "Starter"), price: P("50M đ+", "50 triệu đ+"), features: [P("Core ERPNext setup", "Cài đặt ERPNext cốt lõi"), P("Vietnam localization", "Bản địa hóa Việt Nam"), P("Team training", "Đào tạo đội ngũ")] },
      { name: P("Enterprise", "Enterprise"), price: P("By scope", "Theo quy mô"), featured: true, features: [P("Custom modules", "Phân hệ tùy biến"), P("Integrations + migration", "Tích hợp + chuyển đổi"), P("Ongoing maintenance", "Bảo trì lâu dài"), P("Priority support", "Hỗ trợ ưu tiên")] },
    ],
    pricingNote: P("Estimated pricing — scope confirmed after a discovery session.", "Giá dự kiến — phạm vi xác nhận sau buổi khảo sát."),
    ctaTitle: P("Own your ERP, license-free.", "Làm chủ ERP, không phí bản quyền."),
    ctaBody: P("Leave your details — we'll scope an ERPNext plan for you.", "Để lại thông tin — chúng tôi sẽ phác thảo kế hoạch ERPNext cho bạn."),
  },

  /* ──────────────────────── RAI Commerce — e-commerce ────────────────── */
  {
    slug: "rai-commerce",
    domain: "raicommerce.vn",
    name: "RAI Commerce",
    pillar: "tech_business",
    eyebrow: P("RAI Commerce · CommerceTech", "RAI Commerce · Công nghệ Thương mại"),
    title: P("Sell everywhere, manage in one place.", "Bán mọi nơi, quản lý một chỗ."),
    subtitle: P(
      "Your own store plus every marketplace, with orders, inventory and customers unified — and AI helping you sell more.",
      "Cửa hàng riêng cùng mọi sàn thương mại, hợp nhất đơn hàng, tồn kho và khách hàng — cùng AI giúp bạn bán nhiều hơn.",
    ),
    ctaPrimary: P("Start selling", "Bắt đầu bán hàng"),
    metrics: [
      { value: "Omni", label: P("Web + marketplaces", "Web + đa sàn") },
      { value: "1", label: P("Dashboard for all", "Một bảng cho tất cả") },
      { value: "AI", label: P("Recommendations", "Gợi ý") },
      { value: "0đ", label: P("To get started", "Để bắt đầu") },
    ],
    features: [
      { n: "01", title: P("Storefront + marketplaces", "Cửa hàng + đa sàn"), body: P("Run your own site and sync Shopee, Lazada, TikTok Shop in one place.", "Vận hành web riêng và đồng bộ Shopee, Lazada, TikTok Shop một nơi.") },
      { n: "02", title: P("Orders & inventory", "Đơn hàng & tồn kho"), body: P("One stock pool, no overselling across channels.", "Một kho chung, không bán vượt giữa các kênh.") },
      { n: "03", title: P("Integrated payments", "Thanh toán tích hợp"), body: P("Vietnamese payment and shipping built in.", "Thanh toán và vận chuyển Việt Nam tích hợp sẵn.") },
      { n: "04", title: P("AI recommendations", "Gợi ý bằng AI"), body: P("Upsell and personalize to lift order value.", "Bán thêm và cá nhân hóa để tăng giá trị đơn.") },
    ],
    useCases: [
      { title: P("Online shops", "Shop online"), body: P("Launch a professional store in days.", "Mở cửa hàng chuyên nghiệp trong vài ngày.") },
      { title: P("Brands", "Thương hiệu"), body: P("Own your channel and customer relationship.", "Làm chủ kênh bán và quan hệ khách hàng.") },
      { title: P("Multi-channel sellers", "Nhà bán đa kênh"), body: P("Manage every marketplace from one screen.", "Quản lý mọi sàn từ một màn hình.") },
    ],
    pricing: [
      { name: P("Starter", "Starter"), price: P("199.000đ/mo", "199.000đ/tháng"), features: [P("Online storefront", "Cửa hàng online"), P("1 marketplace sync", "Đồng bộ 1 sàn"), P("Orders + inventory", "Đơn hàng + tồn kho")] },
      { name: P("Business", "Business"), price: P("2.000.000đ/mo", "2.000.000đ/tháng"), featured: true, features: [P("All marketplaces", "Mọi sàn"), P("AI recommendations", "Gợi ý AI"), P("Multi-warehouse", "Nhiều kho"), P("Priority support", "Hỗ trợ ưu tiên")] },
    ],
    pricingNote: P("Estimated pricing — final plans confirmed at sign-up.", "Giá dự kiến — gói cuối xác nhận khi đăng ký."),
    ctaTitle: P("Take your store everywhere customers are.", "Đưa cửa hàng tới mọi nơi có khách."),
    ctaBody: P("Leave your details — we'll set up your commerce stack.", "Để lại thông tin — chúng tôi sẽ dựng hệ thống bán hàng cho bạn."),
  },

  /* ───────────────────────────── RAI Ads — AdTech ───────────────────── */
  {
    slug: "rai-ads",
    domain: "raiads.vn",
    name: "RAI Ads",
    pillar: "tech_business",
    eyebrow: P("RAI Ads · AdTech", "RAI Ads · Công nghệ Quảng cáo"),
    title: P("Smarter ad spend, run by AI.", "Chi tiêu quảng cáo thông minh, vận hành bằng AI."),
    subtitle: P(
      "Plan, launch and optimize campaigns across channels from one platform — with AI managing targeting and budget so every đồng works harder.",
      "Lập kế hoạch, chạy và tối ưu chiến dịch đa kênh trên một nền tảng — với AI quản lý nhắm chọn và ngân sách để mỗi đồng chi hiệu quả hơn.",
    ),
    ctaPrimary: P("Boost your campaigns", "Tăng hiệu quả chiến dịch"),
    metrics: [
      { value: "Multi", label: P("Channels in one", "Kênh trong một") },
      { value: "AI", label: P("Optimization", "Tối ưu") },
      { value: "Real-time", label: P("Reporting", "Báo cáo") },
      { value: "ROAS", label: P("Focused", "Hướng hiệu quả") },
    ],
    features: [
      { n: "01", title: P("AI optimization", "Tối ưu bằng AI"), body: P("Shift budget to what's working, automatically.", "Tự động chuyển ngân sách sang nơi đang hiệu quả.") },
      { n: "02", title: P("Smart targeting", "Nhắm chọn thông minh"), body: P("Reach the right audience using your own customer data.", "Tiếp cận đúng đối tượng bằng chính dữ liệu khách của bạn.") },
      { n: "03", title: P("One dashboard", "Một bảng điều khiển"), body: P("Plan and track Facebook, Google and more together.", "Lập kế hoạch và theo dõi Facebook, Google và hơn nữa cùng lúc.") },
      { n: "04", title: P("Clear reporting", "Báo cáo rõ ràng"), body: P("Real-time performance and ROAS you can act on.", "Hiệu suất và ROAS thời gian thực để hành động ngay.") },
    ],
    useCases: [
      { title: P("SMEs", "Doanh nghiệp SME"), body: P("Run effective ads without an in-house team.", "Chạy quảng cáo hiệu quả mà không cần đội ngũ nội bộ.") },
      { title: P("Agencies", "Agency"), body: P("Manage many clients and budgets in one platform.", "Quản lý nhiều khách và ngân sách trên một nền tảng.") },
      { title: P("Brands", "Thương hiệu"), body: P("Scale spend while protecting efficiency.", "Tăng chi tiêu mà vẫn giữ hiệu quả.") },
    ],
    pricing: [
      { name: P("SME Ads", "SME Ads"), price: P("2–10M đ/mo", "2–10 triệu đ/tháng"), features: [P("Multi-channel campaigns", "Chiến dịch đa kênh"), P("AI optimization", "Tối ưu AI"), P("Performance reports", "Báo cáo hiệu suất")] },
      { name: P("Enterprise", "Enterprise"), price: P("By ad budget", "Theo ngân sách quảng cáo"), featured: true, features: [P("All channels + custom", "Mọi kênh + tùy biến"), P("Audience from RAI CDP", "Đối tượng từ RAI CDP"), P("Dedicated strategist", "Chuyên gia riêng"), P("Priority support", "Hỗ trợ ưu tiên")] },
    ],
    pricingNote: P("Estimated pricing — final plans confirmed at sign-up.", "Giá dự kiến — gói cuối xác nhận khi đăng ký."),
    ctaTitle: P("Make every ad đồng count.", "Để mỗi đồng quảng cáo đáng giá."),
    ctaBody: P("Leave your details — we'll review your campaigns and goals.", "Để lại thông tin — chúng tôi sẽ rà soát chiến dịch và mục tiêu của bạn."),
  },

  /* ───────────────────── RAI Social — social network ──────────────────── */
  {
    slug: "rai-social",
    domain: "raisocial.vn",
    name: "RAI Social",
    pillar: "community_platform",
    liveUrl: "https://raisocial.vn",
    eyebrow: P("RAI Social · Social Network", "RAI Social · Mạng xã hội"),
    title: P("The social network of the RAI ecosystem.", "Mạng xã hội của hệ sinh thái RAI."),
    subtitle: P(
      "Connect, share and build community on a Vietnamese-first social platform — and sign in once to use every RAI app with the same account.",
      "Kết nối, chia sẻ và xây dựng cộng đồng trên nền tảng mạng xã hội ưu tiên tiếng Việt — và đăng nhập một lần để dùng mọi ứng dụng RAI bằng cùng một tài khoản.",
    ),
    quote: P(
      "One identity across the whole RAI ecosystem.",
      "Một danh tính cho toàn bộ hệ sinh thái RAI.",
    ),
    ctaPrimary: P("Join RAI Social", "Tham gia RAI Social"),
    metrics: [
      { value: "Live", label: P("Available now", "Đang hoạt động") },
      { value: "SSO", label: P("One RAI login", "Một tài khoản RAI") },
      { value: "VN", label: P("Vietnamese-first", "Ưu tiên tiếng Việt") },
      { value: "Web", label: P("& mobile", "& di động") },
    ],
    features: [
      { n: "01", title: P("Profiles & feeds", "Trang cá nhân & bảng tin"), body: P("Post updates, photos and videos and follow the people and pages you care about.", "Đăng cập nhật, ảnh và video, theo dõi những người và trang bạn quan tâm.") },
      { n: "02", title: P("Groups & pages", "Nhóm & trang"), body: P("Build communities and brand pages to reach and grow your audience.", "Lập cộng đồng và trang thương hiệu để tiếp cận và phát triển tệp khán giả.") },
      { n: "03", title: P("Single sign-on for RAI", "Đăng nhập chung cho RAI"), body: P("Your RAI Social account signs you into RAI OS and every RAI app — one identity everywhere.", "Tài khoản RAI Social đăng nhập vào RAI OS và mọi ứng dụng RAI — một danh tính ở khắp nơi.") },
      { n: "04", title: P("Messaging", "Nhắn tin"), body: P("Chat one-to-one or in groups, with media and reactions.", "Trò chuyện 1-1 hoặc nhóm, kèm media và biểu cảm.") },
    ],
    useCases: [
      { title: P("Creators", "Nhà sáng tạo"), body: P("Grow an audience and share your work natively.", "Phát triển khán giả và chia sẻ tác phẩm ngay trên nền tảng.") },
      { title: P("Communities", "Cộng đồng"), body: P("Run groups around your interests or business.", "Vận hành nhóm theo sở thích hoặc công việc kinh doanh.") },
      { title: P("Brands", "Thương hiệu"), body: P("Reach customers and connect to other RAI tools.", "Tiếp cận khách hàng và kết nối với các công cụ RAI khác.") },
    ],
    pricing: [
      { name: P("Member", "Thành viên"), price: P("Free", "Miễn phí"), features: [P("Full social features", "Đầy đủ tính năng mạng xã hội"), P("RAI single sign-on", "Đăng nhập chung RAI"), P("Web & mobile", "Web & di động")] },
      { name: P("Business / Brand", "Doanh nghiệp / Thương hiệu"), price: P("Contact us", "Liên hệ"), featured: true, features: [P("Verified brand page", "Trang thương hiệu xác minh"), P("Audience tools", "Công cụ tiếp cận"), P("RAI ecosystem integrations", "Tích hợp hệ sinh thái RAI")] },
    ],
    pricingNote: P("Joining is free — business options confirmed on request.", "Tham gia miễn phí — phương án doanh nghiệp xác nhận khi liên hệ."),
    ctaTitle: P("Join the RAI community.", "Tham gia cộng đồng RAI."),
    ctaBody: P("Create a RAI Social account — it's your key to the whole ecosystem.", "Tạo tài khoản RAI Social — chìa khóa của bạn vào toàn hệ sinh thái."),
  },

  /* ───────────────────────── RAI Music — streaming ───────────────────── */
  {
    slug: "rai-music",
    domain: "raimusic.vn",
    name: "RAI Music",
    pillar: "tech_business",
    liveUrl: "https://raimusic.vn",
    eyebrow: P("RAI Music · Music Platform", "RAI Music · Nền tảng âm nhạc"),
    title: P("Music for the RAI generation.", "Âm nhạc cho thế hệ RAI."),
    subtitle: P(
      "Stream, discover and share music on a Vietnamese-first platform — for listeners who want more, and artists who want to be heard.",
      "Nghe, khám phá và chia sẻ âm nhạc trên nền tảng ưu tiên tiếng Việt — cho người nghe muốn nhiều hơn và nghệ sĩ muốn được lắng nghe.",
    ),
    ctaPrimary: P("Start listening", "Nghe ngay"),
    metrics: [
      { value: "Live", label: P("Available now", "Đang hoạt động") },
      { value: "VN", label: P("Local catalog", "Kho nhạc Việt") },
      { value: "Web", label: P("& mobile", "& di động") },
      { value: "SSO", label: P("One RAI login", "Một tài khoản RAI") },
    ],
    features: [
      { n: "01", title: P("Stream & playlists", "Nghe & danh sách phát"), body: P("Listen to tracks and build playlists for every moment.", "Nghe nhạc và tạo danh sách phát cho mọi khoảnh khắc.") },
      { n: "02", title: P("Discover", "Khám phá"), body: P("Find new music with recommendations tuned to your taste.", "Tìm nhạc mới với gợi ý theo gu của bạn.") },
      { n: "03", title: P("For artists", "Cho nghệ sĩ"), body: P("Upload, publish and reach listeners directly.", "Tải lên, phát hành và tiếp cận người nghe trực tiếp.") },
      { n: "04", title: P("Connected to RAI", "Kết nối với RAI"), body: P("Sign in with your RAI account and share to RAI Social.", "Đăng nhập bằng tài khoản RAI và chia sẻ lên RAI Social.") },
    ],
    useCases: [
      { title: P("Listeners", "Người nghe"), body: P("Soundtrack your day with Vietnamese and global music.", "Nghe nhạc Việt và quốc tế suốt cả ngày.") },
      { title: P("Artists", "Nghệ sĩ"), body: P("Publish your music and grow a fanbase.", "Phát hành nhạc và xây dựng cộng đồng người hâm mộ.") },
      { title: P("Brands", "Thương hiệu"), body: P("Reach audiences through sound and playlists.", "Tiếp cận khán giả qua âm thanh và danh sách phát.") },
    ],
    pricing: [
      { name: P("Free", "Miễn phí"), price: P("Free", "Miễn phí"), features: [P("Stream & playlists", "Nghe & danh sách phát"), P("Discover new music", "Khám phá nhạc mới"), P("RAI single sign-on", "Đăng nhập chung RAI")] },
      { name: P("Premium", "Premium"), price: P("Contact us", "Liên hệ"), featured: true, features: [P("Ad-free listening", "Nghe không quảng cáo"), P("Higher quality audio", "Chất lượng âm thanh cao hơn"), P("Offline & extras", "Nghe offline & tiện ích thêm")] },
    ],
    pricingNote: P("Free to start — premium plans confirmed on request.", "Bắt đầu miễn phí — gói premium xác nhận khi liên hệ."),
    ctaTitle: P("Press play on RAI Music.", "Bấm phát trên RAI Music."),
    ctaBody: P("Create an account and start listening — or reach out to publish your music.", "Tạo tài khoản và bắt đầu nghe — hoặc liên hệ để phát hành nhạc của bạn."),
  },

  /* ───────────────────────── RAI Times — news & media ────────────────── */
  {
    slug: "rai-times",
    domain: "raitimes.com",
    name: "RAI Times",
    pillar: "tech_business",
    liveUrl: "https://www.raitimes.com",
    eyebrow: P("RAI Times · News & Media", "RAI Times · Tin tức & Truyền thông"),
    title: P("Technology and business news from the RAI ecosystem.", "Tin công nghệ và kinh doanh từ hệ sinh thái RAI."),
    subtitle: P(
      "Coverage of AI, technology and the Vietnamese business landscape — the media voice of RAI Holdings.",
      "Đưa tin về AI, công nghệ và bức tranh kinh doanh Việt Nam — tiếng nói truyền thông của RAI Holdings.",
    ),
    ctaPrimary: P("Read RAI Times", "Đọc RAI Times"),
    metrics: [
      { value: "Live", label: P("Publishing now", "Đang xuất bản") },
      { value: "AI", label: P("& tech focus", "& trọng tâm công nghệ") },
      { value: "VN", label: P("Business coverage", "Bức tranh kinh doanh") },
      { value: "Web", label: P("Read anywhere", "Đọc mọi nơi") },
    ],
    features: [
      { n: "01", title: P("Tech & AI news", "Tin công nghệ & AI"), body: P("Stay current on AI, software and the platforms shaping business.", "Cập nhật về AI, phần mềm và các nền tảng định hình kinh doanh.") },
      { n: "02", title: P("Business coverage", "Tin kinh doanh"), body: P("Reporting on the Vietnamese market and the digital economy.", "Đưa tin về thị trường Việt Nam và nền kinh tế số.") },
      { n: "03", title: P("Ecosystem stories", "Câu chuyện hệ sinh thái"), body: P("Updates, launches and insights from across RAI Holdings.", "Cập nhật, ra mắt và góc nhìn từ khắp RAI Holdings.") },
      { n: "04", title: P("Read anywhere", "Đọc mọi nơi"), body: P("A fast, clean reading experience on web and mobile.", "Trải nghiệm đọc nhanh, gọn trên web và di động.") },
    ],
    useCases: [
      { title: P("Professionals", "Người đi làm"), body: P("Keep up with tech and business in minutes a day.", "Theo kịp công nghệ và kinh doanh chỉ vài phút mỗi ngày.") },
      { title: P("Founders", "Nhà sáng lập"), body: P("Track the trends and tools that matter to you.", "Theo dõi xu hướng và công cụ quan trọng với bạn.") },
      { title: P("Partners", "Đối tác"), body: P("Follow news from across the RAI ecosystem.", "Theo dõi tin tức từ khắp hệ sinh thái RAI.") },
    ],
    pricing: [
      { name: P("Reader", "Bạn đọc"), price: P("Free", "Miễn phí"), features: [P("Full access to articles", "Đọc đầy đủ bài viết"), P("Tech, AI & business", "Công nghệ, AI & kinh doanh"), P("Web & mobile", "Web & di động")] },
      { name: P("Partner / Press", "Đối tác / Báo chí"), price: P("Contact us", "Liên hệ"), featured: true, features: [P("Editorial collaboration", "Hợp tác nội dung"), P("Press & PR", "Báo chí & PR"), P("Ecosystem coverage", "Đưa tin hệ sinh thái")] },
    ],
    pricingNote: P("Free to read — partnership options confirmed on request.", "Đọc miễn phí — phương án hợp tác xác nhận khi liên hệ."),
    ctaTitle: P("Stay ahead with RAI Times.", "Đi trước cùng RAI Times."),
    ctaBody: P("Read the latest — or reach out about editorial and press partnerships.", "Đọc tin mới nhất — hoặc liên hệ về hợp tác nội dung và báo chí."),
  },
];

export const getVenture = (slug: string): Venture | undefined => ventures.find((v) => v.slug === slug);
export const allVentureSlugs = (): string[] => ventures.map((v) => v.slug);
export const ventureColor = (v: Venture): string => pillarColor[v.pillar];

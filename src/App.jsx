import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  Check,
  ChevronRight,
  Clipboard,
  Copy,
  History,
  ImagePlus,
  LayoutDashboard,
  Megaphone,
  Menu,
  PackageSearch,
  PlaySquare,
  Sparkles,
  Upload,
  WandSparkles,
  X,
  Zap,
} from 'lucide-react';

const platforms = ['TikTok', 'Amazon', 'Shopee'];
const styles = ['欧美简约', '高级广告', '科技感'];

const defaultForm = {
  productName: 'Portable Espresso Maker',
  sellingPoints: '便携萃取、USB-C充电、金属机身、适合露营/办公室/旅行、清洗方便',
  platform: 'TikTok',
  style: '欧美简约',
};

const examples = [
  {
    label: 'TikTok 爆品',
    productName: 'Cordless Electric Spin Scrubber',
    sellingPoints: '无线长续航、多刷头、浴室厨房通用、强力去污、适合租房和家庭清洁',
    platform: 'TikTok',
    style: '高级广告',
  },
  {
    label: 'Amazon 主图',
    productName: 'Vitamin C Brightening Serum',
    sellingPoints: '提亮肤色、质地清爽、玻璃瓶高级包装、适合晨间护肤、敏感肌友好',
    platform: 'Amazon',
    style: '欧美简约',
  },
  {
    label: 'Shopee 科技',
    productName: 'Magnetic Wireless Power Bank',
    sellingPoints: '强磁吸附、快充、轻薄便携、LED电量显示、适合通勤旅行',
    platform: 'Shopee',
    style: '科技感',
  },
];

const platformStrategies = {
  TikTok: {
    audience: 'TikTok Shop和短视频兴趣电商用户',
    tone: '强钩子、强对比、移动端优先、适合短视频首帧和达人带货素材',
    detail: '画面需要在1秒内传达产品用途和核心利益点',
  },
  Amazon: {
    audience: 'Amazon搜索型买家和高意向转化人群',
    tone: '清晰、可信、合规、突出产品质感和核心卖点',
    detail: '画面需要适合商品详情页首图和广告位裁切',
  },
  Shopee: {
    audience: '东南亚移动电商消费者和价格敏感型用户',
    tone: '明亮、直观、卖点明确、适合促销场景和移动端浏览',
    detail: '画面需要快速解释使用场景并强化购买理由',
  },
};

const styleStrategies = {
  欧美简约: 'clean western minimalist style, premium neutral palette, soft natural light, elegant spacing, realistic commercial photography',
  高级广告: 'high-end advertising visual, cinematic composition, refined props, polished lighting, premium brand campaign mood',
  科技感: 'futuristic technology aesthetic, sleek surfaces, cool accent lighting, precise reflections, modern product innovation mood',
};

function normalizeText(value, fallback) {
  return value.trim() || fallback;
}

function buildPrompt(form, type) {
  const productName = normalizeText(form.productName, 'the product');
  const sellingPoints = normalizeText(form.sellingPoints, 'clear practical benefits, premium quality, easy to use');
  const platform = platformStrategies[form.platform];
  const style = styleStrategies[form.style];

  const base =
    `Product: ${productName}. Key selling points: ${sellingPoints}. ` +
    `Sales platform: ${form.platform}. Target buyers: ${platform.audience}. ` +
    `Platform strategy: ${platform.tone}. Style direction: ${style}. `;

  if (type === 'main') {
    return `${base}Create a professional ecommerce main product image. Put the product as the absolute hero, centered and large, with crisp edges, realistic texture, clean premium background, controlled soft shadow, clear shape recognition, no distracting props, no fake logo, no exaggerated text claims. Composition should work for marketplace listing thumbnails, 4:5 ratio, ultra sharp, commercial product photography, high conversion ecommerce visual.`;
  }

  if (type === 'scene') {
    return `${base}Create a scenario advertising image that shows the product being used in a believable customer moment. Show the core use case visually, include subtle lifestyle props that support the selling points, create depth and atmosphere, leave clean space for a short headline and call-to-action. ${platform.detail}. 16:9 ratio, premium global ecommerce campaign image, realistic lighting, high-end ad quality.`;
  }

  return `${base}Create a TikTok cover image optimized for mobile discovery. Product must be instantly recognizable, with a strong visual hook, high contrast focal point, dynamic composition, safe margins for overlay text, creator-commerce energy, bold clean headline area, no clutter. 9:16 vertical ratio, thumb-stopping TikTok Shop cover, designed to increase click-through rate.`;
}

function App() {
  const [form, setForm] = useState(defaultForm);
  const [imagePreview, setImagePreview] = useState('');
  const [fileName, setFileName] = useState('');
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [copiedKey, setCopiedKey] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const readiness = useMemo(() => {
    const fields = [imagePreview, form.productName, form.sellingPoints, form.platform, form.style];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [form, imagePreview]);

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const loadExample = (example) => {
    setForm({
      productName: example.productName,
      sellingPoints: example.sellingPoints,
      platform: example.platform,
      style: example.style,
    });
  };

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  const generate = () => {
    const generated = {
      main: buildPrompt(form, 'main'),
      scene: buildPrompt(form, 'scene'),
      tiktok: buildPrompt(form, 'tiktok'),
    };

    setResults(generated);
    setHistory((current) => [
      {
        id: crypto.randomUUID(),
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
        productName: normalizeText(form.productName, '未命名商品'),
        platform: form.platform,
        style: form.style,
        imagePreview,
        prompts: generated,
      },
      ...current,
    ]);
  };

  const copyPrompt = async (key, prompt) => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = prompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }

    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(''), 1400);
  };

  return (
    <main className="app-shell min-h-screen text-slate-950">
      <Header mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <section id="home" className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-[1.05fr_0.95fr] md:pb-20 md:pt-16 lg:px-8">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            <Zap className="h-4 w-4" />
            AI ecommerce image prompt studio
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
            面向跨境卖家的 AI 电商生图工作台
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            上传商品图，输入商品名称和卖点，选择 TikTok、Amazon 或 Shopee 平台策略，一键生成主图、场景图和 TikTok 封面图提示词。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5" href="#workspace">
              <WandSparkles className="h-4 w-4" />
              开始生成
            </a>
            <a className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400" href="#history">
              <History className="h-4 w-4" />
              查看历史
            </a>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              ['3', '输出类型'],
              ['3', '销售平台'],
              ['1', '本地模拟'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-white/72 p-4 shadow-line">
                <div className="text-2xl font-semibold text-slate-950">{value}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel overflow-hidden rounded-xl">
          <div className="border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Creative Command Center</p>
                <p className="mt-1 text-xs text-slate-300">Product image prompt generation</p>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">Demo Ready</span>
            </div>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            {[
              ['上传商品图片', '本地预览商品视觉资产', ImagePlus],
              ['输入商品卖点', '转化为可执行画面语言', PackageSearch],
              ['平台策略适配', 'TikTok/Amazon/Shopee', LayoutDashboard],
              ['三类提示词输出', '主图/场景图/TikTok封面', Megaphone],
            ].map(([title, text, Icon]) => (
              <div key={title} className="rounded-lg border border-slate-200 bg-white p-4">
                <Icon className="mb-4 h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 bg-slate-50 p-5">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">资料完整度</span>
              <span className="font-semibold text-slate-950">{readiness}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${readiness}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section id="workspace" className="border-y border-slate-200/80 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-700">
                <LayoutDashboard className="h-4 w-4" />
                工作台
              </div>
              <h2 className="text-3xl font-semibold tracking-normal text-slate-950">AI 电商生图提示词生成器</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {examples.map((example) => (
                <button
                  key={example.label}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  onClick={() => loadExample(example)}
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="glass-panel rounded-xl p-5">
              <label className="group flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-blue-400 hover:bg-blue-50/50">
                {imagePreview ? (
                  <div className="w-full">
                    <img src={imagePreview} alt="商品图片预览" className="mx-auto max-h-56 rounded-lg object-contain shadow-soft" />
                    <p className="mt-3 truncate text-sm font-medium text-slate-700">{fileName || '已上传商品图片'}</p>
                    <p className="mt-1 text-xs text-slate-500">点击可更换图片</p>
                  </div>
                ) : (
                  <>
                    <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-white text-blue-600 shadow-line">
                      <Upload className="h-6 w-6" />
                    </span>
                    <span className="text-base font-semibold text-slate-950">上传商品图片</span>
                    <span className="mt-2 max-w-sm text-sm leading-6 text-slate-500">支持 PNG/JPG/WebP，本地预览，不上传服务器。</span>
                  </>
                )}
                <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleUpload} />
              </label>

              <div className="mt-5 grid gap-4">
                <Field label="商品名称">
                  <input
                    className="focus-ring w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm"
                    placeholder="例如：Portable Espresso Maker"
                    value={form.productName}
                    onChange={(event) => updateForm('productName', event.target.value)}
                  />
                </Field>
                <Field label="商品卖点">
                  <textarea
                    className="focus-ring min-h-28 w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-6"
                    placeholder="例如：便携、快充、适合露营、材质高级、解决通勤痛点"
                    value={form.sellingPoints}
                    onChange={(event) => updateForm('sellingPoints', event.target.value)}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="销售平台">
                    <select className="focus-ring w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm" value={form.platform} onChange={(event) => updateForm('platform', event.target.value)}>
                      {platforms.map((platform) => <option key={platform}>{platform}</option>)}
                    </select>
                  </Field>
                  <Field label="图片风格">
                    <select className="focus-ring w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm" value={form.style} onChange={(event) => updateForm('style', event.target.value)}>
                      {styles.map((style) => <option key={style}>{style}</option>)}
                    </select>
                  </Field>
                </div>
                <button
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                  onClick={generate}
                >
                  <WandSparkles className="h-4 w-4" />
                  生成提示词
                </button>
              </div>
            </section>

            <section className="space-y-4">
              {results ? (
                <>
                  <PromptCard
                    icon={PackageSearch}
                    title="商品主图提示词"
                    subtitle="适合商城首图、搜索结果、商品详情页头图"
                    prompt={results.main}
                    copied={copiedKey === 'main'}
                    onCopy={() => copyPrompt('main', results.main)}
                  />
                  <PromptCard
                    icon={Megaphone}
                    title="商品场景图提示词"
                    subtitle="适合广告投放、落地页、社媒素材"
                    prompt={results.scene}
                    copied={copiedKey === 'scene'}
                    onCopy={() => copyPrompt('scene', results.scene)}
                  />
                  <PromptCard
                    icon={PlaySquare}
                    title="TikTok封面图提示词"
                    subtitle="适合短视频首帧、达人Brief、TikTok Shop封面"
                    prompt={results.tiktok}
                    copied={copiedKey === 'tiktok'}
                    onCopy={() => copyPrompt('tiktok', results.tiktok)}
                  />
                </>
              ) : (
                <EmptyResult />
              )}
            </section>
          </div>
        </div>
      </section>

      <section id="history" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-700">
              <Clipboard className="h-4 w-4" />
              历史记录
            </div>
            <h2 className="text-3xl font-semibold tracking-normal text-slate-950">最近生成</h2>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600">{history.length} 条</span>
        </div>
        {history.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            暂无历史记录，生成一次提示词后会自动展示在这里。
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {history.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-line">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-950">{item.productName}</h3>
                    <p className="mt-1 text-sm text-slate-500">{item.createdAt}</p>
                  </div>
                  {item.imagePreview ? (
                    <img src={item.imagePreview} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <BadgeCheck className="h-5 w-5 flex-none text-emerald-600" />
                  )}
                </div>
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{item.platform}</span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{item.style}</span>
                </div>
                <p className="line-clamp-4 text-sm leading-6 text-slate-600">{item.prompts.main}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Header({ mobileOpen, setMobileOpen }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/78 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="#home" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white shadow-soft">
            <Sparkles className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-wide text-slate-950">CommerceCanvas AI</span>
            <span className="block text-xs text-slate-500">AI ecommerce image studio</span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a className="hover:text-slate-950" href="#home">首页</a>
          <a className="hover:text-slate-950" href="#workspace">工作台</a>
          <a className="hover:text-slate-950" href="#history">历史记录</a>
        </nav>
        <a
          href="#workspace"
          className="hidden items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 md:flex"
        >
          进入工作台
          <ChevronRight className="h-4 w-4" />
        </a>
        <button
          aria-label="打开菜单"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white md:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/30 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="ml-auto h-full w-72 bg-white p-5 shadow-soft" onClick={(event) => event.stopPropagation()}>
            <div className="mb-8 flex items-center justify-between">
              <span className="font-semibold">菜单</span>
              <button className="rounded-lg border border-slate-200 p-2" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            {[
              ['首页', '#home'],
              ['工作台', '#workspace'],
              ['历史记录', '#history'],
            ].map(([label, href]) => (
              <a key={label} href={href} className="block border-b border-slate-100 py-4 font-medium text-slate-700" onClick={() => setMobileOpen(false)}>
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function EmptyResult() {
  return (
    <div className="glass-panel flex min-h-80 flex-col items-center justify-center rounded-xl p-8 text-center">
      <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-lg bg-slate-950 text-white shadow-soft">
        <Sparkles className="h-7 w-7" />
      </span>
      <h3 className="text-xl font-semibold text-slate-950">生成结果会展示在这里</h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
        上传商品图片并填写信息后，系统会按销售平台和视觉风格生成三套专业电商生图提示词。
      </p>
    </div>
  );
}

function PromptCard({ icon: Icon, title, subtitle, prompt, copied, onCopy }) {
  return (
    <article className="glass-panel rounded-xl p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-semibold text-slate-950">{title}</h3>
            <p className="mt-1 text-sm leading-5 text-slate-500">{subtitle}</p>
          </div>
        </div>
        <button
          className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
          onClick={onCopy}
          aria-label={`复制${title}`}
          title={`复制${title}`}
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">{prompt}</p>
    </article>
  );
}

export default App;

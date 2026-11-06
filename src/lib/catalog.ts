export type Category = "gpu" | "ram" | "storage" | "cpu";

export type CatalogProduct = {
  id: string;
  category: Category;
  brand: string;
  model: string;
  specs: string;
  /** 参考市场价（分），用于生成演示报价与历史走势 */
  refPriceCents: number;
};

export const PLATFORMS = [
  { id: "jd", label: "京东" },
  { id: "tmall", label: "天猫" },
  { id: "pdd", label: "拼多多" },
  { id: "taobao", label: "淘宝" },
] as const;

export const CATEGORY_LABELS: Record<Category, string> = {
  gpu: "显卡 GPU",
  ram: "内存 RAM",
  storage: "存储 SSD",
  cpu: "处理器 CPU",
};

/** 关注型号清单：NVIDIA 40/50 系桌面、AMD 新桌面卡、主流内存/SSD/CPU */
export const CATALOG: CatalogProduct[] = [
  // NVIDIA 50 系
  {
    id: "gpu-rtx-5090",
    category: "gpu",
    brand: "NVIDIA",
    model: "GeForce RTX 5090",
    specs: "32GB GDDR7 · 桌面",
    refPriceCents: 1649900,
  },
  {
    id: "gpu-rtx-5080",
    category: "gpu",
    brand: "NVIDIA",
    model: "GeForce RTX 5080",
    specs: "16GB GDDR7 · 桌面",
    refPriceCents: 829900,
  },
  {
    id: "gpu-rtx-5070-ti",
    category: "gpu",
    brand: "NVIDIA",
    model: "GeForce RTX 5070 Ti",
    specs: "16GB GDDR7 · 桌面",
    refPriceCents: 629900,
  },
  {
    id: "gpu-rtx-5070",
    category: "gpu",
    brand: "NVIDIA",
    model: "GeForce RTX 5070",
    specs: "12GB GDDR7 · 桌面",
    refPriceCents: 459900,
  },
  {
    id: "gpu-rtx-5060-ti",
    category: "gpu",
    brand: "NVIDIA",
    model: "GeForce RTX 5060 Ti",
    specs: "16GB GDDR7 · 桌面",
    refPriceCents: 349900,
  },
  {
    id: "gpu-rtx-5060",
    category: "gpu",
    brand: "NVIDIA",
    model: "GeForce RTX 5060",
    specs: "8GB GDDR7 · 桌面",
    refPriceCents: 249900,
  },
  // NVIDIA 40 系
  {
    id: "gpu-rtx-4090",
    category: "gpu",
    brand: "NVIDIA",
    model: "GeForce RTX 4090",
    specs: "24GB GDDR6X · 桌面",
    refPriceCents: 1299900,
  },
  {
    id: "gpu-rtx-4080-super",
    category: "gpu",
    brand: "NVIDIA",
    model: "GeForce RTX 4080 SUPER",
    specs: "16GB GDDR6X · 桌面",
    refPriceCents: 799900,
  },
  {
    id: "gpu-rtx-4070-ti-super",
    category: "gpu",
    brand: "NVIDIA",
    model: "GeForce RTX 4070 Ti SUPER",
    specs: "16GB GDDR6X · 桌面",
    refPriceCents: 549900,
  },
  {
    id: "gpu-rtx-4070-super",
    category: "gpu",
    brand: "NVIDIA",
    model: "GeForce RTX 4070 SUPER",
    specs: "12GB GDDR6X · 桌面",
    refPriceCents: 429900,
  },
  {
    id: "gpu-rtx-4070",
    category: "gpu",
    brand: "NVIDIA",
    model: "GeForce RTX 4070",
    specs: "12GB GDDR6X · 桌面",
    refPriceCents: 389900,
  },
  {
    id: "gpu-rtx-4060-ti",
    category: "gpu",
    brand: "NVIDIA",
    model: "GeForce RTX 4060 Ti",
    specs: "8GB GDDR6 · 桌面",
    refPriceCents: 289900,
  },
  {
    id: "gpu-rtx-4060",
    category: "gpu",
    brand: "NVIDIA",
    model: "GeForce RTX 4060",
    specs: "8GB GDDR6 · 桌面",
    refPriceCents: 219900,
  },
  // AMD 新桌面卡
  {
    id: "gpu-rx-9070-xt",
    category: "gpu",
    brand: "AMD",
    model: "Radeon RX 9070 XT",
    specs: "16GB GDDR6 · 桌面",
    refPriceCents: 479900,
  },
  {
    id: "gpu-rx-9070",
    category: "gpu",
    brand: "AMD",
    model: "Radeon RX 9070",
    specs: "16GB GDDR6 · 桌面",
    refPriceCents: 429900,
  },
  {
    id: "gpu-rx-9060-xt",
    category: "gpu",
    brand: "AMD",
    model: "Radeon RX 9060 XT",
    specs: "16GB GDDR6 · 桌面",
    refPriceCents: 299900,
  },
  {
    id: "gpu-rx-7900-xtx",
    category: "gpu",
    brand: "AMD",
    model: "Radeon RX 7900 XTX",
    specs: "24GB GDDR6 · 桌面",
    refPriceCents: 649900,
  },
  {
    id: "gpu-rx-7800-xt",
    category: "gpu",
    brand: "AMD",
    model: "Radeon RX 7800 XT",
    specs: "16GB GDDR6 · 桌面",
    refPriceCents: 369900,
  },
  // RAM
  {
    id: "ram-corsair-vengeance-ddr5-6000-32",
    category: "ram",
    brand: "Corsair",
    model: "Vengeance DDR5-6000 32GB(16×2)",
    specs: "CL30 · 台式机",
    refPriceCents: 69900,
  },
  {
    id: "ram-gskill-trident-z5-6400-32",
    category: "ram",
    brand: "G.Skill",
    model: "Trident Z5 RGB DDR5-6400 32GB",
    specs: "CL32 · 台式机",
    refPriceCents: 79900,
  },
  {
    id: "ram-kingston-fury-5600-32",
    category: "ram",
    brand: "Kingston",
    model: "FURY Beast DDR5-5600 32GB",
    specs: "CL36 · 台式机",
    refPriceCents: 54900,
  },
  {
    id: "ram-crucial-pro-6000-32",
    category: "ram",
    brand: "Crucial",
    model: "Pro DDR5-6000 32GB",
    specs: "CL36 · 台式机",
    refPriceCents: 49900,
  },
  {
    id: "ram-team-t-create-6000-64",
    category: "ram",
    brand: "TeamGroup",
    model: "T-CREATE Expert DDR5-6000 64GB",
    specs: "CL30 · 台式机",
    refPriceCents: 129900,
  },
  // Storage
  {
    id: "ssd-samsung-990-pro-2tb",
    category: "storage",
    brand: "Samsung",
    model: "990 PRO 2TB",
    specs: "PCIe 4.0 NVMe",
    refPriceCents: 99900,
  },
  {
    id: "ssd-wd-sn850x-2tb",
    category: "storage",
    brand: "WD",
    model: "Black SN850X 2TB",
    specs: "PCIe 4.0 NVMe",
    refPriceCents: 89900,
  },
  {
    id: "ssd-crucial-t705-2tb",
    category: "storage",
    brand: "Crucial",
    model: "T705 2TB",
    specs: "PCIe 5.0 NVMe",
    refPriceCents: 129900,
  },
  {
    id: "ssd-kingston-nv3-2tb",
    category: "storage",
    brand: "Kingston",
    model: "NV3 2TB",
    specs: "PCIe 4.0 NVMe",
    refPriceCents: 69900,
  },
  {
    id: "ssd-zhi-tai-ti600-2tb",
    category: "storage",
    brand: "致态",
    model: "TiPlus 7100 2TB",
    specs: "PCIe 4.0 NVMe",
    refPriceCents: 74900,
  },
  {
    id: "ssd-solidigm-p44-pro-2tb",
    category: "storage",
    brand: "Solidigm",
    model: "P44 Pro 2TB",
    specs: "PCIe 4.0 NVMe",
    refPriceCents: 94900,
  },
  // CPU
  {
    id: "cpu-ryzen-9-9950x",
    category: "cpu",
    brand: "AMD",
    model: "Ryzen 9 9950X",
    specs: "16核32线程 · AM5",
    refPriceCents: 449900,
  },
  {
    id: "cpu-ryzen-7-9700x",
    category: "cpu",
    brand: "AMD",
    model: "Ryzen 7 9700X",
    specs: "8核16线程 · AM5",
    refPriceCents: 249900,
  },
  {
    id: "cpu-ryzen-5-9600x",
    category: "cpu",
    brand: "AMD",
    model: "Ryzen 5 9600X",
    specs: "6核12线程 · AM5",
    refPriceCents: 179900,
  },
  {
    id: "cpu-i9-14900k",
    category: "cpu",
    brand: "Intel",
    model: "Core i9-14900K",
    specs: "24核32线程 · LGA1700",
    refPriceCents: 389900,
  },
  {
    id: "cpu-i7-14700k",
    category: "cpu",
    brand: "Intel",
    model: "Core i7-14700K",
    specs: "20核28线程 · LGA1700",
    refPriceCents: 279900,
  },
  {
    id: "cpu-i5-14600k",
    category: "cpu",
    brand: "Intel",
    model: "Core i5-14600K",
    specs: "14核20线程 · LGA1700",
    refPriceCents: 199900,
  },
  {
    id: "cpu-ultra-9-285k",
    category: "cpu",
    brand: "Intel",
    model: "Core Ultra 9 285K",
    specs: "24核24线程 · LGA1851",
    refPriceCents: 459900,
  },
  {
    id: "cpu-ultra-7-265k",
    category: "cpu",
    brand: "Intel",
    model: "Core Ultra 7 265K",
    specs: "20核20线程 · LGA1851",
    refPriceCents: 299900,
  },
];

export const DEMO_SHOPS: Record<string, string[]> = {
  jd: ["京东自营", "七彩虹京东自营旗舰店", "华硕京东自营旗舰店", "微星京东自营旗舰店"],
  tmall: ["天猫官方旗舰店", "七彩虹官方旗舰店", "华硕官方旗舰店", "索泰官方旗舰店"],
  pdd: ["拼多多百亿补贴", "品牌官方店", "装机严选店", "硬件折扣仓"],
  taobao: ["品牌授权店", "装机工作室", "硬件集市", "原厂配件馆"],
};

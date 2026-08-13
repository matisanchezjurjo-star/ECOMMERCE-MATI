import { db } from "@/lib/db";
import { toProductDTO } from "@/lib/products/dto";
import { getAIProvider } from "@/lib/ai/factory";
import { recordAIUsage } from "@/lib/ai/usage";
import { findSuppliersForProduct } from "@/lib/actions/suppliers";
import { calculateProfitability, type ProfitabilityInputs } from "@/lib/calculators/profitability";
import { CLASSIFICATION_LABEL } from "@/lib/scoring/format";

export interface AgentToolContext {
  organizationId: string;
  userId: string;
}

export interface AgentToolDefinition {
  name: string;
  description: string;
  /** Documented for the LLM decision prompt — kept as plain text rather than a JSON Schema to stay provider-agnostic. */
  argsShape: string;
  run: (args: Record<string, unknown>, ctx: AgentToolContext) => Promise<string>;
}

function num(args: Record<string, unknown>, key: string, fallback: number): number {
  const v = args[key];
  const parsed = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function str(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key];
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

export const AGENT_TOOLS: AgentToolDefinition[] = [
  {
    name: "searchProducts",
    description: "Search already-discovered products in this workspace by keyword, category, and minimum Winner Score.",
    argsShape: `{ query?: string, category?: string, minWinnerScore?: number, maxCost?: number, country?: string }`,
    async run(args, ctx) {
      const products = await db.product.findMany({
        where: {
          organizationId: ctx.organizationId,
          ...(str(args, "query") ? { title: { contains: str(args, "query"), mode: "insensitive" } } : {}),
          ...(str(args, "category") ? { category: str(args, "category") } : {}),
          ...(args.minWinnerScore !== undefined ? { winnerScore: { gte: num(args, "minWinnerScore", 0) } } : {}),
          ...(args.maxCost !== undefined ? { cost: { lte: num(args, "maxCost", 999999) } } : {}),
          ...(str(args, "country") ? { country: str(args, "country") } : {}),
        },
        orderBy: { winnerScore: "desc" },
        take: 8,
      });

      if (products.length === 0) return "No matching products found in the workspace's discovered products.";

      return products
        .map(
          (p) =>
            `- ${p.title} [id:${p.id}] — Winner Score ${p.winnerScore ?? "N/A"} (${p.winnerClassification ? CLASSIFICATION_LABEL[p.winnerClassification] : "unscored"}), category ${p.category}, cost $${p.cost ?? "?"}, sell $${p.sellingPriceEstimate ?? "?"}, source ${p.sourceKey}`
        )
        .join("\n");
    },
  },
  {
    name: "analyzeProduct",
    description: "Get the winner-score breakdown and latest AI analysis (if any) for a specific product by id or exact title.",
    argsShape: `{ productIdOrTitle: string }`,
    async run(args, ctx) {
      const key = str(args, "productIdOrTitle");
      if (!key) return "No product specified.";

      const product = await db.product.findFirst({
        where: {
          organizationId: ctx.organizationId,
          OR: [{ id: key }, { title: { equals: key, mode: "insensitive" } }, { title: { contains: key, mode: "insensitive" } }],
        },
        include: { aiAnalyses: { orderBy: { createdAt: "desc" }, take: 1 } },
      });

      if (!product) return `No product found matching "${key}".`;

      const dto = toProductDTO(product);
      const lines = [
        `${dto.title} — Winner Score ${dto.winnerScore ?? "N/A"} (${dto.winnerClassification ? CLASSIFICATION_LABEL[dto.winnerClassification] : "unscored"})`,
        `Cost $${dto.cost ?? "?"}, sell $${dto.sellingPriceEstimate ?? "?"}, growth ${dto.searchGrowthPercent ?? "?"}%`,
        dto.winnerRecommendation ?? "",
      ];
      const analysis = product.aiAnalyses[0];
      if (analysis) {
        lines.push(`Latest AI analysis: ${analysis.launchRecommendation ?? analysis.overview ?? ""}`);
      } else {
        lines.push("No AI analysis has been run yet for this product.");
      }
      return lines.filter(Boolean).join("\n");
    },
  },
  {
    name: "findSuppliers",
    description: "Search connected supplier sources (Alibaba, 1688, Made-in-China, AliExpress) for a product and link results to it.",
    argsShape: `{ productIdOrTitle: string }`,
    async run(args, ctx) {
      const key = str(args, "productIdOrTitle");
      if (!key) return "No product specified.";
      const product = await db.product.findFirst({
        where: {
          organizationId: ctx.organizationId,
          OR: [{ id: key }, { title: { contains: key, mode: "insensitive" } }],
        },
      });
      if (!product) return `No product found matching "${key}".`;

      const result = await findSuppliersForProduct(product.id);
      return `Found and linked ${result.linkedCount} supplier option(s) for "${product.title}". View them on the product's detail page.`;
    },
  },
  {
    name: "calculateProfitability",
    description: "Run the profitability calculator for a given cost, selling price, and optional CAC/fees to get margin, break-even CPA and ROAS.",
    argsShape: `{ productCost: number, sellingPrice: number, cac?: number, shippingCost?: number, returnRatePercent?: number, monthlyOrders?: number }`,
    async run(args) {
      const inputs: ProfitabilityInputs = {
        productCost: num(args, "productCost", 10),
        shippingCost: num(args, "shippingCost", 2),
        paymentFeePercent: num(args, "paymentFeePercent", 2.9),
        platformFeePercent: num(args, "platformFeePercent", 0),
        taxPercent: num(args, "taxPercent", 0),
        fulfillmentCost: num(args, "fulfillmentCost", 1),
        returnRatePercent: num(args, "returnRatePercent", 5),
        cac: num(args, "cac", 12),
        sellingPrice: num(args, "sellingPrice", 30),
        upsellRevenue: num(args, "upsellRevenue", 0),
        monthlyOrders: num(args, "monthlyOrders", 300),
      };
      const result = calculateProfitability(inputs);
      return [
        `Revenue (AOV): $${result.revenue.toFixed(2)}`,
        `Net profit / order: $${result.netProfit.toFixed(2)} (${result.marginPercent.toFixed(1)}% margin)`,
        `Break-even CPA: $${result.breakEvenCpa.toFixed(2)}, break-even ROAS: ${Number.isFinite(result.breakEvenRoas) ? result.breakEvenRoas.toFixed(2) : "N/A"}x`,
        `Estimated monthly profit at ${inputs.monthlyOrders} orders: $${result.estimatedMonthlyProfit.toFixed(2)}`,
      ].join("\n");
    },
  },
  {
    name: "generateBrand",
    description: "Generate an AI brand kit (name, tagline, positioning, colors) for a specific product and save it.",
    argsShape: `{ productIdOrTitle: string }`,
    async run(args, ctx) {
      const key = str(args, "productIdOrTitle");
      if (!key) return "No product specified.";
      const product = await db.product.findFirst({
        where: { organizationId: ctx.organizationId, OR: [{ id: key }, { title: { contains: key, mode: "insensitive" } }] },
      });
      if (!product) return `No product found matching "${key}".`;

      const settings = await db.userSettings.findUnique({ where: { userId: ctx.userId } });
      const provider = getAIProvider({ provider: settings?.aiProvider ?? "ANTHROPIC", model: settings?.aiModel });

      const result = await provider.generateBrand({
        productTitle: product.title,
        productDescription: product.description,
        category: product.category,
      });

      await recordAIUsage({ organizationId: ctx.organizationId, userId: ctx.userId, feature: "generateBrand", usage: result.usage });

      await db.brand.create({
        data: {
          organizationId: ctx.organizationId,
          productId: product.id,
          name: result.data.chosenName,
          tagline: result.data.tagline,
          positioning: result.data.positioning,
          usp: result.data.usp,
          story: result.data.story,
          toneOfVoice: result.data.toneOfVoice,
          colorPalette: result.data.colorPalette,
          typography: result.data.typography,
          logoConcepts: result.data.logoConcepts,
          domainSuggestions: result.data.domainSuggestions,
          socialHandles: result.data.socialHandles,
          packagingIdeas: result.data.packagingIdeas,
          memorabilityScore: result.data.memorabilityScore,
          premiumPerceptionScore: result.data.premiumPerceptionScore,
          trademarkRiskScore: result.data.trademarkRiskScore,
          domainPotentialScore: result.data.domainPotentialScore,
          overallScore:
            (result.data.memorabilityScore + result.data.premiumPerceptionScore + result.data.domainPotentialScore) / 3,
          aiProvider: result.usage.provider,
          aiModel: result.usage.model,
        },
      });

      return `Generated brand "${result.data.chosenName}" for "${product.title}"${result.usedDemoProvider ? " (demo mode)" : ""}: ${result.data.tagline}. Positioning: ${result.data.positioning}`;
    },
  },
];

export function getToolByName(name: string): AgentToolDefinition | undefined {
  return AGENT_TOOLS.find((t) => t.name === name);
}

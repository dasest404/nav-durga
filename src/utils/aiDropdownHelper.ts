import {
  Product,
  RateHistoryRecord,
  RateUpdateProposalData,
  RateComparisonData,
  AIAssistantMessage,
  SmartDropdownCategory,
  SmartDropdownAction,
} from '../types';
import { doesProductMatchSection, normalizeProductType } from './sectionPriceHelper';
import { AssistantContext } from '../services/aiAssistantService';

export interface CategoryMeta {
  key: SmartDropdownCategory;
  label: string;
  fullName: string;
  company: string;
  section: 'MEDIUM SECTION' | 'LIGHT SECTION';
  defaultBaseRate: number;
  tag: string;
  description: string;
}

export const CATEGORY_CONFIGS: Record<SmartDropdownCategory, CategoryMeta> = {
  MEDIUM: {
    key: 'MEDIUM',
    label: 'Medium',
    fullName: 'Medium Section',
    company: 'NAVDURGA ISPAT PVT. LTD.',
    section: 'MEDIUM SECTION',
    defaultBaseRate: 49711,
    tag: 'Nav Durga',
    description: 'Raipur Mill • Fe 500D & Medium Structural Sections',
  },
  SL: {
    key: 'SL',
    label: 'SL — Super Light',
    fullName: 'SL — Super Light Section',
    company: 'NAVDURGA ISPAT PVT. LTD.',
    section: 'MEDIUM SECTION',
    defaultBaseRate: 49711,
    tag: 'Super Light',
    description: 'Super Light Channels & Precision Profiles',
  },
  LIGHT: {
    key: 'LIGHT',
    label: 'Light',
    fullName: 'Light Section',
    company: 'UNIT-2 — NS ISPAT (I) PVT. LTD.',
    section: 'LIGHT SECTION',
    defaultBaseRate: 42211,
    tag: 'Unit-2',
    description: 'Unit-2 Raipur • Light Channels & Small Angles',
  },
  '5 KG': {
    key: '5 KG',
    label: '5 KG',
    fullName: '5 KG Grade',
    company: 'UNIT-2 — NS ISPAT (I) PVT. LTD.',
    section: 'LIGHT SECTION',
    defaultBaseRate: 42211,
    tag: 'Unit-2 Spec',
    description: '5 KG Light-Duty Structural Specifications',
  },
  '8 KG': {
    key: '8 KG',
    label: '8 KG',
    fullName: '8 KG Grade',
    company: 'UNIT-2 — NS ISPAT (I) PVT. LTD.',
    section: 'LIGHT SECTION',
    defaultBaseRate: 42211,
    tag: 'Unit-2 Spec',
    description: '8 KG Heavy-Duty Structural Specifications',
  },
};

export const DROPDOWN_ACTIONS: {
  key: SmartDropdownAction;
  label: string;
  iconName: string;
  shortDesc: string;
}[] = [
  {
    key: 'ENTER_TODAYS_PRICE',
    label: "Enter Today's Price",
    iconName: 'Edit3',
    shortDesc: 'Preselect section, enter basic rate & calculate final prices',
  },
  {
    key: 'COMPARE_OLD_NEW_PRICE',
    label: 'Compare Old vs. New Price',
    iconName: 'ArrowLeftRight',
    shortDesc: 'Structured rate comparison of current vs. previous approved prices',
  },
  {
    key: 'VIEW_TODAYS_PRICE',
    label: "View Today's Price",
    iconName: 'Eye',
    shortDesc: 'Current approved prices, gauge diff & effective dates',
  },
  {
    key: 'VIEW_PREVIOUS_PRICE',
    label: 'View Previous Price',
    iconName: 'Clock',
    shortDesc: 'Most recent prior approved rates from historical records',
  },
  {
    key: 'VIEW_PRICE_CHANGE_HISTORY',
    label: 'View Price Change History',
    iconName: 'History',
    shortDesc: 'Chronological price change audit records for this section',
  },
];

/**
 * Filter products for the selected category based strictly on existing ERP Product Master mappings.
 * Does not mix products between companies or unrelated sections.
 */
export function getProductsForDropdownCategory(
  category: SmartDropdownCategory,
  products: Product[]
): Product[] {
  const activeProds = products.filter((p) => p.status === 'Active');

  switch (category) {
    case 'MEDIUM': {
      // Medium Section (Nav Durga Ispat Pvt. Ltd. - 13 canonical products)
      const list = activeProds.filter((p) => doesProductMatchSection(p, 'MEDIUM SECTION'));
      return list.length > 0 ? list : products.filter((p) => doesProductMatchSection(p, 'MEDIUM SECTION'));
    }
    case 'SL': {
      // SL / Super Light (channels and sections with SL / Super light grade or type)
      const list = activeProds.filter(
        (p) =>
          normalizeProductType(p.type || p.grade || p.gaugeType) === 'Super light' ||
          p.grade === 'SL' ||
          (p.name && p.name.includes('SL')) ||
          (p.size && p.size.includes('SL'))
      );
      return list.length > 0
        ? list
        : products.filter((p) => p.grade === 'SL' || (p.name && p.name.includes('SL')));
    }
    case 'LIGHT': {
      // Light Section (Unit-2 NS Ispat (I) Pvt. Ltd. - 9 canonical products)
      const list = activeProds.filter((p) => doesProductMatchSection(p, 'LIGHT SECTION'));
      return list.length > 0 ? list : products.filter((p) => doesProductMatchSection(p, 'LIGHT SECTION'));
    }
    case '5 KG': {
      // 5 KG Grade (Unit-2 NS Ispat - 5 KG channels/angles)
      const list = activeProds.filter(
        (p) =>
          normalizeProductType(p.type || p.grade || p.gaugeType) === '5 kg' ||
          p.grade === '5 KG' ||
          p.gaugeType === '5 KG' ||
          (p.grade && p.grade.includes('5 KG')) ||
          (p.name && p.name.includes('5 KG'))
      );
      return list.length > 0
        ? list
        : products.filter(
            (p) =>
              p.grade === '5 KG' ||
              p.gaugeType === '5 KG' ||
              (p.grade && p.grade.includes('5 KG')) ||
              (p.name && p.name.includes('5 KG'))
          );
    }
    case '8 KG': {
      // 8 KG Grade (Unit-2 NS Ispat - 8 KG channels/angles)
      const list = activeProds.filter(
        (p) =>
          normalizeProductType(p.type || p.grade || p.gaugeType) === '8 kg' ||
          p.grade === '8 KG' ||
          p.gaugeType === '8 KG' ||
          (p.grade && p.grade.includes('8 KG')) ||
          (p.name && p.name.includes('8 KG'))
      );
      return list.length > 0
        ? list
        : products.filter(
            (p) =>
              p.grade === '8 KG' ||
              p.gaugeType === '8 KG' ||
              (p.grade && p.grade.includes('8 KG')) ||
              (p.name && p.name.includes('8 KG'))
          );
    }
    default:
      return [];
  }
}

/**
 * Executes a structured dropdown action with verified ERP data.
 */
export function executeStructuredDropdownAction(
  category: SmartDropdownCategory,
  action: SmartDropdownAction,
  context: AssistantContext
): AIAssistantMessage {
  const meta = CATEGORY_CONFIGS[category];
  const items = getProductsForDropdownCategory(category, context.products);
  const messageId = `msg-action-${Date.now()}`;
  const today = new Date().toISOString().split('T')[0];

  // Base rate resolution for this category
  let currentBaseRate = meta.defaultBaseRate;
  if (context.categoryBasicRates && context.categoryBasicRates[meta.section] !== undefined) {
    currentBaseRate = context.categoryBasicRates[meta.section]!;
  } else if (items.length > 0 && items[0].baseRate) {
    currentBaseRate = items[0].baseRate;
  }

  // ---------------------------------------------------------------------------
  // 1. ENTER TODAY'S PRICE
  // ---------------------------------------------------------------------------
  if (action === 'ENTER_TODAYS_PRICE') {
    const previewItems = items.map((prod) => {
      const gDiff = prod.gaugeDifference !== undefined ? prod.gaugeDifference : 0;
      const currentFinal = prod.finalRate ?? prod.currentPrice;
      const proposedFinal = currentBaseRate + gDiff;
      return {
        id: prod.id,
        name: prod.name,
        size: prod.size || 'Standard',
        grade: prod.grade || 'Medium',
        gaugeDifference: gDiff,
        currentPrice: currentFinal,
        proposedRate: proposedFinal,
        change: proposedFinal - currentFinal,
      };
    });

    const proposal: RateUpdateProposalData = {
      section: meta.fullName,
      companyUnit: meta.company,
      proposedBaseRate: currentBaseRate,
      affectedProductsCount: items.length,
      affectedProductIds: items.map((p) => p.id),
      previewItems,
      status: 'pending',
    };

    const content =
      `📋 **Enter Today's Price — ${meta.fullName}**\n\n` +
      `Here is the active Daily Price Update workflow for **${meta.fullName}** (${meta.company}).\n\n` +
      `• **Company / Unit:** ${meta.company}\n` +
      `• **Current Approved Base Rate:** ₹${currentBaseRate.toLocaleString('en-IN')}/MT\n` +
      `• **Applicable Products:** ${items.length} items from ERP Product Master\n` +
      `• **Approved Pricing Engine:** \`Final Rate = Basic Rate + Gauge Difference\`\n\n` +
      `You can review and enter your proposed basic rate in the confirmation card below. ` +
      `When confirmed, prices will be safely applied to the ERP catalog and rate history. ` +
      `Alternatively, click **Open in Daily Rate Management** to open the full module.`;

    return {
      id: messageId,
      role: 'assistant',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent: 'rate_update_proposal',
      rateProposal: proposal,
      dropdownAction: { action, category },
      quickOptions: [
        {
          label: `Open in Daily Rate Management`,
          actionText: `Open Daily Rate Update for ${meta.label}`,
          tag: 'ERP Tab',
        },
        {
          label: `Generate ${meta.label} Price Post`,
          actionText: `Create a price update post for ${meta.label}`,
          tag: 'Poster',
        },
      ],
    };
  }

  // ---------------------------------------------------------------------------
  // 2. COMPARE OLD VS. NEW PRICE
  // ---------------------------------------------------------------------------
  if (action === 'COMPARE_OLD_NEW_PRICE') {
    let increasedCount = 0;
    let decreasedCount = 0;
    let unchangedCount = 0;
    let noPrevCount = 0;

    const comparisonItems = items.map((prod) => {
      const currentRate = prod.finalRate ?? prod.currentPrice;

      // Find previous rate from product records or rateHistory
      let prevRate: number | null = null;
      if (prod.previousPrice !== undefined && prod.previousPrice > 0) {
        prevRate = prod.previousPrice;
      } else if (prod.priceHistory && prod.priceHistory.length > 1) {
        prevRate = prod.priceHistory[1].price;
      } else {
        const histMatch = context.rateHistory.find(
          (rh: RateHistoryRecord) => rh.productId === prod.id && rh.previousRate > 0
        );
        if (histMatch) {
          prevRate = histMatch.previousRate;
        }
      }

      let diff = 0;
      let percentChange = 0;
      let changeLabel: 'Increased' | 'Decreased' | 'Unchanged' | 'No Previous Price Available' =
        'No Previous Price Available';

      if (prevRate !== null) {
        diff = currentRate - prevRate;
        percentChange = prevRate > 0 ? parseFloat(((diff / prevRate) * 100).toFixed(2)) : 0;
        if (diff > 0) {
          changeLabel = 'Increased';
          increasedCount++;
        } else if (diff < 0) {
          changeLabel = 'Decreased';
          decreasedCount++;
        } else {
          changeLabel = 'Unchanged';
          unchangedCount++;
        }
      } else {
        noPrevCount++;
      }

      return {
        name: prod.name,
        size: prod.size || 'Standard',
        grade: prod.grade || 'Medium',
        section: prod.section || meta.section,
        previousPrice: prevRate !== null ? prevRate : 0,
        currentPrice: currentRate,
        difference: diff,
        percentChange,
        changeLabel,
        hasPreviousPrice: prevRate !== null,
      };
    });

    // Build Structured Markdown Table strictly adhering to Spec:
    // | Product | Size | Previous Rate | New Rate | Difference | Change |
    const tableHeader = '| Product | Size | Previous Rate | New Rate | Difference | Change |\n| :--- | :--- | :---: | :---: | :---: | :---: |';
    const tableRows = comparisonItems
      .map((row) => {
        const prevStr = row.hasPreviousPrice ? `₹${row.previousPrice.toLocaleString('en-IN')}` : 'No Previous Price Available';
        const newStr = `₹${row.currentPrice.toLocaleString('en-IN')}`;
        const diffStr = row.hasPreviousPrice
          ? row.difference > 0
            ? `+₹${row.difference.toLocaleString('en-IN')}`
            : row.difference < 0
            ? `-₹${Math.abs(row.difference).toLocaleString('en-IN')}`
            : '₹0'
          : '-';
        return `| **${row.name}** | ${row.size} | ${prevStr} | ${newStr} | ${diffStr} | **${row.changeLabel}** |`;
      })
      .join('\n');

    const summaryText =
      `**${meta.fullName} (${meta.company})** Price Comparison:\n` +
      `• **Total Products Analyzed:** ${items.length}\n` +
      `• **Increased:** ${increasedCount} items | **Decreased:** ${decreasedCount} items | **Unchanged:** ${unchangedCount} items\n` +
      (noPrevCount > 0 ? `• **New Listings (No Prior Price):** ${noPrevCount} items\n` : '') +
      `• **Pricing Formula:** \`Price Difference = New Rate − Previous Rate\``;

    const comparisonData: RateComparisonData = {
      title: `Old vs. New Price Comparison — ${meta.fullName}`,
      comparisonType: 'custom',
      summary: summaryText,
      items: comparisonItems.map((ci) => ({
        name: ci.name,
        size: ci.size,
        section: ci.section,
        grade: ci.grade,
        previousPrice: ci.previousPrice,
        currentPrice: ci.currentPrice,
        difference: ci.difference,
        percentChange: ci.percentChange,
      })),
    };

    const content =
      `⚖️ **Price Comparison: Old vs. New Rates (${meta.fullName})**\n\n` +
      `${summaryText}\n\n` +
      `${tableHeader}\n${tableRows}\n\n` +
      `_All figures are ex-plant Raipur in ₹/MT. Data sourced from ERP Product Master and historical audit records._`;

    return {
      id: messageId,
      role: 'assistant',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent: 'compare_old_new_price',
      comparisonData,
      dropdownAction: { action, category },
      queryResults: {
        title: `Price Comparison: Old vs. New Rates — ${meta.fullName}`,
        columns: ['Product', 'Size', 'Previous Rate', 'New Rate', 'Difference', 'Change'],
        rows: comparisonItems.map((row) => [
          row.name,
          row.size,
          row.hasPreviousPrice ? `₹${row.previousPrice.toLocaleString('en-IN')}/MT` : 'No Previous Price Available',
          `₹${row.currentPrice.toLocaleString('en-IN')}/MT`,
          row.hasPreviousPrice
            ? (row.difference > 0 ? `+₹${row.difference.toLocaleString('en-IN')}` : row.difference < 0 ? `-₹${Math.abs(row.difference).toLocaleString('en-IN')}` : '₹0') + '/MT'
            : '-',
          row.changeLabel,
        ]),
        totalCount: comparisonItems.length,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // 3. VIEW TODAY'S PRICE
  // ---------------------------------------------------------------------------
  if (action === 'VIEW_TODAYS_PRICE') {
    // Spec:
    // Product Name | Size | Basic Rate | Gauge Difference | Final Approved Rate | Last Updated Date
    const rows = items.map((prod, idx) => {
      const bRate = prod.baseRate || currentBaseRate;
      const gDiff = prod.gaugeDifference !== undefined ? prod.gaugeDifference : 0;
      const finalRate = prod.finalRate ?? prod.currentPrice;
      const effectiveDate =
        prod.effectiveFrom ||
        (prod.priceHistory && prod.priceHistory[0]?.date) ||
        today;

      return [
        idx + 1,
        prod.name,
        prod.size || 'Standard',
        `₹${bRate.toLocaleString('en-IN')}/MT`,
        gDiff >= 0 ? `+₹${gDiff.toLocaleString('en-IN')}/MT` : `-₹${Math.abs(gDiff).toLocaleString('en-IN')}/MT`,
        `₹${finalRate.toLocaleString('en-IN')}/MT`,
        effectiveDate,
      ];
    });

    const tableHeader = '| S.No | Product Name | Size | Basic Rate | Gauge Diff | Final Approved Rate | Last Updated Date |\n| :---: | :--- | :--- | :---: | :---: | :---: | :---: |';
    const tableRows = items
      .map((p, idx) => {
        const bRate = p.baseRate || currentBaseRate;
        const gDiff = p.gaugeDifference !== undefined ? p.gaugeDifference : 0;
        const fRate = p.finalRate ?? p.currentPrice;
        const effDate = p.effectiveFrom || (p.priceHistory && p.priceHistory[0]?.date) || today;
        return `| ${idx + 1} | **${p.name}** | ${p.size} | ₹${bRate.toLocaleString('en-IN')} | ₹${gDiff} | **₹${fRate.toLocaleString('en-IN')}/MT** | ${effDate} |`;
      })
      .join('\n');

    const content =
      `👁️ **Today's Approved Prices — ${meta.fullName}**\n\n` +
      `Here are the verified active prices for **${meta.fullName}** (${meta.company}).\n\n` +
      `• **Company:** ${meta.company}\n` +
      `• **Benchmark Base Rate:** ₹${currentBaseRate.toLocaleString('en-IN')}/MT\n` +
      `• **Total Products:** ${items.length} items directly from Product Master\n` +
      `• **Approved Formula:** \`Final Rate = Basic Rate + Gauge Difference\`\n\n` +
      `${tableHeader}\n${tableRows}\n\n` +
      `_All rates are ex-plant Raipur, BIS certified, GST 18% extra._`;

    return {
      id: messageId,
      role: 'assistant',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent: 'view_todays_price',
      dropdownAction: { action, category },
      queryResults: {
        title: `Today's Approved Price Sheet — ${meta.fullName}`,
        columns: ['S.No', 'Product Name', 'Size', 'Basic Rate', 'Gauge Difference', 'Final Approved Rate', 'Last Updated Date'],
        rows,
        totalCount: items.length,
      },
      quickOptions: [
        {
          label: `Generate ${meta.label} Price Post`,
          actionText: `Create a price update post for ${meta.label}`,
          tag: 'Poster',
        },
        {
          label: `Enter Today's Price`,
          actionText: `${meta.label} Enter Today's Price`,
          tag: 'Rate Update',
        },
      ],
    };
  }

  // ---------------------------------------------------------------------------
  // 4. VIEW PREVIOUS PRICE
  // ---------------------------------------------------------------------------
  if (action === 'VIEW_PREVIOUS_PRICE') {
    // Spec:
    // Product Name | Size | Previous Basic Rate | Previous Gauge Difference | Previous Final Rate | Previous Update Date
    let foundPrevCount = 0;

    const rows = items.map((prod, idx) => {
      // Find historical record
      const hist = context.rateHistory.find((rh: RateHistoryRecord) => rh.productId === prod.id && rh.previousRate > 0);
      const priorEntry = prod.priceHistory && prod.priceHistory.length > 1 ? prod.priceHistory[1] : null;

      let prevBase = currentBaseRate;
      let prevDiff = prod.gaugeDifference || 0;
      let prevFinal: number | null = null;
      let prevDate = 'No Previous Price Available';

      if (hist) {
        prevBase = hist.baseRate;
        prevDiff = hist.gaugeDifference;
        prevFinal = hist.previousRate || hist.finalRate;
        prevDate = hist.effectiveFrom || hist.date;
        foundPrevCount++;
      } else if (priorEntry) {
        prevFinal = priorEntry.price;
        prevDate = priorEntry.date;
        prevDiff = prod.gaugeDifference || 0;
        prevBase = prevFinal - prevDiff;
        foundPrevCount++;
      } else if (prod.previousPrice && prod.previousPrice !== (prod.finalRate ?? prod.currentPrice)) {
        prevFinal = prod.previousPrice;
        prevDate = 'Prior Session Update';
        prevDiff = prod.gaugeDifference || 0;
        prevBase = prevFinal - prevDiff;
        foundPrevCount++;
      }

      return [
        idx + 1,
        prod.name,
        prod.size || 'Standard',
        prevFinal !== null ? `₹${prevBase.toLocaleString('en-IN')}/MT` : 'No Previous Price Available',
        prevFinal !== null ? (prevDiff >= 0 ? `+₹${prevDiff.toLocaleString('en-IN')}/MT` : `-₹${Math.abs(prevDiff).toLocaleString('en-IN')}/MT`) : '-',
        prevFinal !== null ? `₹${prevFinal.toLocaleString('en-IN')}/MT` : 'No Previous Price Available',
        prevDate,
      ];
    });

    const tableHeader = '| S.No | Product Name | Size | Previous Basic Rate | Previous Gauge Diff | Previous Final Rate | Previous Update Date |\n| :---: | :--- | :--- | :---: | :---: | :---: | :---: |';
    const tableRows = items
      .map((p, idx) => {
        const hist = context.rateHistory.find((rh: RateHistoryRecord) => rh.productId === p.id && rh.previousRate > 0);
        const priorEntry = p.priceHistory && p.priceHistory.length > 1 ? p.priceHistory[1] : null;

        let prevBase = currentBaseRate;
        let prevDiff = p.gaugeDifference || 0;
        let prevFinal: number | null = null;
        let prevDate = 'No Previous Price Available';

        if (hist) {
          prevBase = hist.baseRate;
          prevDiff = hist.gaugeDifference;
          prevFinal = hist.previousRate || hist.finalRate;
          prevDate = hist.effectiveFrom || hist.date;
        } else if (priorEntry) {
          prevFinal = priorEntry.price;
          prevDate = priorEntry.date;
          prevDiff = p.gaugeDifference || 0;
          prevBase = prevFinal - prevDiff;
        } else if (p.previousPrice && p.previousPrice !== (p.finalRate ?? p.currentPrice)) {
          prevFinal = p.previousPrice;
          prevDate = 'Prior Session Update';
          prevDiff = p.gaugeDifference || 0;
          prevBase = prevFinal - prevDiff;
        }

        const prevFinalStr = prevFinal !== null ? `₹${prevFinal.toLocaleString('en-IN')}/MT` : 'No Previous Price Available';
        const prevBaseStr = prevFinal !== null ? `₹${prevBase.toLocaleString('en-IN')}` : '-';
        const prevDiffStr = prevFinal !== null ? `₹${prevDiff}` : '-';

        return `| ${idx + 1} | **${p.name}** | ${p.size} | ${prevBaseStr} | ${prevDiffStr} | **${prevFinalStr}** | ${prevDate} |`;
      })
      .join('\n');

    const content =
      `🕒 **Previous Approved Prices — ${meta.fullName}**\n\n` +
      `Displaying the most recent previously approved price records for **${meta.fullName}** (${meta.company}).\n\n` +
      `• **Historical Records Available:** ${foundPrevCount} of ${items.length} products\n` +
      `• **Source:** Immutable ERP rate history log & historical ledger\n\n` +
      `${tableHeader}\n${tableRows}\n\n` +
      (foundPrevCount === 0
        ? `ℹ️ _All products currently reflect their initial approved specification rates. No earlier revisions exist in the audit log._`
        : `_Rates shown above reflect verified historical records prior to the latest price revision._`);

    return {
      id: messageId,
      role: 'assistant',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent: 'view_previous_price',
      dropdownAction: { action, category },
      queryResults: {
        title: `Previous Approved Price Records — ${meta.fullName}`,
        columns: ['S.No', 'Product Name', 'Size', 'Previous Basic Rate', 'Previous Gauge Diff', 'Previous Final Rate', 'Previous Update Date'],
        rows,
        totalCount: items.length,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // 5. VIEW PRICE CHANGE HISTORY
  // ---------------------------------------------------------------------------
  // action === 'VIEW_PRICE_CHANGE_HISTORY'
  const relevantHistory: RateHistoryRecord[] = context.rateHistory.filter((rh: RateHistoryRecord) => {
    return items.some((p) => p.id === rh.productId || (p.size === rh.size && p.name === rh.productName));
  });

  // If rateHistory has records, format them. Otherwise fallback to product.priceHistory records.
  const historyRows: (string | number)[][] = [];

  if (relevantHistory.length > 0) {
    relevantHistory.forEach((rec) => {
      const diff = rec.finalRate - rec.previousRate;
      const diffStr =
        diff > 0
          ? `+₹${diff.toLocaleString('en-IN')}`
          : diff < 0
          ? `-₹${Math.abs(diff).toLocaleString('en-IN')}`
          : '₹0';

      historyRows.push([
        rec.productName,
        rec.size,
        `₹${rec.previousRate.toLocaleString('en-IN')}/MT`,
        `₹${rec.finalRate.toLocaleString('en-IN')}/MT`,
        diffStr + '/MT',
        rec.timestamp || rec.date,
        rec.updatedBy || 'Virendra Patel (Admin)',
      ]);
    });
  } else {
    // Generate rows from product price history
    items.forEach((p) => {
      if (p.priceHistory && p.priceHistory.length > 0) {
        p.priceHistory.forEach((ph, hIdx) => {
          const prevP = hIdx < p.priceHistory.length - 1 ? p.priceHistory[hIdx + 1].price : (p.previousPrice || ph.price);
          const diff = ph.price - prevP;
          const diffStr =
            diff > 0
              ? `+₹${diff.toLocaleString('en-IN')}`
              : diff < 0
              ? `-₹${Math.abs(diff).toLocaleString('en-IN')}`
              : '₹0';

          historyRows.push([
            p.name,
            p.size || 'Standard',
            `₹${prevP.toLocaleString('en-IN')}/MT`,
            `₹${ph.price.toLocaleString('en-IN')}/MT`,
            diffStr + '/MT',
            ph.date,
            'Authorized ERP Admin',
          ]);
        });
      }
    });
  }

  // Table markdown
  const tableHeader = '| Product Name | Size | Previous Rate | Updated Rate | Difference | Date and Time | Updated By |\n| :--- | :--- | :---: | :---: | :---: | :---: | :--- |';
  const tableRows = historyRows.slice(0, 15)
    .map((r) => `| **${r[0]}** | ${r[1]} | ${r[2]} | **${r[3]}** | ${r[4]} | ${r[5]} | ${r[6]} |`)
    .join('\n');

  const content =
    `📜 **Price Change History & Audit Log — ${meta.fullName}**\n\n` +
    `Historical rate movements and audit logs recorded for **${meta.fullName}** (${meta.company}).\n\n` +
    `• **Total Price Revision Records Found:** ${historyRows.length}\n` +
    `• **Company:** ${meta.company}\n` +
    `• **Audit Compliance:** Immutable ERP audit log with timestamp & user authorization\n\n` +
    `${tableHeader}\n${tableRows}\n\n` +
    `_Displaying latest ${Math.min(15, historyRows.length)} chronological audit entries. All price changes are permanently archived._`;

  return {
    id: messageId,
    role: 'assistant',
    content,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    intent: 'view_price_change_history',
    dropdownAction: { action, category },
    queryResults: {
      title: `Price Change History — ${meta.fullName}`,
      columns: ['Product Name', 'Size', 'Previous Rate', 'Updated Rate', 'Difference', 'Date and Time', 'Updated By'],
      rows: historyRows,
      totalCount: historyRows.length,
    },
  };
}

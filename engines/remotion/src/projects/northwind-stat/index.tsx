import { StatCardProps } from "../../templates/stat-card/StatCard";

// Demo numbers are fictional. In a real project every value here must be traceable to `asOf`.
export const props: StatCardProps = {
  name: "nwUSD",
  claim: "Stablecoin yield,\ndelivered on-chain.",
  description: "USDC deposits. Yield from market-neutral strategies.",
  value: 8.16,
  decimals: 2,
  suffix: "%",
  unit: "APR",
  asOf: "Sample figure · demo only",
  wall: ["AAA", "BTC", "ETH", "SOL", "USD", "EUR", "GLD", "SPX", "NDX", "OIL", "JPY", "GBP", "CHF", "BND", "TSY", "REIT", "CPI", "VIX", "DXY", "ARB", "OP", "AVAX"],
  partnersLabel: "Strategies across",
  partners: ["Venue A", "Venue B", "Venue C"],
};

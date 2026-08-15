export const SDGS = [
  "No Poverty",
  "Zero Hunger",
  "Good Health and Well-being",
  "Quality Education",
  "Gender Equality",
  "Clean Water and Sanitation",
  "Affordable and Clean Energy",
  "Decent Work and Economic Growth",
  "Industry, Innovation and Infrastructure",
  "Reduced Inequalities",
  "Sustainable Cities and Communities",
  "Responsible Consumption and Production",
  "Climate Action",
  "Life Below Water",
  "Life on Land",
  "Peace, Justice and Strong Institutions",
  "Partnerships for the Goals",
];
export const formatGhs = (amount: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(
    amount,
  );
export const sdgLabel = (sdg: number) =>
  `SDG ${sdg}: ${SDGS[sdg - 1] ?? "Other"}`;
export const progressPercent = (pledged: number, target: number) =>
  Math.min(100, Math.round((pledged / Math.max(target, 1)) * 100));

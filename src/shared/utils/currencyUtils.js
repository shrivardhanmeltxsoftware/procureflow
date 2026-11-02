const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const formatCurrency = (amount) => {
  if (
    amount === null ||
    amount === undefined ||
    (typeof amount === "string" && amount.trim() === "")
  ) {
    return "N/A";
  }

  const numericAmount = Number(amount);
  return Number.isFinite(numericAmount)
    ? INR_FORMATTER.format(numericAmount)
    : "N/A";
};

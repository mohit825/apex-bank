const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const dashboardDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

// Keep paise as bigint throughout; formatting via Number would lose precision.
export function formatPaise(amountPaise: bigint) {
  const rupees = amountPaise / BigInt(100);
  const paise = amountPaise % BigInt(100);

  return currencyFormatter
    .formatToParts(rupees)
    .map((part) =>
      part.type === "fraction" ? paise.toString().padStart(2, "0") : part.value,
    )
    .join("");
}

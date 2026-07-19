/** Detect language of free-form text. Supports English & Urdu (Arabic & Roman script). */
export function detectLanguage(text: string): "en" | "ur" {
  if (!text) return "en";
  // Arabic-script Urdu range
  if (/[\u0600-\u06FF]/.test(text)) return "ur";
  const romanUrdu = [
    "mera", "meri", "aap", "kya", "hai", "nahi", "haan", "main", "hum", "tum",
    "yeh", "woh", "kaise", "kyun", "kab", "kahan", "kuch", "sab", "bohot",
    "acha", "theek", "bilkul", "zaroor", "karta", "karti", "karna", "thi", "tha",
    "rahay", "chahiye", "samajh", "nahin", "phir", "lekin", "magar",
  ];
  const lower = ` ${text.toLowerCase()} `;
  let hits = 0;
  for (const w of romanUrdu) {
    if (lower.includes(` ${w} `)) hits++;
    if (hits >= 2) return "ur";
  }
  return "en";
}

export function languageLabel(l: "en" | "ur"): string {
  return l === "ur" ? "Urdu" : "English";
}

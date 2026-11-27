"use strict";
const translations = window.translations;
const localeCodes = {
  en: "en",
  fr: "fr",
  tw: "zh-Hant",
  ja: "ja",
  cn: "zh-Hans",
};
const aliases = {
  tw: "tw",
  cn: "cn",
  ja: "ja",
  en: "en",
  fr: "fr",
  "zh-tw": "tw",
  "zh-hant": "tw",
  "zh-hk": "tw",
  "zh-cn": "cn",
  "zh-hans": "cn",
  zh: "cn",
  jp: "ja",
};
const themeAliases = {
  d: "d",
  l: "l",
  s: "s",
  dark: "d",
  light: "l",
  system: "s",
};
const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Preferences still work without storage. */
  }
};
function normalizeLocale(value) {
  const v = (value || "").toLowerCase();
  return (
    aliases[v] ||
    (v.startsWith("zh-hant-") ||
    v.startsWith("zh-tw-") ||
    v.startsWith("zh-hk-")
      ? "tw"
      : v.startsWith("zh-")
        ? "cn"
        : v.startsWith("ja-")
          ? "ja"
          : v.startsWith("en-")
            ? "en"
            : v.startsWith("fr-")
              ? "fr"
              : null)
  );
}
const params = new URLSearchParams(location.search);
let locale =
  normalizeLocale(params.get("l")) ||
  normalizeLocale(read("pt-locale")) ||
  (navigator.languages || [navigator.language])
    .map(normalizeLocale)
    .find(Boolean) ||
  "en";
let theme =
  themeAliases[params.get("t")] || themeAliases[read("pt-theme")] || "s";
let activeProduct = 0;
const systemTheme = matchMedia("(prefers-color-scheme: dark)");
const products = [
  { price: 4.5, ys: [92, 40, 65, 115] },
  { price: 3.8, ys: [110, 95, 60, 35] },
  { price: 8.9, ys: [35, 85, 60, 100] },
];
const apple = "https://apps.apple.com/app/id6758859107";
const google =
  "https://play.google.com/store/apps/details?id=com.hung_studio.pricetracker";
const appleIcon =
  '<svg viewBox="0 0 24 28" aria-hidden="true"><path d="M18 14c0-3 2-4 3-5-2-3-5-3-6-2-2 1-3 1-5 0C6 5 2 9 2 14c0 5 3 11 6 11 2 0 2-1 4-1s3 1 4 1c3 0 5-5 6-7-2-1-4-2-4-4ZM16 1c0 3-2 5-5 5 0-3 2-5 5-5Z"/></svg>';
const googleIcon =
  '<svg viewBox="0 0 24 28" aria-hidden="true"><path d="M3 2v24l12-12L3 2Zm2-1 13 11 4-2L5 1Zm13 15L5 27l17-9-4-2Zm2-3-3 1 3 2 3-2-3-1Z"/></svg>';
function text(key) {
  return translations[locale][key] || translations.en[key];
}
function renderProduct() {
  const { price, ys } = products[activeProduct];
  document.getElementById("product").textContent = text(
    "product" + activeProduct,
  );
  document.getElementById("amount").textContent = new Intl.NumberFormat(
    localeCodes[locale],
    { style: "currency", currency: "USD", currencyDisplay: "code" },
  ).format(price);
  const d = ys
    .map((y, i) => (i ? "L" : "M") + [8, 125, 260, 390][i] + " " + y)
    .join("");
  document.getElementById("line").setAttribute("d", d);
  document.getElementById("area").setAttribute("d", d + "V145H8Z");
  document.getElementById("dot").setAttribute("cy", ys[3]);
  document
    .querySelectorAll("[data-item]")
    .forEach((b) =>
      b.setAttribute(
        "aria-pressed",
        String(Number(b.dataset.item) === activeProduct),
      ),
    );
}
function renderLocale() {
  document.documentElement.lang = localeCodes[locale];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.innerHTML = text(el.dataset.i18n);
  });
  document.title = text("title");
  document.querySelector('meta[name="description"]').content =
    text("description");
  document.querySelector("header nav").setAttribute("aria-label", text("nav"));
  document
    .querySelector(".footer-links")
    .setAttribute("aria-label", text("footerNav"));
  document.querySelector(".visual").setAttribute("aria-label", text("preview"));
  document.querySelector(".phone").alt = text("alt");
  document.querySelector(".chart").setAttribute("aria-label", text("chart"));
  document
    .querySelector(".switcher")
    .setAttribute("aria-label", text("choose"));
  document.querySelectorAll("[data-locale-select]").forEach((select) => {
    select.value = locale;
  });
  document.querySelectorAll("[data-stores]").forEach((el) => {
    el.innerHTML = `<a class="store" href="${apple}" aria-label="${text("appleLabel")}">${appleIcon}<span><small>${text("apple")}</small><strong>App Store</strong></span></a><a class="store" href="${google}" aria-label="${text("googleLabel")}">${googleIcon}<span><small>${text("google")}</small><strong>Google Play</strong></span></a>`;
  });
  renderProduct();
}
function renderTheme() {
  const dark = theme === "d" || (theme === "s" && systemTheme.matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.querySelector('meta[name="theme-color"]').content = dark
    ? "#101321"
    : "#ffffff";
  document.querySelectorAll("[data-theme-select]").forEach((select) => {
    select.value = theme;
  });
}
function updateUrl() {
  const url = new URL(location.href);
  url.searchParams.set("l", locale);
  url.searchParams.set("t", theme);
  history.replaceState(null, "", url);
}
document.querySelectorAll("[data-locale-select]").forEach((select) =>
  select.addEventListener("change", (event) => {
    locale = event.target.value;
    save("pt-locale", locale);
    renderLocale();
    updateUrl();
  }),
);
document.querySelectorAll("[data-theme-select]").forEach((select) =>
  select.addEventListener("change", (event) => {
    theme = event.target.value;
    save("pt-theme", theme);
    renderTheme();
    updateUrl();
  }),
);
systemTheme.addEventListener("change", () => {
  if (theme === "s") renderTheme();
});
window.addEventListener("popstate", () => {
  const q = new URLSearchParams(location.search);
  locale =
    normalizeLocale(q.get("l")) || normalizeLocale(read("pt-locale")) || "en";
  theme = themeAliases[q.get("t")] || themeAliases[read("pt-theme")] || "s";
  renderLocale();
  renderTheme();
});
document.querySelectorAll("[data-item]").forEach((button) =>
  button.addEventListener("click", () => {
    activeProduct = Number(button.dataset.item);
    renderProduct();
  }),
);
document.getElementById("year").textContent = new Date().getFullYear();
renderLocale();
renderTheme();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const navbar = document.querySelector(".navbar");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const backToTop = document.querySelector(".back-to-top");

const closeNavigation = () => {
  navbar.classList.remove("nav-open");
  document.body.classList.remove("nav-locked");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
};

menuToggle.addEventListener("click", () => {
  const opening = !navbar.classList.contains("nav-open");
  navbar.classList.toggle("nav-open", opening);
  document.body.classList.toggle("nav-locked", opening);
  menuToggle.setAttribute("aria-expanded", String(opening));
  menuToggle.setAttribute("aria-label", opening ? "Close navigation" : "Open navigation");
});

navigation.querySelectorAll("a").forEach(link => link.addEventListener("click", closeNavigation));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && navbar.classList.contains("nav-open")) {
    closeNavigation();
    menuToggle.focus();
  }
});

const updateScrollUI = () => {
  const scrolled = window.scrollY > 24;
  navbar.dataset.scrollState = scrolled ? "scrolled" : "top";
  backToTop.classList.toggle("is-visible", window.scrollY > 520);
};
window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();

const anchorLinks = [...navigation.querySelectorAll('a[href^="#"]')];
const sections = anchorLinks.map(link => document.querySelector(link.hash)).filter(Boolean);
const sectionObserver = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  anchorLinks.forEach(link => {
    const active = link.hash === `#${visible.target.id}`;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}, { rootMargin: "-28% 0px -55%", threshold: [0, .25, .5, .75] });
sections.forEach(section => sectionObserver.observe(section));

const revealGroups = [
  ["#about .eyebrow", "#about h2", ".about-card"],
  ["#skills .eyebrow", "#skills h2", ".tech-stack"],
  ["#projects .eyebrow", "#projects h2", ".projects-intro", ".project-card"],
  ["#certifications .eyebrow", "#certifications h2", ".certificate-card"],
  ["#contact .eyebrow", "#contact h2", ".contact-intro>p:not(.eyebrow)", ".contact-direct", ".message-form"],
  [".site-footer>div", ".site-footer>small"]
];

revealGroups.forEach(selectors => {
  let index = 0;
  selectors.forEach(selector => document.querySelectorAll(selector).forEach(element => {
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${Math.min(index * 85, 340)}ms`);
    index += 1;
  }));
});

const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) {
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  }
}), { threshold: .12, rootMargin: "0px 0px -7%" });
document.querySelectorAll(".reveal").forEach(element => reduceMotion ? element.classList.add("is-visible") : revealObserver.observe(element));

const heroSequence = [".photo-area", ".greeting", ".hero-copy h1", ".hero-copy h2", ".intro", ".actions", ".talk", ".overview article"];
let heroIndex = 0;
heroSequence.forEach(selector => document.querySelectorAll(selector).forEach(element => {
  element.classList.add("hero-enter");
  element.style.setProperty("--hero-delay", reduceMotion ? "0ms" : `${heroIndex * 95}ms`);
  heroIndex += 1;
}));

const projectContent = {
  healthcare: { title: "Healthcare Revenue Cycle Management", summary: "An executive and operational reporting model for accounts receivable, claims, denials, payer behaviour, and collection performance.", highlights: ["125K claims analysed", "$5.43M aged 120+ days", "Four report pages", "Three fact tables"], repo: "https://github.com/karanraichand/healthcare-revenue-cycle-dashboard" },
  recovery: { title: "Recovery & Collections Performance", summary: "An operations dashboard that joins account, consultant, strategy, activity, and settlement data for recovery leadership.", highlights: ["125K recovery activities", "30K accounts worked", "$665.48M accepted settlements", "Five report pages"], repo: "https://github.com/karanraichand/recovery-collections-performance-dashboard" },
  travel: { title: "Travel Commercial Yield Analytics", summary: "A commercial reporting model that connects bookings, margin, suppliers, routes, cancellations, and refunds from executive view to booking detail.", highlights: ["130K bookings", "$209.04M gross margin", "$132.71M refund exposure", "Eight source tables"], repo: "https://github.com/karanraichand/travel-commercial-yield-analytics" }
};

const projectDialog = document.createElement("dialog");
projectDialog.className = "project-dialog";
projectDialog.setAttribute("aria-labelledby", "project-dialog-title");
projectDialog.innerHTML = '<button class="dialog-close" aria-label="Close project details">×</button><p class="dialog-label">Case study</p><h2 id="project-dialog-title"></h2><p class="dialog-summary"></p><div class="dialog-highlights"></div><a class="dialog-link" target="_blank" rel="noreferrer">Explore on GitHub <span>↗</span></a>';
document.body.append(projectDialog);
let dialogTrigger = null;
const closeProjectDialog = () => projectDialog.close();

document.querySelectorAll(".project-details").forEach(button => button.addEventListener("click", () => {
  const project = projectContent[button.dataset.project];
  dialogTrigger = button;
  projectDialog.querySelector("#project-dialog-title").textContent = project.title;
  projectDialog.querySelector(".dialog-summary").textContent = project.summary;
  projectDialog.querySelector(".dialog-highlights").replaceChildren(...project.highlights.map(highlight => {
    const item = document.createElement("div");
    item.textContent = highlight;
    return item;
  }));
  projectDialog.querySelector(".dialog-link").href = project.repo;
  projectDialog.showModal();
}));

projectDialog.querySelector(".dialog-close").addEventListener("click", closeProjectDialog);
projectDialog.addEventListener("click", event => {
  const bounds = projectDialog.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) closeProjectDialog();
});
projectDialog.addEventListener("close", () => dialogTrigger?.focus());

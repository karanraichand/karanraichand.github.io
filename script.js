const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const navbar = document.querySelector(".navbar");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const backToTop = document.querySelector(".back-to-top");
const themeToggle = document.querySelector(".theme-toggle");

const updateThemeControl = () => {
  const dark = document.documentElement.dataset.theme === "dark";
  themeToggle.setAttribute("aria-pressed", String(dark));
  themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  themeToggle.title = dark ? "Switch to light mode" : "Switch to dark mode";
};

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.classList.add("theme-transition");
  if (nextTheme === "dark") document.documentElement.dataset.theme = "dark";
  else delete document.documentElement.dataset.theme;
  try { localStorage.setItem("portfolio-theme", nextTheme); } catch (error) {}
  updateThemeControl();
  window.setTimeout(() => document.documentElement.classList.remove("theme-transition"), 400);
});
updateThemeControl();

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
const anchorLinks = [...navigation.querySelectorAll('a[href^="#"]')];
const sections = anchorLinks.map(link => document.querySelector(link.hash)).filter(Boolean);

const updateActiveSection = () => {
  const marker = window.scrollY + navbar.offsetHeight + Math.min(window.innerHeight * .28, 220);
  let current = sections[0];
  sections.forEach(section => {
    if (section.offsetTop <= marker) current = section;
  });
  anchorLinks.forEach(link => {
    const active = current && link.hash === `#${current.id}`;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
};

let scrollFrame = 0;
const scheduleScrollUI = () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    updateScrollUI();
    updateActiveSection();
    scrollFrame = 0;
  });
};
window.addEventListener("scroll", scheduleScrollUI, { passive: true });
window.addEventListener("resize", scheduleScrollUI, { passive: true });
updateScrollUI();
updateActiveSection();

let pageScrollFrame = 0;
const easeOutQuint = value => 1 - Math.pow(1 - value, 5);
const scrollPageTo = target => {
  cancelAnimationFrame(pageScrollFrame);
  const start = window.scrollY;
  const destination = Math.max(0, target.getBoundingClientRect().top + start - navbar.offsetHeight);
  const distance = destination - start;
  if (reduceMotion || Math.abs(distance) < 2) {
    window.scrollTo(0, destination);
    return;
  }
  const duration = Math.min(720, Math.max(420, Math.abs(distance) * .22));
  const started = performance.now();
  const step = now => {
    const progress = Math.min(1, (now - started) / duration);
    window.scrollTo(0, start + distance * easeOutQuint(progress));
    if (progress < 1) pageScrollFrame = requestAnimationFrame(step);
    else pageScrollFrame = 0;
  };
  pageScrollFrame = requestAnimationFrame(step);
};

document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener("click", event => {
  const target = document.querySelector(link.hash);
  if (!target || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  closeNavigation();
  scrollPageTo(target);
  history.pushState(null, "", link.hash);
}));

["wheel", "touchstart"].forEach(type => window.addEventListener(type, () => {
  cancelAnimationFrame(pageScrollFrame);
}, { passive: true }));

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
  healthcare: {
    label: "Healthcare analytics",
    title: "Healthcare Revenue Cycle Management",
    summary: "An executive and operational reporting model for accounts receivable, claims, denials, payer performance, and collection activity.",
    highlights: [["125K", "Claims analysed"], ["$37.23M", "Accounts receivable"], ["7.25%", "Denial rate"], ["79.92%", "Net collection ratio"]],
    objective: "Revenue cycle leaders need to understand where cash is delayed, which balances are becoming harder to collect, and what is driving denials. This project connects those questions across executive and operational reporting.",
    coverage: ["Executive Command Center for headline exposure and performance", "AR Aging Intelligence for payer, specialty, region, and aging analysis", "Denial Management for root causes and financial impact", "Collection Performance for workload, recovery outcomes, and team results"],
    implementation: ["Import mode star schema with three fact tables and four shared dimensions", "Power Query preparation across seven CSV sources", "Reusable DAX measures for claims, balances, denials, aging, and collections", "Nine SQL scripts covering analysis, risk segmentation, and validation"],
    findings: ["Accounts receivable totals $37.23M across 125,000 claims", "$5.43M of the balance is aged beyond 120 days", "Coding is the largest denial category by financial impact", "Recovery coverage is separated from current receivables to protect metric interpretation"],
    tools: ["Power BI", "SQL", "DAX", "Power Query", "Data Modelling"],
    pages: [["Executive Command Center", "https://raw.githubusercontent.com/karanraichand/healthcare-revenue-cycle-dashboard/main/images/dashboard-executive.png"], ["AR Aging Intelligence", "https://raw.githubusercontent.com/karanraichand/healthcare-revenue-cycle-dashboard/main/images/dashboard-ar_aging_intelligence.png"], ["Denial Management", "https://raw.githubusercontent.com/karanraichand/healthcare-revenue-cycle-dashboard/main/images/dashboard-denials.png"], ["Collection Performance", "https://raw.githubusercontent.com/karanraichand/healthcare-revenue-cycle-dashboard/main/images/dashboard-collections.png"]],
    repo: "https://github.com/karanraichand/healthcare-revenue-cycle-dashboard"
  },
  recovery: {
    label: "Operations analytics",
    title: "Recovery and Collections Performance",
    summary: "A recovery operations model connecting portfolio exposure, consultant productivity, strategy effectiveness, settlement outcomes, and geographic risk.",
    highlights: [["$734.11M", "Portfolio balance"], ["125K", "Recovery activities"], ["43.08%", "Resolution rate"], ["$665.48M", "Accepted settlements"]],
    objective: "Recovery leaders need a reliable view of portfolio exposure, accounts worked, activity value, settlement conversion, and operational friction. The report supports intervention across portfolios, consultants, strategies, and states.",
    coverage: ["Portfolio Pulse for balance, coverage, and team performance", "Operations Floor for workload, outcomes, escalations, and reopened work", "Strategy Lab for value, volume, efficiency, and resolution", "Settlement Desk and Risk and Geography for offer performance and exposure"],
    implementation: ["Star schema with separate recovery activity and settlement fact tables", "Shared account, consultant, strategy, and date dimensions", "DAX measures preserve the meaning of portfolio, activity, and settlement values", "Nine SQL scripts cover business analysis and reconciliation checks"],
    findings: ["Legal Recovery carries the largest original balance", "High Value Outreach produces the highest average activity value", "Medium risk accounts carry the largest balance and escalation volume", "The worked account rate reaches 98.45% across the portfolio"],
    tools: ["Power BI", "SQL", "DAX", "Power Query", "Data Modelling"],
    pages: [["Portfolio Pulse", "https://raw.githubusercontent.com/karanraichand/recovery-collections-performance-dashboard/main/images/dashboard-portfolio-pulse.png"], ["Operations Floor", "https://raw.githubusercontent.com/karanraichand/recovery-collections-performance-dashboard/main/images/dashboard-operations-floor.png"], ["Strategy Lab", "https://raw.githubusercontent.com/karanraichand/recovery-collections-performance-dashboard/main/images/dashboard-strategy-lab.png"], ["Settlement Desk", "https://raw.githubusercontent.com/karanraichand/recovery-collections-performance-dashboard/main/images/dashboard-settlement-desk.png"], ["Risk and Geography", "https://raw.githubusercontent.com/karanraichand/recovery-collections-performance-dashboard/main/images/dashboard-risk-geography.png"]],
    repo: "https://github.com/karanraichand/recovery-collections-performance-dashboard"
  },
  travel: {
    label: "Commercial analytics",
    title: "Travel Commercial Yield Analytics",
    summary: "A commercial reporting model that connects booking value, margin, suppliers, routes, cancellations, refunds, and customer demand.",
    highlights: [["130K", "Bookings"], ["$1.10B", "Booking value"], ["$209.04M", "Gross margin"], ["$132.71M", "Refund exposure"]],
    objective: "Commercial teams need to know whether booking growth is producing profitable revenue and where cancellations or refunds are weakening performance. The model moves from an executive signal to booking level evidence.",
    coverage: ["Commercial Command Center for value, yield, and risk", "Commercial Explorer with selectable metrics and analytical lenses", "Booking Detail for record level investigation", "Custom tooltips provide supporting KPIs without crowding the main page"],
    implementation: ["Eight source tables organised into a dimensional model", "Dynamic DAX measures and field parameters for guided exploration", "Report page tooltips and intentional cross filtering", "Ten SQL scripts covering commercial performance and validation"],
    findings: ["Gross booking value totals $1.10B with an 18.95% gross margin", "Airlines contribute the highest net revenue by supplier type", "Customer change creates the greatest refund exposure", "Lead time and cancellation behaviour remain visible alongside yield"],
    tools: ["Power BI", "SQL", "DAX", "Field Parameters", "Data Modelling"],
    pages: [["Commercial Command Center", "https://raw.githubusercontent.com/karanraichand/travel-commercial-yield-analytics/main/images/commercial-command-center.png"], ["Commercial Explorer", "https://raw.githubusercontent.com/karanraichand/travel-commercial-yield-analytics/main/images/commercial-explorer.png"], ["Booking Detail", "https://raw.githubusercontent.com/karanraichand/travel-commercial-yield-analytics/main/images/booking-detail.png"]],
    repo: "https://github.com/karanraichand/travel-commercial-yield-analytics"
  },
  capacity: {
    label: "Databricks analytics",
    title: "Global Team and Vendor Capacity Control Tower",
    summary: "A Databricks solution for workforce capacity, operational demand, SLA risk, profitability, and vendor performance across a global services operation.",
    highlights: [["300K", "Request events"], ["77.89%", "Team utilization"], ["17.78%", "SLA breach rate"], ["$67.15M", "Revenue impact"]],
    objective: "Operations leaders need to see where delivery capacity is under pressure, which requests are creating service failures, and which vendors require intervention. The report brings these connected risks into one weekly management view.",
    coverage: ["Global Capacity Control Tower for operating signals and exceptions", "Workforce Capacity for utilization, profitability, and consultant performance", "Vendor Network for SLA compliance, response time, and intervention priorities", "Detailed queues connect executive signals to named consultants and vendors"],
    implementation: ["Managed Delta tables in the Databricks workspace", "Separate metric datasets protect the grain of three fact tables", "Python enrichment adds readable dimensions to request events", "Ten SQL scripts cover workforce, demand, vendor, risk, and validation analysis"],
    findings: ["Overall utilization is 77.89%, but capacity pressure is concentrated", "53,340 request events breached SLA", "Vendor SLA compliance averages 91.35% across 120 vendors", "Profitability remains below the benchmark across every vertical"],
    tools: ["Databricks", "Databricks SQL", "Delta Tables", "Python", "Data Validation"],
    pages: [["Global Capacity Control Tower", "https://raw.githubusercontent.com/karanraichand/global-team-vendor-capacity-analytics/main/images/global-capacity-control-tower.png"], ["Workforce Capacity", "https://raw.githubusercontent.com/karanraichand/global-team-vendor-capacity-analytics/main/images/workforce-capacity.png"], ["Vendor Network", "https://raw.githubusercontent.com/karanraichand/global-team-vendor-capacity-analytics/main/images/vendor-network.png"]],
    repo: "https://github.com/karanraichand/global-team-vendor-capacity-analytics"
  },
  enterprise: {
    label: "Executive business intelligence",
    title: "Enterprise BI Command Center",
    summary: "An executive reporting model that brings healthcare, recovery, travel, and operational performance into one consistent enterprise view.",
    highlights: [["$3.83B", "Enterprise value"], ["$451.82M", "Enterprise profit"], ["11.80%", "Enterprise margin"], ["77.90%", "Weighted utilization"]],
    objective: "Enterprise reporting becomes difficult when each function uses different datasets, calendars, and KPI definitions. This project creates a conformed view for comparing value, profit, margin, utilization, and commercial risk.",
    coverage: ["Enterprise Command Grid for headline financial and operating performance", "Performance Lab for guided analysis through selectable executive lenses", "Year and quarter controls support focused period review", "Conditional colour directs attention to value, performance, margin watch, and risk"],
    implementation: ["Conformed monthly fact layer with shared date and segment dimensions", "Dynamic DAX selection across revenue, profit, margin, and utilization", "Measure specific formatting keeps currencies and percentages readable", "Nine SQL scripts document KPI logic, diagnostics, and reconciliation"],
    findings: ["Enterprise value totals $3.83B across the reporting period", "Operations contributes the largest share of value", "March 2024 records the strongest enterprise margin", "The late period margin decline is retained as a management review point"],
    tools: ["Power BI", "SQL", "DAX", "Power Query", "KPI Design"],
    pages: [["Enterprise Command Grid", "https://raw.githubusercontent.com/karanraichand/enterprise-bi-command-center/main/images/enterprise-command-grid.png"], ["Performance Lab", "https://raw.githubusercontent.com/karanraichand/enterprise-bi-command-center/main/images/performance-lab.png"]],
    repo: "https://github.com/karanraichand/enterprise-bi-command-center"
  }
};

const githubIcon = '<svg class="github-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .7a11.3 11.3 0 0 0-3.57 22c.57.1.78-.25.78-.55v-2.17c-3.18.69-3.85-1.35-3.85-1.35-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.25 3.33.96.1-.74.4-1.25.73-1.54-2.54-.29-5.21-1.27-5.21-5.58 0-1.23.44-2.24 1.18-3.03-.12-.29-.51-1.45.11-2.99 0 0 .96-.31 3.11 1.16a10.8 10.8 0 0 1 5.68 0c2.16-1.47 3.11-1.16 3.11-1.16.62 1.54.23 2.7.11 2.99.74.79 1.18 1.8 1.18 3.03 0 4.32-2.68 5.28-5.23 5.57.41.36.78 1.05.78 2.12v3.15c0 .3.21.66.79.55A11.3 11.3 0 0 0 12 .7Z"/></svg>';
document.querySelectorAll(".project-actions a").forEach(link => {
  link.innerHTML = `${githubIcon}<span>GitHub Repo</span>`;
});
document.querySelectorAll(".project-details").forEach(button => {
  button.innerHTML = "View Details <span>→</span>";
});

const projectDialog = document.createElement("dialog");
projectDialog.className = "project-dialog";
projectDialog.setAttribute("aria-labelledby", "project-dialog-title");
projectDialog.innerHTML = '<div class="dialog-shell"><header class="dialog-header"><div><p class="dialog-label"></p><h2 id="project-dialog-title"></h2></div><button class="dialog-close" aria-label="Close project details">×</button></header><div class="dialog-body"><div class="dialog-loading" role="status">Loading the complete project details...</div><article class="dialog-readme" hidden></article><div class="dialog-fallback" hidden><p class="dialog-summary"></p><div class="dialog-highlights"></div><div class="dialog-section-grid"><section><h3>Business objective</h3><p class="dialog-objective"></p></section><section><h3>Dashboard coverage</h3><ul class="dialog-coverage"></ul></section><section><h3>Technical implementation</h3><ul class="dialog-implementation"></ul></section><section><h3>Key findings</h3><ul class="dialog-findings"></ul></section></div><div class="dialog-tools" aria-label="Tools used"></div></div></div></div>';
document.body.append(projectDialog);
let dialogTrigger = null;
const closeProjectDialog = () => projectDialog.close();
const fillList = (selector, values) => {
  projectDialog.querySelector(selector).replaceChildren(...values.map(value => {
    const item = document.createElement("li");
    item.textContent = value;
    return item;
  }));
};
const createProjectGallery = project => {
  const gallery = document.createElement("section");
  gallery.className = "dialog-gallery";
  gallery.setAttribute("aria-label", "Dashboard and report pages");
  const grid = document.createElement("div");
  grid.replaceChildren(...project.pages.map(([label, source]) => {
    const figure = document.createElement("figure");
    const link = document.createElement("a");
    link.href = source;
    link.target = "_blank";
    link.rel = "noreferrer";
    const image = document.createElement("img");
    image.src = source;
    image.alt = `${project.title}: ${label}`;
    image.loading = "lazy";
    const caption = document.createElement("figcaption");
    caption.textContent = label;
    link.append(image);
    figure.append(link, caption);
    return figure;
  }));
  gallery.append(grid);
  return gallery;
};
const projectReadmeCache = new Map();
let projectRequest = 0;
const prepareReadme = html => {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  parsed.querySelectorAll("script,style,iframe,object,embed,form,input,button").forEach(element => element.remove());
  parsed.querySelectorAll("*").forEach(element => {
    [...element.attributes].forEach(attribute => {
      if (attribute.name.startsWith("on")) element.removeAttribute(attribute.name);
    });
  });
  const article = parsed.querySelector("article") || parsed.body;
  const headings = [...article.querySelectorAll("h2, h3")];
  const contents = document.createElement("nav");
  contents.className = "dialog-toc";
  contents.setAttribute("aria-label", "Project contents");
  contents.innerHTML = "<h3>Project contents</h3><ol></ol>";
  headings.forEach((heading, index) => {
    const id = `project-section-${index + 1}`;
    heading.id = id;
    const item = document.createElement("li");
    item.className = heading.tagName === "H3" ? "is-subsection" : "";
    const link = document.createElement("a");
    link.href = `#${id}`;
    link.textContent = heading.textContent.trim();
    item.append(link);
    contents.querySelector("ol").append(item);
  });
  article.querySelectorAll("a").forEach(link => {
    if (!link.getAttribute("href")?.startsWith("#")) {
      link.target = "_blank";
      link.rel = "noreferrer";
    }
  });
  article.querySelectorAll("img").forEach(image => {
    image.loading = "lazy";
    image.decoding = "async";
  });
  const wrapper = document.createElement("div");
  wrapper.append(...article.childNodes);
  const firstSection = wrapper.querySelector("h2");
  if (firstSection) firstSection.before(contents);
  else wrapper.prepend(contents);
  return wrapper.innerHTML;
};
const loadProjectReadme = async (project, requestId) => {
  const readme = projectDialog.querySelector(".dialog-readme");
  const loading = projectDialog.querySelector(".dialog-loading");
  const fallback = projectDialog.querySelector(".dialog-fallback");
  try {
    let html = projectReadmeCache.get(project.repo);
    if (!html) {
      const endpoint = `${project.repo.replace("https://github.com/", "https://api.github.com/repos/")}/readme`;
      const response = await fetch(endpoint, { headers: { Accept: "application/vnd.github.html+json" } });
      if (!response.ok) throw new Error("Project details unavailable");
      html = prepareReadme(await response.text());
      projectReadmeCache.set(project.repo, html);
    }
    if (requestId !== projectRequest) return;
    readme.innerHTML = html;
    readme.querySelectorAll("img").forEach(image => {
      const link = image.closest("a");
      image.remove();
      if (link && !link.textContent.trim() && !link.querySelector("img")) link.remove();
    });
    const sectionHeadings = [...readme.querySelectorAll("h2")];
    sectionHeadings.filter(heading => /dashboard\s+pages?/i.test(heading.textContent)).forEach(heading => {
      let node = heading;
      while (node) {
        const next = node.nextSibling;
        node.remove();
        if (next?.nodeType === 1 && next.matches("h2")) break;
        node = next;
      }
    });
    readme.querySelectorAll(".dialog-toc li").forEach(item => {
      if (/dashboard\s+pages?/i.test(item.textContent)) item.remove();
    });
    const previewHeading = [...readme.querySelectorAll("h2")].find(heading => /dashboard.*preview/i.test(heading.textContent));
    const gallery = createProjectGallery(project);
    if (previewHeading) {
      let sibling = previewHeading.nextSibling;
      while (sibling && !(sibling.nodeType === 1 && sibling.matches("h2"))) {
        const next = sibling.nextSibling;
        sibling.remove();
        sibling = next;
      }
      previewHeading.after(gallery);
    } else {
      const firstSection = readme.querySelector("h2");
      if (firstSection) firstSection.before(gallery);
      else readme.append(gallery);
    }
    readme.hidden = false;
    fallback.hidden = true;
  } catch (error) {
    if (requestId !== projectRequest) return;
    readme.hidden = true;
    fallback.before(createProjectGallery(project));
    fallback.hidden = false;
  } finally {
    if (requestId === projectRequest) loading.hidden = true;
  }
};

document.querySelector("#projects").addEventListener("click", event => {
  const button = event.target.closest(".project-details");
  if (!button) return;
  const project = projectContent[button.dataset.project];
  dialogTrigger = button;
  projectDialog.querySelector(".dialog-label").textContent = project.label;
  projectDialog.querySelector("#project-dialog-title").textContent = project.title;
  projectDialog.querySelector(".dialog-summary").textContent = project.summary;
  projectDialog.querySelector(".dialog-objective").textContent = project.objective;
  projectDialog.querySelector(".dialog-highlights").replaceChildren(...project.highlights.map(([value, label]) => {
    const item = document.createElement("div");
    item.innerHTML = `<strong>${value}</strong><span>${label}</span>`;
    return item;
  }));
  fillList(".dialog-coverage", project.coverage);
  fillList(".dialog-implementation", project.implementation);
  fillList(".dialog-findings", project.findings);
  projectDialog.querySelector(".dialog-tools").replaceChildren(...project.tools.map(tool => {
    const item = document.createElement("span");
    item.textContent = tool;
    return item;
  }));
  projectDialog.querySelectorAll(".dialog-gallery").forEach(gallery => gallery.remove());
  const requestId = ++projectRequest;
  projectDialog.querySelector(".dialog-loading").hidden = false;
  projectDialog.querySelector(".dialog-readme").hidden = true;
  projectDialog.querySelector(".dialog-fallback").hidden = true;
  projectDialog.showModal();
  projectDialog.querySelector(".dialog-body").scrollTop = 0;
  document.body.classList.add("dialog-open");
  loadProjectReadme(project, requestId);
});

projectDialog.querySelector(".dialog-close").addEventListener("click", closeProjectDialog);
projectDialog.addEventListener("click", event => {
  const bounds = projectDialog.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) closeProjectDialog();
});
projectDialog.addEventListener("close", () => {
  projectRequest += 1;
  document.body.classList.remove("dialog-open");
  dialogTrigger?.focus();
});
projectDialog.addEventListener("click", event => {
  const link = event.target.closest('.dialog-toc a[href^="#"]');
  if (!link) return;
  event.preventDefault();
  projectDialog.querySelector(link.getAttribute("href"))?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
});

const resumeDialog = document.querySelector(".resume-dialog");
const resumeFrame = resumeDialog.querySelector("iframe");
let resumeTrigger = null;
const closeResumeDialog = () => resumeDialog.close();
document.querySelectorAll(".resume-trigger").forEach(link => link.addEventListener("click", event => {
  event.preventDefault();
  closeNavigation();
  resumeTrigger = link;
  if (!resumeFrame.getAttribute("src")) resumeFrame.src = resumeFrame.dataset.src;
  resumeDialog.showModal();
  document.body.classList.add("dialog-open");
}));
resumeDialog.querySelector(".resume-dialog-close").addEventListener("click", closeResumeDialog);
resumeDialog.addEventListener("click", event => {
  const bounds = resumeDialog.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) closeResumeDialog();
});
resumeDialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
  resumeTrigger?.focus();
});

const createInfiniteCarousel = ({ viewportSelector, trackSelector, prevSelector, nextSelector, itemSelector }) => {
  const viewport = document.querySelector(viewportSelector);
  const track = document.querySelector(trackSelector);
  const prev = document.querySelector(prevSelector);
  const next = document.querySelector(nextSelector);
  if (!viewport || !track || !prev || !next) return;

  const originals = [...track.querySelectorAll(`:scope > ${itemSelector}`)];
  if (originals.length < 2) return;
  const cloneSet = () => originals.map(item => {
    const clone = item.cloneNode(true);
    clone.dataset.carouselClone = "true";
    clone.classList.remove("reveal");
    clone.classList.add("is-visible");
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("a, button, input, textarea, select, [tabindex]").forEach(control => control.setAttribute("tabindex", "-1"));
    return clone;
  });
  const leadingClones = cloneSet();
  const trailingClones = cloneSet();
  track.prepend(...leadingClones);
  track.append(...trailingClones);

  const positionOf = item => item.offsetLeft - track.offsetLeft;
  const jumpTo = item => {
    const inlineBehavior = viewport.style.scrollBehavior;
    viewport.style.scrollBehavior = "auto";
    viewport.scrollLeft = positionOf(item);
    viewport.style.scrollBehavior = inlineBehavior;
  };
  let currentIndex = 0;
  let carouselFrame = 0;
  let settleTimer = 0;
  const stopCarousel = () => {
    cancelAnimationFrame(carouselFrame);
    carouselFrame = 0;
  };
  const centre = () => {
    jumpTo(originals[currentIndex]);
  };
  const animateTo = (left, done) => {
    stopCarousel();
    const start = viewport.scrollLeft;
    const distance = left - start;
    if (reduceMotion || Math.abs(distance) < 2) {
      viewport.scrollLeft = left;
      done?.();
      return;
    }
    const started = performance.now();
    const duration = 460;
    const step = now => {
      const progress = Math.min(1, (now - started) / duration);
      viewport.scrollLeft = start + distance * easeOutQuint(progress);
      if (progress < 1) carouselFrame = requestAnimationFrame(step);
      else {
        carouselFrame = 0;
        done?.();
      }
    };
    carouselFrame = requestAnimationFrame(step);
  };
  const move = direction => {
    stopCarousel();
    if (direction > 0 && currentIndex === originals.length - 1) {
      animateTo(positionOf(trailingClones[0]), () => {
        currentIndex = 0;
        jumpTo(originals[0]);
      });
      return;
    }
    if (direction < 0 && currentIndex === 0) {
      animateTo(positionOf(leadingClones[leadingClones.length - 1]), () => {
        currentIndex = originals.length - 1;
        jumpTo(originals[currentIndex]);
      });
      return;
    }
    currentIndex += direction;
    animateTo(positionOf(originals[currentIndex]));
  };

  const syncAfterManualScroll = () => {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => {
      if (carouselFrame) return;
      const left = viewport.scrollLeft;
      let closestIndex = 0;
      let closestDistance = Infinity;
      originals.forEach((item, index) => {
        const distance = Math.abs(positionOf(item) - left);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      currentIndex = closestIndex;
    }, 120);
  };

  requestAnimationFrame(() => requestAnimationFrame(centre));
  window.addEventListener("load", centre, { once: true });
  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(centre, 120);
  }, { passive: true });
  viewport.addEventListener("scroll", syncAfterManualScroll, { passive: true });
  viewport.addEventListener("pointerdown", stopCarousel, { passive: true });
  prev.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  viewport.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
    }
  });
};

const certificationTrack = document.querySelector(".certification-grid");
certificationTrack?.insertAdjacentHTML("beforeend", '<a class="certificate-card" href="Claude-101-Certificate.png" target="_blank" rel="noreferrer"><div class="certificate-preview"><img src="Claude-101-Certificate.png" alt="Claude 101 course completion badge"><span>View certificate</span></div><div class="certificate-copy"><span>Claude Academy</span><h3>Claude 101</h3><p>Course Completion Badge · Sep 2026</p></div></a>');

const certificationOrder = [
  "Microsoft-Power-BI-Data-Analyst-Certificate.pdf",
  "Databricks-Fundamentals-Accreditation.pdf",
  "Citi-Markets-Quantitative-Analysis-Certificate.pdf",
  "Excel-Skills-for-Business-Certificate.pdf",
  "Claude-101-Certificate.png",
  "Tata-Data-Visualisation-Certificate.pdf",
  "Google-AI-Professional-Certificate.pdf",
  "Quantium-Data-Analytics-Certificate.pdf",
  "Google-Project-Management-Certificate.pdf",
  "Deloitte-Data-Analytics-Certificate.pdf"
];

certificationOrder.forEach((href) => {
  const card = certificationTrack?.querySelector(`.certificate-card[href="${href}"]`);
  if (card) certificationTrack.append(card);
});

const certificateDialog = document.querySelector(".certificate-dialog");
const certificateSkills = {
  "Microsoft-Power-BI-Data-Analyst-Certificate.pdf": ["Power BI", "DAX", "Power Query", "Data Modelling"],
  "Databricks-Fundamentals-Accreditation.pdf": ["Databricks", "Lakehouse", "Delta Lake"],
  "Citi-Markets-Quantitative-Analysis-Certificate.pdf": ["Quantitative Analysis", "Python", "Risk Modelling"],
  "Excel-Skills-for-Business-Certificate.pdf": ["Microsoft Excel", "Data Analysis", "Dashboards"],
  "Claude-101-Certificate.png": ["Claude", "Generative AI", "Responsible AI"],
  "Tata-Data-Visualisation-Certificate.pdf": ["Data Visualisation", "Business Storytelling", "Executive Reporting"],
  "Google-AI-Professional-Certificate.pdf": ["Generative AI", "Prompting", "Responsible AI"],
  "Quantium-Data-Analytics-Certificate.pdf": ["Data Analytics", "Data Preparation", "Commercial Analysis"],
  "Google-Project-Management-Certificate.pdf": ["Project Planning", "Stakeholder Management", "Agile"],
  "Deloitte-Data-Analytics-Certificate.pdf": ["Data Analytics", "Data Visualisation", "Business Analysis"]
};
let certificateTrigger = null;
const closeCertificateDialog = () => certificateDialog.close();
certificationTrack?.addEventListener("click", event => {
  const card = event.target.closest(".certificate-card");
  if (!card) return;
  event.preventDefault();
  certificateTrigger = card;
  const image = card.querySelector(".certificate-preview img");
  const metadata = card.querySelector(".certificate-copy p").textContent.split("·").map(value => value.trim());
  certificateDialog.querySelector(".certificate-dialog-image").src = image.src;
  certificateDialog.querySelector(".certificate-dialog-image").alt = image.alt;
  certificateDialog.querySelector(".certificate-dialog-issuer").textContent = card.querySelector(".certificate-copy > span").textContent;
  certificateDialog.querySelector(".certificate-dialog-title").textContent = card.querySelector("h3").textContent;
  certificateDialog.querySelector(".certificate-dialog-type").textContent = metadata[0] || "Verified credential";
  certificateDialog.querySelector(".certificate-dialog-date").textContent = metadata[1] || "";
  certificateDialog.querySelector(".certificate-dialog-skills").replaceChildren(...(certificateSkills[card.getAttribute("href")] || []).map(skill => {
    const tag = document.createElement("span");
    tag.textContent = skill;
    return tag;
  }));
  certificateDialog.showModal();
  document.body.classList.add("dialog-open");
});
certificateDialog.querySelector(".certificate-dialog-close").addEventListener("click", closeCertificateDialog);
certificateDialog.addEventListener("click", event => {
  const bounds = certificateDialog.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) closeCertificateDialog();
});
certificateDialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
  certificateTrigger?.focus();
});
document.querySelectorAll(".certificate-card").forEach(card => {
  card.removeAttribute("target");
  card.removeAttribute("rel");
  card.setAttribute("role", "button");
  card.setAttribute("aria-haspopup", "dialog");
});

createInfiniteCarousel({ viewportSelector: ".certification-viewport", trackSelector: ".certification-grid", prevSelector: ".certificate-prev:not(.project-prev)", nextSelector: ".certificate-next:not(.project-next)", itemSelector: ".certificate-card" });
createInfiniteCarousel({ viewportSelector: ".project-viewport", trackSelector: ".project-grid", prevSelector: ".project-prev", nextSelector: ".project-next", itemSelector: ".project-card" });

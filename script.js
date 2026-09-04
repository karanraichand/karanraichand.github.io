document.querySelectorAll(".project-visual img").forEach(image => { image.src = image.getAttribute("src").split("/").pop(); });
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
const closeProjectDialog = () => projectDialog.close();
document.querySelectorAll(".project-details").forEach(button => button.addEventListener("click", () => {
  const project = projectContent[button.dataset.project];
  projectDialog.querySelector("#project-dialog-title").textContent = project.title;
  projectDialog.querySelector(".dialog-summary").textContent = project.summary;
  projectDialog.querySelector(".dialog-highlights").replaceChildren(...project.highlights.map(highlight => { const item = document.createElement("div"); item.textContent = highlight; return item; }));
  projectDialog.querySelector(".dialog-link").href = project.repo;
  projectDialog.showModal();
}));
projectDialog.querySelector(".dialog-close").addEventListener("click", closeProjectDialog);
projectDialog.addEventListener("click", event => { if (event.target === projectDialog) closeProjectDialog(); });
const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: 0.16 });
document.querySelectorAll(".reveal").forEach(card => observer.observe(card));

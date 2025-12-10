const modal = document.getElementById("projectModal");
const modalTitle = document.getElementById("modal-title");
const modalPeriod = document.getElementById("modal-period");
const modalRole = document.getElementById("modal-role");
const modalStack = document.getElementById("modal-stack");
const modalSummary = document.getElementById("modal-summary");
const modalImpact = document.getElementById("modal-impact");
const yearTag = document.getElementById("year");
const cards = document.querySelectorAll(".portfolio-card");
const closeTriggers = document.querySelectorAll("[data-modal-close]");
const fileTabs = document.querySelectorAll(".file-tab");

const formatText = (label, value) => `${label}: ${value}`;

const openModal = (data) => {
  if (!data) return;
  modalTitle.textContent = data.title;
  modalPeriod.textContent = data.period;
  modalRole.textContent = formatText("Role", data.role);
  modalStack.textContent = formatText("Stack", data.stack);
  modalSummary.textContent = data.summary;
  modalImpact.innerHTML = "";
  if (Array.isArray(data.impact)) {
    data.impact.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      modalImpact.appendChild(li);
    });
  }
  modal.classList.add("is-visible");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

const closeModal = () => {
  modal.classList.remove("is-visible");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

cards.forEach((card) => {
  card.tabIndex = 0;
  const data = (() => {
    try {
      return JSON.parse(card.dataset.project || "{}");
    } catch (error) {
      console.warn("Failed to parse project data", error);
      return null;
    }
  })();

  card.addEventListener("click", () => openModal(data));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openModal(data);
    }
  });
});

closeTriggers.forEach((trigger) =>
  trigger.addEventListener("click", () => closeModal())
);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-visible")) {
    closeModal();
  }
});

if (yearTag) {
  yearTag.textContent = new Date().getFullYear();
}

const setActiveLink = (hash) => {
  fileTabs.forEach((tab) => {
    if (tab.getAttribute("href") === hash) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });
};

const sections = document.querySelectorAll(".page-section");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      setActiveLink(`#${entry.target.getAttribute("id")}`);
    });
  },
  { threshold: 0.5 }
);

sections.forEach((section) => observer.observe(section));

setActiveLink(window.location.hash || "#intro");

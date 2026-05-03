let isAdding = false;
let timeout;

function removeReleasesButton() {
  document.getElementById("gh-releases-warning")?.remove();
}

async function addReleasesButton() {
  // Avoid adding during adding process in async
  if (isAdding) return;

  isAdding = true;
  try {
    // Get repo path early — no point finding the container if URL is wrong
    const pathParts = window.location.pathname.split("/").filter(Boolean);

    // Remove button if we're not on a top-level repo page
    if (pathParts.length !== 2) {
      removeReleasesButton();
      return;
    }

    // Avoid duplicates
    if (document.getElementById("gh-releases-btn")) return;

    // Check it's actually a repo page
    const isRepo = document.querySelector(
      'meta[name="octolytics-dimension-repository_id"]',
    );
    if (!isRepo) return;

    // Check releases exist
    // when there is at least one release; the link itself exists either way
    const releasesCounter = document.querySelector(
      `a[href="/${pathParts[0]}/${pathParts[1]}/releases"] .Counter`,
    );
    if (!releasesCounter) return; // link exists but no releases, or no link at all

    // Try to find GitHub repo action bar
    const container =
      document.querySelector(".file-navigation") ||
      document.querySelector("header");

    if (!container) return;

    const repoPath = `/${pathParts[0]}/${pathParts[1]}`;
    const releasesUrl = `${repoPath}/releases`;

    // Warning
    const warning = document.createElement("div");
    warning.id = "gh-releases-warning";
    warning.style.display = "flex";
    warning.style.alignItems = "baseline";
    warning.style.justifyContent = "center";
    warning.style.gap = "12px";
    warning.style.padding = "8px 0";

    const p = document.createElement("p");
    p.textContent =
      "Read the readme before downloading for further instructions! ";
    p.style.textAlign = "center";

    // Link to readme
    const a = document.createElement("a");
    a.href = repoPath + `#readme`;
    a.textContent = "View Readme";

    // Create button
    const btn = document.createElement("a");
    btn.id = "gh-releases-btn";
    btn.href = releasesUrl;
    btn.textContent = "Download Release";
    btn.rel = "noopener noreferrer";

    // Style
    btn.style.padding = "12px 12px";
    btn.style.background = "#2da44e";
    btn.style.color = "white";
    btn.style.borderRadius = "6px";
    btn.style.textDecoration = "none";
    btn.style.fontSize = "1rem";
    btn.style.textAlign = "center";
    btn.style.whiteSpace = "nowrap";

    p.appendChild(a);
    warning.appendChild(p);
    warning.appendChild(btn);

    container.insertAdjacentElement("afterend", warning);
  } finally {
    isAdding = false;
  }
}

// Handle GitHub's Turbo navigation ,fires on every soft page transition
document.addEventListener("turbo:load", () => {
  clearTimeout(timeout);
  timeout = setTimeout(addReleasesButton, 300);
});

// Fallback observer for non-Turbo navigation
const observer = new MutationObserver(() => {
  clearTimeout(timeout);
  timeout = setTimeout(async () => {
    observer.disconnect();
    await addReleasesButton();
    observer.observe(document.querySelector("main") || document.body, {
      childList: true,
      subtree: true,
    });
  }, 300);
});

observer.observe(document.querySelector("main") || document.body, {
  childList: true,
  subtree: true,
});

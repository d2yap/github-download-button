let isAdding = false;
let timeout;

async function addReleasesButton() {
  // Avoid duplicates
  if (document.getElementById("gh-releases-btn")) return;
  // Avoid adding during adding process in async
  if (isAdding) return;

  isAdding = true;
  try {
    // Try to find GitHub repo action bar
    const container =
      document.querySelector(".file-navigation") ||
      document.querySelector("header");

    if (!container) return;

    // Get repo path
    const pathParts = window.location.pathname.split("/").filter(Boolean);

    if (pathParts.length < 2) return; // not a repo page
    if (pathParts.length > 2) return; // not the main repo page
    if (pathParts[pathParts.length - 1] === "releases") return; // already on releases page

    // Check if page is a repo or not by fetching the release
    const res = await fetch(
      `https://api.github.com/repos/${pathParts[0]}/${pathParts[1]}/releases`,
    );
    const releases = await res.json();

    // No releases
    if (releases.length === 0) {
      return;
    }

    // No repo
    if (res.status == 404) {
      return;
    } // repo not found

    const repoPath = `/${pathParts[0]}/${pathParts[1]}`;
    const releasesUrl = `${repoPath}/releases`;

    // Warning
    const warning = document.createElement("div");
    const p = document.createElement("p");
    p.textContent =
      "Read the readme before downloading for further instructions! ";
    p.style.textAlign = "center";

    // Link to readme
    const a = document.createElement("a");
    a.href = repoPath + `#readme`;
    a.textContent = "View Readme";

    p.appendChild(a);
    warning.appendChild(p);

    // Create button
    const btn = document.createElement("a");
    btn.id = "gh-releases-btn";
    btn.href = releasesUrl;
    btn.textContent = "Download Release";
    btn.target = "_blank";

    // Style
    btn.style.marginLeft = "15%";
    btn.style.marginRight = "15%";
    btn.style.marginTop = "2%";
    btn.style.marginBottom = "2%";
    btn.style.padding = "12px 12px";
    btn.style.background = "#2da44e";
    btn.style.color = "white";
    btn.style.borderRadius = "6px";
    btn.style.textDecoration = "none";
    btn.style.fontSize = "5rem";
    btn.style.textAlign = "center";

    container.appendChild(btn);
    container.appendChild(warning);
  } finally {
    isAdding = false;
  }
}

// Run on load
window.addEventListener("load", () => {
  setTimeout(addReleasesButton, 800);
});

// Handle GitHub page navigation
const observer = new MutationObserver(() => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    addReleasesButton();
  }, 300);
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

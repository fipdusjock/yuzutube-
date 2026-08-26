function initSearchSuggest() {
  const input = document.getElementById("searchInput");
  const box = document.getElementById("searchSuggest");
  const form = document.getElementById("searchForm");
  if (!input || !box || !form) return;

  let debounceTimer = null;
  let items = [];
  let activeIndex = -1;

  function render() {
    if (!items.length) {
      box.hidden = true;
      box.innerHTML = "";
      return;
    }
    box.innerHTML = items.map((s, i) =>
      `<div class="suggest-item ${i === activeIndex ? "active" : ""}" data-index="${i}">${escapeHtml(s)}</div>`
    ).join("");
    box.hidden = false;
    box.querySelectorAll(".suggest-item").forEach((el) => {
      el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        input.value = items[Number(el.dataset.index)];
        box.hidden = true;
        goSearch(input.value.trim());
      });
    });
  }

  function goSearch(query) {
    if (!query) return;
    window.location.href = `/results?q=${encodeURIComponent(query)}`;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    goSearch(input.value.trim());
  });

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim();
    activeIndex = -1;
    if (!q) {
      items = [];
      render();
      return;
    }
    debounceTimer = setTimeout(async () => {
      try {
        const data = await fetchJSON(`/proxy/suggest?q=${encodeURIComponent(q)}`);
        items = data.suggestions || [];
        render();
      } catch (e) {
        items = [];
        render();
      }
    }, 200);
  });

  input.addEventListener("keydown", (e) => {
    if (box.hidden || !items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      render();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, -1);
      render();
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      input.value = items[activeIndex];
      box.hidden = true;
      goSearch(input.value.trim());
    } else if (e.key === "Escape") {
      box.hidden = true;
    }
  });

  input.addEventListener("blur", () => {
    setTimeout(() => { box.hidden = true; }, 150);
  });
  input.addEventListener("focus", () => {
    if (items.length) box.hidden = false;
  });
}

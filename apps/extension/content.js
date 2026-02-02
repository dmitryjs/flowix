function getSelector(element) {
  const htmlElement = element;
  if (htmlElement.id) {
    return `#${cssEscape(htmlElement.id)}`;
  }

  const name = htmlElement.getAttribute("name");
  if (name) {
    return `${htmlElement.tagName.toLowerCase()}[name="${cssEscape(name)}"]`;
  }

  const dataTestId = htmlElement.getAttribute("data-testid");
  if (dataTestId) {
    return `${htmlElement.tagName.toLowerCase()}[data-testid="${cssEscape(dataTestId)}"]`;
  }

  return buildDomPath(htmlElement);
}

function buildDomPath(element) {
  const parts = [];
  let current = element;

  while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 5) {
    const tag = current.tagName.toLowerCase();
    const parent = current.parentElement;
    if (!parent) {
      parts.unshift(tag);
      break;
    }

    const siblings = Array.from(parent.children).filter(
      (child) => child.tagName.toLowerCase() === tag
    );
    if (siblings.length > 1) {
      const index = siblings.indexOf(current) + 1;
      parts.unshift(`${tag}:nth-of-type(${index})`);
    } else {
      parts.unshift(tag);
    }
    current = parent;
  }

  return parts.join(" > ");
}

function cssEscape(value) {
  return value.replace(/["\\]/g, "\\$&");
}

function getBBox(element) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.x + window.scrollX,
    y: rect.y + window.scrollY,
    w: rect.width,
    h: rect.height,
  };
}

let mode = null;
const MODE_KEY = "flowix_mode";

chrome.storage.local.get(MODE_KEY, (result) => {
  const stored = result?.[MODE_KEY];
  if (stored === "auto" || stored === "manual") {
    mode = stored;
  } else {
    chrome.storage.local.set({ [MODE_KEY]: "auto" }, () => {
      mode = "auto";
    });
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes[MODE_KEY]) {
    const next = changes[MODE_KEY].newValue;
    if (next === "auto" || next === "manual") {
      mode = next;
    }
  }
});

function handleClick(event) {
  const target = event.target;
  if (!target) return;
  if (mode !== "auto") return;

  const selector = getSelector(target);
  const bbox = getBBox(target);

  const message = {
    type: "record_click",
    payload: {
      id: crypto.randomUUID(),
      ts: Date.now(),
      type: "click",
      url: window.location.href,
      target: {
        selector,
        bbox,
      },
    },
  };

  chrome.runtime.sendMessage(message);
}

document.addEventListener("click", handleClick, true);

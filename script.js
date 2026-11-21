const screens = [...document.querySelectorAll('.screen')];
let typingRun = 0;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function collectTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.nodeValue.trim()
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

async function typeScreen(screen, runId) {
  const buttons = [...screen.querySelectorAll('button')];
  buttons.forEach(button => {
    button.disabled = true;
    button.classList.remove('is-ready');
  });

  // Keep the original text, then reveal it character by character.
  const textNodes = collectTextNodes(screen);
  const entries = textNodes.map(node => ({
    node,
    fullText: node.nodeValue,
    parent: node.parentElement
  }));

  entries.forEach(({ node }) => { node.nodeValue = ''; });

  for (const entry of entries) {
    if (runId !== typingRun) return;

    const { node, fullText, parent } = entry;
    if (parent) parent.classList.add('typewriter-cursor');

    for (const character of fullText) {
      if (runId !== typingRun) return;
      node.nodeValue += character;
      // Slightly quicker for spaces, natural for Arabic and mobile screens.
      await sleep(character.trim() ? 125 : 75);
    }

    if (parent) parent.classList.remove('typewriter-cursor');
    await sleep(500);
  }

  if (runId === typingRun) {
    // Reveal the button only after all text on this screen is fully typed.
    buttons.forEach(button => {
      button.disabled = false;
      button.classList.add('is-ready');
    });
  }
}

function showScreen(id) {
  typingRun++;
  const runId = typingRun;
  screens.forEach(screen => screen.classList.toggle('active', screen.id === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const screen = document.getElementById(id);
  if (screen) typeScreen(screen, runId);
}

document.querySelectorAll('[data-next]').forEach(button => {
  button.addEventListener('click', () => showScreen(button.dataset.next));
});

document.getElementById('restart').addEventListener('click', () => showScreen('welcome'));

// Initialize the welcome page through the same screen transition used by every
// later page, so its text is also cleared and typed letter by letter on first load.
function startWelcomeScreen() {
  const firstScreen = document.getElementById('welcome') || document.querySelector('.screen');
  if (!firstScreen) return;

  typingRun++;
  const runId = typingRun;
  screens.forEach(screen => screen.classList.toggle('active', screen === firstScreen));
  typeScreen(firstScreen, runId);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startWelcomeScreen, { once: true });
} else {
  startWelcomeScreen();
}

const screens = [...document.querySelectorAll('.screen')];
let typingRun = 0;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function collectTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      // Do not type button labels. Buttons appear only after all other text.
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if (node.parentElement?.closest('button')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

async function typeScreen(screen, runId) {
  const buttons = [...screen.querySelectorAll('button')];

  // Hide and disable buttons until all non-button text is complete.
  buttons.forEach(button => {
    button.disabled = true;
    button.classList.remove('is-ready');
  });

  const entries = collectTextNodes(screen).map(node => ({
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
      await sleep(character.trim() ? 125 : 75);
    }

    if (parent) parent.classList.remove('typewriter-cursor');
    await sleep(500);
  }

  if (runId !== typingRun) return;

  // Show the button only after every heading, paragraph, and label is typed.
  buttons.forEach(button => {
    button.disabled = false;
    button.classList.add('is-ready');
  });
}

function showScreen(id) {
  typingRun++;
  const runId = typingRun;

  screens.forEach(screen => {
    screen.classList.toggle('active', screen.id === id);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  const screen = document.getElementById(id);
  if (screen) typeScreen(screen, runId);
}

document.querySelectorAll('[data-next]').forEach(button => {
  button.addEventListener('click', () => showScreen(button.dataset.next));
});

const restartButton = document.getElementById('restart');
if (restartButton) {
  restartButton.addEventListener('click', () => showScreen('welcome'));
}

// Run the welcome page through exactly the same animation as every next page.
function startWelcomeScreen() {
  const welcome = document.getElementById('welcome') || screens[0];
  if (!welcome) return;

  typingRun++;
  const runId = typingRun;
  screens.forEach(screen => screen.classList.toggle('active', screen === welcome));
  typeScreen(welcome, runId);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startWelcomeScreen, { once: true });
} else {
  startWelcomeScreen();
}

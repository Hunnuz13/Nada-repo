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
  buttons.forEach(button => button.disabled = true);

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
      await sleep(character.trim() ? 34 : 18);
    }

    if (parent) parent.classList.remove('typewriter-cursor');
    await sleep(130);
  }

  if (runId === typingRun) buttons.forEach(button => button.disabled = false);
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

// Start the first screen with the same letter-by-letter effect.
const firstScreen = document.querySelector('.screen.active');
if (firstScreen) typeScreen(firstScreen, ++typingRun);

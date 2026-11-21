const screens = [...document.querySelectorAll('.screen')];
function showScreen(id) {
  screens.forEach(screen => screen.classList.toggle('active', screen.id === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
document.querySelectorAll('[data-next]').forEach(button => {
  button.addEventListener('click', () => showScreen(button.dataset.next));
});
document.getElementById('restart').addEventListener('click', () => showScreen('welcome'));

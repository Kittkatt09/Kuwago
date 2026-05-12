const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.style.boxShadow = '0 4px 24px rgba(0,0,0,0.5)';
    navbar.style.padding = '8px 0';
  } else {
    navbar.style.boxShadow = '';
    navbar.style.padding = '';
  }
}, { passive: true });

const revealTargets = document.querySelectorAll(
  '.category-card, .promo-banner, .hero-content, .hero-image'
);

revealTargets.forEach(element => {
  element.style.opacity = '0';
  element.style.transform = 'translateY(28px)';
  element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const delay = entry.target.closest('.category-grid')
        ? [...document.querySelectorAll('.category-card')].indexOf(entry.target) * 80
        : 0;
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, delay);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealTargets.forEach(el => observer.observe(el));

document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('click', function (e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    ripple.style.cssText = `
      position:absolute; border-radius:50%;
      background:rgba(200,134,10,0.25);
      width:10px; height:10px;
      top:${e.clientY - rect.top - 5}px;
      left:${e.clientX - rect.left - 5}px;
      transform:scale(0);
      animation:rippleAnim 0.55s ease-out forwards;
      pointer-events:none;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});


/**
 * DATERRA Smart - Utilitário de Bloqueio Seguro de Scroll
 * Suporta contagem de referências (múltiplos modais encadeados),
 * compensação de barra de scroll em desktop e bloqueio robusto no iOS Safari.
 */

let lockCount = 0;
let savedScrollY = 0;
let originalOverflow = '';
let originalPosition = '';
let originalTop = '';
let originalWidth = '';
let originalPaddingRight = '';

export function lockBodyScroll(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (lockCount === 0) {
    // 1. Capturar estado e posição de scroll atuais
    savedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    originalOverflow = document.body.style.overflow;
    originalPosition = document.body.style.position;
    originalTop = document.body.style.top;
    originalWidth = document.body.style.width;
    originalPaddingRight = document.body.style.paddingRight;

    // 2. Compensar largura da barra de scroll em desktop para evitar layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // 3. Aplicar bloqueio seguro:
    // Em iOS Safari, position: fixed impede o rubber-band scrolling no conteúdo de fundo
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = '100%';
    document.body.classList.add('modal-scroll-locked');
  }

  lockCount++;
}

export function unlockBodyScroll(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  lockCount = Math.max(0, lockCount - 1);

  if (lockCount === 0) {
    // 4. Restaurar exatamente os estilos inline originais
    document.body.style.overflow = originalOverflow;
    document.body.style.position = originalPosition;
    document.body.style.top = originalTop;
    document.body.style.width = originalWidth;
    document.body.style.paddingRight = originalPaddingRight;
    document.body.classList.remove('modal-scroll-locked');

    // 5. Restaurar a posição vertical original do scroll
    window.scrollTo(0, savedScrollY);
  }
}

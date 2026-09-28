import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { forceResetBodyScroll } from '../utils/scrollLock';

/**
 * Componente central que garante que cada transição de rota ou alteração
 * de parâmetros de pesquisa (?tool=...) posiciona a visualização no topo (Y=0)
 * e liberta qualquer bloqueio residual de scroll do body.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    forceResetBodyScroll();
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;

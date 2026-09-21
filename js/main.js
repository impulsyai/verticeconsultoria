/**
 * ==========================================================================
 * VÉRTICE — PESSOAS & ESTRATÉGIA
 * Script Principal (main.js) — RODADA V2 REFINADA
 * Interações editoriais, motion suave, scroll spy e CRM lead pipeline
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 🎨 Inicialização Imediata do Sistema Multi-Tema
  initThemeSwitcher();

  initStickyHeader();
  initMobileMenu();
  initScrollSpy();
  initSolucoesAccordion();
  initScrollAnimations();
  initB2BLeadForm();
  initCandidateLeadForm();
  initFormProfileTabs();
  initCustomSelects();
  initCtaRouting();
  initFaqAccordion();
  initTestimonials();
  initSmoothScroll();
  initInsightsReader();
  // 🚀 Rodada de Otimização & UX Elite (16 Itens)
  initGlobalReadingBar();
  initCountUp();
  initParallax();
  initMagneticButtons();
  initPhoneMask();
  initFormValidationFeedback();
  initFloatingActions();
  initInsightShareAndToast();
  initLegalModal();
});

/**
 * 1. Header Fixo & Sutil (Sem Trancos ou Layout Shifts)
 */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('is-sticky');
    } else {
      header.classList.remove('is-sticky');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * 2. Menu Mobile Elegante & Acessível
 */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.header-nav');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  if (!toggleBtn || !nav) return;

  const toggle = (force) => {
    const isOpen = typeof force === 'boolean' ? force : !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', isOpen);
    if (backdrop) backdrop.classList.toggle('is-open', isOpen);
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  toggleBtn.addEventListener('click', () => toggle());

  if (backdrop) {
    backdrop.addEventListener('click', () => toggle(false));
  }

  const navLinks = nav.querySelectorAll('.nav-link, .mobile-nav-cta a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => toggle(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      toggle(false);
    }
  });
}

/**
 * 3. Scroll Spy (Acompanhamento Ativo da Seção na Navbar)
 */
function initScrollSpy() {
  const navLinks = document.querySelectorAll('.header-nav .nav-link');
  const sections = document.querySelectorAll('section[id]');
  if (!navLinks.length || !sections.length) return;

  const handleSpy = () => {
    const scrollPos = window.scrollY + 160;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('is-active');
          } else {
            link.classList.remove('is-active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', handleSpy, { passive: true });
  handleSpy();
}

/**
 * 4. Lista Interativa de Soluções (Seção 04 — Estável Sem Tremor)
 */
function initSolucoesAccordion() {
  const items = document.querySelectorAll('.solucao-item');
  if (!items.length) return;

  let hoverTimer = null;

  const setActive = (activeItem) => {
    items.forEach(el => {
      if (el !== activeItem) el.classList.remove('is-active');
    });
    if (activeItem) {
      activeItem.classList.add('is-active');
    }
  };

  items.forEach((item) => {
    // Clique (mobile & desktop)
    item.addEventListener('click', () => {
      const isAlreadyActive = item.classList.contains('is-active');
      if (isAlreadyActive && window.innerWidth <= 768) {
        item.classList.remove('is-active');
      } else {
        setActive(item);
      }
    });

    // Hover inteligente com intenção de pausa (100ms) para evitar tremores ao mover o mouse
    item.addEventListener('mouseenter', () => {
      if (window.innerWidth > 1024) {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => {
          setActive(item);
        }, 100);
      }
    });

    // Se o mouse sair antes de 100ms (passagem rápida), cancela a ativação
    item.addEventListener('mouseleave', () => {
      if (window.innerWidth > 1024) {
        clearTimeout(hoverTimer);
      }
    });
  });
}

/**
 * 5. Sistema de Motion & Revelação Editorial (IntersectionObserver)
 */
function initScrollAnimations() {
  const urlParams = new URLSearchParams(window.location.search);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || urlParams.has('section') || urlParams.has('reveal')) {
    document.querySelectorAll('.reveal-init, .reveal-fade, .reveal-line-h').forEach(el => {
      el.classList.add('is-revealed');
    });
    if (urlParams.has('section') || urlParams.has('reveal')) return;
  }

  const targets = document.querySelectorAll('.reveal-init, .reveal-fade, .reveal-line-h');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  targets.forEach(el => observer.observe(el));
}

/**
 * 6. Formulário B2B de Conversão & Ingestão no Hub / UTMs
 */
function initB2BLeadForm() {
  const form = document.getElementById('b2b-lead-form');
  const successBox = document.getElementById('b2b-form-success');
  const errorBox = document.getElementById('b2b-form-error');
  const submitBtn = document.getElementById('b2b-submit-btn');
  const privacyLink = document.getElementById('form-link-privacy');
  if (!form) return;

  // Conectar link discreto de LGPD ao modal de Diretrizes de Privacidade
  if (privacyLink) {
    privacyLink.addEventListener('click', (e) => {
      e.preventDefault();
      const modalPrivacyTrigger = document.getElementById('btn-legal-privacy');
      if (modalPrivacyTrigger) modalPrivacyTrigger.click();
    });
  }

  // Ingestão automática de contexto, URL e UTMs completas
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source') || '';
  const utmMedium = urlParams.get('utm_medium') || '';
  const utmCampaign = urlParams.get('utm_campaign') || '';
  const utmContent = urlParams.get('utm_content') || '';

  const fieldUrl = document.getElementById('form-field-url');
  const fieldSource = document.getElementById('form-field-utm-source');
  const fieldMedium = document.getElementById('form-field-utm-medium');
  const fieldCampaign = document.getElementById('form-field-utm-campaign');
  const fieldContent = document.getElementById('form-field-utm-content');
  const fieldTimestamp = document.getElementById('form-field-timestamp');

  if (fieldUrl) fieldUrl.value = window.location.href;
  if (fieldSource) fieldSource.value = utmSource;
  if (fieldMedium) fieldMedium.value = utmMedium;
  if (fieldCampaign) fieldCampaign.value = utmCampaign;
  if (fieldContent) fieldContent.value = utmContent;
  if (fieldTimestamp) fieldTimestamp.value = new Date().toISOString();

  let isSubmitting = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (errorBox) errorBox.style.display = 'none';

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    // Garantir que a URL da página atual e UTMs estejam no payload
    payload.landing_page = window.location.href;

    // Transição visual do botão para estado de carregamento
    isSubmitting = true;
    if (submitBtn) {
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
      const btnText = submitBtn.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'ENVIANDO SOLICITAÇÃO...';
    }

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        // Confirmação real recebida do Hub
        form.reset();
        form.style.display = 'none';
        if (errorBox) errorBox.style.display = 'none';
        if (successBox) {
          successBox.classList.add('is-visible');
          successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Dispara evento customizado para integrações externas (GA4, Meta Pixel)
        window.dispatchEvent(new CustomEvent('vertice:lead_submitted', { detail: payload }));
      } else {
        throw new Error(data.error || 'hub_unavailable');
      }
    } catch (err) {
      console.warn('[VÉRTICE LEAD FORM] Falha no envio para o Hub:', err.message || err);
      if (errorBox) {
        errorBox.style.display = 'flex';
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } finally {
      isSubmitting = false;
      if (submitBtn) {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        const btnText = submitBtn.querySelector('.btn-text');
        if (btnText) btnText.textContent = 'FALAR COM A VÉRTICE';
      }
    }
  });
}

/**
 * 7. Rolagem Suave com Compensação da Navbar Fixa
 */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 80;
        const targetPos = targetEl.getBoundingClientRect().top + window.scrollY - (headerHeight - 4);

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * 8. Leitor Editorial de Insights (Modal Exclusivo, Sem Abrir Formulário de Contato)
 */
function initInsightsReader() {
  const modal = document.getElementById('editorial-reader-modal');
  const closeBtn = document.getElementById('editorial-reader-close');
  const returnBtn = document.getElementById('reader-close-btn');
  const categoryEl = document.getElementById('reader-category');
  const titleEl = document.getElementById('reader-title');
  const authorEl = document.getElementById('reader-author');
  const bodyEl = document.getElementById('reader-body');
  const scrollContainer = document.getElementById('reader-scroll-container');
  const progressBar = document.getElementById('reader-progress-bar');
  const rows = document.querySelectorAll('.insight-row');

  if (!modal || !rows.length) return;

  const articlesData = {
    '01': {
      category: 'LIDERANÇA',
      title: 'O que diferencia líderes que sustentam resultados no longo prazo',
      author: 'Juliana Pinheiro · Diretora Executiva Vértice',
      content: `
        <p>Organizações com metas ambiciosas frequentemente caem na armadilha de avaliar a liderança exclusivamente pela entrega do trimestre corrente. No entanto, consultorias estratégicas observam com frequência o custo invisível dessa miopia: turnover precoce, desengajamento das equipes intermediárias e perda de memória institucional.</p>
        <blockquote>“Liderar não é apenas bater metas sob pressão constante. É desenhar um ecossistema onde as metas continuem sendo superadas quando o líder não estiver na sala.”</blockquote>
        <p>Líderes de alto rendimento sustentável compartilham três fundamentos essenciais:</p>
        <p><strong>1. Escuta estruturada antes da intervenção:</strong> O diagnóstico comportamental e a leitura precisa do clima evitam decisões precipitadas que abalam a confiança do time.</p>
        <p><strong>2. Coerência entre governança e incentivos:</strong> Cobrar inovação enquanto se pune o erro calculado é o caminho mais rápido para a paralisia operacional.</p>
        <p><strong>3. Desenvolvimento deliberado de sucessores:</strong> A maturidade de uma diretoria é medida pela solidez dos talentos que sobem em sua esteira.</p>
      `
    },
    '02': {
      category: 'CULTURA ORGANIZACIONAL',
      title: 'Pesquisa de clima: o que os dados reais precisam revelar para a diretoria',
      author: 'Juliana Pinheiro & Equipe Vértice',
      content: `
        <p>Muitas organizações tratam a pesquisa de clima como um evento protocolar de fim de ano: aplica-se um formulário padrão, calcula-se uma nota média geral de satisfação e arquiva-se o relatório em uma pasta executiva. Trata-se de uma oportunidade estratégica desperdiçada.</p>
        <blockquote>“A nota média do clima é um analgésico corporativo. O valor real reside nas dissonâncias e desvios de padrão entre setores.”</blockquote>
        <p>Uma pesquisa de clima de nível consultivo deve responder perguntas de risco de negócio:</p>
        <p><strong>• Onde estão os pontos cegos da comunicação interna?</strong> Ruídos entre a diretoria e os turnos operacionais costumam custar milhões em retrabalho e desmotivação.</p>
        <p><strong>• Como a liderança intermediária é percebida?</strong> Gerentes diretos são a maior causa de permanência ou saída de talentos-chave.</p>
        <p><strong>• Qual a percepção de justiça e meritocracia?</strong> Estruturas sem plano transparente de cargos e salários geram insatisfação silenciosa e perda contínua de produtividade.</p>
      `
    },
    '03': {
      category: 'GESTÃO DE PESSOAS',
      title: 'Quando contratar deixa de ser uma tarefa operacional e se torna risco de negócio',
      author: 'Letícia Brêda · Consultora Sênior',
      content: `
        <p>Preencher posições executivas e técnicas com base apenas na urgência da vaga é uma das decisões mais onerosas que uma diretoria pode tomar. O custo de um turnover executivo não se limita à rescisão: envolve perda de ritmo estratégico, desgaste de equipes e impacto direto em clientes.</p>
        <blockquote>“Contratar pelo currículo e demitir pelo comportamento ainda é o ciclo mais comum em empresas que não integram método científico à seleção.”</blockquote>
        <p>No modelo de Hunting Estratégico da Vértice, a contratação é tratada como mitigação de risco de capital:</p>
        <p><strong>1. Mapeamento Comportamental DISC:</strong> Alinhar a matriz de competências à maturidade da equipe receptora.</p>
        <p><strong>2. Avaliação de Fit Cultural & Valores:</strong> Garantir que o candidato não apenas domine a técnica, mas ressoe com a visão de longo prazo dos sócios.</p>
        <p><strong>3. Integração e Acompanhamento:</strong> O processo não termina na assinatura do contrato, mas na validação de seu impacto inicial na operação.</p>
      `
    }
  };

  const updateProgress = () => {
    if (!scrollContainer || !progressBar) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const total = scrollHeight - clientHeight;
    const progress = total > 0 ? (scrollTop / total) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  };

  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', updateProgress, { passive: true });
  }

  const openModal = (articleId) => {
    const data = articlesData[articleId] || articlesData['01'];
    categoryEl.textContent = data.category;
    titleEl.textContent = data.title;
    authorEl.textContent = data.author;
    bodyEl.innerHTML = data.content;

    if (progressBar) progressBar.style.width = '0%';
    if (scrollContainer) scrollContainer.scrollTop = 0;

    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  rows.forEach(row => {
    const num = row.querySelector('.insight-num')?.textContent.trim() || '01';

    row.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openModal(num);
    });

    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(num);
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (returnBtn) returnBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      closeModal();
    }
  });
}

/**
 * 9. Barra de Progresso Global no Topo (Global Reading Track)
 */
function initGlobalReadingBar() {
  const bar = document.getElementById('global-reading-bar');
  if (!bar) return;

  const updateBar = () => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (totalScroll <= 0) return;
    const progress = (window.scrollY / totalScroll) * 100;
    bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  };

  window.addEventListener('scroll', updateBar, { passive: true });
  updateBar();
}

/**
 * 10. Contadores Numéricos Dinâmicos (Count-Up no Scroll)
 */
function initCountUp() {
  const elements = document.querySelectorAll('.count-up');
  if (!elements.length) return;

  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    if (isNaN(target)) return;

    const duration = 1600;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = Math.round(target * ease);
      el.textContent = `${prefix}${currentVal}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = `${prefix}${target}${suffix}`;
      }
    };

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  elements.forEach(el => observer.observe(el));
}

/**
 * 11. Parallax Suave de Profundidade nas Fotografias
 */
function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth <= 768) return;

  const heroImg = document.querySelector('.hero-backdrop-visual img');

  const onScroll = () => {
    const scrollY = window.scrollY;
    if (heroImg && scrollY < window.innerHeight) {
      heroImg.style.transform = `translate3d(0, ${scrollY * 0.1}px, 0)`;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}

/**
 * 12. Efeito Magnético Sutil nos Botões CTA
 */
function initMagneticButtons() {
  if (window.innerWidth <= 1024 || window.matchMedia('(pointer: coarse)').matches) return;

  const magneticElements = document.querySelectorAll('.header-btn, .hero-cta-group .btn-primary, .b2b-submit-btn');

  magneticElements.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate3d(${x * 0.16}px, ${y * 0.16}px, 0)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate3d(0, 0, 0)';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform 0.1s ease-out';
    });
  });
}

/**
 * 13. Máscara Dinâmica de Telefone / WhatsApp (Empresa e Candidato)
 */
function initPhoneMask() {
  const telInputs = document.querySelectorAll('#lead-whatsapp, #candidate-whatsapp');
  if (!telInputs.length) return;

  telInputs.forEach(telInput => {
    telInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 11) val = val.substring(0, 11);

      if (val.length > 6) {
        val = `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7)}`;
      } else if (val.length > 2) {
        val = `(${val.substring(0, 2)}) ${val.substring(2)}`;
      } else if (val.length > 0) {
        val = `(${val}`;
      }

      e.target.value = val;
    });
  });
}

/**
 * 14. Feedback Tátil de Validação nos Inputs (Empresa e Candidato)
 */
function initFormValidationFeedback() {
  const forms = document.querySelectorAll('#b2b-lead-form, #candidate-lead-form');
  if (!forms.length) return;

  forms.forEach(form => {
    const inputs = form.querySelectorAll('.b2b-input, .b2b-select');

    inputs.forEach(input => {
      const validate = () => {
        if (input.type === 'email') {
          const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
          input.classList.toggle('is-valid', isValid);
          input.classList.toggle('is-invalid', input.value.trim().length > 3 && !isValid);
        } else if (input.id === 'lead-whatsapp' || input.id === 'candidate-whatsapp') {
          const digits = input.value.replace(/\D/g, '');
          const isValid = digits.length >= 10;
          input.classList.toggle('is-valid', isValid);
          input.classList.toggle('is-invalid', digits.length > 0 && digits.length < 10);
        } else if (input.hasAttribute('required')) {
          const isValid = input.value.trim().length >= 2;
          input.classList.toggle('is-valid', isValid);
        }
      };

      input.addEventListener('input', validate);
      input.addEventListener('blur', validate);
    });
  });
}

/**
 * 15. Ações Flutuantes: WhatsApp Concierge e Botão Voltar ao Topo (Ativo na Seção Contato)
 */
function initFloatingActions() {
  const whatsappPill = document.getElementById('whatsapp-concierge');
  const backToTopBtn = document.getElementById('btn-back-to-top');
  const contatoSection = document.getElementById('contato');
  const essenciaSection = document.getElementById('essencia');

  const onScroll = () => {
    const scrollY = window.scrollY;

    // WhatsApp surge após sair da Hero (380px)
    if (whatsappPill) {
      if (scrollY > 380) {
        whatsappPill.classList.add('is-visible');
      } else {
        whatsappPill.classList.remove('is-visible');
      }

      // No mobile, após a segunda seção (ao entrar na Essência), compacta para apenas o ícone do WhatsApp
      const compactThreshold = essenciaSection ? essenciaSection.offsetTop - 80 : 1000;
      if (scrollY >= compactThreshold) {
        whatsappPill.classList.add('is-compact');
      } else {
        whatsappPill.classList.remove('is-compact');
      }
    }

    // Botão voltar ao topo surge especificamente após entrar na seção do formulário (#contato)
    if (backToTopBtn && contatoSection) {
      const contatoTop = contatoSection.offsetTop - 180;
      if (scrollY >= contatoTop) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/**
 * 16. Compartilhamento do Artigo no Modal & Toast Editorial
 */
function initInsightShareAndToast() {
  const toast = document.getElementById('editorial-toast');
  const btnCopy = document.getElementById('share-copy-link');
  const btnLinkedin = document.getElementById('share-linkedin');
  const btnWhatsapp = document.getElementById('share-whatsapp');

  let toastTimer = null;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 3200);
  };

  if (btnCopy) {
    const originalCopySvg = btnCopy.innerHTML;
    let copyResetTimer = null;

    btnCopy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link do insight copiado com sucesso!');

        // Feedback visual imediato com ícone de checkmark
        btnCopy.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        btnCopy.setAttribute('title', 'Copiado!');
        btnCopy.style.borderColor = 'rgba(37, 211, 102, 0.4)';

        clearTimeout(copyResetTimer);
        copyResetTimer = setTimeout(() => {
          btnCopy.innerHTML = originalCopySvg;
          btnCopy.setAttribute('title', 'Copiar link');
          btnCopy.style.borderColor = '';
        }, 2200);
      } catch (err) {
        showToast('Pressione Ctrl+C para copiar o link');
      }
    });
  }

  if (btnLinkedin) {
    btnLinkedin.addEventListener('click', () => {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=500');
    });
  }

  if (btnWhatsapp) {
    btnWhatsapp.addEventListener('click', () => {
      const title = document.getElementById('reader-title')?.textContent || 'Vértice Insights';
      const text = encodeURIComponent(`Recomendo a leitura: "${title}" no portal da Vértice — Pessoas & Estratégia\n${window.location.href}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    });
  }
}

/**
 * 17. Modal Institucional de Governança (LGPD & Termos Institucionais)
 */
function initLegalModal() {
  const modal = document.getElementById('editorial-legal-modal');
  const btnPrivacy = document.getElementById('btn-legal-privacy');
  const btnTerms = document.getElementById('btn-legal-terms');
  const btnClose = document.getElementById('editorial-legal-close');
  const btnBottomClose = document.getElementById('legal-modal-close-btn');
  const badgeEl = document.getElementById('legal-modal-badge');
  const titleEl = document.getElementById('legal-modal-title');
  const bodyEl = document.getElementById('legal-modal-body');

  if (!modal || !bodyEl) return;

  const legalData = {
    privacy: {
      badge: 'LGPD & PRIVACIDADE',
      title: 'Diretrizes de Privacidade e Governança de Dados',
      html: `
        <p><strong>1. Compromisso Institucional com a LGPD</strong><br>
        Em estrita conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei Federal nº 13.709/2018), a <strong>Vértice — Pessoas & Estratégia</strong> assegura a integridade, confidencialidade e tratamento ético das informações coletadas em seus pontos de contato corporativos.</p>
        
        <p><strong>2. Finalidade e Tratamento dos Dados</strong><br>
        Os dados fornecidos em nosso formulário e canais institucionais (Nome, E-mail corporativo, Empresa e Telefone) destinam-se exclusivamente à qualificação de demandas consultivas B2B, elaboração de propostas estratégicas e comunicação direta com nossos consultores. A Vértice <em>não comercializa, não aluga e não transfere</em> bases de dados a quaisquer terceiros para fins publicitários.</p>

        <p><strong>3. Confidencialidade e Segurança da Informação</strong><br>
        Implementamos rigorosas medidas técnicas e organizacionais de salvaguarda, criptografia e controle de acesso para garantir sigilo irrestrito sobre diagnósticos organizacionais, dados de lideranças e planos de desenvolvimento corporativo.</p>

        <p><strong>4. Direitos do Titular</strong><br>
        Na qualidade de titular, você detém o direito de requisitar a qualquer momento a confirmação de tratamento, acesso aos dados registrados, correção de cadastros ou a revogação de consentimento e exclusão definitiva de informações.</p>

        <p><strong>5. Canal Oficial de Privacidade (DPO)</strong><br>
        Para solicitações relativas à governança de dados ou esclarecimento de dúvidas sobre este termo, entre em contato diretamente com nossa gestão institucional através do e-mail: <strong>contato@verticeestrategia.com.br</strong> (Referência: LGPD / Dados).</p>
      `
    },
    terms: {
      badge: 'TERMOS INSTITUCIONAIS',
      title: 'Termos de Uso e Propriedade Intelectual',
      html: `
        <p><strong>1. Natureza dos Serviços Consultivos</strong><br>
        A <strong>Vértice — Pessoas & Estratégia</strong> presta consultoria de alta gestão em desenvolvimento organizacional, liderança, arquitetura de RH e governança de pessoas. As informações disponibilizadas neste website possuem caráter institucional e educativo, servindo como aproximação conceitual e não substituindo o diagnóstico executivo estruturado para cada organização cliente.</p>

        <p><strong>2. Propriedade Intelectual e Metodologias</strong><br>
        Todos os ensaios, frameworks, metodologias proprietárias (incluindo o <em>Método C.O.R.E.™</em>), identidade visual, logotipos e conteúdos textuais veiculados neste portal são ativos de propriedade intelectual exclusiva da Vértice Pessoas & Estratégia Ltda. (CNPJ 42.090.430/0001-91). É expressamente vedada a reprodução comercial, distribuição não autorizada ou adaptação sem consentimento prévio formal.</p>

        <p><strong>3. Confidencialidade Bilateral (NDA)</strong><br>
        Todos os projetos firmados com clientes e parceiros são regidos por instrumentos contratuais autônomos com acordos de confidencialidade irrevogáveis (Non-Disclosure Agreement), assegurando sigilo pleno sobre cultura corporativa, organogramas e diretrizes de negócio.</p>

        <p><strong>4. Foro e Legislação Aplicável</strong><br>
        Os presentes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o Foro da Comarca de Recife, Estado de Pernambuco, como competente para dirimir quaisquer questões decorrentes do uso institucional deste portal corporativo.</p>
      `
    }
  };

  const openModal = (type) => {
    const data = legalData[type] || legalData.privacy;
    if (badgeEl) badgeEl.textContent = data.badge;
    if (titleEl) titleEl.textContent = data.title;
    bodyEl.innerHTML = data.html;

    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Rola o container interno para o topo
    const scrollContainer = modal.querySelector('.editorial-reader-content');
    if (scrollContainer) scrollContainer.scrollTop = 0;
  };

  const closeModal = () => {
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (btnPrivacy) {
    btnPrivacy.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('privacy');
    });
  }

  if (btnTerms) {
    btnTerms.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('terms');
    });
  }

  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnBottomClose) btnBottomClose.addEventListener('click', closeModal);

  // Fechar ao clicar no backdrop (fora do card)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Fechar com a tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      closeModal();
    }
  });
}

/**
 * ==========================================================================
 * MÓDULOS DE IDENTIDADE VISUAL & FEEDBACK MATHEUS
 * 1. Multi-Tema (Atual / Azul-Marinho / Verde-Petróleo) + Logos Dinâmicas
 * 2. Segmented Tabs Formulário: Empresa x Candidato
 * 3. Ingestão e Validação do Formulário Candidato (Talentos)
 * 4. Roteamento Inteligente de CTAs com Pré-Seleção de Perfil
 * 5. Accordion Moderno e Acessível de FAQ com Filtros
 * 6. Depoimentos Editoriais Estruturados
 * ==========================================================================
 */

const THEME_STORAGE_KEY = 'vertice_theme';
const THEME_LOGOS = {
  current: {
    'light-bg': 'assets/logos/logo-cortada.png',
    'dark-bg': 'assets/logos/logo-negativa-branca.png'
  },
  navy: {
    'light-bg': 'assets/logos/logo-navy-transparent-official.png',
    'dark-bg': 'assets/logos/logo-navy-dark-official.png',
    'transparent': 'assets/logos/logo-navy-transparent-official.png',
    'solid-light': 'assets/logos/logo-navy-light-solid-official.png'
  },
  petrol: {
    'light-bg': 'assets/logos/logo-petrol-transparent-official.png',
    'dark-bg': 'assets/logos/logo-petrol-dark-official.png',
    'transparent': 'assets/logos/logo-petrol-transparent-official.png',
    'solid-light': 'assets/logos/logo-petrol-light-solid-official.png'
  }
};

/**
 * FONTE ÚNICA DE VERDADE: setTheme(theme)
 * Aplica um tema globalmente no documento HTML, sincroniza componentes,
 * atualiza logos dinâmicas, sincroniza botões desktop/mobile e persiste no localStorage.
 */
function setTheme(theme) {
  if (!['current', 'navy', 'petrol'].includes(theme)) {
    theme = 'current';
  }

  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (err) {
    // LocalStorage indisponível em modo restrito
  }

  // Sincronizar todos os seletores de tema (desktop e mobile)
  const buttons = document.querySelectorAll('.theme-dot-btn');
  buttons.forEach(btn => {
    const val = btn.getAttribute('data-theme-val') || btn.getAttribute('data-theme-value');
    const isActive = val === theme;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
  });

  // Atualizar logos dinâmicas de acordo com o tema e variante de fundo
  const logoElements = document.querySelectorAll('img[data-logo-variant]');
  logoElements.forEach(img => {
    const variant = img.getAttribute('data-logo-variant') || 'light-bg';
    if (THEME_LOGOS[theme] && THEME_LOGOS[theme][variant]) {
      img.src = THEME_LOGOS[theme][variant];
    }
  });

  // Disparar evento para scripts ou componentes que escutem troca de tema
  window.dispatchEvent(new CustomEvent('vertice:theme_changed', { detail: { theme } }));
}

// Aliases globais acessíveis via DevTools e scripts externos
window.setTheme = setTheme;
window.applyTheme = setTheme;

/**
 * Inicializador dos seletores de tema (Desktop e Mobile)
 */
function initThemeSwitcher() {
  let initialTheme = 'current';
  try {
    const params = new URLSearchParams(window.location.search);
    const urlTheme = params.get('theme') || params.get('tema');
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (urlTheme && ['current', 'navy', 'petrol'].includes(urlTheme)) {
      initialTheme = urlTheme;
    } else if (stored && ['current', 'navy', 'petrol'].includes(stored)) {
      initialTheme = stored;
    }
  } catch (err) {}

  setTheme(initialTheme);

  const themeButtons = document.querySelectorAll('.theme-dot-btn');
  themeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const selectedTheme = btn.getAttribute('data-theme-val') || btn.getAttribute('data-theme-value');
      if (selectedTheme) {
        setTheme(selectedTheme);
      }
    });
  });
}

/**
 * Alternância de Perfil do Formulário (Empresa x Candidato)
 */
function setFormProfile(profile) {
  const isCandidate = profile === 'candidato';

  const tabEmpresa = document.getElementById('tab-btn-empresa');
  const tabCandidato = document.getElementById('tab-btn-candidato');
  const panelEmpresa = document.getElementById('panel-empresa');
  const panelCandidato = document.getElementById('panel-candidato');

  if (tabEmpresa && tabCandidato && panelEmpresa && panelCandidato) {
    if (isCandidate) {
      tabCandidato.classList.add('is-active');
      tabCandidato.setAttribute('aria-selected', 'true');
      tabEmpresa.classList.remove('is-active');
      tabEmpresa.setAttribute('aria-selected', 'false');

      panelCandidato.classList.add('is-active');
      panelCandidato.setAttribute('aria-hidden', 'false');
      panelEmpresa.classList.remove('is-active');
      panelEmpresa.setAttribute('aria-hidden', 'true');
    } else {
      tabEmpresa.classList.add('is-active');
      tabEmpresa.setAttribute('aria-selected', 'true');
      tabCandidato.classList.remove('is-active');
      tabCandidato.setAttribute('aria-selected', 'false');

      panelEmpresa.classList.add('is-active');
      panelEmpresa.setAttribute('aria-hidden', 'false');
      panelCandidato.classList.remove('is-active');
      panelCandidato.setAttribute('aria-hidden', 'true');
    }
  }
}

function initFormProfileTabs() {
  const tabEmpresa = document.getElementById('tab-btn-empresa');
  const tabCandidato = document.getElementById('tab-btn-candidato');

  if (tabEmpresa) {
    tabEmpresa.addEventListener('click', () => setFormProfile('empresa'));
  }
  if (tabCandidato) {
    tabCandidato.addEventListener('click', () => setFormProfile('candidato'));
  }
}

/**
 * Formulário de Candidato / Banco de Talentos
 */
function initCandidateLeadForm() {
  const form = document.getElementById('candidate-lead-form');
  const successBox = document.getElementById('candidate-form-success');
  const errorBox = document.getElementById('candidate-form-error');
  const submitBtn = document.getElementById('candidate-submit-btn');
  const privacyLink = document.getElementById('candidate-link-privacy');
  if (!form) return;

  if (privacyLink) {
    privacyLink.addEventListener('click', (e) => {
      e.preventDefault();
      const modalPrivacyTrigger = document.getElementById('btn-legal-privacy');
      if (modalPrivacyTrigger) modalPrivacyTrigger.click();
    });
  }

  // Preencher UTMs
  const urlParams = new URLSearchParams(window.location.search);
  const fieldUrl = document.getElementById('candidate-field-url');
  const fieldSource = document.getElementById('candidate-field-utm-source');
  const fieldMedium = document.getElementById('candidate-field-utm-medium');
  const fieldCampaign = document.getElementById('candidate-field-utm-campaign');
  const fieldContent = document.getElementById('candidate-field-utm-content');
  const fieldTimestamp = document.getElementById('candidate-field-timestamp');

  if (fieldUrl) fieldUrl.value = window.location.href;
  if (fieldSource) fieldSource.value = urlParams.get('utm_source') || '';
  if (fieldMedium) fieldMedium.value = urlParams.get('utm_medium') || '';
  if (fieldCampaign) fieldCampaign.value = urlParams.get('utm_campaign') || '';
  if (fieldContent) fieldContent.value = urlParams.get('utm_content') || '';
  if (fieldTimestamp) fieldTimestamp.value = new Date().toISOString();

  let isSubmitting = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (errorBox) errorBox.style.display = 'none';

    const formData = new FormData(form);
    formData.set('landing_page', window.location.href);
    formData.set('tipo', 'candidato');

    isSubmitting = true;
    if (submitBtn) {
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
      const btnText = submitBtn.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'ENVIANDO DADOS...';
    }

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        form.reset();
        form.style.display = 'none';
        if (errorBox) errorBox.style.display = 'none';
        if (successBox) {
          successBox.classList.add('is-visible');
          successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        window.dispatchEvent(new CustomEvent('vertice:candidate_submitted', { detail: Object.fromEntries(formData.entries()) }));
      } else {
        throw new Error(data.error || 'hub_unavailable');
      }
    } catch (err) {
      console.warn('[VÉRTICE CANDIDATE FORM] Falha no envio para o Hub:', err.message || err);
      if (errorBox) {
        errorBox.style.display = 'flex';
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } finally {
      isSubmitting = false;
      if (submitBtn) {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        const btnText = submitBtn.querySelector('.btn-text');
        if (btnText) btnText.textContent = 'CADASTRAR NO BANCO DE TALENTOS';
      }
    }
  });
}

/**
 * Roteamento Inteligente de CTAs (Candidato vs Empresa)
 */
function initCtaRouting() {
  // 1. Interceptar cliques em links/botões com data-form-profile
  const profileCtas = document.querySelectorAll('[data-form-profile]');
  profileCtas.forEach(cta => {
    cta.addEventListener('click', (e) => {
      const targetProfile = cta.getAttribute('data-form-profile');
      if (targetProfile) {
        setFormProfile(targetProfile);
      }
      // Se for link para #contato, garantir scroll suave
      const href = cta.getAttribute('href');
      if (href && href.startsWith('#contato')) {
        const contatoSec = document.getElementById('contato');
        if (contatoSec) {
          e.preventDefault();
          contatoSec.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // 2. Verificar hash e query params na carga inicial
  const checkInitialRouting = () => {
    const hash = window.location.hash.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const tipoParam = searchParams.get('tipo');

    if (hash.includes('candidato') || tipoParam === 'candidato') {
      setFormProfile('candidato');
    } else if (hash.includes('empresa') || tipoParam === 'empresa') {
      setFormProfile('empresa');
    }
  };

  checkInitialRouting();
  window.addEventListener('hashchange', checkInitialRouting);
}

/**
 * Accordion de FAQ e Filtros por Categoria
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  const filterBtns = document.querySelectorAll('.faq-filter-btn');
  if (!faqItems.length) return;

  // Toggle do Accordion (Apenas um aberto por vez para manter sofisticação editorial)
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question-btn, .faq-question');
    const answer = item.querySelector('.faq-answer-pane, .faq-answer');
    if (!questionBtn || !answer) return;

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open') || item.classList.contains('is-active');

      // Fecha todos os itens
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('is-open', 'is-active');
        const otherBtn = otherItem.querySelector('.faq-question-btn, .faq-question');
        const otherAns = otherItem.querySelector('.faq-answer-pane, .faq-answer');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        if (otherAns) otherAns.style.maxHeight = null;
      });

      // Se não estava aberto, abre o clicado
      if (!isOpen) {
        item.classList.add('is-open', 'is-active');
        questionBtn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = (answer.scrollHeight + 60) + 'px';
      }
    });
  });

  // Filtros de Categoria (Todos, Empresas, Candidatos)
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-faq-filter') || btn.getAttribute('data-category') || 'all';

        filterBtns.forEach(b => {
          const isActive = b === btn;
          b.classList.toggle('is-active', isActive);
          b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        faqItems.forEach(item => {
          const itemCat = item.getAttribute('data-faq-category') || item.getAttribute('data-category');
          if (category === 'all' || itemCat === category) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
            // Fecha se estava aberto
            item.classList.remove('is-open', 'is-active');
            const questionBtn = item.querySelector('.faq-question-btn, .faq-question');
            const otherAns = item.querySelector('.faq-answer-pane, .faq-answer');
            if (questionBtn) questionBtn.setAttribute('aria-expanded', 'false');
            if (otherAns) otherAns.style.maxHeight = null;
          }
        });
      });
    });
  }
}

/**
 * Depoimentos Editoriais Estruturados
 */
const VERTICE_TESTIMONIALS_DATA = [
  {
    id: 1,
    company: 'Indústria & Varejo Nacional',
    role: 'Diretoria de Recursos Humanos',
    name: 'Depoimento em Homologação Executiva',
    quote: 'A Vértice conduziu o redesenho de nossa estrutura organizacional e a atração de lideranças com rigor metodológico exemplar, alinhando cultura e resultado estratégico.',
    metrics: '+42% assertividade em retenção executiva',
    isPlaceholder: true
  },
  {
    id: 2,
    company: 'Grupo Agroindustrial',
    role: 'CEO & Conselho de Administração',
    name: 'Depoimento em Homologação Executiva',
    quote: 'O diagnóstico de clima e a arquitetura de remuneração trouxeram clareza e previsibilidade à sucessão de nossas lideranças operacionais.',
    metrics: 'Alinhamento sucessório e governança de cargos',
    isPlaceholder: true
  },
  {
    id: 3,
    company: 'Tecnologia & Serviços Corporativos',
    role: 'Vice-Presidência de Operações',
    name: 'Depoimento em Homologação Executiva',
    quote: 'A precisão na qualificação dos talentos reduziu nosso tempo de contratação e elevou o padrão técnico de nossos times de gestão estratégica.',
    metrics: 'Redução de 35% no time-to-hire estratégico',
    isPlaceholder: true
  }
];

function initTestimonials() {
  window.VERTICE_TESTIMONIALS = VERTICE_TESTIMONIALS_DATA;
}

/**
 * 16. Seletor Redondo Customizado (Custom Rounded Select Popover)
 * Converte selects em menus popover arredondados mantendo total compatibilidade
 * com submissão de formulário, FormData, validação required e acessibilidade.
 */
function initCustomSelects() {
  const selects = document.querySelectorAll('select.b2b-select');
  if (!selects.length) return;

  selects.forEach(select => {
    // Evita duplicidade se já inicializado
    if (select.closest('.custom-select-wrapper')) return;

    // Cria container wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);

    // Identifica seleção inicial
    const selectedOption = select.options[select.selectedIndex];
    const initialText = selectedOption ? selectedOption.textContent : (select.options[0]?.textContent || 'Selecione...');
    const isPlaceholder = select.selectedIndex <= 0 && select.options[0]?.value === '';

    // Cria Gatilho (Trigger Button)
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    const textSpan = document.createElement('span');
    textSpan.className = 'custom-select-text' + (isPlaceholder ? ' custom-select-placeholder' : '');
    textSpan.textContent = initialText;

    // Chevron SVG
    const chevronSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chevronSvg.setAttribute('class', 'custom-select-chevron');
    chevronSvg.setAttribute('viewBox', '0 0 24 24');
    chevronSvg.setAttribute('fill', 'none');
    chevronSvg.setAttribute('stroke', 'currentColor');
    chevronSvg.setAttribute('stroke-width', '2.2');
    chevronSvg.setAttribute('stroke-linecap', 'round');
    chevronSvg.setAttribute('stroke-linejoin', 'round');
    chevronSvg.setAttribute('aria-hidden', 'true');
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', '6 9 12 15 18 9');
    chevronSvg.appendChild(polyline);

    trigger.appendChild(textSpan);
    trigger.appendChild(chevronSvg);
    wrapper.appendChild(trigger);

    // Cria Dropdown Popover
    const dropdown = document.createElement('div');
    dropdown.className = 'custom-select-dropdown';
    dropdown.setAttribute('role', 'listbox');

    // Popula opções
    Array.from(select.options).forEach((opt) => {
      if (opt.value === '' && opt.disabled) {
        return; // Pula o placeholder no menu de escolhas
      }

      const optionDiv = document.createElement('div');
      optionDiv.className = 'custom-select-option' + (opt.selected ? ' is-selected' : '');
      optionDiv.setAttribute('role', 'option');
      optionDiv.setAttribute('data-value', opt.value);
      optionDiv.textContent = opt.textContent;

      optionDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        select.dispatchEvent(new Event('input', { bubbles: true }));

        textSpan.textContent = opt.textContent;
        textSpan.classList.remove('custom-select-placeholder');

        dropdown.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('is-selected'));
        optionDiv.classList.add('is-selected');

        wrapper.classList.remove('is-open');
        const parentField = wrapper.closest('.b2b-field');
        if (parentField) parentField.classList.remove('select-is-open');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      });

      dropdown.appendChild(optionDiv);
    });

    wrapper.appendChild(dropdown);

    // Toggle de abertura
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.contains('is-open');

      // Fecha outros selects abertos
      document.querySelectorAll('.custom-select-wrapper.is-open').forEach(w => {
        if (w !== wrapper) {
          w.classList.remove('is-open');
          const pf = w.closest('.b2b-field');
          if (pf) pf.classList.remove('select-is-open');
          const t = w.querySelector('.custom-select-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });

      wrapper.classList.toggle('is-open', !isOpen);
      const parentField = wrapper.closest('.b2b-field');
      if (parentField) parentField.classList.toggle('select-is-open', !isOpen);
      trigger.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });

    // Sincroniza se o select nativo for alterado programaticamente
    select.addEventListener('change', () => {
      const currentOpt = select.options[select.selectedIndex];
      if (currentOpt) {
        textSpan.textContent = currentOpt.textContent;
        if (currentOpt.value === '') {
          textSpan.classList.add('custom-select-placeholder');
        } else {
          textSpan.classList.remove('custom-select-placeholder');
        }
        dropdown.querySelectorAll('.custom-select-option').forEach(o => {
          o.classList.toggle('is-selected', o.getAttribute('data-value') === currentOpt.value);
        });
      }
    });
  });

  // Fecha dropdowns ao clicar fora
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-select-wrapper')) {
      document.querySelectorAll('.custom-select-wrapper.is-open').forEach(wrapper => {
        wrapper.classList.remove('is-open');
        const pf = wrapper.closest('.b2b-field');
        if (pf) pf.classList.remove('select-is-open');
        const trigger = wrapper.querySelector('.custom-select-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // Fecha com tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.custom-select-wrapper.is-open').forEach(wrapper => {
        wrapper.classList.remove('is-open');
        const pf = wrapper.closest('.b2b-field');
        if (pf) pf.classList.remove('select-is-open');
        const trigger = wrapper.querySelector('.custom-select-trigger');
        if (trigger) {
          trigger.setAttribute('aria-expanded', 'false');
          trigger.focus();
        }
      });
    }
  });
}

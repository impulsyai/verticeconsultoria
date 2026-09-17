# VÉRTICE — PESSOAS & ESTRATÉGIA
## Documentação Técnica: Homologação de Identidade Visual Multitema, Formulários Segmentados, FAQ e Depoimentos

**Data:** 17 de Setembro de 2026  
**Ambiente/Branch:** `feat/vertice-site-identity-feedback`  
**Repositório do Site:** `impulsyai/verticeconsultoria`  
**Diretório Base:** `clientes/vertice_pessoas_estrategia/site/`  
**Porta Local de Validação:** `http://localhost:3333/`  
**Evidências Visuais (Fora do Git):** `C:\dev\vertice-site-review\`  

---

### 1. Resumo Executivo da Missão

Após a apresentação do site ao **Matheus (Vértice)**, foram solicitados ajustes estratégicos para permitir a homologação e teste comparativo de duas novas identidades visuais (**Azul-Marinho** e **Verde-Petróleo**), mantendo a **Identidade Atual (Ivory / Wine)** como padrão inicial, além da separação de fluxos entre **Empresas** e **Candidatos**, inserção de um **FAQ editorial acessível** e uma seção estruturada de **Depoimentos** preparada para dados reais.

Todas as implementações foram realizadas preservando a estabilidade da arquitetura existente, sem qualquer interferência no ecossistema do CRM / Vértice Hub.

---

### 2. Sistema Central de Design Tokens & Multitema

Para evitar duplicação de CSS ou estilos hardcoded, toda a estilização foi centralizada em `css/tokens.css` com escopos `data-theme`:

#### A. Tema 1 — Identidade Atual (Default)
* **Conceito:** Nobreza, Sobriedade, Corte Editorial, Elegância
* **Tokens Principais:**
  * `--vertice-ivory`: `#EFE7DF` (Fundo primário nobre)
  * `--vertice-wine`: `#4D1021` (Acento institucional / Botões / Títulos)
  * `--vertice-black`: `#010101` (Tipografia e rodapé escuro)
  * `--vertice-graphite`: `#505253` (Subtítulos e apoio)

#### B. Tema 2 — Azul-Marinho
* **Conceito:** Confiança, Profissionalismo, Competência, Credibilidade
* **Cores Oficiais Estritas:**
  * `--navy-900`: `#17324D` (Primária / Botões / Acentos fortes)
  * `--navy-600`: `#3978A8` (Hover / Badges / Links secundários)
  * `--navy-100`: `#DCECF5` (Bordas suaves / Superfícies delicadas)
  * `--navy-50`: `#F7F8F6` (Fundo primário limpo)
  * `--navy-gray`: `#5B6570` (Texto secundário e neutro de apoio)
  * `--vertice-black`: `#0F2235` (Escuro profundo Navy para seções dark)

#### C. Tema 3 — Verde-Petróleo
* **Conceito:** Equilíbrio, Desenvolvimento, Acolhimento, Maturidade
* **Cores Oficiais Estritas:**
  * `--petrol-900`: `#174A4A` (Primária / Botões / Acentos fortes)
  * `--petrol-600`: `#4F8A78` (Hover / Destaques / Badges)
  * `--petrol-100`: `#DDEBE4` (Bordas suaves / Superfícies delicadas)
  * `--petrol-50`: `#E9E1D2` (Fundo primário acolhedor)
  * `--petrol-dark`: `#293333` (Superfície escura e rodapé)

---

### 3. Seletor de Identidade na Navbar & Persistência

* **Interface:** Um seletor minimalista tipo pill com três swatches circulares (`● ● ●`) localizado na extremidade direita da navbar, antes do CTA principal no Desktop, e replicado tanto no topo do Header quanto dentro da Drawer Mobile.
* **Comportamento:** Transição instantânea sem reload via `applyTheme(theme)`.
* **Zero-FOUC (Flash of Unstyled Content):** Executado script síncrono no `<head>` de `index.html` que inspeciona parâmetros de URL (`?theme=...`) e `localStorage.getItem('vertice_theme')`, aplicando o atributo `data-theme` antes do primeiro frame de pintura.
* **Persistência:** Gravado sob a chave `vertice_theme` no `localStorage`.

---

### 4. Logos Dinâmicas e Tratamento de Assets

As referências originais aprovadas foram processadas em transparência RGBA de alta definição, preservando vetorização, geometria e proporção original da marca:

| Tema | Fundo Claro (`light-bg`) | Fundo Escuro (`dark-bg`) |
| :--- | :--- | :--- |
| **Atual** | `assets/logos/logo-cortada.png` (Wine `#4D1021`) | `assets/logos/logo-negativa-branca.png` (`#FFFFFF`) |
| **Azul-Marinho** | `assets/logos/logo-navy-dark.png` (`#17324D`) | `assets/logos/logo-navy-light.png` (`#F7F8F6`) |
| **Verde-Petróleo** | `assets/logos/logo-petrol-dark.png` (`#174A4A`) | `assets/logos/logo-petrol-light.png` (`#E9E1D2`) |

*Nota Técnica:* As marcas respondem dinamicamente via atributo `data-logo-variant` e mapeamento reativo em `main.js`. Recomenda-se fornecer o arquivo `.ai` / `.svg` nativo caso Matheus deseje substituir as matrizes PNG por SVG puro em produção.

---

### 5. Separação de Fluxos: Empresa vs. Candidato

#### A. Formulário Empresa (B2B Corporativo)
* **Preservação:** 100% dos campos originais e integração server-side com `api/lead.js` foram mantidos intactos.
* **Campos:** Nome Completo, Empresa, Cargo, WhatsApp, E-mail Corporativo, Solução de Interesse, Porte da Organização, Descrição do Desafio.

#### B. Formulário Candidato (Banco de Talentos & Oportunidades)
* **Novos Campos:**
  * Nome Completo *
  * WhatsApp / Telefone * (com máscara dinâmica `(99) 99999-9999`)
  * E-mail Pessoal / Profissional *
  * Cidade / UF
  * Área Principal de Atuação * (Select estruturado: Liderança, RH/DHO, Comercial, Operações/Logística, etc.)
  * Cargo Atual / Objetivo Profissional
  * Perfil no LinkedIn ou Portfólio
  * Resumo das Competências e Trajetória
* **Aviso de Transparência sobre Upload:** Não foi criado upload visual simulado (fake UI). Foi inserido aviso institucional claro informando que o anexo de currículo será integrado à nova plataforma digital de R&S, utilizando-se enquanto isso os dados cadastrais e link do LinkedIn.
* **Endpoint Server-Side (`api/lead.js`):** Atualizado para reconhecer `tipo: 'candidato'`, higienizar campos e formatar o payload sem quebrar as validações restritas de B2B.

#### C. Roteamento de CTAs com Pré-Seleção Automática
* O CTA da seção `#talentos` ("CADASTRAR MEU PERFIL") possui `data-form-profile="candidato"`.
* Ao clicar, o site realiza scroll suave e alterna instantaneamente a segmented tab para a visão de Candidato.
* URLs diretas como `http://localhost:3333/?tipo=candidato#contato` ativam a aba de candidatos imediatamente.
* CTAs comerciais (`Falar com a Vértice`, `Encontre Talentos`) preservam o perfil `empresa`.

---

### 6. Seção de FAQ (Perguntas Frequentes)

* **Localização:** Seção 09.5, posicionada estrategicamente após `#talentos` e antes de `#contato`.
* **Estrutura:** Accordion moderno, clean, com microinterações, ícone indicador e acessibilidade ARIA (`aria-expanded`, navegação por teclado).
* **Filtros por Perfil:** Pílulas no topo permitindo alternar entre `Todas as Perguntas`, `Para Empresas` e `Para Candidatos / Talentos`.
* **Perguntas Contempladas (8 itens):**
  1. *[Empresas]* Como funciona a abordagem da Vértice em Recrutamento & Seleção?
  2. *[Empresas]* A Vértice atende organizações de quais portes e setores?
  3. *[Empresas]* Qual é a abrangência geográfica de atuação da consultoria?
  4. *[Empresas]* Como iniciar um diagnóstico ou processo seletivo com a Vértice?
  5. *[Candidatos]* Como envio meu perfil profissional para o banco de talentos?
  6. *[Candidatos]* O cadastro no banco de talentos da Vértice tem algum custo?
  7. *[Candidatos]* Meus dados podem ser considerados para outras oportunidades futuras?
  8. *[Candidatos]* Como sou informado sobre o andamento de um processo seletivo?

---

### 7. Seção de Depoimentos (Prova Social Editorial)

* **Localização:** Seção 06.5, posicionada imediatamente após o case Tramontina.
* **Design:** 3 cards editoriais assimétricos com aspas minimalistas, monograma `V`, tipografia editorial e métricas quantitativas de impacto.
* **Arquitetura de Dados:** Alimentado por array estruturado `VERTICE_TESTIMONIALS_DATA` em `main.js`, pronto para receber citações oficiais sem necessidade de refatoração HTML.
* **Integridade Editorial:** Zero testemunhos falsos ou fotos geradas por IA. Cada card possui marcação de placeholder executivo ("Depoimento executivo do cliente em homologação").

---

### 8. Evidências Visuais Geradas (`C:\dev\vertice-site-review\`)

Foram capturadas 24 capturas de tela completas em alta resolução cobrindo Desktop (1440x900 / 1440x1050) e Mobile (390x844):

* `01_current/`
  * `01_desktop_current_hero.png`
  * `02_desktop_current_solucoes.png`
  * `03_desktop_current_talentos.png`
* `02_navy/`
  * `01_desktop_navy_hero.png`
  * `02_desktop_navy_solucoes.png`
  * `03_desktop_navy_talentos.png`
* `03_petrol/`
  * `01_desktop_petrol_hero.png`
  * `02_desktop_petrol_solucoes.png`
  * `03_desktop_petrol_talentos.png`
* `04_forms/`
  * `01_form_empresa_current.png`
  * `02_form_candidato_current.png`
  * `03_form_candidato_navy.png`
  * `04_form_empresa_petrol.png`
* `05_faq/`
  * `01_faq_overview_navy.png`
  * `02_faq_item_expanded_navy.png`
  * `03_faq_filter_candidato_petrol.png`
* `06_testimonials/`
  * `01_testimonials_current.png`
  * `02_testimonials_navy.png`
  * `03_testimonials_petrol.png`
* `07_mobile/`
  * `01_mobile_hero_current.png`
  * `02_mobile_menu_open_current.png`
  * `03_mobile_navy_hero.png`
  * `04_mobile_talentos_navy.png`
  * `05_mobile_form_candidato_navy.png`
  * `06_mobile_hero_petrol.png`
  * `07_mobile_faq_petrol.png`
  * `08_mobile_depoimentos_petrol.png`

---

### 9. Decisões Estratégicas para Juca & Matheus

1. **Escolha da Identidade:** O site está 100% funcional para apresentar a Matheus as 3 opções lado a lado no navegador sem necessidade de alterar código. Nenhuma decisão permanente foi forçada; o default permanece o tema atual até homologação formal.
2. **Assets Vetoriais:** Os assets PNG das novas logos foram gerados com corte limpo e canal alfa a partir do artwork oficial. Para produção final após a escolha do tema vencedor, recomenda-se disponibilizar o `.svg` definitivo da versão selecionada.
3. **Coleta de Depoimentos:** A seção `#depoimentos` está estruturada e homologada visualmente. Quando Matheus recolher os depoimentos reais com clientes (Tramontina, Petribu, ACLF, etc.), basta preencher os objetos no array `VERTICE_TESTIMONIALS_DATA`.

---

### 10. Correção Forense da Navbar e Seletor de Identidade Visual

#### A. Causa Raiz do Bug do Seletor de Tema
* **Diagnóstico:** O HTML do seletor e o CSS utilizavam o atributo `data-theme-val`, enquanto o manipulador de eventos em `js/main.js` realizava `btn.getAttribute('data-theme-value')`. Como o retorno era `null`, a função `applyTheme` nunca era executada pelo clique do usuário nas bolinhas.
* **Correção:** Unificação da função como **Fonte Única de Verdade** (`setTheme(theme)` / `window.setTheme`), compatibilização com ambos os atributos (`data-theme-val` e `data-theme-value`), atualização em tempo real de `data-theme`, sincronização de `aria-pressed`, `aria-checked`, classes ativas, persistência em `localStorage` sob chave `vertice_theme` e troca instantânea das logos.
* **Validação por Clique Real:** Validado via CDP / navegador real com clique do mouse gerando transição imediata para Current, Navy e Petrol, persistência após refresh (F5) e zero erros no console.

#### B. Navbar Descongestionada (Zero Quebra de Linha / Zero Wrap)
* **Diagnóstico:** A navbar continha 10 links de navegação que quebravam em múltiplas linhas em resoluções desktop padrão (1440x900, 1366x768 e 1280x720), causando sobreposição espacial com o seletor de identidade e esmagamento do CTA principal.
* **Correção:**
  * Container do header ampliado para `max-width: 1560px` com paddings dinâmicos `clamp(16px, 2.5vw, 40px)`.
  * `white-space: nowrap !important;` aplicado a todos os links de navegação e botões do header.
  * Espaçamento entre links regulado por `clamp(8px, 1.2vw, 22px)` e tipografia fluida `clamp(0.76rem, 0.82vw, 0.86rem)`.
  * Media queries progressivas adicionadas para desktop compacto (`1081px` a `1380px`), garantindo que 1280x720 e 1366x768 mantenham todos os 10 links rigorosamente em uma única linha com folga espacial.
  * Seletor de identidade pill isolado como bloco autônomo (`flex-shrink: 0`, gap de 6px, botões circulares de 24px) com anel de foco nítido e discreto no item ativo.
  * No mobile (`<= 768px`), o seletor da barra superior fica oculto, abrindo espaço limpo para a logo e o botão de menu (hambúrguer/X), com o seletor de identidade perfeitamente acomodado dentro do menu drawer ("IDENTIDADE VISUAL: ● ● ●").

#### C. Novas Evidências Geradas (`C:\dev\vertice-site-review\`)
* `08_navbar_fixes/`
  * `01_navbar_current_1440.png` — Navbar Current 1440x900 (1 linha, folga perfeita)
  * `02_navbar_navy_1440.png` — Navbar Navy 1440x900 (após clique real)
  * `03_navbar_petrol_1440.png` — Navbar Petrol 1440x900 (após clique real)
  * `04_navbar_1280.png` — Navbar 1280x720 (10 links rigorosamente em 1 linha)
  * `05_mobile_theme_switcher.png` — Menu Mobile aberto com seletor de identidade ativo
* `09_theme_click_validation/`
  * `01_current.png` — Estado Current inicial
  * `02_navy_after_click.png` — Estado Navy após clique real
  * `03_petrol_after_click.png` — Estado Petrol após clique real

### 11. Integração das Logos Oficiais Dinâmicas e Roteamento de Candidatos (Talentos)

#### A. Logos Oficiais da Marca (Assets do Juca)
* **Diretório de Origem Fornecido:** `C:\Users\wareb\OneDrive\Desktop\Area de Trabalho\Impulsy.ai\Vertice\assets\novas logos`
* **Assets Oficiais Catalogados e Mapeados em `site/assets/logos/`:**
  * **Navy:**
    * `logo-navy-transparent-official.png` (1254x1254, RGBA com canal alfa transparente, foreground escuro Navy) — aplicado em superfícies claras (`light-bg`).
    * `logo-navy-dark-official.png` (1254x1254, RGB, fundo sólido `#0A2E49`, foreground claro) — aplicado em superfícies escuras (`dark-bg`).
    * `logo-navy-light-solid-official.png` (1254x1254, RGB, fundo sólido `#E7E0CF`, foreground Navy).
  * **Verde-Petróleo:**
    * `logo-petrol-transparent-official.png` (1254x1254, RGBA com canal alfa transparente, foreground escuro Petrol) — aplicado em superfícies claras (`light-bg`).
    * `logo-petrol-dark-official.png` (1254x1254, RGB, fundo sólido `#184844`, foreground claro) — aplicado em superfícies escuras (`dark-bg`).
    * `logo-petrol-light-solid-official.png` (1254x1254, RGB, fundo sólido `#E8DFCE`, foreground Petrol).
  * **Current (Vinho Institucional):**
    * `logo-cortada.png` (light-bg)
    * `logo-negativa-branca.png` (dark-bg)
* **Preservação Visual 100% Estrita:** Nenhuma alteração geométrica, sem filtros CSS (`invert`, `hue-rotate`, etc.), preservação total das 3 faces poligonais do símbolo triangular da Vértice e tipografia institucional.
* **Troca Instantânea & Zero-FOUC:** O sistema `THEME_LOGOS` e a função central `setTheme(theme)` atualizam todos os seletores e imagens `data-logo-variant` no ato do clique (sem reload). Além disso, o script no `<head>` pré-aplica as logos oficiais em tempo zero caso o tema esteja salvo no `localStorage`.

#### B. Roteamento Arquitetural: Candidato vs. CRM Comercial
* **Separação Obrigatória:**
  * **EMPRESA:** Continua direcionado ao pipeline comercial corporativo do Frappe CRM (`/api/resource/CRM Lead`).
  * **CANDIDATO:** Roteado com exclusividade para a **People Foundation / Banco de Talentos** (`vertice_candidates`). **Candidatos nunca viram CRM Lead.**
* **Implementação Server-Side em `api/lead.js`:**
  * Validação severa de dados (`nome`, `email`, `whatsapp`, `area_atuacao`, etc.).
  * Normalização de telefone para formato **E.164** (`+55...`), e-mail para `email_normalized`, e parsing de cidade/UF.
  * Integração com endpoint REST Supabase (`vertice_candidates`) se configurado em ambiente.
  * Buffer persistente de segurança e ingestão em `site/data/candidates.jsonl` com **deduplicação ativa** por `email_normalized` e `phone_e164` (idempotência garantida).
  * O diretório `site/data/` é protegido com regras HTTP 403 Forbidden no `dev-server.js` e protegido de versionamento via `site/data/.gitignore`.
* **Evidências Geradas (`C:\dev\vertice-site-review\10_official_logos\`):**
  * `01_current_header.png` — Header Current com logo vinho
  * `02_navy_header.png` — Header Navy com logo oficial Navy transparente
  * `03_petrol_header.png` — Header Petrol com logo oficial Petrol transparente
  * `04_navy_dark_section.png` — Seção escura (#solucoes) em tema Navy
  * `05_petrol_dark_section.png` — Seção escura (#solucoes) em tema Petrol
  * `06_mobile_navy.png` — Viewport Mobile (390x844) em tema Navy
  * `07_mobile_petrol.png` — Viewport Mobile (390x844) em tema Petrol

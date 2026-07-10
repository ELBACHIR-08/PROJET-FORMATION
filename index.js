document.addEventListener('DOMContentLoaded', async () => {
  // --------------------------------------------------------
  // 1. INITIALISATION SUPABASE
  // --------------------------------------------------------
  const supabaseUrl = window.ENV?.SUPABASE_URL;
  const supabaseKey = window.ENV?.SUPABASE_ANON_KEY;
  let supabase = null;
  let session = null;
  let currentUserRole = 'LECTEUR';

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase config missing!");
  } else {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // Auth Check
    const { data: { session: currentSession }, error: authError } = await supabase.auth.getSession();
    
    if (!currentSession) {
      window.location.href = '/login.html';
      return;
    }

    session = currentSession;
    const metadata = session.user.user_metadata || {};
    currentUserRole = metadata.role || 'LECTEUR'; // Default role is LECTEUR

    // Hardcoded Super Admin for the owner (accepts aliases like +test)
    if (currentSession.user.email && currentSession.user.email.includes('mouhamadouelbachir')) {
      currentUserRole = 'SUPER_ADMIN';
    }

    // Hide Admin sidebar button if LECTEUR
    const btnGotoAdmin = document.getElementById('btn-goto-admin');
    if (btnGotoAdmin && currentUserRole === 'LECTEUR') {
      btnGotoAdmin.style.display = 'none';
    }

    // Affichage des informations utilisateur dans la sidebar
    const avatarElem = document.getElementById('sidebar-user-avatar');
    const nameElem = document.getElementById('sidebar-user-name');
    const roleElem = document.getElementById('sidebar-user-role');

    // 1. Set Name (Fallback to email if empty)
    if (nameElem) {
      if (metadata.first_name && metadata.last_name) {
        nameElem.textContent = `${metadata.first_name} ${metadata.last_name}`;
      } else if (metadata.first_name) {
        nameElem.textContent = metadata.first_name;
      } else {
        nameElem.textContent = session.user.email.split('@')[0];
      }
    }

    // Set Welcome Greeting Name
    const welcomeUserElem = document.getElementById('welcome-user-name');
    if (welcomeUserElem) {
      welcomeUserElem.textContent = metadata.first_name || session.user.email.split('@')[0];
    }

    // 2. Set Role
    if (roleElem) {
      roleElem.textContent = metadata.job_title || 'Utilisateur';
    }

    // 3. Set Avatar
    if (avatarElem) {
      if (metadata.avatar_url) {
        avatarElem.innerHTML = `<img src="${metadata.avatar_url}" alt="Avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        avatarElem.style.background = 'transparent';
        avatarElem.style.border = '2px solid var(--primary)';
        avatarElem.style.overflow = 'hidden';
      } else {
        const firstLetter = (metadata.first_name || session.user.email).charAt(0).toUpperCase();
        const secondLetter = metadata.last_name ? metadata.last_name.charAt(0).toUpperCase() : '';
        avatarElem.textContent = `${firstLetter}${secondLetter}`;
      }
    }

    // 4. Modals Setup
    setupProfileModal(supabase, session.user);
    setupWikiModals(supabase, session.user);
    setupWikiBot(supabase);
    setupHomeManagement(supabase, currentUserRole);

    // Déconnexion
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = '/login.html';
      });
    }
  }

  // --------------------------------------------------------
  // 2. STATE ET NAVIGATION DYNAMIQUE
  // --------------------------------------------------------
  let currentVertical = 'LIVE';
  window.currentVertical = currentVertical;
  let currentFormat = 'PARCOURS_CLIENT';
  let currentOperator = null;

  const welcomeView = document.getElementById('welcome-view');
  const operatorView = document.getElementById('operator-view');
  const dashboardView = document.getElementById('dashboard-view');
  const parcoursView = document.getElementById('parcours-view');
  const adminView = document.getElementById('admin-view');
  const btnBackOperator = document.getElementById('btn-back-operator');
  const btnBackDashboard = document.getElementById('btn-back-dashboard');
  const operatorsGrid = document.getElementById('operators-grid');
  const servicesGrid = document.getElementById('services-grid');
  const gridTitle = document.getElementById('grid-title');

  function slugify(text) {
    if (!text) return '';
    return text.toString().toLowerCase()
      .trim()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-');        // Replace multiple - with single -
  }

  // Routing functions
  function handleRoute(path) {
    // Reset views
    if (welcomeView) welcomeView.style.display = 'none';
    if (operatorView) operatorView.style.display = 'none';
    if (dashboardView) dashboardView.style.display = 'none';
    if (parcoursView) parcoursView.style.display = 'none';
    if (adminView) adminView.style.display = 'none';
    
    // Clear sidebar active states
    document.querySelectorAll('#sidebar-verticals .line-sidebar-item').forEach(n => n.classList.remove('active'));

    const cleanPath = path.replace(/\/$/, '').toLowerCase() || '/';

    if (cleanPath === '/' || cleanPath === '/home') {
      if (welcomeView) welcomeView.style.display = 'block';
      window.scrollTo(0, 0);
      return;
    }

    if (cleanPath === '/admin') {
      if (currentUserRole === 'LECTEUR') {
        alert("Accès refusé. Vous n'avez pas les droits d'administration.");
        navigateTo('/');
        return;
      }
      if (adminView) {
        adminView.style.display = 'block';
        loadAdminUsers();
      }
      window.scrollTo(0, 0);
      return;
    }

    // Parse vertical operator service subrouting
    const parts = cleanPath.split('/').filter(Boolean);
    const verticalKey = parts[0].toUpperCase();
    const verticals = ['LIVE', 'LOYALTY', 'CONTENT', 'PASS'];

    if (verticals.includes(verticalKey)) {
      currentVertical = verticalKey;
      window.currentVertical = currentVertical;

      // set sidebar active
      const activeNav = document.querySelector(`#sidebar-verticals .line-sidebar-item[data-vertical="${verticalKey}"]`);
      if (activeNav) activeNav.classList.add('active');

      const operators = ['Orange Senegal', 'YAS Senegal', 'Expresso Senegal'];

      if (parts[1]) {
        if (parts[1] === 'wiki') {
          currentFormat = 'WIKI';
          currentOperator = null;
          if (dashboardView) dashboardView.style.display = 'block';
          renderDashboardGrid();
        } else {
          const foundOp = operators.find(op => slugify(op) === parts[1]);
          if (foundOp) {
            currentOperator = foundOp;
            currentFormat = 'PARCOURS_CLIENT';

            if (parts[2]) {
              const serviceId = parts[2];
              if (parcoursView) parcoursView.style.display = 'block';
              loadParcoursView(serviceId);
            } else {
              if (dashboardView) dashboardView.style.display = 'block';
              renderDashboardGrid();
            }
          } else {
            currentOperator = null;
            if (operatorView) operatorView.style.display = 'block';
            renderOperatorGrid();
          }
        }
      } else {
        currentOperator = null;
        currentFormat = 'PARCOURS_CLIENT';
        if (operatorView) operatorView.style.display = 'block';
        renderOperatorGrid();
      }
      window.scrollTo(0, 0);
      return;
    }

    // Default fallback
    if (welcomeView) welcomeView.style.display = 'block';
    window.scrollTo(0, 0);
  }

  function navigateTo(path) {
    if (window.location.pathname !== path) {
      history.pushState({}, "", path);
    }
    handleRoute(window.location.pathname);
  }

  window.addEventListener('popstate', () => {
    handleRoute(window.location.pathname);
  });

  // Sidebar clicks
  document.querySelectorAll('#sidebar-verticals .line-sidebar-item').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const vertical = el.getAttribute('data-vertical').toLowerCase();
      navigateTo(`/${vertical}`);
    });
  });

  // LineSidebar interactive effect
  const lineSidebar = document.getElementById('sidebar-verticals');
  if (lineSidebar) {
    const items = lineSidebar.querySelectorAll('.line-sidebar-item');
    const maxShift = 20;
    const proximityRadius = 120;

    lineSidebar.addEventListener('mousemove', (e) => {
      const mouseY = e.clientY;

      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.top + itemRect.height / 2;
        const distance = Math.abs(mouseY - itemCenter);
        
        if (distance < proximityRadius) {
          // Smooth falloff (gaussian-like)
          const ratio = 1 - (distance / proximityRadius);
          const shift = ratio * ratio * maxShift;
          item.style.transform = `translateX(${shift}px)`;
        } else {
          item.style.transform = `translateX(0px)`;
        }
      });
    });

    lineSidebar.addEventListener('mouseleave', () => {
      items.forEach((item) => {
        item.style.transform = `translateX(0px)`;
      });
    });
  }

  // Header WIKI button click
  const btnHeaderWiki = document.getElementById('btn-header-wiki');
  if (btnHeaderWiki) {
    btnHeaderWiki.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(`/${currentVertical.toLowerCase()}/wiki`);
    });
  }

  // Helper function to return to Home page
  const navigateToHome = () => {
    navigateTo('/home');
  };

  // Header Title click
  const btnHeaderHome = document.getElementById('btn-header-home');
  if (btnHeaderHome) {
    btnHeaderHome.addEventListener('click', () => {
      navigateTo('/home');
    });
  }

  // Go to Admin page click
  const btnGotoAdmin = document.getElementById('btn-goto-admin');
  if (btnGotoAdmin) {
    btnGotoAdmin.addEventListener('click', () => {
      navigateTo('/admin');
    });
  }

  // Sidebar Logo click
  const btnSidebarLogo = document.getElementById('btn-sidebar-logo');
  if (btnSidebarLogo) {
    btnSidebarLogo.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToHome();
    });
  }

  // Welcome page banner launch button click
  const btnWelcomeLaunchWiki = document.getElementById('btn-welcome-launch-wiki');
  if (btnWelcomeLaunchWiki) {
    btnWelcomeLaunchWiki.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(`/${currentVertical.toLowerCase()}/wiki`);
    });
  }

  // Welcome page vertical cards click
  document.querySelectorAll('.welcome-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const vertical = card.getAttribute('data-vertical');
      if (vertical) {
        navigateTo(`/${vertical.toLowerCase()}`);
      }
    });
  });

  // Operator back button click listener
  if (btnBackOperator) {
    btnBackOperator.addEventListener('click', () => {
      navigateTo(`/${currentVertical.toLowerCase()}`);
    });
  }

  if (btnBackDashboard) {
    btnBackDashboard.addEventListener('click', () => {
      navigateTo(`/${currentVertical.toLowerCase()}/${slugify(currentOperator)}`);
    });
  }

  function getOperatorLogoHTML(opName) {
    if (opName.includes('Orange')) {
      return `
        <div class="operator-logo-wrapper orange-logo-wrapper">
          <div class="orange-logo-box">
            <span class="orange-logo-text">orange</span>
          </div>
        </div>
      `;
    } else if (opName.includes('YAS')) {
      return `
        <div class="operator-logo-wrapper yas-logo-wrapper">
          <div class="yas-logo-shape">
            <span class="yas-logo-text">Yas</span>
          </div>
        </div>
      `;
    } else if (opName.includes('Expresso')) {
      return `
        <div class="operator-logo-wrapper expresso-logo-wrapper">
          <div class="expresso-logo-box">
            <svg class="expresso-lotus" viewBox="0 0 100 80" fill="none" stroke="#ffffff" stroke-width="5" stroke-linejoin="round">
              <path d="M50,70 C55,45 55,20 50,10 C45,20 45,45 50,70 Z" fill="none" />
              <path d="M50,70 C35,50 30,30 40,22 C45,26 48,45 50,70 Z" fill="none" />
              <path d="M50,70 C65,50 70,30 60,22 C55,26 52,45 50,70 Z" fill="none" />
              <path d="M50,70 C20,55 15,40 25,35 C32,38 42,52 50,70 Z" fill="none" />
              <path d="M50,70 C80,55 85,40 75,35 C68,38 58,52 50,70 Z" fill="none" />
            </svg>
            <span class="expresso-logo-text">expresso</span>
          </div>
        </div>
      `;
    }
    return `
      <div class="operator-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
      </div>
    `;
  }

  function renderOperatorGrid() {
    operatorsGrid.innerHTML = '';
    const operators = ['Orange Senegal', 'YAS Senegal', 'Expresso Senegal'];
    
    operators.forEach(op => {
      const card = document.createElement('div');
      card.className = 'operator-card';
      card.innerHTML = `
        ${getOperatorLogoHTML(op)}
        <div class="operator-title">${op}</div>
        <div class="operator-subtitle">Explorer les services ${currentVertical}</div>
      `;
      
      card.addEventListener('click', (e) => {
        // Create ripple effect
        const rect = card.getBoundingClientRect();
        const ripple = document.createElement('div');
        ripple.className = 'operator-ripple';
        ripple.style.left = `${e.clientX - rect.left}px`;
        ripple.style.top = `${e.clientY - rect.top}px`;
        card.appendChild(ripple);

        // Create particles
        for (let i = 0; i < 12; i++) {
          const particle = document.createElement('div');
          particle.className = 'operator-particle';
          if (op.includes('Orange')) {
            particle.style.background = '#ff6600';
          } else if (op.includes('YAS')) {
            particle.style.background = '#fbc815';
          } else {
            particle.style.background = '#8a3ab9';
          }
          
          const angle = (i / 12) * Math.PI * 2;
          const velocity = 50 + Math.random() * 50;
          const tx = Math.cos(angle) * velocity;
          const ty = Math.sin(angle) * velocity;
          
          particle.style.setProperty('--tx', `${tx}px`);
          particle.style.setProperty('--ty', `${ty}px`);
          particle.style.left = `${e.clientX - rect.left}px`;
          particle.style.top = `${e.clientY - rect.top}px`;
          
          card.appendChild(particle);
          setTimeout(() => particle.remove(), 600);
        }

        // Card press animation
        card.style.transform = 'scale(0.92)';
        card.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        
        setTimeout(() => {
          ripple.remove();
          navigateTo(`/${currentVertical.toLowerCase()}/${slugify(op)}`);
        }, 350);
      });
      
      operatorsGrid.appendChild(card);
    });
  }

  async function renderDashboardGrid() {
    servicesGrid.innerHTML = '';
    const wikiActions = document.getElementById('wiki-actions');
    const wikiBotContainer = document.getElementById('wiki-bot-container');
    
    // Si c'est WIKI
    if (currentFormat === 'WIKI') {
      if (btnBackOperator) btnBackOperator.style.display = 'none';
      gridTitle.textContent = `Assistant IA — Base de connaissances ${currentVertical}`;
      document.getElementById('grid-subtitle').textContent = "Posez vos questions, l'IA vous répondra à partir des documents internes.";
      
      servicesGrid.style.display = 'none';
      wikiBotContainer.style.display = 'flex';
      
      // Afficher le bouton Créer si Admin
      if (session.user.user_metadata?.role === 'ADMIN' || true) {
        wikiActions.style.display = 'flex';
      } else {
        wikiActions.style.display = 'none';
      }
      return;
    }

    // Sinon, comportement normal (PARCOURS_CLIENT)
    if (btnBackOperator) btnBackOperator.style.display = 'flex';
    wikiBotContainer.style.display = 'none';
    wikiActions.style.display = 'none';

    servicesGrid.style.display = 'grid'; // Restaurer le grid si on quitte WIKI
    gridTitle.textContent = `${currentOperator} — Services ${currentVertical}`;
    document.getElementById('grid-subtitle').textContent = "Sélectionnez un service pour configurer ses captures d'acquisition.";

    const filteredServices = kmsData.services.filter(s => 
      s.vertical === currentVertical && s.format === currentFormat && s.operator === currentOperator
    );

    if (filteredServices.length === 0) {
      servicesGrid.innerHTML = `<p style="grid-column: 1/-1; color: var(--muted-foreground); text-align: center; padding: 3rem;">Aucun service disponible pour cette section.</p>`;
      return;
    }

    filteredServices.forEach(service => {
      const card = document.createElement('div');
      card.className = 'feature-card';
      card.style.cursor = 'pointer';
      card.style.transition = 'all 0.2s ease';
      card.onmouseover = () => card.style.transform = 'translateY(-5px)';
      card.onmouseout = () => card.style.transform = 'translateY(0)';
      
      card.innerHTML = `
        <div class="feature-icon" style="background: var(--primary); color: white;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </div>
        <h4 class="feature-title" style="margin-top: 1rem;">${service.title}</h4>
        <p class="feature-text">${service.description.substring(0, 80)}...</p>
        <div style="margin-top: 1.5rem; color: var(--primary); font-weight: 600; font-size: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
          Voir les captures &amp; Mockups <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </div>
      `;

      card.addEventListener('click', () => {
        navigateTo(`/${currentVertical.toLowerCase()}/${slugify(currentOperator)}/${service.id}`);
      });

      servicesGrid.appendChild(card);
    });
  }

  // --------------------------------------------------------
  // 3. CHARGEMENT DU PARCOURS
  // --------------------------------------------------------
  async function loadParcoursView(serviceId) {
    const service = kmsData.services.find(s => s.id === serviceId);
    if (!service) return;

    // Header
    document.getElementById('parcours-vertical').textContent = 'PARCOURS CLIENT';
    document.getElementById('parcours-title-text').textContent = service.vertical; // "CONTENT" au lieu de "Maternelle Montessori"
    document.getElementById('parcours-desc-text').innerHTML = `<strong style="color:white;">Service :</strong> ${service.title} — ${service.description}`;

    // Charger les images sauvegardées depuis Supabase
    let savedImages = {};
    if (supabase) {
      const { data } = await supabase
        .from('acquisition_flows')
        .select('*')
        .eq('service_id', serviceId);
      if (data) {
        data.forEach(row => {
          const key = `${row.flow_type}_${row.step_index}`;
          savedImages[key] = row.image_url;
        });
      }
    }

    // Toggle buttons
    const toggleContainer = document.getElementById('flow-toggle-container');
    toggleContainer.innerHTML = '';
    const flows = Object.values(service.flows);
    let activeFlowId = flows[0].id;

    flows.forEach((flow, i) => {
      const isWifi = flow.id.includes('wifi');
      const btn = document.createElement('button');
      btn.className = `flow-toggle-btn ${i === 0 ? 'active' : ''}`;
      btn.dataset.flowId = flow.id;
      btn.innerHTML = `<span class="toggle-icon">${isWifi ? '📶' : '📱'}</span> ${flow.label}`;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.flow-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.flow-container').forEach(c => c.classList.remove('active'));
        const target = document.getElementById(flow.id);
        if (target) target.classList.add('active');
        activeFlowId = flow.id;
      });
      toggleContainer.appendChild(btn);
    });

    // Content area
    const contentContainer = document.getElementById('parcours-content-container');
    contentContainer.innerHTML = '';

    flows.forEach((flow, flowIndex) => {
      const isWifi = flow.id.includes('wifi');
      const themeClass = isWifi ? 'wifi-theme' : 'fourg-theme';
      const flowEl = document.createElement('div');
      flowEl.id = flow.id;
      flowEl.className = `flow-container ${themeClass} ${flowIndex === 0 ? 'active' : ''}`;

      // Section title
      const sectionTitle = document.createElement('div');
      sectionTitle.className = 'flow-section-title';
      sectionTitle.innerHTML = `
        <div class="flow-section-label">
          ${isWifi ? '📶 Réseau Wi-Fi — PIN Code' : '📱 Réseau 4G — Direct Carrier Billing'} 
          <span style="color: var(--primary); margin-left: 0.5rem; padding-left: 0.5rem; border-left: 2px solid var(--border);">${service.title}</span>
        </div>
        <div class="flow-section-subtitle">${isWifi ? 'Connexion via SMS OTP / Numéro de téléphone + Code PIN' : 'Connexion automatique via Header Enrichment + Direct Carrier Billing'}</div>
      `;
      flowEl.appendChild(sectionTitle);

      // Phone mockups grid (steps intégrés dans chaque card)
      const grid = document.createElement('div');
      grid.className = 'mockups-grid';

      flow.steps.forEach((step, stepIndex) => {
        const savedKey = `${isWifi ? 'wifi' : '4g'}_${stepIndex}`;
        const savedImageUrl = savedImages[savedKey] || null;
        const phoneCard = buildPhoneCard(step, stepIndex, flow.id, serviceId, isWifi, savedImageUrl, supabase);
        grid.appendChild(phoneCard);
      });

      flowEl.appendChild(grid);
      contentContainer.appendChild(flowEl);
    });
  }

  // --------------------------------------------------------
  // 4. CONSTRUCTION DES ÉLÉMENTS UI
  // --------------------------------------------------------
  function buildStepsTrack(steps, isWifi) {
    // Kept for legacy — steps are now integrated into phone cards
    return document.createDocumentFragment();
  }

  function buildPhoneCard(step, stepIndex, flowId, serviceId, isWifi, savedImageUrl, supabase) {
    const flowType = isWifi ? 'wifi' : '4g';
    const themeClass = isWifi ? 'wifi-theme' : 'fourg-theme';
    const cardId = `phone-${flowId}-${stepIndex}`;
    const inputId = `file-input-${flowId}-${stepIndex}`;

    const card = document.createElement('div');
    card.className = `phone-card ${themeClass}`;
    card.innerHTML = `
      <!-- Step header -->
      <div class="phone-step-header">
        <div class="phone-step-badge ${themeClass}">${stepIndex + 1}</div>
        <div class="phone-step-name">${step.title}</div>
      </div>

      <div class="phone-frame-wrapper">
        <div class="phone-frame" id="${cardId}">
          <div class="phone-notch">
            <div class="phone-notch-cam"></div>
          </div>
          <div class="phone-screen">
            ${savedImageUrl
              ? `<img class="phone-screen-image" src="${savedImageUrl}" alt="${step.title}">`
              : `<label for="${inputId}" class="phone-upload-zone" id="zone-${cardId}">
                  <div class="upload-icon-phone">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  </div>
                  <span class="upload-zone-text">Déposer ou cliquer<br>pour ajouter</span>
                </label>`
            }
          </div>
          ${savedImageUrl ? '<div class="upload-success-badge"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>' : ''}
        </div>
        <input type="file" id="${inputId}" class="phone-file-input" accept="image/*">
      </div>

      <div class="phone-card-info">
        <div class="phone-card-step-name">${step.title}</div>
        <div class="phone-card-step-desc">${step.description}</div>
      </div>

      <div class="phone-card-actions">
        <label for="${inputId}" class="phone-upload-btn">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          ${savedImageUrl ? 'Changer l\'image' : 'Importer'}
        </label>
        <div class="uploading-indicator" id="loading-${cardId}">
          <div class="upload-spinner"></div> Upload...
        </div>
      </div>
    `;

    // File input change handler
    const input = card.querySelector(`#${inputId}`);
    const phoneFrame = card.querySelector(`#${cardId}`);
    const loadingIndicator = card.querySelector(`#loading-${cardId}`);
    const uploadBtn = card.querySelector('.phone-upload-btn');

    // Drag over / leave on phone
    const phoneScreen = phoneFrame.querySelector('.phone-screen');
    phoneScreen.addEventListener('dragover', (e) => {
      e.preventDefault();
      const zone = phoneScreen.querySelector('.phone-upload-zone');
      if (zone) zone.classList.add('drag-over');
    });
    phoneScreen.addEventListener('dragleave', () => {
      const zone = phoneScreen.querySelector('.phone-upload-zone');
      if (zone) zone.classList.remove('drag-over');
    });
    phoneScreen.addEventListener('drop', (e) => {
      e.preventDefault();
      const zone = phoneScreen.querySelector('.phone-upload-zone');
      if (zone) zone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleFileUpload(file, phoneFrame, loadingIndicator, uploadBtn, serviceId, flowType, stepIndex, step.title, supabase);
      }
    });

    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        handleFileUpload(file, phoneFrame, loadingIndicator, uploadBtn, serviceId, flowType, stepIndex, step.title, supabase);
      }
    });

    return card;
  }

  // --------------------------------------------------------
  // 5. GESTION DE L'UPLOAD
  // --------------------------------------------------------
  async function handleFileUpload(file, phoneFrame, loadingIndicator, uploadBtn, serviceId, flowType, stepIndex, stepTitle, supabase) {
    // Preview local immédiat (sans attendre Supabase)
    const localUrl = URL.createObjectURL(file);
    renderImageInPhone(phoneFrame, localUrl);

    // Show loader
    loadingIndicator.style.display = 'flex';
    uploadBtn.style.display = 'none';

    if (!supabase) {
      // Mode sans BDD: juste preview local
      loadingIndicator.style.display = 'none';
      uploadBtn.style.display = 'flex';
      uploadBtn.textContent = "Changer l'image";
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      // Génération d'un nom de fichier unique
      const ext = file.name.split('.').pop();
      const fileName = `${serviceId}/${flowType}/step-${stepIndex}-${Date.now()}.${ext}`;

      // Upload vers Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('flow-screenshots')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (storageError) throw storageError;

      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from('flow-screenshots')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Sauvegarder la référence en base
      const { error: dbError } = await supabase
        .from('acquisition_flows')
        .upsert({
          service_id: serviceId,
          flow_type: flowType,
          step_index: stepIndex,
          step_title: stepTitle,
          image_url: publicUrl,
          uploaded_by: session.user.id
        }, { onConflict: 'service_id,flow_type,step_index' });

      if (dbError) throw dbError;

      console.log(`✅ Image uploadée : ${publicUrl}`);

    } catch (err) {
      console.error("Erreur upload:", err.message);
    } finally {
      loadingIndicator.style.display = 'none';
      uploadBtn.style.display = 'flex';
      uploadBtn.textContent = "Changer l'image";
      // Badge de succès
      const existingBadge = phoneFrame.querySelector('.upload-success-badge');
      if (!existingBadge) {
        const badge = document.createElement('div');
        badge.className = 'upload-success-badge';
        badge.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        phoneFrame.appendChild(badge);
      }
    }
  }

  function renderImageInPhone(phoneFrame, imageUrl) {
    const screen = phoneFrame.querySelector('.phone-screen');
    if (!screen) return;

    // Supprimer la zone d'upload si présente
    const zone = screen.querySelector('.phone-upload-zone');
    if (zone) zone.remove();

    // Insérer ou remplacer l'image
    let img = screen.querySelector('.phone-screen-image');
    if (!img) {
      img = document.createElement('img');
      img.className = 'phone-screen-image';
      screen.appendChild(img);
    }
    img.src = imageUrl;
    img.alt = 'Screenshot';
  }

  // --------------------------------------------------------
  // ADMIN VIEW LOGIC
  // --------------------------------------------------------

  // User Management Logic
  async function loadAdminUsers() {
    const listBody = document.getElementById('admin-users-list');
    if (!listBody) return;
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error("Erreur de récupération");
      const users = await response.json();
      
      listBody.innerHTML = '';
      users.forEach(u => {
        const meta = u.user_metadata || {};
        const role = meta.role || 'LECTEUR';
        const roleColor = role === 'SUPER_ADMIN' ? 'var(--destructive)' : (role === 'ADMIN' ? 'var(--primary)' : 'var(--muted-foreground)');
        
        listBody.innerHTML += `
          <tr style="border-bottom: 1px solid var(--border);">
            <td style="padding: 1rem;">
              <div style="font-weight: 600;">${meta.first_name || ''} ${meta.last_name || ''}</div>
              <div style="font-size: 0.85rem; color: var(--muted-foreground);">${u.email}</div>
            </td>
            <td style="padding: 1rem;">
              <span style="background-color: ${roleColor}; color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">${role}</span>
            </td>
            <td style="padding: 1rem;">
              <button class="btn btn-outline" style="font-size: 0.75rem; padding: 0.3rem 0.5rem;">Modifier</button>
            </td>
          </tr>
        `;
      });
    } catch (e) {
      listBody.innerHTML = `<tr><td colspan="3" style="padding: 2rem; text-align: center; color: var(--destructive);">Impossible de charger les utilisateurs. Vérifiez l'API.</td></tr>`;
    }
  }

  // Create User Modal Logic
  const modalCreateUser = document.getElementById('modal-create-user');
  const btnNewUser = document.getElementById('btn-admin-new-user');
  const btnCloseCreateUser = document.getElementById('btn-close-create-user');
  const formCreateUser = document.getElementById('form-create-user');
  const createUserError = document.getElementById('create-user-error');
  const btnSubmitCreateUser = document.getElementById('btn-submit-create-user');

  if (btnNewUser && modalCreateUser) {
    btnNewUser.addEventListener('click', () => {
      modalCreateUser.style.display = 'flex';
      createUserError.style.display = 'none';
      formCreateUser.reset();
    });
  }
  if (btnCloseCreateUser) {
    btnCloseCreateUser.addEventListener('click', (e) => {
      e.preventDefault();
      modalCreateUser.style.display = 'none';
    });
  }

  if (formCreateUser) {
    formCreateUser.addEventListener('submit', async (e) => {
      e.preventDefault();
      createUserError.style.display = 'none';
      btnSubmitCreateUser.disabled = true;
      btnSubmitCreateUser.textContent = 'Création...';
      
      const name = document.getElementById('new-user-name').value;
      const email = document.getElementById('new-user-email').value;
      const password = document.getElementById('new-user-password').value;
      const role = document.getElementById('new-user-role').value;
      
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, role })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erreur inconnue");
        
        modalCreateUser.style.display = 'none';
        alert("Utilisateur créé avec succès !");
        loadAdminUsers();
      } catch (err) {
        createUserError.textContent = err.message;
        createUserError.style.display = 'block';
      } finally {
        btnSubmitCreateUser.disabled = false;
        btnSubmitCreateUser.textContent = 'Créer le compte';
      }
    });
  }

  // Initial render based on URL
  handleRoute(window.location.pathname);
});

// Profile Modal Setup Function
function setupProfileModal(supabase, user) {
  const btnOpen = document.getElementById('btn-open-profile');
  const btnClose = document.getElementById('btn-close-profile');
  const modal = document.getElementById('profile-modal');
  const profileForm = document.getElementById('profile-form');
  const avatarInput = document.getElementById('profile-avatar');
  const avatarPreview = document.getElementById('profile-avatar-preview');
  const errorMsg = document.getElementById('profile-error');
  const btnSave = document.getElementById('btn-save-profile');

  if (!modal || !btnOpen) return;

  let selectedAvatarFile = null;

  // Open Modal
  btnOpen.addEventListener('click', () => {
    // Fill current data
    const metadata = user.user_metadata || {};
    const inputName = document.getElementById('profile-fullname');
    const inputJob = document.getElementById('profile-job');

    if (metadata.first_name && metadata.last_name) {
      inputName.value = `${metadata.first_name} ${metadata.last_name}`;
    } else if (metadata.first_name) {
      inputName.value = metadata.first_name;
    }
    
    if (metadata.job_title) {
      inputJob.value = metadata.job_title;
    }

    if (metadata.avatar_url) {
      avatarPreview.innerHTML = `<img src="${metadata.avatar_url}" style="width:100%; height:100%; object-fit:cover;">`;
    }

    errorMsg.style.display = 'none';
    modal.style.display = 'flex';
  });

  // Close Modal
  const closeModal = () => {
    modal.style.display = 'none';
    selectedAvatarFile = null; // Reset selection
  };
  
  btnClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Avatar Preview
  avatarInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      selectedAvatarFile = e.target.files[0];
      const reader = new FileReader();
      reader.onload = function(evt) {
        avatarPreview.innerHTML = `<img src="${evt.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
      }
      reader.readAsDataURL(selectedAvatarFile);
    }
  });

  // Handle Form Submit
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.style.display = 'none';
    btnSave.disabled = true;
    btnSave.textContent = 'Enregistrement...';

    const fullName = document.getElementById('profile-fullname').value.trim();
    const jobTitle = document.getElementById('profile-job').value.trim();

    const nameParts = fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    try {
      let avatarUrl = user.user_metadata?.avatar_url || null;

      // Upload new avatar if changed
      if (selectedAvatarFile) {
        const fileExt = selectedAvatarFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, selectedAvatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
          
        avatarUrl = publicUrl;
      }

      // Update User Metadata
      const { data, error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          job_title: jobTitle,
          avatar_url: avatarUrl
        }
      });

      if (error) throw error;

      // Update local sidebar UI
      const nameElem = document.getElementById('sidebar-user-name');
      const roleElem = document.getElementById('sidebar-user-role');
      const sideAvatar = document.getElementById('sidebar-user-avatar');

      if (nameElem) nameElem.textContent = fullName;
      if (roleElem) roleElem.textContent = jobTitle;
      
      if (avatarUrl && sideAvatar) {
        sideAvatar.innerHTML = `<img src="${avatarUrl}" alt="Avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        sideAvatar.style.background = 'transparent';
        sideAvatar.style.border = '2px solid var(--primary)';
        sideAvatar.style.overflow = 'hidden';
      }

      // Close modal and reset
      closeModal();
      
    } catch (err) {
      errorMsg.textContent = "Erreur : " + err.message;
      errorMsg.style.display = 'block';
    } finally {
      btnSave.disabled = false;
      btnSave.textContent = 'Enregistrer les modifications';
    }
  });
}

// ==========================================
// WIKI MODALS LOGIC
// ==========================================
function setupWikiModals(supabase, user) {
  const btnCreateWiki = document.getElementById('btn-create-wiki');
  const createModal = document.getElementById('wiki-create-modal');
  const btnCloseCreate = document.getElementById('btn-close-wiki-create');
  const createForm = document.getElementById('wiki-create-form');
  const createError = document.getElementById('wiki-create-error');
  const btnSaveWiki = document.getElementById('btn-save-wiki');

  if (!btnCreateWiki || !createModal) return;

  // Open Create Modal
  btnCreateWiki.addEventListener('click', () => {
    createError.style.display = 'none';
    createForm.reset();
    createModal.style.display = 'flex';
  });

  // Close Create Modal
  const closeCreateModal = () => createModal.style.display = 'none';
  btnCloseCreate.addEventListener('click', closeCreateModal);
  createModal.addEventListener('click', (e) => {
    if (e.target === createModal) closeCreateModal();
  });

  // Handle Submit
  createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    createError.style.display = 'none';
    btnSaveWiki.disabled = true;
    btnSaveWiki.textContent = 'Enregistrement en cours...';

    const title = document.getElementById('wiki-title').value.trim();
    const content = document.getElementById('wiki-content').value.trim();
    const fileInput = document.getElementById('wiki-file');
    let fileUrl = null;

    try {
      // 1. Upload file if exists
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('wiki_documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('wiki_documents')
          .getPublicUrl(fileName);
          
        fileUrl = publicUrl;
      }

      // 2. Insert into DB
      const authorName = (user.user_metadata?.first_name && user.user_metadata?.last_name) 
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
        : (user.user_metadata?.first_name || user.email.split('@')[0]);

      const { data, error } = await supabase
        .from('wiki_articles')
        .insert([{
          title: title,
          content: content,
          vertical: window.currentVertical || 'LIVE', // Fallback
          file_url: fileUrl,
          author_name: authorName
        }]);

      if (error) throw error;

      closeCreateModal();
      
      // Refresh the dashboard if we are still on WIKI
      const btnFormatWiki = document.querySelector('[data-format="WIKI"]');
      if (btnFormatWiki && btnFormatWiki.classList.contains('active')) {
        btnFormatWiki.click(); // Trigger re-render
      }

    } catch (err) {
      createError.textContent = "Erreur : " + err.message;
      createError.style.display = 'block';
    } finally {
      btnSaveWiki.disabled = false;
      btnSaveWiki.textContent = 'Publier l\'article Wiki';
    }
  });
}

function openWikiReader(wiki) {
  const readModal = document.getElementById('wiki-reader-modal');
  if (!readModal) return;

  const btnCloseRead = document.getElementById('btn-close-wiki-read');
  const verticalBadge = document.getElementById('wiki-read-vertical');
  const title = document.getElementById('wiki-read-title');
  const author = document.getElementById('wiki-read-author');
  const date = document.getElementById('wiki-read-date');
  const content = document.getElementById('wiki-read-content');
  const attachmentContainer = document.getElementById('wiki-read-attachment-container');
  const attachmentBtn = document.getElementById('wiki-read-attachment-btn');

  // Fill content
  verticalBadge.textContent = wiki.vertical;
  title.textContent = wiki.title;
  author.textContent = wiki.author_name;
  
  const d = new Date(wiki.created_at);
  date.textContent = d.toLocaleDateString('fr-FR');
  
  content.textContent = wiki.content; 

  // Attachment
  if (wiki.file_url) {
    attachmentContainer.style.display = 'block';
    attachmentBtn.href = wiki.file_url;
  } else {
    attachmentContainer.style.display = 'none';
    attachmentBtn.href = "#";
  }

  readModal.style.display = 'flex';

  // Close logic
  const closeReadModal = () => readModal.style.display = 'none';
  btnCloseRead.onclick = closeReadModal;
  readModal.onclick = (e) => {
    if (e.target === readModal) closeReadModal();
  };
}

function setupWikiBot(supabase) {
  const chatForm = document.getElementById('bot-chat-form');
  const chatInput = document.getElementById('bot-chat-input');
  const messagesContainer = document.getElementById('bot-messages');

  if (!chatForm || !chatInput || !messagesContainer) return;

  const btnSubmit = chatForm.querySelector('button[type="submit"]');

  const sendMessage = async () => {
    const message = chatInput.value.trim();
    if (!message) return;

    // 1. Add User Message
    appendMessage('user', message);
    chatInput.value = '';

    // 2. Add Bot "Typing..." Message
    const typingId = appendMessage('bot', '...', true);

    // 3. Search Knowledge Base
    try {
      const { data: wikis, error } = await supabase
        .from('wiki_articles')
        .select('*')
        .eq('vertical', window.currentVertical || 'LIVE');

      if (error) throw error;

      const cleanMsg = message.toLowerCase().trim();
      if (['bonjour', 'bonsoir', 'salut', 'coucou', 'hello'].includes(cleanMsg)) {
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();
        let timeGreet = cleanMsg === 'bonsoir' ? 'Bonsoir' : 'Bonjour';
        appendMessage('bot', `${timeGreet} ! Que puis-je faire pour vous ? N'hésitez pas à me demander une définition (ex: ROI, CPA, Tracking) ou une procédure de la base de connaissances.`);
        return;
      }

      // 3. Call OpenAI Vercel API
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: message, 
            vertical: window.currentVertical || 'LIVE' 
          })
        });

        const data = await response.json();
        
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();

        if (response.ok && data.reply) {
          let formattedReply = data.reply
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
          appendMessage('bot', formattedReply);
        } else {
          appendMessage('bot', "Erreur : " + (data.error || "Réponse invalide de l'API"));
        }
      } catch (err) {
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();
        console.error(err);
        appendMessage('bot', "Erreur de connexion au serveur d'IA.");
      }
    } catch (err) {
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();
      console.error(err);
      appendMessage('bot', "Erreur technique : " + (err.message || JSON.stringify(err)));
    }
  };

  if (btnSubmit) {
    btnSubmit.addEventListener('click', (e) => {
      e.preventDefault();
      sendMessage();
    });
  }

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  function appendMessage(role, text, isTyping = false) {
    const id = 'msg-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.style.display = 'flex';
    div.style.gap = '1rem';
    div.style.alignItems = 'flex-start';
    div.style.maxWidth = '85%';
    div.style.animation = 'fadeIn 0.3s ease-out';
    
    if (role === 'user') {
      div.style.alignSelf = 'flex-end';
      div.style.flexDirection = 'row-reverse';
      
      div.innerHTML = `
        <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--secondary); display: flex; align-items: center; justify-content: center; color: var(--foreground); flex-shrink: 0; border: 1px solid var(--border);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
        <div style="background: var(--primary); padding: 1rem 1.25rem; border-radius: 12px; border-top-right-radius: 2px; color: white; font-size: 0.95rem; line-height: 1.5; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          ${text}
        </div>
      `;
    } else {
      div.style.alignSelf = 'flex-start';
      
      const contentStyle = isTyping 
        ? 'padding: 1rem 1.25rem; color: var(--muted-foreground); font-style: italic;' 
        : 'padding: 1rem 1.25rem; background: var(--muted); border-radius: 12px; border-top-left-radius: 2px; color: var(--foreground); font-size: 0.95rem; line-height: 1.5;';
        
      div.innerHTML = `
        <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
        </div>
        <div style="${contentStyle}">
          ${isTyping ? '<div class="typing-indicator"><span></span><span></span><span></span></div>' : text}
        </div>
      `;
    }

    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return id;
  }

} // end setupWikiBot

// ============================================================
// HOME PAGE MANAGEMENT (PHOTO, ABOUT, COLLABORATORS)
// Called once after auth, closes over supabase + role
// ============================================================
function setupHomeManagement(supabase, currentUserRole) {

  // 1. Team Photo Logic (CircularGallery Component)
  async function loadTeamPhoto() {
    const container = document.getElementById('photo-stack-container');
    const uploadContainer = document.getElementById('team-photo-upload-container');
    const btnDeletePhoto = document.getElementById('btn-delete-team-photo');

    if (!supabase || !container) return;

    // Check if role is admin to show upload/delete buttons
    const isAdmin = (currentUserRole === 'ADMIN' || currentUserRole === 'SUPER_ADMIN');
    if (isAdmin && uploadContainer) {
      uploadContainer.style.display = 'flex';
    }

    let defaultImages = [
      { image: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=500&auto=format", text: "Digital Virgo" },
      { image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=500&auto=format", text: "Dakar Office" },
      { image: "https://images.unsplash.com/photo-1452626212852-811d58933cae?q=80&w=500&auto=format", text: "Innovation" },
      { image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=500&auto=format", text: "Collaboration" }
    ];

    try {
      const { data } = supabase.storage.from('avatars').getPublicUrl('team_photo.png');
      if (data && data.publicUrl) {
        const res = await fetch(data.publicUrl, { method: 'HEAD' });
        if (res.ok) {
          // If custom photo exists, add it as the first element in array
          defaultImages.unshift({ image: data.publicUrl + '?t=' + Date.now(), text: "Notre Photo" });
          if (btnDeletePhoto && isAdmin) btnDeletePhoto.style.display = 'flex';
        } else {
          if (btnDeletePhoto) btnDeletePhoto.style.display = 'none';
        }
      }
    } catch (err) {
      console.warn("Could not load team photo", err);
    }

    container.innerHTML = '';
    if (window.circularGalleryInstance) {
      window.circularGalleryInstance.destroy();
    }

    if (window.CircularGallery) {
      window.circularGalleryInstance = await window.CircularGallery.init(container, {
        items: defaultImages,
        bend: 3,
        textColor: '#ffffff',
        borderRadius: 0.05,
        font: 'bold 24px Inter'
      });
    }
  }

  // Setup photo upload input listener
  const teamPhotoInput = document.getElementById('team-photo-input');
  if (teamPhotoInput) {
    teamPhotoInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const label = document.querySelector('label[for="team-photo-input"]');
      const originalText = label.innerHTML;
      label.innerHTML = "Téléchargement...";
      label.style.pointerEvents = 'none';

      try {
        const { error } = await supabase.storage
          .from('avatars')
          .upload('team_photo.png', file, {
            upsert: true,
            contentType: file.type
          });

        if (error) throw error;

        await loadTeamPhoto();
        alert("Photo d'équipe mise à jour avec succès !");
      } catch (err) {
        alert("Erreur lors du téléchargement : " + err.message);
      } finally {
        label.innerHTML = originalText;
        label.style.pointerEvents = 'auto';
      }
    });
  }

  // Setup photo delete listener
  const btnDeletePhoto = document.getElementById('btn-delete-team-photo');
  if (btnDeletePhoto) {
    btnDeletePhoto.addEventListener('click', async () => {
      if (!confirm("Voulez-vous vraiment supprimer la photo d'équipe ?")) return;

      try {
        const { error } = await supabase.storage.from('avatars').remove(['team_photo.png']);
        if (error) throw error;

        await loadTeamPhoto();
        alert("Photo d'équipe supprimée !");
      } catch (err) {
        alert("Erreur lors de la suppression : " + err.message);
      }
    });
  }

  // 2. À propos Section Logic
  async function loadAboutSection() {
    const aboutTitleDisplay = document.getElementById('about-title-display');
    const aboutTextDisplay = document.getElementById('about-text-display');
    const aboutAdminActions = document.getElementById('about-admin-actions');
    
    const aboutTitleInput = document.getElementById('about-title-input');
    
    if (!window.quillAbout && document.getElementById('about-editor-container') && window.Quill) {
      window.quillAbout = new Quill('#about-editor-container', {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean']
          ]
        }
      });
    }

    if (!supabase) return;

    const isAdmin = (currentUserRole === 'ADMIN' || currentUserRole === 'SUPER_ADMIN');
    if (isAdmin && aboutAdminActions) {
      aboutAdminActions.style.display = 'flex';
    }

    try {
      const { data: settings, error } = await supabase
        .from('home_settings')
        .select('*');

      if (error) throw error;

      const titleSetting = settings.find(s => s.key === 'about_title');
      const textSetting = settings.find(s => s.key === 'about_text');

      const titleVal = titleSetting ? titleSetting.value : "À propos de Digital Virgo Sénégal";
      const textVal = textSetting ? textSetting.value : "";

      if (aboutTitleDisplay) {
        aboutTitleDisplay.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          ${titleVal || 'À propos'}
        `;
      }
      if (aboutTextDisplay) {
        aboutTextDisplay.innerHTML = textVal || "Aucune description disponible. Cliquez sur Modifier pour en ajouter une.";
        if (!textVal) {
          aboutTextDisplay.style.fontStyle = 'italic';
        } else {
          aboutTextDisplay.style.fontStyle = 'normal';
        }
      }

      if (aboutTitleInput) aboutTitleInput.value = titleVal;
      if (window.quillAbout) window.quillAbout.root.innerHTML = textVal;

    } catch (err) {
      console.warn("Could not load about section", err);
    }
  }

  // Edit / Cancel / Save / Delete About Section Handlers
  const btnEditAbout = document.getElementById('btn-edit-about');
  const btnCancelAbout = document.getElementById('btn-cancel-about');
  const btnSaveAbout = document.getElementById('btn-save-about');
  const btnDeleteAbout = document.getElementById('btn-delete-about');
  
  const aboutDisplayMode = document.getElementById('about-display-mode');
  const aboutEditMode = document.getElementById('about-edit-mode');

  if (btnEditAbout && aboutDisplayMode && aboutEditMode) {
    btnEditAbout.addEventListener('click', () => {
      aboutDisplayMode.style.display = 'none';
      aboutEditMode.style.display = 'block';
    });
  }

  if (btnCancelAbout && aboutDisplayMode && aboutEditMode) {
    btnCancelAbout.addEventListener('click', () => {
      aboutDisplayMode.style.display = 'block';
      aboutEditMode.style.display = 'none';
    });
  }

  if (btnSaveAbout && aboutDisplayMode && aboutEditMode) {
    btnSaveAbout.addEventListener('click', async () => {
      const newTitle = document.getElementById('about-title-input').value.trim();
      const newText = window.quillAbout ? window.quillAbout.root.innerHTML : '';

      try {
        const { error } = await supabase.from('home_settings').upsert([
          { key: 'about_title', value: newTitle },
          { key: 'about_text', value: newText }
        ]);

        if (error) throw error;

        await loadAboutSection();
        aboutDisplayMode.style.display = 'block';
        aboutEditMode.style.display = 'none';
      } catch (err) {
        alert("Erreur lors de l'enregistrement : " + err.message);
      }
    });
  }

  if (btnDeleteAbout) {
    btnDeleteAbout.addEventListener('click', async () => {
      if (!confirm("Voulez-vous vraiment supprimer le texte descriptif ?")) return;

      try {
        const { error } = await supabase.from('home_settings').upsert([
          { key: 'about_text', value: '' }
        ]);

        if (error) throw error;

        await loadAboutSection();
        alert("Description supprimée !");
      } catch (err) {
        alert("Erreur : " + err.message);
      }
    });
  }

  // 3. Collaborators Logic (ChromaGrid)
  async function loadCollaborators() {
    const grid = document.getElementById('collaborators-grid');
    const btnAddCollab = document.getElementById('btn-add-collaborator');
    if (!grid) return;

    // Clean container but make sure overlays remain if they existed, or recreate them
    grid.innerHTML = `
      <div class="chroma-overlay"></div>
      <div class="chroma-fade"></div>
    `;

    const isAdmin = (currentUserRole === 'ADMIN' || currentUserRole === 'SUPER_ADMIN');
    if (isAdmin && btnAddCollab) {
      btnAddCollab.style.display = 'flex';
    }

    try {
      const { data: members, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const colors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
      const overlay = grid.querySelector('.chroma-overlay');

      members.forEach((member, index) => {
        const card = document.createElement('article');
        card.className = 'chroma-card';
        
        const borderColor = colors[index % colors.length];
        const gradient = `linear-gradient(${135 + index * 10}deg, color-mix(in srgb, ${borderColor} 30%, transparent), transparent)`;
        
        card.style.setProperty('--card-border', borderColor);
        card.style.setProperty('--card-gradient', gradient);

        // Admin actions inside card
        let deleteBtnHTML = '';
        if (isAdmin) {
          deleteBtnHTML = `
            <button class="btn-delete-member" data-id="${member.id}" style="position: absolute; top: 0.75rem; right: 0.75rem; background: transparent; border: 1px solid var(--border); color: var(--destructive); cursor: pointer; padding: 0.4rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s; z-index: 10;" onmouseover="this.style.background='var(--destructive)'; this.style.color='var(--destructive-foreground)'" onmouseout="this.style.background='transparent'; this.style.color='var(--destructive)'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          `;
        }

        const imgSrc = member.image_url || `https://i.pravatar.cc/300?u=${member.id}`;

        card.innerHTML = `
          ${deleteBtnHTML}
          <div class="chroma-img-wrapper">
            <img src="${imgSrc}" alt="${member.name}" loading="lazy" />
          </div>
          <footer class="chroma-info">
            <h3 class="name">${member.name}</h3>
            <span class="handle" style="color:${borderColor}">@${member.name.replace(/\s+/g, '').toLowerCase()}</span>
            <p class="role" style="grid-column: 1 / -1; font-style:italic;">${member.role} - "${member.motto}"</p>
          </footer>
        `;

        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
        });

        // Delete member click handler
        if (isAdmin) {
          const deleteBtn = card.querySelector('.btn-delete-member');
          deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (!confirm(`Voulez-vous vraiment supprimer le collaborateur ${member.name} ?`)) return;

            try {
              const { error: delErr } = await supabase
                .from('team_members')
                .delete()
                .eq('id', member.id);

              if (delErr) throw delErr;

              await loadCollaborators();
              alert("Collaborateur supprimé !");
            } catch (err) {
              alert("Erreur de suppression : " + err.message);
            }
          });
        }

        if (overlay) {
          grid.insertBefore(card, overlay);
        } else {
          grid.appendChild(card);
        }
      });

      // Re-initialize GSAP mouse tracker if required
      if (window.gsap) {
        const fadeRef = grid.querySelector('.chroma-fade');
        const setX = gsap.quickSetter(grid, '--x', 'px');
        const setY = gsap.quickSetter(grid, '--y', 'px');
        let pos = { x: 0, y: 0 };
        
        const { width, height } = grid.getBoundingClientRect();
        pos = { x: width / 2, y: height / 2 };
        setX(pos.x);
        setY(pos.y);

        grid.addEventListener('pointermove', (e) => {
          const r = grid.getBoundingClientRect();
          gsap.to(pos, {
            x: e.clientX - r.left,
            y: e.clientY - r.top,
            duration: 0.45,
            ease: 'power3.out',
            onUpdate: () => {
              setX(pos.x);
              setY(pos.y);
            },
            overwrite: true
          });
          if(fadeRef) gsap.to(fadeRef, { opacity: 0, duration: 0.25, overwrite: true });
        });

        grid.addEventListener('pointerleave', () => {
          if(fadeRef) gsap.to(fadeRef, { opacity: 1, duration: 0.6, overwrite: true });
        });
      }

    } catch (err) {
      console.warn("Could not load collaborators", err);
    }
  }

  // Collaborator Create Modal Trigger & Setup
  const btnAddCollabTrigger = document.getElementById('btn-add-collaborator');
  const modalCollabCreate = document.getElementById('collaborator-create-modal');
  const btnCloseCollabCreate = document.getElementById('btn-close-collaborator-create');
  const formCollabCreate = document.getElementById('collaborator-create-form');

  if (btnAddCollabTrigger && modalCollabCreate) {
    btnAddCollabTrigger.addEventListener('click', () => {
      modalCollabCreate.style.display = 'flex';
    });
  }

  if (btnCloseCollabCreate && modalCollabCreate) {
    btnCloseCollabCreate.addEventListener('click', () => {
      modalCollabCreate.style.display = 'none';
      if (formCollabCreate) formCollabCreate.reset();
    });
  }

  if (formCollabCreate && modalCollabCreate) {
    formCollabCreate.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('collaborator-name').value.trim();
      const role = document.getElementById('collaborator-role').value.trim();
      const motto = document.getElementById('collaborator-motto').value.trim();
      const photoInput = document.getElementById('collaborator-photo');

      const btnSave = document.getElementById('btn-save-collaborator');
      btnSave.disabled = true;
      btnSave.textContent = "Enregistrement...";

      try {
        let image_url = null;
        if (photoInput && photoInput.files.length > 0) {
          const file = photoInput.files[0];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
            
          if (publicUrlData && publicUrlData.publicUrl) {
            image_url = publicUrlData.publicUrl;
          }
        }

        const { error } = await supabase.from('team_members').insert([
          { name, role, motto, image_url }
        ]);

        if (error) throw error;

        await loadCollaborators();
        modalCollabCreate.style.display = 'none';
        formCollabCreate.reset();
        alert("Collaborateur ajouté avec succès !");
      } catch (err) {
        alert("Erreur lors de la création : " + err.message);
      } finally {
        btnSave.disabled = false;
        btnSave.textContent = "Enregistrer le collaborateur";
      }
    });
  }

  // ── Déclenchement initial au chargement de la page ──────────
  loadTeamPhoto();
  loadAboutSection();
  loadCollaborators();
  initRotatingText();

  function initRotatingText() {
    const container = document.getElementById('rotating-text');
    if (!container || !window.gsap) return;

    const texts = ['Savoir', 'Playbook', 'Wiki', 'Process'];
    let currentIndex = 0;
    const interval = 2500;
    const staggerDuration = 0.02;

    function animateText() {
      const nextText = texts[currentIndex];
      
      const chars = nextText.split('').map(char => {
        const span = document.createElement('span');
        span.className = 'rotating-text-char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.transform = 'translateY(100%)';
        span.style.opacity = '0';
        return span;
      });

      // Get current width before clearing
      const currentWidth = container.getBoundingClientRect().width;

      container.innerHTML = '';
      chars.forEach(span => container.appendChild(span));

      // Measure natural width
      container.style.width = 'auto';
      const targetWidth = container.offsetWidth;

      // Animate width transition
      gsap.fromTo(container, 
        { width: currentWidth },
        { width: targetWidth, duration: 0.35, ease: 'power2.out' }
      );

      // Animate characters In (Spring-like)
      gsap.to(chars, {
        y: '0%',
        opacity: 1,
        duration: 0.6,
        stagger: staggerDuration,
        ease: 'back.out(1.7)',
      });

      // Animate characters Out
      setTimeout(() => {
        gsap.to(chars, {
          y: '-120%',
          opacity: 0,
          duration: 0.4,
          stagger: staggerDuration,
          ease: 'power2.in',
          onComplete: () => {
            currentIndex = (currentIndex + 1) % texts.length;
            animateText();
          }
        });
      }, interval - 400);
    }

    animateText();
  }

} // end setupHomeManagement

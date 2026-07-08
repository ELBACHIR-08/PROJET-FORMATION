document.addEventListener('DOMContentLoaded', async () => {
  // --------------------------------------------------------
  // 1. INITIALISATION SUPABASE
  // --------------------------------------------------------
  const supabaseUrl = window.ENV?.SUPABASE_URL;
  const supabaseKey = window.ENV?.SUPABASE_ANON_KEY;
  let supabase = null;
  let session = null;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase config missing!");
  } else {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // Protection de la route : redirection si non connecté
    const { data } = await supabase.auth.getSession();
    session = data.session;
    if (!session) {
      window.location.href = '/login.html';
      return;
    }

    // Affichage des informations utilisateur dans la sidebar
    const metadata = session.user.user_metadata || {};
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

  const operatorView = document.getElementById('operator-view');
  const dashboardView = document.getElementById('dashboard-view');
  const parcoursView = document.getElementById('parcours-view');
  const btnBackOperator = document.getElementById('btn-back-operator');
  const btnBackDashboard = document.getElementById('btn-back-dashboard');
  const operatorsGrid = document.getElementById('operators-grid');
  const servicesGrid = document.getElementById('services-grid');
  const gridTitle = document.getElementById('grid-title');

  // Initial render
  operatorView.style.display = 'block';
  dashboardView.style.display = 'none';
  parcoursView.style.display = 'none';
  renderOperatorGrid();

  // Sidebar clicks
  document.querySelectorAll('#sidebar-verticals .nav-item').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('#sidebar-verticals .nav-item').forEach(n => n.classList.remove('active'));
      el.classList.add('active');
      currentVertical = el.getAttribute('data-vertical');
      window.currentVertical = currentVertical;
      currentOperator = null; // Reset operator
      operatorView.style.display = 'block';
      dashboardView.style.display = 'none';
      parcoursView.style.display = 'none';
      renderOperatorGrid();
    });
  });

  // Header tabs clicks
  document.querySelectorAll('#header-formats .format-tab').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('#header-formats .format-tab').forEach(n => {
        n.classList.remove('active');
        n.style.borderBottomColor = 'transparent';
        n.style.color = 'var(--muted-foreground)';
      });
      el.classList.add('active');
      el.style.borderBottomColor = 'var(--primary)';
      el.style.color = 'var(--foreground)';
      currentFormat = el.getAttribute('data-format');
      
      if (currentFormat === 'WIKI') {
        currentOperator = null;
        operatorView.style.display = 'none';
        dashboardView.style.display = 'block';
        parcoursView.style.display = 'none';
        renderDashboardGrid();
      } else if (currentOperator) {
        operatorView.style.display = 'none';
        dashboardView.style.display = 'block';
        parcoursView.style.display = 'none';
        renderDashboardGrid();
      } else {
        operatorView.style.display = 'block';
        dashboardView.style.display = 'none';
        parcoursView.style.display = 'none';
        renderOperatorGrid();
      }
    });
  });

  if (btnBackOperator) {
    btnBackOperator.addEventListener('click', () => {
      currentOperator = null;
      operatorView.style.display = 'block';
      dashboardView.style.display = 'none';
      parcoursView.style.display = 'none';
      window.scrollTo(0, 0);
    });
  }

  if (btnBackDashboard) {
    btnBackDashboard.addEventListener('click', () => {
      parcoursView.style.display = 'none';
      dashboardView.style.display = 'block';
      window.scrollTo(0, 0);
    });
  }

  function renderOperatorGrid() {
    operatorsGrid.innerHTML = '';
    const operators = ['Orange Senegal', 'YAS Senegal', 'Expresso Senegal'];
    
    operators.forEach(op => {
      const card = document.createElement('div');
      card.className = 'operator-card';
      card.innerHTML = `
        <div class="operator-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
        </div>
        <div class="operator-title">${op}</div>
        <div class="operator-subtitle">Explorer les services ${currentVertical}</div>
      `;
      
      card.addEventListener('click', () => {
        currentOperator = op;
        operatorView.style.display = 'none';
        dashboardView.style.display = 'block';
        window.scrollTo(0, 0);
        renderDashboardGrid();
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

    // Sinon, comportement normal
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
          Configurer les captures <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </div>
      `;

      card.addEventListener('click', async () => {
        dashboardView.style.display = 'none';
        parcoursView.style.display = 'block';
        window.scrollTo(0, 0);
        await loadParcoursView(service.id);
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

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    // 1. Add User Message
    appendMessage('user', message);
    chatInput.value = '';

    // 2. Add Bot "Typing..." Message
    const typingId = appendMessage('bot', '...', true);

    // 3. Search Knowledge Base (RAG simulation via Keyword Search)
    try {
      // Fetch all articles for the current vertical
      const { data: wikis, error } = await supabase
        .from('wiki_articles')
        .select('*')
        .eq('vertical', window.currentVertical || 'LIVE');

      if (error) throw error;

      // Check for simple greetings
      const cleanMsg = message.toLowerCase().trim();
      if (['bonjour', 'bonsoir', 'salut', 'coucou', 'hello'].includes(cleanMsg)) {
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();
        let timeGreet = cleanMsg === 'bonsoir' ? 'Bonsoir' : 'Bonjour';
        appendMessage('bot', `${timeGreet} ! Que puis-je faire pour vous ? N'hésitez pas à me demander une définition (ex: ROI, CPA, Tracking) ou une procédure de la base de connaissances.`);
        return;
      }

      // Basic keyword extraction (very simple, ignoring some stop words)
      const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'est', 'quoi', 'comment', 'pourquoi', 'qui', 'quel', 'quelle', 'c\'est', 'ce', 'que', 'de', 'du', 'au', 'aux', 'et', 'ou', 'dans', 'sur', 'pour', 'avec', 'sans', 'sous', 'vers', 'par', 'bonjour', 'salut', 'merci'];
      const words = message.toLowerCase().replace(/[.,?!]/g, '').split(' ').filter(w => w.length > 2 && !stopWords.includes(w));

      let bestMatch = null;
      let highestScore = 0;

      if (wikis && wikis.length > 0 && words.length > 0) {
        wikis.forEach(wiki => {
          let score = 0;
          const title = wiki.title.toLowerCase();
          const content = wiki.content.toLowerCase();
          
          words.forEach(word => {
            if (title.includes(word)) score += 5; // Title match weighs more
            if (content.includes(word)) score += 1;
          });

          if (score > highestScore) {
            highestScore = score;
            bestMatch = wiki;
          }
        });
      }

      // Remove typing indicator
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();

      let reply = "";
      if (bestMatch && highestScore > 0) {
        reply = `D'après le document **${bestMatch.title}**, voici ce que j'ai trouvé :\n\n${bestMatch.content}`;
        if (bestMatch.file_url) {
          reply += `<br><br><a href="${bestMatch.file_url}" target="_blank" style="color: var(--primary); text-decoration: underline;">📄 Voir le document source</a>`;
        }
      } else {
        reply = "Désolé, je n'ai pas trouvé d'information correspondante dans la base de connaissances (" + (window.currentVertical || "LIVE") + "). Essayez de reformuler ou assurez-vous que le document a été ajouté via 'Alimenter le Bot'.";
      }

      appendMessage('bot', reply);
    } catch (err) {
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();
      console.error(err);
      appendMessage('bot', "Erreur technique : " + (err.message || JSON.stringify(err)));
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
}

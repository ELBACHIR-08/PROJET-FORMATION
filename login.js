document.addEventListener('DOMContentLoaded', () => {
  // Initialisation de Supabase
  const supabaseUrl = window.ENV.SUPABASE_URL;
  const supabaseKey = window.ENV.SUPABASE_ANON_KEY;
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  // Vérifier si déjà connecté
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      window.location.href = '/index.html';
    }
  });

  // UI Elements
  const tabs = document.querySelectorAll('.login-tab');
  const views = document.querySelectorAll('.login-view');
  
  // Login Form Elements
  const loginForm = document.getElementById('login-form');
  const loginErrorMsg = document.getElementById('login-error');
  const btnLogin = document.getElementById('btn-login');

  // Register Form Elements
  const registerForm = document.getElementById('register-form');
  const registerErrorMsg = document.getElementById('register-error');
  const btnRegister = document.getElementById('btn-register');
  const avatarInput = document.getElementById('avatar');
  const avatarPreview = document.getElementById('avatar-preview');

  let selectedAvatarFile = null;

  // Tabs Logic
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));
      views.forEach(v => v.style.display = 'none');
      
      tab.classList.add('active');
      const viewId = 'view-' + tab.getAttribute('data-tab');
      const view = document.getElementById(viewId);
      view.classList.add('active');
      view.style.display = 'block';
    });
  });

  // Avatar Preview Logic
  avatarInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      selectedAvatarFile = e.target.files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
        avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
      }
      reader.readAsDataURL(selectedAvatarFile);
    }
  });

  // Login Logic
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginErrorMsg.style.display = 'none';
    btnLogin.disabled = true;
    btnLogin.textContent = 'Connexion...';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) throw error;
      window.location.href = '/index.html';
    } catch (error) {
      loginErrorMsg.textContent = "Erreur : " + error.message;
      loginErrorMsg.style.display = 'block';
    } finally {
      btnLogin.disabled = false;
      btnLogin.textContent = 'Se connecter';
    }
  });

  // Register Logic
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerErrorMsg.style.display = 'none';
    btnRegister.disabled = true;
    btnRegister.textContent = 'Création en cours...';

    const fullName = document.getElementById('reg-fullname').value.trim();
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    const jobTitle = document.getElementById('reg-job').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
      let avatarUrl = null;

      // 1. Upload Avatar if selected
      if (selectedAvatarFile) {
        const fileExt = selectedAvatarFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, selectedAvatarFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
          
        avatarUrl = publicUrl;
      }

      // 2. Sign Up User
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            job_title: jobTitle,
            avatar_url: avatarUrl,
            role: 'ADMIN' // Default to admin for this POC
          }
        }
      });

      if (error) throw error;

      // Registration successful
      alert('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
      
      // Switch to login tab
      document.querySelector('[data-tab="login"]').click();
      document.getElementById('email').value = email;
      document.getElementById('password').value = password;
      
    } catch (error) {
      registerErrorMsg.textContent = "Erreur : " + error.message;
      registerErrorMsg.style.display = 'block';
    } finally {
      btnRegister.disabled = false;
      btnRegister.textContent = 'Créer mon compte';
    }
  });
});

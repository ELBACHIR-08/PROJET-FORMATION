const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Les variables d'environnement SUPABASE_URL et SUPABASE_ANON_KEY sont manquantes.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  },
  realtime: {
    transport: ws
  }
});

async function seedUser() {
  const email = 'mouhamadouelbachir@gmail.com';
  const password = 'test1234';
  const role = 'cadre';

  console.log(`⏳ Création de l'utilisateur ${email}...`);

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        role: role
      }
    }
  });

  if (error) {
    console.error("❌ Erreur lors de la création du compte :", error.message);
  } else {
    console.log(`✅ Compte créé avec succès !`);
    console.log(`👤 Email : ${email}`);
    console.log(`🔑 Mot de passe : ${password}`);
    console.log(`🛡️ Rôle : ${role}`);
    console.log(`\n⚠️ Info : Si la confirmation par email est activée sur Supabase, l'utilisateur devra confirmer son email avant de pouvoir se connecter. Sinon, il peut se connecter immédiatement.`);
  }
}

seedUser();

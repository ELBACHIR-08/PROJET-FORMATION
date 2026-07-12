const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // IMPORTANT: Must be the Service Role Key, not Anon Key

module.exports = async function handler(req, res) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.' });
  }

  // Init Supabase with Admin rights
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // GET: List users
  if (req.method === 'GET') {
    try {
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      
      // Return safe user objects
      const safeUsers = users.map(u => ({
        id: u.id,
        email: u.email,
        user_metadata: u.user_metadata,
        created_at: u.created_at
      }));
      
      return res.status(200).json(safeUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Failed to fetch users: ' + error.message });
    }
  }

  // POST: Create user
  if (req.method === 'POST') {
    const { login, password, name, role } = req.body;
    if (!login || !password || !role) {
      return res.status(400).json({ error: 'Login, password, and role are required.' });
    }

    // Format email properly
    let finalEmail = login;
    if (!login.includes('@')) {
      finalEmail = `${login}@digitalvirgo.local`;
    }

    try {
      const nameParts = (name || '').split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      const { data, error } = await supabase.auth.admin.createUser({
        email: finalEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          role: role
        }
      });

      if (error) throw error;
      return res.status(201).json({ message: 'User created successfully', user: data.user });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Failed to create user: ' + error.message });
    }
  }

  // DELETE: Delete user
  if (req.method === 'DELETE') {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'UserId is required for deletion.' });
    }

    try {
      const { data, error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ error: 'Failed to delete user: ' + error.message });
    }
  }

  // PUT: Update user
  if (req.method === 'PUT') {
    const { userId, login, password, name, role } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'UserId is required for update.' });
    }

    try {
      const updateData = {};
      
      if (password) {
        updateData.password = password;
      }
      
      if (name !== undefined || role !== undefined || login) {
        updateData.user_metadata = {};
        
        if (name) {
          const nameParts = name.split(' ');
          updateData.user_metadata.first_name = nameParts[0];
          updateData.user_metadata.last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        }
        
        if (role) {
          updateData.user_metadata.role = role;
        }
      }
      
      if (login) {
        let finalEmail = login;
        if (!login.includes('@')) {
          finalEmail = `${login}@digitalvirgo.local`;
        }
        updateData.email = finalEmail;
      }

      const { data, error } = await supabase.auth.admin.updateUserById(userId, updateData);
      
      if (error) throw error;
      return res.status(200).json({ message: 'User updated successfully', user: data.user });
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Failed to update user: ' + error.message });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
};

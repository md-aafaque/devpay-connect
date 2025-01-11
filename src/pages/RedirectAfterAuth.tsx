import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  user_type: 'developer' | 'client';
}

const RedirectAfterAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserType = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error('Error fetching user:', authError);
        return;
      }

      if (user) {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select<'user_type', Profile>('user_type')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          return;
        }

        if (data) {
          const userType = data.user_type; // `data` is guaranteed to exist here
          if (userType === 'developer') {
            navigate('/developer-dashboard');
          } else if (userType === 'client') {
            navigate('/client-dashboard');
          }
        } else {
          console.error('User profile not found.');
        }
      } else {
        console.error('No user found.');
      }
    };

    checkUserType();
  }, [navigate]);

  return null;
};

export default RedirectAfterAuth;

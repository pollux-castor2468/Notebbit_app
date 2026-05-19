import { useAuthStore } from '../store/useAuthStore';
import { AuthService } from '../services/authService';
import { useFileActions } from './useFileActions';
import * as WebBrowser from 'expo-web-browser';

export const useAuthActions = () => {
  const { setAuth, setProfile, setLoading, clearAuth } = useAuthStore();
  const { syncLocalDataToCloud, fetchFiles } = useFileActions();

  const syncFilesOnLogin = async () => {
    try {
      await syncLocalDataToCloud();
      await fetchFiles();
    } catch (e) {
      console.error('File sync failed after login', e);
    }
  };

  const loadProfile = async (userId, fallbackName = '未命名') => {
    try {
      const data = await AuthService.fetchProfile(userId);
      if (data) {
        setProfile(
          data.username || fallbackName,
          data.bio || '這個人很懶，什麼都沒留下',
          data.avatar_url || null
        );
      } else {
        setProfile(fallbackName, '這個人很懶，什麼都沒留下', null);
      }
    } catch (e) {
      console.error('Fetch profile failed', e);
      setProfile(fallbackName, '這個人很懶，什麼都沒留下', null);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await AuthService.login(email, password);
      setAuth(data.user, data.session);
      
      if (data.user) {
        await loadProfile(data.user.id);
        await syncFilesOnLogin();
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await AuthService.register(name, email, password);
      setAuth(data.user, data.session);
      
      if (data.user) {
        try {
          await AuthService.upsertProfile(data.user.id, {
            username: name,
            total_exp: 0,
            current_level: 1,
          });
        } catch (profileError) {
          console.error('Error saving profile:', profileError);
        }
        
        await loadProfile(data.user.id, name);
        await syncFilesOnLogin();
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AuthService.logout();
      clearAuth();
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (name, desc, avatar) => {
    const user = useAuthStore.getState().user;
    if (!user) return { success: false, error: 'User not logged in' };
    
    setLoading(true);
    try {
      await AuthService.updateProfile(user.id, name, desc, avatar);
      setProfile(name, desc, avatar);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  };

  const autoLogin = async () => {
    setLoading(true);
    try {
      const session = await AuthService.getSession();
      if (session) {
        setAuth(session.user, session);
        await loadProfile(session.user.id);
        await syncFilesOnLogin();
      }
    } catch (e) {
      console.error('Auto login exception:', e);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      // 1. Get redirect URL from Supabase
      const { url, redirectUri } = await AuthService.signInWithGoogle();
      
      if (!url) return { success: false, error: 'Cannot get Google Auth URL' };

      // 2. Open WebBrowser
      const res = await WebBrowser.openAuthSessionAsync(url, redirectUri);
      
      if (res.type === 'success') {
        setLoading(true);
        // 3. Set Session from URL
        const data = await AuthService.setSessionFromUrl(res.url);
        setAuth(data.user, data.session);
        
        if (data.user) {
          const name = data.user.user_metadata?.full_name || '未命名';
          
          try {
            await AuthService.upsertProfile(data.user.id, {
              username: name,
              total_exp: 0,
              current_level: 1,
            });
          } catch (profileError) {
            console.error('Error saving profile:', profileError);
          }
          
          await loadProfile(data.user.id, name);
          await syncFilesOnLogin();
        }
        return { success: true };
      } else {
        return { success: false, error: '已取消登入' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    updateProfile,
    autoLogin,
    loginWithGoogle
  };
};

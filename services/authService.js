import { supabase } from '../constants/supabase';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';

export const AuthService = {
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async register(name, email, password) {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          username: name,
          full_name: name
        }
      }
    });
    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async signInWithGoogle() {
    const redirectUri = makeRedirectUri();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
      },
    });
    if (error) throw error;
    return { url: data?.url, redirectUri };
  },

  async setSessionFromUrl(url) {
    const { params, errorCode } = QueryParams.getQueryParams(url);
    if (errorCode) throw new Error(errorCode);
    
    const { access_token, refresh_token } = params;
    if (!access_token) throw new Error('No access token found');

    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) throw error;
    return data;
  },

  async fetchProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // ignore not found error
    return data;
  },

  async upsertProfile(userId, profileData) {
    const { data, error } = await supabase.from('user_profiles').upsert({
      id: userId,
      ...profileData
    }, { onConflict: 'id' }).select().single();
    if (error) throw error;
    return data;
  },

  async updateProfile(userId, name, desc, avatar) {
    const { error } = await supabase.from('user_profiles').update({
      username: name,
      bio: desc,
      avatar_url: avatar
    }).eq('id', userId);
    if (error) throw error;
  }
};

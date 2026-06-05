import { supabase } from '../constants/supabase';

export const FileService = {
  async fetchDocuments(userId) {
    const { data, error } = await supabase
      .from('documents')
      .select('*, version:document_versions(*), source:data_sources(*), tags:document_tags(tag:tags(id, name))')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async fetchDiaries(userId) {
    const { data, error } = await supabase
      .from('diaries')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error;
    return data;
  },

  async fetchTags(userId) {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async insertDocument(doc) {
    const { tags, ...rest } = doc;
    const { error } = await supabase.from('documents').insert(rest);
    if (error) throw error;
  },

  async insertDiary(diary) {
    const { error } = await supabase.from('diaries').insert(diary);
    if (error) throw error;
  },

  async updateDocument(id, updates) {
    const { tags, ...rest } = updates;
    const { error } = await supabase.from('documents').update(rest).eq('id', id);
    if (error) throw error;
  },

  async updateDiary(id, updates) {
    const { error } = await supabase.from('diaries').update(updates).eq('id', id);
    if (error) throw error;
  },

  async deleteDocument(id) {
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) throw error;
  },

  async deleteDiary(id) {
    const { error } = await supabase.from('diaries').delete().eq('id', id);
    if (error) throw error;
  },

  async insertDocumentVersion(version) {
    const { error } = await supabase.from('document_versions').insert(version);
    if (error) throw error;
  },

  async deleteDocumentVersion(id) {
    const { error } = await supabase.from('document_versions').delete().eq('id', id);
    if (error) throw error;
  },

  async insertDataSource(source) {
    const { error } = await supabase.from('data_sources').insert(source);
    if (error) throw error;
  },

  async updateDataSource(id, updates) {
    const { error } = await supabase.from('data_sources').update(updates).eq('id', id);
    if (error) throw error;
  },

  async deleteDataSource(id) {
    const { error } = await supabase.from('data_sources').delete().eq('id', id);
    if (error) throw error;
  },

  async upsertDocument(doc) {
    const { tags, ...rest } = doc;
    const { error } = await supabase.from('documents').upsert(rest);
    if (error) throw error;
  },

  async upsertDiary(diary) {
    const { error } = await supabase.from('diaries').upsert(diary);
    if (error) throw error;
  },

  async upsertDocumentVersion(version) {
    const { error } = await supabase.from('document_versions').upsert(version);
    if (error) throw error;
  },

  async upsertDataSource(source) {
    const { error } = await supabase.from('data_sources').upsert(source);
    if (error) throw error;
  },

  async insertTag(tag) {
    const { error } = await supabase.from('tags').insert(tag);
    if (error) throw error;
  },

  async updateTag(id, updates) {
    const { error } = await supabase.from('tags').update(updates).eq('id', id);
    if (error) throw error;
  },

  async deleteTagRecord(id) {
    const { error } = await supabase.from('tags').delete().eq('id', id);
    if (error) throw error;
  },

  async updateDocumentTags(docId, tagIds) {
    const { error: deleteError } = await supabase
      .from('document_tags')
      .delete()
      .eq('document_id', docId);
    if (deleteError) throw deleteError;

    if (!tagIds || tagIds.length === 0) return;

    const relations = tagIds.map(tagId => ({
      document_id: docId,
      tag_id: tagId
    }));
    const { error: insertError } = await supabase
      .from('document_tags')
      .insert(relations);
    if (insertError) throw insertError;
  }
};

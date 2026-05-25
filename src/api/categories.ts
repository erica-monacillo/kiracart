import { supabase } from '../utils/supabaseClient';

export interface Category {
  id: number;
  name: string;
  imagePath: string | null;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('category_id', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (categories || []).map((c: any) => ({
    id: c.category_id,
    name: c.category_name,
    imagePath: c.image_path ?? null,
  }));
}

export async function createCategory(
  name: string,
  imageFile?: File | null
): Promise<Category> {
  let image_path = null;

  // Handle image upload if provided
  if (imageFile) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `categories/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, imageFile);

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    image_path = data.publicUrl;
  }

  const { data: category, error } = await supabase
    .from('categories')
    .insert([{ category_name: name, image_path }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: category.category_id,
    name: category.category_name,
    imagePath: category.image_path,
  };
}

export async function deleteCategory(id: number): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('category_id', id);

  if (error) {
    throw new Error(error.message);
  }
}

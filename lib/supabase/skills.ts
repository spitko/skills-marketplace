import { createClient } from "@/lib/supabase/server";
import { Skill } from "@/types/skill";

export async function getSkills(): Promise<Skill[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching skills:", error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Ensure price is converted to number if it's a string
    return data.map((skill) => ({
      ...skill,
      price: skill.price ? Number(skill.price) : undefined,
    })) as Skill[];
  } catch (error) {
    console.error("Unexpected error fetching skills:", error);
    return [];
  }
}

export async function getSkillById(id: string): Promise<Skill | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching skill:", error);
    return null;
  }

  return data as Skill | null;
}

export async function getSkillsByCategory(category: string): Promise<Skill[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching skills by category:", error);
    return [];
  }

  return (data as Skill[]) || [];
}

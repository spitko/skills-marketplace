import { Skill } from "@/types/skill";
import { SkillCard } from "@/components/skill-card";

interface SkillWithPurchaseStatus {
  skill: Skill;
  hasPurchased: boolean;
}

interface SkillsGridProps {
  skills: SkillWithPurchaseStatus[];
}

export function SkillsGrid({ skills }: SkillsGridProps) {
  if (skills.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-2">No skills available at the moment.</p>
        <p className="text-sm text-muted-foreground">
          Make sure you've run the database migration in your Supabase dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {skills.map(({ skill, hasPurchased }) => (
        <SkillCard key={skill.id} skill={skill} hasPurchased={hasPurchased} />
      ))}
    </div>
  );
}

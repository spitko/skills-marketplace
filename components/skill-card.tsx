import { Skill } from "@/types/skill";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton } from "@/components/checkout-button";

interface SkillCardProps {
  skill: Skill;
  hasPurchased?: boolean;
}

export function SkillCard({ skill, hasPurchased = false }: SkillCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{skill.name}</CardTitle>
          <Badge variant="secondary" className="shrink-0">
            $5.00
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          by {skill.author} • {skill.category}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground mb-4">{skill.description}</p>
        <div className="flex flex-wrap gap-2">
          {skill.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <CheckoutButton skill={skill} hasPurchased={hasPurchased} />
      </CardFooter>
    </Card>
  );
}

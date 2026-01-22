import { Skill } from "@/types/skill";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface SkillCardProps {
  skill: Skill;
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{skill.name}</CardTitle>
          {skill.price && (
            <Badge variant="secondary" className="shrink-0">
              ${Number(skill.price).toFixed(2)}
            </Badge>
          )}
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
        <Link
          href={skill.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-sm font-medium text-primary hover:underline text-center"
        >
          Purchase
        </Link>
      </CardFooter>
    </Card>
  );
}

import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { MarketplaceHero } from "@/components/marketplace-hero";
import { SkillsGrid } from "@/components/skills-grid";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import { getSkills } from "@/lib/supabase/skills";
import { createClient } from "@/lib/supabase/server";
import { getUserPurchases, getPurchasesByEmail } from "@/lib/supabase/purchases";
import Link from "next/link";
import { Suspense } from "react";

export default async function Home() {
  let skills = await getSkills();
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get purchases from Supabase
  let purchases: any[] = [];
  if (user) {
    try {
      purchases = await getUserPurchases(user.id);
    } catch (error) {
      console.error("Error fetching user purchases:", error);
    }
    
    // Also check by email for guest purchases that might have been made before login
    if (user.email) {
      try {
        const emailPurchases = await getPurchasesByEmail(user.email);
        // Merge and deduplicate by skill_id
        const existingSkillIds = new Set(purchases.map(p => p.skill_id));
        const newPurchases = emailPurchases.filter(p => !existingSkillIds.has(p.skill_id));
        purchases = [...purchases, ...newPurchases];
      } catch (error) {
        console.error("Error fetching purchases by email:", error);
      }
    }
  }

  // Get purchase status for each skill
  const skillsWithPurchaseStatus = skills.map((skill) => {
    const hasPurchased = purchases.some(
      (purchase) => 
        purchase.skill_id === skill.id && 
        purchase.status === "completed"
    );

    return {
      skill,
      hasPurchased,
    };
  });

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-12 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"} className="text-lg">
                Skills Marketplace
              </Link>
            </div>
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-12 max-w-7xl w-full p-5">
          <MarketplaceHero />
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold">Available Skills</h2>
            <SkillsGrid skills={skillsWithPurchaseStatus} />
          </div>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}

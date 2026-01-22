import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionsTab } from "@/components/account/transactions-tab";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

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
            <Button asChild variant="outline">
              <Link href="/">Back to Marketplace</Link>
            </Button>
          </div>
        </nav>
        
        <div className="flex-1 flex flex-col gap-12 max-w-7xl w-full p-5">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Account</h1>
            <p className="text-muted-foreground">
              View your transaction history
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
              <CardDescription>
                Email: {user.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionsTab />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

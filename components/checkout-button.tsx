"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skill } from "@/types/skill";

interface CheckoutButtonProps {
  skill: Skill;
  hasPurchased?: boolean;
}

export function CheckoutButton({ skill, hasPurchased = false }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skillId: skill.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Creem checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  if (hasPurchased) {
    return (
      <Button
        asChild
        variant="outline"
        className="w-full"
      >
        <a
          href={skill.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Skill
        </a>
      </Button>
    );
  }

  return (
    <div className="w-full">
      <Button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Processing..." : "Purchase - $5.00"}
      </Button>
      {error && (
        <p className="text-sm text-destructive mt-2 text-center">{error}</p>
      )}
    </div>
  );
}

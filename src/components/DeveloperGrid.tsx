import { useEffect, useState } from "react";
import { DeveloperCard } from "./DeveloperCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const DeveloperGrid = () => {
  const [developers, setDevelopers] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDevelopers = async () => {
      const { data, error } = await supabase
        .from("developers")
        .select(`
          *,
          profile:profiles(*)
        `)
        .order("rating", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load developers",
          variant: "destructive",
        });
        return;
      }

      setDevelopers(data || []);
    };

    fetchDevelopers();
  }, [toast]);

  return (
    <div className="container py-12">
      <h2 className="mb-8 text-center text-3xl font-bold">Featured Developers</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {developers.map((dev) => (
          <DeveloperCard
            key={dev.id}
            id={dev.id}
            name={dev.profile.full_name}
            title={dev.title}
            rate={dev.hourly_rate}
            rating={dev.rating}
            skills={dev.skills}
            available={dev.status === "available"}
            imageUrl={dev.profile.avatar_url || "https://via.placeholder.com/150"}
          />
        ))}
      </div>
    </div>
  );
};
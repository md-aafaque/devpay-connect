import { useEffect, useState } from "react";
import { DeveloperCard } from "./DeveloperCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export const DeveloperGrid = () => {
  const [developers, setDevelopers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
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
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDevelopers();
  }, [toast]);

  return (
    <div className="container py-12">
      <h2 className="mb-8 text-center text-3xl font-bold">Featured Developers</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          [...Array(4)].map((_, index) => (
            <div key={index} className="space-y-4 p-6">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))
        ) : developers.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">
            No developers available at the moment
          </div>
        ) : (
          developers.map((dev) => (
            <DeveloperCard
              key={dev.id}
              id={dev.id}
              name={dev.profile.full_name}
              hourlyRate={dev.hourly_rate}
              skills={dev.skills || []}
              available={dev.status === "available"}
              imageUrl={dev.profile.avatar_url || "https://via.placeholder.com/150"}
            />
          ))
        )}
      </div>
    </div>
  );
};
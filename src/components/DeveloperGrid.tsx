import { useEffect, useState } from "react";
import DeveloperCard from "./DeveloperCard";
import { supabase } from "@/integrations/supabase/client";

interface Developer {
  id: string;
  hourly_rate: number;
  skills: string[];
  status: "available" | "busy" | "offline";
}

const DeveloperGrid = () => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const { data, error } = await supabase
          .from("developers")
          .select(`
            id,
            hourly_rate,
            skills,
            status
          `);

        if (error) {
          throw error;
        }

        setDevelopers(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch developers");
      } finally {
        setLoading(false);
      }
    };

    fetchDevelopers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p>Loading developers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {developers.length === 0 ? (
        <p>No developers found.</p>
      ) : (
        developers.map((dev) => (
          <DeveloperCard
            key={dev.id}
            id={dev.id}
            hourlyRate={dev.hourly_rate}
            skills={dev.skills || []}
            available={dev.status === "available"}
          />
        ))
      )}
    </div>
  );
};

export default DeveloperGrid;
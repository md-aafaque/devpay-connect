import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface DeveloperCardProps {
  id: string;
  hourlyRate: number;
  skills: string[];
  available: boolean;
}

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

const DeveloperCard = ({ id, hourlyRate, skills, available }: DeveloperCardProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [id]);

  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <img
            src={profile?.avatar_url || "/placeholder.svg"}
            alt={profile?.full_name || "Developer"}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h3 className="text-lg font-semibold">{profile?.full_name || "Loading..."}</h3>
            <p className="text-sm text-gray-500">${hourlyRate}/hour</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
            {skills.length > 3 && (
              <Badge variant="outline">+{skills.length - 3}</Badge>
            )}
          </div>
        </div>
        <div className="mt-4">
          <Badge variant={available ? "success" : "secondary"}>
            {available ? "Available" : "Unavailable"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeveloperCard;
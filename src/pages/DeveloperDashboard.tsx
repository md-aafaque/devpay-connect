import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

const DeveloperDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAvailable, setIsAvailable] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      
      const { data: developerData, error } = await supabase
        .from("developers")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error || !developerData) {
        toast({
          title: "Error",
          description: "Failed to load developer profile",
          variant: "destructive",
        });
        return;
      }

      setProfile(developerData);
      setIsAvailable(developerData.status === "available");
    };

    checkAuth();
  }, [navigate, toast]);

  const handleAvailabilityChange = async () => {
    const newStatus = !isAvailable ? "available" : "offline";
    const { error } = await supabase
      .from("developers")
      .update({ status: newStatus })
      .eq("id", profile.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
      return;
    }

    setIsAvailable(!isAvailable);
    toast({
      title: "Success",
      description: `You are now ${newStatus}`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Developer Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Availability</h2>
          <div className="flex items-center space-x-2">
            <Switch
              checked={isAvailable}
              onCheckedChange={handleAvailabilityChange}
            />
            <span>{isAvailable ? "Available" : "Offline"}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Calls</h2>
          {/* Add upcoming calls list here */}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Earnings</h2>
          {/* Add earnings information here */}
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
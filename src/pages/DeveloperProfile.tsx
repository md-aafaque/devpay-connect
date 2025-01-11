import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DeveloperProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [developer, setDeveloper] = useState<any>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const fetchDeveloper = async () => {
      const { data, error } = await supabase
        .from("developers")
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq("id", id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load developer profile",
          variant: "destructive",
        });
        return;
      }

      setDeveloper(data);
    };

    fetchDeveloper();
  }, [id, toast]);

  const handleBooking = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/login");
      return;
    }

    const { error } = await supabase
      .from("bookings")
      .insert({
        client_id: session.user.id,
        developer_id: id,
        amount: developer.hourly_rate,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Booking created successfully",
    });
    setIsBookingOpen(false);
  };

  if (!developer) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <img
              src={developer.profile.avatar_url || "https://via.placeholder.com/100"}
              alt={developer.profile.full_name}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold">{developer.profile.full_name}</h1>
              <p className="text-gray-600">{developer.title}</p>
              <div className="flex items-center mt-2">
                <span className="text-2xl font-bold">${developer.hourly_rate}</span>
                <span className="text-gray-600 ml-1">/hour</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {developer.skills.map((skill: string) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="text-gray-600">{developer.bio}</p>
          </div>

          <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
            <DialogTrigger asChild>
              <Button className="mt-6 w-full">Book a Call</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Booking</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <p className="mb-4">
                  You are about to book a call with {developer.profile.full_name} at ${developer.hourly_rate}/hour
                </p>
                <Button onClick={handleBooking} className="w-full">
                  Confirm Booking
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default DeveloperProfile;
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CallRequest {
  id: string;
  client: {
    full_name: string;
  };
  task_description: string;
  status: string;
  created_at: string;
}

const DeveloperDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAvailable, setIsAvailable] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [skills, setSkills] = useState<string[]>([]);
  const [callRequests, setCallRequests] = useState<CallRequest[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // Fetch developer data
      const { data: developerData, error: developerError } = await supabase
        .from("developers")
        .select("*")
        .eq("id", session.user.id)
        .single();

      // Fetch developer profile
      const { data: developerProfileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (developerError || !developerData || !developerProfileData) {
        toast({
          title: "Error",
          description: "Failed to load developer profile",
          variant: "destructive",
        });
        return;
      }

      setName(developerProfileData.full_name);
      setHourlyRate(developerData.hourly_rate);
      setIsAvailable(developerData.status === "available");
      setSkills(developerData.skills || []);
      setProfile(developerData);

      // Fetch pending call requests
      const { data: callRequestsData, error: callRequestsError } = await supabase
        .from("call_requests")
        .select(`
          *,
          client:profiles!call_requests_client_id_fkey(*)
        `)
        .eq("developer_id", session.user.id)
        .eq("status", "pending");

      if (callRequestsError) {
        toast({
          title: "Error",
          description: "Failed to load call requests",
          variant: "destructive",
        });
        return;
      }

      setCallRequests(callRequestsData);

      // Subscribe to new call requests
      const channel = supabase
        .channel('call_requests')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'call_requests',
            filter: `developer_id=eq.${session.user.id}`
          },
          (payload) => {
            console.log('New call request:', payload);
            setCallRequests(prev => [...prev, payload.new as CallRequest]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
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

  const handleAcceptCallRequest = async (callRequestId: string) => {
    try {
      const { error } = await supabase
        .from("call_requests")
        .update({ status: "accepted" })
        .eq("id", callRequestId);

      if (error) throw error;

      // Remove the accepted call request from the list
      setCallRequests(prev => prev.filter(request => request.id !== callRequestId));

      toast({
        title: "Call Accepted",
        description: "Joining call room..."
      });

      // Navigate to the call room
      navigate(`/call-room/${callRequestId}`);
    } catch (error) {
      console.error('Error accepting call:', error);
      toast({
        title: "Error",
        description: "Failed to accept the call request",
        variant: "destructive",
      });
    }
  };

  const handleRejectCallRequest = async (callRequestId: string) => {
    try {
      const { error } = await supabase
        .from("call_requests")
        .update({ status: "rejected" })
        .eq("id", callRequestId);

      if (error) throw error;

      // Remove the rejected call request from the list
      setCallRequests(prev => prev.filter(request => request.id !== callRequestId));

      toast({
        title: "Call Rejected",
        description: "Call request has been rejected"
      });
    } catch (error) {
      console.error('Error rejecting call:', error);
      toast({
        title: "Error",
        description: "Failed to reject the call request",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Profile Section */}
          <Card className="md:col-span-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Profile</h2>
              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={isAvailable}
                  onCheckedChange={handleAvailabilityChange}
                />
                <Label htmlFor="available">Available</Label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="hourlyRate">Hourly Rate (ETH)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <Label htmlFor="skills">Skills</Label>
                <Input id="skills" placeholder="React, Node.js, Solidity..." />
              </div>

              <Button className="w-full">Update Profile</Button>
            </div>
          </Card>

          {/* Main Content */}
          <div className="md:col-span-8 space-y-6">
            {/* New Call Requests */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">New Call Requests</h2>
              <div className="space-y-4">
                {callRequests.length === 0 ? (
                  <div className="text-muted-foreground">No new call requests</div>
                ) : (
                  callRequests.map((callRequest) => (
                    <div key={callRequest.id} className="p-4 border rounded-md">
                      <h3 className="font-semibold">Client: {callRequest.client.full_name}</h3>
                      <p className="mt-2">Task: {callRequest.task_description}</p>
                      <p className="text-sm text-muted-foreground">
                        Requested at: {new Date(callRequest.created_at).toLocaleString()}
                      </p>
                      <div className="mt-4 space-x-4">
                        <Button 
                          onClick={() => handleAcceptCallRequest(callRequest.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => handleRejectCallRequest(callRequest.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Past Work */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Past Work</h2>
              <div className="space-y-4">
                <div className="text-muted-foreground">No past work history</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
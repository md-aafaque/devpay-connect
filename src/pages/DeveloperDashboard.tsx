import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { ethers } from "ethers";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"; // Update the import path as per your folder structure
import { Button } from "@/components/ui/button";

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
  const [wallet, setWallet] = useState<string>("");
  const [isAvailable, setIsAvailable] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [callRequests, setCallRequests] = useState<CallRequest[]>([]);
  const [title, setTitle] = useState<string>("")
  const [skillInput, setSkillInput] = useState("")
  const [img, setImg] = useState("")
  const [bookings, setBookings] = useState<any[]>([]);

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

      
      const { data: data, error : error } = await supabase
        .from("call_requests")
        .select(`
          *,
          developer:developers(*)
        `)
        .eq("client_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load bookings",
          variant: "destructive",
        });
        return;
      }

      setBookings(data || []);

      setName(developerProfileData.full_name);
      setHourlyRate(developerData.hourly_rate);
      setIsAvailable(developerData.status === "available");
      setSkills(developerData.skills || []);
      setSkillInput(String(developerData.skills) || " ")
      setTitle(developerData.title)
      setProfile(developerData);
      setImg(developerProfileData.avatar_url)

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

    checkWalletConnection();

    checkAuth();
  }, []);

  const checkWalletConnection = async () => {
    //@ts-ignore
    if (!window.ethereum) {
      toast({
        title: "MetaMask Required",
        description: "Please install MetaMask to use this application.",
        variant: "destructive",
      });
      return;
    }

    try {
      //@ts-ignore
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        setWallet(accounts[0].address);
      }
    } catch (error) {
      console.error("Failed to check wallet connection:", error);
      toast({
        title: "Error",
        description: "Could not connect to wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const connectWallet = async () => {
    try {
      //@ts-ignore
      if (!window.ethereum) {
        toast({
          title: "MetaMask Required",
          description:
            "MetaMask browser extension is not installed. Please install it to proceed.",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      //@ts-ignore
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length === 0) {
        throw new Error("No accounts found. Please unlock your MetaMask wallet.");
      }
    //   console.log(accounts[0])
        setWallet(accounts[0].address);
      toast({
        title: "Wallet Connected",
        description: "Your MetaMask wallet has been connected successfully.",
      });
      navigate("/client-dashboard");
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to MetaMask.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const updateProfile = async() => {
    try {
      if (!profile?.id) {
        toast({
          title: "Error",
          description: "Profile ID is missing. Please refresh and try again.",
          variant: "destructive",
        });
        return;
      }

      await supabase
      .from("profiles")
      .update({full_name: name})
      .eq("id", profile.id)
  
      const { error } = await supabase
        .from("developers")
        .update({
          hourly_rate: hourlyRate,
          skills: skillInput.split(','), // Already an array of strings
          title: title,
          wallet_address: wallet,
        })
        .eq("id", profile.id);
  
      if (error) {
        throw error;
      }
  
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  }

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
  //@ts-ignore
  if (!window.ethereum) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-8">
        <Card className="w-full max-w-md p-8 text-center space-y-6">
          <h1 className="text-2xl font-bold">MetaMask Required</h1>
          <p className="text-gray-600">
            To use DevPay Connect, you need to install the MetaMask browser extension.
          </p>
          <a
            href="https://metamask.io/download.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Download MetaMask
          </a>
        </Card>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-8">
        <Card className="w-full max-w-md p-8 text-center space-y-6">
          <h1 className="text-2xl font-bold">Welcome to DevPay Connect</h1>
          <p className="text-gray-600">
            Please connect your MetaMask wallet to continue using the application.
          </p>
          <Button onClick={connectWallet} className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Connect MetaMask"
            )}
          </Button>
        </Card>
      </div>
    );
  }

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
            <div className="h-12 w-12 rounded-full border-black mb-4 ">
              <img src={img} className="rounded-full" alt="Github Profile Image" />
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>{title || "Select a title from below"}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setTitle("Full Stack Developer")}>
                    Full Stack Developer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTitle("Frontend Developer")}>
                    Frontend Developer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTitle("Backend Developer")}>
                    Backend Developer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTitle("Machine Learning Engineer")}>
                    Machine Learning Engineer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTitle("Blockchain Engineer")}>
                    Blockchain Engineer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div>
                <Label htmlFor="skills">Skills</Label>
                <Input 
                  id="skills" 
                  placeholder="React, Node.js, Solidity..."
                  value={skillInput} // Join the array to display as a single string
                  onChange={(e) =>setSkillInput(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="name">MetaMask ID</Label>
                <Input
                  id="name"
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                />
              </div>

              <Button onClick={()=>{updateProfile()}} className="w-full">Update Profile</Button>
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
              {bookings.length === 0 ? (
                <p className="text-gray-500">No bookings yet</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border rounded-lg p-4 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-semibold">{booking.developer.title}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.start_time).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${booking.amount}</p>
                        <p className="text-sm text-gray-500">{booking.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
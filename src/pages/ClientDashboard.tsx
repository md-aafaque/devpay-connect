import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";import { ethers } from "ethers";
import { Loader2 } from "lucide-react";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
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
    };

    checkWalletConnection();

    checkAuth();
  }, [navigate, toast]);
  
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
      window.location.reload();
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Client Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Bookings</h2>
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
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex justify-center">Categories For Booking</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 text-white text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-500 border border-gray-300 rounded-xl flex items-center justify-center"
          onClick={()=>{ navigate('/developers/?role=Full Stack Developer') }}>
            Full Stack Development
          </div>
          <div className="h-20 text-white text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-500 border border-gray-300 rounded-xl flex items-center justify-center"
          onClick={()=>{navigate('/developers/?role=Frontend Developer')}}>
            Frontend Developer
          </div>
          <div className="h-20 text-white text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-500 border border-gray-300 rounded-xl flex items-center justify-center"
          onClick={()=>{navigate('/developers/?role=Backend Developer')}}>
            Backend Developer
          </div>
          <div className="h-20 text-white text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-500 border border-gray-300 rounded-xl flex items-center justify-center"
          onClick={()=>{navigate('/developers/?role=Machine Learning Engineer')}}>
            Machine Learning Engineer
          </div>
          <div className="h-20 text-white text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-500 border border-gray-300 rounded-xl flex items-center justify-center"
          onClick={()=>{navigate('/developers/?role=Blockchain Engineer')}}>
            Blockchain Engineer
          </div>
          <div className="h-20 text-white text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-500 border border-gray-300 rounded-xl flex items-center justify-center"
          onClick={()=>{navigate('/developers/')}}>
            Explore All
          </div>
        </div>

      </div>
    </div>
    // <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
    //   <div className="container py-8">
    //     <div className="space-y-6">
    //       {/* Search Section */}
    //       <Card className="p-6">
    //         <h2 className="text-2xl font-semibold mb-4">Find a Developer</h2>
    //         <div className="flex gap-4 flex-wrap">
    //           <div className="flex-1 min-w-[200px]">
    //             <Input placeholder="Search by skills..." />
    //           </div>
    //           <Button>
    //             <Search className="mr-2 h-4 w-4" />
    //             Search
    //           </Button>
    //         </div>
    //       </Card>

    //       {/* Past Consultations */}
    //       <Card className="p-6">
    //         <h2 className="text-2xl font-semibold mb-4">Past Consultations</h2>
    //         <div className="text-muted-foreground">
    //           No past consultations found
    //         </div>
    //       </Card>
    //     </div>
    //   </div>
    // </div>
  );
};

export default ClientDashboard;
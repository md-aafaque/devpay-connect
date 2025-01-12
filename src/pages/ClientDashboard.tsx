import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";


const ClientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
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

    checkAuth();
  }, [navigate, toast]);

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
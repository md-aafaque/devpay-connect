import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleJoin = (userType) => {
    navigate(`/auth?type=${userType}`); // Dynamically pass the user type
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            DevPay Connect
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Connect with expert developers instantly via video call
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              variant="default"
              className="w-full sm:w-auto"
              onClick={() => handleJoin("client")} // Pass 'client' as userType
            >
              Find a Developer
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => handleJoin("developer")} // Pass 'developer' as userType
            >
              Join as Developer
            </Button>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            <div className="p-6 rounded-lg bg-card/30 backdrop-blur-lg border border-white/10">
              <h2 className="text-2xl font-semibold mb-4">For Clients</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li>✓ Instant access to expert developers</li>
                <li>✓ Pay-per-minute consultations</li>
                <li>✓ Secure crypto payments</li>
                <li>✓ No long-term commitments</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg bg-card/30 backdrop-blur-lg border border-white/10">
              <h2 className="text-2xl font-semibold mb-4">For Developers</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li>✓ Set your own rates</li>
                <li>✓ Work when you want</li>
                <li>✓ Get paid instantly in crypto</li>
                <li>✓ Build your reputation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

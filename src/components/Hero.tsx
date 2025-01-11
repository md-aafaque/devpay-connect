import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-hover py-20 text-white">
      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-4xl font-bold sm:text-5xl md:text-6xl">
            Get Expert Developer Help
            <br />
            On-Demand
          </h1>
          <p className="mb-8 text-lg text-white/90 sm:text-xl">
            Connect with skilled developers for instant video consultations.
            Pay only for the time you need.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-gray-100"
              onClick={() => navigate("/login")}
            >
              Find a Developer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              onClick={() => navigate("/signup")}
            >
              Become a Developer
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-hover/20" />
    </div>
  );
};

export default Hero;
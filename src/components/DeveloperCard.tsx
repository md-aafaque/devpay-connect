import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface DeveloperCardProps {
  name: string;
  hourlyRate: number;
  skills: string[];
  available: boolean;
  imageUrl: string;
}

export function DeveloperCard({ name, hourlyRate, skills, available, imageUrl }: DeveloperCardProps) {
  const handleCallNow = () => {
    if (!available) {
      toast.error("Developer is currently unavailable");
      return;
    }
    // TODO: Implement call functionality
    toast.success("Initiating call...");
  };

  return (
    <Card className="w-full max-w-sm bg-card/30 backdrop-blur-lg border border-white/10 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={imageUrl}
            alt={name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${available ? 'bg-green-500 animate-pulse-status' : 'bg-gray-400'}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">
            {hourlyRate} ETH/hour
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary">
            {skill}
          </Badge>
        ))}
      </div>
      <Button
        className="w-full mt-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
        onClick={handleCallNow}
        disabled={!available}
      >
        {available ? "Call Now" : "Unavailable"}
      </Button>
    </Card>
  );
}
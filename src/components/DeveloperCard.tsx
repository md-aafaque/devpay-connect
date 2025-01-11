import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Clock, Code2, Star } from "lucide-react";

interface DeveloperCardProps {
  name: string;
  title: string;
  rate: number;
  rating: number;
  skills: string[];
  available: boolean;
  imageUrl: string;
}

export const DeveloperCard = ({
  name,
  title,
  rate,
  rating,
  skills,
  available,
  imageUrl,
}: DeveloperCardProps) => {
  return (
    <Card className="w-full max-w-sm transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="relative">
          <img
            src={imageUrl}
            alt={name}
            className="h-16 w-16 rounded-full object-cover"
          />
          <div
            className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${
              available ? "bg-success-DEFAULT" : "bg-secondary-DEFAULT"
            }`}
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="font-medium">${rate}/hour</span>
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={!available}
        >
          <Code2 className="mr-2 h-4 w-4" />
          {available ? "Start Call" : "Currently Unavailable"}
        </Button>
      </CardFooter>
    </Card>
  );
};
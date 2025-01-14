import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { DeveloperCard } from "@/components/DeveloperCard";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@supabase/supabase-js";

interface Developer {
  id: string;
  title: string;
  hourly_rate: number;
  status: string;
  skills: string[];
  bio: string;
  years_of_experience: number;
  total_calls: number;
  rating: number;
}

const DeveloperProfile = () => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("developers")
        .select("*")
        .order("rating", { ascending: false });

      if (error) throw error;
      setDevelopers(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch developers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterDevelopers = () => {
    return developers.filter((dev) => {
      const matchesSearch =
        dev.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dev.skills?.some((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesSkill = !selectedSkill || dev.skills?.includes(selectedSkill);

      const matchesPriceRange = () => {
        const rate = dev.hourly_rate;
        switch (priceRange) {
          case "0-50":
            return rate >= 0 && rate <= 50;
          case "51-100":
            return rate > 50 && rate <= 100;
          case "101+":
            return rate > 100;
          default:
            return true;
        }
      };

      return matchesSearch && matchesSkill && matchesPriceRange();
    });
  };

  const allSkills = Array.from(
    new Set(developers.flatMap((dev) => dev.skills || []))
  );

  const filteredDevelopers = filterDevelopers();

  if (loading) {
    return (
      <div className="container py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse space-y-4">
                <div className="h-20 rounded-lg bg-gray-200" />
                <div className="h-4 w-2/3 rounded bg-gray-200" />
                <div className="h-4 w-1/2 rounded bg-gray-200" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
            <Input
              placeholder="Search by title or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="flex gap-4">
            <Select value={selectedSkill} onValueChange={setSelectedSkill}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Skills</SelectItem>
                {allSkills.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Price range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Price</SelectItem>
                <SelectItem value="0-50">$0 - $50</SelectItem>
                <SelectItem value="51-100">$51 - $100</SelectItem>
                <SelectItem value="101+">$101+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDevelopers.map((dev) => (
          <DeveloperCard
            key={dev.id}
            id={dev.id}
            hourlyRate={dev.hourly_rate}
            skills={dev.skills || []}
            available={dev.status === "available"}
          />
        ))}
      </div>

      {filteredDevelopers.length === 0 && (
        <div className="text-center text-gray-500">
          No developers found matching your criteria
        </div>
      )}
    </div>
  );
};

export default DeveloperProfile;
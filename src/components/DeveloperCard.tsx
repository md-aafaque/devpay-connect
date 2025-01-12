import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeveloperCardProps {
  id: string;
  hourlyRate: number;
  skills: string[];
  available: boolean;
}

export function DeveloperCard({ id, hourlyRate, skills, available }: DeveloperCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskDescription, setTaskDescription] = useState("");
  const [name, setName] = useState('');
  const [image_url, setImage_Url] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select('full_name, avatar_url')
          .eq('id', id)
          .single(); // Use .single() to get one record

        if (error) {
          console.error("Error fetching data:", error);
          return;
        }

        // Set the fetched data
        setName(data?.full_name || '');
        setImage_Url(data?.avatar_url || '');
      } catch (error) {
        console.error('Error:', error);
      }
    };

    getDetails();
  }, [id]); // Run the effect when the `id` prop changes

  const handleCallRequest = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Please login to start a call");
        navigate("/login");
        return;
      }

      const { data: callRequest, error } = await supabase
        .from('call_requests')
        .insert({
          client_id: session.user.id,
          developer_id: id,
          task_description: taskDescription,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Call request sent to developer");
      setIsDialogOpen(false);
      navigate(`/call-room/${callRequest.id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to initiate call");
    }
  };

  return (
    <>
      <Card className="w-full max-w-sm bg-card/30 backdrop-blur-lg border border-white/10 p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={image_url}
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
          onClick={() => setIsDialogOpen(true)}
          disabled={!available}
        >
          {available ? "Call Now" : "Unavailable"}
        </Button>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Call with {name}</DialogTitle>
            <DialogDescription>
              Describe your task or problem to help the developer prepare for the call.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Describe your task or problem..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCallRequest}>
              Start Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

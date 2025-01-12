import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CallRoom = () => {
  const { callId } = useParams();
  const [callData, setCallData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCallData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Please login to join the call");
          return;
        }

        const { data: callRequest, error } = await supabase
          .from('call_requests')
          .select(`
            *,
            client:profiles!call_requests_client_id_fkey(*),
            developer:developers!call_requests_developer_id_fkey(*)
          `)
          .eq('id', callId)
          .single();

        if (error) throw error;
        if (!callRequest) {
          toast.error("Call not found");
          return;
        }

        setCallData(callRequest);
      } catch (error) {
        console.error('Error:', error);
        toast.error("Failed to fetch call data");
      } finally {
        setLoading(false);
      }
    };

    fetchCallData();
  }, [callId]);

  useEffect(() => {
    const initializeCall = async () => {
      if (!callData) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const appID = 1234567890; // Replace with your ZegoCloud App ID
      const serverSecret = "your-server-secret"; // Replace with your ZegoCloud Server Secret

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        callId as string,
        session.user.id,
        session.user.email as string
      );

      const zc = ZegoUIKitPrebuilt.create(kitToken);

      zc.joinRoom({
        container: document.querySelector("#call-container") as HTMLElement,
        sharedLinks: [],
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showScreenSharingButton: true,
      });
    };

    initializeCall();
  }, [callData, callId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading call room...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Call Room</h1>
          {callData && (
            <p className="text-muted-foreground">
              Call with {callData.client.full_name} and {callData.developer.title}
            </p>
          )}
        </div>
        <div id="call-container" className="w-full h-[600px] rounded-lg overflow-hidden bg-card" />
      </div>
    </div>
  );
};

export default CallRoom;
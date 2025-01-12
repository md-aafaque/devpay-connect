import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CallRoom = () => {
  const { callId } = useParams();
  const [callData, setCallData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const zegoInitialized = useRef(false);

  useEffect(() => {
    const fetchCallData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Please login to join the call");
          return;
        }

        // Fetch initial call data
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
        console.log("Call data fetched:", callRequest);

        // Subscribe to real-time updates for this call request
        const channel = supabase
          .channel(`call_request_${callId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'call_requests',
              filter: `id=eq.${callId}`
            },
            (payload) => {
              console.log("Real-time update received:", payload);
              if (payload.new) {
                setCallData((prevData: any) => ({
                  ...prevData,
                  ...payload.new
                }));
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
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
      if (!callData || zegoInitialized.current) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Get AppID and ServerSecret from environment variables
        const appID = 1022760751;  // Replace with your actual AppID
        const serverSecret = "32c65b8d77e1c9f10b8e7fa1d6231cad"; // Replace with your actual ServerSecret

        if (!appID || !serverSecret) {
          toast.error("Missing ZegoCloud configuration");
          return;
        }

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          callId as string,
          session.user.id,
          session.user.email as string
        );

        const zc = ZegoUIKitPrebuilt.create(kitToken);
        zegoInitialized.current = true;

        // Update call status when joining
        await supabase
          .from('call_requests')
          .update({ status: 'accepted', start_time: new Date().toISOString() })
          .eq('id', callId);

        zc.joinRoom({
          container: document.querySelector("#call-container") as HTMLElement,
          sharedLinks: [],
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },
          showScreenSharingButton: true,
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          onLeaveRoom: async () => {
            // Update call status when leaving
            await supabase
              .from('call_requests')
              .update({
                status: 'completed',
                end_time: new Date().toISOString()
              })
              .eq('id', callId);
          }
        });
      } catch (error) {
        console.error('Error initializing call:', error);
        toast.error("Failed to initialize call");
      }
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
              Call with {callData.client?.full_name} and {callData.developer?.title}
            </p>
          )}
        </div>
        <div id="call-container" className="w-full h-[600px] rounded-lg overflow-hidden bg-card" />
      </div>
    </div>
  );
};

export default CallRoom;
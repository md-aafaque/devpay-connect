import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const [wallet, setWallet] = useState<string>("");
  // const [callId, setCallId] = useState<string | null>(null);
  const [developerRate, setDeveloperRate] = useState<number>(0.001); // Changed to number type
  const [hoursWorked, setHoursWorked] = useState<number>(0);
  const [developerWallet, setDeveloperWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const callIdFromSearch = searchParams.get("callId");
  
  const navigate = useNavigate();
//   console.log(callIdFromSearch)
  useEffect(() => {
    if (callIdFromSearch) {
      // setCallId(callIdFromSearch);
      fetchCallDetails(callIdFromSearch); // Fetch details based on the call_i
    }
    checkWalletConnection();
  }, [callIdFromSearch]);

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

  const fetchCallDetails = async (callId: string) => {
    try {
      setLoading(true);

      // Fetch the call details from Supabase's call_requests table
      const { data: callData, error: callError } = await supabase
        .from("call_requests")
        .select("developer_id, duration")
        .eq("id", callId)
        .single();
        console.log(callData)

      if (callError) {
        throw new Error(callError.message);
      }

      if (callData) {
        const { developer_id, duration } = callData;

        // Fetch developer's rate and wallet info from the developers table
        const { data: developerData, error: developerError } = await supabase
          .from("developers")
          .select("hourly_rate, wallet_address")
          .eq("id", developer_id)
          .single();
          console.log(developerData)

        if (developerError) {
          throw new Error(developerError.message);
        }

        if (developerData) {
          setDeveloperRate(developerData.hourly_rate);
          setDeveloperWallet(developerData.wallet_address);
        }
        
        // Calculate hours worked (based on start and end times)
        // const startDate = new Date(start_time);
        // const endDate = new Date(end_time);
        // const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60); // Convert milliseconds to hours
        setHoursWorked(callData.duration);
      } else {
        toast({
          title: "Call Not Found",
          description: `No data found for Call ID: ${callId}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching call details:", error);
      toast({
        title: "Error Fetching Call Details",
        description: "Failed to retrieve call details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const initiatePayment = () => {
    if (!wallet || !developerRate || !hoursWorked || !developerWallet) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    setShowConfirmDialog(true);
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      //@ts-ignore
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const totalAmount = developerRate * hoursWorked;

      if (isNaN(totalAmount) || totalAmount <= 0) {
        throw new Error("Invalid payment amount");
      }

      const amountInWei = ethers.parseEther(totalAmount.toString());

      toast({
        title: "MetaMask Prompt",
        description: "Please check MetaMask popup to confirm the transaction.",
      });

      const tx = await signer.sendTransaction({
        to: developerWallet,
        value: amountInWei,
      });

      const receipt = await tx.wait();

      if (receipt && receipt.status === 1) {
        toast({
          title: "Payment Successful",
          description: `Successfully sent ${totalAmount} ETH to the developer.`,
        });
        navigate('client-dashboard')
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process the payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <Card className="p-6 space-y-6">
            <div className="text-sm text-muted-foreground break-all">
              Connected: {wallet}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Developer's Hourly Rate (ETH)
                </label>
                <Input
                  type="number"
                  value={developerRate}
                  placeholder={String(developerRate)}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Hours Worked
                </label>
                <Input
                  type="number"
                  value={hoursWorked}
                  disabled
                  placeholder={`${hoursWorked} hours`}
                />
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                Total: {developerRate && hoursWorked
                  ? `${(developerRate * hoursWorked).toFixed(3)} ETH`
                  : "0 ETH"}
              </div>
              <Button
                onClick={initiatePayment}
                className="w-full"
                disabled={loading || !hoursWorked}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Send Payment"
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to send{" "}
              {(developerRate * hoursWorked).toFixed(3)} ETH to the developer.
              After clicking confirm, MetaMask will open for you to review and approve the transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePayment}>
              Confirm Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Payment;

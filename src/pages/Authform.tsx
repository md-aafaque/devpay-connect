import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";

const Authform = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryRole = searchParams.get("type");
  const storedRole = localStorage.getItem("role");

  const role = queryRole || storedRole; // Ensure we always have a role
  console.log("Role:", role);

  useEffect(() => {
    if (queryRole) {
      localStorage.setItem("role", queryRole);
    }

    // Subscribe to auth state changes
    const { data: authSubscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const user = session.user;
          console.log("User signed in:", user.id);
          console.log(user)
          // Ensure the role is valid before proceeding
          if (role === "developer") {
            console.log("User is a developer. Checking if already exists...");

            // Check if the user already exists in the developers table
            const { data: existingDev, error: devError } = await supabase
              .from("developers")
              .select("id")
              .eq("id", user.id)
              .single();

            if (devError && devError.code !== "PGRST116") {
              console.error("Error checking developer:", devError);
              return;
            }

            console.log("Existing Developer Data:", existingDev);

            if (!existingDev) {
              console.log("User is new. Adding to developers table...");
              console.log(user.id);

              const hello = await supabase.from("profiles").insert([
                {
                  id: user.id, // Replace with the actual user id
                  full_name: user.user_metadata.full_name, // Replace with the actual full name
                  email: user.email, // Replace with the actual email
                  avatar_url: user.user_metadata.avatar_url, // Replace with the actual avatar URL
                  created_at: user.created_at, // Replace with the actual created_at timestamp
                  updated_at: user.updated_at, // Replace with the actual updated_at timestamp
                },
              ]);

              console.log(hello);

              console.log("Data Added to profile table");
              // Insert into developers table
              const { data, error } = await supabase.from("developers").insert([
                {
                  id: user.id,
                  hourly_rate: 0.5, // Default hourly rate
                  skills: [], // Empty skills array
                  status: "offline", // Default status
                  created_at: new Date().toISOString(),
                },
              ]);

              if (error) {
                console.error("Error inserting data:", error);
              } else {
                console.log("Data inserted successfully:", data);
              }
            }
          }else{
              console.log("User is a client. Checking if already exists...");
  
              // Check if the user already exists in the developers table
              const { data: existingClient, error: clientError } = await supabase
                .from("profiles")
                .select("id")
                .eq("id", user.id)
                .single();
  
              if (clientError && clientError.code !== "PGRST116") {
                console.error("Error checking client:", clientError);
                return;
              }
  
              console.log("Existing Client Data:", existingClient);
  
              if (!existingClient) {
                console.log("User is new. Adding to client table...");
                console.log(user.id);
  
                const { data, error } = await supabase.from("profiles").insert([
                  {
                    id: user.id, // Replace with the actual user id
                    full_name: user.user_metadata.full_name, // Replace with the actual full name
                    email: user.email, // Replace with the actual email
                    avatar_url: user.user_metadata.avatar_url, // Replace with the actual avatar URL
                    created_at: user.created_at, // Replace with the actual created_at timestamp
                    updated_at: user.updated_at, // Replace with the actual updated_at timestamp
                  },
                ]);
                if (error) {
                  console.error("Error inserting data:", error);
                } else {
                  console.log("Data inserted successfully:", data);
                }
              }
            }

          // Redirect to dashboard
          navigate(`/${role}-dashboard`);
        }
      }
    );

    // Cleanup function
    return () => {
      authSubscription?.subscription?.unsubscribe();
    };
  }, [navigate, role]);

  // Redirect URL for authentication
  const redirectUrl = `http://localhost:8080/auth`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {role === "developer" ? "Join as Developer" : "Find a Developer"}
          </h2>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={["github"]}
          redirectTo={redirectUrl}
        />
      </div>
    </div>
  );
};

export default Authform;

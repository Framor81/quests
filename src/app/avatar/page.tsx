"use client";

import ClientNavigation from '@/components/ClientNavigation';
import ThemeToggle from '@/components/ThemeToggle';
import { createBrowserClient } from '@/utils/supabase';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Avatar {
  user_id: string;
  hair_style: string;
  hair_color: string;
  skin_tone: string;
  eye_style: string;
  eye_color: string;
  avatar_url: string | null;
}

export default function AvatarPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Avatar customization state
  const hairStyles = ["short", "long", "braid"];
  const hairColors = ["black", "blonde", "brown"];
  const skinTones = ["light", "medium", "dark"];
  const eyeStyles = ["normal", "round", "sharp"];
  const eyeColors = ["blue", "green", "brown"];

  const [hairStyleIndex, setHairStyleIndex] = useState(0);
  const [hairColorIndex, setHairColorIndex] = useState(0);
  const [skinToneIndex, setSkinToneIndex] = useState(0);
  const [eyeStyleIndex, setEyeStyleIndex] = useState(0);
  const [eyeColorIndex, setEyeColorIndex] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("User error:", userError);
          setError("Authentication error. Please try logging in again.");
          router.push('/login');
          return;
        }

        if (!user) {
          console.log("No user found");
          router.push('/login');
          return;
        }

        // Fetch avatar data
        const { data: avatarData, error: avatarError } = await supabase
          .from("avatars")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (avatarError && avatarError.code !== 'PGRST116') { // Not found error
          console.error("Error fetching avatar:", avatarError);
          setError("Failed to load your avatar");
        } else if (avatarData) {
          setAvatar(avatarData as Avatar);
        }

        setLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setError("Failed to check authentication status");
        router.push('/login');
      }
    };

    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleCreate = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setError("You must be logged in to create an avatar");
        router.push('/login');
        return;
      }

      // Create a unique filename for the avatar
      const timestamp = new Date().getTime();
      const filename = `avatar_${user.id}_${timestamp}.svg`;

      // Create the SVG content for the avatar
      const svgContent = `
        <svg width="200" height="300" xmlns="http://www.w3.org/2000/svg">
          <image href="/avatars/base/${skinTones[skinToneIndex]}.svg" width="200" height="300"/>
          <image href="/avatars/eyes/${eyeStyles[eyeStyleIndex]}_${eyeColors[eyeColorIndex]}.svg" width="200" height="300"/>
          <image href="/avatars/hair/${hairStyles[hairStyleIndex]}_${hairColors[hairColorIndex]}.svg" width="200" height="300"/>
        </svg>
      `;

      // Convert SVG to Blob
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const file = new File([blob], filename, { type: 'image/svg+xml' });

      // Try to upload using a different method
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/svg+xml'
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        // Try to list buckets to debug
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        console.log("Available buckets:", buckets);
        console.log("Buckets error:", bucketsError);
        throw new Error(`Failed to upload avatar: ${uploadError.message}`);
      }

      // Get the public URL of the uploaded avatar
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filename);

      const newAvatar: Avatar = {
        user_id: user.id,
        hair_style: hairStyles[hairStyleIndex],
        hair_color: hairColors[hairColorIndex],
        skin_tone: skinTones[skinToneIndex],
        eye_style: eyeStyles[eyeStyleIndex],
        eye_color: eyeColors[eyeColorIndex],
        avatar_url: publicUrl
      };

      // First check if an avatar already exists
      const { data: existingAvatar, error: fetchError } = await supabase
        .from("avatars")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // Not found error
        console.error("Error fetching existing avatar:", fetchError);
        throw new Error("Failed to check for existing avatar");
      }

      let result;
      if (existingAvatar) {
        // Update existing avatar
        result = await supabase
          .from("avatars")
          .update(newAvatar)
          .eq("user_id", user.id);
      } else {
        // Insert new avatar
        result = await supabase
          .from("avatars")
          .insert(newAvatar);
      }

      if (result.error) {
        console.error("Database error:", result.error);
        throw new Error(`Failed to save avatar: ${result.error.message}`);
      }

      setAvatar(newAvatar);
      setCreating(false);
      setSuccess("Avatar saved successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error saving avatar:", error);
      setError(error instanceof Error ? error.message : "Failed to save your avatar. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { error } = await supabase.from("avatars").delete().eq("user_id", user.id);
      if (!error) {
        setAvatar(null);
        setCreating(false);
      }
    } catch (error) {
      console.error("Error deleting avatar:", error);
    }
  };

  const randomize = () => {
    setHairStyleIndex(Math.floor(Math.random() * hairStyles.length));
    setHairColorIndex(Math.floor(Math.random() * hairColors.length));
    setSkinToneIndex(Math.floor(Math.random() * skinTones.length));
    setEyeStyleIndex(Math.floor(Math.random() * eyeStyles.length));
    setEyeColorIndex(Math.floor(Math.random() * eyeColors.length));
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen w-full">Loading...</div>;

  if (!avatar || creating) {
    return (
      <div className="relative flex min-h-screen w-full flex-col items-center justify-between bg-gradient-to-b from-brown to-blue-300 text-black">
        <ClientNavigation />

        {/* Delete Avatar Button */}
        {avatar && (
          <button
            onClick={handleDelete}
            className="absolute top-20 right-4 px-4 py-2 bg-destructive/80 backdrop-blur-sm text-destructive-foreground rounded-lg hover:bg-accent transition-colors z-10"
          >
            Delete Avatar
          </button>
        )}

        <main className="relative flex flex-1 flex-col items-center justify-center px-4 text-center z-10">
          <h1 className="pirate-font text-6xl font-extrabold text-darkbrown drop-shadow-lg mb-8">
            Create Your Pirate Avatar
          </h1>

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-destructive/80 backdrop-blur-sm text-destructive-foreground rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-500/80 backdrop-blur-sm text-white rounded-lg">
              {success}
            </div>
          )}

          {/* Avatar preview */}
          <div className="relative w-[200px] h-[300px] mb-8 bg-card/80 backdrop-blur-sm rounded-lg p-4">
            <Image src={`/avatars/base/${skinTones[skinToneIndex]}.svg`} alt="base" fill className="absolute" />
            <Image src={`/avatars/eyes/${eyeStyles[eyeStyleIndex]}_${eyeColors[eyeColorIndex]}.svg`} alt="eyes" fill className="absolute" />
            <Image src={`/avatars/hair/${hairStyles[hairStyleIndex]}_${hairColors[hairColorIndex]}.svg`} alt="hair" fill className="absolute" />
          </div>

          {/* Customization options */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center mb-8 w-full max-w-2xl">
            {[{
              label: "Hair Style", value: hairStyles[hairStyleIndex], change: () => setHairStyleIndex((hairStyleIndex + 1) % hairStyles.length)
            },{
              label: "Hair Color", value: hairColors[hairColorIndex], change: () => setHairColorIndex((hairColorIndex + 1) % hairColors.length)
            },{
              label: "Skin Tone", value: skinTones[skinToneIndex], change: () => setSkinToneIndex((skinToneIndex + 1) % skinTones.length)
            },{
              label: "Eye Style", value: eyeStyles[eyeStyleIndex], change: () => setEyeStyleIndex((eyeStyleIndex + 1) % eyeStyles.length)
            },{
              label: "Eye Color", value: eyeColors[eyeColorIndex], change: () => setEyeColorIndex((eyeColorIndex + 1) % eyeColors.length)
            }].map((attr, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="font-medium text-foreground mb-2">{attr.label}</span>
                <button 
                  className="bg-secondary/80 backdrop-blur-sm text-secondary-foreground px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                  onClick={attr.change}
                >
                  {attr.value}
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button 
              className="px-6 py-3 bg-primary/80 backdrop-blur-sm text-primary-foreground rounded-lg hover:bg-accent transition-colors"
              onClick={handleCreate}
            >
              {avatar ? "Update Avatar" : "Finalize Avatar"}
            </button>
            <button 
              className="px-6 py-3 bg-secondary/80 backdrop-blur-sm text-secondary-foreground rounded-lg hover:bg-accent transition-colors"
              onClick={randomize}
            >
              Randomize
            </button>
          </div>
        </main>

        {/* Beach Wave Background */}
        <div className="absolute bottom-0 w-full h-[320px] overflow-hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 800 320"
            className="absolute bottom-0 w-full"
            aria-label="Animated beach waves"
          >
            {/* Background Wave */}
            <path
              fill="#457b9d"
              fillOpacity="0.5"
              d="M0,320 C300,250 600,350 900,300 C1200,250 1500,350 1800,300 L1800,320 L0,320 Z"
            ></path>

            {/* Middle Wave */}
            <path
              fill="#0077b6"
              fillOpacity="0.5"
              d="M0,280 C300,230 600,350 900,280 C1200,230 1500,350 1800,280 L1800,320 L0,320 Z"
            >
              <animate
                attributeName="d"
                dur="8s"
                repeatCount="indefinite"
                values="M0,280 C300,230 600,350 900,280 C1200,230 1500,350 1800,280 L1800,320 L0,320 Z;
                  M0,260 C300,210 600,330 900,260 C1200,210 1500,330 1800,260 L1800,320 L0,320 Z;
                  M0,280 C300,230 600,350 900,280 C1200,230 1500,350 1800,280 L1800,320 L0,320 Z"
              />
            </path>

            {/* Foreground Wave */}
            <path
              fill="#023e8a"
              fillOpacity=".8"
              dur="5s"
              d="M0,240 C300,190 600,320 900,250 C1200,190 1500,320 1800,250 L1800,320 L0,320 Z"
            >
              <animate
                attributeName="d"
                dur="5s"
                repeatCount="indefinite"
                values="M0,240 C300,190 600,320 900,250 C1200,190 1500,320 1800,250 L1800,320 L0,320 Z;
                  M0,220 C300,170 600,310 900,240 C1200,170 1500,310 1800,240 L1800,320 L0,320 Z;
                  M0,240 C300,190 600,320 900,250 C1200,190 1500,320 1800,250 L1800,320 L0,320 Z"
              />
            </path>
          </svg>
        </div>

        <footer className="relative w-full border-t border-border p-6 text-center text-xs text-muted-foreground z-10">
          Powered by{' '}
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-primary"
          >
            Supabase
          </a>
          . <ThemeToggle />
        </footer>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-between bg-gradient-to-b from-brown to-blue-300 text-black">
      <ClientNavigation />

      {/* Delete Avatar Button */}
      {avatar && (
        <button
          onClick={handleDelete}
          className="absolute top-20 right-4 px-4 py-2 bg-destructive/80 backdrop-blur-sm text-destructive-foreground rounded-lg hover:bg-accent transition-colors z-10"
        >
          Delete Avatar
        </button>
      )}

      <main className="relative flex flex-1 flex-col items-center justify-center px-4 text-center z-10">
        <h1 className="pirate-font text-6xl font-extrabold text-darkbrown drop-shadow-lg mb-8">
          Your Pirate Avatar
        </h1>

        <div className="relative w-full max-w-2xl">
          <div className="relative w-[200px] h-[300px] mx-auto bg-card/80 backdrop-blur-sm rounded-lg p-4">
            <Image src={`/avatars/base/${avatar.skin_tone}.svg`} alt="base" fill className="absolute" />
            <Image src={`/avatars/eyes/${avatar.eye_style}_${avatar.eye_color}.svg`} alt="eyes" fill className="absolute" />
            <Image src={`/avatars/hair/${avatar.hair_style}_${avatar.hair_color}.svg`} alt="hair" fill className="absolute" />
          </div>
        </div>
      </main>

      {/* Beach Wave Background */}
      <div className="absolute bottom-0 w-full h-[320px] overflow-hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 800 320"
          className="absolute bottom-0 w-full"
          aria-label="Animated beach waves"
        >
          {/* Background Wave */}
          <path
            fill="#457b9d"
            fillOpacity="0.5"
            d="M0,320 C300,250 600,350 900,300 C1200,250 1500,350 1800,300 L1800,320 L0,320 Z"
          ></path>

          {/* Middle Wave */}
          <path
            fill="#0077b6"
            fillOpacity="0.5"
            d="M0,280 C300,230 600,350 900,280 C1200,230 1500,350 1800,280 L1800,320 L0,320 Z"
          >
            <animate
              attributeName="d"
              dur="8s"
              repeatCount="indefinite"
              values="M0,280 C300,230 600,350 900,280 C1200,230 1500,350 1800,280 L1800,320 L0,320 Z;
                M0,260 C300,210 600,330 900,260 C1200,210 1500,330 1800,260 L1800,320 L0,320 Z;
                M0,280 C300,230 600,350 900,280 C1200,230 1500,350 1800,280 L1800,320 L0,320 Z"
            />
          </path>

          {/* Foreground Wave */}
          <path
            fill="#023e8a"
            fillOpacity=".8"
            dur="5s"
            d="M0,240 C300,190 600,320 900,250 C1200,190 1500,320 1800,250 L1800,320 L0,320 Z"
          >
            <animate
              attributeName="d"
              dur="5s"
              repeatCount="indefinite"
              values="M0,240 C300,190 600,320 900,250 C1200,190 1500,320 1800,250 L1800,320 L0,320 Z;
                M0,220 C300,170 600,310 900,240 C1200,170 1500,310 1800,240 L1800,320 L0,320 Z;
                M0,240 C300,190 600,320 900,250 C1200,190 1500,320 1800,250 L1800,320 L0,320 Z"
            />
          </path>
        </svg>
      </div>

      <footer className="relative w-full border-t border-border p-6 text-center text-xs text-muted-foreground z-10">
        Powered by{' '}
        <a
          href="https://supabase.com"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-primary"
        >
          Supabase
        </a>
        . <ThemeToggle />
      </footer>
    </div>
  );
}


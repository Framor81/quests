"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Avatar {
  user_id: string;
  hair_style: string;
  hair_color: string;
  skin_tone: string;
  eye_style: string;
  eye_color: string;
}

export default function AvatarPage() {
  const supabase = createClientComponentClient();
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

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
    const fetchAvatar = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("avatars")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (!error && data) {
          setAvatar(data as Avatar);
        }
      } catch (error) {
        console.error("Error fetching avatar:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAvatar();
  }, [supabase]);

  const handleCreate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newAvatar: Avatar = {
        user_id: user.id,
        hair_style: hairStyles[hairStyleIndex],
        hair_color: hairColors[hairColorIndex],
        skin_tone: skinTones[skinToneIndex],
        eye_style: eyeStyles[eyeStyleIndex],
        eye_color: eyeColors[eyeColorIndex],
      };

      const { error } = await supabase.from("avatars").insert(newAvatar);
      if (!error) {
        setAvatar(newAvatar);
        setCreating(false);
      }
    } catch (error) {
      console.error("Error creating avatar:", error);
    }
  };

  const handleDelete = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("avatars").delete().eq("user_id", user?.id);
    setAvatar(null);
    setCreating(false);
  };

  const randomize = () => {
    setHairStyleIndex(Math.floor(Math.random() * hairStyles.length));
    setHairColorIndex(Math.floor(Math.random() * hairColors.length));
    setSkinToneIndex(Math.floor(Math.random() * skinTones.length));
    setEyeStyleIndex(Math.floor(Math.random() * eyeStyles.length));
    setEyeColorIndex(Math.floor(Math.random() * eyeColors.length));
  };

  if (loading) return <div className="p-4">Loading...</div>;

  if (!avatar || creating) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">Create Your Avatar</h1>

        {/* Avatar preview */}
        <div className="relative w-[200px] h-[300px] mb-4">
          <Image src={`/avatars/base/${skinTones[skinToneIndex]}.svg`} alt="base" fill className="absolute" />
          <Image src={`/avatars/eyes/${eyeStyles[eyeStyleIndex]}_${eyeColors[eyeColorIndex]}.svg`} alt="eyes" fill className="absolute" />
          <Image src={`/avatars/hair/${hairStyles[hairStyleIndex]}_${hairColors[hairColorIndex]}.svg`} alt="hair" fill className="absolute" />
        </div>

        {/* Arrows to cycle through options */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-4">
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
              <span className="font-medium">{attr.label}</span>
              <button className="bg-gray-200 px-3 py-1 rounded" onClick={attr.change}>{attr.value}</button>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleCreate}>Finalize Avatar</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={randomize}>Randomize</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-8">
      <button
        onClick={handleDelete}
        className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white rounded"
      >
        Delete Avatar
      </button>

      <h1 className="text-2xl font-bold mb-4">Your Avatar</h1>

      <div className="relative w-[200px] h-[300px] mx-auto">
        <Image src={`/avatars/base/${avatar.skin_tone}.svg`} alt="base" fill className="absolute" />
        <Image src={`/avatars/eyes/${avatar.eye_style}_${avatar.eye_color}.svg`} alt="eyes" fill className="absolute" />
        <Image src={`/avatars/hair/${avatar.hair_style}_${avatar.hair_color}.svg`} alt="hair" fill className="absolute" />
      </div>
    </div>
  );
}

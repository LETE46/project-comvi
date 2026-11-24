"use client";

import Image from "next/image";
import { useLiff } from "@/components/LiffProvider";

export default function Home() {
  const { profile, loading, error } = useLiff();
  console.log({ profile, loading, error });

  if (loading) return <p className="p-4">กำลังโหลด...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <main className="p-4 flex items-center gap-3">
      {profile?.pictureUrl && (
        <Image
          src={profile.pictureUrl}
          alt="รูปโปรไฟล์"
          width={48}
          height={48}
          className="rounded-full"
        />
      )}
      <div>
        <p className="font-bold">สวัสดี {profile?.displayName}</p>
        <p className="text-xs text-gray-500">{profile?.userId}</p>
      </div>
    </main>
  );
}
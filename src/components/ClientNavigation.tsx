"use client";

import Link from 'next/link';
import ClientAuthButton from './ClientAuthButton';

export default function ClientNavigation() {
  return (
    <nav className="flex h-16 w-full justify-center border-b border-b-foreground/10">
      <div className="flex w-full max-w-4xl items-center justify-between p-3 text-sm">
        <div className="flex items-center gap-6">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/avatar" className="hover:underline">
            Avatar
          </Link>
          <Link href="/map" className="hover:underline">
            Map
          </Link>
          <Link href="/create" className="hover:underline">
            Create Quest
          </Link>
          <Link href="/bulletin" className="hover:underline">
            Quests
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ClientAuthButton />
        </div>
      </div>
    </nav>
  )
} 
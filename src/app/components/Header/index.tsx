"use client"

import { SignedIn, SignInButton, UserButton, SignedOut, useUser } from '@clerk/nextjs';

import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const { user } = useUser();

  function handleHome() {
    router.push('/');
  }

  return (
    <header className="bg-gray-800 text-white py-4 px-10 flex justify-between items-center">
      <h1 
        className="text-2xl font-bold cursor-pointer"
        onClick={handleHome}
      >
        PWEB Fórum
      </h1>
      <div>
        <SignedIn>
          <div className='flex items-center gap-3'>
            {user && <span className="text-white">{user.fullName}</span>}
            <UserButton />
          </div>
        </SignedIn>
        <SignedOut>
          <SignInButton>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Entrar
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </header>
  );
}

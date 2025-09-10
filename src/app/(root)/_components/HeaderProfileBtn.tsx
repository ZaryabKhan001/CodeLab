'use client';
import LoginButton from '@/components/LoginButton';
import { SignedOut, UserButton } from '@clerk/nextjs';
import { User } from 'lucide-react';
import React from 'react';

const HeaderProfileBtn = () => {
  return (
    <>
      <UserButton>
        <UserButton.MenuItems>
          <UserButton.Link
            label='Profile'
            href='/profile'
            labelIcon={<User />}
          />
        </UserButton.MenuItems>
      </UserButton>

      <SignedOut>
        <LoginButton />
      </SignedOut>
    </>
  );
};

export default HeaderProfileBtn;

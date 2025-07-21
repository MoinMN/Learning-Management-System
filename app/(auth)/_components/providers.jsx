"use client";

import { signIn } from "next-auth/react";

const ProvidersBox = ({ role }) => {
  return (
    <div className="grid sm:grid-cols-2 gap-4 md:gap-6 text-black px-8 md:px-20 text-sm md:text-base">
      <button
        onClick={() => {
          // set role in cookies for limited time
          document.cookie = `register_as=${role}; path=/ Max-Age=300`;
          signIn('google')
        }}
        className='bg-white flex justify-evenly items-center rounded-md gap-2 px-2 py-1 md:gap-4 md:px-4 md:py-2 cursor-pointer'
      >
        <img
          src="https://authjs.dev/img/providers/google.svg"
          alt="Google Provider Image"
          width={40}
        />
        <span className=''>
          Sign in with Google
        </span>
      </button>

      <button
        onClick={() => {
          document.cookie = `register_as=${role}; path=/; Max-Age=300`;
          signIn('github')
        }}
        className='bg-white flex justify-evenly items-center rounded-md gap-2 px-2 py-1 md:gap-4 md:px-4 md:py-2 cursor-pointer'
      >
        <img
          src="https://authjs.dev/img/providers/github.svg"
          alt="Google Provider Image"
          width={40}
        />
        <span className=''>
          Sign in with Google
        </span>
      </button>
    </div>
  )
}

export default ProvidersBox

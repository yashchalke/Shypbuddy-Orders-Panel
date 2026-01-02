import Image from 'next/image'
import React from 'react'

const Navbar = () => {
  return (
    <nav className='text-white font-poppins h-[10vh] border-b flex items-center p-4 top-0 sticky z-10 bg-[#202842]'>
        <div className='w-40'>
        <Image src={"/ShypBUDDY-logo.png"} alt='Shypbuddy' width={384} height={84} />
        </div>
    </nav>
  )
}

export default Navbar
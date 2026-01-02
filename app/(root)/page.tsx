import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div className='font-poppins text-white p-5'>
        <h1>Home page</h1>
        <div className='h-20 mt-6'>
        <Link href={"/orders"} className='px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600'>Orders</Link>
        </div>
    </div>
  )
}

export default page
import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div className='font-poppins text-white p-4'>
        <h1>Orders Page</h1>
        <div className='mt-6'>
          <Link href={"/orders/create_order"} className='px-4 py-2 bg-blue-500 rounded hover:bg-blue-600'>+ New Order</Link>
        </div>
    </div>
  )
}

export default page
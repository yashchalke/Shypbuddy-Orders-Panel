import React from 'react'
import AddressForm from './(components)/AddressForm'

const page = () => {
  return (
    <div className='p-4 md:p-10 font-poppins text-white'>
        <div className='border h-full rounded-lg bg-[#24303f] border-[#2c3a4b]'>
          <div className='h-18 border-b flex items-center px-6 border-[#38495e] '>
            <h1 className='text-xl font-semibold'>Add Address</h1>     
          </div>
          <div className='p-6'>
            <AddressForm />
          </div>
        </div>
    </div>
  )
}

export default page
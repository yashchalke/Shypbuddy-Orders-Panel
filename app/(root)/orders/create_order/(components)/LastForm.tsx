import React from "react";

const LastForm = () => {
  return (
    <div className="mt-6">
      <form>
        <div>
          <h1 className="font-bold text-lg">Dangerous Goods</h1>
          <p className="text-sm ">Indicate whether the order contains any dangerous goods</p>
        </div>
        <div className="mt-4">
            <div className="flex gap-4">
            <div className="flex gap-2"><input type="radio" name="Dangerous_goods" /><label>Yes</label></div>
            <div className="flex gap-2"><input type="radio" name="Dangerous_goods" /><label>No</label></div>
            </div>
        </div>
      </form>
      <div className='border-b mt-10 border-[#38495e]'></div>


      <div className="mt-6">
      <form>
        <div>
          <h1 className="font-bold text-lg">Dangerous Goods</h1>
          <p className="text-sm ">Indicate whether the order contains any dangerous goods</p>
        </div>
        <div className="mt-4">
            <div className="flex gap-4">
            <div className="flex gap-2 items-center"><input type="radio" name="Payment" /><label>Prepaid</label></div>
            <div className="flex gap-2 items-center"><input type="radio" name="Payment" /><label>Cash On Delivery(COD)</label></div>
            </div>
        </div>

        <div className="border w-full text-black p-3 bg-white rounded-lg mt-5 flex justify-between font-semibold">
        <h1>Total Order Value</h1>
        <h1>₹ 0</h1>
      </div>
      <div className="flex gap-4 mt-4 justify-end">
        <button className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600">save</button>
        <button className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600">Cancel</button>
      </div>
      </form>
      </div>

      
    </div>
  );
};

export default LastForm;

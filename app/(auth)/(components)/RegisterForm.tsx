"use client";
import React, { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import z from "zod"
import toast from "react-hot-toast";

const RegisterForm = () => {
  const router = useRouter();
    const [email,setemail] = useState("");
    const [password,setpassword] = useState("");
    const [name,setname] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const Registerschema = z.object({
      name:z.string().min(4,"Enter Full name"),
      email:z.string().email("Enter valid Email address."),
      password:z.string().min(6,"password must be minimum 6 characters")
    });


     const validateSingleField = (key: string, value: string) => {
    const partial = Registerschema.pick({ [key]: true } as any);
    const result = partial.safeParse({ [key]: value });

    setErrors((prev) => {
      const updated = { ...prev };

      if (!result.success) {
        updated[key] = result.error.issues[0].message;
      } else {
        delete updated[key];
      }

      return updated;
    });
  };

  const handlesubmit = async(e:FormEvent<HTMLElement>)=>{
    e.preventDefault();

    const res = await fetch("/api/auth/register",{
      method:"POST",
      headers:{"Content-type":"Application/json"},
      body:JSON.stringify({name,email,password})
    })

    const data = await res.json();

    if(!res.ok){
      toast.error(data.error[0]);
      return
    }
    
    toast.success("User Registered Successful!!");
    setname("");
    setemail("");
    setpassword("");
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  }

  return (
    <div className="text-black">
      <form className="flex flex-col md:p-6 p-4 gap-y-6" onSubmit={handlesubmit}>
        <div className="flex justify-center md:mt-8 mt-12 flex-col items-center">
          <Image
            src={"/ShypBUDDY-logo.png"}
            alt="Shypbuddy-logo"
            width={384}
            height={84}
            className="w-40"
          ></Image>
          <h1 className="text-xl font-semibold mt-5">Register</h1>
        </div>
        <div className="mt-2 flex flex-col gap-y-4">
          <div className="w-full">
            <h1 className="ml-1 mb-2">Full Name <span className="text-red-500">*</span></h1> 
          <input
            type="text"
            value={name}
            className="bg-gray-200 p-2 text-gray-600 rounded-lg w-full"
            placeholder="Enter your Full name"
            onChange={(e) => {setname(e.target.value);validateSingleField("name",e.target.value)}}
          ></input>
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div className="w-full">
            <h1 className="ml-1 mb-2">Email Address <span className="text-red-500">*</span></h1>
          <input
            type="text"
            value={email}
            className="bg-gray-200 p-2 text-gray-600 rounded-lg w-full"
            placeholder="Enter your Email"
            onChange={(e) => {setemail(e.target.value);validateSingleField("email",e.target.value)}}
          ></input>
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div className="w-full">
            <h1 className="ml-1 mb-2">Password <span className="text-red-500">*</span></h1>
          <input
            type="text"
            value={password}
            className="bg-gray-200 p-2 text-gray-600 rounded-lg w-full"
            placeholder="Enter your password"
            onChange={(e) => {setpassword(e.target.value);validateSingleField("password",e.target.value)}}
          ></input>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          <div className="mt-2 ml-1">
            <input type="checkbox" /> Remember me
          </div>
          </div>
          
        </div>
        <div className="flex flex-col gap-y-4">
          <button
            className="bg-blue-400 p-2 rounded-lg cursor-pointer hover:bg-blue-500"
            type="submit"
          >
            Register
          </button>
          <Link
            className="bg-black text-center hover:bg-red-400 hover:text-black text-white p-2 rounded-lg cursor-pointer"
            href={"/login"}
          >
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;

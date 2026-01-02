"use client";
import { Delete } from "lucide-react";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

type FormProps = {
  onChange: (data: Record<string, any>) => void;
};

const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  category: z.string().min(2, "Category is required"),
  sku: z.string().min(2, "SKU is required"),
  hsn: z.string().min(4, "HSN code is invalid"),
  quantity: z.string().regex(/^\d+$/, "Quantity must be a number"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter valid price"),
});

const ProductDetailsForm = ({ onChange }: FormProps) => {
  const [products, setproducts] = useState<any[]>([]);

  const [name, setname] = useState("");
  const [category, setcategory] = useState("");
  const [sku, setsku] = useState("");
  const [hsn, sethsn] = useState("");
  const [quantity, setquantity] = useState("");
  const [price, setprice] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    onChange(products);
  }, [products]);

  const validateField = (key: string, value: string) => {
    const partial = productSchema.pick({ [key]: true } as any);
    const result = partial.safeParse({ [key]: value });

    setErrors((prev) => {
      const updated = { ...prev };
      if (!result.success) updated[key] = result.error.issues[0].message;
      else delete updated[key];
      return updated;
    });
  };

  const addProduct = () => {
    const formData = { name, category, sku, hsn, quantity, price };
    const result = productSchema.safeParse(formData);

    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        errs[err.path[0] as string] = err.message;
      });
      setErrors(errs);
      toast.error("Please fix product errors");
      return;
    }

    const payload = {
      name,
      category,
      SKU: sku,
      HSN: hsn,
      unitPrice: Number(price),
      quantity: Number(quantity),
    };

    setproducts((prev) => [...prev, payload]);
    toast.success("Product Added Successfully");

    setname("");
    setcategory("");
    setsku("");
    sethsn("");
    setquantity("");
    setprice("");
    setErrors({});
  };

  return (
    <div className="mt-6">
      <form>
        <div>
          <h1 className="font-bold text-lg">Product Details</h1>
          <p className="text-sm">What is/are the product being shipped?</p>
        </div>

        <div className="mt-5 grid md:grid-cols-3 flex-wrap gap-x-2 gap-y-4">
          <div className="flex-1 flex-col gap-2">
            <label className="text-sm">
              Product Name<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => {
                setname(e.target.value);
                validateField("name", e.target.value);
              }}
              className="bg-[#1a222c] px-2 py-1 rounded-lg w-full min-w-60 border-[#3b4f68] border mt-2"
              placeholder="Enter Product Name"
            />
            {errors.name && (
              <p className="text-red-400 text-xs">{errors.name}</p>
            )}
          </div>

          <div className="flex-1 flex-col gap-2">
            <label className="text-sm">
              Category<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              value={category}
              onChange={(e) => {
                setcategory(e.target.value);
                validateField("category", e.target.value);
              }}
              className="bg-[#1a222c] px-2 py-1 rounded-lg w-full min-w-60 border-[#3b4f68] border mt-2"
              placeholder="Select a Category"
            />
            {errors.category && (
              <p className="text-red-400 text-xs">{errors.category}</p>
            )}
          </div>

          <div className="flex-1 flex-col gap-2">
            <label className="text-sm">SKU</label>
            <input
              value={sku}
              onChange={(e) => {
                setsku(e.target.value);
                validateField("sku", e.target.value);
              }}
              className="bg-[#1a222c] px-2 py-1 rounded-lg w-full min-w-60 border-[#3b4f68] border mt-2"
              placeholder="Enter SKU"
            />
            {errors.sku && <p className="text-red-400 text-xs">{errors.sku}</p>}
          </div>

          <div className="flex-1 flex-col gap-2">
            <label className="text-sm">HSN Code</label>
            <input
              value={hsn}
              onChange={(e) => {
                sethsn(e.target.value);
                validateField("hsn", e.target.value);
              }}
              className="bg-[#1a222c] px-2 py-1 rounded-lg w-full min-w-60 border-[#3b4f68] border mt-2"
              placeholder="Enter HSN Code"
            />
            {errors.hsn && <p className="text-red-400 text-xs">{errors.hsn}</p>}
          </div>

          <div className="flex-1 flex-col gap-2">
            <label className="text-sm">
              Quantity<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              value={quantity}
              onChange={(e) => {
                setquantity(e.target.value);
                validateField("quantity", e.target.value);
              }}
              className="bg-[#1a222c] px-2 py-1 rounded-lg w-full min-w-60 border-[#3b4f68] border mt-2"
              placeholder="Quantity"
            />
            {errors.quantity && (
              <p className="text-red-400 text-xs">{errors.quantity}</p>
            )}
          </div>

          <div className="flex-1 flex-col gap-2">
            <label className="text-sm">
              Unit Price<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              value={price}
              onChange={(e) => {
                setprice(e.target.value);
                validateField("price", e.target.value);
              }}
              className="bg-[#1a222c] px-2 py-1 rounded-lg w-full min-w-60 border-[#3b4f68] border mt-2"
              placeholder="Enter Unit Price"
            />
            {errors.price && (
              <p className="text-red-400 text-xs">{errors.price}</p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={addProduct}
          className="bg-purple-400 px-5 py-2 rounded-lg mt-5 cursor-pointer hover:bg-purple-500"
        >
          Add Product
        </button>
      </form>

      {products.length !== 0 && (
        <div className="mt-4 grid md:grid-cols-3 lg:grid-cols-4 flex-wrap gap-4">
          {products.map((item) => (
            <div key={item.name} className="flex-1 min-w-60">
              <div className="rounded-xl p-2 bg-[#344e6e]">
                <div className="p-2 flex justify-between border-b">
                  <h1>{item.name}</h1>
                  <Delete />
                </div>
                <div className="mt-2 p-2 flex flex-col gap-2 border-b">
                  <div className="flex justify-between">
                    <h1>Category</h1>
                    <h1>{item.category}</h1>
                  </div>
                  <div className="flex justify-between">
                    <h1>Quantity</h1>
                    <h1>{item.quantity}</h1>
                  </div>
                  <div className="flex justify-between">
                    <h1>Price</h1>
                    <h1>{item.unitPrice}</h1>
                  </div>
                </div>
                <div className="p-2 flex justify-between">
                  <h1>Total</h1>
                  <h1>{item.unitPrice * item.quantity}</h1>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-b mt-10 border-[#38495e]"></div>
    </div>
  );
};

export default ProductDetailsForm;

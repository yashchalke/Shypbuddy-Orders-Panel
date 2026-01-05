"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { Trash2 } from "lucide-react";

type Props = {
  onConfirm: () => void;
};

export default function DeleteOrderDialog({ onConfirm }: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="text-red-400 hover:text-red-500">
          <Trash2 size={18} />
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-[#1f2b3a] border-[#38495e] text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Order?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Are you sure you want to delete order?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="bg-gray-600 hover:bg-gray-700">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

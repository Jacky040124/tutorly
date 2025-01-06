import Link from "next/link";
import clsx from "clsx";

const baseStyles = {
  solid:
    "group inline-flex items-center justify-center rounded-md py-2 px-4 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 shadow-sm",
  outline: "group inline-flex ring-1 items-center justify-center rounded-md py-2 px-4 text-sm focus:outline-none",
};

const variantStyles = {
  solid: {
    slate:
      "bg-green-600 text-white hover:bg-green-500 hover:text-white active:bg-green-700 active:text-white focus-visible:outline-green-600",
    blue: "bg-green-600 text-white hover:text-white hover:bg-green-500 active:bg-green-700 active:text-white focus-visible:outline-green-600",
    white:
      "bg-white text-green-600 hover:bg-green-50 active:bg-green-100 active:text-green-700 focus-visible:outline-white",
    red: "bg-red-600 text-white hover:bg-red-500 active:bg-red-700 focus-visible:outline-red-600",
    indigo: "bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 focus-visible:outline-indigo-600",
  },
  outline: {
    slate:
      "ring-green-200 text-green-700 hover:text-green-900 hover:ring-green-300 active:bg-green-100 active:text-green-600 focus-visible:outline-green-600 focus-visible:ring-green-300",
    white:
      "ring-white text-white hover:ring-green-500 active:ring-green-700 active:text-white focus-visible:outline-white",
    red: "ring-red-200 text-red-700 hover:text-red-900 hover:ring-red-300 active:bg-red-100 focus-visible:outline-red-600",
    indigo:
      "ring-indigo-200 text-indigo-700 hover:text-indigo-900 hover:ring-indigo-300 active:bg-indigo-100 focus-visible:outline-indigo-600",
  },
};

export function Button({ variant = "solid", color = "slate", className, ...props }) {
  className = clsx(baseStyles[variant], variantStyles[variant][color], className);

  return typeof props.href === "undefined" ? (
    <button className={className} {...props} />
  ) : (
    <Link className={className} {...props} />
  );
}

import Image, { type ImageProps } from "next/image";
import { img } from "@/lib/utils";

const OPTIMIZABLE = /^(\/|https:\/\/(images|plus)\.unsplash\.com\/)/;

/** next/image that safely handles any URL an admin pastes in. */
export function Img({ src, alt, ...rest }: Omit<ImageProps, "src"> & { src: string }) {
  if (!src) return <div className="absolute inset-0 bg-accent-soft" aria-hidden />;
  const ok = OPTIMIZABLE.test(src);
  return <Image src={img(src)} alt={alt} unoptimized={!ok} {...rest} />;
}

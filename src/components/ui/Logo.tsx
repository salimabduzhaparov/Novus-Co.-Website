import Image from "next/image";
export function Logo({
  size,
  wordmarkClassName = "",
}: {
  size?: number;
  wordmarkClassName?: string;
}) {
  return (
    <Image
      src="/brand/novus-logo.webp"
      width={500}
      height={180}
      alt="Novus Co."
      className={`brand-logo ${wordmarkClassName}`}
      style={size ? { width: size * 5 } : undefined}
      priority
    />
  );
}
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <Image src="/brand/icon.png" width={size} height={size} alt="Novus Co." />
  );
}

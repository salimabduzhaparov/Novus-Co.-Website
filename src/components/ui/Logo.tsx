import Image from "next/image";
export function Logo({
  size,
  wordmarkClassName = "",
}: {
  size?: number;
  wordmarkClassName?: string;
}) {
  return (
    <span
      className={`brand-logo ${wordmarkClassName}`}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Show only the original orbital mark; preserve the supplied image. */}
      <Image
        src="/brand/novus-profile.png"
        width={1000}
        height={1000}
        sizes="150px"
        alt="Novus Co."
        className="brand-logo-image"
        priority
      />
    </span>
  );
}
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <Logo size={size} />
  );
}

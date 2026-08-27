type Props = {
  className?: string;
  decorative?: boolean;
  eager?: boolean;
};

export function BrandLogo({ className = "", decorative = false, eager = false }: Props) {
  return (
    <picture className={`brand-logo-lockup${className ? ` ${className}` : ""}`}>
      <source srcSet="/assets/images/home/figure-01-46f68dba79.avif" type="image/avif" />
      <source srcSet="/assets/images/home/figure-01-46f68dba79.webp" type="image/webp" />
      <img
        src="/assets/images/home/figure-01-46f68dba79.jpg"
        alt={decorative ? "" : "Jason Liao identity mark"}
        width="1024"
        height="1024"
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </picture>
  );
}

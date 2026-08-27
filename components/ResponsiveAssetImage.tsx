export type ImageAsset = {
  publicPath: string;
  alt: string;
  avifPath?: string;
  webpPath?: string;
  fallbackPath?: string;
};

type Props = {
  asset: ImageAsset;
  width: number;
  height: number;
  eager?: boolean;
};

export function ResponsiveAssetImage({ asset, width, height, eager = false }: Props) {
  return (
    <picture
      className="responsive-picture"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {asset.avifPath ? <source srcSet={asset.avifPath} type="image/avif" /> : null}
      {asset.webpPath ? <source srcSet={asset.webpPath} type="image/webp" /> : null}
      <img
        src={asset.fallbackPath ?? asset.publicPath}
        alt={asset.alt}
        width={width}
        height={height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "auto"}
      />
    </picture>
  );
}

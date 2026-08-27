export type PublicAsset = {
  id: string;
  publicPath: string;
  kind: "image" | "document";
  alt: string;
  caption?: string;
  title?: string;
  size?: string;
  pages?: number;
  width?: number;
  height?: number;
  displayOrder?: number;
  placementSectionId?: string;
  previewPath?: string;
  avifPath?: string;
  webpPath?: string;
  fallbackPath?: string;
};

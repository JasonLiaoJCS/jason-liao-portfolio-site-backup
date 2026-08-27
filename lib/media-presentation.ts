/**
 * Canonical media choices for cards and detail-page heroes.
 *
 * The relationship is keyed only by the English canonical route and stable
 * media ID. Localized alt text, captions, and titles remain attached to the
 * selected asset in `page-runtime`, so English and Traditional Chinese always
 * show the same evidence without duplicating media records.
 */

export type MediaPresentationRole = "card" | "hero";

export type MediaPresentationPreference = {
  cardAssetId?: string;
  heroAssetId?: string;
};

export type PresentableAsset = {
  id: string;
  kind: "image" | "document";
  previewPath?: string;
};

export type RepresentativeAssetSelection<T extends PresentableAsset> = {
  card?: T;
  hero?: T;
};

/**
 * Deliberate choices are limited to routes where asset order is not already a
 * good presentation order. Every ID points to a real public derivative in the
 * media manifest; no decorative or generated stand-in is introduced here.
 */
export const mediaPresentationByRoute: Readonly<
  Record<string, Readonly<MediaPresentationPreference>>
> = {
  "/research/redrhex": {
    cardAssetId: "img-6d30d97b358a",
    heroAssetId: "img-08ec1ed739d8",
  },
  "/research/geometry-covering": {
    cardAssetId: "img-589401095db6",
    heroAssetId: "img-589401095db6",
  },
  "/experience/jinhua-primary-school": {
    cardAssetId: "img-c0c29e33d26d",
    heroAssetId: "img-c0c29e33d26d",
  },
  "/experience/zhongzheng-junior-high": {
    cardAssetId: "img-4eb15c4b30c0",
    heroAssetId: "img-4eb15c4b30c0",
  },
  "/experience/chien-kuo-gifted-class": {
    cardAssetId: "img-385f44329998",
    heroAssetId: "img-385f44329998",
  },
  "/experience/qingshui-science-outreach": {
    cardAssetId: "img-9af476327e7f",
    heroAssetId: "img-9af476327e7f",
  },
  "/experience/zhongshan-primary-science-camp": {
    cardAssetId: "img-3f260d7c91dd",
    heroAssetId: "img-3f260d7c91dd",
  },
  "/experience/renai-junior-high-science-camp": {
    cardAssetId: "img-22b962308279",
    heroAssetId: "img-22b962308279",
  },
  "/projects/aero-carrier": {
    cardAssetId: "img-20d6cdcccd8b",
    heroAssetId: "img-20d6cdcccd8b",
  },
  "/projects/jarvis": {
    cardAssetId: "img-0ea165d34013",
    heroAssetId: "img-0ea165d34013",
  },
  "/projects/lkas": {
    cardAssetId: "img-4a088faa20e1",
    heroAssetId: "img-4a088faa20e1",
  },
  "/projects/inventor-system-integration": {
    cardAssetId: "img-405359e1aeb7",
    heroAssetId: "img-405359e1aeb7",
  },
  "/projects/polar-arm": {
    cardAssetId: "img-2cbb2579e773",
    heroAssetId: "img-2cbb2579e773",
  },
  "/academics/numerical-analysis": {
    cardAssetId: "doc-numerical-analysis-final",
    heroAssetId: "doc-numerical-analysis-final",
  },
  "/academics/intermediate-dynamics": {
    cardAssetId: "doc-intermediate-dynamics-final",
    heroAssetId: "doc-intermediate-dynamics-final",
  },
  "/academics/engineering-mathematics": {
    cardAssetId: "img-4820678e0289",
    heroAssetId: "img-4820678e0289",
  },
  "/academics/mechanical-laboratory-ii": {
    cardAssetId: "doc-mechanical-lab-ii",
    heroAssetId: "doc-mechanical-lab-ii",
  },
  "/academics/linear-algebra-fft": {
    cardAssetId: "doc-linear-algebra-fft",
    heroAssetId: "doc-linear-algebra-fft",
  },
  "/experience/trml-captain-2020-2021": {
    cardAssetId: "doc-trml-2020-national",
    heroAssetId: "img-58f91f0d2c0f",
  },
  "/experience/chien-kuo-science-club-teaching": {
    cardAssetId: "img-2fff62bb7833",
    heroAssetId: "img-2fff62bb7833",
  },
  "/experience/ntu-bicycle-service-week": {
    cardAssetId: "img-6476854639a4",
    heroAssetId: "img-6476854639a4",
  },
  "/experience/ntu-civil-engineering-camp": {
    cardAssetId: "img-8ace4bb22f20",
    heroAssetId: "img-8ace4bb22f20",
  },
};

export function mediaPresentationForRoute(
  route: string,
): Readonly<MediaPresentationPreference> | undefined {
  return mediaPresentationByRoute[route];
}

/**
 * Resolve one role from localized assets for a canonical route. A configured
 * choice wins when it is still present and renderable. Otherwise, prefer a
 * real image, then a document that has a genuine first-page preview. This
 * fallback deliberately returns `undefined` instead of inventing artwork.
 */
export function selectRepresentativeAsset<T extends PresentableAsset>(
  route: string,
  role: MediaPresentationRole,
  assets: readonly T[],
): T | undefined {
  const preference = mediaPresentationForRoute(route);
  const configuredId = role === "card"
    ? preference?.cardAssetId ?? preference?.heroAssetId
    : preference?.heroAssetId ?? preference?.cardAssetId;
  const configured = configuredId
    ? assets.find((asset) => asset.id === configuredId && isVisuallyPresentable(asset))
    : undefined;

  if (configured) return configured;

  return assets.find((asset) => asset.kind === "image")
    ?? assets.find((asset) => asset.kind === "document" && Boolean(asset.previewPath));
}

export function representativeAssetsForRoute<T extends PresentableAsset>(
  route: string,
  assets: readonly T[],
): RepresentativeAssetSelection<T> {
  const card = selectRepresentativeAsset(route, "card", assets);
  const hero = selectRepresentativeAsset(route, "hero", assets);

  return {
    ...(card ? { card } : {}),
    ...(hero ? { hero } : {}),
  };
}

function isVisuallyPresentable(asset: PresentableAsset): boolean {
  return asset.kind === "image"
    || (asset.kind === "document" && Boolean(asset.previewPath));
}

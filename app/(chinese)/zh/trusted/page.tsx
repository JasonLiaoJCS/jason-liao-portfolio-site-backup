import type { Metadata } from "next";
import { SiteFrame } from "@/components/SiteFrame";
import { TrustedPage } from "@/components/TrustedPage";
import { getPageByPath } from "@/lib/content-data";
import { pageMetadata } from "@/lib/metadata";
import { searchEntries } from "@/lib/page-runtime";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const trustedPage = getPageByPath("/zh/trusted", "zh");
export const metadata: Metadata = trustedPage
  ? pageMetadata(trustedPage, "zh")
  : { title: "受邀資料", robots: { index: false, follow: false } };

export default function ChineseTrustedPage() {
  return (
    <SiteFrame locale="zh" path="/zh/trusted" searchEntries={searchEntries("zh")}>
      <TrustedPage locale="zh" />
    </SiteFrame>
  );
}

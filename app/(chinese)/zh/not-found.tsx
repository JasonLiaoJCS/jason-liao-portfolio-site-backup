import { NotFoundView } from "@/components/NotFoundView";
import { SiteFrame } from "@/components/SiteFrame";
import { searchEntries } from "@/lib/page-runtime";

export default function ChineseNotFound() {
  return <SiteFrame locale="zh" path="/zh" searchEntries={searchEntries("zh")}><NotFoundView locale="zh" /></SiteFrame>;
}

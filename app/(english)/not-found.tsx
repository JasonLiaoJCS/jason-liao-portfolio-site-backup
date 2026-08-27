import { NotFoundView } from "@/components/NotFoundView";
import { SiteFrame } from "@/components/SiteFrame";
import { searchEntries } from "@/lib/page-runtime";

export default function EnglishNotFound() {
  return <SiteFrame locale="en" path="/" searchEntries={searchEntries("en")}><NotFoundView locale="en" /></SiteFrame>;
}

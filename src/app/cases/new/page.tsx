import { redirect } from "next/navigation";

export default function CasesNewRedirectPage() {
  redirect("/case-details/new");
}

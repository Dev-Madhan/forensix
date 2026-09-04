import { redirect } from "next/navigation";

export default function CriminalsRedirectPage() {
  redirect("/dashboard/criminals");
}

import { redirect } from "next/navigation";

// Reviews page was removed — redirect to home
export default function ReviewsPage() {
  redirect("/");
}

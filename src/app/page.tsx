import { redirect } from "next/navigation";

export default function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const code =
    typeof searchParams?.code === "string"
      ? searchParams.code
      : Array.isArray(searchParams?.code)
        ? searchParams.code[0]
        : undefined;

  const type =
    typeof searchParams?.type === "string"
      ? searchParams.type
      : Array.isArray(searchParams?.type)
        ? searchParams.type[0]
        : undefined;

  if (code || type === "recovery") {
    const query = new URLSearchParams();
    if (code) query.set("code", code);
    if (type) query.set("type", type);
    redirect(`/reset-password?${query.toString()}`);
  }

  redirect("/dashboard");
}

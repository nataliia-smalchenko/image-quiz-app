import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  redirect("/dashboard/tests");

  //   return (
  //     <div className="p-8">
  //       <h1 className="text-2xl font-bold">Вітаємо, {session.user?.name}!</h1>
  //       <p className="text-gray-500">Тут будуть ваші тести</p>
  //     </div>
  //   );
}

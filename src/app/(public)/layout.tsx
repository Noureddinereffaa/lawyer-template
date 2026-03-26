import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getSettings } from "@/lib/settings";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const config = await getSettings();
  
  return (
    <>
      <Header config={config} />
      <main>{children}</main>
      <Footer config={config} />
    </>
  );
}

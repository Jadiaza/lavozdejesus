import { useIsMobile } from "@/hooks/use-mobile";
import { MobileHome } from "@/components/lvdj/MobileHome";
import { DesktopHome } from "@/components/lvdj/DesktopHome";

const Index = () => {
  const isMobile = useIsMobile();
  return isMobile ? <MobileHome /> : <DesktopHome />;
};

export default Index;

declare module "lucide-react-native/dist/cjs/icons/*" {
  import type { ComponentType } from "react";

  type LucideIconProps = {
    color?: string;
    fill?: string;
    size?: number | string;
    strokeWidth?: number | string;
  };

  const Icon: ComponentType<LucideIconProps>;
  export default Icon;
}

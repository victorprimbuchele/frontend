import darkLogo from "@/assets/logos/connex-no-bg-dark.png";
import logo from "@/assets/logos/connexa-no-bg.png";
import Image from "next/image";

export function Logo() {
  return (
    <div className="mx-auto relative h-16 max-w-[9rem]">
      <Image
        src={logo}
        fill
        className="dark:hidden"
        alt="NextAdmin logo"
        role="presentation"
        quality={100}
      />

      <Image
        src={darkLogo}
        fill
        className="hidden dark:block"
        alt="NextAdmin logo"
        role="presentation"
        quality={100}
      />
    </div>
  );
}

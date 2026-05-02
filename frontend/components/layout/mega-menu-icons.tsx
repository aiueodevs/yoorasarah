import type { ComponentType, SVGProps } from "react";
import type { MegaMenuIconName } from "../../lib/storefront";

type IconProps = SVGProps<SVGSVGElement>;

const iconClass = "h-[18px] w-[18px]";

export function MegaMenuIcon({ name }: { name: MegaMenuIconName }) {
  const Icon = icons[name];

  return <Icon className={iconClass} aria-hidden="true" />;
}

const baseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round"
} satisfies IconProps;

function DressIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m12 4.2 2.1 4.2 4.6.7-3.35 3.25.8 4.55L12 14.75 7.85 16.9l.8-4.55L5.3 9.1l4.6-.7L12 4.2Z" />
    </svg>
  );
}

function AbayaIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4.5 8.5h8" />
      <path d="M4.5 12h12" />
      <path d="M4.5 15.5h8" />
      <path d="m16.3 7.5 2.2-2.2" />
      <path d="m18.5 8.8 1.4-.45" />
      <path d="m17.4 5.5.45-1.4" />
    </svg>
  );
}

function LayersIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m12 4.5 7.5 3.7L12 12 4.5 8.2 12 4.5Z" />
      <path d="m5.5 12 6.5 3.2 6.5-3.2" />
      <path d="m5.5 15.4 6.5 3.2 6.5-3.2" />
    </svg>
  );
}

function SunIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 4.2v1.6" />
      <path d="M12 18.2v1.6" />
      <path d="m6.45 6.45 1.1 1.1" />
      <path d="m16.45 16.45 1.1 1.1" />
      <path d="M4.2 12h1.6" />
      <path d="M18.2 12h1.6" />
      <path d="m6.45 17.55 1.1-1.1" />
      <path d="m16.45 7.55 1.1-1.1" />
    </svg>
  );
}

function ShieldIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 4.4 18 7v4.8c0 3.25-2.15 5.75-6 7.8-3.85-2.05-6-4.55-6-7.8V7l6-2.6Z" />
    </svg>
  );
}

function SparklesIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m12 4 1.45 3.55L17 9l-3.55 1.45L12 14l-1.45-3.55L7 9l3.55-1.45L12 4Z" />
      <path d="m18 14 .8 1.9 1.9.8-1.9.8L18 19.4l-.8-1.9-1.9-.8 1.9-.8L18 14Z" />
      <path d="m5.5 13 .65 1.45 1.45.65-1.45.65L5.5 17.2l-.65-1.45-1.45-.65 1.45-.65L5.5 13Z" />
    </svg>
  );
}

function CupIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M7 8h8v6.2a3.8 3.8 0 0 1-3.8 3.8h-.4A3.8 3.8 0 0 1 7 14.2V8Z" />
      <path d="M15 10h1.5a2 2 0 0 1 0 4H15" />
      <path d="M9 4.5v1.3" />
      <path d="M12 4.5v1.3" />
      <path d="M15 4.5v1.3" />
    </svg>
  );
}

function PartyIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m5.2 18.8 3.2-9.7 6.5 6.5-9.7 3.2Z" />
      <path d="m9.8 10.4 3.8 3.8" />
      <path d="M14.4 5.2 15 3.8" />
      <path d="m17.4 8.2 1.5-.6" />
      <path d="m16.4 4.7 1.3-1.3" />
      <path d="m19.3 11.1 1.4.6" />
    </svg>
  );
}

function UsersIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="9.2" cy="9" r="2.5" />
      <path d="M4.6 18.5c.55-2.5 2.1-4 4.6-4s4.05 1.5 4.6 4" />
      <path d="M15.4 7.2a2.2 2.2 0 0 1 0 4.25" />
      <path d="M15.7 14.4c1.9.35 3.1 1.75 3.7 4.1" />
    </svg>
  );
}

function FootwearIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M8.5 5.2C7.2 7.25 6.4 9.8 6.4 12.4c0 3.65 1.2 6.3 2.75 6.3.85 0 1.35-.65 1.35-1.45 0-.75-.48-1.35-.78-2.05-.42-.95-.62-1.95-.62-3.05 0-1.9.55-4.2 1.35-6.2" />
      <path d="M15.5 5.2c1.3 2.05 2.1 4.6 2.1 7.2 0 3.65-1.2 6.3-2.75 6.3-.85 0-1.35-.65-1.35-1.45 0-.75.48-1.35.78-2.05.42-.95.62-1.95.62-3.05 0-1.9-.55-4.2-1.35-6.2" />
      <path d="M7.6 10.2h2.3" />
      <path d="M14.1 10.2h2.3" />
    </svg>
  );
}

function DiamondIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M7.2 5h9.6l3.2 4-8 10-8-10 3.2-4Z" />
      <path d="M4 9h16" />
      <path d="m9 9 3 10 3-10" />
      <path d="m8.7 5 3.3 4 3.3-4" />
    </svg>
  );
}

function PackageIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m12 4.5 7 3.6v7.8l-7 3.6-7-3.6V8.1l7-3.6Z" />
      <path d="M5.4 8.4 12 12l6.6-3.6" />
      <path d="M12 12v7.2" />
      <path d="m8.6 6.2 6.8 3.7" />
    </svg>
  );
}

function BriefcaseIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M8.5 7.2V5.8c0-.8.6-1.4 1.4-1.4h4.2c.8 0 1.4.6 1.4 1.4v1.4" />
      <path d="M5 7.2h14v10.4c0 .95-.65 1.6-1.6 1.6H6.6c-.95 0-1.6-.65-1.6-1.6V7.2Z" />
      <path d="M5 11.8h14" />
      <path d="M12 10.8v2" />
    </svg>
  );
}

function HomeIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m4.8 11.2 7.2-6 7.2 6" />
      <path d="M6.5 10.1v8.1h11v-8.1" />
      <path d="M10.2 18.2v-4.4h3.6v4.4" />
    </svg>
  );
}

function TrendingIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m4.5 15 5.2-5.2 3.7 3.7L19.5 7.4" />
      <path d="M15 7.4h4.5v4.5" />
    </svg>
  );
}

function ZapIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m13 3.8-7 9.1h5.35L11 20.2l7-9.1h-5.35L13 3.8Z" />
    </svg>
  );
}

function PaletteIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 4.3a7.7 7.7 0 0 0 0 15.4h1.15c.95 0 1.55-.55 1.55-1.25 0-.5-.28-.9-.65-1.2-.45-.35-.55-.78-.35-1.2.25-.55.82-.75 1.45-.75h1.25c1.95 0 3.3-1.4 3.3-3.35A7.7 7.7 0 0 0 12 4.3Z" />
      <circle cx="8.6" cy="11" r=".6" fill="currentColor" stroke="none" />
      <circle cx="10.8" cy="8.2" r=".6" fill="currentColor" stroke="none" />
      <circle cx="14.3" cy="8.8" r=".6" fill="currentColor" stroke="none" />
    </svg>
  );
}

const icons: Record<MegaMenuIconName, ComponentType<IconProps>> = {
  dress: DressIcon,
  abaya: AbayaIcon,
  oneSet: LayersIcon,
  hijab: SunIcon,
  khimar: ShieldIcon,
  pashmina: SparklesIcon,
  daily: CupIcon,
  event: PartyIcon,
  family: UsersIcon,
  footwear: FootwearIcon,
  accessories: DiamondIcon,
  essentials: PackageIcon,
  celebration: PartyIcon,
  formal: BriefcaseIcon,
  familyEdit: HomeIcon,
  bestSeller: TrendingIcon,
  newArrival: ZapIcon,
  styling: PaletteIcon
};

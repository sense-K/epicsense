export type Element = "fire" | "ice" | "earth" | "light" | "dark";
export type HeroClass = "warrior" | "knight" | "mage" | "thief" | "ranger" | "soul";

export interface Hero {
  code: string;
  name: string;
  element: Element;
  heroClass: HeroClass;
  stars: 3 | 4 | 5;
  pickRate?: number;
  banRate?: number;
}

export const ELEMENT_LABEL: Record<Element, string> = {
  fire: "화염",
  ice: "냉기",
  earth: "자연",
  light: "광",
  dark: "암",
};

export const ELEMENT_ICON: Record<Element, string> = {
  fire: "🔥",
  ice: "❄️",
  earth: "🌿",
  light: "✨",
  dark: "🌑",
};

export const CLASS_LABEL: Record<HeroClass, string> = {
  warrior: "전사",
  knight: "기사",
  mage: "마도사",
  thief: "도적",
  ranger: "사수",
  soul: "정령사",
};

export const CLASS_ICON: Record<HeroClass, string> = {
  warrior: "⚔️",
  knight: "🛡️",
  mage: "🔮",
  thief: "🗡️",
  ranger: "🏹",
  soul: "💫",
};


export const ELEMENT_IMG: Record<Element, string> = {
  fire:  "/icons/element/fire.png",
  ice:   "/icons/element/ice.png",
  earth: "/icons/element/wind.png",
  light: "/icons/element/light.png",
  dark:  "/icons/element/dark.png",
};

export const CLASS_IMG: Record<HeroClass, string> = {
  warrior: "/icons/class/warrior.webp",
  knight:  "/icons/class/knight.webp",
  thief:   "/icons/class/thief.webp",
  ranger:  "/icons/class/ranger.webp",
  mage:    "/icons/class/mage.png",
  soul:    "/icons/class/soul.webp",
};

export const ELEMENT_COLOR: Record<Element, string> = {
  fire: "#ef4444",
  ice: "#3b82f6",
  earth: "#22c55e",
  light: "#eab308",
  dark: "#a855f7",
};

export const ELEMENT_BG: Record<Element, string> = {
  fire: "rgba(239,68,68,0.15)",
  ice: "rgba(59,130,246,0.15)",
  earth: "rgba(34,197,94,0.15)",
  light: "rgba(234,179,8,0.15)",
  dark: "rgba(168,85,247,0.15)",
};

export const MOCK_HEROES: Hero[] = [
  { code: "c1081", name: "비브리스", element: "dark", heroClass: "ranger", stars: 5, pickRate: 41.2 },
  { code: "c1082", name: "설화", element: "ice", heroClass: "mage", stars: 5, pickRate: 38.7 },
  { code: "c1083", name: "아룬카", element: "fire", heroClass: "warrior", stars: 5, pickRate: 35.1 },
  { code: "c1084", name: "라그나르", element: "earth", heroClass: "knight", stars: 5, pickRate: 32.4 },
  { code: "c1085", name: "페르시발", element: "light", heroClass: "warrior", stars: 5, pickRate: 30.8 },
  { code: "c1086", name: "세레아", element: "dark", heroClass: "mage", stars: 5, pickRate: 28.3 },
  { code: "c1087", name: "임페리우스", element: "fire", heroClass: "warrior", stars: 5, pickRate: 27.9 },
  { code: "c1088", name: "드리젤", element: "ice", heroClass: "knight", stars: 5, pickRate: 26.5 },
  { code: "c1089", name: "린", element: "earth", heroClass: "soul", stars: 5, pickRate: 25.1 },
  { code: "c1090", name: "아리에스타", element: "light", heroClass: "mage", stars: 5, pickRate: 24.7 },
  { code: "c1091", name: "카이로스", element: "dark", heroClass: "thief", stars: 5, pickRate: 23.2 },
  { code: "c1092", name: "루나", element: "ice", heroClass: "ranger", stars: 5, pickRate: 22.8 },
  { code: "c1093", name: "타마린느", element: "fire", heroClass: "soul", stars: 5, pickRate: 21.4 },
  { code: "c1094", name: "레이니아", element: "earth", heroClass: "mage", stars: 5, pickRate: 20.9 },
  { code: "c1095", name: "무브리스", element: "light", heroClass: "warrior", stars: 5, pickRate: 19.6 },
  { code: "c1096", name: "샬롯", element: "dark", heroClass: "knight", stars: 5, pickRate: 18.3 },
  { code: "c1097", name: "벨로나", element: "ice", heroClass: "ranger", stars: 5, pickRate: 17.9 },
  { code: "c1098", name: "지젤", element: "fire", heroClass: "mage", stars: 5, pickRate: 17.2 },
  { code: "c1099", name: "스트라이커 로빈", element: "earth", heroClass: "warrior", stars: 5, pickRate: 16.8 },
  { code: "c1100", name: "리스베스", element: "light", heroClass: "soul", stars: 5, pickRate: 15.4 },
  { code: "c1101", name: "라필", element: "dark", heroClass: "ranger", stars: 5, pickRate: 14.9 },
  { code: "c1102", name: "벨린다", element: "ice", heroClass: "mage", stars: 5, pickRate: 14.3 },
  { code: "c1103", name: "아이가스", element: "fire", heroClass: "knight", stars: 5, pickRate: 13.8 },
  { code: "c1104", name: "아델린", element: "earth", heroClass: "warrior", stars: 5, pickRate: 13.2 },
  { code: "c1105", name: "로나", element: "light", heroClass: "ranger", stars: 5, pickRate: 12.7 },
  { code: "c1106", name: "클라비스", element: "dark", heroClass: "warrior", stars: 5, pickRate: 12.1 },
  { code: "c1107", name: "미레스트", element: "ice", heroClass: "thief", stars: 5, pickRate: 11.8 },
  { code: "c1108", name: "제이드", element: "earth", heroClass: "ranger", stars: 5, pickRate: 11.3 },
  { code: "c1109", name: "페이튼", element: "light", heroClass: "knight", stars: 5, pickRate: 10.9 },
  { code: "c1110", name: "아크멘", element: "fire", heroClass: "mage", stars: 4, pickRate: 10.2 },
  { code: "c1111", name: "도로시", element: "dark", heroClass: "mage", stars: 5, pickRate: 9.8 },
  { code: "c1112", name: "로비나", element: "ice", heroClass: "soul", stars: 5, pickRate: 9.4 },
  { code: "c1113", name: "에픽세나", element: "earth", heroClass: "thief", stars: 5, pickRate: 9.1 },
  { code: "c1114", name: "크리스", element: "light", heroClass: "warrior", stars: 5, pickRate: 8.7 },
  { code: "c1115", name: "바네사", element: "fire", heroClass: "knight", stars: 5, pickRate: 8.3 },
  { code: "c1116", name: "케이나", element: "dark", heroClass: "soul", stars: 5, pickRate: 7.9 },
  { code: "c1117", name: "프로스트", element: "ice", heroClass: "warrior", stars: 5, pickRate: 7.6 },
  { code: "c1118", name: "레나", element: "earth", heroClass: "mage", stars: 4, pickRate: 7.2 },
  { code: "c1119", name: "시에리", element: "light", heroClass: "thief", stars: 5, pickRate: 6.8 },
  { code: "c1120", name: "뮌헨", element: "fire", heroClass: "ranger", stars: 5, pickRate: 6.4 },
];

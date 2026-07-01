/**
 * The curated collection of 50 artifacts a visitor can leave behind.
 * Every icon is a monochrome line glyph — Lucide where it exists, and a small
 * set of custom line icons (drawn to match Lucide) for the rest.
 */
import {
  Compass,
  Telescope,
  Globe,
  Hourglass,
  Watch,
  Key,
  Feather,
  PenTool,
  Stamp,
  Coins,
  Lamp,
  Anchor,
  Scroll,
  Map,
  Radar,
  Gem,
  Notebook,
  BookOpen,
  Bookmark,
  Pen,
  Pencil,
  PencilLine,
  Search,
  Ruler,
  Paperclip,
  StickyNote,
  Folder,
  FileText,
  PencilRuler,
  Grid3x3,
  BarChart3,
  Calculator,
  LampDesk,
  Star,
  Sparkle,
  Sparkles,
  Moon,
  Earth,
  Orbit,
} from "lucide-react";
import {
  ChessKnight,
  ChessPawn,
  Spyglass,
  Sundial,
  BinderClip,
  Abacus,
  InkBottle,
  FullMoon,
  Saturn,
  Comet,
  Constellation,
} from "@/components/imprints/custom-icons";

export type ArtifactIcon = React.ComponentType<{ className?: string }>;

export type Artifact = {
  /** 1-based id, matches the position in the curated list. */
  id: number;
  name: string;
  Icon: ArtifactIcon;
};

export const ARTIFACTS: Artifact[] = [
  { id: 1, name: "Compass", Icon: Compass },
  { id: 2, name: "Telescope", Icon: Telescope },
  { id: 3, name: "Globe", Icon: Globe },
  { id: 4, name: "Hourglass", Icon: Hourglass },
  { id: 5, name: "Pocket Watch", Icon: Watch },
  { id: 6, name: "Key", Icon: Key },
  { id: 7, name: "Feather", Icon: Feather },
  { id: 8, name: "Quill", Icon: PenTool },
  { id: 9, name: "Wax Seal", Icon: Stamp },
  { id: 10, name: "Coin", Icon: Coins },
  { id: 11, name: "Lantern", Icon: Lamp },
  { id: 12, name: "Anchor", Icon: Anchor },
  { id: 13, name: "Chess Knight", Icon: ChessKnight },
  { id: 14, name: "Chess Pawn", Icon: ChessPawn },
  { id: 15, name: "Scroll", Icon: Scroll },
  { id: 16, name: "Map", Icon: Map },
  { id: 17, name: "Astrolabe", Icon: Radar },
  { id: 18, name: "Spyglass", Icon: Spyglass },
  { id: 19, name: "Sundial", Icon: Sundial },
  { id: 20, name: "Crystal Prism", Icon: Gem },
  { id: 21, name: "Notebook", Icon: Notebook },
  { id: 22, name: "Open Book", Icon: BookOpen },
  { id: 23, name: "Bookmark", Icon: Bookmark },
  { id: 24, name: "Fountain Pen", Icon: Pen },
  { id: 25, name: "Pencil", Icon: Pencil },
  { id: 26, name: "Mechanical Pencil", Icon: PencilLine },
  { id: 27, name: "Magnifying Glass", Icon: Search },
  { id: 28, name: "Ruler", Icon: Ruler },
  { id: 29, name: "Paperclip", Icon: Paperclip },
  { id: 30, name: "Binder Clip", Icon: BinderClip },
  { id: 31, name: "Sticky Note", Icon: StickyNote },
  { id: 32, name: "Folder", Icon: Folder },
  { id: 33, name: "Document", Icon: FileText },
  { id: 34, name: "Blueprint", Icon: PencilRuler },
  { id: 35, name: "Grid", Icon: Grid3x3 },
  { id: 36, name: "Chart", Icon: BarChart3 },
  { id: 37, name: "Abacus", Icon: Abacus },
  { id: 38, name: "Calculator", Icon: Calculator },
  { id: 39, name: "Ink Bottle", Icon: InkBottle },
  { id: 40, name: "Desk Lamp", Icon: LampDesk },
  { id: 41, name: "Star", Icon: Star },
  { id: 42, name: "Four-Point Star", Icon: Sparkle },
  { id: 43, name: "Sparkle", Icon: Sparkles },
  { id: 44, name: "Crescent Moon", Icon: Moon },
  { id: 45, name: "Full Moon", Icon: FullMoon },
  { id: 46, name: "Planet", Icon: Earth },
  { id: 47, name: "Saturn", Icon: Saturn },
  { id: 48, name: "Comet", Icon: Comet },
  { id: 49, name: "Orbit", Icon: Orbit },
  { id: 50, name: "Constellation", Icon: Constellation },
];

export const ARTIFACT_COUNT = ARTIFACTS.length;

export function getArtifact(id: number): Artifact | undefined {
  return ARTIFACTS.find((a) => a.id === id);
}

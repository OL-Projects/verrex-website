// Barrel re-export — all window types from split files
// This maintains backward compatibility with WindowModel.tsx imports

export { SlidingWindow, AwningWindow, HopperWindow, SkylightWindow, JalousieWindow } from "./OperableWindows"
export { TiltTurnWindow } from "./TiltTurnWindow"
export { BayBowWindow, PictureWindow, GardenWindow, TransomWindow, GlassBlockWindow } from "./StaticWindows"
export { CurtainWallWindow, StorefrontWindow, GenericWindow } from "./CommercialWindows"

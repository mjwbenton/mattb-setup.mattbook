#!/usr/bin/env zx
import { homedir } from "os";

const ROM_LIBRARY = `${homedir()}/games/roms/`;
const BIOS_LIBRARY = `${homedir()}/games/bios/`;

const NEXT_UI_SD_CARD = "/Volumes/BRICK";
const NEXT_UI_SYSTEMS = [
  {
    system: "gb",
    biosPath: `${NEXT_UI_SD_CARD}/Bios/GB`,
    romsPath: `${NEXT_UI_SD_CARD}/Roms/Game Boy (GB)`,
    extension: "gb",
  },
  {
    system: "gbc",
    biosPath: `${NEXT_UI_SD_CARD}/Bios/GBC`,
    romsPath: `${NEXT_UI_SD_CARD}/Roms/Game Boy Color (GBC)`,
    extension: "gbc",
  },
  {
    system: "gba",
    biosPath: `${NEXT_UI_SD_CARD}/Bios/GBA`,
    romsPath: `${NEXT_UI_SD_CARD}/Roms/Game Boy Advance (GBA)`,
    extension: "gba",
  },
  {
    system: "snes",
    biosPath: `${NEXT_UI_SD_CARD}/Bios/SUPA`,
    romsPath: `${NEXT_UI_SD_CARD}/Roms/Super Nintendo Entertainment System (SUPA)`,
    extension: "sfc",
  },
  {
    system: "megadrive",
    biosPath: `${NEXT_UI_SD_CARD}/Bios/MD`,
    romsPath: `${NEXT_UI_SD_CARD}/Roms/Sega Mega Drive (MD)`,
    extension: "md",
  },
  {
    system: "playstation",
    biosPath: `${NEXT_UI_SD_CARD}/Bios/PS`,
    romsPath: `${NEXT_UI_SD_CARD}/Roms/Sony PlayStation (PS)`,
    extension: "chd",
  },
  {
    system: "tg16",
    romsPath: `${NEXT_UI_SD_CARD}/Roms/TurboGrafx-16 (PCE)`,
    extension: "pce",
  },
];

const N3DS_SD_CARD = "/Volumes/NO NAME";
const N3DS_SYSTEMS = [
  {
    system: "gb",
    romsPath: `${N3DS_SD_CARD}/roms/gb`,
    biosPath: `${N3DS_SD_CARD}/bios/gb`,
    extension: "gb",
  },
  {
    system: "gbc",
    romsPath: `${N3DS_SD_CARD}/roms/gbc`,
    biosPath: `${N3DS_SD_CARD}/bios/gbc`,
    extension: "gbc",
  },
  {
    system: "gba",
    romsPath: `${N3DS_SD_CARD}/roms/gba`,
    biosPath: `${N3DS_SD_CARD}/bios/gba`,
    extension: "gba",
  },
  {
    system: "megadrive",
    romsPath: `${N3DS_SD_CARD}/roms/md`,
    biosPath: `${N3DS_SD_CARD}/bios/md`,
    extension: "md",
  },
  {
    system: "snes",
    romsPath: `${N3DS_SD_CARD}/roms/snes`,
    biosPath: `${N3DS_SD_CARD}/bios/snes`,
    extension: "sfc",
  },
];

const RPMINI_SD_CARD = "/Volumes/RPMINI";
const RPFLIP_SD_CARD = "/Volumes/RPFLIP";

const RP_SYSTEMS = (sdPath) => [
  {
    system: "gb",
    biosPath: `${sdPath}/bios`,
    romsPath: `${sdPath}/roms/gb`,
    extension: "gb",
  },
  {
    system: "gbc",
    biosPath: `${sdPath}/bios`,
    romsPath: `${sdPath}/roms/gbc`,
    extension: "gbc",
  },
  {
    system: "gba",
    biosPath: `${sdPath}/bios`,
    romsPath: `${sdPath}/roms/gba`,
    extension: "gba",
  },
  {
    system: "snes",
    romsPath: `${sdPath}/roms/snes`,
    extension: "sfc",
  },
  {
    system: "megadrive",
    biosPath: `${sdPath}/bios`,
    romsPath: `${sdPath}/roms/md`,
    extension: "md",
  },
  {
    system: "playstation",
    biosPath: `${sdPath}/bios`,
    romsPath: `${sdPath}/roms/ps`,
    extension: "chd",
  },
  {
    system: "tg16",
    romsPath: `${sdPath}/roms/tg16`,
    extension: "pce",
  },
  {
    system: "saturn",
    biosPath: `${sdPath}/bios`,
    romsPath: `${sdPath}/roms/saturn`,
    extension: "chd",
  },
  {
    system: "n64",
    romsPath: `${sdPath}/roms/n64`,
    extension: "z64",
  },
];

const SYSTEMS_MAP = {
  NEXT_UI: NEXT_UI_SYSTEMS,
  N3DS: N3DS_SYSTEMS,
  RPMINI: RP_SYSTEMS(RPMINI_SD_CARD),
  RPFLIP: RP_SYSTEMS(RPFLIP_SD_CARD),
};

async function syncSystem(system) {
  console.log(`\n=== Syncing ${system.system} ===`);

  const systemRomLibrary = `${ROM_LIBRARY}/${system.system}`;
  const systemBiosLibrary = `${BIOS_LIBRARY}/${system.system}`;

  try {
    if (fs.existsSync(systemBiosLibrary)) {
      if (!fs.existsSync(system.biosPath)) {
        fs.mkdirSync(system.biosPath, { recursive: true });
      }
      console.log(`Syncing bios for ${system.system}...`);
      // Don't delete bios files so that multiple systems can be synced to the same bios folder
      await $`rsync -av --progress ${systemBiosLibrary}/ ${system.biosPath}/`;
    }

    if (!fs.existsSync(system.romsPath)) {
      fs.mkdirSync(system.romsPath, { recursive: true });
    }
    console.log(`Syncing roms for ${system.system}...`);
    await $({
      verbose: true,
    })`rsync -av --progress --delete --exclude=".media/" --include="*/" --include="*.${system.extension}" --include="*.${system.extension}" --include="*.m3u" --exclude="*" ${systemRomLibrary}/ ${system.romsPath}/`;
  } catch (error) {
    console.error(`Error syncing ${system.system}:`, error.message);
    throw error;
  }
}

const target = argv.target;

if (!target || !SYSTEMS_MAP[target]) {
  console.error("Error: Please specify a valid sync target");
  process.exit(1);
}

const systemsToSync = SYSTEMS_MAP[target];

for (const system of systemsToSync) {
  try {
    await syncSystem(system);
  } catch (error) {
    console.error(`Failed to sync ${system.system}, stopping sync process.`);
    process.exit(1);
  }
}

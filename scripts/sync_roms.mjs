#!/usr/bin/env zx
  import { homedir } from 'os';

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
      await $`rsync -av --progress --delete ${systemBiosLibrary}/ ${system.biosPath}/`;
    }

    if (!fs.existsSync(system.romsPath)) {
      fs.mkdirSync(system.romsPath, { recursive: true });
    }
    console.log(`Syncing roms for ${system.system}...`);
    await $({verbose: true})`rsync -av --progress --delete --exclude=".media/" --include="*/" --include="*.${system.extension}" --include="*.${system.extension}" --include="*.m3u" --exclude="*" ${systemRomLibrary}/ ${system.romsPath}/`;
  } catch (error) {
    console.error(`Error syncing ${system.system}:`, error.message);
    throw error;
  }
}

const target = argv.target;

if (!target || !['NEXT_UI', 'N3DS'].includes(target)) {
  console.error('Error: Please specify a valid sync target (NEXT_UI or N3DS)');
  process.exit(1);
}

const systemsToSync = target === 'NEXT_UI' ? NEXT_UI_SYSTEMS : N3DS_SYSTEMS;

for (const system of systemsToSync) {
  try {
    await syncSystem(system);
  } catch (error) {
    console.error(`Failed to sync ${system.system}, stopping sync process.`);
    process.exit(1);
  }
}

// src/main.ts

import crs from "./crs.json" assert { type: "json" };
import * as CSV from "csv";
import Proj4 from "proj4";

// ---

const PARAMS = {
  sourceDir: "/Users/abiddiscombe/Documents/OS Open Names/opname_csv_gb/Data",
  outFormat: "SimpleArray", // or 'SimpleArray'
  outLocation: "OpenNames.geojson",
};

// ---

const _seekFiles = async (DIR: string) => {
  const fileList: Array<string> = [];
  for await (const dirEntry of Deno.readDir(DIR)) {
    if (dirEntry.isFile) fileList.push(dirEntry.name);
  }
  return fileList;
};

const _parseJsonString = (properties: object, lat: number, lng: number) => {
  return JSON.stringify({
    type: "Feature",
    properties: { ...properties },
    geometry: {
      type: "Point",
      coordinates: [lng, lat],
    },
  });
};

const _appendLineToFile = (content: string, fileWriter) => {
  fileWriter.writeSync(
    new TextEncoder().encode(content),
  );
};

// ---

Proj4.defs("ESPG:27700", crs["EPSG:27700"]);

let totalFailed = 0;
let indexCursor = 0;

const sourceFiles = await _seekFiles(PARAMS.sourceDir);

const fileWriter = await Deno.open(PARAMS.outLocation, {
  create: true,
  append: true,
});

if (PARAMS.outFormat === "FeatureCollection") {
  _appendLineToFile('{"type":"FeatureCollection","features":[', fileWriter);
} else if (PARAMS.outFormat === "SimpleArray") {
  _appendLineToFile("[", fileWriter);
} else {
  throw new Error(
    "Invalid or unspecified output format. Please choose either FeatureCollection or SimpleArray",
  );
}

for (let i = 0; i < sourceFiles.length; i++) {
  const file = await Deno.open(`${PARAMS.sourceDir}/${sourceFiles[i]}`);
  for await (const row of CSV.readCSV(file)) {
    let x = 0;
    const featureStore = {
      properties: {
        uri: undefined,
        type: undefined,
        subtype: undefined,
        name1: undefined,
        name2: undefined,
        name1Lang: undefined,
        name2Lang: undefined,
      },
      lat: 0,
      lng: 0,
    };
    for await (const cell of row) {
      switch (x) {
        case 1:
          featureStore.properties.uri = cell;
          break;
        case 2:
          featureStore.properties.name1 = cell;
          break;
        case 3:
          featureStore.properties.name1Lang = cell;
          break;
        case 4:
          featureStore.properties.name2 = cell;
          break;
        case 5:
          featureStore.properties.name2Lang = cell;
          break;
        case 6:
          featureStore.properties.type = cell;
          break;
        case 7:
          featureStore.properties.subtype = cell;
          break;
        case 8:
          featureStore.lat = cell;
          break;
        case 9:
          featureStore.lng = cell;
          break;
      }
      x++;
    }

    try {
      indexCursor++;
      [featureStore.lat, featureStore.lng] = Proj4("ESPG:27700", "WGS84", [
        Number(featureStore.lat),
        Number(featureStore.lng),
      ]);
      if (indexCursor != 1) {
        _appendLineToFile(",", fileWriter);
      }
      _appendLineToFile("\n", fileWriter);
      _appendLineToFile(
        _parseJsonString(
          featureStore.properties,
          featureStore.lng,
          featureStore.lat,
        ),
        fileWriter,
      );
    } catch {
      totalFailed++;
    }
  }
}

if (PARAMS.outFormat === "FeatureCollection") {
  _appendLineToFile("\n", fileWriter);
  _appendLineToFile("]}", fileWriter);
} else {
  _appendLineToFile("\n", fileWriter);
  _appendLineToFile("]", fileWriter);
}

console.log(`${indexCursor} features processed successfully.`);
if (totalFailed) {
  console.warn(`A total of ${totalFailed} feature failed to copy.`);
}

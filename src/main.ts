// src/main.ts

import Proj4 from "npm:proj4";
import * as CSV from "https://deno.land/x/csv/mod.ts";

import { status } from "./utilities.ts";

import crs from "./crs.json" assert { type: "json" };
Proj4.defs("ESPG:27700", crs["EPSG:27700"]);

status.other("OS OpenNames CSV -> GeoJSON Conversion Utility");
status.other("https://github.com/abiddiscombe/opennames-to-geojson");

const SOURCE = '/Users/uname/Documents/OS Open Names/opname_csv_gb/Data'

let totalFailed = 0;
let indexCursor = 0;

status.info("Starting Conversion Process.");

status.info(`Seeking: ${SOURCE}.`);
const sources: Array<string> = [];
for await (const dirEntry of Deno.readDir(SOURCE)) {
  if (dirEntry.isFile) sources.push(dirEntry.name);
}
status.info(`Found a total of ${sources.length} source files.`);

const fileWriter = await Deno.open("OpenNames.geojson", {
  create: true,
  append: true,
});

status.info("Appending GeoJSON Headers.");
fileWriter.writeSync(
  new TextEncoder().encode('{ "type": "FeatureCollection", "features": [\n'),
);

for (let i = 0; i < sources.length; i++) {
  status.info(`Processing File ${i}/${sources.length + 1} ('${sources[i]}')`);
  const file = await Deno.open(`${SOURCE}/${sources[i]}`);
  for await (const row of CSV.readCSV(file)) {
    let x = 0;
    const fs = {
      properties: {
        id: undefined,
        uri: undefined,
        type: undefined,
        localType: undefined,
        name1: undefined,
        name2: undefined,
      },
      lat: 0,
      lng: 0,
    };

    for await (const cell of row) {
      switch (x) {
        case 0:
          fs.properties.id = cell;
          break;
        case 1:
          fs.properties.uri = cell;
          break;
        case 2:
          fs.properties.name1 = cell;
          break;
        case 4:
          fs.properties.name2 = cell;
          break;
        case 6:
          fs.properties.type = cell;
          break;
        case 7:
          fs.properties.localType = cell;
          break;
        case 8:
          fs.lat = cell;
          break;
        case 9:
          fs.lng = cell;
          break;
      }
      x++;
    }

    try {
      indexCursor++;
      [fs.lng, fs.lat] = Proj4("ESPG:27700", "WGS84", [
        Number(fs.lng),
        Number(fs.lat),
      ]);
      fileWriter.writeSync(
        new TextEncoder().encode(
          `{ "type": "Feature", "properties": { "id": "${fs.properties.id}", "uri": "${fs.properties.uri}", "name1": "${fs.properties.name1}", "name2": "${fs.properties.name2}", "type": "${fs.properties.type}", "local_type": "${fs.properties.localType}" }, "geometry": { "type": "Point", "coordinates": [ ${fs.lng}, ${fs.lat} ] } },\n`,
        ),
      );
    } catch {
      totalFailed++;
    }
  }
}

status.info("Appending GeoJSON Footers.");
fileWriter.writeSync(
  new TextEncoder().encode("]}"),
);

status.info(`${indexCursor} features processed successfully.`);
if (totalFailed) {
  status.warn(`WARNING: A total of ${totalFailed} feature(s) failed to copy.`);
}
status.other("GeoJSON saved to disk as OpenNames.geojson");
status.other(
  "NOTE: In some cases, you may need to manually remove the trailing comma from the end of the last Feature JSON object.",
);

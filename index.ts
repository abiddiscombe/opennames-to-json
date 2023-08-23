// @abiddiscombe
// Ordnance Survey OpenNames
// CSV to GeoJSON Conversion Script

import Proj4 from "npm:proj4";
import * as CSV from "https://deno.land/x/csv/mod.ts";

// determine source directory
const sourceDir = Deno.args[0];
if (!sourceDir) throw new Error("Invalid Source Directory");

// define crs
Proj4.defs(
  "ESPG:27700",
  "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs",
);

// read list of source files
const sourceFiles = await seekSourceFiles(sourceDir);

// create output file writer
const fileWriter = await Deno.open("output.geojson", {
  create: true,
  append: true,
});

appendToOutput(fileWriter, '{"type": "FeatureCollection", "features": [\n');
for (let sfIndex = 0; sfIndex < sourceFiles.length; sfIndex++) {
  let isFirstLine = true;
  const fileReader = await Deno.open(`${sourceDir}/${sourceFiles[sfIndex]}`);
  for await (const row of CSV.readCSV(fileReader)) {
    const template = instantiateFeatureTemplate(sourceFiles[sfIndex]);
    let i = 0;
    for await (const cell of row) {
      switch (i) {
        case 0:
          template.properties.fid = cell;
          break;
        case 2:
          template.properties.name = cell;
          break;
        case 6:
          template.properties.class = cell.toLowerCase();
          break;
        case 7:
          if (cell) {
            template.properties.class =
              `${template.properties.class}.${cell.toLowerCase()}`;
          }
          break;
        case 8:
          template.geometry.coordinates[0] = parseFloat(cell);
          break;
        case 9:
          template.geometry.coordinates[1] = parseFloat(cell);
          break;
      }
      i++;
    }
    if (!template.properties.name) break;
    template.properties.class = template.properties.class.replace(" ", "");
    template.geometry.coordinates = Proj4(
      "ESPG:27700",
      "WGS84",
      template.geometry.coordinates,
    );
    if (sfIndex === 0 && isFirstLine) {
      appendToOutput(fileWriter, `${JSON.stringify(template)}`);
    } else {
      appendToOutput(fileWriter, `,\n${JSON.stringify(template)}`);
    }
    isFirstLine = false;
  }
}
appendToOutput(fileWriter, "\n]}");

async function seekSourceFiles(dir: string) {
  const sourceFiles: Array<string> = [];
  for await (const item of Deno.readDir(dir)) {
    if (item.isFile) sourceFiles.push(item.name);
  }
  return sourceFiles;
}

function appendToOutput(fileWriter: Deno.FsFile, content: string) {
  const te = new TextEncoder();
  fileWriter.writeSync(te.encode(content));
}

function instantiateFeatureTemplate(origin: string) {
  return {
    type: "Feature",
    properties: {
      fid: "",
      name: "",
      class: "",
      source: "Ordnance Survey OpenNames",
      gridRef: origin.split(".")[0],
    },
    geometry: {
      type: "Point",
      coordinates: [0, 0],
    },
  };
}

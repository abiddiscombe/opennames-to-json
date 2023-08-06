# OpenNames-to-GeoJSON

Ordnance Survey (OS) OpenNames is a comprehensive dataset of place names, roads numbers and postcodes for Great Britain; you can read more about it [here](https://www.ordnancesurvey.co.uk/products/os-open-names). It's a free [OGL](http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/) dataset provided as either a CSV or GeoPackage in the `EPSG:27700` (British National Grid) CRS.

This repo hosts a homemade utility script for JS/Deno which converts the **CSV format** of this dataset into a single (and fairly large) GeoJSON FeatureCollection. It was originally written to assist the ETL process into MongoDB, but can be customised for other use cases. In summary, the script will:

- Stream in each CSV file.
- Create a new feature for each dataset entity.
- Copy a subset of the original metadata into each feature's properties.
- Convert the geometry of each feature to WGS84 using the [Proj4JS](http://proj4js.org/) library.
- Store the output as `output.geojson` in the working directory.

## Running the Script

This script utilises the [Deno runtime](https://www.deno.com). In the same directory as the script, run:

```bash
deno run index.ts "/path/to/opennames/Data"
```

Where the `/Data` directory is equivalent to the parent directory of the CSV files on your filesystem. This script will take a few seconds to run; don't open the `output.geojson` file until the script has completed.

## Output Feature Schema

The CRS conversion process utilises a
[Helmert datum transformation](https://en.wikipedia.org/wiki/Helmert_transformation)
which can lead to inaccuracies of up to 3.5m in some areas. Given the nature and
purpose of OS OpenNames I have determined this to be an acceptable range of error, but please keep this in mind depending on your use case!

The GeoJSON FeatureCollection will contain **point** features with the following attribution:

```jsonc
{
  "type": "Feature",
  "properties": {
    "fid": "osgb4000000073495356", // OS Identifier
    "name": "Durham University", // Name1
    "class": "other.higheroruniversityeducation", // Type & LocalType
    "origin": "NZ24" // OS Grid Ref (via filename)
  },
  "geometry": {
    "type": "Point",
    "coordinates": [-1.5611190052871562, 54.772369280517154]
  }
}
```

## License

This script is MIT licensed. Feel free to modify it to suit your needs.

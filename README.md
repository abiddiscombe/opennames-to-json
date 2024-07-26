# OS OpenNames to JSON

> 🚀 Refactored from [Deno](https://deno.com/) to [Go](https://go.dev) as part of my ongoing learning! \
> This version can process more of the dataset in less time (Apple M1: Deno - 98 sec, Go - 34 sec).

Ordnance Survey (OS) Open Names is a [comprehensive dataset of place names, roads numbers and postcodes for Great Britain](https://www.ordnancesurvey.co.uk/products/os-open-names). It's an [OGL](http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/) dataset provided in the British National Grid `EPSG:27700` CRS.

This code **converts the OS Open Names CSV dataset into a JSON array consisting of multiple GeoJSON Features**. It's designed for bulk importing into MongoDB using [MongoDB Compass](https://www.mongodb.com/products/tools/compass). The bulk importer expects a JSON array of features, not a GeoJSON object - and therefore this script won't create a valid GeoJSON file.

The following metadata is included by default: `id`, `type`, `localType`, `name1`, `name1Lang`, `name2`, `name2Lang`, `geomX`, `geomY`. Geometry is converted to `lat-lon` values, and the `name2` and `name2Lang` are often empty strings.

## Running

I'm not creating prebuilt binaries for this script at this time.

1. Install [Go](https://go.dev/dl/) on your machine. I do this via Homebrew on MacOS.

2. Copy the `/Data` directory from [OS Open Names](https://osdatahub.os.uk/downloads/open/OpenNames) into the root of this repository. This directory contains ~819 CSV files each representing a distinct region.

3. Run the script with `go run main.go`. The output is stored in a newly created `output.json` file.

If you choose to host this dataset with MongoDB you [must create a `2dsphere` index to handle geospatial queries](https://www.mongodb.com/docs/manual/core/indexes/index-types/geospatial/2d/). I also strongly advise creating indexes for any other columns you plan to query against.

## Credits

[MIT License](./LICENSE). Feel free to refactor to suit your needs.

This script relies on the awesome [wroge/wgs84](https://pkg.go.dev/github.com/wroge/wgs84/v2) and [paulmach/orb](https://pkg.go.dev/github.com/paulmach/orb) packages for coordinate transformation and GeoJSON parsing.
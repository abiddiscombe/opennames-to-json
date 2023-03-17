# OpenNames-to-GeoJSON

A utility script to convert Ordnance Survey's
[OpenNames](https://osdatahub.os.uk/downloads/open/OpenNames) dataset (in `.csv`
format) into a GeoJSON FeatureCollection.

OS OpenNames is a free dataset licensed under the
[Open Government License](http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/)
containing point-based geometry and attribution for notable locations across
Great Britain. The dataset is provided in CSV, GeoPackage or GML3 formats in the
`EPSG:27700` (British National Grid) CRS.

This utility script will:

- Read in the extracted files from the CSV version of OS OpenNames.
- Convert the geometry of each feature to WGS84 using the
  [Proj4JS](http://proj4js.org/) library.
- Copy a subset of the original metadata into each feature's properties.
- Save the dataset to disk as a GeoJSON file.

## Metadata

The utility will copy across the following metadata:

- ID
- URI (OS Identifier)
- Type (e.g. PopulatedPlace)
- LocalType (e.g. Village)
- Name1
- Name2 (Often Empty)

It should be easy to configure additional metdata; the CSV dataset contains a header file which reveals which column contains which attribute.

## CRS Accuracies

The CRS conversion process utilises a
[Helmert datum transformation](https://en.wikipedia.org/wiki/Helmert_transformation)
which can lead to inaccuracies of up to 3.5m in some areas. Given the nature and
purpose of the OS OpenNames dataset I have determined this to be an acceptable
range of error, but please make your own informed decisions in-line with your
use-case.

## Footnotes

You're welcome to modify this script to suit your needs but please respect the
[LICENSE](./LICENSE) file. I'd be interested to hear what you end up using it
for!

You could definitely replicate this functionality in GIS software or
[FME](https://www.safe.com/fme/), however I wanted more control and an excuse to
experiment with using the [Deno](https://deno.land) runtime for intensive IO
operations.

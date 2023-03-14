# OpenNames-to-GeoJSON

> **Under Development**  
> This script is under active development, some things may break.

A utility script to convert Ordnance Survey's [OpenNames](https://osdatahub.os.uk/downloads/open/OpenNames) dataset (in `.csv` format) into GeoJSON; optionally contained within a FeatureCollection.

OS OpenNames is a free dataset licensed under the [Open Government License](http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/) containing point-based geometry and attribution for notable locations across Great Britain. The dataset is provided in CSV, GeoPackage or GML3 formats in the `EPSG:27700` (British National Grid) CRS.

This utility script will:

- Read in the extracted files from the CSV version of OS OpenNames.
- Convert the geometry of each feature to WGS84 using the [Proj4JS](http://proj4js.org/) library.
- Copy a subset of the original metadata into each feature's properties.
- Save the dataset to disk as a GeoJSON file.

## CRS Accuracies
The CRS conversion process utilises a [Helmert datum transformation](https://en.wikipedia.org/wiki/Helmert_transformation) which can lead to inaccuracies of up to 3.5m in some areas. Given the nature and purpose of the OS OpenNames dataset I have determined this to be an acceptable range of error, but please make your own informed decisions in-line with your use-case.

## Configurables
To alter the behaviour of this script, change the parameters within the `PARAMS` constant. In the future, this configuration will be moved to command arguments and runtime prompts.

### `sourceDir`
The location of the extracted OpenNames CSV files. This file location will usually contain `opname_csv_gb/Data` if you are running this script immediately after extracting the data.

### `outFormat`
The format in which the GeoJSON features should be stored. Supported options are either `SimpleArray` which will wrap the features within a root-level array, or `FeatureCollection` which will wrap the features in a standard FeatureCollection object.

### `outLocation`
A valid file name to use when storing the GeoJSON file within the CWD. Please include the file extension.

## Footnotes
You're welcome to modify this script to suit your needs but please respect the [LICENSE](./LICENSE) file. I'd be interested to hear what you end up using it for!

You could definitely replicate this functionality in GIS software or [FME](https://www.safe.com/fme/), however I wanted more control and an excuse to experiment with using the [Deno](https://deno.land) runtime for intensive IO operations.
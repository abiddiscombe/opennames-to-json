package main

import (
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"os"
	"time"

	"github.com/abiddiscombe/opennames-to-geojson/util/geom"
	"github.com/abiddiscombe/opennames-to-geojson/util/output"
	"github.com/abiddiscombe/opennames-to-geojson/util/source"
	"github.com/paulmach/orb"
	"github.com/paulmach/orb/geojson"
)

func main() {
	output.CheckExist()
	timeStart := time.Now()

	features := []geojson.Feature{}

	filepaths := source.GetFileList()
	for _, filepath := range filepaths {
		// Ideally this will eventually be multiple
		// functions for retrieving the CSV contents
		// and parsing into GeoJSON...

		file, err := os.Open(filepath)

		if err != nil {
			log.Fatal(err)
		}

		defer file.Close()

		records := []geojson.Feature{}
		csvReader := csv.NewReader(file)

		for {
			record, err := csvReader.Read()

			if err == io.EOF {
				break
			}

			if err != nil {
				log.Fatal(err)
			}

			lon, lat := geom.ToLonLat(record[8], record[9])

			feature := geojson.NewFeature(orb.Point{lon, lat})
			feature.Properties["id"] = record[0]
			feature.Properties["name1"] = record[2]
			feature.Properties["name1Lang"] = record[3]
			feature.Properties["name2"] = record[4]
			feature.Properties["name2Lang"] = record[5]
			feature.Properties["type"] = record[6]
			feature.Properties["localType"] = record[7]
			// Add other fields (by column ID) here.

			records = append(records, *feature)
		}
		features = append(features, records...)
	}

	output.Save(features)

	timeElapsed := time.Since(timeStart)
	fmt.Printf("OpenNames to JSON Features - Complete \n")
	fmt.Printf("---------------------------------------- \n")
	fmt.Printf("Time: %v \n", timeElapsed)
	fmt.Printf("Total Processed Files: %v \n", len(filepaths))
	fmt.Printf("Total Processed Features: %v \n", len(features))
	fmt.Printf("---------------------------------------- \n")
}

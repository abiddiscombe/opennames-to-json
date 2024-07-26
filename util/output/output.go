package output

import (
	"encoding/json"
	"log"
	"os"

	"github.com/paulmach/orb/geojson"
)

const OUTPUT_FILE = "output.json"

func CheckExist() {
	_, err := os.Open(OUTPUT_FILE)

	if err == nil {
		// This "err" will be truthy if the file exists
		// or there was an issue accessing it (perhaps it
		// may be locked or in a read-only state).
		log.Fatal("The 'output.json' file exists. Please delete it first.")
	}
}

func Save(features []geojson.Feature) {
	file, err := os.Create(OUTPUT_FILE)

	if err != nil {
		log.Fatal(err)
	}

	defer file.Close()

	jsonFeatures, err := json.MarshalIndent(features, "", "\t")

	if err != nil {
		log.Fatal(err)
	}

	_, err = file.Write(jsonFeatures)

	if err != nil {
		log.Fatal(err)
	}
}

package geom

import (
	"log"
	"strconv"

	wgs84 "github.com/wroge/wgs84/v2"
)

var transform = wgs84.Transform(wgs84.EPSG(27700), wgs84.EPSG(4326)).Round(4)

func ToLonLat(geomX string, geomY string) (float64, float64) {
	parsedGeomX, errX := strconv.ParseFloat(geomX, 64)
	parsedGeomY, errY := strconv.ParseFloat(geomY, 64)

	if errX != nil || errY != nil {
		log.Fatal("Feature Source Geometry Error - Invalid Type")
	}

	lon, lat, _ := transform(parsedGeomX, parsedGeomY, 0)
	return lon, lat
}

package source

import (
	"fmt"
	"log"
	"os"
)

const PATH = "Data"

func GetFileList() []string {
	files, err := os.ReadDir(PATH)

	if err != nil {
		log.Fatal(err)
	}

	var filepaths []string

	for _, file := range files {
		filepath := fmt.Sprintf("%v/%v", PATH, file.Name())
		filepaths = append(filepaths, filepath)
	}

	return filepaths
}

package main

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/glebarez/go-sqlite"
	"github.com/gocarina/gocsv"
)

type Food struct {
	Category         string  `csv:"Category"`
	Description      string  `csv:"Description"`
	Carbohydrate     float64 `csv:"Data.Carbohydrate"`
	Cholesterol      float64 `csv:"Data.Cholesterol"`
	Fiber            float64 `csv:"Data.Fiber"`
	KiloCalories     float64 `csv:"Data.Kilocalories"`
	Protein          float64 `csv:"Data.Protein"`
	Sugar            float64 `csv:"Data.Sugar Total"`
	MonosaturatedFat float64 `csv:"Data.Fat.Monosaturated Fat"`
	PolysaturatedFat float64 `csv:"Data.Fat.Polysaturated Fat"`
	SaturatedFat     float64 `csv:"Data.Fat.Staurated Fat"`
	Lipid            float64 `csv:"Data.Fat.Total Lipid"`
	Weight           float64 `csv:"Data.Household Weights.1st Household Weight"`
}

var db *sql.DB

func OpenDB() {
	var err error

	db, err = sql.Open("sqlite", "../backend/database.db")

	if err != nil {
		panic(err)
	}
}

func main() {
	OpenDB()
	file, err := os.OpenFile("food.csv", os.O_RDWR|os.O_CREATE, os.ModePerm)

	if err != nil {
		panic(err)
	}

	var foods []Food

	if err := gocsv.UnmarshalFile(file, &foods); err != nil {
		panic(err)
	}

	cmd, err := db.Prepare("insert into foods (category, description, carbohydrate, cholesterol, fiber, kilocalories, protein, sugar, monosaturated_fat, polysaturated_fat, saturated_fat, lipid) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")

	if err != nil {
		panic(err)
	}

	for _, food := range foods {
		_, err := cmd.Exec(food.Category, food.Description, food.Carbohydrate/food.Weight, food.Cholesterol/(food.Weight*1000), food.Fiber/food.Weight, food.KiloCalories/food.Weight, food.Protein/food.Weight, food.Sugar/food.Weight, food.MonosaturatedFat/food.Weight, food.PolysaturatedFat/food.Weight, food.SaturatedFat/food.Weight, food.Lipid/food.Weight)

		if err != nil {
			fmt.Println(err)
			fmt.Println(food.Description)
		}
	}
}

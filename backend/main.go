package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/glebarez/go-sqlite"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var db *sql.DB

func OpenDB() {
	var err error

	db, err = sql.Open("sqlite", "./database.db")

	if err != nil {
		panic(err)
	}
}

func main() {
	router := gin.Default()
	OpenDB()

	router.POST("/api/ping", Ping)
	router.POST("/api/register", Register)
	router.POST("/api/login", Login)
	router.GET("/api/search/:text", Search)

	router.POST("/api/userFood", AddFood)
	router.GET("/api/userFood/:userId", GetFood)
	router.GET("/api/userFood/todayStats/:userId", GetTodayStats)
	router.GET("/api/userFood/historicalData/:userId/:timePeriod", GetLastWeekStats)
	router.GET("/api/userFood/historicalData/:userId", GetLastWeekStats)
	router.POST("/api/userFood/Domains/:userId", SetDomains)
	router.GET("/api/userFood/Domains/:userId", GetDomains)

	router.Run()
}

type PingRequest struct {
	Key string `json:"cheie"`
}

func Ping(c *gin.Context) {
	var msg PingRequest

	err := c.BindJSON(&msg)

	if err != nil {
		fmt.Println("scandal")
		return
	}

	if msg.Key == "mesaj inteligent" {
		c.JSON(http.StatusOK, gin.H{"message": "raspuns inteligent"})
	} else {
		c.JSON(http.StatusOK, gin.H{"message": msg.Key})
	}
}

type RegisterRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Register(c *gin.Context) {
	var msg RegisterRequest

	err := c.BindJSON(&msg)

	if err != nil {
		fmt.Println("scandal")
		return
	}

	statement, err := db.Prepare("insert into users(username, password, email) values(?, ?, ?)")

	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusInternalServerError)
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(msg.Password), bcrypt.DefaultCost)

	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusBadRequest)
		return
	}

	statement.Exec(msg.Username, string(hash), msg.Email)

	c.Status(http.StatusOK)
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type JWTBody struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Id       string `json:"id"`
	jwt.RegisteredClaims
}

func Login(c *gin.Context) {
	var msg LoginRequest

	err := c.BindJSON(&msg)

	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusBadRequest)
		return
	}

	row := db.QueryRow("select password, email, username, id from users where email = ?", msg.Email)
	if row == nil {
		fmt.Println("scandal")
	}
	var storedPassword string
	var storedEmail string
	var storedUsername string
	var storedId string

	err = row.Scan(&storedPassword, &storedEmail, &storedUsername, &storedId)

	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusNotFound)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(msg.Password))

	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusBadRequest)
		return
	}

	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, &JWTBody{
		Email:    storedEmail,
		Username: storedUsername,
		Id:       storedId,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	}).SignedString([]byte("mySecret"))

	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusBadRequest)
		return
	}

	c.String(http.StatusOK, token)
}

type Food struct {
	Id          int    `json:"id"`
	Description string `json:"description"`
}

func Search(c *gin.Context) {
	text := c.Param("text")

	statement, err := db.Query("select  id,description from foods where description like ? limit 10", "%"+text+"%")

	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusBadRequest)
		return
	}

	defer statement.Close() //Inchide conex cu baza de date la final de functie

	var list []Food

	for statement.Next() {
		var food Food

		if err := statement.Scan(&food.Id, &food.Description); err != nil {
			fmt.Println(err)
			c.Status(http.StatusInternalServerError)
			return
		}
		list = append(list, food)
	}

	c.JSON(http.StatusOK, list)
}

type AddFoodRequest struct {
	UserId       string `json:"userId"`
	FoodId       string `json:"foodId"`
	FoodQuantity int    `json:"foodQuantity"`
}

func AddFood(c *gin.Context) {
	var msg AddFoodRequest
	var foods []FoodResponse

	err := c.BindJSON(&msg)

	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusBadRequest)
		return
	}

	statement, err := db.Prepare("insert into food_users(user_id, food_id, quantity) values(?, ?, ?)")

	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusInternalServerError)
		return
	}

	_, err = statement.Exec(msg.UserId, msg.FoodId, msg.FoodQuantity)

	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusInternalServerError)
		return
	}

	addedFoodsStatement, err := db.Query("select description,sum(quantity) as times_added, category from food_users join foods on food_users.food_id = foods.id where user_id = ? and date(date) = date('now') group by description", msg.UserId)

	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusNotFound)
		return
	}

	defer addedFoodsStatement.Close()

	for addedFoodsStatement.Next() {
		var food FoodResponse
		err := addedFoodsStatement.Scan(&food.FoodName, &food.TimesAdded, &food.Category)

		if err != nil {
			continue
		}
		foods = append(foods, food)
	}

	c.JSON(http.StatusOK, foods)

}

type FoodResponse struct {
	FoodName   string `json:"foodName"`
	TimesAdded int    `json:"timesAdded"`
	Category   string `json:"category"`
}

func GetFood(c *gin.Context) {
	var foods []FoodResponse
	userId := c.Param("userId")

	statement, err := db.Query("select description,sum(quantity) as times_added, category from food_users join foods on food_users.food_id = foods.id where user_id = ? and date(date) = date('now') group by description", userId)

	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusNotFound)
		return
	}

	defer statement.Close()

	for statement.Next() {
		var food FoodResponse
		err := statement.Scan(&food.FoodName, &food.TimesAdded, &food.Category)

		if err != nil {
			continue
		}
		foods = append(foods, food)
	}

	c.JSON(http.StatusOK, foods)
}

type StatEntry struct {
	Name  string  `json:"name"`
	Value float64 `json:"value"`
}

type FoodVals struct {
	kilocalories float64
	carbohydrate float64
	cholesterol  float64
	protein      float64
	sugar        float64
	lipid        float64
}

func GetTodayStats(c *gin.Context) {
	userId := c.Param("userId")

	statement := db.QueryRow("select sum(kilocalories * quantity) as kilocalories, sum(carbohydrate * quantity) as carbohydrate, sum(cholesterol * quantity) as cholesterol, sum(protein * quantity) as protein, sum(sugar * quantity) as sugar, sum(lipid * quantity) as lipid from food_users join foods on food_users.food_id = foods.id where user_id = ? and date(date) = date('now')", userId)

	var out FoodVals

	err := statement.Scan(&out.kilocalories, &out.carbohydrate, &out.cholesterol, &out.protein, &out.sugar, &out.lipid)

	if err != nil {
		out.kilocalories = 0.0
		out.carbohydrate = 0.0
		out.lipid = 0.0
		out.cholesterol = 0.0
		out.protein = 0.0
		out.sugar = 0.0
	}

	stats := []StatEntry{{Name: "kilocalories", Value: out.kilocalories}, {Name: "carbohydrate", Value: out.carbohydrate}, {Name: "protein", Value: out.protein}, {Name: "sugar", Value: out.sugar}, {Name: "lipid", Value: out.lipid}}

	c.JSON(http.StatusOK, stats)
}

type CaloriesDay struct {
	Value float64 `json:"value"`
	Date  string  `json:"date"`
}

func GetLastWeekStats(c *gin.Context) {
	userId := c.Param("userId")
	timePeriod := c.Param("timePeriod")

	var modifier string

	switch timePeriod {
	case "1week":
		modifier = "-6 days"
		break
	case "2week":
		modifier = "-13 days"
		break
	case "1month":
		modifier = "-29 days"
		break
	case "5month":
		modifier = "-149 days"
		break
	default:
		c.Status(http.StatusBadRequest)
		return
	}

	statement, err := db.Query("WITH RECURSIVE last_7_days AS (SELECT date('now', '"+modifier+"') AS day UNION ALL SELECT date(day, '+1 day') FROM last_7_days WHERE day < date('now'))SELECT d.day, COALESCE(SUM(kilocalories * quantity), 0) AS kilocalories FROM  last_7_days d LEFT JOIN food_users fu ON date(fu.date) = d.day LEFT JOIN foods f ON fu.food_id = f.id WHERE fu.user_id = ? OR fu.user_id IS NULL GROUP BY d.day ORDER BY d.day;", userId)

	if err != nil {
		c.Status(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	var calories []CaloriesDay

	defer statement.Close()

	for statement.Next() {
		var cal CaloriesDay

		if err := statement.Scan(&cal.Date, &cal.Value); err != nil {
			c.Status(http.StatusInternalServerError)
			fmt.Println(err)
			return
		}

		calories = append(calories, cal)
	}

	c.JSON(http.StatusOK, calories)
}

type Domains struct {
	Kcal  int `json:"kcal" binding:"required"`
	Carbs int `json:"carb" binding:"required"`
	Prot  int `json:"prot" binding:"required"`
	Sugar int `json:"sugar" binding:"required"`
	Lipid int `json:"lipid" binding:"required"`
}

func SetDomains(c *gin.Context) {
	var msg Domains
	userId := c.Param("userId")

	err := c.BindJSON(&msg)

	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusBadRequest)
		return
	}

	statement, err := db.Prepare("Update users set dom_kcal = ?,dom_carb=? ,dom_prot = ?, dom_sugar = ?, dom_lipid=? where id =? ")

	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusInternalServerError)
		return
	}

	_, err = statement.Exec(msg.Kcal, msg.Carbs, msg.Prot, msg.Sugar, msg.Lipid, userId)

	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusInternalServerError)
		return
	}

	c.Status(http.StatusOK)
}

func GetDomains(c *gin.Context) {
	userId := c.Param("userId")

	statemet := db.QueryRow("select dom_kcal, dom_carb, dom_prot, dom_sugar,dom_lipid from users where id=?", userId)

	var out Domains

	err := statemet.Scan(&out.Kcal, &out.Carbs, &out.Prot, &out.Sugar, &out.Lipid)

	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusNotFound)
		return
	}

	c.JSON(http.StatusOK, out)
}

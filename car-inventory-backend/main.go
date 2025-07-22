package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	_ "github.com/mattn/go-sqlite3"
	"bytes"
)

type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password,omitempty"`
}

type Vehicle struct {
	ID              int    `json:"id"`
	Registration    string `json:"registration"`
	MakeModel       string `json:"makeModel"`
	MOTExpiry       string `json:"motExpiry"`
	TaxStatus       string `json:"taxStatus"`
	InsuranceExpiry string `json:"insuranceExpiry"`
	NextService     string `json:"nextService"`
	UserID          int    `json:"-"`
}

var jwtKey = []byte("secret_key")

func main() {
	db, err := sql.Open("sqlite3", "./car_inventory.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	initDB(db)

	r := gin.Default()
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.POST("/api/register", func(c *gin.Context) {
		var user User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}
		_, err := db.Exec("INSERT INTO users (username, password) VALUES (?, ?)", user.Username, user.Password)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username taken"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Registered"})
	})

	r.POST("/api/login", func(c *gin.Context) {
		var user User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}
		row := db.QueryRow("SELECT id, password FROM users WHERE username = ?", user.Username)
		var id int
		var pw string
		if err := row.Scan(&id, &pw); err != nil || pw != user.Password {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"user_id": id,
			"exp":     time.Now().Add(24 * time.Hour).Unix(),
		})
		tokenString, _ := token.SignedString(jwtKey)
		c.JSON(http.StatusOK, gin.H{"token": tokenString})
	})

	auth := r.Group("/api")
	auth.Use(authMiddleware)
	{
		auth.GET("/vehicles", func(c *gin.Context) {
			userID := c.GetInt("user_id")
			rows, _ := db.Query("SELECT id, registration, make_model, mot_expiry, tax_status, insurance_expiry, next_service FROM vehicles WHERE user_id = ?", userID)
			vehicles := []Vehicle{}
			for rows.Next() {
				var v Vehicle
				rows.Scan(&v.ID, &v.Registration, &v.MakeModel, &v.MOTExpiry, &v.TaxStatus, &v.InsuranceExpiry, &v.NextService)
				vehicles = append(vehicles, v)
			}
			c.JSON(http.StatusOK, vehicles)
		})
		auth.POST("/vehicles", func(c *gin.Context) {
			userID := c.GetInt("user_id")
			var v Vehicle
			if err := c.ShouldBindJSON(&v); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
				return
			}
			_, err := db.Exec("INSERT INTO vehicles (registration, make_model, mot_expiry, tax_status, insurance_expiry, next_service, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)", v.Registration, v.MakeModel, v.MOTExpiry, v.TaxStatus, v.InsuranceExpiry, v.NextService, userID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add vehicle"})
				return
			}
			c.JSON(http.StatusOK, gin.H{"message": "Vehicle added"})
		})
		auth.PUT("/vehicles/:id", func(c *gin.Context) {
			userID := c.GetInt("user_id")
			id := c.Param("id")
			var v Vehicle
			if err := c.ShouldBindJSON(&v); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
				return
			}
			_, err := db.Exec("UPDATE vehicles SET registration=?, make_model=?, mot_expiry=?, tax_status=?, insurance_expiry=?, next_service=? WHERE id=? AND user_id=?", v.Registration, v.MakeModel, v.MOTExpiry, v.TaxStatus, v.InsuranceExpiry, v.NextService, id, userID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update vehicle"})
				return
			}
			c.JSON(http.StatusOK, gin.H{"message": "Vehicle updated"})
		})
		auth.DELETE("/vehicles/:id", func(c *gin.Context) {
			userID := c.GetInt("user_id")
			id := c.Param("id")
			_, err := db.Exec("DELETE FROM vehicles WHERE id=? AND user_id=?", id, userID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete vehicle"})
				return
			}
			c.JSON(http.StatusOK, gin.H{"message": "Vehicle deleted"})
		})
		auth.POST("/mot", func(c *gin.Context) {
			var req struct {
				Registration string `json:"registration"`
				VehicleID    int    `json:"vehicleId"`
			}
			if err := c.ShouldBindJSON(&req); err != nil || req.Registration == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
				return
			}
			apiKey := os.Getenv("MOT_API_KEY")
			if apiKey == "" {
				apiKey = "CSdFIKGrGW2i0v4eu1Ozf2fttFSOondr5QpFNufL" // fallback to provided key
			}
			motData, err := fetchMOTData(req.Registration, apiKey)
			if err != nil {
				c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to fetch MOT data"})
				return
			}
			// Optionally update vehicle in DB if VehicleID is provided
			if req.VehicleID != 0 {
				_, err := db.Exec("UPDATE vehicles SET mot_expiry=?, make_model=?, tax_status=? WHERE id=?", motData.MOTExpiry, motData.MakeModel, motData.TaxStatus, req.VehicleID)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update vehicle"})
					return
				}
			}
			c.JSON(http.StatusOK, motData)
		})
	}

	r.Run(":8080")
}

func authMiddleware(c *gin.Context) {
	tokenString := c.GetHeader("Authorization")
	if tokenString == "" {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing token"})
		return
	}
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})
	if err != nil || !token.Valid {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}
	c.Set("user_id", int(claims["user_id"].(float64)))
	c.Next()
}

func initDB(db *sql.DB) {
	db.Exec(`CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT UNIQUE,
		password TEXT
	)`)
	db.Exec(`CREATE TABLE IF NOT EXISTS vehicles (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		registration TEXT,
		make_model TEXT,
		mot_expiry TEXT,
		tax_status TEXT,
		insurance_expiry TEXT,
		next_service TEXT,
		user_id INTEGER,
		FOREIGN KEY(user_id) REFERENCES users(id)
	)`)
}

func fetchMOTData(registration, apiKey string) (struct {
	MOTExpiry string `json:"motExpiry"`
	MakeModel string `json:"makeModel"`
	TaxStatus string `json:"taxStatus"`
}, error) {
	url := "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles"
	body := map[string]string{"registrationNumber": registration}
	jsonBody, _ := json.Marshal(body)
	client := &http.Client{Timeout: 10 * time.Second}
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	req.Header.Set("x-api-key", apiKey)
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		return struct {
			MOTExpiry string `json:"motExpiry"`
			MakeModel string `json:"makeModel"`
			TaxStatus string `json:"taxStatus"`
		}{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return struct {
			MOTExpiry string `json:"motExpiry"`
			MakeModel string `json:"makeModel"`
			TaxStatus string `json:"taxStatus"`
		}{}, err
	}
	var data struct {
		Make  string `json:"make"`
		Model string `json:"model"`
		TaxStatus string `json:"taxStatus"`
		MotTests []struct {
			ExpiryDate string `json:"expiryDate"`
		} `json:"motTests"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return struct {
			MOTExpiry string `json:"motExpiry"`
			MakeModel string `json:"makeModel"`
			TaxStatus string `json:"taxStatus"`
		}{}, err
	}
	motExpiry := ""
	if len(data.MotTests) > 0 {
		motExpiry = data.MotTests[0].ExpiryDate
	}
	return struct {
		MOTExpiry string `json:"motExpiry"`
		MakeModel string `json:"makeModel"`
		TaxStatus string `json:"taxStatus"`
	}{
		MOTExpiry: motExpiry,
		MakeModel: data.Make + " " + data.Model,
		TaxStatus: data.TaxStatus,
	}, nil
} 
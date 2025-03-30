import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";
import bcrypt from "bcrypt";
import multer from "multer";
import flash from 'connect-flash';

const app = express();
const port = 3000;

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: "public/uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Database configuration
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "mydb",
  port: 5432,
});
db.connect();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
  secret: "your-secret-key",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Add this after the session middleware setup
app.use(flash());

// Passport configuration
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        return done(null, user);
      }
    }
    return done(null, false);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// Routes
app.get("/login", (req, res) => {
  res.render("login.ejs", { 
    error: req.flash('error'),
    success: req.flash('success'),
    user: req.user 
  });
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true
}));

// Add a logout route
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    res.redirect("/login");
  });
});

// Update the root route to check authentication
app.get("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  try {
    const countries = await checkVisisted(req.user.id);
    res.render("index.ejs", {
      countries: countries.map(c => c.country_code),
      visitDates: countries,  // Make sure to pass the visitDates variable
      total: countries.length,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading countries");
  }
});

// Remove or update this duplicate route
// app.get("/", isAuthenticated, async (req, res) => {
//   const countries = await checkVisisted(req.user.id);
//   res.render("index.ejs", { 
//     countries: countries.map(c => c.country_code),
//     visitDates: countries,
//     total: countries.length,
//     user: req.user
//   });
// });

// Update the LocalStrategy configuration to include proper error handling
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    console.log("Attempting login for user:", username);
    const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        console.log("Password match successful");
        return done(null, user);
      }
      console.log("Password match failed");
    }
    console.log("User not found or invalid password");
    return done(null, false, { message: "Invalid username or password" });
  } catch (err) {
    console.error("Login error:", err);
    return done(err);
  }
}));

// Update the registration route to include better error handling
// Add this route to display the registration page
app.get("/register", (req, res) => {
  res.render("register.ejs", { 
    error: null,
    user: req.user
  });
});

// Your existing registration POST route
app.post("/register", async (req, res) => {
  try {
    const userExists = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [req.body.username]
    );

    if (userExists.rows.length > 0) {
      return res.render("register.ejs", {
        error: "Username already exists",
        user: req.user
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await db.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
      [req.body.username, hashedPassword]
    );
    
    req.flash('success', 'Registration successful! Please login.');
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.render("register.ejs", {
      error: "Error during registration",
      user: req.user
    });
  }
});

app.get("/login", (req, res) => {
  res.render("login.ejs", { error: null });
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render("login.ejs", {
        error: "Invalid username or password"
      });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/");
    });
  })(req, res, next);
});

// Update the checkVisisted function to handle potential errors better
async function checkVisisted(userId) {
  try {
    const result = await db.query(
      "SELECT country_code, visit_date, photo_url FROM visited_countries WHERE user_id = $1",
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error("Error in checkVisisted function:", error);
    return []; // Return empty array instead of failing
  }
}

// Update the root route to handle the data correctly
app.get("/", isAuthenticated, async (req, res) => {
  try {
    const countries = await checkVisisted(req.user.id);
    res.render("index.ejs", { 
      countries: countries.map(c => c.country_code),
      visitDates: countries,
      total: countries.length,
      user: req.user,
      error: null
    });
  } catch (err) {
    console.error("Error in root route:", err);
    res.render("index.ejs", {
      countries: [],
      visitDates: [],
      total: 0,
      user: req.user,
      error: "Error loading countries. Please try again later."
    });
  }
});

// Remove duplicate route handlers and fix the country search functionality

// First, remove all duplicate route handlers (login, root route)
// Keep only one version of each route

// Fix the add country route to handle errors better
app.post("/add", isAuthenticated, upload.single("photo"), async (req, res) => {
  const input = req.body.country;
  const visitDate = req.body.visitDate;
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // Add better error handling for country search
    if (!input || input.trim() === "") {
      throw new Error("Country name is required");
    }

    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new Error("Country not found");
    }

    const countryCode = result.rows[0].country_code;
    
    // Check if the user has already visited this country
    const existingVisit = await db.query(
      "SELECT * FROM visited_countries WHERE user_id = $1 AND country_code = $2",
      [req.user.id, countryCode]
    );
    
    if (existingVisit.rows.length > 0) {
      // Country already visited, update the existing record instead
      await db.query(
        "UPDATE visited_countries SET visit_date = $1, photo_url = COALESCE($2, photo_url) WHERE user_id = $3 AND country_code = $4",
        [visitDate, photoUrl, req.user.id, countryCode]
      );
    } else {
      // New country, insert a new record
      await db.query(
        "INSERT INTO visited_countries (user_id, country_code, visit_date, photo_url) VALUES ($1, $2, $3, $4)",
        [req.user.id, countryCode, visitDate, photoUrl]
      );
    }
    
    res.redirect("/");
  } catch (err) {
    console.error("Error adding country:", err.message);
    const countries = await checkVisisted(req.user.id);
    res.render("index.ejs", {
      countries: countries.map(c => c.country_code),
      visitDates: countries,
      total: countries.length,
      error: `Error adding country: ${err.message}`,
      user: req.user
    });
  }
});

// API endpoint for country search autocomplete
app.get("/api/countries", async (req, res) => {
  const search = req.query.search;
  const result = await db.query(
    "SELECT country_name FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%' LIMIT 5",
    [search.toLowerCase()]
  );
  res.json(result.rows);
});

// Add this function after db.connect()
async function fixDatabaseSchema() {
  try {
    // First, drop the existing constraint
    await db.query(`
      ALTER TABLE visited_countries 
      DROP CONSTRAINT IF EXISTS visited_countries_country_code_key
    `);
    
    // Then add a new constraint that makes the combination of user_id and country_code unique
    await db.query(`
      ALTER TABLE visited_countries 
      ADD CONSTRAINT IF NOT EXISTS visited_countries_user_country_unique 
      UNIQUE (user_id, country_code)
    `);
    
    console.log("Database schema updated successfully");
  } catch (err) {
    console.error("Error updating database schema:", err);
  }
}

// Modify your server startup code to call this function before starting the server
// Replace the existing app.listen at the bottom with:
fixDatabaseSchema().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});

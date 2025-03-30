
## **Travel-Tracker** 🌍  
A web application that allows users to **track, visualize, and document** the countries they have visited on an interactive world map.  



### **🌟 Features**  
✅ **Interactive SVG World Map** – View and mark visited countries dynamically.  
✅ **Add Visited Countries** – Search and add countries using an autocomplete feature.  
✅ **Travel Date Logging** – Keep track of when you visited each country.  
✅ **Persistent Storage (PostgreSQL)** – Your data is securely stored in a database.  
✅ **Error Handling** – Prevent duplicate entries and invalid country names.  
✅ **User Authentication** – Create accounts for personalized tracking.  
✅ **Photo Uploads & Galleries** – Attach travel photos for each country.  
✅ **Responsive Design** – Built with Bootstrap for a smooth experience on all devices.  

---

### **🚀 Installation & Setup**  

#### **1️⃣ Clone the Repository**  
```sh
git clone https://github.com/your-username/Travel-Tracker.git  
cd Travel-Tracker
```

#### **2️⃣ Install Dependencies**  
```sh
npm install
```

#### **3️⃣ Set Up the Database**  
Ensure PostgreSQL is installed and running. Create a database and update `config.js`:  
```js
const db = new pg.Client({
  user: "your_username",
  host: "localhost",
  database: "travel_tracker",
  password: "your_password",
  port: 5432,
});
db.connect();
```

Run database migrations:  
```sh
npm run migrate
```

#### **4️⃣ Start the Server**  
```sh
npm start
```

#### **5️⃣ Access the Application**  
Open your browser and navigate to:  
➡️  [http://localhost:3000](http://localhost:3000)  


### **📌 Usage Guide**  

#### **🔹 Sign Up & Login**  
1. Click on **Sign Up** to create an account.  
2. Log in using your credentials.  

#### **🔹 Track Your Travels**  
1. **Add Countries** – Use the search bar to select a country.  
2. **Enter Travel Date** – Log the date you visited.  
3. **Upload Photos** – Attach pictures to document your trip.  

#### **🔹 View Travel Stats**  
- See the **total number of countries visited**.  
- View travel **history and progress**.  
- Access **country-specific galleries**.  



### **🛠 Technologies Used**  
- **Frontend:** HTML, CSS, JavaScript, Bootstrap  
- **Backend:** Node.js, Express.js  
- **Database:** PostgreSQL

 ### 📂 Folder & File Overview
 Travel-Tracker/
│── node_modules/        # Installed dependencies (via npm install)
│
├── public/              # Public assets (frontend resources)
│   ├── scripts/         # JavaScript files for frontend functionality
│   ├── styles/          # CSS stylesheets for UI design
│   ├── uploads/         # Folder for storing uploaded images
│
├── views/               # EJS template files for rendering pages
│   ├── partials/        # Reusable EJS components (headers, footers, etc.)
│   ├── index.ejs        # Homepage template
│   ├── login.ejs        # Login page template
│   ├── register.ejs     # Registration page template
│   ├── viewspartials/   # (Possible duplicate or misnamed folder)
│
├── index.js             # Main server file (Node.js & Express backend)
├── package.json         # Project configuration & dependencies
├── package-lock.json    # Dependency tree lock file

 

### **📝 Contributing**  
We welcome contributions! To contribute:  
1. **Fork the repository**  
2. **Create a new branch** (`feature-new-feature`)  
3. **Commit your changes** (`git commit -m "Added new feature"`)  
4. **Push to GitHub** (`git push origin feature-new-feature`)  
5. **Submit a Pull Request**  

---

### **📄 License**  
This project is licensed under the **MIT License**.  

---

### **💬 Support & Contact**  
For issues or feature requests, please open an **issue** in the repository.  
📧 Contact: sanguchachu@gmail.com  

🚀 **Happy Traveling & Tracking!** 🌍✈️  


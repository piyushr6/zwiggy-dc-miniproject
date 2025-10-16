It looks like you want to format the provided text so it is properly rendered as a clean, standard **`README.md`** file when pushed to GitHub or viewed in a markdown renderer.

The main change needed is correcting the markdown fenced code blocks (the ones starting with `` markdown` and ending with  ``) and ensuring proper indentation for the folder structure.

Here is the revised, ready-to-paste content for your `README.md` file:

```markdown
# Zwiggy DC Mini Project

## Table of Contents
- [Overview](#overview)
- [Folder Structure](#folder-structure)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
    - [Backend](#backend)
    - [Frontend](#frontend)
    - [Analytics](#analytics)
- [Running the Project](#running-the-project)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

A fully functional Food Delivery Platform built to demonstrate real **Distributed Computing** concepts — featuring multithreading, clock synchronization, leader election, replication & consistency models, load balancing, and MapReduce analytics.

---

## Folder Structure

```

root/
│
├── backend/        \# Node.js backend
├── frontend/       \# React frontend
├── analytics/      \# Python/JS analytics scripts
└── README.md

````

---

## Technologies Used
- **Frontend:** React.js
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Analytics:** Python / JavaScript (mention libraries if needed)

---

## Setup Instructions

### Backend
1. Navigate to the backend folder:
```bash
cd backend
````

2.  Install dependencies:

<!-- end list -->

```bash
npm install
```

3.  Create `.env` file with environment variables (DB connection, port, etc.)
4.  Start the server:

<!-- end list -->

```bash
npm start
```

### Frontend

1.  Navigate to the frontend folder:

<!-- end list -->

```bash
cd frontend
```

2.  Install dependencies:

<!-- end list -->

```bash
npm install
```

3.  Start the frontend:

<!-- end list -->

```bash
npm start
```

4.  Open in browser at `http://localhost:3000`

### Analytics

1.  Navigate to the analytics folder:

<!-- end list -->

```bash
cd analytics
```

2.  Install dependencies:

<!-- end list -->

```bash
pip install -r requirements.txt
```

3.  Run analytics scripts:

<!-- end list -->

```bash
python analysis.py
```

-----

## Running the Project

1.  Start backend:

<!-- end list -->

```bash
cd backend
npm start
```

2.  Start frontend:

<!-- end list -->

```bash
cd frontend
npm start
```

3.  Run analytics scripts whenever needed:

<!-- end list -->

```bash
cd analytics
python analysis.py
```

-----

## License

This project is licensed under the **MIT License**.

```
```
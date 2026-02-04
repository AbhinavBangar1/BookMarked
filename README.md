### Creating Google books api
1. Go to google cloud console 
2. Navigate to API and Services 
3. Go to Enabled APIs and Services
4. Search Google Books API 
5. Enable it
6. Go to Credentials -> Create Credentials -> API key
7. give it a name , Application restrictions : none , API restrictions : Don't restrict key -> create 
8. copy the api key and add it to the .env file

# Running the app locally

### 1. Clone the Repo
```bash
git clone https://github.com/AbhinavBangar1/BookMarked.git
```

### 2. Check if Node.js is installed
```bash
npm -v
node -v
```

### 3. Starting Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Starting Backend Server
In another Terminal 
```bash
cd backend
npm install
npm start
```

# Updating The Repository

## Before working make sure you pull the main branch
```bash
git checkout main
git pull origin main
git checkout -b <your-branch-name>
```

```bash
Before Updating the repo Please make sure the code is working fine
```

### 1. Create your own Branch
```bash
git checkout -b <your branch name>
```

### 2. Add the files to push
```bash
git add <filepath>
```

### 3. Add the commit message 
```bash
git commit -m "message here"
```

Be Specific with the message  

### 4. Check which branch you are in 
```bash 
git branch
```
the branch you are will have * before its name 

### 5. push the changes to your own branch
```bash
git push origin <your branch name>
```
### 6. Create a pull request to merge your branch into main branch

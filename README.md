## Prerequisites

- Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

## Installation and Running

1. **Clone the Repository:**
    ```bash
    git clone https://github.com/nhwnahid007/volunteer-verse-server.git
    cd volunteer-verse-server
    ```

2. **Install Dependencies:**
    ```bash
    npm install
    ```

3. **Install `nodemon` Globally:**
    ```bash
    npm install -g nodemon
    ```

4. **Create a `.env` File:**

    Create a `.env` file in the root directory of your project and add the following content:

    ```plaintext
    DB_USER=mongodb_user
    DB_PASS=mongodb_pass
    ACCESS_TOKEN_SECRET=any hex access token for jwt 
    
    ```

    Replace the placeholders (`mongodb_user` and `mongodb_pass`) with your actual MongoDB user credentials. and `ACCESS_TOKEN_SECRET` with hex token

5. **Run the Development Server:**
    ```bash
    nodemon index.js
    ```

## Additional Commands

- **Build for Production:**
    ```bash
    npm run build
    ```

- **Run Tests:**
    ```bash
    npm test
    ```

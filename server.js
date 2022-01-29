import Express from "express";
import Path from "path";
import DotEnv from "dotenv";
import cors from "cors";
import { ErrorHandler } from "./src/helpers/errorHandler.js";
import routes from "./src/routes/routes.js";
import { postgres } from "./src/modules/pg.js";

const PORT = process.env.PORT || 4443;

// Get environment variables
DotEnv.config({
    path: Path.join(Path.resolve(), ".env"),
});

async function server() {
    //Create server
    const app = Express();

    //Run server
    app.listen(PORT, () => console.log(`Server ready at ${PORT}`));

    //Get database
    let db = await postgres();

    //Middlewares
    app.use(cors({ origin: "*" }));
    app.use(Express.urlencoded({ extended: true }));
    app.use(Express.json());

    //ErrorHandler helper
    app.use((req, res, next) => {
        res.err = ErrorHandler;
        req.db = db;
        next();
    });

    await routes(app);
}

server();

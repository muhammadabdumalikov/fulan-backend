import Express from "express"
import DotEnv from "dotenv"

const PORT = process.env.PORT || 4443

async function server(){

    //Create server
    const app = Express()

    //Run server
    app.listen(PORT, () => console.log(`Server ready at${PORT}`))

    //Middlewares
    app.use(cors({origin: "*"}))
    app.use(Express.urlencoded({extended: true}))
    app.use(Express.json())

}
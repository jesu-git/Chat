import Dotenv from "dotenv"


Dotenv.config({

    override: true,
    path: "./src/.env"
})


export const config = {

    link_DB: process.env.link_DB,
    name_BD: process.env.name_BD,
    PORT: process.env.PORT
    
}